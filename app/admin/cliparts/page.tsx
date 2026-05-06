"use client";

import { useRef, useState } from "react";

interface UploadResult {
  file: string;
  status: "ok" | "erro" | "duplicado";
  query?: string;
  error?: string;
}

export default function ClipartsAdminPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragging, setDragging] = useState(false);

  const uploadFiles = async (files: FileList) => {
    const arr = Array.from(files).filter((f) =>
      f.type.startsWith("image/") || f.name.match(/\.(png|jpg|jpeg|webp)$/i)
    );
    if (arr.length === 0) return;

    setUploading(true);
    setProgress({ done: 0, total: arr.length });
    setResults([]);

    const BATCH = 5;
    const newResults: UploadResult[] = [];

    for (let i = 0; i < arr.length; i += BATCH) {
      const batch = arr.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          try {
            const res = await fetch("/api/admin/cliparts", { method: "POST", body: fd });
            const data = await res.json();
            if (res.ok) {
              newResults.push({ file: file.name, status: "ok", query: data.query });
            } else if (res.status === 409 || data.error?.includes("duplicate")) {
              newResults.push({ file: file.name, status: "duplicado" });
            } else {
              newResults.push({ file: file.name, status: "erro", error: data.error });
            }
          } catch {
            newResults.push({ file: file.name, status: "erro", error: "Falha de rede" });
          }
        })
      );
      setProgress({ done: Math.min(i + BATCH, arr.length), total: arr.length });
      setResults([...newResults]);
    }

    setUploading(false);
  };

  const ok = results.filter((r) => r.status === "ok").length;
  const dup = results.filter((r) => r.status === "duplicado").length;
  const err = results.filter((r) => r.status === "erro").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-2xl text-gray-800">🖼️ Upload de Cliparts</h1>
            <p className="text-gray-400 text-sm mt-0.5">Imagens do pack para o modo colorir</p>
          </div>
          <a href="/admin" className="text-sm font-bold text-gray-500 border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm">
            ← Admin
          </a>
        </div>

        {/* Área de drop */}
        <div
          className={`border-4 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${dragging ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white hover:border-purple-300"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
        >
          <div className="text-5xl mb-3">🎨</div>
          <p className="font-black text-gray-700 text-lg">Arraste as imagens aqui</p>
          <p className="text-gray-400 text-sm mt-1">ou clique para selecionar — PNG, JPG, WEBP</p>
          <p className="text-xs text-gray-400 mt-2">Nome do arquivo vira a palavra-chave de busca</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
        </div>

        {/* Progresso */}
        {uploading && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-700">Enviando...</span>
              <span className="text-sm text-gray-500 font-bold">{progress.done} / {progress.total}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-purple-500 transition-all"
                style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Resumo */}
        {results.length > 0 && !uploading && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
              <div className="font-black text-2xl text-green-700">{ok}</div>
              <div className="text-xs font-bold text-green-600">Enviadas</div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
              <div className="font-black text-2xl text-yellow-700">{dup}</div>
              <div className="text-xs font-bold text-yellow-600">Duplicadas</div>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
              <div className="font-black text-2xl text-red-700">{err}</div>
              <div className="text-xs font-bold text-red-600">Erros</div>
            </div>
          </div>
        )}

        {/* Lista de resultados */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="font-black text-gray-700 text-sm uppercase">Resultado</h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="text-lg">
                    {r.status === "ok" ? "✅" : r.status === "duplicado" ? "🔁" : "❌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">{r.file}</p>
                    {r.query && <p className="text-[11px] text-gray-400">→ &quot;{r.query}&quot;</p>}
                    {r.error && <p className="text-[11px] text-red-400">{r.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <p className="font-black mb-1">💡 Como funciona</p>
          <p>O nome do arquivo vira a palavra-chave de busca. Ex: <strong>Little-Bunny.png</strong> → busca por <strong>&quot;little bunny&quot;</strong>.</p>
          <p className="mt-1">Quando a IA pedir uma imagem de coelho, o sistema encontra do pack antes de gerar com DALL-E.</p>
        </div>

      </div>
    </div>
  );
}
