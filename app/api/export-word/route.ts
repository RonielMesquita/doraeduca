import { ActivityConfig, SUBJECTS } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const htmlToDocx = require("html-to-docx");
const HTMLtoDOCX = (htmlToDocx.default ?? htmlToDocx) as (
  html: string,
  header: null,
  options: object
) => Promise<Buffer>;

// Converte figurinha-cards em células de tabela Word-compatível
function cardsToTable(inner: string, cols: number): string {
  const cardRegex = /<div[^>]*class="([^"]*figurinha-card[^"]*)"[^>]*>([\s\S]*?)<\/div>/g;
  const cells: string[] = [];
  let m;

  while ((m = cardRegex.exec(inner)) !== null) {
    const cls = m[1];
    const content = m[2];
    let bg = "#faf5ff", border = "#ddd6fe";
    if (cls.includes("green"))  { bg = "#f0fdf4"; border = "#bbf7d0"; }
    if (cls.includes("blue"))   { bg = "#eff6ff"; border = "#bfdbfe"; }
    if (cls.includes("yellow")) { bg = "#fffbeb"; border = "#fde68a"; }
    if (cls.includes("pink"))   { bg = "#fdf2f8"; border = "#fbcfe8"; }

    const inner2 = content
      .replace(/<span[^>]*figurinha-emoji[^>]*>/g, '<div style="font-size:26pt;text-align:center;line-height:1.2;">')
      .replace(/<\/span>/g, "</div>")
      .replace(/<span[^>]*figurinha-name[^>]*>/g, '<div style="font-size:8pt;font-weight:bold;text-align:center;text-transform:uppercase;margin-top:4px;">')
      .replace(/<div[^>]*figurinha-write[^>]*><\/div>/g, '<div style="border-bottom:1px solid #aaa;height:18px;margin:4px 6px;"></div>')
      .replace(/ class="[^"]*"/g, "");

    cells.push(
      `<td style="border:2px solid ${border};background-color:${bg};padding:8px;text-align:center;vertical-align:top;">${inner2}</td>`
    );
  }

  if (cells.length === 0) return `<div>${inner}</div>`;

  let rows = "";
  for (let i = 0; i < cells.length; i += cols) {
    const row = cells.slice(i, i + cols);
    while (row.length < cols) row.push("<td></td>");
    rows += `<tr>${row.join("")}</tr>`;
  }
  return `<table style="width:100%;border-collapse:separate;border-spacing:6px;margin:10px 0;">${rows}</table>`;
}

