import { createAdminClient } from "@/lib/supabase/admin";
import { getCachedImage, saveImageCache } from "@/lib/image-cache";

function buildPrompt(description: string): string {
  return `Black and white line art clipart of ${description}, cute kawaii style for children educational worksheet, thick clean outlines, no gray shading, pure white background, simple coloring book illustration, educational clipart`;
}

export async function generateOrGetImage(
  description: string,
  tema?: string,
  serie?: string
): Promise<string | null> {
  const cached = await getCachedImage(description, tema, serie);
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
        prompt: buildPrompt(description),
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

    return publicUrl;
  } catch {
    return null;
  }
}

export async function replaceAiImagePlaceholders(
  html: string,
  tema?: string,
  serie?: string
): Promise<string> {
  const regex = /<img[^>]+data-generate="([^"]+)"[^>]*>/g;
  const matches: { full: string; description: string }[] = [];

  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.push({ full: m[0], description: m[1] });
  }

  if (matches.length === 0) return html;

  const unique = [...new Set(matches.map((x) => x.description))].slice(0, 8);
  const urlMap: Record<string, string> = {};

  await Promise.all(
    unique.map(async (desc) => {
      const url = await generateOrGetImage(desc, tema, serie);
      if (url) urlMap[desc] = url;
    })
  );

  let result = html;
  for (const { full, description } of matches) {
    if (urlMap[description]) {
      result = result.replace(
        full,
        `<img src="${urlMap[description]}" alt="${description}" class="ai-clipart" style="width:100%;height:auto;object-fit:contain;border-radius:8px;" />`
      );
    } else {
      // DALL-E falhou: substitui por caixa de desenho para a criança colorir/desenhar
      const label = description.split(" ").slice(0, 3).join(" ").toUpperCase();
      result = result.replace(
        full,
        `<div class="drawing-box" style="min-height:120px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:0.7rem;text-align:center;">${label}</div>`
      );
    }
  }

  return result;
}
