import { generateMockActivity } from "@/lib/templates";
import { ActivityConfig } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const config: ActivityConfig = body.config;

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

      const prompt = `Crie uma atividade educacional para o Ensino Fundamental brasileiro com as seguintes especificações:

- Ano escolar: ${config.year}
- Disciplina: ${subjectLabels[config.subject] || config.subject}
- Tipo de atividade: ${config.activityType}
- Tema/Assunto: ${config.topic || "Geral"}
- Dificuldade: ${config.difficulty}

Retorne APENAS o conteúdo HTML da atividade (sem <!DOCTYPE>, <html>, <head> ou <body>).
Use estas classes CSS disponíveis: activity-section, activity-subtitle, activity-instruction, activity-list, answer-line, drawing-box, math-grid, math-op, math-num, math-line, problem-box, word-box, word-tag, text-box, two-columns.
A atividade deve ser completa, didática, divertida e alinhada à BNCC.
Use emojis para deixar mais visual e motivador para as crianças.
Inclua pelo menos 3 exercícios diferentes.`;

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system:
          "Você é um assistente especializado em criar atividades educacionais para o Ensino Fundamental brasileiro (1º ao 5º ano). Crie atividades ricas, didáticas e alinhadas à BNCC, com linguagem adequada para cada faixa etária. Use uma abordagem lúdica e motivadora.",
        messages: [{ role: "user", content: prompt }],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return Response.json({ activity: content.text, source: "ai" });
      }
    } catch (err) {
      console.error("Claude API error, falling back to template:", err);
    }
  }

  const activity = generateMockActivity(config);
  return Response.json({ activity, source: "template" });
}
