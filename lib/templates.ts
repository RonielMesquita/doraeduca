import { ActivityConfig } from "./types";

function imgTag(prompt: string, seed: number): string {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `simple cute cartoon ${prompt} kids white background`
  )}?width=110&height=110&nologo=true&seed=${seed}`;
  return `<img class="figurinha-img" src="${url}" alt="" loading="lazy" onerror="this.style.display='none'"/>`;
}

function answerLines(n: number): string {
  return Array.from({ length: n }, () => `<div class="answer-line"></div>`).join("");
}

export function generateMockActivity(config: ActivityConfig): string {
  const q = config.questionCount ?? 5;
  const topic = config.topic || getDefaultTopic(config.subject, config.activityType);

  switch (config.subject) {
    case "portugues":   return buildPortugues(config.activityType, topic, q);
    case "matematica":  return buildMatematica(config.activityType, topic, q);
    case "ciencias":    return buildCiencias(config.activityType, topic, q);
    case "historia":    return buildHistoria(topic, q);
    case "geografia":   return buildGeografia(topic, q);
    default:            return buildPortugues(config.activityType, topic, q);
  }
}

function getDefaultTopic(subject: string, type: string): string {
  const map: Record<string, Record<string, string>> = {
    portugues:  { "Família Silábica": "Família da Letra B", "Complete as Lacunas": "Animais da Fazenda", "Interpretação de Texto": "A Borboleta e a Flor", "Caça-Palavras": "Frutas" },
    matematica: { "Adição": "Números até 20", "Subtração": "Números até 20", "Multiplicação": "Tabuada do 2", "Problemas": "Dia a Dia" },
  };
  return map[subject]?.[type] ?? "Revisão Geral";
}

// ── Português ─────────────────────────────────────────────────────────────────

function buildPortugues(type: string, topic: string, q: number): string {
  switch (type) {
    case "Família Silábica":      return familiasSilabicas(topic, q);
    case "Complete as Lacunas":   return completeLacunas(topic, q);
    case "Interpretação de Texto":return interpretacaoTexto(topic, q);
    case "Separação de Sílabas":  return separacaoSilabas(topic, q);
    case "Caça-Palavras":         return cacaPalavras(topic);
    case "Cruzadinha":            return cruzadinha(topic);
    case "Caligrafia":            return caligrafia(topic);
    case "Ligar as Colunas":      return ligarColunas(topic);
    default:                      return familiasSilabicas(topic, q);
  }
}

function familiasSilabicas(topic: string, q: number): string {
  const L = (topic.includes("Letra") ? topic.split("Letra")[1].trim() : "B").charAt(0).toUpperCase();

  const banco: Record<string, { silabas: string[]; items: Array<{ emoji: string; prompt: string; word: string; blank: string }> }> = {
    B: { silabas: ["BA","BE","BI","BO","BU"], items: [
      { emoji:"⚽", prompt:"soccer ball",       word:"BOLA",   blank:"___LA"   },
      { emoji:"🍌", prompt:"banana fruit",      word:"BANANA", blank:"___NANA" },
      { emoji:"🎈", prompt:"balloon party",     word:"BEXIGA", blank:"___XIGA" },
      { emoji:"🐛", prompt:"cute caterpillar",  word:"BICHO",  blank:"___CHO"  },
      { emoji:"🚲", prompt:"bicycle",           word:"BICICLETA", blank:"___CICLETA" },
      { emoji:"🥊", prompt:"boxing glove",      word:"BOXE",   blank:"___XE"   },
    ]},
    C: { silabas: ["CA","CE","CI","CO","CU"], items: [
      { emoji:"🏠", prompt:"cartoon house",     word:"CASA",   blank:"___SA"   },
      { emoji:"🐴", prompt:"horse animal",      word:"CAVALO", blank:"___VALO" },
      { emoji:"🐇", prompt:"rabbit animal",     word:"COELHO", blank:"___ELHO" },
      { emoji:"🎯", prompt:"3d cube shape",     word:"CUBO",   blank:"___BO"   },
      { emoji:"☁️", prompt:"cloud sky",         word:"CÉU",    blank:"___U"    },
      { emoji:"🍫", prompt:"chocolate bar",     word:"CHOCOLATE", blank:"___OCOLATE" },
    ]},
    M: { silabas: ["MA","ME","MI","MO","MU"], items: [
      { emoji:"🍎", prompt:"apple fruit",       word:"MAÇÃ",   blank:"___ÇÃ"   },
      { emoji:"🌊", prompt:"sea ocean waves",   word:"MAR",    blank:"___R"    },
      { emoji:"🍯", prompt:"honey jar",         word:"MEL",    blank:"___L"    },
      { emoji:"🌽", prompt:"corn vegetable",    word:"MILHO",  blank:"___LHO"  },
      { emoji:"🏍️", prompt:"motorcycle",        word:"MOTO",   blank:"___TO"   },
      { emoji:"🐒", prompt:"monkey animal",     word:"MACACO", blank:"___CACO" },
    ]},
    P: { silabas: ["PA","PE","PI","PO","PU"], items: [
      { emoji:"🦆", prompt:"duck bird",         word:"PATO",   blank:"___TO"   },
      { emoji:"🍐", prompt:"pear fruit",        word:"PERA",   blank:"___RA"   },
      { emoji:"🐟", prompt:"fish sea",          word:"PEIXE",  blank:"___IXE"  },
      { emoji:"🪁", prompt:"kite toy flying",   word:"PIPA",   blank:"___PA"   },
      { emoji:"🐾", prompt:"dog paw print",     word:"PATINHA",blank:"___TINHA" },
      { emoji:"🌿", prompt:"plant herbs green", word:"PLANTA", blank:"___ANTA" },
    ]},
    V: { silabas: ["VA","VE","VI","VO","VU"], items: [
      { emoji:"🐄", prompt:"cow farm animal",   word:"VACA",   blank:"___CA"   },
      { emoji:"🕯️", prompt:"candle light",      word:"VELA",   blank:"___LA"   },
      { emoji:"🍇", prompt:"grapes fruit",      word:"UVA",    blank:"U___"    },
      { emoji:"🏘️", prompt:"village houses",    word:"VILA",   blank:"___LA"   },
      { emoji:"✈️", prompt:"airplane flight",   word:"VOO",    blank:"___O"    },
      { emoji:"🌬️", prompt:"wind breeze",       word:"VENTO",  blank:"___NTO"  },
    ]},
  };

  const data = banco[L] ?? banco["B"];
  const shown = data.items.slice(0, Math.min(6, q + 2));

  const extraQs = Math.max(0, q - 3);
  const extras = Array.from({ length: extraQs }, (_, i) => {
    const item = data.items[i % data.items.length];
    return `<li>Forme uma frase com a palavra <strong>${item.word}</strong>:${answerLines(1)}</li>`;
  });

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">📝 Família Silábica da Letra ${L}</h3>

      <div class="familia-box">
        <div class="familia-header">🌟 Família do ${L}${L.toLowerCase()} 🌟</div>
        <div class="silabas-row">
          ${data.silabas.map(s => `<span class="silaba-card">${s}</span>`).join("")}
        </div>
      </div>

      <p class="activity-instruction">1) Leia em voz alta 3 vezes:</p>
      <div class="read-aloud-box">${data.silabas.join(" — ")}</div>

      <p class="activity-instruction">2) Observe as figurinhas e escreva o nome:</p>
      <div class="figurinhas-grid">
        ${shown.map((f, i) => `
          <div class="figurinha-card ${["yellow","blue","green","pink","yellow","blue"][i]}">
            ${imgTag(f.prompt, i + 1)}
            <span class="figurinha-emoji-sm">${f.emoji}</span>
            <div class="figurinha-write"></div>
            <span class="figurinha-hint">dica: ${f.blank}</span>
          </div>`).join("")}
      </div>

      <p class="activity-instruction">3) Complete com a sílaba correta:</p>
      <div class="words-grid">
        ${shown.slice(0, 4).map((f, i) => `
          <div class="word-item">
            <span class="word-number">${i + 1})</span>
            <span class="word-blank">${f.blank}</span>
            <span class="word-hint">${f.emoji}</span>
          </div>`).join("")}
      </div>

      ${extras.length > 0 ? `<p class="activity-instruction">4) Escreva frases:</p><ol class="activity-list" start="1">${extras.join("")}</ol>` : ""}

      <p class="activity-instruction">${q > 3 ? q + 1 : 4}) Desenhe uma palavra com a letra <strong>${L}</strong>:</p>
      <div class="drawing-box small"></div>
    </div>`;
}

