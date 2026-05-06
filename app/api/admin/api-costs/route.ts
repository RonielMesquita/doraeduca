import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = [
  ...(process.env.ADMIN_EMAILS ?? "").split(","),
  ...(process.env.TESTER_EMAILS ?? "").split(","),
  "roniel.net@gmail.com",
].map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const admin = createAdminClient();
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();

  const [{ data: mes }, { data: total }] = await Promise.all([
    admin.from("api_usage").select("provider, model, tokens_input, tokens_output, images, cost_usd").gte("created_at", inicioMes),
    admin.from("api_usage").select("provider, cost_usd"),
  ]);

  const sum = (rows: { cost_usd: number }[]) =>
    rows.reduce((s, r) => s + Number(r.cost_usd), 0);

  const mesClaude   = (mes ?? []).filter(r => r.provider === "anthropic");
  const mesOpenAI   = (mes ?? []).filter(r => r.provider === "openai");
  const totalClaude = (total ?? []).filter(r => r.provider === "anthropic");
  const totalOpenAI = (total ?? []).filter(r => r.provider === "openai");

  return Response.json({
    mes: {
      claude:   { cost: sum(mesClaude),  calls: mesClaude.length,  tokensIn: mesClaude.reduce((s,r) => s + r.tokens_input, 0),  tokensOut: mesClaude.reduce((s,r) => s + r.tokens_output, 0) },
      openai:   { cost: sum(mesOpenAI),  images: mesOpenAI.reduce((s,r) => s + r.images, 0) },
      total:    sum(mes ?? []),
    },
    acumulado: {
      claude:   sum(totalClaude),
      openai:   sum(totalOpenAI),
      total:    sum(total ?? []),
    },
  });
}
