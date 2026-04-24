import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_BY_PRICE: Record<string, string> = {
  "price_1TPkvLF9J6QUlf0QiAnmRA7W": "basico",
  "price_1TPkwXF9J6QUlf0QNSUr6t4T": "pro",
  "price_1TPkxQF9J6QUlf0QJPUcfjbx": "ilimitado",
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return Response.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return Response.json({ received: true });

    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;
    const plan = PLAN_BY_PRICE[priceId] ?? "basico";

    await supabase.from("profiles").upsert({
      id: userId,
      plan,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase
      .from("profiles")
      .update({
        plan: "gratuito",
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return Response.json({ received: true });
}
