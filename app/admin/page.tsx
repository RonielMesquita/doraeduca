"use client";

import { useEffect, useState } from "react";

interface DayTrend { date: string; count: number; }

interface Stats {
  totalUsers: number;
  newToday: number;
  newWeek: number;
  newMonth: number;
  planCount: Record<string, number>;
  totalActivities: number;
  activitiesMes: number;
  activitiesHoje: number;
  activeUsersMonth: number;
  dailyTrend: DayTrend[];
  recentUsers: {
    id: string;
    email: string;
    plan: string;
    created_at: string;
    last_sign_in: string | null;
    activated: boolean;
  }[];
}

const PLAN: Record<string, { label: string; color: string; bar: string }> = {
  gratuito:  { label: "Gratuito",  color: "bg-gray-100 text-gray-700",   bar: "bg-gray-400" },
  basico:    { label: "Básico",    color: "bg-blue-100 text-blue-700",   bar: "bg-blue-400" },
  pro:       { label: "Pro",       color: "bg-amber-100 text-amber-700", bar: "bg-amber-400" },
  ilimitado: { label: "Ilimitado", color: "bg-purple-100 text-purple-700", bar: "bg-purple-500" },
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? `Erro ${r.status}`);
        }
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-spin">⏳</div>
        <p className="text-gray-500 font-semibold">Carregando dados...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white rounded-2xl p-8 shadow border border-red-100 max-w-md">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-red-600 font-bold">{error}</p>
        <a href="/" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-600 underline">← Voltar ao app</a>
      </div>
    </div>
  );

  if (!stats) return null;

  const paying = (stats.planCount.basico ?? 0) + (stats.planCount.pro ?? 0) + (stats.planCount.ilimitado ?? 0);
  const convRate = stats.totalUsers > 0 ? ((paying / stats.totalUsers) * 100).toFixed(1) : "0";
  const activationRate = stats.totalUsers > 0 ? ((stats.activeUsersMonth / stats.totalUsers) * 100).toFixed(0) : "0";
  const maxTrend = Math.max(...stats.dailyTrend.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-2xl text-gray-800">📊 Painel Admin</h1>
            <p className="text-gray-400 text-sm mt-0.5">DoraEduca — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
          </div>
          <div className="flex gap-2">
            <a href="/admin/cliparts" className="text-sm font-bold text-purple-600 hover:text-purple-800 border border-purple-200 rounded-xl px-3 py-2 bg-purple-50 shadow-sm transition-colors">
              🖼️ Cliparts
            </a>
            <button onClick={load} className="text-sm font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm transition-colors">
              🔄 Atualizar
            </button>
            <a href="/" className="text-sm font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm transition-colors">
              ← App
            </a>
          </div>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Usuários", value: stats.totalUsers,      icon: "👥", sub: `+${stats.newMonth} este mês`,       color: "border-blue-100" },
            { label: "Novos Hoje",     value: stats.newToday,         icon: "🆕", sub: `+${stats.newWeek} esta semana`,     color: stats.newToday > 0 ? "border-green-300" : "border-gray-100" },
            { label: "Atividades Hoje",value: stats.activitiesHoje,   icon: "⚡", sub: `${stats.activitiesMes} este mês`,  color: "border-amber-100" },
            { label: "Pagantes",       value: paying,                 icon: "💳", sub: `${convRate}% conversão`,           color: paying > 0 ? "border-green-300" : "border-gray-100" },
          ].map((c) => (
            <div key={c.label} className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${c.color}`}>
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="font-black text-2xl text-gray-800">{c.value.toLocaleString("pt-BR")}</div>
              <div className="text-xs font-bold text-gray-500 mt-0.5">{c.label}</div>
              <div className="text-[11px] text-gray-400 mt-1">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Métricas secundárias */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="font-black text-xl text-gray-800">{activationRate}%</div>
            <div className="text-xs text-gray-500 font-bold">Taxa de Ativação</div>
            <div className="text-[11px] text-gray-400">{stats.activeUsersMonth} usaram este mês</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl mb-1">📄</div>
            <div className="font-black text-xl text-gray-800">{stats.totalActivities.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-gray-500 font-bold">Total Geradas</div>
            <div className="text-[11px] text-gray-400">desde o início</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl mb-1">📈</div>
            <div className="font-black text-xl text-gray-800">
              {stats.totalUsers > 0 ? (stats.totalActivities / stats.totalUsers).toFixed(1) : "0"}
            </div>
            <div className="text-xs text-gray-500 font-bold">Ativ. por Usuário</div>
            <div className="text-[11px] text-gray-400">média geral</div>
          </div>
        </div>

        {/* Gráfico de tendência 7 dias */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide mb-4">Atividades — Últimos 7 Dias</h2>
          <div className="flex items-end gap-2 h-24">
            {stats.dailyTrend.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-gray-600">{d.count || ""}</span>
                <div
                  className="w-full rounded-t-lg bg-purple-400 transition-all"
                  style={{ height: `${Math.max((d.count / maxTrend) * 72, d.count > 0 ? 8 : 2)}px` }}
                />
                <span className="text-[9px] text-gray-400 text-center leading-tight whitespace-nowrap">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Planos */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide mb-4">Distribuição por Plano</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(PLAN).map(([plan, { label, color, bar }]) => {
              const count = stats.planCount[plan] ?? 0;
              const pct = stats.totalUsers > 0 ? ((count / stats.totalUsers) * 100).toFixed(0) : "0";
              return (
                <div key={plan} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                    <span className="text-xs text-gray-400 font-semibold">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-black text-lg text-gray-800">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabela de usuários */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">Últimos 15 Cadastros</h2>
            <span className="text-xs text-gray-400">{stats.newToday} hoje · {stats.newWeek} esta semana</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-4 py-3">Plano</th>
                  <th className="text-left px-4 py-3">Ativo</th>
                  <th className="text-left px-4 py-3">Cadastro</th>
                  <th className="text-left px-4 py-3">Último acesso</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((u, i) => {
                  const p = PLAN[u.plan] ?? PLAN.gratuito;
                  return (
                    <tr key={u.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-5 py-3 font-semibold text-gray-700 truncate max-w-[180px]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${p.color}`}>{p.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${u.activated ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {u.activated ? "✓ Sim" : "Não"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(u.created_at)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmt(u.last_sign_in)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
