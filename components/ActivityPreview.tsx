"use client";

import { useRef, useState } from "react";
import { ActivityConfig, SUBJECTS } from "@/lib/types";

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
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    if (!printRef.current || !activity) return;
    
    setDownloading(true);
    try {
      const htmlContent = printRef.current.innerHTML;
      
      const response = await fetch("/api/export-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: htmlContent,
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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

      {/* Sheet */}
      <div
        ref={printRef}
        className={`worksheet-container bg-white rounded-2xl shadow-md border border-gray-100 flex-1 transition-all p-4 sm:p-6 lg:p-8 ${
          loading ? "opacity-50" : ""
        }`}
        style={{ minHeight: "500px" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-5xl animate-bounce-slow">✏️</div>
            <p className="font-bold text-gray-500 text-lg">
              Criando sua atividade...
            </p>
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        ) : !activity ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="text-6xl opacity-50">🎓</div>
            <div>
              <p className="font-black text-gray-400 text-xl">
                Sua atividade aparecerá aqui
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Configure e clique em &quot;✨ Gerar Atividade&quot;
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 opacity-40">
              <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">📖</div>
                <p className="text-xs font-bold text-gray-500">Português</p>
              </div>
              <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🔢</div>
                <p className="text-xs font-bold text-gray-500">Matemática</p>
              </div>
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🔬</div>
                <p className="text-xs font-bold text-gray-500">Ciências</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`print-area ${config.hasMargem ? "margem-folha" : ""}`}>
            {/* School header — fiel ao modelo da professora */}
            <div className="border-2 border-gray-400 mb-4 sm:mb-6" style={{ fontFamily: "Arial, sans-serif" }}>
              {/* Top row: logo + school name + photo box */}
              <div className="flex items-stretch border-b border-gray-400">
                {config.logoBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.logoBase64}
                    alt="Logo"
                    className="w-16 h-16 object-contain border-r border-gray-400 p-1"
                  />
                ) : (
                  <div className="w-16 h-16 border-r border-gray-400 flex items-center justify-center text-gray-300 text-2xl">🏫</div>
                )}
                <div className="flex-1 flex items-center justify-center px-2 py-1">
                  <span className="font-black text-sm sm:text-base uppercase tracking-wide text-center">
                    {config.schoolName || "NOME DA ESCOLA"}
                  </span>
                </div>
                <div className="w-20 h-16 border-l border-gray-400 flex items-center justify-center">
                  <span className="text-xs text-gray-300 text-center leading-tight px-1">foto do aluno</span>
                </div>
              </div>

              {/* Second row: teacher + date */}
              <div className="flex border-b border-gray-400 text-xs">
                <div className="flex items-center gap-1 flex-1 px-2 py-1 border-r border-gray-400">
                  <span className="font-bold uppercase shrink-0">PROFª</span>
                  <span className="border-b border-gray-400 flex-1 font-semibold">{config.teacherName}</span>
                </div>
                <div className="flex items-center gap-1 flex-1 px-2 py-1">
                  <span className="font-bold uppercase shrink-0">DATA:</span>
                  <span className="font-semibold">{config.date}</span>
                </div>
              </div>

              {/* Third row: série + turma + turno */}
              <div className="flex border-b border-gray-400 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 border-r border-gray-400">
                  <span className="font-bold uppercase shrink-0">SÉRIE:</span>
                  <span className="font-semibold">{config.year}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 border-r border-gray-400">
                  <span className="font-bold uppercase shrink-0">TURMA:</span>
                  <span className="font-semibold">{config.className}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1">
                  <span className="font-bold uppercase shrink-0">TURNO:</span>
                  <span className="font-semibold">{config.turno}</span>
                </div>
              </div>

              {/* Fourth row: student name */}
              <div className="flex items-center gap-1 px-2 py-1 text-xs">
                <span className="font-bold uppercase shrink-0">ALUNO(A):</span>
                <span className="border-b border-gray-400 flex-1" />
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
            <div
              dangerouslySetInnerHTML={{ __html: activity }}
            />

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 print-footer">
              <p className="text-xs text-gray-400 text-center">
                Bom trabalho!
              </p>
            </div>
          </div>
        )}
      </div>

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
    </main>
  );
}
