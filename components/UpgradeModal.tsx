"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    name: "Básico",
    price: "29,90",
    activities: "50",
    activityLabel: "atividades/mês",
    popular: false,
    color: "border-gray-200",
    btnClass: "bg-gray-700 hover:bg-gray-800",
    benefits: [
      "50 atividades por mês",
      "Atividades, avaliações e tarefas",
      "Download em Word e PDF",
      "Histórico dos últimos 30 dias",
      "Todas as disciplinas",
    ],
    waMsg: "Ol%C3%A1%21+Quero+assinar+o+Plano+B%C3%A1sico+do+DoraEduca+%28R%2429%2C90%2Fm%C3%AAs+-+50+atividades%29+%F0%9F%8D%8E",
  },
  {
    name: "Pro",
    price: "49,90",
    activities: "100",
    activityLabel: "atividades/mês",
    popular: true,
    color: "border-amber-400",
    btnClass: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    benefits: [
      "100 atividades por mês",
      "Atividades, avaliações, planos de aula",
      "Download em Word e PDF",
      "Histórico completo",
      "Upload de modelos de referência",
      "Suporte prioritário via WhatsApp",
    ],
    waMsg: "Ol%C3%A1%21+Quero+assinar+o+Plano+Pro+do+DoraEduca+%28R%2449%2C90%2Fm%C3%AAs+-+100+atividades%29+%F0%9F%8D%8E",
  },
  {
    name: "Ilimitado",
    price: "99,00",
    activities: "∞",
    activityLabel: "sem limites",
    popular: false,
    color: "border-purple-300",
    btnClass: "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600",
    benefits: [
      "Atividades ilimitadas",
      "Todos os tipos de documento",
      "Download em Word e PDF",
      "Histórico completo permanente",
      "Upload de modelos de referência",
      "Suporte VIP via WhatsApp",
      "Acesso antecipado a novidades",
      "Personalização avançada com IA",
    ],
    waMsg: "Ol%C3%A1%21+Quero+assinar+o+Plano+Ilimitado+do+DoraEduca+%28R%2499%2C00%2Fm%C3%AAs%29+%F0%9F%8D%8E",
  },
];

// TODO: substituir pelo número real do WhatsApp
const WA_BASE = "https://wa.me/5511999999999?text=";

export default function UpgradeModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400 px-6 sm:px-8 pt-7 pb-6 text-center rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
          >
            ✕
          </button>

          {/* 5/5 dots */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
                <span className="text-amber-500 font-black text-xs">✓</span>
              </div>
            ))}
          </div>

          <h2 className="font-black text-white text-xl sm:text-2xl leading-tight">
            Você usou as 5 atividades gratuitas!
          </h2>
          <p className="text-amber-100 text-sm mt-1.5">
            Escolha o plano ideal e continue criando
          </p>
        </div>

        {/* Plans */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 ${plan.color} flex flex-col overflow-hidden ${
                  plan.popular ? "shadow-xl ring-2 ring-amber-400 ring-offset-2" : "shadow-sm"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5 px-3">
                    ⭐ Mais popular
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Plan name */}
                  <p className="font-black text-gray-800 text-base mb-3">{plan.name}</p>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="text-xs text-gray-400 font-semibold">R$</span>
                    <span className="font-black text-gray-900 text-3xl leading-none">{plan.price}</span>
                    <span className="text-xs text-gray-400 font-semibold">/mês</span>
                  </div>

                  {/* Activity count */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-4 w-fit ${
                    plan.popular
                      ? "bg-amber-100 text-amber-800"
                      : plan.activities === "∞"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    <span className="text-base leading-none">{plan.activities === "∞" ? "∞" : "📝"}</span>
                    <span>{plan.activities} {plan.activityLabel}</span>
                  </div>

                  {/* Benefits */}
                  <ul className="flex flex-col gap-2 flex-1 mb-5">
                    {plan.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => window.open(`${WA_BASE}${plan.waMsg}`, "_blank")}
                    className={`w-full py-3 rounded-xl text-white font-black text-sm transition-all active:scale-95 shadow-md hover:shadow-lg ${plan.btnClass}`}
                    style={plan.popular ? { boxShadow: "0 4px 16px rgba(245,158,11,0.4)" } : {}}
                  >
                    Assinar {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-5">
            <p className="text-xs text-gray-400 mb-3">
              🔒 Pagamento seguro · Cancele quando quiser
            </p>
            <button
              onClick={onClose}
              className="text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors hover:underline underline-offset-2"
            >
              Continuar no plano gratuito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
