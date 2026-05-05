import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = [
  ...(process.env.ADMIN_EMAILS ?? "").split(","),
  ...(process.env.TESTER_EMAILS ?? "").split(","),
  "roniel.net@gmail.com",
]
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  // Verifica autenticação e permissão de admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Você precisa estar logado. Acesse doraeduca.vercel.app e faça login primeiro." }, { status: 401 });
  }
  if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return Response.json({ error: `Email sem permissão: ${user.email}. Admin esperado: roniel.net@gmail.com` }, { status: 403 });
  }

  const admin = createAdminClient();

  // Busca todos os usuários do auth
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const users = authData?.users ?? [];

  // Busca perfis com plano
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, plan, created_at, updated_at");

  const planMap: Record<string, string> = {};
  for (const p of profiles ?? []) {
    planMap[p.id] = p.plan ?? "gratuito";
  }

  // Contagem por plano
  const planCount: Record<string, number> = {
    gratuito: 0,
    basico: 0,
    pro: 0,
    ilimitado: 0,
  };
  for (const u of users) {
    const plan = planMap[u.id] ?? "gratuito";
    planCount[plan] = (planCount[plan] ?? 0) + 1;
  }

  // Total de atividades
  const { count: totalActivities } = await admin
    .from("activities")
    .select("*", { count: "exact", head: true });

  // Atividades este mês
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const { count: activitiesMes } = await admin
    .from("activities")
    .select("*", { count: "exact", head: true })
    .gte("created_at", inicioMes.toISOString());

  // Atividades hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const { count: activitiesHoje } = await admin
    .from("activities")
    .select("*", { count: "exact", head: true })
    .gte("created_at", hoje.toISOString());

  // Últimos 10 usuários cadastrados
  const recentUsers = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      plan: planMap[u.id] ?? "gratuito",
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at ?? null,
    }));

  // Cadastros esta semana
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);
  const newThisWeek = users.filter(
    (u) => new Date(u.created_at) >= inicioSemana
  ).length;

  return Response.json({
    totalUsers: users.length,
    newThisWeek,
    planCount,
    totalActivities: totalActivities ?? 0,
    activitiesMes: activitiesMes ?? 0,
    activitiesHoje: activitiesHoje ?? 0,
    recentUsers,
  });
}
