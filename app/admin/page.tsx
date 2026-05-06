"use client";

import { useEffect, useState } from "react";

interface DayTrend { date: string; count: number; }
interface MetaItem { id: string; data: string; plataforma: string; valor: number; visitantes: number; descricao: string; }

interface Stats {
  totalUsers: number; newToday: number; newWeek: number; newMonth: number;
  planCount: Record<string, number>; totalActivities: number;
  activitiesMes: number; activitiesHoje: number; activeUsersMonth: number;
  dailyTrend: DayTrend[];
  recentUsers: { id: string; email: string; plan: string; created_at: string; last_sign_in: string | null; activated: boolean; }[];
}

const PLAN_COLORS: Record<string, string> = {
  gratuito: "#475569", basico: "#38bdf8", pro: "#f59e0b", ilimitado: "#a855f7",
};
const PLAN_LABELS: Record<string, string> = {
  gratuito: "Gratuito", basico: "Básico", pro: "Pro", ilimitado: "Ilimitado",
};
const PLAT_ICON: Record<string, string> = { meta: "📘", google: "🔵", tiktok: "🎵", outro: "📢" };

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtBRL(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

function NeonCard({ children, glow = "#a855f7", className = "" }: { children: React.ReactNode; glow?: string; className?: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`}
      style={{ background: "rgba(13,13,26,0.9)", borderColor: `${glow}33`, boxShadow: `0 0 24px ${glow}18, inset 0 1px 0 ${glow}15` }}>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, color = "#a855f7", icon }: { label: string; value: string | number; sub?: string; color?: string; icon: string }) {
  return (
    <NeonCard glow={color}>
      <div className="text-xl mb-2">{icon}</div>
      <div className="font-black text-2xl mb-0.5" style={{ color, textShadow: `0 0 20px ${color}88` }}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-[11px] text-slate-600 mt-1">{sub}</div>}
    </NeonCard>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [metaItems, setMetaItems] = useState<MetaItem[]>([]);
  const [metaForm, setMetaForm] = useState({ data: new Date().toISOString().slice(0, 10), plataforma: "meta", valor: "", visitantes: "", descricao: "" });
  const [savingMeta, setSavingMeta] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/stats").then(r => r.json()),
      fetch("/api/admin/meta-spend").then(r => r.json()),
    ]).then(([s, m]) => {
      if (s.error) throw new Error(s.error);
      setStats(s);
      setMetaItems(m.items ?? []);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Deletar "${email}" permanentemente?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const body = await res.json();
    if (!res.ok) { alert(body.error ?? "Erro ao deletar"); setDeleting(null); return; }
    setStats((s) => s ? { ...s, recentUsers: s.recentUsers.filter(u => u.id !== id), totalUsers: s.totalUsers - 1 } : s);
    setDeleting(null);
  };

  const saveMeta = async () => {
    if (!metaForm.valor) return;
    setSavingMeta(true);
    const res = await fetch("/api/admin/meta-spend", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...metaForm, valor: parseFloat(metaForm.valor.replace(",", ".")), visitantes: parseInt(metaForm.visitantes || "0") }),
    });
    const body = await res.json();
    if (res.ok) {
      setMetaItems(prev => [body.item, ...prev]);
      setMetaForm(f => ({ ...f, valor: "", visitantes: "", descricao: "" }));
    } else alert(body.error);
    setSavingMeta(false);
  };

  const deleteMeta = async (id: string) => {
    if (!confirm("Remover este lançamento?")) return;
    await fetch("/api/admin/meta-spend", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setMetaItems(prev => prev.filter(i => i.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070f" }}>
      <div className="text-center">
        <div className="text-4xl mb-3" style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚡</div>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Carregando...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070f" }}>
      <div className="text-center rounded-2xl p-8 max-w-md border" style={{ background: "rgba(13,13,26,0.9)", borderColor: "#ef444433" }}>
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-red-400 font-bold">{error}</p>
        <a href="/" className="mt-4 inline-block text-sm text-slate-500 hover:text-slate-300 underline">← Voltar ao app</a>
      </div>
    </div>
  );

  if (!stats) return null;

  const paying = (stats.planCount.basico ?? 0) + (stats.planCount.pro ?? 0) + (stats.planCount.ilimitado ?? 0);
  const convRate = stats.totalUsers > 0 ? ((paying / stats.totalUsers) * 100).toFixed(1) : "0";
  const activationRate = stats.totalUsers > 0 ? ((stats.activeUsersMonth / stats.totalUsers) * 100).toFixed(0) : "0";
  const maxTrend = Math.max(...stats.dailyTrend.map(d => d.count), 1);

  // Métricas Meta do mês atual
  const mesAtual = new Date().toISOString().slice(0, 7);
  const metaMes = metaItems.filter(i => i.data.startsWith(mesAtual));
  const totalInvested = metaItems.reduce((s, i) => s + Number(i.valor), 0);
  const totalInvestedMes = metaMes.reduce((s, i) => s + Number(i.valor), 0);
  const totalVisitors = metaItems.reduce((s, i) => s + i.visitantes, 0);
  const totalVisitorsMes = metaMes.reduce((s, i) => s + i.visitantes, 0);
  const cpl = stats.newMonth > 0 && totalInvestedMes > 0 ? totalInvestedMes / stats.newMonth : 0;
  const cpa = paying > 0 && totalInvested > 0 ? totalInvested / paying : 0;
  const cpc = totalVisitorsMes > 0 && totalInvestedMes > 0 ? totalInvestedMes / totalVisitorsMes : 0;

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: "#07070f" }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-2xl text-white tracking-tight">
              <span style={{ color: "#a855f7", textShadow: "0 0 30px #a855f788" }}>◈</span> DoraEduca Analytics
            </h1>
            <p className="text-slate-500 text-xs mt-0.5 uppercase tracking-widest">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <a href="/admin/cliparts" className="text-xs font-bold px-3 py-2 rounded-xl border transition-all hover:scale-105"
              style={{ color: "#a855f7", borderColor: "#a855f733", background: "rgba(168,85,247,0.08)" }}>
              🖼️ Cliparts
            </a>
            <button onClick={load} className="text-xs font-bold px-3 py-2 rounded-xl border transition-all hover:scale-105"
              style={{ color: "#22d3ee", borderColor: "#22d3ee33", background: "rgba(34,211,238,0.08)" }}>
              ↻ Atualizar
            </button>
            <a href="/" className="text-xs font-bold px-3 py-2 rounded-xl border transition-all"
              style={{ color: "#475569", borderColor: "#1e293b", background: "rgba(15,15,26,0.5)" }}>
              ← App
            </a>
          </div>
        </div>

        {/* ── KPIs principais ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat icon="👥" label="Total Usuários" value={stats.totalUsers} sub={`+${stats.newMonth} este mês`} color="#22d3ee" />
          <Stat icon="🆕" label="Novos Hoje" value={stats.newToday} sub={`+${stats.newWeek} esta semana`} color={stats.newToday > 0 ? "#4ade80" : "#475569"} />
          <Stat icon="⚡" label="Atividades Hoje" value={stats.activitiesHoje} sub={`${stats.activitiesMes} este mês`} color="#f59e0b" />
          <Stat icon="💎" label="Assinantes" value={paying} sub={`${convRate}% conversão`} color={paying > 0 ? "#a855f7" : "#475569"} />
        </div>

        {/* ── Funil de Marketing ── */}
        <div className="rounded-2xl border p-5" style={{ background: "rgba(13,13,26,0.9)", borderColor: "#06b6d433", boxShadow: "0 0 40px #06b6d410" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-white text-sm uppercase tracking-widest">📊 Funil de Marketing</h2>
              <p className="text-slate-500 text-xs mt-0.5">Mês atual · ROI do investimento em tráfego pago</p>
            </div>
          </div>

          {/* Funil visual */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: "💰", label: "Investido", value: fmtBRL(totalInvestedMes), sub: "mês atual", color: "#f472b6" },
              { icon: "👁️", label: "Visitantes", value: totalVisitorsMes.toLocaleString("pt-BR"), sub: cpc > 0 ? `${fmtBRL(cpc)}/visita` : "—", color: "#38bdf8" },
              { icon: "✍️", label: "Cadastros", value: stats.newMonth, sub: cpl > 0 ? `CPL ${fmtBRL(cpl)}` : "—", color: "#4ade80" },
              { icon: "💎", label: "Assinaturas", value: paying, sub: cpa > 0 ? `CPA ${fmtBRL(cpa)}` : "—", color: "#a855f7" },
            ].map((item, idx) => (
              <div key={item.label} className="relative">
                {idx > 0 && (
                  <div className="hidden sm:flex absolute -left-1.5 top-1/2 -translate-y-1/2 z-10 text-slate-600 text-xs">▶</div>
                )}
                <div className="rounded-xl p-4 border text-center" style={{ background: "rgba(7,7,15,0.8)", borderColor: `${item.color}33` }}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="font-black text-lg" style={{ color: item.color, textShadow: `0 0 15px ${item.color}66` }}>{item.value}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{item.label}</div>
                  <div className="text-[11px] text-slate-600 mt-1">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form lançar investimento */}
          <div className="border-t pt-4" style={{ borderColor: "#1e293b" }}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">➕ Lançar Investimento</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <input type="date" value={metaForm.data} onChange={e => setMetaForm(f => ({ ...f, data: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-300 border focus:outline-none focus:border-cyan-500"
                style={{ background: "rgba(7,7,15,0.8)", borderColor: "#1e293b" }} />
              <select value={metaForm.plataforma} onChange={e => setMetaForm(f => ({ ...f, plataforma: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-300 border focus:outline-none"
                style={{ background: "rgba(7,7,15,0.8)", borderColor: "#1e293b" }}>
                <option value="meta">📘 Meta Ads</option>
                <option value="google">🔵 Google Ads</option>
                <option value="tiktok">🎵 TikTok Ads</option>
                <option value="outro">📢 Outro</option>
              </select>
              <input type="text" placeholder="R$ Valor" value={metaForm.valor} onChange={e => setMetaForm(f => ({ ...f, valor: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-300 border focus:outline-none focus:border-pink-500"
                style={{ background: "rgba(7,7,15,0.8)", borderColor: "#1e293b" }} />
              <input type="number" placeholder="Visitantes" value={metaForm.visitantes} onChange={e => setMetaForm(f => ({ ...f, visitantes: e.target.value }))}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-300 border focus:outline-none focus:border-blue-500"
                style={{ background: "rgba(7,7,15,0.8)", borderColor: "#1e293b" }} />
              <button onClick={saveMeta} disabled={savingMeta || !metaForm.valor}
                className="rounded-lg px-3 py-2 text-sm font-black transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#a855f7,#06b6d4)", color: "white", boxShadow: "0 0 20px #a855f744" }}>
                {savingMeta ? "..." : "Salvar"}
              </button>
            </div>
          </div>

          {/* Histórico */}
          {metaItems.length > 0 && (
            <div className="mt-4 border-t pt-4" style={{ borderColor: "#1e293b" }}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">🗂️ Histórico</p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {metaItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "rgba(7,7,15,0.6)" }}>
                    <span className="text-base">{PLAT_ICON[item.plataforma] ?? "📢"}</span>
                    <span className="text-xs text-slate-500">{new Date(item.data + "T12:00").toLocaleDateString("pt-BR")}</span>
                    <span className="font-black text-sm" style={{ color: "#f472b6" }}>{fmtBRL(Number(item.valor))}</span>
                    {item.visitantes > 0 && <span className="text-xs text-slate-500">{item.visitantes} visitas</span>}
                    {item.descricao && <span className="text-xs text-slate-600 flex-1 truncate">{item.descricao}</span>}
                    <button onClick={() => deleteMeta(item.id)} className="text-slate-700 hover:text-red-500 transition-colors text-xs ml-auto">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Métricas secundárias ── */}
        <div className="grid grid-cols-3 gap-3">
          <Stat icon="🎯" label="Taxa de Ativação" value={`${activationRate}%`} sub={`${stats.activeUsersMonth} usaram este mês`} color="#4ade80" />
          <Stat icon="📄" label="Total Geradas" value={stats.totalActivities} sub="desde o início" color="#f59e0b" />
          <Stat icon="📈" label="Ativ. por Usuário" value={stats.totalUsers > 0 ? (stats.totalActivities / stats.totalUsers).toFixed(1) : "0"} sub="média geral" color="#22d3ee" />
        </div>

        {/* ── Gráfico 7 dias ── */}
        <NeonCard glow="#a855f7">
          <h2 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-5">⚡ Atividades — Últimos 7 Dias</h2>
          <div className="flex items-end gap-2 h-28">
            {stats.dailyTrend.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-black" style={{ color: "#a855f7" }}>{d.count || ""}</span>
                <div className="w-full rounded-t-md transition-all relative overflow-hidden"
                  style={{ height: `${Math.max((d.count / maxTrend) * 88, d.count > 0 ? 10 : 3)}px`, background: `linear-gradient(180deg,#a855f7,#7c3aed)`, boxShadow: d.count > 0 ? "0 0 12px #a855f766" : "none" }}>
                  <div className="absolute inset-0 opacity-30" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.2),transparent)" }} />
                </div>
                <span className="text-[9px] text-slate-600 text-center leading-tight whitespace-nowrap">{d.date}</span>
              </div>
            ))}
          </div>
        </NeonCard>

        {/* ── Distribuição por plano ── */}
        <NeonCard glow="#22d3ee">
          <h2 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-5">💎 Distribuição por Plano</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {Object.entries(PLAN_LABELS).map(([plan, label]) => {
              const count = stats.planCount[plan] ?? 0;
              const pct = stats.totalUsers > 0 ? ((count / stats.totalUsers) * 100) : 0;
              const color = PLAN_COLORS[plan];
              return (
                <div key={plan} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black" style={{ color }}>{label}</span>
                    <span className="text-xs font-bold text-slate-600">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}88` }} />
                  </div>
                  <span className="font-black text-xl" style={{ color, textShadow: `0 0 20px ${color}66` }}>{count}</span>
                </div>
              );
            })}
          </div>
        </NeonCard>

        {/* ── Tabela de usuários ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "rgba(13,13,26,0.9)", borderColor: "#1e293b" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#1e293b" }}>
            <h2 className="font-black text-slate-400 text-xs uppercase tracking-widest">👤 Últimos 15 Cadastros</h2>
            <span className="text-xs text-slate-600">{stats.newToday} hoje · {stats.newWeek} esta semana</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-slate-600 font-bold uppercase tracking-widest" style={{ borderBottom: "1px solid #1e293b" }}>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-4 py-3">Plano</th>
                  <th className="text-left px-4 py-3">Ativo</th>
                  <th className="text-left px-4 py-3">Cadastro</th>
                  <th className="text-left px-4 py-3">Último acesso</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((u, i) => {
                  const color = PLAN_COLORS[u.plan] ?? PLAN_COLORS.gratuito;
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid #0f0f1a", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td className="px-5 py-3 font-semibold text-slate-300 truncate max-w-[180px] text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}44`, background: `${color}15` }}>
                          {PLAN_LABELS[u.plan] ?? "Gratuito"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                          style={u.activated ? { color: "#4ade80", background: "#4ade8015", border: "1px solid #4ade8044" } : { color: "#475569", background: "#47556915", border: "1px solid #47556944" }}>
                          {u.activated ? "✓ Sim" : "Não"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{fmt(u.created_at)}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs whitespace-nowrap">{fmt(u.last_sign_in)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteUser(u.id, u.email)} disabled={deleting === u.id}
                          className="text-xs text-slate-700 hover:text-red-500 transition-colors px-2 py-1 rounded-lg disabled:opacity-30">
                          {deleting === u.id ? "…" : "✕"}
                        </button>
                      </td>
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
