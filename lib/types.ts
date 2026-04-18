export interface ActivityConfig {
  schoolName: string;
  teacherName: string;
  grade: string;
  className: string;
  date: string;
  year: string;
  subject: string;
  activityType: string;
  topic: string;
  difficulty: string;
}

export const YEARS = [
  "1º Ano",
  "2º Ano",
  "3º Ano",
  "4º Ano",
  "5º Ano",
];

export const SUBJECTS: Record<string, { label: string; color: string; emoji: string }> = {
  portugues: { label: "Língua Portuguesa", color: "indigo", emoji: "📖" },
  matematica: { label: "Matemática", color: "green", emoji: "🔢" },
  ciencias: { label: "Ciências", color: "sky", emoji: "🔬" },
  historia: { label: "História", color: "orange", emoji: "🏛️" },
  geografia: { label: "Geografia", color: "lime", emoji: "🌍" },
};

export const ACTIVITY_TYPES: Record<string, string[]> = {
  portugues: [
    "Família Silábica",
    "Complete as Lacunas",
    "Interpretação de Texto",
    "Caça-Palavras",
    "Cruzadinha",
    "Caligrafia",
    "Separação de Sílabas",
    "Ligar as Colunas",
  ],
  matematica: [
    "Adição",
    "Subtração",
    "Multiplicação",
    "Divisão",
    "Problemas",
    "Sequência Numérica",
    "Geometria",
    "Medidas",
  ],
  ciencias: [
    "Animais",
    "Plantas e Natureza",
    "Corpo Humano",
    "Meio Ambiente",
    "Alimentos Saudáveis",
    "Estados da Matéria",
  ],
  historia: [
    "Família e Comunidade",
    "Trabalho e Profissões",
    "Festas e Tradições",
    "Linha do Tempo",
    "Fontes Históricas",
  ],
  geografia: [
    "Paisagens",
    "Ponto de Referência",
    "Mapas e Legendas",
    "Campo e Cidade",
    "Recursos Naturais",
  ],
};

export interface UploadedFile {
  id: string;
  name: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";
  base64: string;
  preview: string;
}

export const defaultConfig: ActivityConfig = {
  schoolName: "",
  teacherName: "Professora Dora",
  grade: "2º Ano",
  className: "Turma A",
  date: new Date().toLocaleDateString("pt-BR"),
  year: "2º Ano",
  subject: "portugues",
  activityType: "Família Silábica",
  topic: "",
  difficulty: "Médio",
};
