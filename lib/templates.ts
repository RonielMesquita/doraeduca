import { ActivityConfig } from "./types";

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
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">🔬 ${type}: ${topic}</h3>
      <p class="activity-instruction">Observe as imagens e responda:</p>
      <ol class="activity-list">
        <li>Quais são as características principais de ${topic.toLowerCase()}?<br/>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </li>
        <li>Onde podemos encontrar ${topic.toLowerCase()} na natureza?<br/>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </li>
        <li>Qual a importância de ${topic.toLowerCase()} para o meio ambiente?<br/>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </li>
        <li>Desenhe o que você aprendeu sobre ${topic.toLowerCase()}:</li>
      </ol>
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

  const familias: Record<string, { silabas: string[]; palavras: [string, string][] }> = {
    B: {
      silabas: ["BA", "BE", "BI", "BO", "BU"],
      palavras: [["B__LA", "BOLA"], ["B__CO", "BICO"], ["B__FE", "BIFE"], ["B__CO", "BUCO"], ["B__LA", "BELA"]],
    },
    C: {
      silabas: ["CA", "CE", "CI", "CO", "CU"],
      palavras: [["C__SA", "CASA"], ["C__MA", "CIMA"], ["C__PO", "COPO"], ["C__RO", "CARO"], ["C__BO", "CUBO"]],
    },
    M: {
      silabas: ["MA", "ME", "MI", "MO", "MU"],
      palavras: [["M__CA", "MACA"], ["M__LA", "MELA"], ["M__DO", "MIDO"], ["M__TO", "MOTO"], ["M__LA", "MULA"]],
    },
    P: {
      silabas: ["PA", "PE", "PI", "PO", "PU"],
      palavras: [["P__TO", "PATO"], ["P__RA", "PERA"], ["P__PA", "PIPA"], ["P__VO", "POVO"], ["P__LA", "PULA"]],
    },
    V: {
      silabas: ["VA", "VE", "VI", "VO", "VU"],
      palavras: [["V__CA", "VACA"], ["V__LA", "VELA"], ["V__DA", "VIDA"], ["V__O", "VOO"], ["V__OO", "VUOO"]],
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

      <p class="activity-instruction">1) Leia em voz alta as sílabas da família do <strong>${L}</strong>:</p>
      <div class="read-aloud-box">
        ${data.silabas.join(" — ")}
      </div>

      <p class="activity-instruction">2) Complete as palavras com a sílaba correta:</p>
      <div class="words-grid">
        ${data.palavras
          .slice(0, 4)
          .map(([blank, word], i) => `
          <div class="word-item">
            <span class="word-number">${i + 1})</span>
            <span class="word-blank">${blank.replace("__", "____")}</span>
            <span class="word-hint">(${word.toLowerCase()})</span>
          </div>`)
          .join("")}
      </div>

      <p class="activity-instruction">3) Forme palavras com as sílabas e escreva:</p>
      <div class="form-words">
        ${data.silabas
          .slice(0, 3)
          .map((s, i) => `
          <div class="form-word-item">
            <span class="silaba-highlight">${s}</span>
            <span class="plus">+</span>
            <div class="write-space"></div>
            <span class="equals">=</span>
            <div class="write-space wide"></div>
          </div>`)
          .join("")}
      </div>

      <p class="activity-instruction">4) Desenhe uma palavra que comece com a letra <strong>${L}</strong>:</p>
      <div class="drawing-box small"></div>
    </div>
  `;
}

function completeLacunas(topic: string): string {
  return `
    <div class="activity-section">
      <h3 class="activity-subtitle">✏️ Complete as Lacunas: ${topic}</h3>
      <p class="activity-instruction">Use as palavras do quadro para completar as frases:</p>

      <div class="word-box">
        <span class="word-tag">galinha</span>
        <span class="word-tag">vaca</span>
        <span class="word-tag">cachorro</span>
        <span class="word-tag">gato</span>
        <span class="word-tag">cavalo</span>
        <span class="word-tag">pato</span>
      </div>

      <ol class="activity-list">
        <li>A ______________ dá leite para as crianças.</li>
        <li>O ______________ faz "au au".</li>
        <li>A ______________ bota ovos.</li>
        <li>O ______________ nada na lagoa.</li>
        <li>O ______________ corre muito rápido.</li>
        <li>O ______________ faz "miau".</li>
      </ol>

      <p class="activity-instruction">Agora escreva uma frase com sua palavra favorita:</p>
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
