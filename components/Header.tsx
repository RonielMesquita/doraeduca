export default function Header() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 shadow-lg">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <span className="absolute text-white/20 text-6xl top-1 left-6 rotate-[-15deg]">✏️</span>
        <span className="absolute text-white/20 text-5xl top-2 right-20 rotate-[12deg]">📚</span>
        <span className="absolute text-white/15 text-4xl bottom-1 left-1/4 rotate-[-8deg]">⭐</span>
        <span className="absolute text-white/15 text-3xl top-3 left-1/2 rotate-[20deg]">🌟</span>
        <span className="absolute text-white/20 text-4xl bottom-0 right-1/3 rotate-[-12deg]">🍎</span>
        <span className="absolute text-white/15 text-3xl top-2 right-40 rotate-[8deg]">🎨</span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
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
              Criando aulas magicas para seus alunos
            </p>
          </div>
        </div>

        {/* Welcome message */}
        <div className="hidden md:flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30">
          <div className="text-2xl">👩‍🏫</div>
          <div>
            <p className="text-white font-bold text-sm">Olá, Professora Dora!</p>
            <p className="text-amber-100 text-xs">Pronta para criar atividades incríveis?</p>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 opacity-50" />
    </header>
  );
}
