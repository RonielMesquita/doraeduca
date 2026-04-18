import { ActivityConfig } from "./types";

function img(prompt: string, seed: number = 1): string {
  const encoded = encodeURIComponent(
    `simple cute cartoon ${prompt} for kids educational worksheet white background no text`
  );
  return `https://image.pollinations.ai/prompt/${encoded}?width=110&height=110&nologo=true&seed=${seed}`;
}

export function generateMockActivity(config: ActivityConfig): string {
  const { year, subject, activityType, topic } = config;
  const topicLabel = topic || getDefaultTopic(subject, activityType, year);

  switch (subject) {
    case "portugues":
      return generatePortugues(activityType, topicLabel, year);
    case "matematica":
      return generateMatematica(activityType, topicLabel, year);
    case "ciencias":
      return generateCiencias(activityType, topicLabel, year);
    case "historia":
      return generateHistoria(activityType, topicLabel, year);
    case "geografia":
      return generateGeografia(activityType, topicLabel, year);
    default:
      return generatePortugues(activityType, topicLabel, year);
  }
}

function getDefaultTopic(subject: string, activityType: string, year: string): string {
  const topics: Record<string, Record<string, string>> = {
    portugues: {
      "Família Silábica": "Família da Letra B",
      "Complete as Lacunas": "Animais da Fazenda",
      "Interpretação de Texto": "A Borboleta e a Flor",
      "Caça-Palavras": "Frutas",
      "Cruzadinha": "Animais",
      "Caligrafia": "Vogais",
      "Separação de Sílabas": "Palavras do Cotidiano",
      "Ligar as Colunas": "Plural e Singular",
    },
    matematica: {
      Adição: "Números até 20",
      Subtração: "Números até 20",
      Multiplicação: "Tabuada do 2",
      Divisão: "Divisão por 2",
      Problemas: "Situações do Dia a Dia",
      "Sequência Numérica": "De 2 em 2",
      Geometria: "Formas Geométricas",
      Medidas: "Comprimento",
    },
  };
  return topics[subject]?.[activityType] || "Revisão Geral";
}

function generatePortugues(type: string, topic: string, year: string): string {
  switch (type) {
    case "Família Silábica":
      return familiasSilabicas(topic);
    case "Complete as Lacunas":
      return completeLacunas(topic);
    case "Caça-Palavras":
      return cacaPalavras(topic);
    case "Cruzadinha":
      return cruzadinha(topic);
    case "Interpretação de Texto":
      return interpretacaoTexto(topic, year);
    case "Separação de Sílabas":
      return separacaoSilabas(topic);
    case "Ligar as Colunas":
      return ligarColunas(topic);
    case "Caligrafia":
      return caligrafia(topic);
    default:
      return familiasSilabicas(topic);
  }
}

function generateMatematica(type: string, topic: string, year: string): string {
  switch (type) {
    case "Adição":
      return adicao(topic, year);
    case "Subtração":
      return subtracao(topic, year);
    case "Multiplicação":
      return multiplicacao(topic, year);
    case "Divisão":
      return divisao(topic, year);
    case "Problemas":
      return problemas(topic, year);
    case "Sequência Numérica":
      return sequenciaNumerica(topic, year);
    case "Geometria":
      return geometria(topic);
    default:
      return adicao(topic, year);
  }
}

