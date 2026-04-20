"use client";

import { useEffect, useState } from "react";
import { ActivityConfig, SUBJECTS } from "@/lib/types";

interface HistoryItem {
  id: string;
  config: ActivityConfig;
  subject: string;
  topic: string;
  title: string;
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onLoad: (config: ActivityConfig, activity: string) => void;
}

export default function HistoryPanel({ open, onClose, onLoad }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchHistory();
  }, [open]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setItems(data.activities ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (item: HistoryItem) => {
    setLoadingId(item.id);
    try {
      const res = await fetch(`/api/history/${item.id}`);
      const data = await res.json();
      onLoad(data.config, data.activity);
      onClose();
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 no-print"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col no-print">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="font-black text-white text-lg">Histórico</h2>
              <p className="text-amber-100 text-xs">
                Suas atividades geradas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <span className="text-3xl animate-spin">⏳</span>
              <p className="text-gray-400 font-semibold text-sm">Carregando...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <span className="text-5xl opacity-30">📭</span>
              <p className="text-gray-400 font-bold">Nenhuma atividade ainda</p>
              <p className="text-gray-300 text-xs">
                Gere sua primeira atividade e ela aparecerá aqui
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const subject = SUBJECTS[item.subject];
                return (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-amber-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-2xl shrink-0">
                          {subject?.emoji ?? "📄"}
                        </span>
                        <div className="min-w-0">
                          <p className="font-black text-gray-700 text-sm truncate">
                            {item.topic || "Sem tema"}
                          </p>
                          <p className="text-xs text-gray-400 font-semibold truncate">
                            {subject?.label ?? item.subject} · {item.config?.year}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0 p-1"
                        title="Excluir"
                      >
                        {deletingId === item.id ? "..." : "🗑️"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          {item.title || "ATIVIDADE"}
                        </span>
                        <span className="text-xs bg-gray-50 text-gray-500 font-semibold px-2 py-0.5 rounded-full border border-gray-200">
                          {item.config?.difficulty}
                        </span>
                        <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                          {item.config?.questionCount} questões
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        🕐 {formatDate(item.created_at)}
                      </span>
                      <button
                        onClick={() => handleLoad(item)}
                        disabled={loadingId === item.id}
                        className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow active:scale-95 transition-all disabled:opacity-50"
                      >
                        {loadingId === item.id ? "⏳" : "📂"}{" "}
                        {loadingId === item.id ? "Carregando..." : "Carregar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
