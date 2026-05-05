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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Você precisa estar logado. Acesse doraeduca.vercel.app e faça login primeiro." }, { status: 401 });
  }
  if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return Response.json({ error: `Email sem permissão: ${user.email}. Admin esperado: roniel.net@gmail.com` }, { status: 403 });
  }

  const admin = createAdminClient();

  // Usuários
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const users = authData?.users ?? [];

  // Perfis com plano
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, plan, created_at");

  const planMap: Record<string, string> = {};
  for (const p of profiles ?? []) planMap[p.id] = p.plan ?? "gratuito";

  // Contagem por plano
  const planCount: Record<string, number> = { gratuito: 0, basico: 0, pro: 0, ilimitado: 0 };
  for (const u of users) {
    const plan = planMap[u.id] ?? "gratuito";
    planCount[plan] = (planCount[plan] ?? 0) + 1;
  }

  // Datas de referência
  const agora = new Date();
  const hoje = new Date(agora); hoje.setHours(0, 0, 0, 0);
  const inicioMes = new Date(agora); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);
  const inicioSemana = new Date(agora); inicioSemana.setDate(agora.getDate() - 6); inicioSemana.setHours(0, 0, 0, 0);

  // Atividades — totais
  const [
    { count: totalActivities },
    { count: activitiesMes },
    { count: activitiesHoje },
  ] = await Promise.all([
    admin.from("activities").select("*", { count: "exact", head: true }),
    admin.from("activities").select("*", { count: "exact", head: true }).gte("created_at", inicioMes.toISOString()),
    admin.from("activities").select("*", { count: "exact", head: true }).gte("created_at", hoje.toISOString()),
  ]);

  // Usuários que geraram pelo menos 1 atividade (ativados)
  const { data: activeUsersData } = await admin
    .from("activities")
    .select("user_id")
    .gte("created_at", inicioMes.toISOString());
  const activeUserIds = new Set((activeUsersData ?? []).map((a: { user_id: string }) => a.user_id));

  // Tendência: atividades nos últimos 7 dias
  const { data: recentActivities } = await admin
    .from("activities")
    .select("created_at")
    .gte("created_at", inicioSemana.toISOString())
    .order("created_at", { ascending: true });

  const dailyTrend: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(agora);
    d.setDate(agora.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const count = (recentActivities ?? []).filter((a: { created_at: string }) => {
      const t = new Date(a.created_at);
      return t >= d && t < next;
    }).length;
    dailyTrend.push({ date: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }), count });
  }

  // Cadastros: hoje, semana, mês
  const newToday  = users.filter(u => new Date(u.created_at) >= hoje).length;
  const newWeek   = users.filter(u => new Date(u.created_at) >= inicioSemana).length;
  const newMonth  = users.filter(u => new Date(u.created_at) >= inicioMes).length;

  // Últimos 15 usuários
  const recentUsers = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)
    .map(u => ({
      id: u.id,
      email: u.email ?? "",
      plan: planMap[u.id] ?? "gratuito",
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at ?? null,
      activated: activeUserIds.has(u.id),
    }));

  return Response.json({
    totalUsers: users.length,
    newToday,
    newWeek,
    newMonth,
    planCount,
    totalActivities: totalActivities ?? 0,
    activitiesMes: activitiesMes ?? 0,
    activitiesHoje: activitiesHoje ?? 0,
    activeUsersMonth: activeUserIds.size,
    dailyTrend,
    recentUsers,
  });
}
