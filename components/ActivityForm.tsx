"use client";

import {
  ActivityConfig,
  UploadedFile,
  YEARS,
  SUBJECTS,
  ACTIVITY_TYPES,
} from "@/lib/types";
import UploadSection from "./UploadSection";

interface Props {
  config: ActivityConfig;
  onChange: (config: ActivityConfig) => void;
  onGenerate: () => void;
  loading: boolean;
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

const inputClass =
  "w-full rounded-xl border-2 border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-amber-400 transition-colors";

const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1";

const sectionClass =
  "bg-white rounded-2xl p-4 shadow-sm border border-amber-100";

export default function ActivityForm({
  config,
  onChange,
  onGenerate,
  loading,
  uploadedFiles,
  onFilesChange,
}: Props) {
  const set = (field: keyof ActivityConfig, value: string) => {
    const updated = { ...config, [field]: value };
    if (field === "subject") {
      updated.activityType = ACTIVITY_TYPES[value]?.[0] ?? "";
    }
    onChange(updated);
  };

  const activityTypes = ACTIVITY_TYPES[config.subject] ?? [];
  const subject = SUBJECTS[config.subject];

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 no-print">
      {/* School info */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🏫</span>
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">
            Dados da Escola
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>Nome da Escola</label>
            <input
              className={inputClass}
              placeholder="Ex: E.M. Monteiro Lobato"
              value={config.schoolName}
              onChange={(e) => set("schoolName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Professora</label>
            <input
              className={inputClass}
              value={config.teacherName}
              onChange={(e) => set("teacherName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Turma</label>
              <input
                className={inputClass}
                placeholder="Ex: Turma A"
                value={config.className}
                onChange={(e) => set("className", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Data</label>
              <input
                className={inputClass}
                value={config.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity config */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✏️</span>
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">
            Configurar Atividade
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>Ano Escolar</label>
            <select
              className={inputClass}
              value={config.year}
              onChange={(e) => set("year", e.target.value)}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Disciplina</label>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(SUBJECTS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => set("subject", key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    config.subject === key
                      ? "border-amber-400 bg-amber-50 text-amber-800 shadow-sm"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-amber-200"
                  }`}
                >
                  <span>{val.emoji}</span>
                  <span>{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Tipo de Atividade</label>
            <select
              className={inputClass}
              value={config.activityType}
              onChange={(e) => set("activityType", e.target.value)}
            >
              {activityTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Tema / Assunto</label>
            <input
              className={inputClass}
              placeholder={
                config.subject === "portugues"
                  ? "Ex: Família da Letra B"
                  : config.subject === "matematica"
                  ? "Ex: Tabuada do 3"
                  : "Ex: Animais da Fazenda"
              }
              value={config.topic}
              onChange={(e) => set("topic", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Dificuldade</label>
            <div className="flex gap-2">
              {["Fácil", "Médio", "Difícil"].map((d) => (
                <button
                  key={d}
                  onClick={() => set("difficulty", d)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    config.difficulty === d
                      ? d === "Fácil"
                        ? "bg-green-100 border-green-400 text-green-800"
                        : d === "Médio"
                        ? "bg-amber-100 border-amber-400 text-amber-800"
                        : "bg-red-100 border-red-400 text-red-800"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {d === "Fácil" ? "😊" : d === "Médio" ? "🤔" : "🔥"} {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Quantidade de Questoes</label>
            <div className="flex gap-2 flex-wrap">
              {[3, 5, 7, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange({ ...config, questionCount: n })}
                  className={`flex-1 py-2 rounded-xl text-sm font-black border-2 transition-all ${
                    config.questionCount === n
                      ? "bg-amber-100 border-amber-400 text-amber-800 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              questoes na atividade (maximo 10)
            </p>
          </div>
        </div>
      </div>

      {/* Observations */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💬</span>
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">
            Observações
          </h2>
        </div>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Ex: Incluir exercício de desenho no final. Evitar palavras difíceis. Colocar espaço para o aluno escrever o nome..."
          value={config.observations}
          onChange={(e) => onChange({ ...config, observations: e.target.value })}
        />
        {config.observations && (
          <p className="text-xs text-green-600 font-semibold mt-1">
            ✅ A IA vai considerar suas observações
          </p>
        )}
      </div>

      {/* Image Search Option */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🖼️</span>
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">
            Imagens
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...config, useGoogleImages: !config.useGoogleImages })}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
            config.useGoogleImages
              ? "bg-green-50 border-green-400 text-green-800"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">{config.useGoogleImages ? "🌐" : "🎨"}</span>
            <span className="font-bold text-sm">
              {config.useGoogleImages ? "Buscar imagens reais" : "Usar imagens geradas"}
            </span>
          </span>
          <span
            className={`w-12 h-6 rounded-full relative transition-colors ${
              config.useGoogleImages ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                config.useGoogleImages ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </span>
        </button>
        <p className="text-xs text-gray-500 mt-2">
          {config.useGoogleImages
            ? "🌐 Busca cliparts e ilustrações educacionais na internet (Google)"
            : "🎨 Gera imagens com IA (Pollinations.ai)"}
        </p>
      </div>

      {/* Upload reference files */}
      <UploadSection files={uploadedFiles} onChange={onFilesChange} />

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={loading}
        className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all ${
          loading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl active:scale-95"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Gerando...
          </span>
        ) : (
          <span>✨ Gerar Atividade</span>
        )}
      </button>

      {/* Tips */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-3">
        <p className="text-xs font-bold text-blue-700 mb-1">💡 Dica</p>
        <p className="text-xs text-blue-600">
          Preencha o tema para uma atividade mais personalizada. Com a IA
          conectada, as atividades ficam ainda mais ricas!
        </p>
      </div>
    </aside>
  );
}
