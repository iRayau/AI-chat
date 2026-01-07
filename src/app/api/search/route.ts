import { NextResponse } from "next/server";

export const runtime = "edge";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  thumbnail?: string;
}

interface ImageResult {
  url: string;
  title: string;
  source: string;
  thumbnail?: string;
}

interface SearchResponse {
  webResults: SearchResult[];
  imageResults: ImageResult[];
}

async function searchWithSerper(query: string): Promise<SearchResponse> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error("Serper API key not configured");
  }

  // Fetch web results and image results in parallel
  const [webResponse, imageResponse] = await Promise.all([
    fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 5,
        location: "Saudi Arabia",
        gl: "sa",
        hl: "ar",
      }),
    }),
    fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 6,
        location: "Saudi Arabia",
        gl: "sa",
        hl: "ar",
      }),
    }),
  ]);

  if (!webResponse.ok || !imageResponse.ok) {
    throw new Error("Search API request failed");
  }

  const webData = await webResponse.json();
  const imageData = await imageResponse.json();

  const webResults: SearchResult[] = (webData.organic || []).map(
    (item: { title: string; link: string; snippet: string }) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    })
  );

  const imageResults: ImageResult[] = (imageData.images || []).map(
    (item: {
      title: string;
      imageUrl: string;
      source: string;
      thumbnailUrl?: string;
    }) => ({
      title: item.title,
      url: item.imageUrl,
      source: item.source,
      thumbnail: item.thumbnailUrl,
    })
  );

  return { webResults, imageResults };
}

// Fallback mock search for demo purposes
function getMockSearchResults(query: string): SearchResponse {
  const mockWebResults: SearchResult[] = [
    {
      title: `Search results for "${query}"`,
      url: `https://example.com/search?q=${encodeURIComponent(query)}`,
      snippet: `This is a mock search result for your query: "${query}". Configure SERPER_API_KEY for real search results.`,
    },
    {
      title: "Getting Started Guide",
      url: "https://docs.example.com/getting-started",
      snippet:
        "Learn how to configure your search API key to enable real web search functionality.",
    },
  ];

  const mockImageResults: ImageResult[] = [
    {
      title: "Placeholder Image 1",
      url: "https://picsum.photos/seed/1/400/300",
      source: "Lorem Picsum",
      thumbnail: "https://picsum.photos/seed/1/200/150",
    },
    {
      title: "Placeholder Image 2",
      url: "https://picsum.photos/seed/2/400/300",
      source: "Lorem Picsum",
      thumbnail: "https://picsum.photos/seed/2/200/150",
    },
    {
      title: "Placeholder Image 3",
      url: "https://picsum.photos/seed/3/400/300",
      source: "Lorem Picsum",
      thumbnail: "https://picsum.photos/seed/3/200/150",
    },
  ];

  return { webResults: mockWebResults, imageResults: mockImageResults };
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    let results: SearchResponse;

    if (process.env.SERPER_API_KEY) {
      results = await searchWithSerper(query);
    } else {
      // Use mock results if no API key is configured
      results = getMockSearchResults(query);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    );
  }
}
