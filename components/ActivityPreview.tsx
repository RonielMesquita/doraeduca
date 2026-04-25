"use client";

import { useRef, useState, useEffect } from "react";
import { ActivityConfig, SUBJECTS } from "@/lib/types";

const A4_HEIGHT_PX = 1123; // 297mm a 96dpi
const A4_PAPER_W = 794;   // 210mm a 96dpi

const LOADING_MESSAGES = [
  "Gerando sua atividade com IA...",
  "Organizando conteúdo e questões...",
  "Montando o cabeçalho escolar...",
  "Formatando para impressão...",
  "Finalizando os exercícios...",
];

const PREVIEW_PLANS = [
  {
    name: "Básico",
    price: "29,90",
    activities: "50",
    activityLabel: "atividades/mês",
    popular: false,
    color: "border-gray-200",
    btnClass: "bg-gray-700 hover:bg-gray-800",
    priceId: "price_1TPkvLF9J6QUlf0QiAnmRA7W",
    benefits: [
      "50 atividades por mês",
      "Atividades, avaliações e tarefas",
      "Download em Word e PDF",
      "Histórico dos últimos 30 dias",
      "Todas as disciplinas",
    ],
  },
  {
    name: "Pro",
    price: "49,90",
    activities: "100",
    activityLabel: "atividades/mês",
    popular: true,
    color: "border-amber-400",
    btnClass: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
    priceId: "price_1TPkwXF9J6QUlf0QNSUr6t4T",
    benefits: [
      "100 atividades por mês",
      "Atividades, avaliações, planos de aula",
      "Download em Word e PDF",
      "Histórico completo",
      "Upload de modelos de referência",
      "Suporte prioritário via WhatsApp",
    ],
  },
  {
    name: "Ilimitado",
    price: "99,00",
    activities: "∞",
    activityLabel: "sem limites",
    popular: false,
    color: "border-purple-300",
    btnClass: "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600",
    priceId: "price_1TPkxQF9J6QUlf0QJPUcfjbx",
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
  },
];

interface Props {
  config: ActivityConfig;
  activity: string | null;
  loading: boolean;
  source?: "ai" | "template" | null;
  feedback?: string;
  onFeedbackChange?: (feedback: string) => void;
  onRegenerate?: (feedback?: string) => void;
  limitReached?: boolean;
}