function generateCiencias(type: string, topic: string, year: string): string {
  const isAnimais = type === "Animais" || topic.toLowerCase().includes("animal");
  const isPlants = type === "Plantas e Natureza" || topic.toLowerCase().includes("plant");
  const isCorpo = type === "Corpo Humano";

  if (isAnimais) {
    const animals = [
      { emoji: "🦁", imgPrompt: "lion wild animal safari", name: "LEÃO", tipo: "Mamífero", habitat: "Savana" },
      { emoji: "🐘", imgPrompt: "elephant wild animal", name: "ELEFANTE", tipo: "Mamífero", habitat: "Savana" },
      { emoji: "🦜", imgPrompt: "parrot tropical bird colorful", name: "PAPAGAIO", tipo: "Ave", habitat: "Floresta" },
      { emoji: "🐊", imgPrompt: "crocodile reptile river", name: "CROCODILO", tipo: "Réptil", habitat: "Rio" },
      { emoji: "🐟", imgPrompt: "fish tropical sea colorful", name: "PEIXE", tipo: "Peixe", habitat: "Mar" },
      { emoji: "🐸", imgPrompt: "frog amphibian pond green", name: "SAPO", tipo: "Anfíbio", habitat: "Lagoa" },
    ];
    return `
      <div class="activity-section">
        <h3 class="activity-subtitle">🔬 Ciências: ${topic || "Animais"}</h3>
        <p class="activity-instruction">1) Observe os animais e complete a tabela:</p>
        <div class="figurinhas-grid">
          ${animals.map((a, i) => `
            <div class="figurinha-card ${["yellow","blue","green","pink","blue","green"][i]}">
              <img class="figurinha-img" src="${img(a.imgPrompt, i + 20)}" alt="${a.name}" loading="lazy"/>
              <span class="figurinha-emoji-sm">${a.emoji}</span>
              <span class="figurinha-name">${a.name}</span>
            </div>`).join("")}
        </div>

        <p class="activity-instruction">2) Complete a tabela com as informações dos animais:</p>
        <div class="text-box" style="padding:0; overflow:hidden;">
          <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
            <thead>
              <tr style="background:#dbeafe;">
                <th style="padding:6px 8px; border:1px solid #bfdbfe; text-align:left;">Animal</th>
                <th style="padding:6px 8px; border:1px solid #bfdbfe;">Tipo</th>
                <th style="padding:6px 8px; border:1px solid #bfdbfe;">Habitat</th>
                <th style="padding:6px 8px; border:1px solid #bfdbfe;">O que come?</th>
              </tr>
            </thead>
            <tbody>
              ${animals.map((a, i) => `
                <tr style="background:${i % 2 === 0 ? "white" : "#f9fafb"}">
                  <td style="padding:6px 8px; border:1px solid #e5e7eb;">${a.emoji} ${a.name}</td>
                  <td style="padding:6px 8px; border:1px solid #e5e7eb; text-align:center;">${a.tipo}</td>
                  <td style="padding:6px 8px; border:1px solid #e5e7eb; text-align:center;">${a.habitat}</td>
                  <td style="padding:6px 8px; border:1px solid #e5e7eb;"></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>

        <p class="activity-instruction">3) Desenhe seu animal favorito:</p>
        <div class="drawing-box small"></div>
      </div>
    `;
  }

  if (isPlants) {
    const plants = [
      { emoji: "🌻", imgPrompt: "sunflower plant garden", name: "GIRASSOL" },
      { emoji: "🌵", imgPrompt: "cactus desert plant", name: "CACTO" },
      { emoji: "🌳", imgPrompt: "tree big nature", name: "ÁRVORE" },
      { emoji: "🌿", imgPrompt: "herb medicinal plant green", name: "ERVA" },
      { emoji: "🍄", imgPrompt: "mushroom nature forest", name: "COGUMELO" },
      { emoji: "🌱", imgPrompt: "seedling sprout plant growing", name: "MUDA" },
    ];
    return `
      <div class="activity-section">
        <h3 class="activity-subtitle">🌿 Ciências: Plantas e Natureza</h3>
        <p class="activity-instruction">1) Observe as plantas:</p>
        <div class="figurinhas-grid">
          ${plants.map((p, i) => `
            <div class="figurinha-card green">
              <img class="figurinha-img" src="${img(p.imgPrompt, i + 30)}" alt="${p.name}" loading="lazy"/>
              <span class="figurinha-emoji-sm">${p.emoji}</span>
              <span class="figurinha-name">${p.name}</span>
            </div>`).join("")}
        </div>
        <p class="activity-instruction">2) Quais partes uma planta tem? Escreva:</p>
        <ol class="activity-list">
          <li>As plantas precisam de ___________, ___________ e ___________ para viver.</li>
          <li>A parte que absorve água do solo é: ___________</li>
          <li>A parte que faz fotossíntese é: ___________</li>
          <li>Cite 2 plantas que você conhece: ___________ e ___________</li>
        </ol>
        <p class="activity-instruction">3) Desenhe uma planta e identifique suas partes:</p>
        <div class="drawing-box"></div>
      </div>
    `;
  }

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔬 ${type}: ${topic}</h3>
      <p class="activity-instruction">Observe as imagens e responda:</p>

      <div class="figurinhas-grid-3">
        <div class="figurinha-card blue">
          <img class="figurinha-img-lg" src="${img(topic + " science educational", 40)}" alt="${topic}" loading="lazy"/>
          <span class="figurinha-name">${topic.toUpperCase()}</span>
        </div>
        <div class="figurinha-card green" style="grid-column: span 2; padding: 14px;">
          <ol class="activity-list" style="text-align:left; width:100%;">
            <li>O que você vê na imagem?<div class="answer-line"></div></li>
            <li>Onde encontramos isso na natureza?<div class="answer-line"></div></li>
            <li>Qual sua importância?<div class="answer-line"></div><div class="answer-line"></div></li>
          </ol>
        </div>
      </div>

      <p class="activity-instruction">Desenhe o que você aprendeu:</p>
      <div class="drawing-box"></div>
    </div>
  `;
}

