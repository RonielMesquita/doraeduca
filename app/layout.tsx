import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoraEduca — Assistente da Professora Dora",
  description:
    "Crie atividades lindas e formatadas para seus alunos do Ensino Fundamental.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="bg-teacher-warm">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-teacher-warm font-nunito">{children}</body>
    </html>
  );
}
