interface GoogleSearchResult {
  items?: {
    title: string;
    link: string;
    image?: {
      thumbnailLink: string;
      contextLink: string;
      width: number;
      height: number;
    };
  }[];
}

interface ImageResult {
  url: string;
  thumbnail: string;
  title: string;
  width: number;
  height: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const num = Math.min(parseInt(searchParams.get("num") || "5"), 10);

  if (!query) {
    return Response.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    return Response.json(
      { error: "Google API credentials not configured", images: [] },
      { status: 200 }
    );
  }

  try {
    // Adiciona termos para buscar imagens mais adequadas para criancas
    const safeQuery = `${query} clipart cartoon kids educational`;
    
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", cseId);
    url.searchParams.set("q", safeQuery);
    url.searchParams.set("searchType", "image");
    url.searchParams.set("num", num.toString());
    url.searchParams.set("safe", "active"); // SafeSearch ativo
    url.searchParams.set("imgType", "clipart"); // Preferir cliparts
    url.searchParams.set("imgSize", "medium");

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", errorText);
      return Response.json({ error: "Failed to fetch images", images: [] }, { status: 200 });
    }

    const data: GoogleSearchResult = await response.json();

    const images: ImageResult[] = (data.items || []).map((item) => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      title: item.title,
      width: item.image?.width || 150,
      height: item.image?.height || 150,
    }));

    return Response.json({ images, query: safeQuery });
  } catch (error) {
    console.error("Error fetching images:", error);
    return Response.json({ error: "Failed to fetch images", images: [] }, { status: 200 });
  }
}

// POST endpoint para buscar multiplas imagens de uma vez
export async function POST(request: Request) {
  const body = await request.json();
  const queries: string[] = body.queries || [];

  if (queries.length === 0) {
    return Response.json({ results: {} });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    return Response.json({ results: {}, error: "Google API credentials not configured" });
  }

  const results: Record<string, ImageResult[]> = {};

  // Limita a 5 queries por requisicao para nao exceder limites
  const limitedQueries = queries.slice(0, 5);

  for (const query of limitedQueries) {
    try {
      const safeQuery = `${query} clipart cartoon kids educational`;
      
      const url = new URL("https://www.googleapis.com/customsearch/v1");
      url.searchParams.set("key", apiKey);
      url.searchParams.set("cx", cseId);
      url.searchParams.set("q", safeQuery);
      url.searchParams.set("searchType", "image");
      url.searchParams.set("num", "3");
      url.searchParams.set("safe", "active");
      url.searchParams.set("imgType", "clipart");
      url.searchParams.set("imgSize", "medium");

      const response = await fetch(url.toString());
      
      if (response.ok) {
        const data: GoogleSearchResult = await response.json();
        results[query] = (data.items || []).map((item) => ({
          url: item.link,
          thumbnail: item.image?.thumbnailLink || item.link,
          title: item.title,
          width: item.image?.width || 150,
          height: item.image?.height || 150,
        }));
      } else {
        results[query] = [];
      }
    } catch {
      results[query] = [];
    }
  }

  return Response.json({ results });
}
