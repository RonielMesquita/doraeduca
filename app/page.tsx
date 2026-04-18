"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ActivityForm from "@/components/ActivityForm";
import ActivityPreview from "@/components/ActivityPreview";
import ChatSidebar from "@/components/ChatSidebar";
import { ActivityConfig, UploadedFile, defaultConfig } from "@/lib/types";

export default function Home() {
  const [config, setConfig] = useState<ActivityConfig>(defaultConfig);
  const [activity, setActivity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"ai" | "template" | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [feedback, setFeedback] = useState<string>("");

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
      const data = await res.json();
      setActivity(data.activity);
      setSource(data.source);
      setFeedback("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-teacher-warm">
      <Header />
      <div className="flex flex-col lg:flex-row gap-5 p-4 lg:p-5 max-w-7xl mx-auto w-full flex-1">
        <ActivityForm
          config={config}
          onChange={setConfig}
          onGenerate={handleGenerate}
          loading={loading}
          uploadedFiles={uploadedFiles}
          onFilesChange={setUploadedFiles}
        />
        <ActivityPreview
          config={config}
          activity={activity}
          loading={loading}
          source={source}
          feedback={feedback}
          onFeedbackChange={setFeedback}
          onRegenerate={handleGenerate}
        />
      </div>
      <ChatSidebar />
    </div>
  );
}
