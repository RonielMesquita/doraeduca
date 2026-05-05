"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/* ─── Login / Register form ─────────────────────────────────────────────── */
function AuthForm() {
  const router = useRouter();
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
    setError("");
    setEmailSent("");
    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { name } },
        });
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Não foi possível conectar com o Google. Tente novamente.");
      setLoadingGoogle(false);
    }
  };

  if (emailSent) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Verifique seu e-mail!</h2>
        <p className="text-gray-500 text-sm mb-4">Enviamos um link de confirmação para:</p>
        <p className="font-black text-amber-600 text-base mb-5 bg-amber-50 rounded-xl px-4 py-2 break-all">{emailSent}</p>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Acesse sua caixa de entrada e clique no link para ativar sua conta. Verifique também o spam.
        </p>
        <button
          onClick={() => { setEmailSent(""); setMode("login"); setEmail(""); setPassword(""); setName(""); }}
          className="w-full py-3 rounded-2xl font-black text-white bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-[#3b0764] transition-all active:scale-95 shadow-md"
        >
          Já confirmei, entrar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-amber-100 max-w-md mx-auto">
      <h2 className="text-2xl font-black text-gray-700 mb-2 text-center">
        {mode === "login" ? "✨ Entrar na sua conta" : "🎉 Criar conta gratuita"}
      </h2>
      <p className="text-center text-sm text-gray-400 mb-6">
        {mode === "register" ? "Sem cartão de crédito • Começa grátis" : "Bem-vinda de volta!"}
      </p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loadingGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 font-bold text-gray-700 text-sm shadow-sm mb-5 disabled:opacity-50"
      >
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
              placeholder="Ex: Professora Dora"
              className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-amber-400 transition-colors"
              required />
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
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">❌ {error}</div>
        )}
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-2"
          style={{ boxShadow: "0 6px 20px rgba(249,115,22,0.4)" }}>
          {loading ? "⏳ Aguarde..." : mode === "register" ? "🚀 Criar conta grátis" : "✨ Entrar"}
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
  const scrollToForm = () => {
    document.getElementById("comecar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white font-nunito overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-amber-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            <span className="font-black text-xl">
              <span className="text-gray-800">Dora</span><span className="text-purple-700">Educa</span>
            </span>
          </div>
          <button onClick={scrollToForm}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm px-5 py-2 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all">
            Começar grátis →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-20 bg-gradient-to-br from-orange-500 via-orange-400 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold mb-6">
            🚀 Inteligência Artificial para professoras
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
            Pare de perder<br />
            <span className="text-yellow-300">HORAS</span> criando atividades!
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-xl mb-8 leading-relaxed">
            O DoraEduca cria atividades personalizadas, prontas para imprimir, em <strong>segundos</strong> — com Inteligência Artificial.
          </p>
          <button onClick={scrollToForm}
            className="bg-white text-orange-600 font-black text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all"
            style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}>
            🎉 Começar GRÁTIS agora
          </button>
          <p className="text-white/70 text-sm mt-3">Sem cartão de crédito • 5 atividades gratuitas</p>
        </div>

        {/* Imagem antes/depois */}
        <div className="max-w-2xl mx-auto px-4 pb-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/antes-depois.jpg" alt="Antes e depois do DoraEduca"
            className="w-full rounded-t-3xl shadow-2xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      </section>

      {/* ── DOR ── */}
      <section className="bg-[#FFF5E4] py-14 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/professora-horas.jpg" alt="Professora sobrecarregada"
              className="w-full max-w-sm mx-auto rounded-3xl shadow-xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-orange-500 font-black text-sm uppercase tracking-widest mb-3">A realidade de muitas professoras</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 leading-tight mb-6">
              Quanto tempo você perde <span className="text-orange-500">toda semana</span> criando atividades?
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { icon: "😓", text: "Horas pesquisando e adaptando conteúdo" },
                { icon: "🖨️", text: "Formatando para impressão manualmente" },
                { icon: "📚", text: "Tempo que poderia estar com seus alunos" },
                { icon: "😴", text: "Noites e fins de semana perdidos" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-orange-100">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-purple-600 font-black text-sm uppercase tracking-widest mb-2">Simples assim</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800">É assim que funciona</h2>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/como-funciona.jpg" alt="Como funciona o DoraEduca"
            className="w-full max-w-2xl mx-auto rounded-3xl shadow-xl mb-10"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: "1", color: "bg-amber-400", icon: "🖱️", title: "Escolha", desc: "Selecione a disciplina, série, tema e tipo de atividade" },
              { num: "2", color: "bg-purple-600", icon: "⚡", title: "Gere em segundos", desc: "A IA cria a atividade completa, alinhada à BNCC" },
              { num: "3", color: "bg-orange-500", icon: "🖨️", title: "Imprima", desc: "Baixe ou imprima diretamente. Pronto para a sala de aula!" },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center bg-gray-50 rounded-3xl p-6 border-2 border-gray-100">
                <div className={`${step.color} text-white font-black text-2xl w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-md`}>
                  {step.num}
                </div>
                <span className="text-3xl mb-2">{step.icon}</span>
                <h3 className="font-black text-gray-800 text-lg mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section className="py-14 px-4 bg-gradient-to-br from-purple-50 to-amber-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <p className="text-purple-600 font-black text-sm uppercase tracking-widest mb-3">Para qualquer professora</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 leading-tight mb-6">
              Não precisa saber<br /><span className="text-purple-600">tecnologia!</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "👆", color: "bg-purple-100 text-purple-700", title: "Fácil de usar", desc: "Interface simples. Você entende em segundos!" },
                { icon: "⚡", color: "bg-amber-100 text-amber-700", title: "Rápido", desc: "Atividades em menos de 10 segundos" },
                { icon: "✅", color: "bg-green-100 text-green-700", title: "Sem complicação", desc: "Tudo online. Não instala nada." },
                { icon: "📋", color: "bg-blue-100 text-blue-700", title: "Alinhado à BNCC", desc: "Conteúdo pedagógico de qualidade" },
                { icon: "🎒", color: "bg-pink-100 text-pink-700", title: "Todas as séries", desc: "Maternal ao 5º ano" },
                { icon: "📱", color: "bg-orange-100 text-orange-700", title: "No celular", desc: "Use em qualquer dispositivo" },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <span className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>{b.icon}</span>
                  <div>
                    <p className="font-black text-gray-800 text-sm">{b.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/nao-precisa-tecnologia.jpg" alt="Fácil de usar"
              className="w-full max-w-sm mx-auto rounded-3xl shadow-xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        </div>
      </section>

      {/* ── RESULTADO ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/atividade-pronta.jpg" alt="Atividade pronta para imprimir"
              className="w-full max-w-sm mx-auto rounded-3xl shadow-xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-orange-500 font-black text-sm uppercase tracking-widest mb-3">O resultado</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 leading-tight mb-4">
              Atividades <span className="text-orange-500">100% prontas</span><br />para a sala de aula
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Cada atividade é gerada com cabeçalho da escola, questões pedagógicas, espaços para resposta e pronta para imprimir — sem editar nada.
            </p>
            {[
              "✅ Com cabeçalho personalizado da sua escola",
              "✅ Alinhada à BNCC e à série escolhida",
              "✅ Download em PDF ou Word",
              "✅ Colorida, P&B ou para colorir",
            ].map((item) => (
              <p key={item} className="text-gray-700 font-semibold text-sm mb-2">{item}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE ── */}
      <section className="py-14 px-4 bg-gradient-to-br from-orange-500 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/use-celular.jpg" alt="Use no celular"
              className="w-full max-w-sm mx-auto rounded-3xl shadow-2xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
              Use direto do<br /><span className="text-yellow-300">seu celular!</span>
            </h2>
            <p className="text-white/85 text-lg mb-6">Sem computador. Sem complicação. Crie atividades onde você estiver.</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {[
                { icon: "🏠", label: "Em casa" },
                { icon: "🏫", label: "Na escola" },
                { icon: "🚌", label: "No transporte" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 text-sm font-bold">
                  <span>{l.icon}</span><span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTO / PROVA SOCIAL ── */}
      <section className="py-14 px-4 bg-[#FFF5E4]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/tenho-tudo-pronto.jpg" alt="Professora com DoraEduca"
              className="w-full max-w-sm mx-auto rounded-3xl shadow-xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-4xl mb-4">💬</div>
            <blockquote className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight mb-4">
              "Mas agora tenho <span className="text-orange-500">tudo pronto!</span>"
            </blockquote>
            <p className="text-gray-500 leading-relaxed mb-6">
              Professoras de todo o Brasil estão economizando horas toda semana com o DoraEduca — e usando esse tempo com o que realmente importa: seus alunos.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {["⭐⭐⭐⭐⭐", "Fácil demais!", "Economizei horas!", "Recomendo!"].map((t) => (
                <span key={t} className="bg-white rounded-xl px-3 py-1.5 text-sm font-bold text-gray-700 border border-gray-200 shadow-sm">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-purple-600 font-black text-sm uppercase tracking-widest mb-2">Planos para todos os bolsos</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800">Comece grátis, cresça no seu ritmo</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: "Gratuito", price: "R$ 0", period: "para sempre",
                color: "border-gray-200", btn: "bg-gray-700 hover:bg-gray-800",
                tag: null,
                features: ["5 atividades total", "Todas as disciplinas", "Visualização e impressão"],
              },
              {
                name: "Básico", price: "R$ 29,90", period: "/mês",
                color: "border-gray-200", btn: "bg-gray-800 hover:bg-gray-900",
                tag: null,
                features: ["50 atividades/mês", "Download Word e PDF", "Histórico 30 dias", "Todas as séries"],
              },
              {
                name: "Pro", price: "R$ 49,90", period: "/mês",
                color: "border-amber-400", btn: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
                tag: "⭐ Mais popular",
                features: ["100 atividades/mês", "Download Word e PDF", "Histórico completo", "Upload de modelos", "Suporte WhatsApp"],
              },
            ].map((plan) => (
              <div key={plan.name}
                className={`relative rounded-3xl border-2 ${plan.color} flex flex-col overflow-hidden ${plan.tag ? "shadow-xl ring-2 ring-amber-400 ring-offset-2" : "shadow-sm"}`}>
                {plan.tag && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black uppercase tracking-widest text-center py-2">
                    {plan.tag}
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <p className="font-black text-gray-800 text-base mb-1">{plan.name}</p>
                  <div className="mb-4">
                    <span className="font-black text-3xl text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-2 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => document.getElementById("comecar")?.scrollIntoView({ behavior: "smooth" })}
                    className={`w-full py-3 rounded-2xl text-white font-black text-sm transition-all active:scale-95 shadow-md ${plan.btn}`}>
                    Começar agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL + FORM ── */}
      <section id="comecar" className="py-16 px-4 bg-gradient-to-br from-purple-700 via-purple-800 to-[#3b0764]">
        <div className="max-w-lg mx-auto text-center mb-10">
          <span className="text-5xl">🍎</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">
            Comece agora.<br />É <span className="text-yellow-300">grátis!</span>
          </h2>
          <p className="text-purple-200 text-base">
            Crie sua conta em segundos e gere sua primeira atividade ainda hoje.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <AuthForm />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-xs">
        <p>© 2025 DoraEduca · Criando aulas mágicas para seus alunos 🍎</p>
        <p className="mt-1">🔒 Seus dados estão seguros e protegidos</p>
      </footer>

    </div>
  );
}
