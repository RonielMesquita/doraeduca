"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ActivityForm from "@/components/ActivityForm";
import ActivityPreview from "@/components/ActivityPreview";
import ChatSidebar from "@/components/ChatSidebar";
import HistoryPanel from "@/components/HistoryPanel";
import { ActivityConfig, UploadedFile, defaultConfig } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const FREE_LIMIT = 5;

export default function Home() {
  const router = useRouter();
  const [config, setConfig] = useState<ActivityConfig>(defaultConfig);
  const [activity, setActivity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"ai" | "template" | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [limitReached, setLimitReached] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name =
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0] ||
          "Professora";
        setUserName(name);

        // Busca contagem de uso
        supabase
          .from("activities")
          .select("*", { count: "exact", head: true })
          .eq("user_id", data.user.id)
          .then(({ count }) => setUsageCount(count ?? 0));
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const handleGenerate = async (additionalFeedback?: string) => {
    setLoading(true);
    setActivity(null);
    try {
      const configWithFeedback = additionalFeedback
        ? {
            ...config,
            observations: config.observations
              ? `${config.observations}\n\nAJUSTES SOLICITADOS: ${additionalFeedback}`
              : `AJUSTES SOLICITADOS: ${additionalFeedback}`,
          }
        : config;

      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: configWithFeedback, uploadedFiles }),
      });

      // Limite do plano gratuito atingido
      if (res.status === 402) {
        setLimitReached(true);
        return;
      }

      const data = await res.json();
      setActivity(data.activity);
      setSource(data.source);
      setFeedback("");

      // Auto-save to history (fire-and-forget)
      if (data.activity) {
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config: configWithFeedback,
            activity: data.activity,
          }),
        })
          .then(() => setUsageCount((c) => (c !== null ? c + 1 : null)))
          .catch(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryLoad = (loadedConfig: ActivityConfig, loadedActivity: string) => {
    setConfig(loadedConfig);
    setActivity(loadedActivity);
    setSource("ai");
    setFeedback("");
    setLimitReached(false);
  };

  const remaining = usageCount !== null ? Math.max(0, FREE_LIMIT - usageCount) : null;

  return (
    <div className="min-h-screen flex flex-col bg-teacher-warm">
      <Header
        userName={userName}
        onHistoryOpen={() => setHistoryOpen(true)}
        onLogout={handleLogout}
      />
      <div className="flex flex-col md:flex-row gap-5 p-4 md:p-5 max-w-7xl mx-auto w-full flex-1">
        <ActivityForm
          config={config}
          onChange={setConfig}
          onGenerate={handleGenerate}
          loading={loading}
          uploadedFiles={uploadedFiles}
          onFilesChange={setUploadedFiles}
          remaining={remaining}
          onUpgradeClick={() => setLimitReached(true)}
        />
        <ActivityPreview
          config={config}
          activity={activity}
          loading={loading}
          source={source}
          feedback={feedback}
          onFeedbackChange={setFeedback}
          onRegenerate={handleGenerate}
          limitReached={limitReached}
        />
      </div>
      <ChatSidebar />
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleHistoryLoad}
      />
    </div>
  );
}