export default function ActivityPreview({
  config,
  activity,
  loading,
  source,
  feedback = "",
  onFeedbackChange,
  onRegenerate,
  limitReached = false,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHtml, setEditedHtml] = useState<string | null>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const paperWrapperRef = useRef<HTMLDivElement>(null);
  const [paperScale, setPaperScale] = useState(1);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderBlocks, setReorderBlocks] = useState<{ before: string; sections: string[]; after: string } | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdxRef = useRef<number | null>(null);

  const handleDownloadDocx = async () => {
    if (!activity) return;
    setDownloadingDocx(true);
    try {
      const response = await fetch("/api/export-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          activity,
          filename: `atividade-${config.subject}-${config.activityType.replace(/\s+/g, "-").toLowerCase()}`,
        }),
      });
      if (!response.ok) throw new Error("Falha");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `atividade-${config.subject}.docx`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Erro ao gerar .docx. Tente o botão 'Baixar editável'.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  useEffect(() => {
    if (!loading) { setLoadingMsgIdx(0); return; }
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const id = setInterval(() => setLoadingMsgIdx((i: number) => (i + 1) % LOADING_MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (limitReached) {
      mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [limitReached]);

  useEffect(() => {
    if (!contentRef.current || !activity) return;
    const height = contentRef.current.scrollHeight;
    const pages = Math.max(1, Math.ceil(height / A4_HEIGHT_PX));
    setPageCount(pages);
    const breaks: number[] = [];
    for (let i = 1; i < pages; i++) breaks.push(i * A4_HEIGHT_PX);
    setPageBreaks(breaks);
  }, [activity, loading]);

  useEffect(() => {
    setEditedHtml(null);
    setIsEditing(false);
    setIsReordering(false);
    setReorderBlocks(null);
  }, [activity]);

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.innerHTML = editedHtml ?? activity ?? "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  useEffect(() => {
    const el = paperWrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - 32;
      setPaperScale(Math.min(1, available / A4_PAPER_W));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleStartEdit = () => setIsEditing(true);

  const handleSaveEdit = () => {
    if (editableRef.current) setEditedHtml(editableRef.current.innerHTML);
    setIsEditing(false);
  };

  const handleCancelEdit = () => setIsEditing(false);

  function parseBlocks(html: string): { before: string; sections: string[]; after: string } {
    if (typeof window === "undefined") return { before: html, sections: [], after: "" };
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="r">${html}</div>`, "text/html");
    const root = doc.getElementById("r");
    if (!root) return { before: html, sections: [], after: "" };
    const children = Array.from(root.children) as HTMLElement[];

    // Estratégia 1: elementos com classe .activity-section
    const hasSections = children.some((el) => el.classList.contains("activity-section"));
    if (hasSections) {
      const before: string[] = [];
      const sections: string[] = [];
      let started = false;
      children.forEach((el) => {
        if (el.classList.contains("activity-section")) { started = true; sections.push(el.outerHTML); }
        else if (!started) before.push(el.outerHTML);
      });
      if (sections.length >= 2) return { before: before.join(""), sections, after: "" };
    }

    // Estratégia 2: agrupar por títulos H1/H2/H3 como delimitadores de seção
    const HEADINGS = new Set(["H1", "H2", "H3"]);
    if (children.some((el) => HEADINGS.has(el.tagName))) {
      const sections: string[] = [];
      let current: string[] = [];
      children.forEach((el) => {
        if (HEADINGS.has(el.tagName) && current.length > 0) {
          sections.push(current.join(""));
          current = [];
        }
        current.push(el.outerHTML);
      });
      if (current.length > 0) sections.push(current.join(""));
      if (sections.length >= 2) return { before: "", sections, after: "" };
    }

    // Estratégia 3: qualquer elemento block de nível superior com conteúdo
    const BLOCKS = new Set(["DIV", "SECTION", "ARTICLE", "P", "UL", "OL", "TABLE", "BLOCKQUOTE"]);
    const blocks = children.filter((el) => BLOCKS.has(el.tagName) && el.textContent?.trim());
    if (blocks.length >= 2) {
      return { before: "", sections: blocks.map((el) => el.outerHTML), after: "" };
    }

    return { before: html, sections: [], after: "" };
  }

  const handleStartReorder = () => {
    const html = editedHtml ?? activity ?? "";
    const parsed = parseBlocks(html);
    if (parsed.sections.length < 2) {
      alert("Não foi possível detectar blocos separados nesta atividade.\n\nO conteúdo parece estar em um único bloco contínuo, sem divisões que possam ser reordenadas.");
      return;
    }
    setReorderBlocks(parsed);
    setIsReordering(true);
  };

  const handleSaveReorder = () => {
    if (!reorderBlocks) return;
    const newHtml = [reorderBlocks.before, ...reorderBlocks.sections, reorderBlocks.after]
      .filter(Boolean)
      .join("\n");
    setEditedHtml(newHtml);
    setIsReordering(false);
    setReorderBlocks(null);
  };

  const handleCancelReorder = () => {
    setIsReordering(false);
    setReorderBlocks(null);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    if (!reorderBlocks) return;
    const n = idx + dir;
    if (n < 0 || n >= reorderBlocks.sections.length) return;
    const s = [...reorderBlocks.sections];
    [s[idx], s[n]] = [s[n], s[idx]];
    setReorderBlocks({ ...reorderBlocks, sections: s });
  };

  const handleDownloadHtml = () => {
    if (!activity) return;
    setDownloading(true);

    const subject = SUBJECTS[config.subject];
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${config.activityTitle} - ${subject?.label ?? config.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 780px; margin: 40px auto; padding: 0 24px; color: #111; }
    .header { border: 2px solid #555; margin-bottom: 24px; }
    .header-row { display: flex; border-bottom: 1px solid #555; }
    .header-cell { padding: 6px 10px; border-right: 1px solid #555; }
    .header-cell:last-child { border-right: none; }
    .header-logo { width: 56px; text-align: center; font-size: 24px; }
    .header-school { flex: 1; font-weight: 900; font-size: 14px; text-transform: uppercase; text-align: center; }
    .header-label { font-weight: bold; text-transform: uppercase; font-size: 11px; }
    .activity-title { text-align: center; margin: 20px 0; }
    .activity-title h1 { font-size: 16px; text-transform: uppercase; font-weight: 900; }
    .activity-title p { font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 4px 0 0; }
    .activity-section { margin-bottom: 20px; }
    .activity-subtitle { font-weight: 900; font-size: 14px; text-transform: uppercase; margin-bottom: 8px; }
    .activity-instruction { font-size: 13px; margin-bottom: 6px; }
    .answer-line { border-bottom: 1px solid #333; min-height: 24px; margin: 6px 0; }
    .figurinhas-grid { display: flex; flex-wrap: wrap; gap: 12px; margin: 10px 0; }
    .figurinha-card { border: 2px solid #ccc; border-radius: 10px; padding: 10px; text-align: center; min-width: 80px; }
    .figurinha-card.green { border-color: #4ade80; background: #f0fdf4; }
    .figurinha-card.blue { border-color: #60a5fa; background: #eff6ff; }
    .figurinha-card.yellow { border-color: #facc15; background: #fefce8; }
    .figurinha-card.pink { border-color: #f472b6; background: #fdf2f8; }
    .figurinha-emoji { font-size: 32px; display: block; }
    .figurinha-name { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 4px; }
    .figurinha-write { border-bottom: 1px solid #333; min-height: 20px; margin-top: 6px; }
    .word-box { display: inline-block; border: 2px solid #555; padding: 4px 12px; margin: 4px; font-weight: bold; border-radius: 6px; }
    .math-grid { display: grid; gap: 12px; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    td, th { border: 1px solid #555; padding: 6px 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-row">
      <div class="header-cell header-logo">${config.logoBase64 ? `<img src="${config.logoBase64}" style="width:48px;height:48px;object-fit:contain;" />` : "🏫"}</div>
      <div class="header-cell header-school">${config.schoolName || "NOME DA ESCOLA"}</div>
    </div>
    <div class="header-row">
      <div class="header-cell" style="flex:0 0 38%"><span class="header-label">PROFª:</span> ${config.teacherName}</div>
      <div class="header-cell"><span class="header-label">SÉRIE:</span> ${config.year}</div>
      <div class="header-cell"><span class="header-label">TURMA:</span> ${config.className}</div>
      <div class="header-cell"><span class="header-label">TURNO:</span> ${config.turno}</div>
    </div>
    <div class="header-row">
      <div class="header-cell" style="flex:1"><span class="header-label">ALUNO(A):</span> _______________________________________________</div>
      <div class="header-cell"><span class="header-label">DATA:</span> ${config.date}</div>
    </div>
  </div>

  <div class="activity-title">
    <h1>${config.activityTitle} — ${(subject?.label ?? config.subject).toUpperCase()}</h1>
    ${config.topic ? `<p>${config.topic.toUpperCase()}</p>` : ""}
  </div>

  ${activity}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atividade-${config.subject}-${config.activityType.replace(/\s+/g, "-").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setDownloading(false);
  };

  const subject = SUBJECTS[config.subject];

  return (
    <main ref={mainRef} className="flex-1 flex flex-col gap-3 min-w-0">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">
            Previa da Atividade
          </h2>
          {source && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                source === "ai"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {source === "ai" ? "IA" : "Modelo"}
            </span>
          )}
        </div>

        {activity && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
            {isEditing ? (
              <>
                <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 px-3 py-1.5 rounded-xl">
                  ✏️ Editando...
                </span>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:shadow-lg active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  ✓ Salvar edição
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:bg-gray-300 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  ✕ Cancelar
                </button>
              </>
            ) : isReordering ? (
              <>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-300 px-3 py-1.5 rounded-xl">
                  ↕ Reordenando blocos...
                </span>
                <button
                  onClick={handleSaveReorder}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:shadow-lg active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  ✓ Salvar ordem
                </button>
                <button
                  onClick={handleCancelReorder}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:bg-gray-300 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  ✕ Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-200">
                  📄 {pageCount} {pageCount === 1 ? "folha" : "folhas"}
                </span>
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:shadow-lg hover:from-amber-500 hover:to-orange-500 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={handleStartReorder}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-violet-400 text-white font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:shadow-lg hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  ↕ Reordenar
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  Imprimir / PDF
                </button>
                <button
                  onClick={handleDownloadDocx}
                  disabled={downloadingDocx}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:shadow-lg hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingDocx ? "Gerando..." : "Baixar .docx"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Inline upgrade plans — shown when free limit is reached */}
      {limitReached ? (
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-amber-100 no-print">
          {/* Header */}
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400 px-6 pt-6 pb-5 text-center">
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center">
                  <span className="text-amber-500 font-black text-xs">✓</span>
                </div>
              ))}
            </div>
            <h2 className="font-black text-white text-lg leading-tight">
              Você usou as 5 atividades gratuitas!
            </h2>
            <p className="text-amber-100 text-sm mt-1">
              Escolha o plano ideal e continue criando
            </p>
          </div>

          {/* Plans */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PREVIEW_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border-2 ${plan.color} flex flex-col overflow-hidden ${
                    plan.popular ? "shadow-xl ring-2 ring-amber-400 ring-offset-2" : "shadow-sm"
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5 px-3">
                      ⭐ Mais popular
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="font-black text-gray-800 text-sm mb-2">{plan.name}</p>
                    <div className="mb-1">
                      <span className="text-xs text-gray-400 font-semibold">R$</span>
                      <span className="font-black text-gray-900 text-2xl leading-none">{plan.price}</span>
                      <span className="text-xs text-gray-400 font-semibold">/mês</span>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black mb-3 w-fit ${
                      plan.popular
                        ? "bg-amber-100 text-amber-800"
                        : plan.activities === "∞"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      <span className="text-sm leading-none">{plan.activities === "∞" ? "∞" : "📝"}</span>
                      <span>{plan.activities} {plan.activityLabel}</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 flex-1 mb-4">
                      {plan.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-1 text-xs text-gray-600">
                          <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleCheckout(plan.priceId)}
                      disabled={checkoutLoading === plan.priceId}
                      className={`w-full py-2.5 rounded-xl text-white font-black text-sm transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${plan.btnClass}`}
                      style={plan.popular ? { boxShadow: "0 4px 16px rgba(245,158,11,0.4)" } : {}}
                    >
                      {checkoutLoading === plan.priceId ? "Aguarde..." : `Assinar ${plan.name}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">
                🔒 Pagamento seguro · Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      ) : (
      <div className="a4-preview-wrapper" ref={paperWrapperRef}>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <span className="text-3xl">✏️</span>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-40" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-700 text-base">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
            <p className="text-gray-400 text-xs mt-1.5">Aguarde alguns segundos</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      ) : (

      <div
        className="a4-scale-wrapper"
        style={{
          transform: `scale(${paperScale})`,
          transformOrigin: "top center",
          marginBottom: `-${pageCount * 1200 * (1 - paperScale)}px`,
        }}
      >
      <div
        ref={printRef}
        className="worksheet-container bg-white transition-all"
        style={{
          minHeight: `${A4_HEIGHT_PX}px`,
          // Simula margens ABNT: 3cm topo/esq, 2cm inf/dir (igual ao @page no print)
          padding: "113px 76px 76px 113px",
        }}
      >
        <div
          className="activity-inner-wrapper"
          style={{ padding: "8px 12px" }}
        >
        {!activity ? (
          <div className="py-6 px-2 sm:px-5">
            {/* Hint banner */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                <span>📄</span> Prévia do material gerado com IA
              </span>
            </div>

            {/* Heading */}
            <div className="text-center mb-5">
              <h2 className="font-black text-gray-800 text-lg sm:text-xl leading-tight">
                Crie atividades prontas em segundos
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
                Configure os dados ao lado e visualize aqui uma atividade organizada, bonita e pronta para imprimir.
              </p>
            </div>

            {/* Document mockup */}
            <div className="max-w-xs sm:max-w-sm mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
                {/* School header */}
                <div className="border-b-2 border-gray-300" style={{ fontFamily: "Arial, sans-serif" }}>
                  <div className="flex items-stretch border-b border-gray-300">
                    <div className="w-12 h-12 border-r border-gray-300 flex items-center justify-center text-gray-300 text-xl flex-shrink-0">🏫</div>
                    <div className="flex-1 flex items-center justify-center px-2 py-1">
                      <span className="font-black text-[10px] uppercase tracking-wide text-center text-gray-700">E.M.E.F. Exemplo do Saber</span>
                    </div>
                    <div className="w-14 h-12 border-l border-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] text-gray-300 text-center leading-tight px-1">foto do aluno</span>
                    </div>
                  </div>
                  <div className="flex border-b border-gray-300">
                    <div className="flex items-center gap-1 flex-1 px-2 py-1 border-r border-gray-300">
                      <span className="font-bold uppercase text-[9px] text-gray-500 shrink-0">PROFª</span>
                      <span className="text-[9px] font-semibold text-gray-600 ml-1">Professora Dora</span>
                    </div>
                    <div className="flex items-center gap-1 flex-1 px-2 py-1">
                      <span className="font-bold uppercase text-[9px] text-gray-500 shrink-0">DATA:</span>
                      <span className="text-[9px] font-semibold text-gray-500 ml-1">___/___/___</span>
                    </div>
                  </div>
                  <div className="flex border-b border-gray-300">
                    <div className="flex items-center gap-1 px-2 py-1 border-r border-gray-300">
                      <span className="font-bold uppercase text-[9px] text-gray-500 shrink-0">SÉRIE:</span>
                      <span className="text-[9px] font-semibold text-gray-600">2º Ano</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 border-r border-gray-300">
                      <span className="font-bold uppercase text-[9px] text-gray-500 shrink-0">TURMA:</span>
                      <span className="text-[9px] font-semibold text-gray-600">A</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1">
                      <span className="font-bold uppercase text-[9px] text-gray-500 shrink-0">TURNO:</span>
                      <span className="text-[9px] font-semibold text-gray-600">Manhã</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    <span className="font-bold uppercase text-[9px] text-gray-500 shrink-0">ALUNO(A):</span>
                    <div className="flex-1 border-b border-gray-400 h-3" />
                  </div>
                </div>

                {/* Activity title */}
                <div className="text-center py-2 px-3 border-b border-gray-100">
                  <p className="font-black text-[11px] uppercase tracking-wide text-gray-800">Atividade de Língua Portuguesa</p>
                  <p className="text-[9px] font-bold uppercase text-gray-500 mt-0.5">Família Silábica</p>
                </div>

                {/* Exercises */}
                <div className="px-3 py-2 flex flex-col gap-3 text-gray-700">
                  <div>
                    <p className="font-bold text-[10px] mb-1.5">1. Circule as palavras que começam com a letra <span className="text-amber-700 font-black">F</span>:</p>
                    <div className="flex gap-1.5 flex-wrap pl-2">
                      {["faca", "bola", "fada", "casa", "fogo"].map((word) => (
                        <span
                          key={word}
                          className={`border rounded px-1.5 py-0.5 text-[9px] font-bold ${word.startsWith("f") ? "border-amber-400 text-amber-700 bg-amber-50" : "border-gray-200 text-gray-400"}`}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-[10px] mb-1.5">2. Complete as sílabas que faltam:</p>
                    <div className="flex gap-4 pl-2">
                      {["__aca", "__ogo", "__orça"].map((s) => (
                        <span key={s} className="text-[9px] font-mono border-b border-gray-400 pb-0.5 text-gray-500 tracking-wide">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-[10px] mb-1.5">3. Ligue a imagem à palavra correta:</p>
                    <div className="flex items-center justify-around px-1">
                      <div className="flex flex-col gap-3">
                        <span className="text-lg leading-none">🦋</span>
                        <span className="text-lg leading-none">🦭</span>
                      </div>
                      <div className="flex flex-col gap-3 px-2">
                        {[0, 1].map((i) => (
                          <div key={i} className="flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full border border-gray-300" />
                            <div className="w-10 border-t border-dashed border-gray-200" />
                            <div className="w-1.5 h-1.5 rounded-full border border-gray-300" />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-wide">FOCA</span>
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-wide">BORBOLETA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stamp */}
                <div className="bg-gray-50 border-t border-gray-100 px-3 py-1.5 text-center">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                    ✦ Exemplo de atividade gerada pelo DoraEduca ✦
                  </span>
                </div>
              </div>
            </div>

            {/* Subject badges */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {[
                { label: "Português", emoji: "📖", color: "bg-amber-50 border-amber-300 text-amber-800" },
                { label: "Matemática", emoji: "🔢", color: "bg-blue-50 border-blue-300 text-blue-800" },
                { label: "Ciências", emoji: "🔬", color: "bg-green-50 border-green-300 text-green-800" },
                { label: "Avaliação", emoji: "📝", color: "bg-purple-50 border-purple-300 text-purple-800" },
                { label: "Plano de Aula", emoji: "📋", color: "bg-orange-50 border-orange-300 text-orange-800" },
              ].map((b) => (
                <span key={b.label} className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-2xl border-2 shadow-sm ${b.color}`}>
                  <span className="text-base">{b.emoji}</span>
                  <span>{b.label}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="print-area" ref={contentRef} style={{ position: "relative" }}>
            {/* School header — fiel ao modelo da professora */}
            <div className="border-2 border-gray-400 mb-4 sm:mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
              {/* Linha 1: logo + nome da escola */}
              <div className="flex items-stretch border-b border-gray-400">
                {config.logoBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.logoBase64}
                    alt="Logo"
                    className="w-14 h-14 object-contain border-r border-gray-400 p-1 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 border-r border-gray-400 flex items-center justify-center text-gray-300 text-2xl flex-shrink-0">🏫</div>
                )}
                <div className="flex-1 flex items-center justify-center px-3 py-1">
                  <span className="font-black text-sm sm:text-base uppercase tracking-wide text-center leading-tight">
                    {config.schoolName || "NOME DA ESCOLA"}
                  </span>
                </div>
              </div>

              {/* Linha 2: professora + série + turma + turno */}
              <div className="flex border-b border-gray-400 text-xs">
                <div className="flex items-center gap-1.5 px-2 py-1.5 border-r border-gray-400" style={{ flex: "0 0 38%" }}>
                  <span className="font-bold uppercase shrink-0">PROFª:</span>
                  <span className="font-semibold truncate">{config.teacherName}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1.5 border-r border-gray-400 shrink-0">
                  <span className="font-bold uppercase shrink-0">SÉRIE:</span>
                  <span className="font-semibold">{config.year}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1.5 border-r border-gray-400 shrink-0">
                  <span className="font-bold uppercase shrink-0">TURMA:</span>
                  <span className="font-semibold">{config.className}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1.5 shrink-0">
                  <span className="font-bold uppercase shrink-0">TURNO:</span>
                  <span className="font-semibold">{config.turno}</span>
                </div>
              </div>

              {/* Linha 3: aluno + data */}
              <div className="flex text-xs">
                <div className="flex items-center gap-1.5 flex-1 px-2 py-1.5 border-r border-gray-400">
                  <span className="font-bold uppercase shrink-0">ALUNO(A):</span>
                  <span className="border-b border-gray-500 flex-1" style={{ minHeight: "18px" }} />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1.5 shrink-0">
                  <span className="font-bold uppercase shrink-0">DATA:</span>
                  <span className="font-semibold">{config.date}</span>
                </div>
              </div>
            </div>

            {/* Activity title */}
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="font-black text-base sm:text-lg uppercase tracking-wide">
                {config.activityTitle} {subject?.label?.toUpperCase()}
              </h1>
              {config.topic && (
                <p className="text-sm font-bold uppercase mt-1 text-gray-700">{config.topic.toUpperCase()}</p>
              )}
            </div>

            {/* Edit / reorder mode banners */}
            {isEditing && (
              <div className="no-print mb-3 flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-amber-800 font-semibold">
                <span>✏️</span>
                <span>Clique em qualquer texto para editar. Salve ao terminar.</span>
              </div>
            )}
            {isReordering && (
              <div className="no-print mb-3 flex items-center gap-2 bg-indigo-50 border border-indigo-300 rounded-lg px-3 py-2 text-xs text-indigo-800 font-semibold">
                <span>↕</span>
                <span>Arraste os blocos ou use ▲▼ para reordenar. Salve ao terminar.</span>
              </div>
            )}

            {/* Activity content */}
            {isReordering && reorderBlocks ? (
              <div className="flex flex-col gap-2">
                {reorderBlocks.before && (
                  <div dangerouslySetInnerHTML={{ __html: reorderBlocks.before }} />
                )}
                {reorderBlocks.sections.map((section, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => { dragIdxRef.current = idx; }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                    onDrop={() => {
                      const from = dragIdxRef.current;
                      if (from === null || from === idx) { setDragOverIdx(null); return; }
                      setReorderBlocks((prev) => {
                        if (!prev) return prev;
                        const s = [...prev.sections];
                        const [moved] = s.splice(from, 1);
                        s.splice(idx, 0, moved);
                        return { ...prev, sections: s };
                      });
                      setDragOverIdx(null);
                      dragIdxRef.current = null;
                    }}
                    onDragEnd={() => { setDragOverIdx(null); dragIdxRef.current = null; }}
                    style={{
                      border: dragOverIdx === idx ? "2px dashed #6366f1" : "2px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "10px",
                      cursor: "grab",
                      background: dragOverIdx === idx ? "#eef2ff" : "white",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    <div
                      className="no-print flex items-center justify-between"
                      style={{ borderBottom: "1px dashed #e5e7eb", paddingBottom: "6px", marginBottom: "8px" }}
                    >
                      <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "bold", userSelect: "none" }}>
                        ⠿ Bloco {idx + 1}
                      </span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => moveSection(idx, -1)}
                          disabled={idx === 0}
                          style={{
                            padding: "2px 8px", borderRadius: "4px",
                            border: "1px solid #d1d5db",
                            background: idx === 0 ? "#f3f4f6" : "white",
                            color: idx === 0 ? "#d1d5db" : "#374151",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            fontSize: "12px", fontWeight: "bold",
                          }}
                        >▲</button>
                        <button
                          onClick={() => moveSection(idx, 1)}
                          disabled={idx === reorderBlocks.sections.length - 1}
                          style={{
                            padding: "2px 8px", borderRadius: "4px",
                            border: "1px solid #d1d5db",
                            background: idx === reorderBlocks.sections.length - 1 ? "#f3f4f6" : "white",
                            color: idx === reorderBlocks.sections.length - 1 ? "#d1d5db" : "#374151",
                            cursor: idx === reorderBlocks.sections.length - 1 ? "not-allowed" : "pointer",
                            fontSize: "12px", fontWeight: "bold",
                          }}
                        >▼</button>
                      </div>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: section }} />
                  </div>
                ))}
              </div>
            ) : isEditing ? (
              <div
                ref={editableRef}
                contentEditable
                suppressContentEditableWarning
                style={{
                  outline: "2px dashed #f59e0b",
                  borderRadius: "6px",
                  padding: "8px",
                  minHeight: "100px",
                }}
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: editedHtml ?? activity ?? "" }} />
            )}

            {/* Separadores de página — cinza, mimetiza borda da folha */}
            {pageBreaks.map((top: number, i: number) => (
              <div
                key={top}
                className="no-print"
                style={{
                  position: "absolute",
                  left: "-125px",
                  right: "-88px",
                  top: `${top}px`,
                  height: "24px",
                  background: "#b8bec7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <span style={{
                  fontSize: "9px",
                  color: "#6b7280",
                  fontWeight: "bold",
                  userSelect: "none",
                  letterSpacing: "0.05em",
                }}>
                  — Página {i + 2} —
                </span>
              </div>
            ))}

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-gray-200 print-footer" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
              <p className="text-xs text-gray-400 text-center">
                Bom trabalho!
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
      )}
      </div>
      )}

      {/* Feedback Section */}
      {activity && !loading && onRegenerate && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 no-print">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔄</span>
            <h3 className="font-bold text-gray-700 text-sm">
              Precisa de ajustes?
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              value={feedback}
              onChange={(e) => onFeedbackChange?.(e.target.value)}
              placeholder="Ex: Adicione mais 3 questoes, troque as imagens por outras, simplifique o texto..."
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-400 transition-colors"
              rows={2}
            />
            <button
              onClick={() => onRegenerate(feedback)}
              disabled={!feedback.trim()}
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold px-4 py-2 rounded-xl shadow hover:shadow-lg hover:from-amber-500 hover:to-orange-500 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Refazer com ajustes
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Descreva o que precisa ser corrigido e clique para gerar novamente
          </p>
        </div>
      )}

      <div className={`margem-borda-por-folha${config.hasMargem ? " ativa" : ""}`} aria-hidden="true" />
    </main>
  );
}
