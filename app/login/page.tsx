"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Scroll reveal hook ─────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

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
    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100 text-center max-w-md mx-auto anim-scale-in">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">📧</span>
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">Verifique seu e-mail!</h2>
      <p className="text-gray-500 text-sm mb-4">Enviamos um link de confirmação para:</p>
      <p className="font-black text-amber-600 text-base mb-5 bg-amber-50 rounded-xl px-4 py-2 break-all">{emailSent}</p>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">Acesse sua caixa de entrada e clique no link. Verifique também o spam.</p>
      <button onClick={() => { setEmailSent(""); setMode("login"); setEmail(""); setPassword(""); setName(""); }}
        className="w-full py-3 rounded-2xl font-black text-white bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-[#3b0764] transition-all active:scale-95 shadow-md">
        Já confirmei, entrar
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-amber-100 max-w-md mx-auto">
      <h2 className="text-2xl font-black text-gray-700 mb-2 text-center">
        {mode === "login" ? "✨ Entrar na sua conta" : "🎉 Criar conta gratuita"}
      </h2>
      <p className="text-center text-sm text-gray-400 mb-6">
        {mode === "register" ? "Sem cartão de crédito • Começa grátis" : "Bem-vinda de volta!"}
      </p>

      <button type="button" onClick={handleGoogleLogin} disabled={loadingGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 font-bold text-gray-700 text-sm shadow-sm mb-5 disabled:opacity-50">
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Seu nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Professora Ana"
              className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-amber-400 transition-colors" required />
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="sua@escola.com"
            className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-amber-400 transition-colors"
            required autoComplete="email" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Senha</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 pr-12 text-sm font-semibold text-gray-700 focus:outline-none focus:border-amber-400 transition-colors"
              required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg" tabIndex={-1}>
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        {error && <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">❌ {error}</div>}
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-2 cta-pulse">
          {loading ? "⏳ Aguarde..." : mode === "register" ? "🚀 Gerar minha atividade grátis" : "✨ Entrar"}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-gray-100 pt-6">
        <p className="text-sm text-gray-500">
          {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="font-bold text-purple-700 hover:text-purple-900 underline">
            {mode === "login" ? "Criar conta grátis" : "Entrar"}
          </button>
        </p>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">🔒 Seus dados estão seguros e protegidos</p>
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

  const scrollToForm = () => {
    document.getElementById("comecar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white font-nunito overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm anim-fade-in">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl anim-float">🍎</span>
            <span className="font-black text-lg">
              <span className="text-gray-800">Dora</span><span className="text-purple-700">Educa</span>
            </span>
          </div>
          <button onClick={scrollToForm}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm px-4 py-2 rounded-xl shadow active:scale-95 transition-all hover:shadow-lg hover:scale-105">
            Gerar grátis →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-16 hero-gradient text-white">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-bold mb-5 anim-badge-pop">
            🚀 IA para professoras brasileiras
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3 anim-fade-up delay-100">
            Crie atividades prontas<br />
            <span className="text-yellow-300 drop-shadow-sm">em segundos</span>
          </h1>
          <p className="text-base sm:text-lg text-white/90 mb-7 anim-fade-up delay-200">
            Escolha a série, o tema e imprima.<br className="sm:hidden" /> Sem complicação.
          </p>
          <button onClick={scrollToForm}
            className="bg-white text-orange-600 font-black text-lg px-8 py-4 rounded-2xl shadow-xl active:scale-95 transition-all hover:scale-105 cta-pulse anim-fade-up delay-300"
            style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}>
            🎉 Gerar minha atividade grátis
          </button>
          <p className="text-white/60 text-xs mt-3 anim-fade-up delay-400">5 atividades gratuitas • Sem cartão de crédito</p>
        </div>

        {/* Vídeo placeholder */}
        <div className="max-w-2xl mx-auto px-4 pb-0 anim-scale-in delay-500">
          <div className="w-full rounded-t-3xl overflow-hidden shadow-2xl bg-gray-900 aspect-video flex items-center justify-center relative group cursor-pointer" onClick={scrollToForm}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/atividade-pronta.jpg" alt="Atividade gerada pelo DoraEduca"
              className="w-full h-full object-cover opacity-75 group-hover:opacity-60 transition-opacity duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/25 border-2 border-white/60 flex items-center justify-center mb-3 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-3xl ml-1">▶</span>
              </div>
              <p className="text-white font-black text-sm drop-shadow">Veja como funciona em 10 segundos</p>
              <p className="text-white/60 text-xs mt-1">Clique para criar sua primeira atividade</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANTES vs DEPOIS ── */}
      <section className="py-14 px-4 bg-[#FFF5E4]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 text-center mb-8 reveal">
            Antes e depois do <span className="text-orange-500">DoraEduca</span>
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border-2 border-red-100 shadow-sm card-hover reveal-left">
              <p className="font-black text-red-500 text-sm mb-3">❌ Antes</p>
              {["2–3h por atividade", "Pesquisa manual", "Formatar no Word", "Imprimir e cortar", "Sem tempo pra alunos"].map((t, i) => (
                <p key={t} className="text-xs text-gray-500 mb-2 flex gap-2" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="text-red-300">•</span>{t}
                </p>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 border-2 border-green-200 shadow-sm card-hover reveal-right">
              <p className="font-black text-green-600 text-sm mb-3">✅ Com DoraEduca</p>
              {["10 segundos", "IA gera tudo", "Pronta para imprimir", "PDF ou Word", "Mais tempo com alunos"].map((t, i) => (
                <p key={t} className="text-xs text-gray-700 font-semibold mb-2 flex gap-2" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="text-green-400">•</span>{t}
                </p>
              ))}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/antes-depois.jpg" alt="Antes e depois"
            className="w-full max-w-lg mx-auto rounded-2xl shadow-lg reveal-scale"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-purple-600 font-black text-xs uppercase tracking-widest text-center mb-2 reveal">Simples assim</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 text-center mb-8 reveal">
            3 passos. 10 segundos.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { num: "1", color: "bg-amber-400",  icon: "🖱️", title: "Escolha",  desc: "Série, disciplina e tema da atividade",       delay: "delay-100" },
              { num: "2", color: "bg-purple-600", icon: "⚡", title: "Gere",     desc: "A IA cria a atividade completa em segundos",   delay: "delay-300" },
              { num: "3", color: "bg-orange-500", icon: "🖨️", title: "Imprima",  desc: "PDF ou Word. Pronto para a sala de aula",      delay: "delay-500" },
            ].map((s) => (
              <div key={s.num} className={`step-card flex flex-col items-center text-center bg-gray-50 rounded-2xl p-5 border border-gray-100 card-hover reveal ${s.delay}`}>
                <div className={`step-num ${s.color} text-white font-black text-xl w-11 h-11 rounded-full flex items-center justify-center mb-3 shadow-md`}>
                  {s.num}
                </div>
                <span className="text-3xl mb-2">{s.icon}</span>
                <h3 className="font-black text-gray-800 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/como-funciona.jpg" alt="Como funciona"
            className="w-full max-w-lg mx-auto rounded-2xl shadow-lg mt-8 reveal-scale"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      </section>

      {/* ── PRINTS DO SISTEMA ── */}
      <section className="py-14 px-4 bg-gradient-to-br from-purple-50 to-amber-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 text-center mb-2 reveal">
            Atividades <span className="text-orange-500">100% prontas</span>
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8 reveal">Com cabeçalho da escola, questões e espaços para resposta</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/atividade-pronta.jpg" alt="Atividade pronta"
              className="w-full rounded-2xl shadow-lg card-hover reveal-left"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/tenho-tudo-pronto.jpg" alt="Resultado"
              className="w-full rounded-2xl shadow-lg card-hover reveal-right"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex flex-wrap justify-center gap-2 reveal">
            {["✅ Alinhado à BNCC", "✅ Colorida ou P&B", "✅ Para colorir", "✅ Word e PDF", "✅ Todas as séries"].map((t) => (
              <span key={t} className="bg-white rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + FORM ── */}
      <section id="comecar" className="py-16 px-4 bg-gradient-to-br from-purple-700 via-purple-800 to-[#3b0764] relative overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="max-w-lg mx-auto text-center mb-8 relative reveal">
          <span className="text-4xl anim-float inline-block">🍎</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2">
            Comece agora. É <span className="text-yellow-300">grátis!</span>
          </h2>
          <p className="text-purple-200 text-sm">Crie sua conta em segundos e gere sua primeira atividade ainda hoje.</p>
        </div>
        <div className="max-w-md mx-auto relative reveal">
          <AuthForm />
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-purple-600 font-black text-xs uppercase tracking-widest text-center mb-2 reveal">Planos</p>
          <h2 className="text-2xl font-black text-gray-800 text-center mb-8 reveal">Comece grátis, cresça no seu ritmo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Gratuito", price: "R$ 0",     period: "para sempre", tag: null,         btn: "bg-gray-700 hover:bg-gray-800",                                        color: "border-gray-200",  delay: "delay-100", features: ["5 atividades total", "Todas as disciplinas", "Impressão direta"] },
              { name: "Básico",   price: "R$ 29,90", period: "/mês",        tag: null,         btn: "bg-gray-800 hover:bg-gray-900",                                        color: "border-gray-200",  delay: "delay-300", features: ["50 atividades/mês", "Download Word e PDF", "Histórico 30 dias"] },
              { name: "Pro",      price: "R$ 49,90", period: "/mês",        tag: "⭐ Popular", btn: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600", color: "border-amber-400", delay: "delay-500", features: ["100 atividades/mês", "Word e PDF", "Histórico completo", "Suporte WhatsApp"] },
            ].map((plan) => (
              <div key={plan.name}
                className={`relative rounded-2xl border-2 ${plan.color} flex flex-col overflow-hidden card-hover reveal ${plan.delay} ${plan.tag ? "shadow-xl ring-2 ring-amber-400 ring-offset-2" : "shadow-sm"}`}>
                {plan.tag && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black text-center py-1.5">{plan.tag}</div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="font-black text-gray-800 mb-1">{plan.name}</p>
                  <div className="mb-4">
                    <span className="font-black text-2xl text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-xs">{plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-2 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-green-500 font-bold shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={scrollToForm}
                    className={`w-full py-2.5 rounded-xl text-white font-black text-sm transition-all active:scale-95 hover:scale-105 ${plan.btn}`}>
                    Começar agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 text-center py-5 text-xs">
        <p>© 2025 DoraEduca · Criando aulas mágicas para seus alunos 🍎</p>
        <p className="mt-1">🔒 Seus dados estão seguros e protegidos</p>
      </footer>

      {/* ── BOTÃO FLUTUANTE MOBILE ── */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden transition-transform duration-300 ${showFloatingBtn ? "translate-y-0" : "translate-y-full"}`}>
        <div className="bg-white border-t border-orange-100 shadow-2xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-800 leading-tight">Crie atividades em segundos!</p>
            <p className="text-[11px] text-gray-400">5 grátis • Sem cartão</p>
          </div>
          <button onClick={scrollToForm}
            className="shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-all cta-pulse"
            style={{ boxShadow: "0 4px 15px rgba(249,115,22,0.5)" }}>
            Gerar grátis →
          </button>
        </div>
      </div>

    </div>
  );
}
