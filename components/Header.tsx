"use client";

interface Props {
  userName?: string;
  onHistoryOpen?: () => void;
  onLogout?: () => void;
}

export default function Header({ userName, onHistoryOpen, onLogout }: Props) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 shadow-lg no-print">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <span className="absolute text-white/20 text-6xl top-1 left-6 rotate-[-15deg]">✏️</span>
        <span className="absolute text-white/20 text-5xl top-2 right-20 rotate-[12deg]">📚</span>
        <span className="absolute text-white/15 text-4xl bottom-1 left-1/4 rotate-[-8deg]">⭐</span>
        <span className="absolute text-white/15 text-3xl top-3 left-1/2 rotate-[20deg]">🌟</span>
        <span className="absolute text-white/20 text-4xl bottom-0 right-1/3 rotate-[-12deg]">🍎</span>
        <span className="absolute text-white/15 text-3xl top-2 right-40 rotate-[8deg]">🎨</span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
        {/* Logo and brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-white/90 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-md">
            <span className="text-2xl sm:text-3xl">🍎</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-wide drop-shadow-sm">
              DoraEduca
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm font-semibold hidden sm:block">
              Criando aulas mágicas para seus alunos
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {onHistoryOpen && (
            <button
              onClick={onHistoryOpen}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-3 py-2 rounded-xl border border-white/30 transition-all text-sm"
            >
              <span>📋</span>
              <span className="hidden sm:inline">Histórico</span>
            </button>
          )}

          {userName && (
            <div className="hidden md:flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/30">
              <span className="text-2xl">👩‍🏫</span>
              <div>
                <p className="text-white font-bold text-sm leading-tight">
                  {userName}
                </p>
                <p className="text-amber-100 text-xs">Bem-vinda!</p>
              </div>
            </div>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/25 text-white font-bold px-3 py-2 rounded-xl border border-white/20 transition-all text-sm"
              title="Sair"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 opacity-50" />
    </header>
  );
}