function generateHistoria(type: string, topic: string, year: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🏛️ ${type}: ${topic}</h3>
      <p class="activity-instruction">Leia com atenção e responda:</p>
      <div class="text-box">
        <p>Cada família tem sua própria história, seus costumes e tradições.
        Conhecer a história da nossa família e comunidade nos ajuda a entender
        quem somos e de onde viemos.</p>
      </div>
      <ol class="activity-list">
        <li>Qual é o nome dos seus avós?<br/>
          <div class="answer-line"></div>
        </li>
        <li>Onde seus pais nasceram?<br/>
          <div class="answer-line"></div>
        </li>
        <li>Qual é a tradição mais importante da sua família?<br/>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </li>
        <li>Desenhe um momento especial da sua família:</li>
      </ol>
      <div class="drawing-box"></div>
    </div>
  `;
}

function generateGeografia(type: string, topic: string, year: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🌍 ${type}: ${topic}</h3>
      <p class="activity-instruction">Vamos explorar o mundo ao nosso redor!</p>
      <ol class="activity-list">
        <li>Observe a paisagem da sua cidade. O que você vê?<br/>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </li>
        <li>Descreva o caminho da sua casa até a escola:<br/>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </li>
        <li>Quais recursos naturais existem perto da sua casa?<br/>
          <div class="answer-line"></div>
        </li>
        <li>Faça um mapa simples do seu bairro:</li>
      </ol>
      <div class="drawing-box" style="height: 150px;"></div>
    </div>
  `;
}

