"use client";

import { useRef } from "react";
import {
  ActivityConfig,
  UploadedFile,
  YEARS,
  TURNOS,
  ACTIVITY_TITLES,
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

const sectionClass = "bg-white rounded-2xl p-4 shadow-sm border border-amber-100";

export default function ActivityForm({
  config,
  onChange,
  onGenerate,
  loading,
  uploadedFiles,
  onFilesChange,
}: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof ActivityConfig, value: string | boolean) => {
    const updated = { ...config, [field]: value };
    if (field === "subject") {
      updated.activityType = ACTIVITY_TYPES[value as string]?.[0] ?? "";
    }
    onChange(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...config, logoBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const activityTypes = ACTIVITY_TYPES[config.subject] ?? [];
  const subject = SUBJECTS[config.subject];

  return (
    <aside className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4 no-print">
      {/* School info */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🏫</span>
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">
            Dados da Escola
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {/* Logo upload */}
          <div>
            <label className={labelClass}>Logo da Escola</label>
            <div className="flex items-center gap-2">
              {config.logoBase64 ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.logoBase64}
                    alt="Logo"
                    className="w-14 h-14 object-contain border-2 border-amber-200 rounded-xl bg-white"
                  />
                  <button
                    onClick={() => onChange({ ...config, logoBase64: "" })}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-amber-200 rounded-xl p-3 text-center cursor-pointer hover:border-amber-400 transition-colors"
                >
                  <p className="text-xs text-gray-400 font-semibold">📷 Carregar logo</p>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nome da Escola</label>
            <input
              className={inputClass}
              placeholder="Ex: E.M.E.F Santa Joana"
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
                placeholder="Ex: A"
                value={config.className}
                onChange={(e) => set("className", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Turno</label>
              <select
                className={inputClass}
                value={config.turno}
                onChange={(e) => set("turno", e.target.value)}
              >
                {TURNOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
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
            <label className={labelClass}>Tipo de Documento</label>
            <select
              className={inputClass}
              value={config.activityTitle}
              onChange={(e) => set("activityTitle", e.target.value)}
            >
              {ACTIVITY_TITLES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Série / Ano Escolar</label>
            <select
              className={inputClass}
              value={config.year}
              onChange={(e) => set("year", e.target.value)}
            >
              <optgroup label="Educação Infantil">
                {YEARS.slice(0, 4).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </optgroup>
              <optgroup label="Ensino Fundamental">
                {YEARS.slice(4).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </optgroup>
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
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Tema / Assunto</label>
            <input
              className={inputClass}
              placeholder={
                config.subject === "portugues"
                  ? "Ex: Família da Letra F"
                  : config.subject === "matematica"
                  ? "Ex: Números até 10"
                  : config.subject === "natureza"
                  ? "Ex: Dia e Noite"
                  : config.subject === "identidade"
                  ? "Ex: Quem sou eu"
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
            <label className={labelClass}>Quantidade de Questões</label>
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
          </div>

          {/* Toggle margem ABNT */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border-2 border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-600">Margem ABNT na impressão</p>
              <p className="text-xs text-gray-400">Linha fina nas bordas (3cm / 2cm)</p>
            </div>
            <button
              onClick={() => onChange({ ...config, hasMargem: !config.hasMargem })}
              className={`w-10 h-6 rounded-full transition-all relative ${
                config.hasMargem ? "bg-amber-400" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  config.hasMargem ? "left-5" : "left-1"
                }`}
              />
            </button>
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
          placeholder="Ex: Incluir exercício de desenho. Evitar palavras difíceis..."
          value={config.observations}
          onChange={(e) => onChange({ ...config, observations: e.target.value })}
        />
        {config.observations && (
          <p className="text-xs text-green-600 font-semibold mt-1">
            ✅ A IA vai considerar suas observações
          </p>
        )}
      </div>

      {/* Upload reference files */}
      <UploadSection files={uploadedFiles} onChange={onFilesChange} />

      {/* Generate button */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onGenerate}
          disabled={loading}
          className={`w-full py-5 rounded-2xl font-black text-lg text-white transition-all ${
            loading
              ? "bg-gray-300 cursor-not-allowed shadow-md"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95"
          }`}
          style={
            loading
              ? {}
              : {
                  boxShadow:
                    "0 6px 24px rgba(245,158,11,0.45), 0 2px 8px rgba(234,88,12,0.25)",
                }
          }
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Gerando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Gerar atividade pronta</span>
            </span>
          )}
        </button>
        {!loading && (
          <p className="text-center text-xs text-gray-400 font-medium tracking-wide">
            Pronto para imprimir em poucos segundos
          </p>
        )}
      </div>

      <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-3">
        <p className="text-xs font-bold text-blue-700 mb-1">💡 Dica</p>
        <p className="text-xs text-blue-600">
          Carregue a logo da escola e preencha o tema para atividades mais personalizadas!
        </p>
      </div>
    </aside>
  );
}
