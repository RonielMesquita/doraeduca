"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Scroll reveal ──────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Highlight helpers ──────────────────────────────────────────────────── */
const HL = ({ children, color = "yellow" }: { children: React.ReactNode; color?: "yellow" | "orange" | "purple" | "green" | "pink" }) => {
  const colors = {
    yellow: "bg-yellow-300 text-gray-900",
    orange: "bg-orange-400 text-white",
    purple: "bg-purple-600 text-white",
    green:  "bg-green-400 text-gray-900",
    pink:   "bg-pink-400 text-white",
  };
  return (
    <span className={`${colors[color]} px-2 py-0.5 rounded-lg font-black uppercase inline-block -rotate-1 mx-0.5 shadow-sm`}>
      {children}
    </span>
  );
};

/* ─── Auth Form ──────────────────────────────────────────────────────────── */
function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setEmailSent(""); setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        setEmailSent(email);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(msg === "Invalid login credentials" ? "E-mail ou senha incorretos" : msg);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError("Não foi possível conectar com o Google."); setLoadingGoogle(false); }
  };

  if (emailSent) return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-300 text-center max-w-md mx-auto anim-scale-in">
      <div className="text-5xl mb-4">📧</div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">Verifique seu e-mail!</h2>
      <p className="text-gray-500 text-sm mb-4">Enviamos um link de confirmação para:</p>
      <p className="font-black text-orange-500 text-base mb-5 bg-orange-50 rounded-xl px-4 py-2 break-all border-2 border-orange-200">{emailSent}</p>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">Acesse sua caixa de entrada e clique no link. Verifique também o spam.</p>
      <button onClick={() => { setEmailSent(""); setMode("login"); setEmail(""); setPassword(""); setName(""); }}
        className="w-full py-3 rounded-2xl font-black text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:scale-105 transition-all active:scale-95 shadow-md">
        Já confirmei, entrar ✅
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-amber-300 max-w-md mx-auto">
      <h2 className="text-2xl font-black text-gray-700 mb-1 text-center">
        {mode === "login" ? "✨ Entrar na sua conta" : "🎉 Criar conta GRATUITA"}
      </h2>
      <p className="text-center text-sm text-gray-400 mb-6">
        {mode === "register" ? "Sem cartão • Começa GRÁTIS agora" : "Bem-vinda de volta, professora! 🍎"}
      </p>

      <button type="button" onClick={handleGoogleLogin} disabled={loadingGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 font-bold text-gray-700 text-sm shadow-sm mb-5 disabled:opacity-50 hover:scale-105">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {loadingGoogle ? "Conectando..." : "Continuar com Google"}
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">ou</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <div>
            <label className="block text-xs font-black text-purple-600 uppercase tracking-wide mb-1">✏️ Seu nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Professora Ana"
              className="w-full rounded-xl border-2 border-amber-300 bg-amber-50/30 px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-400 transition-colors" required />
          </div>
        )}
        <div>
          <label className="block text-xs font-black text-purple-600 uppercase tracking-wide mb-1">📧 E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="sua@escola.com"
            className="w-full rounded-xl border-2 border-amber-300 bg-amber-50/30 px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-400 transition-colors"
            required autoComplete="email" />
        </div>
        <div>
          <label className="block text-xs font-black text-purple-600 uppercase tracking-wide mb-1">🔒 Senha</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border-2 border-amber-300 bg-amber-50/30 px-4 py-3 pr-12 text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-400 transition-colors"
              required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg" tabIndex={-1}>
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        {error && <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 text-sm font-bold text-red-600">❌ {error}</div>}
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-1 cta-pulse">
          {loading ? "⏳ Aguarde..." : mode === "register" ? "🚀 GERAR MINHA ATIVIDADE GRÁTIS" : "✨ ENTRAR"}
        </button>
      </form>

      <div className="mt-5 text-center border-t-2 border-dashed border-amber-200 pt-5">
        <p className="text-sm text-gray-500">
          {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="font-black text-purple-600 hover:text-purple-800 underline underline-offset-2">
            {mode === "login" ? "Criar conta grátis" : "Entrar"}
          </button>
        </p>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">🔒 Seus dados estão seguros e protegidos</p>
    </div>
  );
}

