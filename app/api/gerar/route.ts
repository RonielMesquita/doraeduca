import { generateMockActivity } from "@/lib/templates";
import { ActivityConfig, UploadedFile } from "@/lib/types";

interface GoogleImageResult {
  url: string;
  thumbnail: string;
  title: string;
}

async function searchGoogleImages(query: string): Promise<GoogleImageResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  console.log("[v0] Google Image Search - API Key exists:", !!apiKey, "CSE ID exists:", !!cseId);
  console.log("[v0] Google Image Search - API Key (first 10 chars):", apiKey?.substring(0, 10) || "N/A");
  console.log("[v0] Google Image Search - CSE ID:", cseId || "N/A");

  if (!apiKey || !cseId) {
    console.log("[v0] Google Image Search - Missing credentials, skipping search");
    return [];
  }

  try {
    // Simplifica a query para termos mais genericos
    const simplifiedQuery = query
      .replace(/cute|cartoon|kids|white background|educational/gi, "")
      .trim()
      .split(" ")
      .slice(0, 3)
      .join(" ");
    
    const safeQuery = `${simplifiedQuery} clipart png`;
    console.log("[v0] Google Image Search - Original query:", query);
    console.log("[v0] Google Image Search - Simplified query:", safeQuery);
    
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", cseId);
    url.searchParams.set("q", safeQuery);
    url.searchParams.set("searchType", "image");
    url.searchParams.set("num", "5");
    url.searchParams.set("safe", "active");

    console.log("[v0] Google Image Search - Full URL:", url.toString().replace(apiKey, "API_KEY_HIDDEN"));

    const response = await fetch(url.toString());
    console.log("[v0] Google Image Search - Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("[v0] Google Image Search - Error response:", errorText.substring(0, 500));
      return [];
    }

    const data = await response.json();
    console.log("[v0] Google Image Search - Response keys:", Object.keys(data));
    console.log("[v0] Google Image Search - Found items:", data.items?.length || 0);
    
    if (data.error) {
      console.log("[v0] Google Image Search - API Error:", JSON.stringify(data.error));
      return [];
    }
    
    return (data.items || []).map((item: { link: string; image?: { thumbnailLink: string }; title: string }) => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      title: item.title,
    }));
  } catch (error) {
    console.log("[v0] Google Image Search - Exception:", error);
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
  console.log("[v0] replacePollinationsWithGoogleImages - Starting");
  
  // Extrai todas as URLs do Pollinations e suas descricoes
  // Regex mais flexivel para capturar diferentes formatos de URL
  const pollinationsRegex = /https:\/\/image\.pollinations\.ai\/prompt\/([^?"'\s]+)[^"'\s]*/g;
  const matches: { fullUrl: string; description: string }[] = [];
  
  let match;
  while ((match = pollinationsRegex.exec(html)) !== null) {
    const fullUrl = match[0];
    const rawDesc = match[1];
    const description = decodeURIComponent(rawDesc).replace(/[+_]/g, " ").replace(/%20/g, " ");
    
    matches.push({ fullUrl, description });
    console.log("[v0] Found Pollinations URL:", fullUrl.substring(0, 80) + "...");
  }

  console.log("[v0] Total Pollinations URLs found:", matches.length);

  if (matches.length === 0) {
    console.log("[v0] No Pollinations URLs found, returning original HTML");
    return html;
  }

  // Busca imagens do Google para cada descricao unica
  const uniqueDescriptions = [...new Set(matches.map((m) => m.description))];
  console.log("[v0] Unique descriptions to search:", uniqueDescriptions.length);
  
  const imageCache: Record<string, string> = {};

  for (const desc of uniqueDescriptions.slice(0, 5)) {
    console.log("[v0] Searching Google for:", desc.substring(0, 50));
    const images = await searchGoogleImages(desc);
    if (images.length > 0) {
      imageCache[desc] = images[0].thumbnail;
      console.log("[v0] Found image for:", desc.substring(0, 30), "->", images[0].thumbnail.substring(0, 50));
    } else {
      console.log("[v0] No images found for:", desc.substring(0, 50));
    }
  }

  // Substitui as URLs no HTML
  let result = html;
  let replacedCount = 0;
  
  for (const m of matches) {
    if (imageCache[m.description]) {
      result = result.replace(m.fullUrl, imageCache[m.description]);
      replacedCount++;
    }
  }
  
  console.log("[v0] Replaced", replacedCount, "images out of", matches.length);

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
        text: `Crie uma atividade educacional rica em imagens e figurinhas para:

- Ano escolar: ${config.year}
- Disciplina: ${subjectLabels[config.subject] || config.subject}
- Tipo de atividade: ${config.activityType}
- Tema/Assunto: ${config.topic || "Geral"}
- Dificuldade: ${config.difficulty}
- QUANTIDADE DE QUESTOES: ${config.questionCount} questoes (OBRIGATORIO GERAR TODAS)
${config.observations ? `- Observacoes da professora: ${config.observations}` : ""}

${uploadedFiles.length > 0 ? "IMPORTANTE: Replique fielmente o estilo visual, cabecalho e estrutura dos modelos enviados acima." : ""}

REGRAS OBRIGATORIAS:
1. Retorne APENAS HTML (sem <!DOCTYPE>, <html>, <head>, <body>)
2. GERE EXATAMENTE ${config.questionCount} QUESTOES NUMERADAS (de 1 a ${config.questionCount}) - NAO GERE MENOS QUE ISSO
3. Cada questao deve ser numerada claramente: "1)", "2)", "3)", etc ate chegar em "${config.questionCount})"
4. Use MUITAS figurinhas com emojis grandes (classe figurinha-card + figurinha-emoji)
5. Para imagens ilustradas use: <img class="figurinha-img" src="https://image.pollinations.ai/prompt/DESCRICAO_EM_INGLES?width=110&height=110&nologo=true&seed=N" loading="lazy"/>
   - DESCRICAO_EM_INGLES: ex "cute cartoon dog kids white background"
   - Troque N por numeros diferentes para cada imagem (1, 2, 3...)
6. Use grids de figurinhas para tornar visual (classe figurinhas-grid ou figurinhas-grid-3)
7. Classes CSS disponiveis: activity-section, activity-subtitle, activity-instruction, activity-list, answer-line, drawing-box, drawing-box small, math-grid, math-op, math-num, math-line, problem-box, word-box, word-tag, text-box, two-columns, figurinhas-grid, figurinhas-grid-3, figurinha-card (variantes: .green .blue .yellow .pink), figurinha-img, figurinha-img-lg, figurinha-emoji, figurinha-emoji-sm, figurinha-name, figurinha-write, figurinha-hint, counting-grid, counting-card, counting-emojis, counting-answer
8. Use emojis em titulos e instrucoes para motivar as criancas
9. Linguagem simples e acolhedora para ${config.year}
${config.observations ? `10. SIGA AS OBSERVACOES DA PROFESSORA: ${config.observations}` : ""}

LEMBRE-SE: A atividade DEVE conter EXATAMENTE ${config.questionCount} questoes. Verifique antes de finalizar.`,
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
