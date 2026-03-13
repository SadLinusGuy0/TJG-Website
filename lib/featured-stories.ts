import { createClient } from "@vercel/edge-config";

export interface FeaturedStory {
  title: string;
  thumbnail: string;
  site: string;
  url: string;
}

function isValidStory(obj: unknown): obj is FeaturedStory {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as FeaturedStory).title === "string" &&
    typeof (obj as FeaturedStory).thumbnail === "string" &&
    typeof (obj as FeaturedStory).site === "string" &&
    typeof (obj as FeaturedStory).url === "string"
  );
}

export async function getFeaturedStories(): Promise<FeaturedStory[]> {
  const connectionString = process.env.EDGE_CONFIG;
  if (!connectionString) return [];

  try {
    const client = createClient(connectionString);
    const value = await client.get("featured-stories");

    if (Array.isArray(value)) {
      return (value as unknown[]).filter(isValidStory);
    }

    return [];
  } catch {
    return [];
  }
}
