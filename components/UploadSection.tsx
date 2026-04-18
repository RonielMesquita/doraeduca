"use client";

import { useRef, useState } from "react";
import { UploadedFile } from "@/lib/types";

interface Props {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

export default function UploadSection({ files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      if (!ACCEPTED.includes(file.type)) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        const newFile: UploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          mediaType: file.type as UploadedFile["mediaType"],
          base64,
          preview: file.type.startsWith("image/") ? dataUrl : "",
        };
        onChange([...files, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const remove = (id: string) => onChange(files.filter((f) => f.id !== id));

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📂</span>
        <div>
          <h2 className="font-black text-gray-700 text-sm uppercase tracking-wide">
            Modelos de Referência
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            A IA aprende seu formato e estilo
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          dragging
            ? "border-amber-400 bg-amber-50"
            : "border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-50"
        }`}
      >
        <div className="text-2xl mb-1">📎</div>
        <p className="text-xs font-bold text-gray-500">
          Arraste atividades aqui
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          JPG, PNG ou PDF
        </p>
        <button className="mt-2 text-xs font-bold text-amber-600 underline">
          ou clique para selecionar
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {/* Uploaded files */}
      {files.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs font-bold text-green-700">
            ✅ {files.length} modelo{files.length > 1 ? "s" : ""} carregado{files.length > 1 ? "s" : ""}
          </p>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100"
            >
              {file.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-red-50 rounded-lg border border-red-100 flex items-center justify-center flex-shrink-0 text-lg">
                  📄
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {file.mediaType === "application/pdf" ? "PDF" : "Imagem"}
                </p>
              </div>
              <button
                onClick={() => remove(file.id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                title="Remover"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-2 bg-purple-50 rounded-xl p-2">
          <p className="text-xs text-purple-700 font-semibold">
            ✨ A IA vai usar esses modelos para replicar o cabeçalho, o estilo visual e os tipos de exercícios da Professora Dora.
          </p>
        </div>
      )}
    </div>
  );
}