function completeLacunas(topic: string, q: number): string {
  const todos = [
    { emoji:"🐄", prompt:"cow farm",       name:"vaca",     frase:"A ___________ dá leite.",             sound:"muuu"     },
    { emoji:"🐕", prompt:"dog puppy",      name:"cachorro", frase:"O ___________ late muito.",           sound:"au au"    },
    { emoji:"🐔", prompt:"hen chicken",    name:"galinha",  frase:"A ___________ bota ovos.",            sound:"cocoricó" },
    { emoji:"🦆", prompt:"duck water",     name:"pato",     frase:"O ___________ nada na lagoa.",        sound:"quá quá"  },
    { emoji:"🐴", prompt:"horse running",  name:"cavalo",   frase:"O ___________ corre muito rápido.",   sound:"iiihh"    },
    { emoji:"🐱", prompt:"cat kitten",     name:"gato",     frase:"O ___________ faz miau.",             sound:"miau"     },
    { emoji:"🐑", prompt:"sheep wool",     name:"ovelha",   frase:"A ___________ dá lã.",                sound:"béé"      },
    { emoji:"🐖", prompt:"pig farm",       name:"porco",    frase:"O ___________ vive na chiqueiro.",    sound:"oinc"     },
    { emoji:"🐓", prompt:"rooster bird",   name:"galo",     frase:"O ___________ canta de manhã.",       sound:"cocoricó" },
    { emoji:"🐇", prompt:"rabbit cute",    name:"coelho",   frase:"O ___________ tem orelhas grandes.",  sound:"..."      },
  ];
  const animais = todos.slice(0, Math.min(q, todos.length));

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">✏️ Complete as Lacunas: ${topic}</h3>

      <p class="activity-instruction">1) Conheça os animais:</p>
      <div class="figurinhas-grid">
        ${animais.map((a, i) => `
          <div class="figurinha-card ${["yellow","blue","green","pink","yellow","blue","green","yellow","blue","pink"][i]}">
            ${imgTag(a.prompt, i + 10)}
            <span class="figurinha-emoji-sm">${a.emoji}</span>
            <span class="figurinha-name">${a.name.toUpperCase()}</span>
            <span class="figurinha-hint">${a.sound}</span>
          </div>`).join("")}
      </div>

      <p class="activity-instruction">2) Use os nomes para completar as frases:</p>
      <div class="word-box">
        ${animais.map(a => `<span class="word-tag">${a.emoji} ${a.name}</span>`).join("")}
      </div>
      <ol class="activity-list">
        ${animais.map(a => `<li>${a.frase}</li>`).join("")}
      </ol>

      <p class="activity-instruction">${animais.length + 1}) Escreva uma frase sobre seu animal favorito:</p>
      ${answerLines(2)}
    </div>`;
}

function interpretacaoTexto(topic: string, q: number): string {
  const perguntas = [
    { p: "Qual é o título do texto?",                    l: 1 },
    { p: "Quais são os personagens do texto?",           l: 1 },
    { p: "Onde se passa a história?",                    l: 1 },
    { p: "O que aconteceu no início da história?",       l: 2 },
    { p: "O que aconteceu no final?",                    l: 2 },
    { p: "Qual foi o momento mais importante?",          l: 2 },
    { p: "O que você achou do texto? Por quê?",          l: 2 },
    { p: "Escreva uma nova continuação para o texto.",   l: 3 },
    { p: "Qual a mensagem principal do texto?",          l: 2 },
    { p: "Crie um novo título para o texto.",            l: 1 },
  ];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">📚 Interpretação de Texto: ${topic}</h3>
      <div class="text-box">
        <h4 style="text-align:center; margin-bottom:8px;">A Borboleta e a Flor</h4>
        <p>Era uma vez uma linda borboleta colorida que voava pelo jardim.
        Ela tinha asas amarelas e azuis que brilhavam no sol.</p>
        <p>A borboleta parou em uma flor vermelha para beber seu néctar.
        A flor ficou muito feliz com a visita.</p>
        <p>— Obrigada por me visitar! — disse a flor.</p>
        <p>— Obrigada pelo alimento! — respondeu a borboleta.</p>
        <p>E assim elas se tornaram grandes amigas.</p>
      </div>
      <ol class="activity-list">
        ${perguntas.slice(0, q).map(({ p, l }) => `<li>${p}${answerLines(l)}</li>`).join("")}
      </ol>
      <p class="activity-instruction">${q + 1}) Desenhe a cena favorita do texto:</p>
      <div class="drawing-box small"></div>
    </div>`;
}