function familiasSilabicas(topic: string): string {
  const letra = topic.includes("Letra") ? topic.split("Letra")[1].trim() : "B";
  const L = letra.charAt(0).toUpperCase();

  const familias: Record<string, {
    silabas: string[];
    figurinhas: { emoji: string; imgPrompt: string; word: string; blank: string }[];
  }> = {
    B: {
      silabas: ["BA", "BE", "BI", "BO", "BU"],
      figurinhas: [
        { emoji: "⚽", imgPrompt: "ball soccer", word: "BOLA", blank: "___LA" },
        { emoji: "🐄", imgPrompt: "ox bull animal farm", word: "BOI", blank: "___I" },
        { emoji: "🍌", imgPrompt: "banana fruit", word: "BANANA", blank: "___NANA" },
        { emoji: "🎈", imgPrompt: "balloon party", word: "BEXIGA", blank: "___XIGA" },
        { emoji: "🐛", imgPrompt: "caterpillar bug", word: "BICHO", blank: "___CHO" },
        { emoji: "🥊", imgPrompt: "boxing glove", word: "LUVA DE BOXE", blank: "___XE" },
      ],
    },
    C: {
      silabas: ["CA", "CE", "CI", "CO", "CU"],
      figurinhas: [
        { emoji: "🏠", imgPrompt: "house cartoon", word: "CASA", blank: "___SA" },
        { emoji: "🐴", imgPrompt: "horse animal", word: "CAVALO", blank: "___VALO" },
        { emoji: "🦓", imgPrompt: "zebra animal", word: "CEBOLA", blank: "___BOLA" },
        { emoji: "🐇", imgPrompt: "rabbit animal", word: "COELHO", blank: "___ELHO" },
        { emoji: "☁️", imgPrompt: "cloud sky", word: "CHUVA", blank: "___UVIA" },
        { emoji: "🎯", imgPrompt: "cube 3d shape", word: "CUBO", blank: "___BO" },
      ],
    },
    M: {
      silabas: ["MA", "ME", "MI", "MO", "MU"],
      figurinhas: [
        { emoji: "🍎", imgPrompt: "apple fruit", word: "MAÇÃ", blank: "___ÇÃ" },
        { emoji: "🌊", imgPrompt: "sea ocean waves", word: "MAR", blank: "___R" },
        { emoji: "🍯", imgPrompt: "honey jar", word: "MEL", blank: "___L" },
        { emoji: "🌽", imgPrompt: "corn vegetable", word: "MILHO", blank: "___LHO" },
        { emoji: "🏍️", imgPrompt: "motorcycle vehicle", word: "MOTO", blank: "___TO" },
        { emoji: "🐄", imgPrompt: "cow animal", word: "MULA", blank: "___LA" },
      ],
    },
    P: {
      silabas: ["PA", "PE", "PI", "PO", "PU"],
      figurinhas: [
        { emoji: "🦆", imgPrompt: "duck bird animal", word: "PATO", blank: "___TO" },
        { emoji: "🍐", imgPrompt: "pear fruit", word: "PERA", blank: "___RA" },
        { emoji: "🐟", imgPrompt: "fish sea animal", word: "PEIXE", blank: "___IXE" },
        { emoji: "🪁", imgPrompt: "kite toy flying", word: "PIPA", blank: "___PA" },
        { emoji: "🐔", imgPrompt: "chicken bird", word: "PERU", blank: "___RU" },
        { emoji: "🌉", imgPrompt: "bridge architecture", word: "PONTE", blank: "___NTE" },
      ],
    },
    V: {
      silabas: ["VA", "VE", "VI", "VO", "VU"],
      figurinhas: [
        { emoji: "🐄", imgPrompt: "cow animal farm", word: "VACA", blank: "___CA" },
        { emoji: "🕯️", imgPrompt: "candle light", word: "VELA", blank: "___LA" },
        { emoji: "🍇", imgPrompt: "grapes fruit", word: "UVA", blank: "U___" },
        { emoji: "🦊", imgPrompt: "fox animal", word: "RAPOSA", blank: "___IXEN" },
        { emoji: "🏘️", imgPrompt: "village neighborhood", word: "VILA", blank: "___LA" },
        { emoji: "✈️", imgPrompt: "airplane flight", word: "VOO", blank: "___O" },
      ],
    },
  };

  const data = familias[L] || familias["B"];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">📝 Família Silábica da Letra ${L}</h3>

      <div class="familia-box">
        <div class="familia-header">🌟 A Família do ${L.toUpperCase()}${L.toLowerCase()} 🌟</div>
        <div class="silabas-row">
          ${data.silabas.map((s) => `<span class="silaba-card">${s}</span>`).join("")}
        </div>
      </div>

      <p class="activity-instruction">1) Leia em voz alta e repita 3 vezes:</p>
      <div class="read-aloud-box">${data.silabas.join(" — ")}</div>

      <p class="activity-instruction">2) Observe as figurinhas e escreva o nome de cada uma:</p>
      <div class="figurinhas-grid">
        ${data.figurinhas.slice(0, 6).map((f, i) => `
          <div class="figurinha-card ${["yellow","blue","green","pink","yellow","blue"][i]}">
            <img class="figurinha-img" src="${img(f.imgPrompt, i + 1)}" alt="${f.word}" loading="lazy"/>
            <span class="figurinha-emoji-sm">${f.emoji}</span>
            <div class="figurinha-write ${["yellow","blue","green","pink","yellow","blue"][i]}"></div>
            <span class="figurinha-hint">dica: ${f.blank}</span>
          </div>`).join("")}
      </div>

      <p class="activity-instruction">3) Complete com a sílaba correta do ${L}${L.toLowerCase()}:</p>
      <div class="words-grid">
        ${data.figurinhas.slice(0, 4).map((f, i) => `
          <div class="word-item">
            <span class="word-number">${i + 1})</span>
            <span class="word-blank">${f.blank}</span>
            <span class="word-hint">${f.emoji}</span>
          </div>`).join("")}
      </div>

      <p class="activity-instruction">4) Desenhe sua palavra favorita com a letra <strong>${L}</strong>:</p>
      <div class="drawing-box small"></div>
    </div>
  `;
}

function completeLacunas(topic: string): string {
  const animals = [
    { emoji: "🐄", imgPrompt: "cow dairy animal farm", name: "vaca", frase: "A ___________ dá leite para as crianças.", sound: "muuu" },
    { emoji: "🐕", imgPrompt: "dog puppy animal", name: "cachorro", frase: "O ___________ faz "au au".", sound: "au au" },
    { emoji: "🐔", imgPrompt: "hen chicken bird farm", name: "galinha", frase: "A ___________ bota ovos.", sound: "cocoricó" },
    { emoji: "🦆", imgPrompt: "duck bird water animal", name: "pato", frase: "O ___________ nada na lagoa.", sound: "quá quá" },
    { emoji: "🐴", imgPrompt: "horse animal running", name: "cavalo", frase: "O ___________ corre muito rápido.", sound: "iiihh" },
    { emoji: "🐱", imgPrompt: "cat kitten animal", name: "gato", frase: "O ___________ faz "miau".", sound: "miau" },
  ];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">✏️ Complete as Lacunas: ${topic}</h3>

      <p class="activity-instruction">1) Conheça os animais da fazenda:</p>
      <div class="figurinhas-grid">
        ${animals.map((a, i) => `
          <div class="figurinha-card ${["yellow","blue","green","pink","yellow","blue"][i]}">
            <img class="figurinha-img" src="${img(a.imgPrompt, i + 10)}" alt="${a.name}" loading="lazy"/>
            <span class="figurinha-emoji-sm">${a.emoji}</span>
            <span class="figurinha-name">${a.name.toUpperCase()}</span>
            <span class="figurinha-hint">${a.sound}</span>
          </div>`).join("")}
      </div>

      <p class="activity-instruction">2) Use os nomes acima para completar as frases:</p>
      <div class="word-box">
        ${animals.map(a => `<span class="word-tag">${a.emoji} ${a.name}</span>`).join("")}
      </div>

      <ol class="activity-list">
        ${animals.map(a => `<li>${a.frase}</li>`).join("")}
      </ol>

      <p class="activity-instruction">3) Escreva uma frase sobre seu animal favorito:</p>
      <div class="answer-line"></div>
      <div class="answer-line"></div>
    </div>
  `;
}

