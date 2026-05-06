import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = [
  ...(process.env.ADMIN_EMAILS ?? "").split(","),
  ...(process.env.TESTER_EMAILS ?? "").split(","),
  "roniel.net@gmail.com",
].map((e) => e.trim().toLowerCase()).filter(Boolean);

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()) ? user : null;
}

export async function GET() {
  const user = await checkAdmin();
  if (!user) return Response.json({ error: "Sem permissão" }, { status: 403 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("meta_spend")
    .select("*")
    .order("data", { ascending: false })
    .limit(50);

  return Response.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const user = await checkAdmin();
  if (!user) return Response.json({ error: "Sem permissão" }, { status: 403 });

  const body = await request.json();
  const { data, plataforma, valor, visitantes, descricao } = body;

  if (!data || !valor) return Response.json({ error: "data e valor são obrigatórios" }, { status: 400 });

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("meta_spend")
    .insert({ data, plataforma: plataforma ?? "meta", valor, visitantes: visitantes ?? 0, descricao: descricao ?? "" })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true, item: row });
}

export async function DELETE(request: Request) {
  const user = await checkAdmin();
  if (!user) return Response.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await request.json();
  const admin = createAdminClient();
  const { error } = await admin.from("meta_spend").delete().eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
