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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
        setSuccess("Conta criada! Verifique seu e-mail para confirmar.");
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

            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3 text-sm font-semibold text-green-600">
                ✅ {success}
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
                  setSuccess("");
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