function cacaPalavras(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔍 Caça-Palavras: ${topic}</h3>
      <p class="activity-instruction">Encontre as frutas escondidas no caça-palavras:</p>

      <div class="two-columns">
        <div class="word-search-grid">
          <table class="ws-table">
            <tbody>
              <tr><td>M</td><td>A</td><td>C</td><td>A</td><td>P</td><td>E</td><td>R</td><td>A</td></tr>
              <tr><td>U</td><td>V</td><td>A</td><td>X</td><td>L</td><td>I</td><td>M</td><td>A</td></tr>
              <tr><td>B</td><td>A</td><td>N</td><td>A</td><td>N</td><td>A</td><td>Z</td><td>K</td></tr>
              <tr><td>L</td><td>A</td><td>R</td><td>A</td><td>N</td><td>J</td><td>A</td><td>P</td></tr>
              <tr><td>M</td><td>A</td><td>M</td><td>A</td><td>O</td><td><strong>U</strong></td><td>V</td><td>A</td></tr>
              <tr><td>A</td><td>B</td><td>A</td><td>C</td><td>A</td><td>X</td><td>I</td><td>M</td></tr>
              <tr><td>M</td><td>O</td><td>R</td><td>A</td><td>N</td><td>G</td><td>O</td><td>N</td></tr>
              <tr><td>C</td><td>O</td><td>C</td><td>O</td><td>S</td><td>T</td><td>R</td><td>K</td></tr>
            </tbody>
          </table>
        </div>
        <div class="word-list-box">
          <p><strong>Encontre:</strong></p>
          <ul>
            <li>☐ MAÇA</li>
            <li>☐ PERA</li>
            <li>☐ UVA</li>
            <li>☐ BANANA</li>
            <li>☐ LARANJA</li>
            <li>☐ MAMAO</li>
            <li>☐ MORANGO</li>
            <li>☐ COCO</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function cruzadinha(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🧩 Cruzadinha: ${topic}</h3>
      <p class="activity-instruction">Preencha a cruzadinha de acordo com as dicas:</p>

      <div class="two-columns">
        <div class="crossword-grid">
          <table class="cw-table">
            <tbody>
              <tr>
                <td class="cw-black"></td>
                <td class="cw-cell"><span class="cw-num">1</span></td>
                <td class="cw-black"></td>
                <td class="cw-black"></td>
              </tr>
              <tr>
                <td class="cw-cell"><span class="cw-num">2</span></td>
                <td class="cw-cell"></td>
                <td class="cw-cell"></td>
                <td class="cw-cell"></td>
              </tr>
              <tr>
                <td class="cw-black"></td>
                <td class="cw-cell"></td>
                <td class="cw-black"></td>
                <td class="cw-black"></td>
              </tr>
              <tr>
                <td class="cw-black"></td>
                <td class="cw-cell"></td>
                <td class="cw-black"></td>
                <td class="cw-black"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="crossword-clues">
          <p><strong>Horizontal:</strong></p>
          <p>2. Animal que faz "au au"</p>
          <br/>
          <p><strong>Vertical:</strong></p>
          <p>1. Animal que faz "miau"</p>
        </div>
      </div>
    </div>
  `;
}

function interpretacaoTexto(topic: string, year: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">📚 Leitura e Interpretação: ${topic}</h3>

      <div class="text-box">
        <h4 style="text-align:center; margin-bottom: 8px;">A Borboleta e a Flor</h4>
        <p>Era uma vez uma linda borboleta colorida que voava pelo jardim.
        Ela tinha asas amarelas e azuis que brilhavam no sol.</p>
        <p>A borboleta parou em uma flor vermelha para beber seu néctar.
        A flor ficou muito feliz com a visita.</p>
        <p>— Obrigada por me visitar! — disse a flor.</p>
        <p>— Obrigada pelo alimento! — respondeu a borboleta.</p>
        <p>E assim elas se tornaram grandes amigas.</p>
      </div>

      <ol class="activity-list">
        <li>Qual é o título do texto?<br/>
          <div class="answer-line"></div>
        </li>
        <li>Como eram as asas da borboleta?<br/>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </li>
        <li>O que a borboleta foi buscar na flor?<br/>
          <div class="answer-line"></div>
        </li>
        <li>Como a flor ficou quando a borboleta chegou?<br/>
          <div class="answer-line"></div>
        </li>
        <li>Desenhe a borboleta e a flor do texto:</li>
      </ol>
      <div class="drawing-box small"></div>
    </div>
  `;
}

function separacaoSilabas(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">✂️ Separação de Sílabas: ${topic}</h3>
      <p class="activity-instruction">Separe as sílabas das palavras com um hífen ( - ):</p>

      <div class="silaba-exercise">
        <div class="silaba-row">
          <span class="silaba-word">BOLA</span>
          <span class="silaba-arrow">→</span>
          <div class="silaba-answer">BO - LA</div>
        </div>
        <div class="silaba-row">
          <span class="silaba-word">ESCOLA</span>
          <span class="silaba-arrow">→</span>
          <div class="silaba-answer-blank"></div>
        </div>
        <div class="silaba-row">
          <span class="silaba-word">BORBOLETA</span>
          <span class="silaba-arrow">→</span>
          <div class="silaba-answer-blank"></div>
        </div>
        <div class="silaba-row">
          <span class="silaba-word">CACHORRO</span>
          <span class="silaba-arrow">→</span>
          <div class="silaba-answer-blank"></div>
        </div>
        <div class="silaba-row">
          <span class="silaba-word">PROFESSOR</span>
          <span class="silaba-arrow">→</span>
          <div class="silaba-answer-blank"></div>
        </div>
        <div class="silaba-row">
          <span class="silaba-word">BANANA</span>
          <span class="silaba-arrow">→</span>
          <div class="silaba-answer-blank"></div>
        </div>
      </div>

      <p class="activity-instruction">Quantas sílabas tem cada palavra? Escreva o número:</p>
      <div class="count-grid">
        <div class="count-item"><span>GATO</span><div class="count-box"></div></div>
        <div class="count-item"><span>TARTARUGA</span><div class="count-box"></div></div>
        <div class="count-item"><span>PAO</span><div class="count-box"></div></div>
        <div class="count-item"><span>MARIPOSA</span><div class="count-box"></div></div>
      </div>
    </div>
  `;
}

function ligarColunas(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔗 Ligar as Colunas: ${topic}</h3>
      <p class="activity-instruction">Ligue o singular ao seu plural correto:</p>

      <div class="columns-exercise">
        <div class="column-left">
          <div class="col-item">🐱 GATO</div>
          <div class="col-item">🌺 FLOR</div>
          <div class="col-item">🐦 PÁSSARO</div>
          <div class="col-item">📚 LIVRO</div>
          <div class="col-item">🌳 ÁRVORE</div>
        </div>
        <div class="column-dots">
          <div class="dot-row"><div class="dot"></div><div class="dot-line"></div><div class="dot"></div></div>
          <div class="dot-row"><div class="dot"></div><div class="dot-line"></div><div class="dot"></div></div>
          <div class="dot-row"><div class="dot"></div><div class="dot-line"></div><div class="dot"></div></div>
          <div class="dot-row"><div class="dot"></div><div class="dot-line"></div><div class="dot"></div></div>
          <div class="dot-row"><div class="dot"></div><div class="dot-line"></div><div class="dot"></div></div>
        </div>
        <div class="column-right">
          <div class="col-item">LIVROS 📚</div>
          <div class="col-item">PÁSSAROS 🐦</div>
          <div class="col-item">GATOS 🐱</div>
          <div class="col-item">ÁRVORES 🌳</div>
          <div class="col-item">FLORES 🌺</div>
        </div>
      </div>
    </div>
  `;
}

function caligrafia(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🖊️ Caligrafia: ${topic}</h3>
      <p class="activity-instruction">Trace e depois escreva sozinho:</p>

      <div class="caligrafia-section">
        <div class="cali-row">
          <span class="cali-modelo">Aa</span>
          <div class="cali-trace">
            <span class="cali-pontilhado">A a A a A a A a A a</span>
          </div>
        </div>
        <div class="cali-row">
          <span class="cali-modelo">Ee</span>
          <div class="cali-trace">
            <span class="cali-pontilhado">E e E e E e E e E e</span>
          </div>
        </div>
        <div class="cali-row">
          <span class="cali-modelo">Ii</span>
          <div class="cali-trace">
            <span class="cali-pontilhado">I i I i I i I i I i</span>
          </div>
        </div>
        <div class="cali-row">
          <span class="cali-modelo">Oo</span>
          <div class="cali-trace">
            <span class="cali-pontilhado">O o O o O o O o O o</span>
          </div>
        </div>
        <div class="cali-row">
          <span class="cali-modelo">Uu</span>
          <div class="cali-trace">
            <span class="cali-pontilhado">U u U u U u U u U u</span>
          </div>
        </div>
      </div>

      <p class="activity-instruction">Agora escreva uma palavra com cada vogal:</p>
      <div class="vocab-grid">
        <div class="vocab-item"><span>A →</span><div class="vocab-line"></div></div>
        <div class="vocab-item"><span>E →</span><div class="vocab-line"></div></div>
        <div class="vocab-item"><span>I →</span><div class="vocab-line"></div></div>
        <div class="vocab-item"><span>O →</span><div class="vocab-line"></div></div>
        <div class="vocab-item"><span>U →</span><div class="vocab-line"></div></div>
      </div>
    </div>
  `;
}

function adicao(topic: string, year: string): string {
  const isAdvanced = ["3º Ano", "4º Ano", "5º Ano"].includes(year);
  const ops = isAdvanced
    ? [["  247", "  138"], ["  563", "  224"], ["  891", "   76"]]
    : [["   12", "    5"], ["   25", "   13"], ["   33", "   24"]];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">➕ Adição: ${topic}</h3>

      <p class="activity-instruction">1) Resolva as continhas:</p>
      <div class="math-grid">
        ${ops.map(([a, b]) => `
          <div class="math-op">
            <div class="math-num">${a}</div>
            <div class="math-num">+ ${b.trimStart()}</div>
            <div class="math-line"></div>
            <div class="math-result"></div>
          </div>`).join("")}
      </div>

      <p class="activity-instruction">2) Complete as adições:</p>
      <div class="complete-ops">
        <div class="complete-op">8 + ___ = 15</div>
        <div class="complete-op">___ + 9 = 20</div>
        <div class="complete-op">14 + ___ = 25</div>
        <div class="complete-op">___ + 17 = 30</div>
      </div>

      <p class="activity-instruction">3) Resolva o probleminha:</p>
      <div class="problem-box">
        <p>🍎 Ana foi à feira com sua mãe. Ela comprou <strong>8 maçãs</strong> e <strong>6 bananas</strong>.
        Quantas frutas Ana comprou no total?</p>
        <p>Conta: ___ + ___ = ___</p>
        <p>Resposta: Ana comprou ___________ frutas.</p>
      </div>
    </div>
  `;
}

function subtracao(topic: string, year: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">➖ Subtração: ${topic}</h3>

      <p class="activity-instruction">1) Resolva as continhas:</p>
      <div class="math-grid">
        <div class="math-op">
          <div class="math-num">   15</div>
          <div class="math-num">-   8</div>
          <div class="math-line"></div>
          <div class="math-result"></div>
        </div>
        <div class="math-op">
          <div class="math-num">   30</div>
          <div class="math-num">-  12</div>
          <div class="math-line"></div>
          <div class="math-result"></div>
        </div>
        <div class="math-op">
          <div class="math-num">   47</div>
          <div class="math-num">-  23</div>
          <div class="math-line"></div>
          <div class="math-result"></div>
        </div>
      </div>

      <p class="activity-instruction">2) Complete as subtrações:</p>
      <div class="complete-ops">
        <div class="complete-op">20 - ___ = 12</div>
        <div class="complete-op">___ - 7 = 8</div>
        <div class="complete-op">25 - ___ = 10</div>
        <div class="complete-op">___ - 14 = 6</div>
      </div>

      <p class="activity-instruction">3) Resolva o probleminha:</p>
      <div class="problem-box">
        <p>🖍️ Pedro tinha <strong>20 lápis de cor</strong>. Ele emprestou <strong>7 lápis</strong> para sua amiga.
        Com quantos lápis Pedro ficou?</p>
        <p>Conta: ___ - ___ = ___</p>
        <p>Resposta: Pedro ficou com ___________ lápis.</p>
      </div>
    </div>
  `;
}

function multiplicacao(topic: string, year: string): string {
  const num = topic.includes("Tabuada do") ? topic.split("Tabuada do")[1].trim() : "2";
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">✖️ Multiplicação: ${topic}</h3>

      <p class="activity-instruction">1) Complete a tabuada do ${num}:</p>
      <div class="tabuada-grid">
        ${Array.from({ length: 10 }, (_, i) => i + 1).map(i => `
          <div class="tabuada-item">
            ${num} × ${i} = <span class="tabuada-blank">${i <= 2 ? String(Number(num) * i) : "____"}</span>
          </div>`).join("")}
      </div>

      <p class="activity-instruction">2) Resolva as contas:</p>
      <div class="math-grid">
        <div class="math-op">
          <div class="math-num">   ${num}</div>
          <div class="math-num">×   5</div>
          <div class="math-line"></div>
          <div class="math-result"></div>
        </div>
        <div class="math-op">
          <div class="math-num">   ${num}</div>
          <div class="math-num">×   8</div>
          <div class="math-line"></div>
          <div class="math-result"></div>
        </div>
      </div>

      <p class="activity-instruction">3) Problema:</p>
      <div class="problem-box">
        <p>🍭 Cada criança ganhou ${num} balinhas. Se há 5 crianças, quantas balinhas foram distribuídas no total?</p>
        <p>Conta: ___ × ___ = ___</p>
        <p>Resposta: ___________ balinhas no total.</p>
      </div>
    </div>
  `;
}

