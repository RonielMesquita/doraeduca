"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

const BENEFITS = [
  "Atividades ilimitadas todo mês",
  "Todos os tipos: atividade, avaliação, plano de aula",
  "Download em Word e PDF",
  "Histórico completo salvo",
  "Suporte prioritário via WhatsApp",
];

export default function UpgradeModal({ open, onClose }: Props) {
  if (!open) return null;

  const handleSubscribe = () => {
    // TODO: substituir pelo número real ou link do Stripe
    window.open(
      "https://wa.me/5511999999999?text=Ol%C3%A1%21+Quero+assinar+o+DoraEduca+Pro+%F0%9F%8D%8E",
      "_blank"
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400 px-8 pt-8 pb-7 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
          >
            ✕
          </button>

          {/* 5/5 usage dots */}
          <div className="flex justify-center gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                <span className="text-amber-500 font-black text-sm">✓</span>
              </div>
            ))}
          </div>

          <h2 className="font-black text-white text-2xl leading-tight">
            Você usou as 5 atividades
          </h2>
          <h2 className="font-black text-white text-2xl leading-tight">
            do plano gratuito!
          </h2>
          <p className="text-amber-100 text-sm mt-2">
            Assine e crie quantas quiser, sem limites
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6">

          {/* Benefits */}
          <ul className="flex flex-col gap-2.5 mb-6">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold text-base leading-none mt-0.5 flex-shrink-0">✅</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* Pricing card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 text-center mb-6">
            <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">
              DoraEduca Pro
            </p>
            <p className="font-black text-gray-800 text-4xl leading-none">
              R$&nbsp;29<span className="text-2xl">,90</span>
              <span className="text-sm font-semibold text-gray-400">/mês</span>
            </p>
            <p className="text-xs text-gray-500 mt-1.5">
              ou{" "}
              <span className="font-bold text-gray-700">R$ 197/ano</span>{" "}
              <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full">
                economia de 45%
              </span>
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            className="w-full py-4 text-white font-black text-lg rounded-2xl active:scale-95 transition-all mb-3"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              boxShadow: "0 6px 24px rgba(245,158,11,0.45), 0 2px 8px rgba(234,88,12,0.25)",
            }}
          >
            ✨ Quero assinar agora
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-50"
          >
            Continuar no plano gratuito
          </button>
        </div>
      </div>
    </div>
  );
}
