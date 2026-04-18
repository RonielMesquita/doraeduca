import { generateMockActivity } from "@/lib/templates";
import { ActivityConfig, UploadedFile } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const config: ActivityConfig = body.config;
  const uploadedFiles: UploadedFile[] = body.uploadedFiles ?? [];

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
- Quantidade de questões: ${config.questionCount} questões
${config.observations ? `- Observações da professora: ${config.observations}` : ""}

${uploadedFiles.length > 0 ? "IMPORTANTE: Replique fielmente o estilo visual, cabeçalho e estrutura dos modelos enviados acima." : ""}

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS HTML (sem <!DOCTYPE>, <html>, <head>, <body>)
2. Gere EXATAMENTE ${config.questionCount} questões numeradas
3. Use MUITAS figurinhas com emojis grandes (classe figurinha-card + figurinha-emoji)
4. Para imagens ilustradas use: <img class="figurinha-img" src="https://image.pollinations.ai/prompt/DESCRICAO_EM_INGLES?width=110&height=110&nologo=true&seed=N" loading="lazy"/>
   - DESCRICAO_EM_INGLES: ex "cute cartoon dog kids white background"
   - Troque N por números diferentes para cada imagem (1, 2, 3...)
5. Use grids de figurinhas para tornar visual (classe figurinhas-grid ou figurinhas-grid-3)
6. Classes CSS disponíveis: activity-section, activity-subtitle, activity-instruction, activity-list, answer-line, drawing-box, drawing-box small, math-grid, math-op, math-num, math-line, problem-box, word-box, word-tag, text-box, two-columns, figurinhas-grid, figurinhas-grid-3, figurinha-card (variantes: .green .blue .yellow .pink), figurinha-img, figurinha-img-lg, figurinha-emoji, figurinha-emoji-sm, figurinha-name, figurinha-write, figurinha-hint, counting-grid, counting-card, counting-emojis, counting-answer
7. Use emojis em títulos e instruções para motivar as crianças
8. Linguagem simples e acolhedora para ${config.year}
${config.observations ? `9. SIGA AS OBSERVAÇÕES DA PROFESSORA: ${config.observations}` : ""}`,
      });

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system:
          "Você é um assistente especializado em criar atividades educacionais para o Ensino Fundamental brasileiro (1º ao 5º ano). Crie atividades ricas, didáticas e alinhadas à BNCC, com linguagem adequada para cada faixa etária. Use uma abordagem lúdica e motivadora. Quando modelos de referência forem fornecidos, replique fielmente o estilo, formato e estrutura desses modelos.",
        messages: [{ role: "user", content }],
      });

      const result = message.content[0];
      if (result.type === "text") {
        return Response.json({ activity: result.text, source: "ai" });
      }
    } catch (err) {
      console.error("Claude API error, falling back to template:", err);
    }
  }

  const activity = generateMockActivity(config);
  return Response.json({ activity, source: "template" });
}
