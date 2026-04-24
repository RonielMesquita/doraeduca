"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
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
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        setEmailSent(email);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
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
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError("Não foi possível conectar com o Google. Tente novamente.");
      setLoadingGoogle(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-teacher-warm flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <span className="absolute text-8xl opacity-10 top-10 left-10 rotate-[-15deg]">✏️</span>
          <span className="absolute text-7xl opacity-10 top-20 right-20 rotate-[12deg]">📚</span>
          <span className="absolute text-6xl opacity-10 bottom-20 left-1/4 rotate-[-8deg]">⭐</span>
          <span className="absolute text-7xl opacity-10 bottom-10 right-1/3 rotate-[-12deg]">🍎</span>
        </div>
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl p-4 shadow-xl mb-4">
              <span className="text-5xl">🍎</span>
            </div>
            <h1 className="text-4xl font-black text-gray-800 tracking-wide">DoraEduca</h1>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Verifique seu e-mail</h2>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              Enviamos um e-mail de confirmação para:
            </p>
            <p className="font-black text-amber-600 text-base mb-5 bg-amber-50 rounded-xl px-4 py-2 break-all">
              {emailSent}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Acesse sua caixa de entrada e clique no link que enviamos para ativar sua conta. Caso não encontre, verifique também a pasta de spam.
            </p>
            <button
              onClick={() => { setEmailSent(""); setMode("login"); setEmail(""); setPassword(""); setName(""); }}
              className="w-full py-3 rounded-2xl font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95 shadow-md"
            >
              Já confirmei, ir para o login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teacher-warm flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none">
        <span className="absolute text-8xl opacity-10 top-10 left-10 rotate-[-15deg]">✏️</span>
        <span className="absolute text-7xl opacity-10 top-20 right-20 rotate-[12deg]">📚</span>
        <span className="absolute text-6xl opacity-10 bottom-20 left-1/4 rotate-[-8deg]">⭐</span>
        <span className="absolute text-7xl opacity-10 bottom-10 right-1/3 rotate-[-12deg]">🍎</span>
        <span className="absolute text-5xl opacity-10 top-1/2 left-16 rotate-[20deg]">🌟</span>
        <span className="absolute text-6xl opacity-10 top-1/3 right-10 rotate-[8deg]">🎨</span>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl p-4 shadow-xl mb-4">
            <span className="text-5xl">🍎</span>
          </div>
          <h1 className="text-4xl font-black text-gray-800 tracking-wide">DoraEduca</h1>
          <p className="text-gray-500 font-semibold mt-1">
            Criando aulas mágicas para seus alunos
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-amber-100">
          <h2 className="text-2xl font-black text-gray-700 mb-6 text-center">
            {mode === "login" ? "Entrar na sua conta" : "Criar nova conta"}
          </h2>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 font-bold text-gray-700 text-sm shadow-sm mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loadingGoogle ? "Conectando..." : "Continuar com Google"}
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Professora Dora"
                  className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sua@escola.com"
                className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-amber-400 transition-colors"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 pr-12 text-sm font-semibold text-gray-700 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-600">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "⏳ Aguarde..." : mode === "login" ? "✨ Entrar" : "🎉 Criar Conta"}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">
              {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                  setEmailSent("");
                  setEmail("");
                  setPassword("");
                  setName("");
                }}
                className="font-bold text-amber-600 hover:text-amber-700 underline"
              >
                {mode === "login" ? "Criar conta grátis" : "Entrar"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 Seus dados estão seguros e protegidos
        </p>
      </div>
    </div>
  );
}