function divisao(topic: string, year: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">➗ Divisão: ${topic}</h3>

      <p class="activity-instruction">1) Resolva as divisões:</p>
      <div class="math-grid">
        <div class="math-op division">
          <div class="math-num">10 ÷ 2 =</div>
          <div class="math-result-inline">____</div>
        </div>
        <div class="math-op division">
          <div class="math-num">16 ÷ 2 =</div>
          <div class="math-result-inline">____</div>
        </div>
        <div class="math-op division">
          <div class="math-num">20 ÷ 4 =</div>
          <div class="math-result-inline">____</div>
        </div>
        <div class="math-op division">
          <div class="math-num">15 ÷ 3 =</div>
          <div class="math-result-inline">____</div>
        </div>
      </div>

      <p class="activity-instruction">2) Problema de divisão:</p>
      <div class="problem-box">
        <p>🍕 A mamãe fez uma pizza com <strong>8 fatias</strong>. Ela quer dividir igualmente entre <strong>4 pessoas</strong>.
        Quantas fatias cada um vai receber?</p>
        <p>Conta: ___ ÷ ___ = ___</p>
        <p>Resposta: Cada pessoa receberá ___________ fatias.</p>
      </div>
    </div>
  `;
}

function problemas(topic: string, year: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🧮 Problemas: ${topic}</h3>
      <p class="activity-instruction">Leia cada problema com atenção e resolva:</p>

      <div class="problem-list">
        <div class="problem-item">
          <p><strong>Problema 1:</strong> 🚌 Um ônibus saiu com <strong>24 passageiros</strong>.
          Na próxima parada, subiram mais <strong>8 pessoas</strong>. Quantas pessoas estão no ônibus agora?</p>
          <div class="problem-solve">
            <p>Operação: ___________________________</p>
            <p>Conta: ___ + ___ = ___</p>
            <p>Resposta: ___________________________</p>
          </div>
        </div>

        <div class="problem-item">
          <p><strong>Problema 2:</strong> 🌸 Mariana colheu <strong>30 flores</strong> no jardim.
          Ela deu <strong>12 flores</strong> para sua avó. Quantas flores Mariana ficou?</p>
          <div class="problem-solve">
            <p>Operação: ___________________________</p>
            <p>Conta: ___ - ___ = ___</p>
            <p>Resposta: ___________________________</p>
          </div>
        </div>

        <div class="problem-item">
          <p><strong>Problema 3:</strong> 📦 Em uma caixa tem <strong>4 fileiras</strong> de laranja com
          <strong>5 laranjas</strong> em cada fileira. Quantas laranjas tem ao todo?</p>
          <div class="problem-solve">
            <p>Operação: ___________________________</p>
            <p>Conta: ___ × ___ = ___</p>
            <p>Resposta: ___________________________</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function sequenciaNumerica(topic: string, year: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔢 Sequência Numérica: ${topic}</h3>
      <p class="activity-instruction">Complete as sequências numéricas:</p>

      <div class="sequences">
        <div class="seq-item">
          <span class="seq-label">De 2 em 2:</span>
          <span class="seq-num">2</span>
          <span class="seq-num">4</span>
          <span class="seq-num">6</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
        </div>
        <div class="seq-item">
          <span class="seq-label">De 5 em 5:</span>
          <span class="seq-num">5</span>
          <span class="seq-num">10</span>
          <span class="seq-num">15</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
        </div>
        <div class="seq-item">
          <span class="seq-label">De 10 em 10:</span>
          <span class="seq-num">10</span>
          <span class="seq-num">20</span>
          <span class="seq-num">30</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
          <span class="seq-blank">___</span>
        </div>
        <div class="seq-item">
          <span class="seq-label">Qual é o anterior?</span>
          <span class="seq-blank">___</span>
          <span class="seq-num">15</span>
          <span class="seq-blank">___</span>
          <span class="seq-num">25</span>
          <span class="seq-blank">___</span>
          <span class="seq-num">35</span>
          <span class="seq-blank">___</span>
        </div>
      </div>

      <p class="activity-instruction">Escreva os números em ordem crescente:</p>
      <div class="order-numbers">
        <div class="numbers-to-order">47 — 12 — 38 — 91 — 5 — 63</div>
        <div class="order-answer">
          <span>___</span><span>___</span><span>___</span>
          <span>___</span><span>___</span><span>___</span>
        </div>
      </div>
    </div>
  `;
}

