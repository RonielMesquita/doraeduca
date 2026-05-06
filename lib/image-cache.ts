import { createAdminClient } from "@/lib/supabase/admin";

export interface CachedImage {
  url: string;
  thumbnail: string;
  fonte: string;
}

interface ImageCacheRow {
  id: string;
  url: string;
  thumbnail: string;
  fonte: string;
  uso_count: number;
}

function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export async function getCachedImage(
  query: string,
  tema?: string,
  serie?: string,
  estilo?: string
): Promise<CachedImage | null> {
  const supabase = createAdminClient();
  const normQuery = normalizeQuery(query);

  // 1. Busca exata
  const { data } = await supabase
    .from("image_cache")
    .select("id, url, thumbnail, fonte, uso_count")
    .eq("query", normQuery)
    .maybeSingle();

  if (data) {
    const row = data as ImageCacheRow;
    void supabase
      .from("image_cache")
      .update({ uso_count: row.uso_count + 1 })
      .eq("id", row.id);

    return { url: row.url, thumbnail: row.thumbnail, fonte: row.fonte };
  }

  // 2. Busca fuzzy por palavras-chave no pack
  // As imagens do pack (estilo "colorir") são B&W line art — servem para ambos os modos.
  // Palavras genéricas de prompts DALL-E que não identificam o objeto — ignorar na busca
  const STOP = new Set([
    "cute","kawaii","black","white","line","art","coloring","page","detailed",
    "scene","with","children","playing","simple","thick","clean","outline",
    "outlines","illustration","educational","clipart","large","full","sheet",
    "background","style","cartoon","drawing","image","picture","character",
    "happy","adorable","funny","little","small","big","great","nice","pretty",
    "beautiful","lovely","sweet","friendly","cheerful","smiling","sitting",
    "standing","running","jumping","flying","swimming","cute","kids","child",
    "baby","coloring","book","print","worksheet","activity",
    "animals","animal","pack","pack2","group","family","collection","set",
  ]);
  const words = normQuery.split(" ")
    .filter((w) => w.length > 3 && !STOP.has(w))
    .slice(0, 5);
  if (words.length > 0) {
    // Busca no estilo solicitado primeiro, depois no pack colorir como fallback
    const estilosParaBuscar = estilo && estilo !== "colorir"
      ? [estilo, "colorir"]
      : ["colorir"];

    for (const estiloFilter of estilosParaBuscar) {
      for (const word of words) {
        const { data: fuzzy } = await supabase
          .from("image_cache")
          .select("id, url, thumbnail, fonte, uso_count, query")
          .eq("estilo", estiloFilter)
          .ilike("query", `%${word}%`)
          .limit(5);

        // Ignora entradas com query longa (> 7 palavras) — descrevem cenas com múltiplos
        // animais que geram match errado para buscas de animais individuais
        const match = (fuzzy ?? []).find(
          (r) => (r as ImageCacheRow & { query: string }).query.split(" ").length <= 7
        ) as (ImageCacheRow & { query: string }) | undefined;

        if (match) {
          void supabase
            .from("image_cache")
            .update({ uso_count: match.uso_count + 1 })
            .eq("id", match.id);
          return { url: match.url, thumbnail: match.thumbnail, fonte: match.fonte };
        }
      }
    }
  }

  if (tema) {
    const normTema = normalizeQuery(tema);
    let q = supabase
      .from("image_cache")
      .select("url, thumbnail, fonte")
      .eq("tema", normTema);

    if (serie) q = q.eq("serie", serie);

    const { data: byTema } = await q.limit(1).maybeSingle();
    if (byTema) {
      const row = byTema as Pick<ImageCacheRow, "url" | "thumbnail" | "fonte">;
      return { url: row.url, thumbnail: row.thumbnail, fonte: row.fonte };
    }
  }

  return null;
}

export async function saveImageCache(params: {
  query: string;
  tema?: string;
  serie?: string;
  estilo?: string;
  url: string;
  thumbnail: string;
  fonte?: string;
}): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from("image_cache").upsert(
    {
      query:     normalizeQuery(params.query),
      tema:      normalizeQuery(params.tema ?? ""),
      serie:     params.serie ?? "",
      estilo:    params.estilo ?? "colorido",
      url:       params.url,
      thumbnail: params.thumbnail,
      fonte:     params.fonte ?? "google",
      uso_count: 0,
    },
    { onConflict: "query" }
  );
}
