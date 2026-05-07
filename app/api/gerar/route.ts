export const maxDuration = 60; // segundos — necessário para Claude + DALL-E + Supabase upload

import type { User } from "@supabase/supabase-js";
import { generateMockActivity } from "@/lib/templates";
import { ActivityConfig, UploadedFile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getCachedImage, saveImageCache } from "@/lib/image-cache";
import { replaceAiImagePlaceholders } from "@/lib/generate-image";
import { getBnccObjectives } from "@/lib/bncc";
import { trackClaudeCost } from "@/lib/track-api-cost";

const FREE_LIMIT = 5;

interface GoogleImageResult {
  url: string;
  thumbnail: string;
  title: string;
}

async function searchGoogleImages(
  query: string,
  tema?: string,
  serie?: string
): Promise<GoogleImageResult[]> {
  // 1. Verifica cache antes de chamar a API do Google
  const cached = await getCachedImage(query, tema, serie);
  if (cached) {
    return [{ url: cached.url, thumbnail: cached.thumbnail, title: query }];
  }

  // Remove crases das chaves caso existam (problema comum ao copiar/colar)
  const apiKey = process.env.GOOGLE_API_KEY?.replace(/`/g, "").trim();
  const cseId = process.env.GOOGLE_CSE_ID?.replace(/`/g, "").trim();

  if (!apiKey || !cseId) {
    return [];
  }

  try {
    const simplifiedQuery = query
      .replace(/cartoon|clipart|simple|white background/gi, "")
      .trim()
      .split(" ")
      .slice(0, 2)
      .join(" ");
    
    if (!simplifiedQuery || simplifiedQuery.length < 2) {
      return [];
    }
    
    const safeQuery = `${simplifiedQuery} clipart png infantil`;
    
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", cseId);
    url.searchParams.set("q", safeQuery);
    url.searchParams.set("searchType", "image");
    url.searchParams.set("num", "3");
    url.searchParams.set("safe", "active");

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.error) {
      return [];
    }

    const results: GoogleImageResult[] = (data.items || []).map(
      (item: { link: string; image?: { thumbnailLink: string }; title: string }) => ({
        url: item.link,
        thumbnail: item.image?.thumbnailLink || item.link,
        title: item.title,
      })
    );

    // 2. Salva o primeiro resultado no cache para reutilização futura
    if (results.length > 0) {
      saveImageCache({
        query,
        tema,
        serie,
        url: results[0].url,
        thumbnail: results[0].thumbnail,
        fonte: "google",
      }).catch(() => {});
    }

    return results;
  } catch {
    return [];
  }
}

