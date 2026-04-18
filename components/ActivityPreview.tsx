"use client";

import { useRef } from "react";
import { ActivityConfig, SUBJECTS } from "@/lib/types";

interface Props {
  config: ActivityConfig;
  activity: string | null;
  loading: boolean;
  source?: "ai" | "template" | null;
}

export default function ActivityPreview({
  config,
  activity,
  loading,
  source,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const subject = SUBJECTS[config.subject];
  const today = config.date || new Date().toLocaleDateString("pt-BR");

  return (
    <main className="flex-1 flex flex-col gap-3 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">
            Prévia da Atividade
          </h2>
          {source && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                source === "ai"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {source === "ai" ? "✨ IA" : "📝 Modelo"}
            </span>
          )}
        </div>

        {activity && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold px-4 py-2 rounded-xl shadow hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all text-sm"
          >
            🖨️ Imprimir / Salvar PDF
          </button>
        )}
      </div>

      {/* Sheet */}
      <div
        ref={printRef}
        className={`worksheet-container bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex-1 transition-all ${
          loading ? "opacity-50" : ""
        }`}
        style={{ minHeight: "700px" }}
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
          <div className="print-area">
            {/* School header - based on user model */}
            <div className="border-2 border-gray-800 mb-6">
              {/* Top row with school name and info boxes */}
              <div className="flex">
                {/* School name - left side */}
                <div className="flex-1 border-r-2 border-gray-800 p-3 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-black text-gray-800 uppercase tracking-wide">
                      {config.schoolName || "________________________________"}
                    </div>
                  </div>
                </div>
                {/* Info boxes - right side */}
                <div className="flex flex-col text-xs">
                  <div className="flex border-b border-gray-800">
                    <div className="border-r border-gray-800 px-2 py-1 font-bold bg-gray-50 w-16">
                      PROFª
                    </div>
                    <div className="px-2 py-1 min-w-[100px]">
                      {config.teacherName}
                    </div>
                  </div>
                  <div className="flex border-b border-gray-800">
                    <div className="border-r border-gray-800 px-2 py-1 font-bold bg-gray-50 w-16">
                      DATA:
                    </div>
                    <div className="px-2 py-1 min-w-[100px]">
                      {today}
                    </div>
                  </div>
                  <div className="flex border-b border-gray-800">
                    <div className="border-r border-gray-800 px-2 py-1 font-bold bg-gray-50 w-16">
                      SÉRIE:
                    </div>
                    <div className="px-2 py-1 min-w-[100px]">
                      {config.grade || config.year}
                    </div>
                  </div>
                  <div className="flex border-b border-gray-800">
                    <div className="border-r border-gray-800 px-2 py-1 font-bold bg-gray-50 w-16">
                      TURMA:
                    </div>
                    <div className="px-2 py-1 min-w-[100px]">
                      {config.className}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="border-r border-gray-800 px-2 py-1 font-bold bg-gray-50 w-16">
                      TURNO:
                    </div>
                    <div className="px-2 py-1 min-w-[100px]">
                      {config.shift || "Manhã"}
                    </div>
                  </div>
                </div>
              </div>
              {/* Student name row */}
              <div className="border-t-2 border-gray-800 flex text-sm">
                <div className="px-3 py-2 font-bold bg-gray-50 border-r border-gray-800">
                  ALUNO(A):
                </div>
                <div className="flex-1 px-3 py-2 border-b border-gray-400">
                </div>
              </div>
              {/* Activity title row */}
              <div className="border-t-2 border-gray-800 bg-gray-100 px-3 py-2 text-center">
                <span className="font-black text-gray-800 uppercase tracking-wide text-sm">
                  {config.activityType} — {subject?.label}
                </span>
              </div>
            </div>

            {/* Activity title */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{subject?.emoji}</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {subject?.label} — {config.activityType}
                </p>
                {config.topic && (
                  <p className="text-sm font-bold text-gray-600">{config.topic}</p>
                )}
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="text-xs text-gray-400">Nota:</span>
                <div className="w-20 border-b-2 border-gray-300" />
              </div>
            </div>

            {/* Activity content */}
            <div
              dangerouslySetInnerHTML={{ __html: activity }}
            />

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                ⭐ Bom trabalho, {config.year}!
              </p>
              <p className="text-xs text-gray-300">DoraEduca</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
