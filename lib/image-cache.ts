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
  serie?: string
): Promise<CachedImage | null> {
  const supabase = createAdminClient();
  const normQuery = normalizeQuery(query);

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
