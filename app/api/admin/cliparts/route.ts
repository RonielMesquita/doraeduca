import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = [
  ...(process.env.ADMIN_EMAILS ?? "").split(","),
  ...(process.env.TESTER_EMAILS ?? "").split(","),
  "roniel.net@gmail.com",
].map((e) => e.trim().toLowerCase()).filter(Boolean);

function filenameToQuery(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")       // remove extensão
    .replace(/[-_]/g, " ")         // hífens e underscores viram espaço
    .replace(/\d+$/, "")           // remove números no final
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return Response.json({ error: "Nenhum arquivo" }, { status: 400 });

  const query = filenameToQuery(file.name);
  if (!query) return Response.json({ error: "Nome de arquivo inválido" }, { status: 400 });

  const admin = createAdminClient();
  const buffer = await file.arrayBuffer();
  const slug = query.replace(/\s+/g, "-").slice(0, 50);
  const fileName = `pack/${Date.now()}-${slug}.png`;

  const { error: uploadError } = await admin.storage
    .from("cliparts")
    .upload(fileName, buffer, {
      contentType: file.type || "image/png",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from("cliparts").getPublicUrl(fileName);

  const { error: cacheError } = await admin.from("image_cache").upsert(
    {
      query,
      tema: "",
      serie: "",
      estilo: "colorir",
      url: publicUrl,
      thumbnail: publicUrl,
      fonte: "pack",
      uso_count: 0,
    },
    { onConflict: "query" }
  );

  if (cacheError) return Response.json({ error: cacheError.message }, { status: 500 });

  return Response.json({ success: true, query, url: publicUrl });
}
