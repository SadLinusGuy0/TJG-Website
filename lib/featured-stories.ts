import { get } from "@vercel/edge-config";

export interface FeaturedStory {
  title: string;
  /** Local path (e.g. /images/stories/photo.jpg) or external URL */
  thumbnail: string;
  site: string;
  url: string;
}

const DEFAULT_STORIES: FeaturedStory[] = [
  {
    title: "Here's the first glimpse of a One UI 9.0 Galaxy AI feature!",
    thumbnail: "https://www.sammobile.com/wp-content/uploads/2026/01/Now-Brief-Galaxy-AI-1200x675.jpg",
    site: "SamMobile",
    url: "https://www.sammobile.com/news/samsung-one-ui-9-galaxy-ai-now-nudge/",
  },
  {
    title: "Breaking – Samsung Removes Bootloader Unlocking with One UI 8",
    thumbnail: "https://sammyguru.com/wp-content/uploads/2025/07/Galaxy-Z-Fold-7-SammyGuru-38-main-display.jpg",
    site: "SammyGuru",
    url: "https://sammyguru.com/breaking-samsung-removes-bootloader-unlocking-with-one-ui-8/",
  },
  {
    title: "Here's How the Galaxy S26 Ultra's Privacy Display Will Work",
    thumbnail: "https://sammyguru.com/wp-content/uploads/2026/01/Privacy-Display-thumbnail.png",
    site: "SammyGuru",
    url: "https://sammyguru.com/galaxy-s26-ultra-privacy-display-animation/",
  },
  {
    title: "Samsung's rumored Perplexity-powered Bixby leaks in new video",
    thumbnail: "https://m-cdn.phonearena.com/images/article/176996-wide-two_1200/Samsungs-rumored-Perplexity-powered-Bixby-leaks-in-new-video.webp?1767393754",
    site: "PhoneArena",
    url: "https://example.com/story-2",
  },
];

/**
 * Fetches featured stories from Vercel Edge Config.
 * Falls back to default stories when EDGE_CONFIG is not set or fetch fails.
 * Edit the list in Vercel Dashboard → Storage → Edge Config → your config.
 */
export async function getFeaturedStories(): Promise<FeaturedStory[]> {
  if (!process.env.EDGE_CONFIG) {
    return DEFAULT_STORIES;
  }
  try {
    const stories = await get<FeaturedStory[]>("featuredStories");
    if (Array.isArray(stories) && stories.length > 0) {
      return stories;
    }
  } catch {
    // Invalid token, network error, or missing config
  }
  return DEFAULT_STORIES;
}