function geometria(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">📐 Geometria: ${topic}</h3>
      <p class="activity-instruction">1) Observe as formas geométricas e responda:</p>

      <div class="shapes-grid">
        <div class="shape-item">
          <div class="shape circle-shape">⬤</div>
          <p>CÍRCULO</p>
          <p>Lados: ____</p>
        </div>
        <div class="shape-item">
          <div class="shape square-shape">⬛</div>
          <p>QUADRADO</p>
          <p>Lados: ____</p>
        </div>
        <div class="shape-item">
          <div class="shape triangle-shape">▲</div>
          <p>TRIÂNGULO</p>
          <p>Lados: ____</p>
        </div>
        <div class="shape-item">
          <div class="shape rect-shape">▬</div>
          <p>RETÂNGULO</p>
          <p>Lados: ____</p>
        </div>
      </div>

      <p class="activity-instruction">2) Conte e escreva quantas figuras há em cada grupo:</p>
      <div class="count-shapes">
        <div class="count-shape-item">
          <p>⬛ ⬛ ⬛ ⬛ ⬛</p>
          <p>___ quadrados</p>
        </div>
        <div class="count-shape-item">
          <p>🔺 🔺 🔺</p>
          <p>___ triângulos</p>
        </div>
        <div class="count-shape-item">
          <p>⬤ ⬤ ⬤ ⬤ ⬤ ⬤</p>
          <p>___ círculos</p>
        </div>
      </div>

      <p class="activity-instruction">3) Desenhe as formas geométricas pedidas:</p>
      <div class="draw-shapes">
        <div class="draw-item">
          <div class="draw-box"></div>
          <p>1 triângulo e<br/>2 círculos</p>
        </div>
        <div class="draw-item">
          <div class="draw-box"></div>
          <p>Uma casa usando<br/>quadrado e triângulo</p>
        </div>
      </div>
    </div>
  `;
}
