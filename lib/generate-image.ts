import { createAdminClient } from "@/lib/supabase/admin";
import { getCachedImage, saveImageCache } from "@/lib/image-cache";
import { trackDalleCost } from "@/lib/track-api-cost";

function buildPrompt(description: string, estilo?: string): string {
  if (estilo === "colorir") {
    return `Full page black and white coloring page of ${description}, cute kawaii style for children, thick clean outlines, no shading, pure white background, large illustration filling the page, educational coloring worksheet`;
  }
  return `Black and white line art clipart of ${description}, cute kawaii style for children educational worksheet, thick clean outlines, no gray shading, pure white background, simple coloring book illustration, educational clipart`;
}

export async function generateOrGetImage(
  description: string,
  tema?: string,
  serie?: string,
  estilo?: string
): Promise<string | null> {
  const cached = await getCachedImage(description, tema, serie, estilo);
  if (cached) return cached.url;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const genRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: buildPrompt(description, estilo),
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural",
      }),
    });

    if (!genRes.ok) return null;

    const genData = await genRes.json();
    const tempUrl: string | undefined = genData.data?.[0]?.url;
    if (!tempUrl) return null;

    // Faz download da imagem (URLs do DALL-E expiram em ~1h)
    const imgRes = await fetch(tempUrl);
    if (!imgRes.ok) return null;
    const imgBuffer = await imgRes.arrayBuffer();

    // Faz upload para o Supabase Storage
    const supabase = createAdminClient();
    const slug = description
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .slice(0, 40);
    const fileName = `${Date.now()}-${slug}.png`;

    const { error: uploadError } = await supabase.storage
      .from("cliparts")
      .upload(fileName, imgBuffer, {
        contentType: "image/png",
        cacheControl: "31536000",
      });

    if (uploadError) return null;

    const {
      data: { publicUrl },
    } = supabase.storage.from("cliparts").getPublicUrl(fileName);

    // Salva no cache para reutilização futura
    await saveImageCache({
      query: description,
      tema,
      serie,
      estilo: "bw-line-art",
      url: publicUrl,
      thumbnail: publicUrl,
      fonte: "dalle3",
    });

    // Registra custo DALL-E
    void trackDalleCost({ images: 1 });

    return publicUrl;
  } catch {
    return null;
  }
}

export async function replaceAiImagePlaceholders(
  html: string,
  tema?: string,
  serie?: string,
  estilo?: string
): Promise<string> {
  const regex = /<img[^>]+data-generate="([^"]+)"[^>]*>/g;
  const matches: { full: string; description: string; originalClass: string }[] = [];

  let m;
  while ((m = regex.exec(html)) !== null) {
    const classMatch = m[0].match(/class="([^"]*)"/);
    const originalClass = classMatch ? classMatch[1] : "ai-clipart";
    matches.push({ full: m[0], description: m[1], originalClass });
  }

  if (matches.length === 0) return html;

  const unique = [...new Set(matches.map((x) => x.description))].slice(0, 8);
  const urlMap: Record<string, string> = {};

  await Promise.all(
    unique.map(async (desc) => {
      const url = await generateOrGetImage(desc, tema, serie, estilo);
      if (url) urlMap[desc] = url;
    })
  );

  let result = html;
  for (const { full, description, originalClass } of matches) {
    if (urlMap[description]) {
      result = result.replace(
        full,
        `<img src="${urlMap[description]}" alt="${description}" class="${originalClass}" />`
      );
    } else {
      // Modo colorir: caixa de desenho grande sem texto em inglês
      const isColorirClass = originalClass.includes("scene-coloring");
      if (isColorirClass) {
        result = result.replace(
          full,
          `<div class="${originalClass}" style="display:flex;align-items:center;justify-content:center;border:3px dashed #d1d5db;border-radius:12px;color:#9ca3af;font-size:1rem;text-align:center;">✏️ Desenhe aqui!</div>`
        );
      } else {
        result = result.replace(
          full,
          `<div class="drawing-box" style="min-height:100px;display:flex;align-items:center;justify-content:center;border:2px dashed #d1d5db;border-radius:8px;color:#9ca3af;font-size:0.7rem;text-align:center;">✏️</div>`
        );
      }
    }
  }

  return result;
}
