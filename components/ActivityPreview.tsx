"use client";

import { useRef, useState, useEffect } from "react";
import { ActivityConfig, SUBJECTS } from "@/lib/types";

const A4_HEIGHT_PX = 1056; // altura A4 impressa a ~96dpi com margin 18mm

const LOADING_MESSAGES = [
  "Gerando sua atividade com IA...",
  "Organizando conteúdo e questões...",
  "Montando o cabeçalho escolar...",
  "Formatando para impressão...",
  "Finalizando os exercícios...",
];

interface Props {
  config: ActivityConfig;
  activity: string | null;
  loading: boolean;
  source?: "ai" | "template" | null;
  feedback?: string;
  onFeedbackChange?: (feedback: string) => void;
  onRegenerate?: (feedback?: string) => void;
}

export default function ActivityPreview({
  config,
  activity,
  loading,
  source,
  feedback = "",
  onFeedbackChange,
  onRegenerate,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!loading) { setLoadingMsgIdx(0); return; }
    const id = setInterval(() => setLoadingMsgIdx((i: number) => (i + 1) % LOADING_MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (!contentRef.current || !activity) return;
    const height = contentRef.current.scrollHeight;
    const pages = Math.max(1, Math.ceil(height / A4_HEIGHT_PX));
    setPageCount(pages);
    const breaks: number[] = [];
    for (let i = 1; i < pages; i++) breaks.push(i * A4_HEIGHT_PX);
    setPageBreaks(breaks);
  }, [activity, loading]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    if (!activity) return;

    setDownloading(true);
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

      if (!response.ok) {
        throw new Error("Falha ao gerar documento");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `atividade-${config.subject}-${config.activityType.replace(/\s+/g, "-").toLowerCase()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar Word:", error);
      alert("Erro ao gerar arquivo Word. Tente novamente.");
    } finally {
      setDownloading(false);
    }
  };

  const subject = SUBJECTS[config.subject];

  return (
    <main className="flex-1 flex flex-col gap-3 min-w-0">
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
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-200">
              📄 {pageCount} {pageCount === 1 ? "folha" : "folhas"}
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center"
            >
              Imprimir / PDF
            </button>
            <button
              onClick={handleDownloadWord}
              disabled={downloading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 sm:px-4 py-2 rounded-xl shadow hover:shadow-lg hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? "Gerando..." : "Baixar Word"}
            </button>
          </div>
        )}
      </div>

      {/* Sheet — A4 page preview wrapper */}
      <div className="a4-preview-wrapper">
      <div
        ref={printRef}
        className="worksheet-container bg-white flex-1 transition-all"
        style={{ minHeight: "500px" }}
      >
        <div
          className="activity-inner-wrapper"
          style={{ padding: "12px 16px" }}
        >
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
        ) : !activity ? (
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
            <div className="flex flex-wrap gap-1.5 justify-center mt-5">
              {[
                { label: "Português", emoji: "📖", color: "bg-amber-50 border-amber-200 text-amber-700" },
                { label: "Matemática", emoji: "🔢", color: "bg-blue-50 border-blue-200 text-blue-700" },
                { label: "Ciências", emoji: "🔬", color: "bg-green-50 border-green-200 text-green-700" },
                { label: "Avaliação", emoji: "📝", color: "bg-purple-50 border-purple-200 text-purple-700" },
                { label: "Plano de Aula", emoji: "📋", color: "bg-orange-50 border-orange-200 text-orange-700" },
              ].map((b) => (
                <span key={b.label} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${b.color}`}>
                  {b.emoji} {b.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="print-area" ref={contentRef} style={{ position: "relative" }}>
            {/* School header — fiel ao modelo da professora */}
            <div className="border-2 border-gray-400 mb-4 sm:mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
              {/* Top row: logo + school name */}
              <div className="flex items-stretch border-b border-gray-400">
                {config.logoBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.logoBase64}
                    alt="Logo"
                    className="w-16 h-16 object-contain border-r border-gray-400 p-1 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 border-r border-gray-400 flex items-center justify-center text-gray-300 text-2xl flex-shrink-0">🏫</div>
                )}
                <div className="flex-1 flex items-center justify-center px-3 py-2">
                  <span className="font-black text-sm sm:text-base uppercase tracking-wide text-center">
                    {config.schoolName || "NOME DA ESCOLA"}
                  </span>
                </div>
              </div>

              {/* Second row: teacher + date */}
              <div className="flex border-b border-gray-400 text-xs">
                <div className="flex items-center gap-2 px-3 py-1.5 border-r border-gray-400" style={{ flex: "0 0 60%" }}>
                  <span className="font-bold uppercase shrink-0">PROFª:</span>
                  <span className="border-b border-gray-400 flex-1 font-semibold pb-0.5">{config.teacherName}</span>
                </div>
                <div className="flex items-center gap-2 flex-1 px-3 py-1.5">
                  <span className="font-bold uppercase shrink-0">DATA:</span>
                  <span className="font-semibold">{config.date}</span>
                </div>
              </div>

              {/* Third row: série + turma + turno */}
              <div className="flex text-xs">
                <div className="flex items-center gap-2 px-3 py-1.5 border-r border-gray-400">
                  <span className="font-bold uppercase shrink-0">SÉRIE:</span>
                  <span className="font-semibold">{config.year}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 border-r border-gray-400">
                  <span className="font-bold uppercase shrink-0">TURMA:</span>
                  <span className="font-semibold">{config.className}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="font-bold uppercase shrink-0">TURNO:</span>
                  <span className="font-semibold">{config.turno}</span>
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

            {/* Activity content */}
            <div dangerouslySetInnerHTML={{ __html: activity }} />

            {/* Linhas de divisão de página no preview (some na impressão) */}
            {pageBreaks.map((top) => (
              <div
                key={top}
                className="no-print"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${top}px`,
                  borderTop: "2px dashed #ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <span style={{
                  background: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                  padding: "1px 6px",
                  borderRadius: "0 0 4px 4px",
                }}>
                  QUEBRA DE PÁGINA
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
        </div>{/* fecha inner wrapper */}
      </div>{/* fecha worksheet-container */}
      </div>{/* fecha a4-preview-wrapper */}

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