function separacaoSilabas(topic: string, q: number): string {
  const palavras = [
    { w: "BOLA", s: "BO-LA" }, { w: "ESCOLA", s: "ES-CO-LA" }, { w: "BORBOLETA", s: "BOR-BO-LE-TA" },
    { w: "CACHORRO", s: "CA-CHOR-RO" }, { w: "PROFESSOR", s: "PRO-FES-SOR" }, { w: "BANANA", s: "BA-NA-NA" },
    { w: "TARTARUGA", s: "TAR-TA-RU-GA" }, { w: "MARIPOSA", s: "MA-RI-PO-SA" }, { w: "ELEFANTE", s: "E-LE-FAN-TE" },
    { w: "COMPUTADOR", s: "COM-PU-TA-DOR" },
  ];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">✂️ Separação de Sílabas: ${topic}</h3>
      <p class="activity-instruction">Separe as sílabas com hífen ( - ). O primeiro já está feito:</p>
      <div class="silaba-exercise">
        ${palavras.slice(0, q).map((p, i) => `
          <div class="silaba-row">
            <span class="silaba-word">${p.w}</span>
            <span class="silaba-arrow">→</span>
            ${i === 0
              ? `<div class="silaba-answer">${p.s}</div>`
              : `<div class="silaba-answer-blank"></div>`}
          </div>`).join("")}
      </div>
      <p class="activity-instruction">Quantas sílabas? Escreva o número:</p>
      <div class="count-grid">
        ${palavras.slice(0, Math.min(4, q)).map(p => `
          <div class="count-item"><span>${p.w}</span><div class="count-box"></div></div>`).join("")}
      </div>
    </div>`;
}

function cacaPalavras(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔍 Caça-Palavras: ${topic}</h3>
      <p class="activity-instruction">Encontre as frutas no caça-palavras e marque:</p>
      <div class="two-columns">
        <div>
          <table class="ws-table">
            <tbody>
              <tr><td>M</td><td>A</td><td>C</td><td>A</td><td>P</td><td>E</td><td>R</td><td>A</td></tr>
              <tr><td>U</td><td>V</td><td>A</td><td>X</td><td>L</td><td>I</td><td>M</td><td>A</td></tr>
              <tr><td>B</td><td>A</td><td>N</td><td>A</td><td>N</td><td>A</td><td>Z</td><td>K</td></tr>
              <tr><td>L</td><td>A</td><td>R</td><td>A</td><td>N</td><td>J</td><td>A</td><td>P</td></tr>
              <tr><td>M</td><td>A</td><td>M</td><td>A</td><td>O</td><td>U</td><td>V</td><td>A</td></tr>
              <tr><td>A</td><td>B</td><td>A</td><td>C</td><td>A</td><td>X</td><td>I</td><td>M</td></tr>
              <tr><td>M</td><td>O</td><td>R</td><td>A</td><td>N</td><td>G</td><td>O</td><td>N</td></tr>
              <tr><td>C</td><td>O</td><td>C</td><td>O</td><td>S</td><td>T</td><td>R</td><td>K</td></tr>
            </tbody>
          </table>
        </div>
        <div class="word-list-box">
          <p><strong>Encontre:</strong></p>
          <ul>
            <li>☐ MAÇA</li><li>☐ PERA</li><li>☐ UVA</li><li>☐ BANANA</li>
            <li>☐ LARANJA</li><li>☐ MAMAO</li><li>☐ MORANGO</li><li>☐ COCO</li>
          </ul>
        </div>
      </div>
    </div>`;
}

