"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  newThisWeek: number;
  planCount: Record<string, number>;
  totalActivities: number;
  activitiesMes: number;
  activitiesHoje: number;
  recentUsers: {
    id: string;
    email: string;
    plan: string;
    created_at: string;
    last_sign_in: string | null;
  }[];
}

const PLAN_LABEL: Record<string, { label: string; color: string }> = {
  gratuito:  { label: "Gratuito",  color: "bg-gray-100 text-gray-700" },
  basico:    { label: "Básico",    color: "bg-blue-100 text-blue-700" },
  pro:       { label: "Pro",       color: "bg-amber-100 text-amber-700" },
  ilimitado: { label: "Ilimitado", color: "bg-purple-100 text-purple-700" },
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Acesso negado ou erro no servidor.");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <p className="text-gray-500 font-semibold">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-2xl p-8 shadow border border-red-100">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-red-600 font-bold">{error}</p>
          <a href="/" className="mt-4 inline-block text-sm text-gray-400 hover:text-gray-600 underline">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const paying = (stats.planCount.basico ?? 0) + (stats.planCount.pro ?? 0) + (stats.planCount.ilimitado ?? 0);
  const convRate = stats.totalUsers > 0 ? ((paying / stats.totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-2xl text-gray-800">📊 Painel Admin</h1>
            <p className="text-gray-400 text-sm mt-0.5">DoraEduca — visão geral do sistema</p>
          </div>
          <a
            href="/"
            className="text-sm font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm transition-colors"
          >
            ← Voltar
          </a>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total de Usuários", value: stats.totalUsers, icon: "👥", sub: `+${stats.newThisWeek} esta semana`, color: "border-blue-100" },
            { label: "Pagantes",          value: paying,           icon: "💳", sub: `${convRate}% de conversão`,         color: "border-green-100" },
            { label: "Atividades Hoje",   value: stats.activitiesHoje, icon: "⚡", sub: `${stats.activitiesMes} este mês`, color: "border-amber-100" },
            { label: "Total Geradas",     value: stats.totalActivities, icon: "📄", sub: "todas as atividades",           color: "border-purple-100" },
          ].map((c) => (
            <div key={c.label} className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${c.color}`}>
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="font-black text-2xl text-gray-800">{c.value.toLocaleString("pt-BR")}</div>
              <div className="text-xs font-bold text-gray-500 mt-0.5">{c.label}</div>
              <div className="text-[11px] text-gray-400 mt-1">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Distribuição por plano */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide mb-4">Usuários por Plano</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(PLAN_LABEL).map(([plan, { label, color }]) => {
              const count = stats.planCount[plan] ?? 0;
              const pct = stats.totalUsers > 0 ? ((count / stats.totalUsers) * 100).toFixed(0) : "0";
              return (
                <div key={plan} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                    <span className="text-xs text-gray-400 font-semibold">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        plan === "gratuito" ? "bg-gray-400" :
                        plan === "basico"   ? "bg-blue-400" :
                        plan === "pro"      ? "bg-amber-400" :
                        "bg-purple-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-black text-lg text-gray-800">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Últimos usuários */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">Últimos 10 Cadastros</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-4 py-3">Plano</th>
                  <th className="text-left px-4 py-3">Cadastro</th>
                  <th className="text-left px-4 py-3">Último acesso</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((u, i) => {
                  const p = PLAN_LABEL[u.plan] ?? PLAN_LABEL.gratuito;
                  return (
                    <tr key={u.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-5 py-3 font-semibold text-gray-700 truncate max-w-[200px]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${p.color}`}>{p.label}</span>
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
