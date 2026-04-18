export interface ActivityConfig {
  schoolName: string;
  teacherName: string;
  className: string;
  turno: string;
  activityTitle: string;
  date: string;
  year: string;
  subject: string;
  activityType: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  observations: string;
  useGoogleImages: boolean;
  hasMargem: boolean;
  logoBase64: string;
}

export const YEARS = [
  "Maternal",
  "I Período",
  "II Período",
  "III Período",
  "1º Ano",
  "2º Ano",
  "3º Ano",
  "4º Ano",
  "5º Ano",
];

export const TURNOS = ["Manhã", "Tarde", "Noite"];

export const ACTIVITY_TITLES = [
  "ATIVIDADE AVALIATIVA",
  "ATIVIDADE DE CASA",
  "ATIVIDADE EM CLASSE",
  "ATIVIDADE",
];

export const SUBJECTS: Record<string, { label: string; color: string; emoji: string }> = {
  portugues: { label: "Língua Portuguesa", color: "indigo", emoji: "📖" },
  matematica: { label: "Matemática", color: "green", emoji: "🔢" },
  natureza: { label: "Natureza e Sociedade", color: "sky", emoji: "🌿" },
  identidade: { label: "Identidade e Autonomia", color: "pink", emoji: "🧒" },
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
    "Contar e Escrever",
    "Ligar ao Número",
  ],
  natureza: [
    "Dia e Noite",
    "Animais e Plantas",
    "Água e Meio Ambiente",
    "Estações do Ano",
    "Corpo Humano",
    "Alimentos Saudáveis",
    "Escola e Comunidade",
    "Reciclagem",
  ],
  identidade: [
    "Quem Sou Eu",
    "Minha Família",
    "Meu Corpo",
    "Minhas Emoções",
    "Meus Direitos e Deveres",
    "Diversidade",
    "Higiene e Cuidados",
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
  className: "Turma A",
  turno: "Manhã",
  activityTitle: "ATIVIDADE",
  date: new Date().toLocaleDateString("pt-BR"),
  year: "II Período",
  subject: "portugues",
  activityType: "Família Silábica",
  topic: "",
  difficulty: "Médio",
  questionCount: 5,
  observations: "",
  useGoogleImages: true,
  hasMargem: false,
  logoBase64: "",
};