function cruzadinha(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🧩 Cruzadinha: ${topic}</h3>
      <p class="activity-instruction">Preencha a cruzadinha com as dicas:</p>
      <div class="two-columns">
        <table class="cw-table">
          <tbody>
            <tr><td class="cw-black"></td><td class="cw-cell"><span class="cw-num">1</span></td><td class="cw-black"></td><td class="cw-black"></td></tr>
            <tr><td class="cw-cell"><span class="cw-num">2</span></td><td class="cw-cell"></td><td class="cw-cell"></td><td class="cw-cell"></td></tr>
            <tr><td class="cw-black"></td><td class="cw-cell"></td><td class="cw-black"></td><td class="cw-black"></td></tr>
            <tr><td class="cw-black"></td><td class="cw-cell"></td><td class="cw-black"></td><td class="cw-black"></td></tr>
          </tbody>
        </table>
        <div class="crossword-clues">
          <p><strong>Horizontal:</strong></p>
          <p>2. 🐕 Animal que faz "au au"</p>
          <br/>
          <p><strong>Vertical:</strong></p>
          <p>1. 🐱 Animal que faz "miau"</p>
        </div>
      </div>
    </div>`;
}

function caligrafia(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🖊️ Caligrafia: ${topic}</h3>
      <p class="activity-instruction">Trace e depois escreva sozinho:</p>
      <div class="caligrafia-section">
        ${["Aa","Ee","Ii","Oo","Uu"].map(v => `
          <div class="cali-row">
            <span class="cali-modelo">${v}</span>
            <div class="cali-trace"><span class="cali-pontilhado">${v[0]} ${v[1]} ${v[0]} ${v[1]} ${v[0]} ${v[1]} ${v[0]} ${v[1]} ${v[0]} ${v[1]}</span></div>
          </div>`).join("")}
      </div>
      <p class="activity-instruction">Escreva uma palavra com cada vogal:</p>
      <div class="vocab-grid">
        ${["A","E","I","O","U"].map(v => `
          <div class="vocab-item"><span>${v} →</span><div class="vocab-line"></div></div>`).join("")}
      </div>
    </div>`;
}