function cleanHtmlResponse(text: string): string {
  // Remove markdown code blocks (```html ... ``` ou ``` ... ```)
  let cleaned = text.trim();

  // Remove ```html ou ```HTML no inicio
  cleaned = cleaned.replace(/^```(?:html|HTML)?\s*\n?/i, "");

  // Remove ``` no final
  cleaned = cleaned.replace(/\n?```\s*$/i, "");

  // Remove <style> tags para evitar que CSS gerado pela IA vaze para o site inteiro
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Remove tags <svg> inline que a IA gera (proibido — causa SVGs gigantes na página)
  cleaned = cleaned.replace(/<svg[\s\S]*?<\/svg>/gi, "");

  // Remove cabeçalho duplicado que a IA gera (o sistema já exibe o cabeçalho fixo)
  // Detecta o bloco de header escolar: tabela/div com ALUNO(A), NOME:, DATA: e PROFESSORA:
  cleaned = cleaned.replace(/<(?:table|div)[^>]*>(?:(?!<\/(?:table|div)>)[\s\S])*?(?:ALUNO\(A\)|NOME:\s*_{3,}|PROFESSORA:\s*_{3,})[\s\S]*?<\/(?:table|div)>/gi, "");
  // Remove também cabeçalhos de título de atividade duplicados (ex: "ATIVIDADE DE HISTÓRIA — FAMÍLIA E COMUNIDADE")
  cleaned = cleaned.replace(/<(?:div|p|h[1-6])[^>]*class="[^"]*activity-title[^"]*"[^>]*>[\s\S]*?<\/(?:div|p|h[1-6])>/gi, "");

  // Remove atributos style inline que contenham filter ou propriedades globais perigosas
  cleaned = cleaned.replace(/\sstyle="[^"]*filter\s*:[^"]*"/gi, "");

  // Remove/substitui elementos de formulário interativos — não têm lugar em atividades impressas
  // <input type="checkbox"> → div visual; <input type="color"> e demais → removidos
  cleaned = cleaned.replace(/<input[^>]*type=["']checkbox["'][^>]*>/gi, '<div class="checkbox-square"></div>');
  cleaned = cleaned.replace(/<input[^>]*>/gi, "");
  cleaned = cleaned.replace(/<select[\s\S]*?<\/select>/gi, "");
  cleaned = cleaned.replace(/<textarea[\s\S]*?<\/textarea>/gi, "");
  cleaned = cleaned.replace(/<button[\s\S]*?<\/button>/gi, "");
  cleaned = cleaned.replace(/<form[\s\S]*?<\/form>/gi, "");

  return cleaned.trim();
}

async function replacePollinationsWithGoogleImages(
  html: string,
  tema?: string,
  serie?: string
): Promise<string> {
  const pollinationsRegex = /https:\/\/image\.pollinations\.ai\/prompt\/([^?"'\s]+)[^"'\s]*/g;
  const matches: { fullUrl: string; description: string }[] = [];

  let match;
  while ((match = pollinationsRegex.exec(html)) !== null) {
    const fullUrl = match[0];
    const rawDesc = match[1];
    const description = decodeURIComponent(rawDesc).replace(/[+_]/g, " ").replace(/%20/g, " ");
    matches.push({ fullUrl, description });
  }

  if (matches.length === 0) {
    return html;
  }

  const uniqueDescriptions = [...new Set(matches.map((m) => m.description))];
  const localCache: Record<string, string> = {};

  for (const desc of uniqueDescriptions.slice(0, 8)) {
    const images = await searchGoogleImages(desc, tema, serie);
    if (images.length > 0) {
      localCache[desc] = images[0].thumbnail;
    }
  }

  let result = html;
  for (const m of matches) {
    if (localCache[m.description]) {
      result = result.replace(m.fullUrl, localCache[m.description]);
    }
  }

  return result;
}

const PLAN_LIMITS: Record<string, number> = {
  gratuito: 5,
  basico: 50,
  pro: 100,
};

export async function POST(request: Request) {
  let currentUser: User | null = null;

  // Verificar limite por plano
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    if (user) {
      const testerEmails = (process.env.TESTER_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const isTester = user.email && testerEmails.includes(user.email.toLowerCase());

      if (!isTester) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        const plan: string = profile?.plan ?? "gratuito";

        if (plan !== "ilimitado") {
          const limit = PLAN_LIMITS[plan] ?? FREE_LIMIT;

          let query = supabase
            .from("activities")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          // Planos pagos: contar apenas o mês atual
          if (plan !== "gratuito") {
            const inicio = new Date();
            inicio.setDate(1);
            inicio.setHours(0, 0, 0, 0);
            query = query.gte("created_at", inicio.toISOString());
          }

          const { count } = await query;
          if ((count ?? 0) >= limit) {
            return Response.json({ error: "limit_reached", count, plan }, { status: 402 });
          }
        }
      }
    }
  } catch {
    // Se falhar a checagem, permite gerar (não bloqueia por erro técnico)
  }

  const body = await request.json();
  const config: ActivityConfig = body.config;
  const uploadedFiles: UploadedFile[] = body.uploadedFiles ?? [];
  const useGoogleImages = config.useGoogleImages ?? false;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey });

      const subjectLabels: Record<string, string> = {
        portugues: "Língua Portuguesa",
        matematica: "Matemática",
        natureza: "Natureza e Sociedade",
        identidade: "Identidade e Autonomia",
        ciencias: "Ciências",
        historia: "História",
        geografia: "Geografia",
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content: any[] = [];

      if (uploadedFiles.length > 0) {
        content.push({
          type: "text",
          text: `A professora enviou ${uploadedFiles.length} atividade(s) de referência. Analise cuidadosamente:
- O formato e layout do cabeçalho da escola
- Os tipos de exercícios e sua estrutura
- O estilo visual (espaçamento, linhas, caixas)
- Os tipos de imagens/desenhos utilizados
- A linguagem e tom adequados para as crianças

Use esses modelos como referência fiel para criar a nova atividade.`,
        });

        for (const file of uploadedFiles) {
          if (file.mediaType === "application/pdf") {
            content.push({
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: file.base64 },
            });
          } else {
            content.push({
              type: "image",
              source: { type: "base64", media_type: file.mediaType, data: file.base64 },
            });
          }
        }
      }

      const isCartaoColorir = config.activityType === "Cartão para Colorir";
      const isColorir = config.imageMode === "colorir" || isCartaoColorir;
      const isBW = config.imageMode === "pb" || isColorir;
      const questionCount = isColorir ? 1 : config.questionCount;

      const bnccObjectives = getBnccObjectives(config.year, config.subject);

      content.push({
        type: "text",
        text: `Crie uma atividade educacional para:

- Ano escolar: ${config.year}
- Disciplina: ${subjectLabels[config.subject] || config.subject}
- Tipo de atividade: ${config.activityType}
- Tema/Assunto: ${config.topic || "Geral"}
- Dificuldade: ${config.difficulty}
- TOTAL DE QUESTOES: ${questionCount}
${config.observations ? `- Observacoes: ${config.observations}` : ""}

${uploadedFiles.length > 0 ? "IMPORTANTE: Replique o estilo visual dos modelos enviados." : ""}

${bnccObjectives ? `ALINHAMENTO BNCC — ${config.year} — ${config.subject}:
Os conteudos e exercicios devem contemplar estes objetivos de aprendizagem:
${bnccObjectives}
Respeite o nivel de desenvolvimento da crianca: complexidade, vocabulario e tipo de raciocinio adequados para ${config.year}.
` : ""}
REGRAS OBRIGATORIAS:
1. Retorne APENAS HTML puro (sem DOCTYPE, html, head, body, sem markdown)
2. CRITICO: Gere EXATAMENTE ${questionCount} questoes. NEM MAIS NEM MENOS. Conte antes de finalizar: 1, 2, 3... ate ${questionCount}.
3. Cada questao DEVE ter conteudo DIFERENTE e relevante ao tema
4. TODO O TEXTO deve estar em LETRAS MAIUSCULAS, inclusive instrucoes, enunciados, titulos e nomes
5. Use o formato de numeracao com traco: "1- ENUNCIADO DA QUESTAO"
6. IDIOMA: 100% PORTUGUES BRASILEIRO. PROIBIDO qualquer palavra em ingles, espanhol ou outro idioma.
7. Linguagem SIMPLES, vocabulario facil para criancas de ${config.year}
8. NAO pare antes de completar todas as ${questionCount} questoes
9. PROIBIDO gerar tags <svg> inline no HTML — nunca escreva <svg>, <path>, <circle>, <rect> ou qualquer elemento SVG diretamente no conteudo
10. PROIBIDO gerar cabecalho escolar — o cabecalho com nome da escola, professora, aluno, data, turma e turno JA E EXIBIDO AUTOMATICAMENTE pelo sistema. Nao duplique. Comece direto nas questoes.
11. PROIBIDO criar formas geometricas ou ilustracoes usando CSS (border-tricks para triangulos, clip-path, transform, box-shadow para desenhar casas, figuras, etc). Para espacos de desenho, use APENAS a classe drawing-box com texto descritivo dentro.
12. PROIBIDO usar qualquer elemento de formulario: <input>, <select>, <textarea>, <button>, <form>. Para caixas de marcar, use APENAS <div class="checkbox-square"></div>.

${isColorir ? `IMAGENS — MODO ATIVIDADE PARA COLORIR:
${isCartaoColorir ? `
ESTE E UM CARTAO PARA COLORIR — use o layout cartao-colorir-wrapper (veja instrucoes especiais acima).
Nao use scene-coloring-wrapper. Use cartao-colorir-wrapper como container principal.
` : `A professora quer 1 FOLHA COMPLETA com 1 IMAGEM GRANDE para a crianca pintar.
NAO use emojis. NAO use SVG inline. NAO use caixas vazias.
PROIBIDO gerar multiplas questoes ou multiplas imagens pequenas — apenas 1 imagem grande por folha.`}

ESCOLHA O FORMATO conforme o tema:

== FORMATO A: CENA GRANDE (recomendado para maioria dos temas) ==
Use para: datas comemorativas, escola, familia, natureza, historia, cidade, corpo humano, etc.
Gere UMA unica imagem de cena que ocupe a folha inteira:

<div class="scene-coloring-wrapper">
  <p class="activity-instruction">INSTRUCAO CURTA PARA A CRIANCA (ex: PINTE A CENA ABAIXO COM SUAS CORES FAVORITAS!)</p>
  <img data-generate="ASSUNTO DA CENA EM 2-4 PALAVRAS EM PORTUGUES (apenas o objeto principal, sem adjetivos): ex: sala de aula, animais da fazenda, familia feliz, corpo humano" class="scene-coloring-image" alt="DESCRICAO EM PORTUGUES" />
  <div class="scene-coloring-caption">LEGENDA CURTA DA CENA EM MAIUSCULAS</div>
</div>

EXEMPLOS de data-generate para cena grande (apenas 2-4 palavras EM PORTUGUES, so o sujeito):
- Escola → data-generate="sala de aula"
- Familia → data-generate="familia feliz"
- Animais da Fazenda → data-generate="animais da fazenda"
- Corpo Humano → data-generate="corpo humano crianca"
- Natal → data-generate="cena de natal"
- Cidade → data-generate="rua da cidade"

CRITICO: data-generate SEMPRE EM PORTUGUES, apenas 2-4 palavras descrevendo o sujeito. NAO inclua "colorir", "pintar", "pagina", "preto", "branco", "linha", "arte", "fofo" etc.

== FORMATO B: GRADE DE ITENS (somente quando o tema tiver 4 a 6 itens DISTINTOS para pintar) ==
Use APENAS para: alfabeto (letras), numeros, formas geometricas, itens de uma lista.
Gere no maximo 6 cards grandes:

<div class="coloring-grid">
  <div class="coloring-card">
    <img data-generate="NOME DO ITEM EM PORTUGUES (1-3 palavras, apenas o sujeito): ex: borboleta, onibus escolar, bolo de aniversario" class="ai-clipart coloring-image" alt="NOME EM PORTUGUES" />
    <div class="coloring-label">NOME EM MAIUSCULAS</div>
    <div class="coloring-instruction">PINTE!</div>
  </div>
</div>

REGRAS ABSOLUTAS:
- Use SOMENTE as classes coloring-card, coloring-grid, scene-coloring-wrapper, scene-coloring-image
- NUNCA use figurinha-card, green, blue, yellow, pink
- NUNCA adicione style="..." inline nos cards ou imagens
- NUNCA use bordas coloridas ou tracejadas
- FORMATO A e preferido — use FORMATO B apenas se o tema exigir itens distintos
` : isBW ? `IMAGENS — MODO PRETO E BRANCO:
A professora quer atividade para impressao preto e branco.
NUNCA use emojis coloridos (<span class="figurinha-emoji">). NUNCA use figurinha-card green/blue/yellow/pink.
Use APENAS ilustracoes do banco B&W (img src) ou placeholder data-generate para itens fora do banco.

BANCO DE ILUSTRACOES B&W:
Profissoes: /clipart/profissoes/bombeiro.svg, /clipart/profissoes/medico.svg, /clipart/profissoes/dentista.svg, /clipart/profissoes/professor.svg, /clipart/profissoes/policial.svg, /clipart/profissoes/enfermeira.svg, /clipart/profissoes/veterinario.svg, /clipart/profissoes/cozinheiro.svg, /clipart/profissoes/pedreiro.svg, /clipart/profissoes/carteiro.svg, /clipart/profissoes/padeiro.svg
Animais: /clipart/animais/cachorro.svg, /clipart/animais/gato.svg, /clipart/animais/passarinho.svg, /clipart/animais/peixe.svg, /clipart/animais/leao.svg, /clipart/animais/elefante.svg, /clipart/animais/borboleta.svg, /clipart/animais/sapo.svg, /clipart/animais/coelho.svg, /clipart/animais/vaca.svg, /clipart/animais/galinha.svg, /clipart/animais/cavalo.svg, /clipart/animais/macaco.svg, /clipart/animais/urso.svg, /clipart/animais/cobra.svg
Frutas: /clipart/frutas/maca.svg, /clipart/frutas/banana.svg, /clipart/frutas/laranja.svg, /clipart/frutas/uva.svg, /clipart/frutas/morango.svg, /clipart/frutas/melancia.svg, /clipart/frutas/abacaxi.svg, /clipart/frutas/manga.svg, /clipart/frutas/pera.svg, /clipart/frutas/limao.svg
Escola: /clipart/escola/lapis.svg, /clipart/escola/caderno.svg, /clipart/escola/mochila.svg, /clipart/escola/livro.svg, /clipart/escola/tesoura.svg, /clipart/escola/regua.svg, /clipart/escola/quadro.svg, /clipart/escola/cola.svg, /clipart/escola/apontador.svg
Natureza: /clipart/natureza/arvore.svg, /clipart/natureza/flor.svg, /clipart/natureza/sol.svg, /clipart/natureza/lua.svg, /clipart/natureza/estrela.svg, /clipart/natureza/nuvem.svg, /clipart/natureza/chuva.svg, /clipart/natureza/arco-iris.svg, /clipart/natureza/folha.svg
Transportes: /clipart/transportes/carro.svg, /clipart/transportes/onibus.svg, /clipart/transportes/aviao.svg, /clipart/transportes/barco.svg, /clipart/transportes/trem.svg, /clipart/transportes/bicicleta.svg, /clipart/transportes/caminhao.svg
Corpo: /clipart/corpo/mao.svg, /clipart/corpo/pe.svg, /clipart/corpo/olho.svg, /clipart/corpo/nariz.svg, /clipart/corpo/boca.svg, /clipart/corpo/orelha.svg, /clipart/corpo/coracao.svg

Formato para itens do banco:
<div class="figurinha-card">
  <img src="/clipart/CATEGORIA/nome.svg" alt="NOME" class="bw-clipart" />
  <span class="figurinha-name">NOME</span>
</div>

Para itens fora do banco, use placeholder de geracao de imagem:
<div class="figurinha-card">
  <img data-generate="NOME DO ITEM EM PORTUGUES (apenas o sujeito, 1-3 palavras)" class="ai-clipart" alt="NOME" />
  <span class="figurinha-name">NOME</span>
</div>

Exemplos de data-generate para itens fora do banco (SEMPRE EM PORTUGUES):
- Ator → data-generate="ator"
- Musico → data-generate="musico"
- Cientista → data-generate="cientista"
- Colher de pedreiro → data-generate="colher de pedreiro"
- Estetoscopio → data-generate="estetoscopio medico"
` : `IMAGENS — MODO COLORIDO:
Use APENAS emojis. NUNCA gere tags <img>, <svg>, ou URLs de imagens. NUNCA use classes bw-clipart, ai-clipart, data-generate.

Formato OBRIGATORIO para imagens em cards:
<div class="figurinha-card green">
  <span class="figurinha-emoji">EMOJI</span>
  <span class="figurinha-name">NOME EM PORTUGUES</span>
</div>

EXEMPLOS de nomes em PORTUGUES:
- Animais: CACHORRO, GATO, PASSARO, PEIXE, LEAO, ELEFANTE, BORBOLETA, SAPO, COELHO
- Frutas: MACA, BANANA, LARANJA, UVA, MORANGO, MELANCIA, ABACAXI, MANGA, PERA
- Escola: LIVRO, LAPIS, CADERNO, MOCHILA, QUADRO, BORRACHA, REGUA, TESOURA
- Natureza: ARVORE, FLOR, SOL, LUA, ESTRELA, NUVEM, CHUVA, ARCO-IRIS, FOLHA
- Corpo: CABECA, BRACO, PERNA, MAO, PE, OLHO, NARIZ, BOCA, CORACAO

LAYOUTS AVANCADOS — use quando o tipo de atividade pedir:

1) SECOES NUMERADAS (para questoes com multiplas partes):
<div class="activity-section-numbered">
  <div class="activity-number-header">
    <div class="activity-number-badge">1</div>
    <span class="activity-number-title">INSTRUCAO DA SECAO</span>
  </div>
  ... conteudo ...
</div>

2) IMAGEM NA MARGEM AO LADO DE TEXTO (para musicas, poemas, historias):
<div class="text-with-margin-image">
  <div class="margin-clipart"><span class="figurinha-emoji">EMOJI</span></div>
  <div class="margin-text">TEXTO DA ESTROFE OU INSTRUCAO</div>
</div>

3) GRADE NUMERICA COM IMAGENS (para sequencias numericas — substituir alguns numeros por emojis):
<div class="number-grid">
  <div class="number-cell">1</div>
  <div class="number-cell">2</div>
  <div class="number-cell with-image"><span class="figurinha-emoji" style="font-size:2rem">EMOJI</span></div>
  <div class="number-cell">4</div>
  <div class="number-cell">5</div>
</div>

4) MARCAR RESPOSTA CERTA (checkbox acima da imagem):
<div class="checkbox-image-grid">
  <div class="checkbox-image-item">
    <div class="checkbox-square"></div>
    <span class="figurinha-emoji" style="font-size:2.5rem">EMOJI</span>
    <div class="checkbox-image-label">NOME</div>
  </div>
</div>

5) LETRAS GRANDES PARA PINTAR/TRACAR:
<div class="trace-letter-grid">
  <span class="trace-letter">A</span>
  <span class="trace-letter">B</span>
</div>`}

Classes CSS: activity-section, activity-subtitle, activity-instruction, figurinhas-grid, figurinhas-grid-3, figurinha-card (.green .blue .yellow .pink), figurinha-emoji, figurinha-name, figurinha-write, answer-line, drawing-box, word-box, word-tag, math-grid, word-analysis-table, word-cell, emoji-cell, count-cell, blank-cell
Jornal: jornal-wrapper, jornal-topo, jornal-titulo-letras, jornal-subtitulo-linha, jornal-corpo, jornal-coluna, jornal-box, jornal-box-titulo, jornal-linha, jornal-lista, jornal-imagem-central, jornal-foto-slot, jornal-rodape-banner, jornal-destaque, jornal-grid-rodape
Cartao: cartao-colorir-wrapper, cartao-titulo-decorativo, cartao-subtitulo, cartao-ilustracao, cartao-mensagem-area, cartao-mensagem-titulo, cartao-linha, cartao-assinatura, cartao-linha-assinar
Emocoes: emocoes-grid-4, emocao-card, emocao-face-box, emocao-nome-campo, emocoes-match-wrapper, emocoes-situacoes, emocoes-rostos, emocao-situacao, emocao-ponto-ligacao, emocoes-sentir-hoje, emocao-mini-card

${config.activityType === "Jornal" ? `
INSTRUCOES ESPECIAIS — ATIVIDADE ESTILO JORNAL/REVISTA:
Crie um layout de revista/jornal educacional temático sobre: "${config.topic || "o tema solicitado"}".
Nao use questoes numeradas. Use APENAS as classes jornal-wrapper, jornal-topo, jornal-titulo-letras,
jornal-subtitulo-linha, jornal-corpo, jornal-coluna, jornal-box, jornal-box-titulo, jornal-linha,
jornal-lista, jornal-imagem-central, jornal-foto-slot, jornal-rodape-banner, jornal-destaque, jornal-grid-rodape.

ESTRUTURA OBRIGATORIA (adapte os textos ao tema "${config.topic || "o tema"}"):

<div class="jornal-wrapper">
  <div class="jornal-topo">
    <div class="jornal-titulo-letras">[TEMA EM MAIUSCULAS]</div>
    <div class="jornal-subtitulo-linha">EDICAO ESPECIAL ♡ [FRASE TEMATICA CURTA] ♡ DATA: ___/___/___</div>
  </div>

  <div class="jornal-corpo">
    <div class="jornal-coluna">
      <div class="jornal-box jornal-destaque">
        <div class="jornal-box-titulo">📰 NOTICIA DE ULTIMA HORA!</div>
        <p style="font-size:0.7rem">[FRASE EDUCATIVA SOBRE O TEMA, 3-4 LINHAS, EM MAIUSCULAS]</p>
      </div>
      <div class="jornal-box">
        <div class="jornal-box-titulo">♡ QUALIDADES</div>
        <ul class="jornal-lista">
          <li>[QUALIDADE 1]</li>
          <li>[QUALIDADE 2]</li>
          <li>[QUALIDADE 3]</li>
          <li>[QUALIDADE 4]</li>
        </ul>
      </div>
    </div>

    <div class="jornal-imagem-central">
      ${isBW
        ? `<img data-generate="[DESCRICAO DO TEMA EM 2-3 PALAVRAS]" class="ai-clipart" alt="[TEMA]" />`
        : `<span class="figurinha-emoji" style="font-size:7rem">[EMOJI DO TEMA]</span>`}
    </div>

    <div class="jornal-coluna">
      <div class="jornal-box">
        <div class="jornal-box-titulo">📋 PERFIL [DO/DA TEMA]</div>
        <div class="jornal-linha">NOME: _______________________</div>
        <div class="jornal-linha">[CAMPO 2]: ___________________</div>
        <div class="jornal-linha">[CAMPO 3]: ___________________</div>
        <div class="jornal-linha">SUPERPODER: _________________</div>
      </div>
      <div class="jornal-box">
        <div class="jornal-box-titulo">💬 FRASE [DO/DA TEMA]</div>
        <p style="font-size:0.65rem;font-style:italic">O QUE MAIS FALA:</p>
        <div class="jornal-linha"></div>
        <div class="jornal-linha"></div>
      </div>
    </div>
  </div>

  <div class="jornal-grid-rodape">
    <div class="jornal-box">
      <div class="jornal-box-titulo">♡ 5 COISAS QUE EU AMO</div>
      <ul class="jornal-lista">
        <li>1. ___________________</li>
        <li>2. ___________________</li>
        <li>3. ___________________</li>
        <li>4. ___________________</li>
        <li>5. ___________________</li>
      </ul>
    </div>
    <div class="jornal-box">
      <div class="jornal-box-titulo">📷 MOMENTOS ESPECIAIS</div>
      <div class="jornal-foto-slot">📷 COLE UMA FOTO AQUI</div>
    </div>
    <div class="jornal-box">
      <div class="jornal-box-titulo">✉ RECADO ESPECIAL</div>
      <div class="jornal-linha"></div>
      <div class="jornal-linha"></div>
      <div class="jornal-linha"></div>
      <div class="jornal-linha"></div>
    </div>
  </div>

  <div class="jornal-rodape-banner">[TEMA] — [FRASE AFETIVA CURTA SOBRE O TEMA EM MAIUSCULAS]!</div>
</div>

CRITICO: Substitua TODOS os [PLACEHOLDERS] por texto real baseado no tema. Nao deixe colchetes no HTML final.
` : ""}

${isCartaoColorir ? `
INSTRUCOES ESPECIAIS — CARTAO PARA COLORIR:
Crie um cartão comemorativo para colorir sobre o tema: "${config.topic || "o tema solicitado"}".
Use APENAS as classes cartao-colorir-wrapper, cartao-titulo-decorativo, cartao-subtitulo,
cartao-ilustracao, cartao-mensagem-area, cartao-mensagem-titulo, cartao-linha, cartao-assinatura, cartao-linha-assinar.

ESTRUTURA OBRIGATORIA:

<div class="cartao-colorir-wrapper">
  <div class="cartao-titulo-decorativo">[TITULO FESTIVO DO TEMA — ex: FELIZ DIA DAS MAES!]</div>
  <div class="cartao-subtitulo">[FRASE POETICA CURTA SOBRE O TEMA]</div>

  <img data-generate="[CENA DO TEMA EM 2-4 PALAVRAS EM PORTUGUES]" class="scene-coloring-image cartao-ilustracao" alt="[TEMA]" />

  <div class="cartao-mensagem-area">
    <div class="cartao-mensagem-titulo">✉ MINHA MENSAGEM:</div>
    <div class="cartao-linha"></div>
    <div class="cartao-linha"></div>
    <div class="cartao-linha"></div>
  </div>

  <div class="cartao-assinatura">
    COM AMOR: <span class="cartao-linha-assinar"></span>
  </div>
</div>

EXEMPLOS de data-generate para o tema:
- Dia das Maes → data-generate="mae e filho abraco"
- Dia dos Pais → data-generate="pai e filho"
- Pascoa → data-generate="coelho pascoa"
- Natal → data-generate="papai noel criancas"
- Festa Junina → data-generate="festa junina criancas"
` : ""}

${config.activityType === "Minhas Emoções" ? `
INSTRUCOES ESPECIAIS — ATIVIDADE DE EMOCOES:
Crie uma atividade estruturada sobre identificacao de emocoes.
Use as classes: emocoes-grid-4, emocao-card, emocao-face-box, emocao-nome-campo,
emocoes-match-wrapper, emocoes-situacoes, emocoes-rostos, emocao-situacao, emocao-ponto-ligacao,
emocoes-sentir-hoje, emocao-mini-card.

ESTRUTURA DAS 4 QUESTOES:

1- OBSERVE AS CARINHAS E ESCREVA O NOME DE CADA EMOCAO:
<div class="emocoes-grid-4">
  ${["FELIZ","TRISTE","BRAVO","ASSUSTADO"].map(e => `
  <div class="emocao-card">
    <div class="emocao-face-box">
      ${isBW
        ? `<img data-generate="rosto ${e.toLowerCase()} infantil" class="ai-clipart" alt="${e}" />`
        : `<span class="figurinha-emoji" style="font-size:2.5rem">${e==="FELIZ"?"😊":e==="TRISTE"?"😢":e==="BRAVO"?"😡":"😨"}</span>`}
    </div>
    <div class="emocao-nome-campo"></div>
  </div>`).join("")}
</div>

2- LIGUE CADA SITUACAO A EMOCAO CORRETA:
<div class="emocoes-match-wrapper">
  <div class="emocoes-situacoes">
    [4 SITUACOES COTIDIANAS EM CAIXAS com emocao-situacao + emocao-ponto-ligacao a direita]
    ex: GANHEI UM PRESENTE!, MEU SORVETE CAIU NO CHAO!, OUVI UM BARULHO ALTO!, MEU BRINQUEDO QUEBROU!
  </div>
  <div class="emocoes-rostos">
    [4 ROSTOS CORRESPONDENTES com emocao-face-box + emocao-ponto-ligacao a esquerda]
  </div>
</div>

3- COMO VOCE SE SENTE HOJE? CIRCULE A CARINHA:
<div class="emocoes-sentir-hoje">
  [6 rostos menores com emocao-mini-card, cada um com legenda do nome da emocao]
</div>

4- ESPACO DE DESENHO:
<div class="drawing-box" style="min-height:120px">DESENHE ALGO QUE TE DEIXA FELIZ!</div>
` : ""}

${config.activityType === "Tabela de Palavras" ? `
INSTRUCOES ESPECIAIS PARA TABELA DE PALAVRAS:
Crie UMA tabela HTML com a classe "word-analysis-table" contendo EXATAMENTE ${config.questionCount} palavras relacionadas ao tema "${config.topic || "geral"}".

Estrutura OBRIGATORIA da tabela:
<table class="word-analysis-table">
  <thead>
    <tr>
      <th>FIGURA</th>
      <th>PALAVRA</th>
      <th>SILABAS</th>
      <th>LETRAS</th>
      <th>VOGAIS</th>
      <th>CONSOANTES</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="emoji-cell">${isBW ? `<img src="/clipart/CATEGORIA/nome.svg" alt="PALAVRA" class="bw-clipart-sm" />` : `<span class="figurinha-emoji">EMOJI</span>`}</td>
      <td class="word-cell">PALAVRA EM MAIUSCULAS</td>
      <td class="blank-cell"></td>
      <td class="count-cell">X</td>
      <td class="blank-cell"></td>
      <td class="blank-cell"></td>
    </tr>
  </tbody>
</table>

REGRAS DA TABELA:
- A primeira linha da tabela deve vir com TODAS as celulas preenchidas como EXEMPLO para o aluno
- As demais linhas: misture celulas preenchidas (count-cell com o valor) e vazias (blank-cell) para o aluno completar
- Cada palavra DEVE ter um emoji correspondente na coluna FIGURA
- Escolha palavras simples e adequadas ao ano "${config.year}"
- Apos a tabela, adicione uma secao "CURIOSIDADE:" com uma frase simples sobre o tema
` : ""}

${config.observations ? `SIGA OBRIGATORIAMENTE: ${config.observations}` : ""}

VERIFICACAO FINAL OBRIGATORIA: Conte suas questoes agora: voce gerou EXATAMENTE ${questionCount}? Se nao, complete antes de responder.`,
      });

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        system:
          "Você é um assistente especializado em criar atividades educacionais para TODAS as etapas da Educação Básica brasileira: Educação Infantil (Maternal, I Período, II Período, III Período) e Ensino Fundamental (1º ao 5º ano). Para a Educação Infantil, crie atividades com foco em desenvolvimento motor, identidade, natureza e sociedade, linguagem oral e matemática inicial — sempre com muitos desenhos para colorir, ligar, pintar e completar, adequados à faixa etária. REGRAS ABSOLUTAS: (1) Escreva TUDO em PORTUGUÊS BRASILEIRO — nenhuma palavra em inglês ou outro idioma; (2) Use LETRAS MAIÚSCULAS em todo o texto; (3) Vocabulário simples e acolhedor para crianças pequenas; (4) Alinhado à BNCC; (5) Lúdico e motivador com emojis. Quando modelos de referência forem fornecidos, replique fielmente o estilo e estrutura.",
        messages: [{ role: "user", content }],
      });

      const result = message.content[0];
      if (result.type === "text") {
        // Registra custo Claude (fire-and-forget)
        void trackClaudeCost({
          userId: currentUser?.id,
          model: "claude-sonnet-4-6",
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        });

        let activityHtml = cleanHtmlResponse(result.text);

        if (isColorir) {
          // Modo Pintar: substitui data-generate pela imagem colorir (DALL-E ou pack)
          activityHtml = await replaceAiImagePlaceholders(
            activityHtml,
            config.topic,
            config.year,
            "colorir"
          );
        } else if (isBW) {
          // Modo P&B: substitui data-generate por clipart bw ou DALL-E linha-arte
          // Remove emojis coloridos que o AI pode ter gerado por engano
          activityHtml = activityHtml.replace(/<span[^>]*class="figurinha-emoji"[^>]*>[\s\S]*?<\/span>/gi, "");
          activityHtml = await replaceAiImagePlaceholders(
            activityHtml,
            config.topic,
            config.year,
            "bw-line-art"
          );
        } else {
          // Modo Colorido: remove qualquer <img> que o AI gerou incorretamente
          activityHtml = activityHtml.replace(/<img[^>]*>/gi, "");
        }

        void useGoogleImages;
        const imagesSource = isColorir ? "colorir" : isBW ? "bw-line-art" : "emoji";
        return Response.json({ activity: activityHtml, source: "ai", imagesSource });
      }
    } catch (err) {
      console.error("Claude API error, falling back to template:", err);
    }
  }

  const activity = generateMockActivity(config);
  return Response.json({ activity, source: "template", imagesSource: "template" });
}
