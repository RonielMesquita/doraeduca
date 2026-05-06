import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = [
  ...(process.env.ADMIN_EMAILS ?? "").split(","),
  ...(process.env.TESTER_EMAILS ?? "").split(","),
  "roniel.net@gmail.com",
].map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  if (user.id === id) {
    return Response.json({ error: "Não é possível deletar sua própria conta" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Remove dados do usuário antes de deletar do Auth
  await admin.from("activities").delete().eq("user_id", id);
  await admin.from("profiles").delete().eq("id", id);

  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
