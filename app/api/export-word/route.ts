import HTMLtoDOCX from "html-to-docx";

export async function POST(request: Request) {
  try {
    const { html, filename } = await request.json();

    if (!html) {
      return Response.json({ error: "HTML content is required" }, { status: 400 });
    }

    // Envolve o HTML em uma estrutura completa com estilos
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #333;
            }
            h1, h2, h3 {
              color: #222;
              margin-top: 16pt;
              margin-bottom: 8pt;
            }
            h1 { font-size: 18pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
            p { margin: 8pt 0; }
            ul, ol { margin: 8pt 0; padding-left: 24pt; }
            li { margin: 4pt 0; }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 12pt 0;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8pt;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .header {
              text-align: center;
              margin-bottom: 16pt;
              padding-bottom: 8pt;
              border-bottom: 2px solid #333;
            }
            img {
              max-width: 200px;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
      margins: {
        top: 720, // 0.5 inch
        right: 720,
        bottom: 720,
        left: 720,
      },
    });

    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    headers.set("Content-Disposition", `attachment; filename="${filename || "atividade"}.docx"`);

    return new Response(docxBuffer as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error generating Word document:", error);
    return Response.json(
      { error: "Failed to generate Word document" },
      { status: 500 }
    );
  }
}