function ligarColunas(topic: string): string {
  const pares = [
    { e:"🐱", esq:"GATO",    dir:"GATOS"    },
    { e:"🌺", esq:"FLOR",    dir:"FLORES"   },
    { e:"🐦", esq:"PÁSSARO", dir:"PÁSSAROS" },
    { e:"📚", esq:"LIVRO",   dir:"LIVROS"   },
    { e:"🌳", esq:"ÁRVORE",  dir:"ÁRVORES"  },
  ];
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔗 Ligar as Colunas: ${topic}</h3>
      <p class="activity-instruction">Ligue o singular ao seu plural:</p>
      <div class="columns-exercise">
        <div class="column-left">
          ${pares.map(p => `<div class="col-item">${p.e} ${p.esq}</div>`).join("")}
        </div>
        <div class="column-dots">
          ${pares.map(() => `<div class="dot-row"><div class="dot"></div><div class="dot-line"></div><div class="dot"></div></div>`).join("")}
        </div>
        <div class="column-right">
          ${[...pares].reverse().map(p => `<div class="col-item">${p.dir} ${p.e}</div>`).join("")}
        </div>
      </div>
    </div>`;
}

// ── Matemática ────────────────────────────────────────────────────────────────

function buildMatematica(type: string, topic: string, q: number): string {
  switch (type) {
    case "Adição":            return adicao(topic, q);
    case "Subtração":         return subtracao(topic, q);
    case "Multiplicação":     return multiplicacao(topic, q);
    case "Divisão":           return divisao(topic, q);
    case "Problemas":         return problemas(topic, q);
    case "Sequência Numérica":return sequencia(topic);
    case "Geometria":         return geometria(topic);
    default:                  return adicao(topic, q);
  }
}

function mathOp(a: string, op: string, b: string): string {
  return `<div class="math-op">
    <div class="math-num">${a.padStart(6)}</div>
    <div class="math-num">${op} ${b.padStart(4)}</div>
    <div class="math-line"></div>
    <div class="math-result"></div>
  </div>`;
}

function adicao(topic: string, q: number): string {
  const contas = [["12","5"],["25","13"],["33","24"],["47","18"],["56","29"],["74","18"],["83","9"],["65","27"],["91","8"],["44","37"]];
  const selected = contas.slice(0, Math.min(q, contas.length));
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">➕ Adição: ${topic}</h3>
      <p class="activity-instruction">1) Resolva as continhas:</p>
      <div class="math-grid">${selected.map(([a,b]) => mathOp(a,"+",b)).join("")}</div>
      <p class="activity-instruction">2) Complete:</p>
      <div class="complete-ops">
        <div class="complete-op">8 + ___ = 15</div>
        <div class="complete-op">___ + 9 = 20</div>
        <div class="complete-op">14 + ___ = 25</div>
        <div class="complete-op">___ + 17 = 30</div>
      </div>
      <p class="activity-instruction">3) Probleminha:</p>
      <div class="problem-box">
        <p>🍎 Ana comprou <strong>8 maçãs</strong> e <strong>6 bananas</strong>. Quantas frutas ao total?</p>
        <p>Conta: ___ + ___ = ___</p>
        <p>Resposta: ___________________________</p>
      </div>
    </div>`;
}

function subtracao(topic: string, q: number): string {
  const contas = [["15","8"],["30","12"],["47","23"],["62","17"],["85","39"],["73","28"],["91","45"],["50","17"],["66","29"],["88","43"]];
  const selected = contas.slice(0, Math.min(q, contas.length));
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">➖ Subtração: ${topic}</h3>
      <p class="activity-instruction">1) Resolva as continhas:</p>
      <div class="math-grid">${selected.map(([a,b]) => mathOp(a,"-",b)).join("")}</div>
      <p class="activity-instruction">2) Complete:</p>
      <div class="complete-ops">
        <div class="complete-op">20 - ___ = 12</div>
        <div class="complete-op">___ - 7 = 8</div>
        <div class="complete-op">25 - ___ = 10</div>
        <div class="complete-op">___ - 14 = 6</div>
      </div>
      <p class="activity-instruction">3) Probleminha:</p>
      <div class="problem-box">
        <p>🖍️ Pedro tinha <strong>20 lápis</strong>. Emprestou <strong>7</strong>. Quantos ficaram?</p>
        <p>Conta: ___ - ___ = ___</p>
        <p>Resposta: ___________________________</p>
      </div>
    </div>`;
}

function multiplicacao(topic: string, q: number): string {
  const num = topic.match(/\d+/)?.[0] ?? "2";
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">✖️ Multiplicação: ${topic}</h3>
      <p class="activity-instruction">1) Complete a tabuada do ${num}:</p>
      <div class="tabuada-grid">
        ${Array.from({length:10},(_,i)=>`<div class="tabuada-item">${num} × ${i+1} = <span class="tabuada-blank">${i<2?String(Number(num)*(i+1)):"____"}</span></div>`).join("")}
      </div>
      <p class="activity-instruction">2) Probleminha:</p>
      <div class="problem-box">
        <p>🍭 Cada criança ganhou ${num} balinhas. São 5 crianças. Quantas balinhas ao total?</p>
        <p>Conta: ___ × ___ = ___</p>
        <p>Resposta: ___________________________</p>
      </div>
    </div>`;
}

