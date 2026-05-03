import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DoraEduca",
    short_name: "DoraEduca",
    description: "Crie atividades prontas para seus alunos em segundos com IA",
    start_url: "/",
    display: "standalone",
    background_color: "#FEF9EE",
    theme_color: "#F97316",
    orientation: "portrait",
    lang: "pt-BR",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
