import { createAdminClient } from "@/lib/supabase/admin";

// Preços em USD (maio 2025)
const PRICING = {
  "claude-sonnet-4-6": { input: 3.00 / 1_000_000, output: 15.00 / 1_000_000 },
  "claude-haiku-4-5":  { input: 0.25 / 1_000_000, output: 1.25  / 1_000_000 },
  "dall-e-3":          { perImage: 0.04 },
} as const;

export async function trackClaudeCost(params: {
  userId?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}) {
  const price = PRICING[params.model as keyof typeof PRICING] as { input: number; output: number } | undefined;
  const costUsd = price
    ? params.inputTokens * price.input + params.outputTokens * price.output
    : 0;

  const supabase = createAdminClient();
  await supabase.from("api_usage").insert({
    user_id: params.userId ?? null,
    provider: "anthropic",
    model: params.model,
    tokens_input: params.inputTokens,
    tokens_output: params.outputTokens,
    images: 0,
    cost_usd: costUsd,
  });
}

export async function trackDalleCost(params: {
  userId?: string;
  images: number;
}) {
  const costUsd = params.images * PRICING["dall-e-3"].perImage;
  const supabase = createAdminClient();
  await supabase.from("api_usage").insert({
    user_id: params.userId ?? null,
    provider: "openai",
    model: "dall-e-3",
    tokens_input: 0,
    tokens_output: 0,
    images: params.images,
    cost_usd: costUsd,
  });
}
