import { generateMockActivity } from "@/lib/templates";
import { ActivityConfig, UploadedFile } from "@/lib/types";

interface GoogleImageResult {
  url: string;
  thumbnail: string;
  title: string;
}

async function searchGoogleImages(query: string): Promise<GoogleImageResult[]> {
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
    
    return (data.items || []).map((item: { link: string; image?: { thumbnailLink: string }; title: string }) => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      title: item.title,
    }));
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
  
  return cleaned.trim();
}

async function replacePollinationsWithGoogleImages(html: string): Promise<string> {
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
  const imageCache: Record<string, string> = {};

  for (const desc of uniqueDescriptions.slice(0, 8)) {
    const images = await searchGoogleImages(desc);
    if (images.length > 0) {
      imageCache[desc] = images[0].thumbnail;
    }
  }

  let result = html;
  for (const m of matches) {
    if (imageCache[m.description]) {
      result = result.replace(m.fullUrl, imageCache[m.description]);
    }
  }

  return result;
}

export async function POST(request: Request) {
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
2. OBRIGATORIO: Gere EXATAMENTE ${config.questionCount} questoes, numeradas de 1) ate ${config.questionCount})
3. Cada questao DEVE ter conteudo DIFERENTE e relevante ao tema

IMAGENS - REGRA CRITICA:
Cada imagem DEVE ter uma descricao DIFERENTE baseada no objeto real que representa.

Formato OBRIGATORIO:
<img class="figurinha-img" src="https://image.pollinations.ai/prompt/OBJETO%20clipart?width=150&height=150&nologo=true&seed=N" alt="nome" />

OBJETO = nome em ingles do que a imagem mostra (apple, dog, cat, sun, tree, ball, house, car, etc)
N = numero unico (1, 2, 3, 4, 5...)

EXEMPLOS CORRETOS:
Para maca: src="https://image.pollinations.ai/prompt/apple%20clipart?width=150&height=150&nologo=true&seed=1"
Para cachorro: src="https://image.pollinations.ai/prompt/dog%20clipart?width=150&height=150&nologo=true&seed=2"
Para gato: src="https://image.pollinations.ai/prompt/cat%20clipart?width=150&height=150&nologo=true&seed=3"
Para sol: src="https://image.pollinations.ai/prompt/sun%20clipart?width=150&height=150&nologo=true&seed=4"
Para arvore: src="https://image.pollinations.ai/prompt/tree%20clipart?width=150&height=150&nologo=true&seed=5"
Para bola: src="https://image.pollinations.ai/prompt/ball%20clipart?width=150&height=150&nologo=true&seed=6"
Para casa: src="https://image.pollinations.ai/prompt/house%20clipart?width=150&height=150&nologo=true&seed=7"
Para carro: src="https://image.pollinations.ai/prompt/car%20clipart?width=150&height=150&nologo=true&seed=8"

PROIBIDO - NAO USE:
- "cute" sozinho
- descricoes genericas
- a mesma descricao para imagens diferentes

Classes CSS disponiveis: activity-section, activity-subtitle, activity-instruction, figurinhas-grid, figurinhas-grid-3, figurinha-card (.green .blue .yellow .pink), figurinha-img, figurinha-emoji, figurinha-name, figurinha-write, answer-line, drawing-box, word-box, word-tag, math-grid

Use linguagem simples e acolhedora para ${config.year}.
${config.observations ? `SIGA: ${config.observations}` : ""}

VERIFICACAO FINAL ANTES DE RESPONDER:
1. Tenho EXATAMENTE ${config.questionCount} questoes numeradas de 1) a ${config.questionCount})?
2. Cada imagem tem um OBJETO DIFERENTE na URL (apple, dog, cat, etc)?
3. Cada imagem tem um SEED DIFERENTE (1, 2, 3, etc)?`,
      });

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system:
          "Você é um assistente especializado em criar atividades educacionais para o Ensino Fundamental brasileiro (1º ao 5º ano). Crie atividades ricas, didáticas e alinhadas à BNCC, com linguagem adequada para cada faixa etária. Use uma abordagem lúdica e motivadora. Quando modelos de referência forem fornecidos, replique fielmente o estilo, formato e estrutura desses modelos.",
        messages: [{ role: "user", content }],
      });

      const result = message.content[0];
      if (result.type === "text") {
        // Limpa a resposta removendo markdown code blocks
        let activityHtml = cleanHtmlResponse(result.text);
        
        // Se a opcao de imagens do Google estiver ativa, substitui as imagens
        if (useGoogleImages) {
          activityHtml = await replacePollinationsWithGoogleImages(activityHtml);
        }
        
        return Response.json({ activity: activityHtml, source: "ai", imagesSource: useGoogleImages ? "google" : "pollinations" });
      }
    } catch (err) {
      console.error("Claude API error, falling back to template:", err);
    }
  }

  const activity = generateMockActivity(config);
  return Response.json({ activity, source: "template", imagesSource: "template" });
}