function divisao(topic: string, q: number): string {
  const ops = [["10","2"],["16","4"],["20","5"],["18","3"],["24","6"],["30","5"],["36","4"],["48","8"],["56","7"],["72","9"]];
  const selected = ops.slice(0, Math.min(q, ops.length));
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">➗ Divisão: ${topic}</h3>
      <p class="activity-instruction">1) Resolva as divisões:</p>
      <div class="complete-ops">
        ${selected.map(([a,b]) => `<div class="complete-op">${a} ÷ ${b} = ____</div>`).join("")}
      </div>
      <p class="activity-instruction">2) Probleminha:</p>
      <div class="problem-box">
        <p>🍕 Uma pizza tem <strong>8 fatias</strong> para <strong>4 pessoas</strong>. Quantas fatias cada um recebe?</p>
        <p>Conta: ___ ÷ ___ = ___</p>
        <p>Resposta: ___________________________</p>
      </div>
    </div>`;
}

function problemas(topic: string, q: number): string {
  const banco = [
    { e:"🚌", txt:`Um ônibus saiu com <strong>24 passageiros</strong>. Subiram mais <strong>8</strong>. Quantos agora?`, op:"___ + ___ = ___" },
    { e:"🌸", txt:`Mariana colheu <strong>30 flores</strong> e deu <strong>12</strong> para a avó. Quantas ficaram?`, op:"___ - ___ = ___" },
    { e:"📦", txt:`Há <strong>4 fileiras</strong> com <strong>5 laranjas</strong> cada. Quantas ao todo?`, op:"___ × ___ = ___" },
    { e:"🍭", txt:`João tinha <strong>50 balas</strong> e deu <strong>5</strong> para cada amigo. Quantos amigos?`, op:"___ ÷ ___ = ___" },
    { e:"🎒", txt:`Ana comprou <strong>3 cadernos</strong> por R$<strong>7</strong> cada. Quanto gastou?`, op:"___ × ___ = ___" },
    { e:"🍎", txt:`Havia <strong>45 maçãs</strong>. Venderam <strong>18</strong>. Quantas sobraram?`, op:"___ - ___ = ___" },
    { e:"⚽", txt:`O time marcou <strong>3 gols</strong> no 1º tempo e <strong>2</strong> no 2º. Quantos ao total?`, op:"___ + ___ = ___" },
    { e:"🌽", txt:`O fazendeiro colheu <strong>96 espigas</strong> e quer pôr <strong>8 por saco</strong>. Quantos sacos?`, op:"___ ÷ ___ = ___" },
    { e:"🎨", txt:`Luiza tem <strong>4 caixas</strong> com <strong>12 lápis</strong> cada. Quantos lápis ao todo?`, op:"___ × ___ = ___" },
    { e:"🐟", txt:`Um aquário tem <strong>6 fileiras</strong> com <strong>8 peixes</strong> cada. Quantos peixes?`, op:"___ × ___ = ___" },
  ];
  const selected = banco.slice(0, Math.min(q, banco.length));
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🧮 Problemas: ${topic}</h3>
      <p class="activity-instruction">Leia, resolva e escreva a resposta:</p>
      <div class="problem-list">
        ${selected.map((p,i) => `
          <div class="problem-item">
            <p><strong>Problema ${i+1}:</strong> ${p.e} ${p.txt}</p>
            <div class="problem-solve">
              <p>Operação: ___________________________</p>
              <p>Conta: ${p.op}</p>
              <p>Resposta: ___________________________</p>
            </div>
          </div>`).join("")}
      </div>
    </div>`;
}

function sequencia(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔢 Sequência Numérica: ${topic}</h3>
      <p class="activity-instruction">Complete as sequências:</p>
      <div class="sequences">
        <div class="seq-item"><span class="seq-label">De 2 em 2:</span><span class="seq-num">2</span><span class="seq-num">4</span><span class="seq-num">6</span><span class="seq-blank">___</span><span class="seq-blank">___</span><span class="seq-blank">___</span><span class="seq-blank">___</span></div>
        <div class="seq-item"><span class="seq-label">De 5 em 5:</span><span class="seq-num">5</span><span class="seq-num">10</span><span class="seq-num">15</span><span class="seq-blank">___</span><span class="seq-blank">___</span><span class="seq-blank">___</span><span class="seq-blank">___</span></div>
        <div class="seq-item"><span class="seq-label">De 10 em 10:</span><span class="seq-num">10</span><span class="seq-num">20</span><span class="seq-num">30</span><span class="seq-blank">___</span><span class="seq-blank">___</span><span class="seq-blank">___</span><span class="seq-blank">___</span></div>
        <div class="seq-item"><span class="seq-label">Anterior e posterior:</span><span class="seq-blank">___</span><span class="seq-num">15</span><span class="seq-blank">___</span><span class="seq-num">25</span><span class="seq-blank">___</span><span class="seq-num">35</span><span class="seq-blank">___</span></div>
      </div>
      <p class="activity-instruction">Ordem crescente: 47 — 12 — 38 — 91 — 5 — 63</p>
      <div class="order-answer"><span>___</span><span>___</span><span>___</span><span>___</span><span>___</span><span>___</span></div>
    </div>`;
}

function geometria(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">📐 Geometria: ${topic}</h3>
      <p class="activity-instruction">1) Escreva o número de lados de cada figura:</p>
      <div class="shapes-grid">
        <div class="shape-item"><div class="shape">⬤</div><p>CÍRCULO</p><p>Lados: ____</p></div>
        <div class="shape-item"><div class="shape">⬛</div><p>QUADRADO</p><p>Lados: ____</p></div>
        <div class="shape-item"><div class="shape">▲</div><p>TRIÂNGULO</p><p>Lados: ____</p></div>
        <div class="shape-item"><div class="shape">▬</div><p>RETÂNGULO</p><p>Lados: ____</p></div>
      </div>
      <p class="activity-instruction">2) Conte as figuras:</p>
      <div class="count-shapes">
        <div class="count-shape-item"><p>⬛ ⬛ ⬛ ⬛ ⬛</p><p>___ quadrados</p></div>
        <div class="count-shape-item"><p>🔺 🔺 🔺</p><p>___ triângulos</p></div>
        <div class="count-shape-item"><p>⬤ ⬤ ⬤ ⬤ ⬤ ⬤</p><p>___ círculos</p></div>
      </div>
      <p class="activity-instruction">3) Desenhe uma casa usando quadrado e triângulo:</p>
      <div class="drawing-box small"></div>
    </div>`;
}