function buildWordHtml(config: ActivityConfig, activity: string): string {
  const subject = SUBJECTS[config.subject];
  let html = activity;

  // 1. Converter grids de figurinhas em tabelas
  html = html.replace(
    /<div[^>]*class="[^"]*figurinhas-grid-3[^"]*"[^>]*>([\s\S]*?)<\/div>(?=\s*<)/g,
    (_, inner) => cardsToTable(inner, 3)
  );
  html = html.replace(
    /<div[^>]*class="[^"]*figurinhas-grid[^"]*"[^>]*>([\s\S]*?)<\/div>(?=\s*<)/g,
    (_, inner) => cardsToTable(inner, 4)
  );

  // 2. Substituir elementos com classes por versões com inline style
  html = html
    .replace(/<div[^>]*class="[^"]*activity-subtitle[^"]*"[^>]*>/g,
      '<div style="font-size:13pt;font-weight:bold;color:#1e40af;background-color:#dbeafe;border-left:5px solid #3b82f6;padding:6px 12px;margin:12px 0 6px;">')
    .replace(/<div[^>]*class="[^"]*activity-instruction[^"]*"[^>]*>/g,
      '<div style="font-size:10pt;font-weight:bold;color:#374151;margin:8px 0 4px;">')
    .replace(/<div[^>]*class="[^"]*activity-section[^"]*"[^>]*>/g,
      '<div style="margin:10px 0;">')
    .replace(/<div[^>]*class="[^"]*answer-line[^"]*"[^>]*>/g,
      '<div style="border-bottom:1.5px solid #9ca3af;height:26px;margin:6px 0;"></div>')
    .replace(/<div[^>]*class="[^"]*drawing-box[^"]*small[^"]*"[^>]*>/g,
      '<div style="border:2px dashed #d1d5db;height:80px;margin:8px 0;text-align:center;color:#9ca3af;padding-top:28px;">✏️ Desenhe aqui</div>')
    .replace(/<div[^>]*class="[^"]*drawing-box[^"]*"[^>]*>/g,
      '<div style="border:2px dashed #d1d5db;height:120px;margin:8px 0;text-align:center;color:#9ca3af;padding-top:44px;">✏️ Desenhe aqui</div>')
    .replace(/<div[^>]*class="[^"]*word-box[^"]*"[^>]*>/g,
      '<div style="background-color:#f0fdf4;border:2px solid #86efac;padding:8px 12px;margin:8px 0;border-radius:4px;">')
    .replace(/<span[^>]*class="[^"]*word-tag[^"]*"[^>]*>/g,
      '<span style="background-color:#22c55e;color:white;font-weight:bold;padding:2px 10px;border-radius:10px;margin:2px;display:inline-block;">')
    .replace(/<div[^>]*class="[^"]*problem-box[^"]*"[^>]*>/g,
      '<div style="background-color:#eff6ff;border:2px solid #bfdbfe;padding:12px;margin:8px 0;">')
    .replace(/<div[^>]*class="[^"]*text-box[^"]*"[^>]*>/g,
      '<div style="background-color:#fef9ee;border-left:4px solid #f59e0b;padding:10px 14px;margin:8px 0;">')
    .replace(/<div[^>]*class="[^"]*math-grid[^"]*"[^>]*>/g,
      '<div style="margin:10px 0;">')
    .replace(/<div[^>]*class="[^"]*math-op[^"]*"[^>]*>/g,
      '<div style="display:inline-block;border:1px solid #e5e7eb;padding:10px 16px;margin:4px;text-align:right;min-width:80px;background-color:#f9fafb;">')
    .replace(/<div[^>]*class="[^"]*silaba-card[^"]*"[^>]*>/g,
      '<span style="background-color:#f59e0b;color:white;font-weight:900;font-size:13pt;padding:4px 12px;border-radius:8px;margin:4px;display:inline-block;">')
    .replace(/<div[^>]*class="[^"]*familia-box[^"]*"[^>]*>/g,
      '<div style="border:2px solid #f59e0b;padding:10px;margin:10px 0;background-color:#fffbeb;text-align:center;">')
    // Remover classes restantes (mantém o elemento sem estilo de classe)
    .replace(/ class="[^"]*"/g, "")
    // Remover inline styles com flex/grid que Word não suporta
    .replace(/style="([^"]*)display\s*:\s*flex[^"]*"/gi, 'style="margin:4px 0;"')
    .replace(/style="([^"]*)display\s*:\s*grid[^"]*"/gi, 'style="margin:4px 0;"');

  // 3. Cabeçalho da escola
  const header = `
    <table style="width:100%;border-collapse:collapse;border:1.5px solid #555;margin-bottom:16px;font-family:Arial,sans-serif;">
      <tr>
        <td style="width:60px;height:60px;border-right:1px solid #555;border-bottom:1px solid #555;text-align:center;font-size:22pt;padding:4px;">🏫</td>
        <td style="border-bottom:1px solid #555;border-right:1px solid #555;text-align:center;font-weight:900;font-size:12pt;text-transform:uppercase;padding:6px;">
          ${config.schoolName || "NOME DA ESCOLA"}
        </td>
        <td style="width:72px;border-bottom:1px solid #555;text-align:center;font-size:8pt;color:#999;padding:4px;">foto do aluno</td>
      </tr>
      <tr>
        <td colspan="2" style="border-bottom:1px solid #555;border-right:1px solid #555;padding:4px 8px;font-size:9pt;">
          <b>PROFª</b> ${config.teacherName} &nbsp;&nbsp; <b>DATA:</b> ${config.date}
        </td>
        <td style="border-bottom:1px solid #555;"></td>
      </tr>
      <tr>
        <td colspan="2" style="border-bottom:1px solid #555;border-right:1px solid #555;padding:4px 8px;font-size:9pt;">
          <b>SÉRIE:</b> ${config.year} &nbsp; <b>TURMA:</b> ${config.className} &nbsp; <b>TURNO:</b> ${config.turno}
        </td>
        <td style="border-bottom:1px solid #555;"></td>
      </tr>
      <tr>
        <td colspan="3" style="padding:4px 8px;font-size:9pt;">
          <b>ALUNO(A):</b> ___________________________________________
        </td>
      </tr>
    </table>
    <div style="text-align:center;margin:14px 0 10px;">
      <h1 style="font-size:14pt;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0;">
        ${config.activityTitle} ${subject?.label?.toUpperCase() ?? ""}
      </h1>
      ${config.topic ? `<p style="font-size:11pt;font-weight:bold;text-transform:uppercase;margin:4px 0;">${config.topic.toUpperCase()}</p>` : ""}
    </div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #1f2937; line-height: 1.5; }
    p { margin: 4pt 0; }
    table { border-collapse: collapse; }
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
      margins: { top: 1701, right: 1134, bottom: 1134, left: 1701 },
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
