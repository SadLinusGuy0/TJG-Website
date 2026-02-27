import { DEFAULT_FEATURED_STORIES, featuredStories as featuredStoriesFlag } from "../flags";

export type { FeaturedStory } from "../flags";

/**
 * Fetches featured stories from Vercel Flags.
 * Falls back to default stories when FLAGS is not set or fetch fails.
 * Edit the list in Vercel Dashboard → Flags → featured-stories.
 */
export async function getFeaturedStories() {
  if (!process.env.FLAGS) {
    return DEFAULT_FEATURED_STORIES;
  }
  try {
    const stories = await featuredStoriesFlag();
    if (Array.isArray(stories) && stories.length > 0) {
      return stories;
    }
  } catch {
    // Invalid token, network error, or flag not configured
  }
  return DEFAULT_FEATURED_STORIES;
}
