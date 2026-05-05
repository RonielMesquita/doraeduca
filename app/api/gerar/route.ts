import { generateMockActivity } from "@/lib/templates";
import { ActivityConfig, UploadedFile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getCachedImage, saveImageCache } from "@/lib/image-cache";
import { replaceAiImagePlaceholders } from "@/lib/generate-image";

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

  // Remove atributos style inline que contenham filter ou propriedades globais perigosas
  cleaned = cleaned.replace(/\sstyle="[^"]*filter\s*:[^"]*"/gi, "");

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
  // Verificar limite por plano
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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

      const isColorir = config.imageMode === "colorir";
      const isBW = config.imageMode === "pb" || isColorir;

      content.push({
        type: "text",
        text: `Crie uma atividade educacional para:

- Ano escolar: ${config.year}
- Disciplina: ${subjectLabels[config.subject] || config.subject}
- Tipo de atividade: ${config.activityType}
- Tema/Assunto: ${config.topic || "Geral"}
- Dificuldade: ${config.difficulty}
- TOTAL DE QUESTOES: ${config.questionCount}
${config.observations ? `- Observacoes: ${config.observations}` : ""}

${uploadedFiles.length > 0 ? "IMPORTANTE: Replique o estilo visual dos modelos enviados." : ""}

REGRAS OBRIGATORIAS:
1. Retorne APENAS HTML puro (sem DOCTYPE, html, head, body, sem markdown)
2. CRITICO: Gere EXATAMENTE ${config.questionCount} questoes. NEM MAIS NEM MENOS. Conte antes de finalizar: 1, 2, 3... ate ${config.questionCount}.
3. Cada questao DEVE ter conteudo DIFERENTE e relevante ao tema
4. TODO O TEXTO deve estar em LETRAS MAIUSCULAS, inclusive instrucoes, enunciados, titulos e nomes
5. Use o formato de numeracao com traco: "1- ENUNCIADO DA QUESTAO"
6. IDIOMA: 100% PORTUGUES BRASILEIRO. PROIBIDO qualquer palavra em ingles, espanhol ou outro idioma.
7. Linguagem SIMPLES, vocabulario facil para criancas de ${config.year}
8. NAO pare antes de completar todas as ${config.questionCount} questoes
9. PROIBIDO gerar tags <svg> inline no HTML — nunca escreva <svg>, <path>, <circle>, <rect> ou qualquer elemento SVG diretamente no conteudo

${isColorir ? `IMAGENS — MODO ATIVIDADE PARA COLORIR:
A professora quer ilustracoes line art para as criancas PINTAREM.
NAO use emojis. NAO use SVG inline. NAO use caixas vazias.

ESCOLHA O FORMATO conforme o tema:

== FORMATO A: CENA GRANDE (para datas comemorativas, temas com cenario) ==
Use quando o tema for: dia comemorativo, escola, familia, natureza, historia, cidade, etc.
Gere UMA imagem grande de cena por questao:

<div class="scene-coloring-wrapper">
  <img data-generate="CENA COMPLETA EM INGLES: detailed scene with [PERSONAGENS E CENARIO], cute kawaii black and white line art coloring page, thick outlines, children educational" class="scene-coloring-image" alt="DESCRICAO" />
  <div class="scene-coloring-caption">PINTE ESTA CENA COM SUAS CORES FAVORITAS!</div>
</div>

EXEMPLOS de data-generate para cena:
- Escola → "school building with children playing outside, kawaii black and white coloring page"
- Familia → "happy family of four together, kawaii black and white line art coloring page"
- Descobrimento do Brasil → "portuguese ship arriving at brazil with indigenous people and explorer, black and white coloring page"
- Dia do Soldado → "soldier family kawaii black and white line art coloring page"

== FORMATO B: CARDS EM GRADE (para listas de itens: animais, frutas, profissoes) ==
Use quando o tema tiver itens individuais para pintar separadamente:

<div class="coloring-grid">
  <div class="coloring-card">
    <img data-generate="ITEM EM INGLES cute kawaii black and white line art for coloring" class="ai-clipart coloring-image" alt="NOME" />
    <div class="coloring-label">NOME EM MAIUSCULAS</div>
    <div class="coloring-instruction">PINTE COM SUA COR FAVORITA!</div>
  </div>
</div>

REGRAS ABSOLUTAS:
- Use SOMENTE as classes coloring-card, coloring-grid, scene-coloring-wrapper, scene-coloring-image
- NUNCA use figurinha-card, green, blue, yellow, pink
- NUNCA adicione style="..." inline nos cards ou imagens
- NUNCA use bordas coloridas ou tracejadas
` : isBW ? `IMAGENS — MODO PRETO E BRANCO:
A professora quer atividade para impressao preto e branco.
Use ilustracoes do banco B&W ou caixas de desenho — nunca emojis coloridos.

BANCO DE ILUSTRACOES B&W:
Profissoes: /clipart/profissoes/bombeiro.svg, /clipart/profissoes/medico.svg, /clipart/profissoes/dentista.svg, /clipart/profissoes/professor.svg, /clipart/profissoes/policial.svg, /clipart/profissoes/enfermeira.svg, /clipart/profissoes/veterinario.svg, /clipart/profissoes/cozinheiro.svg, /clipart/profissoes/pedreiro.svg, /clipart/profissoes/carteiro.svg, /clipart/profissoes/padeiro.svg
Animais: /clipart/animais/cachorro.svg, /clipart/animais/gato.svg, /clipart/animais/passarinho.svg, /clipart/animais/peixe.svg, /clipart/animais/leao.svg, /clipart/animais/elefante.svg, /clipart/animais/borboleta.svg, /clipart/animais/sapo.svg, /clipart/animais/coelho.svg, /clipart/animais/vaca.svg, /clipart/animais/galinha.svg, /clipart/animais/cavalo.svg, /clipart/animais/macaco.svg, /clipart/animais/urso.svg, /clipart/animais/cobra.svg
Frutas: /clipart/frutas/maca.svg, /clipart/frutas/banana.svg, /clipart/frutas/laranja.svg, /clipart/frutas/uva.svg, /clipart/frutas/morango.svg, /clipart/frutas/melancia.svg, /clipart/frutas/abacaxi.svg, /clipart/frutas/manga.svg, /clipart/frutas/pera.svg, /clipart/frutas/limao.svg
Escola: /clipart/escola/lapis.svg, /clipart/escola/caderno.svg, /clipart/escola/mochila.svg, /clipart/escola/livro.svg, /clipart/escola/tesoura.svg, /clipart/escola/regua.svg, /clipart/escola/quadro.svg, /clipart/escola/cola.svg, /clipart/escola/apontador.svg
Natureza: /clipart/natureza/arvore.svg, /clipart/natureza/flor.svg, /clipart/natureza/sol.svg, /clipart/natureza/lua.svg, /clipart/natureza/estrela.svg, /clipart/natureza/nuvem.svg, /clipart/natureza/chuva.svg, /clipart/natureza/arco-iris.svg, /clipart/natureza/folha.svg
Transportes: /clipart/transportes/carro.svg, /clipart/transportes/onibus.svg, /clipart/transportes/aviao.svg, /clipart/transportes/barco.svg, /clipart/transportes/trem.svg, /clipart/transportes/bicicleta.svg, /clipart/transportes/caminhao.svg
Corpo: /clipart/corpo/mao.svg, /clipart/corpo/pe.svg, /clipart/corpo/olho.svg, /clipart/corpo/coracao.svg

Formato para itens do banco:
<div class="figurinha-card">
  <img src="/clipart/CATEGORIA/nome.svg" alt="NOME" class="bw-clipart" />
  <span class="figurinha-name">NOME</span>
</div>

Para itens fora do banco, use placeholder de geracao de imagem:
<div class="figurinha-card">
  <img data-generate="DESCRICAO EM INGLES black and white line art" class="ai-clipart" alt="NOME" />
  <span class="figurinha-name">NOME</span>
</div>

Exemplos de data-generate para itens fora do banco:
- Ator → data-generate="actor black and white line art"
- Musico → data-generate="musician black and white line art"
- Cientista → data-generate="scientist black and white line art"
` : `IMAGENS - USE EMOJIS:
NAO use URLs de imagens. Use EMOJIS dentro de spans com a classe figurinha-emoji.

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

VERIFICACAO FINAL OBRIGATORIA: Conte suas questoes agora: voce gerou EXATAMENTE ${config.questionCount}? Se nao, complete antes de responder.`,
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
        let activityHtml = cleanHtmlResponse(result.text);

        // Substitui placeholders data-generate por imagens DALL-E 3 (B&W e colorir)
        if ((isBW || isColorir) && process.env.OPENAI_API_KEY) {
          activityHtml = await replaceAiImagePlaceholders(
            activityHtml,
            config.topic,
            config.year
          );
        }

        void useGoogleImages;
        const imagesSource = (isBW || isColorir) ? "dalle3" : "emoji";
        return Response.json({ activity: activityHtml, source: "ai", imagesSource });
      }
    } catch (err) {
      console.error("Claude API error, falling back to template:", err);
    }
  }

  const activity = generateMockActivity(config);
  return Response.json({ activity, source: "template", imagesSource: "template" });
}
