import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "DoraEduca — Assistente da Professora",
  description: "Crie atividades prontas para seus alunos em segundos com IA",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DoraEduca",
  },
};

export const viewport: Viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen bg-teacher-warm font-nunito">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