// ── Ciências ──────────────────────────────────────────────────────────────────

function buildCiencias(type: string, topic: string, q: number): string {
  if (type === "Animais" || topic.toLowerCase().includes("animal")) return cienciasAnimais(topic, q);
  if (type === "Plantas e Natureza") return cienciasPlants(topic, q);
  return cienciasGeral(type, topic, q);
}

function cienciasAnimais(topic: string, q: number): string {
  const animais = [
    { emoji:"🦁", prompt:"lion wild animal", name:"LEÃO",      tipo:"Mamífero", habitat:"Savana"  },
    { emoji:"🐘", prompt:"elephant animal",   name:"ELEFANTE", tipo:"Mamífero", habitat:"Savana"  },
    { emoji:"🦜", prompt:"parrot tropical",   name:"PAPAGAIO", tipo:"Ave",      habitat:"Floresta"},
    { emoji:"🐊", prompt:"crocodile river",   name:"CROCODILO",tipo:"Réptil",   habitat:"Rio"     },
    { emoji:"🐟", prompt:"fish tropical sea", name:"PEIXE",    tipo:"Peixe",    habitat:"Mar"     },
    { emoji:"🐸", prompt:"frog pond green",   name:"SAPO",     tipo:"Anfíbio",  habitat:"Lagoa"   },
    { emoji:"🐺", prompt:"wolf wild animal",  name:"LOBO",     tipo:"Mamífero", habitat:"Floresta"},
    { emoji:"🦋", prompt:"butterfly colorful",name:"BORBOLETA",tipo:"Inseto",   habitat:"Jardim"  },
  ];
  const shown = animais.slice(0, Math.min(6, animais.length));
  const extraQs = Array.from({ length: Math.max(0, q - 3) }, (_, i) => {
    const a = animais[i % animais.length];
    const opts = [
      `O ${a.name.toLowerCase()} é um animal ___________. (doméstico / selvagem)`,
      `O que o ${a.name.toLowerCase()} come? ___________`,
      `O ${a.name.toLowerCase()} tem ___________ patas.`,
      `Qual animal vive na água? ___________`,
      `Cite um animal da floresta: ___________`,
    ];
    return `<li>${opts[i % opts.length]}${answerLines(1)}</li>`;
  });

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔬 Ciências: ${topic || "Animais"}</h3>
      <p class="activity-instruction">1) Observe os animais:</p>
      <div class="figurinhas-grid">
        ${shown.map((a,i) => `
          <div class="figurinha-card ${["yellow","blue","green","pink","blue","green"][i]}">
            ${imgTag(a.prompt, i + 20)}
            <span class="figurinha-emoji-sm">${a.emoji}</span>
            <span class="figurinha-name">${a.name}</span>
          </div>`).join("")}
      </div>
      <p class="activity-instruction">2) Complete a tabela:</p>
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
            ${shown.map((a,i) => `
              <tr style="background:${i%2===0?"white":"#f9fafb"}">
                <td style="padding:6px 8px; border:1px solid #e5e7eb;">${a.emoji} ${a.name}</td>
                <td style="padding:6px 8px; border:1px solid #e5e7eb; text-align:center;">${a.tipo}</td>
                <td style="padding:6px 8px; border:1px solid #e5e7eb; text-align:center;">${a.habitat}</td>
                <td style="padding:6px 8px; border:1px solid #e5e7eb;"></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      ${extraQs.length > 0 ? `<p class="activity-instruction">3) Responda:</p><ol class="activity-list">${extraQs.join("")}</ol>` : ""}
      <p class="activity-instruction">Desenhe seu animal favorito:</p>
      <div class="drawing-box small"></div>
    </div>`;
}

