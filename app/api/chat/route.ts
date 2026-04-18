import { streamText, UIMessage, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `Voce e a Dora, uma assistente educacional amigavel e prestativa para professores do ensino fundamental.

Voce ajuda professores a:
- Criar ideias de atividades educacionais
- Sugerir temas e abordagens pedagogicas
- Tirar duvidas sobre conteudos do ensino fundamental
- Dar dicas de como tornar as aulas mais engajantes
- Sugerir adaptacoes para diferentes niveis de dificuldade

Responda sempre em portugues brasileiro, de forma clara, amigavel e profissional.
Use linguagem acessivel e evite jargoes tecnicos desnecessarios.
Seja concisa nas respostas, mas completa nas informacoes.`,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
