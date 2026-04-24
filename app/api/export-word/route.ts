import { ActivityConfig, SUBJECTS } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const htmlToDocx = require("html-to-docx");
const HTMLtoDOCX = (htmlToDocx.default ?? htmlToDocx) as (
  html: string,
  header: null,
  options: object
) => Promise<Buffer>;

// Remove emojis — html-to-docx não os renderiza bem
function stripEmojis(str: string): string {
  return str.replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u{FE00}-\u{FEFF}]/gu, "")
    .replace(/✓|✔|✕|✗|★|☆|●|○|►|◄/g, "")
    .trim();
}

function buildWordHtml(config: ActivityConfig, activity: string): string {
  const subject = SUBJECTS[config.subject];

  // Limpar HTML: remover classes, manter apenas estrutura e texto
  let html = activity
    // Converter figurinha-card em parágrafo simples
    .replace(/<div[^>]*figurinha-card[^>]*>([\s\S]*?)<\/div>/g, (_, inner) => {
      const emoji = (inner.match(/<span[^>]*figurinha-emoji[^>]*>(.*?)<\/span>/s) || [])[1] || "";
      const name = (inner.match(/<span[^>]*figurinha-name[^>]*>(.*?)<\/span>/s) || [])[1] || "";
      const clean = stripEmojis(emoji + " " + name).trim();
      return `<p style="border:1px solid #ccc;padding:6px;display:inline-block;margin:4px;">${clean || "[ ]"}</p>`;
    })
    // Seções e subtítulos
    .replace(/<div[^>]*activity-subtitle[^>]*>/g, '<p style="font-size:12pt;font-weight:bold;margin:12px 0 4px;">')
    .replace(/<div[^>]*activity-instruction[^>]*>/g, '<p style="font-size:10pt;margin:6px 0;">')
    .replace(/<div[^>]*activity-section[^>]*>/g, '<div style="margin:12px 0;">')
    // Linhas de resposta
    .replace(/<div[^>]*answer-line[^>]*><\/div>/g, '<p style="border-bottom:1px solid #333;min-height:20px;margin:6px 0;">&nbsp;</p>')
    // Caixas de desenho
    .replace(/<div[^>]*drawing-box[^>]*>[\s\S]*?<\/div>/g, '<p style="border:1px dashed #999;min-height:80px;margin:8px 0;padding:4px;">[ Espaço para desenho ]</p>')
    // Word tags
    .replace(/<span[^>]*word-tag[^>]*>(.*?)<\/span>/g, '<b>[$1]</b>')
    // Remover figurinhas-grid wrappers
    .replace(/<div[^>]*figurinhas-grid[^>]*>/g, '<div>')
    // Remover todos os class= restantes
    .replace(/ class="[^"]*"/g, "")
    // Remover display:flex e display:grid (não suportados pelo Word)
    .replace(/display\s*:\s*(flex|grid)[^;"]*/gi, "")
    // Remover emojis inline
    .replace(/<span[^>]*>([\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}])<\/span>/gu, "");

  // Cabeçalho escolar simples
  const logoCell = config.logoBase64
    ? `<td style="width:60px;border:1px solid #555;padding:4px;text-align:center;vertical-align:middle;"><img src="${config.logoBase64}" width="50" height="50" /></td>`
    : `<td style="width:60px;border:1px solid #555;padding:4px;text-align:center;font-size:10pt;">Escola</td>`;

  const header = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
      <tr>
        ${logoCell}
        <td style="border:1px solid #555;padding:6px;text-align:center;font-weight:bold;font-size:12pt;text-transform:uppercase;">
          ${config.schoolName || "NOME DA ESCOLA"}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border:1px solid #555;padding:5px 8px;font-size:10pt;">
          <b>PROFª:</b> ${config.teacherName} &nbsp;&nbsp;
          <b>SÉRIE:</b> ${config.year} &nbsp;
          <b>TURMA:</b> ${config.className} &nbsp;
          <b>TURNO:</b> ${config.turno} &nbsp;&nbsp;
          <b>DATA:</b> ${config.date}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="border:1px solid #555;padding:5px 8px;font-size:10pt;">
          <b>ALUNO(A):</b> _______________________________________________
        </td>
      </tr>
    </table>
    <p style="text-align:center;font-size:13pt;font-weight:bold;text-transform:uppercase;margin:10px 0 4px;">
      ${stripEmojis(config.activityTitle)} ${(subject?.label ?? "").toUpperCase()}
    </p>
    ${config.topic ? `<p style="text-align:center;font-size:11pt;font-weight:bold;text-transform:uppercase;margin:0 0 12px;">${config.topic.toUpperCase()}</p>` : ""}
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; }
    p { margin: 4pt 0; }
    table { border-collapse: collapse; }
    ul, ol { margin: 4pt 0; padding-left: 20pt; }
    li { margin: 2pt 0; }
  </style>
</head>
<body>
  ${header}
  ${html}
  <p style="text-align:center;color:#aaa;margin-top:20pt;font-size:9pt;">Bom trabalho!</p>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { config, activity, filename } = await request.json();
    if (!activity || !config) {
      return Response.json({ error: "Dados insuficientes" }, { status: 400 });
    }

    const fullHtml = buildWordHtml(config as ActivityConfig, activity as string);

    const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
      margins: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
    });

    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    headers.set("Content-Disposition", `attachment; filename="${filename || "atividade"}.docx"`);
    return new Response(docxBuffer as unknown as BodyInit, { status: 200, headers });
  } catch (error) {
    console.error("Erro ao gerar Word:", error);
    return Response.json({ error: "Falha ao gerar documento" }, { status: 500 });
  }
}
