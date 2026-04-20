import { ActivityConfig, SUBJECTS } from "@/lib/types";

const HTMLtoDOCX = require("html-to-docx") as (
  html: string,
  header: null,
  options: object
) => Promise<Buffer>;

function buildWordHtml(config: ActivityConfig, activity: string): string {
  const subject = SUBJECTS[config.subject];

  // Converte o HTML da atividade para estilo inline Word-compatível
  const cleanActivity = activity
    // Remove classes e substitui por estilos inline básicos
    .replace(/<div[^>]*class="[^"]*activity-subtitle[^"]*"[^>]*>/gi,
      '<div style="font-size:14pt;font-weight:bold;color:#1e40af;background:#dbeafe;border-left:4px solid #3b82f6;padding:6px 12px;margin:12px 0;">')
    .replace(/<div[^>]*class="[^"]*activity-instruction[^"]*"[^>]*>/gi,
      '<div style="font-size:11pt;font-weight:bold;color:#374151;margin:10px 0 6px;">')
    .replace(/<div[^>]*class="[^"]*activity-section[^"]*"[^>]*>/gi,
      '<div style="margin:10px 0;">')
    .replace(/<div[^>]*class="[^"]*answer-line[^"]*"[^>]*>/gi,
      '<div style="border-bottom:1px solid #9ca3af;min-height:24px;margin:6px 0;">')
    .replace(/<div[^>]*class="[^"]*drawing-box[^"]*"[^>]*>/gi,
      '<div style="border:2px dashed #d1d5db;min-height:100px;margin:10px 0;padding:8px;text-align:center;color:#9ca3af;">')
    .replace(/<div[^>]*class="[^"]*figurinhas-grid(?:-3)?[^"]*"[^>]*>/gi,
      '<div style="display:block;margin:12px 0;">')
    .replace(/<div[^>]*class="[^"]*figurinha-card[^"]*"[^>]*>/gi,
      '<div style="display:inline-block;border:1px solid #ddd;border-radius:8px;padding:8px;margin:4px;text-align:center;min-width:60px;">')
    .replace(/<span[^>]*class="[^"]*figurinha-emoji[^"]*"[^>]*>/gi,
      '<span style="font-size:28pt;display:block;">')
    .replace(/<span[^>]*class="[^"]*figurinha-name[^"]*"[^>]*>/gi,
      '<span style="font-size:9pt;font-weight:bold;text-transform:uppercase;display:block;">')
    .replace(/<div[^>]*class="[^"]*word-box[^"]*"[^>]*>/gi,
      '<div style="background:#f0fdf4;border:1px solid #86efac;padding:8px;margin:8px 0;">')
    .replace(/<span[^>]*class="[^"]*word-tag[^"]*"[^>]*>/gi,
      '<span style="background:#22c55e;color:white;padding:2px 10px;border-radius:12px;margin:2px;display:inline-block;">')
    .replace(/<div[^>]*class="[^"]*math-grid[^"]*"[^>]*>/gi,
      '<div style="margin:10px 0;">')
    .replace(/<div[^>]*class="[^"]*problem-box[^"]*"[^>]*>/gi,
      '<div style="background:#eff6ff;border:1px solid #bfdbfe;padding:12px;margin:8px 0;">')
    // Remove outras classes sem substituição (mantém o elemento)
    .replace(/ class="[^"]*"/gi, "")
    // Remove estilos inline complexos que Word não entende
    .replace(/ style="[^"]*display\s*:\s*flex[^"]*"/gi, "")
    .replace(/ style="[^"]*display\s*:\s*grid[^"]*"/gi, "");

  const headerHtml = `
    <table style="width:100%;border-collapse:collapse;border:1.5px solid #666;margin-bottom:16px;font-family:Arial,sans-serif;">
      <tr>
        <td style="width:64px;height:64px;border-right:1px solid #666;border-bottom:1px solid #666;text-align:center;font-size:24pt;">🏫</td>
        <td style="border-bottom:1px solid #666;border-right:1px solid #666;text-align:center;font-weight:900;font-size:13pt;text-transform:uppercase;padding:4px 8px;">
          ${config.schoolName || "NOME DA ESCOLA"}
        </td>
        <td style="width:80px;border-bottom:1px solid #666;text-align:center;font-size:8pt;color:#aaa;">foto do aluno</td>
      </tr>
      <tr>
        <td colspan="2" style="border-bottom:1px solid #666;border-right:1px solid #666;padding:4px 8px;font-size:9pt;">
          <b>PROFª</b> ${config.teacherName} &nbsp;&nbsp;&nbsp; <b>DATA:</b> ${config.date}
        </td>
        <td style="border-bottom:1px solid #666;"></td>
      </tr>
      <tr>
        <td colspan="2" style="border-bottom:1px solid #666;border-right:1px solid #666;padding:4px 8px;font-size:9pt;">
          <b>SÉRIE:</b> ${config.year} &nbsp; <b>TURMA:</b> ${config.className} &nbsp; <b>TURNO:</b> ${config.turno}
        </td>
        <td style="border-bottom:1px solid #666;"></td>
      </tr>
      <tr>
        <td colspan="3" style="padding:4px 8px;font-size:9pt;">
          <b>ALUNO(A):</b> _______________________________________________
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin:16px 0 8px;">
      <h1 style="font-size:14pt;font-weight:900;text-transform:uppercase;letter-spacing:1px;">
        ${config.activityTitle} ${subject?.label?.toUpperCase() || ""}
      </h1>
      ${config.topic ? `<p style="font-size:11pt;font-weight:bold;text-transform:uppercase;">${config.topic.toUpperCase()}</p>` : ""}
    </div>
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #1f2937; }
    h1, h2, h3 { margin: 10pt 0 6pt; }
    p { margin: 4pt 0; line-height: 1.6; }
    table { border-collapse: collapse; width: 100%; }
  </style>
</head>
<body>
  ${headerHtml}
  ${cleanActivity}
  <p style="text-align:center;color:#9ca3af;margin-top:24pt;font-size:9pt;">Bom trabalho!</p>
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
      margins: {
        top: 1134,    // 2cm em twips (1cm = 567 twips)
        right: 1134,
        bottom: 1134,
        left: 1701,   // 3cm
      },
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
