// Mapeamento de objetivos de aprendizagem BNCC por série e disciplina.
// Usado para orientar a IA a gerar conteúdo no nível pedagógico correto.

type BnccMap = Record<string, Record<string, string>>;

const bncc: BnccMap = {
  // ── EDUCAÇÃO INFANTIL ─────────────────────────────────────────────────────

  Maternal: {
    portugues: "Exploração de sons, ritmos e rimas simples. Escuta de histórias curtas com imagens. Nomear objetos do cotidiano. Rabiscar e imitar traços. Reconhecer o próprio nome falado.",
    matematica: "Exploração sensorial de quantidades (muito/pouco, cheio/vazio). Classificar objetos por cor e tamanho. Noção de dentro/fora, grande/pequeno.",
    natureza: "Exploração dos sentidos (ver, tocar, cheirar, ouvir). Identificar animais e plantas do cotidiano. Perceber dia e noite. Conhecer o próprio corpo.",
    identidade: "Reconhecer a si mesmo (nome, rosto). Interagir com outras crianças. Expressar emoções básicas. Realizar ações de autocuidado com apoio.",
    ciencias: "Exploração sensorial do ambiente. Perceber mudanças na natureza (sol, chuva). Identificar partes do próprio corpo.",
    historia: "Reconhecer família próxima. Perceber rotinas diárias. Identificar pessoas do convívio.",
    geografia: "Reconhecer espaços conhecidos (casa, escola). Noção de perto/longe. Explorar o ambiente com o corpo.",
  },

  "I Período": {
    portugues: "Ouvir e recontar histórias simples. Identificar letras do próprio nome. Distinguir letras de números e desenhos. Participar de rodas de conversa. Produzir traços com intenção.",
    matematica: "Contagem oral até 10. Reconhecer numerais 1 a 5. Comparar quantidades (mais/menos). Sequências e padrões simples. Formas geométricas básicas (círculo, quadrado, triângulo).",
    natureza: "Identificar animais e seus habitats. Diferenciar seres vivos e não-vivos. Perceber as estações do ano. Cuidados com o meio ambiente.",
    identidade: "Construção da identidade pessoal (nome, idade, família). Respeito às diferenças. Regras de convivência. Emoções e sentimentos.",
    ciencias: "Identificar animais domésticos e selvagens. Partes do corpo humano. Alimentos saudáveis. Cuidados com a saúde.",
    historia: "História pessoal e da família. Datas e festas importantes. Sequência temporal (ontem/hoje/amanhã).",
    geografia: "Espaços da escola e da casa. Orientação espacial (em cima/embaixo, dentro/fora). Comunidade local.",
  },

  "II Período": {
    portugues: "Reconhecer e escrever o próprio nome. Identificar letras do alfabeto. Associar letra ao som inicial. Ouvir e interpretar textos. Escrever com apoio (cópia e traçado). Rimas e aliterações.",
    matematica: "Contagem e escrita dos numerais 1 a 10. Ordenar sequências numéricas. Adição com objetos concretos. Formas geométricas. Comparar comprimentos e pesos.",
    natureza: "Ciclo de vida dos animais. Plantas: partes e necessidades. Água e sua importância. Tempo e clima. Reciclagem e cuidados com o ambiente.",
    identidade: "Autonomia e autocuidado. Direitos e responsabilidades. Diversidade cultural e familiar. Cooperação e respeito.",
    ciencias: "Corpo humano: órgãos dos sentidos. Alimentação saudável. Higiene pessoal. Animais e seus filhotes.",
    historia: "Família e suas histórias. Profissões da comunidade. Tradições e festas locais.",
    geografia: "Meu bairro e minha cidade. Meios de transporte. Diferentes paisagens (campo e cidade).",
  },

  "III Período": {
    portugues: "Leitura e escrita de sílabas e palavras simples. Reconhecer famílias silábicas básicas (BA, BE, BI, BO, BU). Interpretar textos curtos com imagens. Produzir frases simples. Separar sílabas. Identificar vogais e consoantes.",
    matematica: "Numerais de 1 a 20. Adição e subtração com materiais concretos. Problemas simples do cotidiano. Figuras geométricas planas. Medidas não convencionais. Dezenas e unidades.",
    natureza: "Seres vivos: animais, plantas e fungos. Cadeia alimentar simples. Preservação ambiental. Fenômenos naturais (chuva, vento, trovão).",
    identidade: "Cidadania e direitos da criança. Identidade de gênero e diversidade. Convivência democrática. Projeto de vida inicial.",
    ciencias: "Sistema digestório e respiratório (básico). Doenças e prevenção. Solo e água. Animais vertebrados e invertebrados.",
    historia: "Comunidade e seus espaços. Patrimônio histórico local. Trabalho e profissões. Linha do tempo pessoal.",
    geografia: "Paisagens naturais e humanizadas. Pontos cardeais básicos. Mapa da sala/escola. Campo e cidade.",
  },

  // ── ENSINO FUNDAMENTAL ────────────────────────────────────────────────────

  "1º Ano": {
    portugues: "Alfabetização: consciência fonológica, correspondência letra-som. Leitura de palavras e frases simples. Escrita do nome e palavras familiares. Vogais e consoantes. Sílabas. Textos curtos (parlendas, cantigas, histórias).",
    matematica: "Números de 0 a 99. Adição e subtração até 20. Contagem, comparação e ordenação. Dobro e metade. Formas geométricas (quadrado, retângulo, triângulo, círculo). Medidas de tempo: dias da semana, meses.",
    natureza: "Ser humano como ser social e natural. Diferentes ambientes. Animais e plantas do cotidiano. Importância da água.",
    identidade: "Identidade pessoal e coletiva. Regras de convivência. Meus direitos e deveres. A escola como espaço de aprendizagem.",
    ciencias: "Corpo humano: partes e funções básicas. Sentidos humanos. Animais: características gerais. Plantas: partes e funções.",
    historia: "Histórias pessoais e familiares. O que é história. Fontes históricas cotidianas. Brincadeiras e tradições.",
    geografia: "A escola e o bairro. Localização e orientação espacial. Mapas simples. Paisagens naturais e construídas.",
  },

  "2º Ano": {
    portugues: "Consolidação da alfabetização. Leitura fluente de palavras e frases. Interpretação de textos simples. Escrita de frases e pequenos textos. Sílabas complexas (CH, LH, NH). Pontuação básica. Separação silábica.",
    matematica: "Números até 999. Adição e subtração com reagrupamento. Multiplicação como adição repetida (2x, 3x, 5x, 10x). Problemas de dois passos. Medidas: metro e centímetro, litro, quilograma. Horas e minutos.",
    natureza: "Seres vivos e não-vivos. Cadeia alimentar. Ciclos da natureza. Materiais e suas propriedades. Transformações na natureza.",
    identidade: "Diversidade cultural brasileira. Comunidade e pertencimento. Valores e ética. Democracia e participação.",
    ciencias: "Matéria: sólido, líquido e gasoso. Misturas. Propriedades dos materiais. Reciclagem. Energia: luz e calor.",
    historia: "Trabalho e vida cotidiana. Diferentes formas de moradia. Transformações ao longo do tempo. Patrimônio cultural.",
    geografia: "Município: campo e cidade. Meios de comunicação e transporte. Atividades econômicas locais. Representações do espaço.",
  },

  "3º Ano": {
    portugues: "Leitura e compreensão de textos variados (narrativos, informativos, poéticos). Produção de textos com coesão. Ortografia: M antes de P/B, Ã/ÃO, SS/Ç/S. Adjetivos, substantivos. Parágrafo. Interpretação de gráficos simples.",
    matematica: "Números até 9.999. Multiplicação (tabuada completa). Divisão exata simples. Frações simples (½, ¼, ¾). Geometria: perímetro, simetria. Probabilidade intuitiva. Problemas com múltiplas operações.",
    natureza: "Ecossistemas brasileiros (básico). Cadeia e teia alimentar. Solo: composição e importância. Água: ciclo hidrológico. Poluição e sustentabilidade.",
    identidade: "Identidade cultural brasileira. Diversidade étnica e racial. Direitos humanos. Mídia e comunicação.",
    ciencias: "Sistema solar básico. Dia e noite. Estações do ano. Plantas: fotossíntese e reprodução. Fungos e bactérias (introdução).",
    historia: "Formação do Brasil: indígenas, africanos e europeus. Escravidão (introdução). Patrimônio histórico brasileiro. Fontes primárias e secundárias.",
    geografia: "Regiões brasileiras. Relevo e clima do Brasil. Biomas brasileiros (introdução). Migração e diversidade populacional.",
  },

  "4º Ano": {
    portugues: "Análise linguística: concordância nominal e verbal básica. Tipos de texto: carta, notícia, poema, narrativa. Figuras de linguagem simples. Inferência em textos. Produção textual com rascunho e revisão. Uso do dicionário.",
    matematica: "Números até 1.000.000. Operações com números maiores. Divisão com dois dígitos. Frações e decimais (introdução). Números negativos (intuição). Área de figuras planas. Sistema monetário e porcentagem básica.",
    natureza: "Recursos naturais e sua exploração. Desmatamento e consequências. Energia: fontes renováveis e não renováveis. Tecnologia e sociedade.",
    identidade: "Brasil: diversidade e desigualdade. Cidadania ativa. Direitos e deveres constitucionais básicos. Culturas africanas e indígenas.",
    ciencias: "Sistema digestório, respiratório e circulatório. Alimentação saudável e nutrição. Doenças e prevenção. Saúde coletiva.",
    historia: "Brasil colonial: economia e sociedade. Quilombos e resistência. Período imperial (introdução). Abolição da escravidão.",
    geografia: "Brasil: territórios e fronteiras. Urbanização e ruralização. Problemas ambientais brasileiros. Cartografia: escalas e legendas.",
  },

  "5º Ano": {
    portugues: "Produção de textos argumentativos e dissertativos simples. Análise crítica de textos midiáticos. Morfologia: classes gramaticais completas. Regência e concordância. Uso da vírgula. Pontuação avançada. Leitura de diferentes gêneros textuais.",
    matematica: "Números decimais e frações equivalentes. Porcentagem e proporção. Potenciação e radiciação (introdução). Álgebra: equações simples. Volume de sólidos. Estatística: média, moda e tabelas.",
    natureza: "Impactos ambientais globais. Mudanças climáticas. Desenvolvimento sustentável. Tecnologia e inovação.",
    identidade: "Democracia e participação política. Direitos fundamentais. Preconceito e discriminação. Projeto de vida.",
    ciencias: "Sistema nervoso e reprodutor. Puberdade e adolescência. Microrganismos: vírus e bactérias. Vacinas e imunidade. Astronomia: universo e galáxias.",
    historia: "Brasil República: proclamação e primeiros governos. Era Vargas (introdução). Ditadura militar (introdução). Redemocratização.",
    geografia: "Globalização e seus efeitos. Geopolítica básica. Continentes e oceanos. Problemas socioambientais mundiais.",
  },
};

export function getBnccObjectives(year: string, subject: string): string {
  const yearData = bncc[year];
  if (!yearData) return "";
  return yearData[subject] ?? "";
}