/* ─── Landing Page ───────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  useReveal();

  useEffect(() => {
    const onScroll = () => setShowFloatingBtn(window.scrollY > 280);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => document.getElementById("comecar")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="bg-white font-nunito overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-amber-200 shadow-sm anim-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl anim-float">🍎</span>
            <span className="font-black text-lg">
              <span className="text-gray-800">Dora</span><span className="text-purple-600">Educa</span>
            </span>
          </div>
          <button onClick={scrollToForm}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 hover:scale-105 transition-all border-b-4 border-orange-700">
            GERAR GRÁTIS →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-16 hero-gradient text-white">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-6 text-center">

          <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-black mb-6 anim-badge-pop border border-white/30">
            🚀 INTELIGÊNCIA ARTIFICIAL PARA PROFESSORAS
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4 anim-fade-up delay-100">
            Pare de perder<br />
            <HL color="yellow">HORAS</HL> criando atividades!
          </h1>

          <p className="text-base sm:text-xl text-white/90 mb-3 anim-fade-up delay-200 font-bold">
            O DoraEduca usa IA para criar atividades
          </p>
          <p className="text-base sm:text-xl text-white/90 mb-7 anim-fade-up delay-200">
            <HL color="green">PRONTAS PARA IMPRIMIR</HL> em{" "}
            <HL color="pink">SEGUNDOS</HL>
          </p>

          <button onClick={scrollToForm}
            className="bg-white text-orange-600 font-black text-lg px-8 py-4 rounded-2xl shadow-2xl active:scale-95 hover:scale-105 transition-all border-b-4 border-orange-200 anim-fade-up delay-300 cta-pulse">
            🎉 GERAR MINHA ATIVIDADE GRÁTIS
          </button>
          <p className="text-white/70 text-sm mt-3 font-bold anim-fade-up delay-400">
            ✅ 5 atividades gratuitas &nbsp;•&nbsp; ✅ Sem cartão de crédito
          </p>
        </div>

        {/* Vídeo com moldura de notebook */}
        <div className="max-w-3xl mx-auto px-4 pb-10 anim-scale-in delay-500">
          {/* Tela */}
          <div className="bg-gray-800 rounded-t-2xl p-2 sm:p-3 shadow-2xl border-4 border-gray-700 ring-4 ring-white/10">
            {/* Barra do browser */}
            <div className="bg-gray-900 rounded-t-xl px-3 py-2 flex items-center gap-2 mb-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
              <div className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
              <div className="flex-1 bg-gray-700 rounded-full h-5 mx-2 flex items-center px-3 min-w-0">
                <span className="text-gray-400 text-[11px] font-mono truncate">🔒 doraeduca.vercel.app</span>
              </div>
            </div>
            {/* iframe */}
            <div className="aspect-video rounded-b-lg overflow-hidden bg-black">
              <iframe
                src="https://www.youtube.com/embed/GTTqXLvquuM?autoplay=1&mute=1&loop=1&playlist=GTTqXLvquuM&rel=0&modestbranding=1&playsinline=1&controls=1&vq=hd1080"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                title="DoraEduca — Crie atividades em segundos"
              />
            </div>
          </div>
          {/* Base do notebook */}
          <div className="bg-gray-700 h-4 rounded-b-lg mx-6 shadow-lg" />
          <div className="bg-gray-600 h-2 rounded-b-2xl mx-2 shadow-xl" />
        </div>
      </section>

      {/* ── ANTES vs DEPOIS ── */}
      <section className="py-14 px-4 bg-gradient-to-br from-amber-50 to-orange-50 border-y-4 border-amber-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 text-center mb-2 reveal">
            O que muda com o <HL color="orange">DoraEduca</HL> 👇
          </h2>
          <p className="text-center text-gray-500 font-bold mb-8 reveal">A diferença é enorme!</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-3xl p-5 border-4 border-red-200 shadow-md card-hover reveal-left">
              <div className="bg-red-100 rounded-2xl px-3 py-1.5 inline-block mb-3">
                <p className="font-black text-red-500 text-sm uppercase">😩 ANTES</p>
              </div>
              {[
                ["⏰", "2–3h por atividade"],
                ["🔍", "Pesquisa manual"],
                ["💻", "Formatação no Word"],
                ["😴", "Noites perdidas"],
                ["💔", "Sem tempo pra alunos"],
              ].map(([icon, t]) => (
                <div key={t} className="flex items-center gap-2 mb-2 bg-red-50 rounded-xl px-3 py-1.5">
                  <span className="text-base">{icon}</span>
                  <span className="text-xs text-red-700 font-bold">{t}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl p-5 border-4 border-green-300 shadow-md card-hover reveal-right">
              <div className="bg-green-100 rounded-2xl px-3 py-1.5 inline-block mb-3">
                <p className="font-black text-green-600 text-sm uppercase">🎉 COM DORAEUDCA</p>
              </div>
              {[
                ["⚡", "10 segundos!"],
                ["🤖", "IA gera tudo"],
                ["🖨️", "Pronta pra imprimir"],
                ["😴", "Dorme cedo!"],
                ["❤️", "Mais tempo com alunos"],
              ].map(([icon, t]) => (
                <div key={t} className="flex items-center gap-2 mb-2 bg-green-50 rounded-xl px-3 py-1.5">
                  <span className="text-base">{icon}</span>
                  <span className="text-xs text-green-700 font-black">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/antes-depois.jpg" alt="Antes e depois"
            className="w-full max-w-lg mx-auto rounded-3xl shadow-xl border-4 border-amber-200 reveal-scale"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="bg-purple-100 text-purple-700 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3 reveal">
              🪄 SIMPLES ASSIM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 reveal">
              <HL color="purple">3 PASSOS.</HL>{" "}
              <HL color="orange">10 SEGUNDOS.</HL>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { num: "1", bg: "bg-amber-400",  border: "border-amber-300", icon: "🖱️", title: "ESCOLHA",  desc: "Série, disciplina e tema da atividade", delay: "delay-100" },
              { num: "2", bg: "bg-purple-600", border: "border-purple-300", icon: "⚡", title: "GERE",     desc: "A IA cria a atividade completa em segundos", delay: "delay-300" },
              { num: "3", bg: "bg-orange-500", border: "border-orange-300", icon: "🖨️", title: "IMPRIMA",  desc: "PDF ou Word. Pronto pra sala de aula!", delay: "delay-500" },
            ].map((s) => (
              <div key={s.num} className={`step-card flex flex-col items-center text-center bg-white rounded-3xl p-6 border-4 ${s.border} shadow-md card-hover reveal ${s.delay}`}>
                <div className={`step-num ${s.bg} text-white font-black text-2xl w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg`}>
                  {s.num}
                </div>
                <span className="text-4xl mb-2">{s.icon}</span>
                <h3 className="font-black text-gray-800 text-lg mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/como-funciona.jpg" alt="Como funciona"
            className="w-full max-w-lg mx-auto rounded-3xl shadow-xl mt-8 border-4 border-purple-100 reveal-scale"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      </section>

      {/* ── PRINTS ── */}
      <section className="py-14 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-y-4 border-purple-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-3 reveal">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
              Atividades <HL color="orange">100% PRONTAS</HL> 🖨️
            </h2>
          </div>
          <p className="text-center text-gray-500 font-bold mb-8 reveal">
            Com cabeçalho da escola, questões e espaços para resposta
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/atividade-pronta.jpg" alt="Atividade pronta"
              className="w-full rounded-3xl shadow-lg border-4 border-amber-200 card-hover reveal-left"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/tenho-tudo-pronto.jpg" alt="Resultado"
              className="w-full rounded-3xl shadow-lg border-4 border-purple-200 card-hover reveal-right"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>

          <div className="flex flex-wrap justify-center gap-2 reveal">
            {[
              { t: "✅ BNCC",          bg: "bg-green-100  text-green-700  border-green-300"  },
              { t: "🎨 Colorida",      bg: "bg-orange-100 text-orange-700 border-orange-300" },
              { t: "🖨️ P&B",           bg: "bg-gray-100   text-gray-700   border-gray-300"   },
              { t: "✏️ Para colorir",  bg: "bg-purple-100 text-purple-700 border-purple-300" },
              { t: "📄 Word e PDF",    bg: "bg-blue-100   text-blue-700   border-blue-300"   },
              { t: "🎒 Todas as séries",bg: "bg-pink-100  text-pink-700   border-pink-300"   },
            ].map(({ t, bg }) => (
              <span key={t} className={`${bg} border-2 rounded-xl px-3 py-1.5 text-xs font-black hover:scale-110 hover:-rotate-1 transition-all cursor-default shadow-sm`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + FORM ── */}
      <section id="comecar" className="py-16 px-4 bg-gradient-to-br from-purple-700 via-purple-800 to-[#3b0764] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

        <div className="max-w-lg mx-auto text-center mb-8 relative reveal">
          <div className="text-5xl mb-3 anim-float inline-block">🍎</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
            COMECE <HL color="yellow">AGORA</HL>!
          </h2>
          <p className="text-purple-200 font-bold">
            Crie sua conta em segundos e gere sua primeira atividade <HL color="green">HOJE</HL>
          </p>
        </div>
        <div className="max-w-md mx-auto relative reveal">
          <AuthForm />
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="bg-amber-100 text-amber-700 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3 reveal">
              💰 PLANOS PARA TODOS OS BOLSOS
            </span>
            <h2 className="text-2xl font-black text-gray-800 reveal">
              Comece <HL color="green">GRÁTIS</HL>, cresça no seu ritmo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: "Gratuito", price: "R$ 0", period: "para sempre",
                tag: null, btn: "bg-gray-700 hover:bg-gray-800 border-b-4 border-gray-800",
                border: "border-gray-200", delay: "delay-100",
                features: ["5 atividades total", "Todas as disciplinas", "Impressão direta"],
              },
              {
                name: "Básico", price: "R$ 29,90", period: "/mês",
                tag: null, btn: "bg-blue-600 hover:bg-blue-700 border-b-4 border-blue-800",
                border: "border-blue-200", delay: "delay-300",
                features: ["50 atividades/mês", "Download Word e PDF", "Histórico 30 dias"],
              },
              {
                name: "Pro", price: "R$ 49,90", period: "/mês",
                tag: "⭐ MAIS POPULAR", btn: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-b-4 border-orange-700",
                border: "border-amber-300", delay: "delay-500",
                features: ["100 atividades/mês", "Word e PDF", "Histórico completo", "Suporte WhatsApp"],
              },
            ].map((plan) => (
              <div key={plan.name}
                className={`relative rounded-3xl border-4 ${plan.border} flex flex-col overflow-hidden card-hover reveal ${plan.delay} ${plan.tag ? "shadow-2xl ring-4 ring-amber-400 ring-offset-2" : "shadow-md"}`}>
                {plan.tag && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black text-center py-2 tracking-widest">
                    {plan.tag}
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <p className="font-black text-gray-800 text-lg mb-1">{plan.name}</p>
                  <div className="mb-4">
                    <span className="font-black text-3xl text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-xs font-bold">{plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-2 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                        <span className="text-green-500 font-black text-base">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={scrollToForm}
                    className={`w-full py-3 rounded-2xl text-white font-black text-sm transition-all active:scale-95 hover:scale-105 ${plan.btn}`}>
                    COMEÇAR AGORA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-xs border-t-4 border-orange-500">
        <p className="font-bold">© 2025 DoraEduca · Criando aulas mágicas para seus alunos 🍎</p>
        <p className="mt-1">🔒 Seus dados estão seguros e protegidos</p>
      </footer>

      {/* ── BOTÃO FLUTUANTE MOBILE ── */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden transition-transform duration-300 ${showFloatingBtn ? "translate-y-0" : "translate-y-full"}`}>
        <div className="bg-white border-t-4 border-orange-400 shadow-2xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-800 leading-tight uppercase">Crie atividades em segundos!</p>
            <p className="text-[11px] text-gray-400 font-bold">5 GRÁTIS • Sem cartão</p>
          </div>
          <button onClick={scrollToForm}
            className="shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm px-5 py-3 rounded-2xl active:scale-95 transition-all border-b-4 border-orange-700 cta-pulse">
            GERAR GRÁTIS →
          </button>
        </div>
      </div>

    </div>
  );
}