function cienciasPlants(topic: string, q: number): string {
  const plants = [
    { emoji:"🌻", prompt:"sunflower garden",    name:"GIRASSOL" },
    { emoji:"🌵", prompt:"cactus desert",       name:"CACTO"    },
    { emoji:"🌳", prompt:"big tree nature",     name:"ÁRVORE"   },
    { emoji:"🌿", prompt:"herb green plant",    name:"ERVA"     },
    { emoji:"🍄", prompt:"mushroom forest",     name:"COGUMELO" },
    { emoji:"🌱", prompt:"seedling sprout",     name:"MUDA"     },
  ];
  const perguntas = [
    "As plantas precisam de ___________, ___________ e ___________ para viver.",
    "A parte que absorve água do solo é: ___________",
    "A parte que faz fotossíntese é: ___________",
    "Cite 2 plantas que você conhece: ___________ e ___________",
    "Uma planta que dá frutos: ___________",
    "Uma planta medicinal: ___________",
    "As folhas servem para: ___________",
    "As flores servem para: ___________",
    "O caule serve para: ___________",
    "As raízes servem para: ___________",
  ];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🌿 Ciências: Plantas e Natureza</h3>
      <p class="activity-instruction">1) Observe as plantas:</p>
      <div class="figurinhas-grid">
        ${plants.map((p,i) => `
          <div class="figurinha-card green">
            ${imgTag(p.prompt, i + 30)}
            <span class="figurinha-emoji-sm">${p.emoji}</span>
            <span class="figurinha-name">${p.name}</span>
          </div>`).join("")}
      </div>
      <p class="activity-instruction">2) Responda:</p>
      <ol class="activity-list">
        ${perguntas.slice(0,q).map(p=>`<li>${p}${answerLines(1)}</li>`).join("")}
      </ol>
      <p class="activity-instruction">${q+1}) Desenhe uma planta e identifique as partes:</p>
      <div class="drawing-box"></div>
    </div>`;
}

function cienciasGeral(type: string, topic: string, q: number): string {
  const perguntas = [
    `O que é ${topic}?`,
    `Onde encontramos ${topic} na natureza?`,
    `Qual a importância de ${topic}?`,
    `Como ${topic} se relaciona com outros seres vivos?`,
    `Cite 2 exemplos de ${topic}.`,
    `Desenhe e explique ${topic}.`,
    `${topic} é benéfico ao ser humano? Por quê?`,
    `O que você aprendeu sobre ${topic}?`,
  ];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔬 ${type}: ${topic}</h3>
      <div class="figurinhas-grid-3">
        <div class="figurinha-card blue">
          ${imgTag(topic + " science", 40, "figurinha-img-lg")}
          <span class="figurinha-emoji">🔬</span>
          <span class="figurinha-name">${topic.toUpperCase()}</span>
        </div>
        <div style="grid-column:span 2; padding:8px;">
          <ol class="activity-list">
            ${perguntas.slice(0,Math.min(q,5)).map(p=>`<li>${p}${answerLines(1)}</li>`).join("")}
          </ol>
        </div>
      </div>
      ${q>5?`<ol class="activity-list" start="6">${perguntas.slice(5,q).map(p=>`<li>${p}${answerLines(1)}</li>`).join("")}</ol>`:""}
      <p class="activity-instruction">Desenhe o que você aprendeu:</p>
      <div class="drawing-box"></div>
    </div>`;
}

// ── História e Geografia ──────────────────────────────────────────────────────

function buildHistoria(topic: string, q: number): string {
  const perguntas = [
    { p:"Qual é o nome dos seus avós?",                          l:1 },
    { p:"Onde seus pais nasceram?",                              l:1 },
    { p:"Qual é a tradição mais importante da sua família?",     l:2 },
    { p:"Quais festas sua família costuma celebrar?",            l:1 },
    { p:"Qual profissão seus familiares exercem?",               l:1 },
    { p:"Qual alimento típico sua família prepara?",             l:1 },
    { p:"Como era a vida dos seus avós quando eram crianças?",   l:2 },
    { p:"Qual objeto antigo existe na sua casa?",                l:1 },
    { p:"Escreva uma memória especial da sua família.",          l:2 },
    { p:"O que você quer preservar das tradições da sua família?",l:2 },
  ];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🏛️ História: ${topic}</h3>
      <div class="text-box">
        <p>Cada família tem sua própria história e tradições. Conhecer a história da nossa família
        nos ajuda a entender quem somos e de onde viemos.</p>
      </div>
      <ol class="activity-list">
        ${perguntas.slice(0,q).map(({p,l})=>`<li>${p}${answerLines(l)}</li>`).join("")}
      </ol>
      <p class="activity-instruction">${q+1}) Desenhe um momento especial da sua família:</p>
      <div class="drawing-box small"></div>
    </div>`;
}

function buildGeografia(topic: string, q: number): string {
  const perguntas = [
    { p:"Observe a paisagem da sua cidade. O que você vê?",              l:2 },
    { p:"Descreva o caminho da sua casa até a escola:",                  l:3 },
    { p:"Quais recursos naturais existem perto da sua casa?",            l:1 },
    { p:"Sua cidade fica em qual estado?",                               l:1 },
    { p:"Cite 2 pontos de referência da sua cidade:",                    l:1 },
    { p:"Sua cidade é grande ou pequena? Como você sabe?",              l:2 },
    { p:"Qual é o rio ou lago mais próximo da sua cidade?",              l:1 },
    { p:"Como as pessoas se locomovem na sua cidade?",                   l:2 },
    { p:"Qual é o clima da sua região?",                                 l:1 },
    { p:"Cite um problema ambiental da sua cidade e como resolvê-lo:",   l:2 },
  ];

  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🌍 Geografia: ${topic}</h3>
      <p class="activity-instruction">Vamos explorar o mundo ao nosso redor!</p>
      <ol class="activity-list">
        ${perguntas.slice(0,q).map(({p,l})=>`<li>${p}${answerLines(l)}</li>`).join("")}
      </ol>
      <p class="activity-instruction">${q+1}) Faça um mapa simples do seu bairro:</p>
      <div class="drawing-box" style="height:150px;"></div>
    </div>`;
}
