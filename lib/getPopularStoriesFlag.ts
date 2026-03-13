/**
 * Gets the popular-stories-enabled flag value.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 */
export async function getPopularStoriesEnabled(): Promise<boolean> {
  if (!process.env.FLAGS) {
    return true;
  }
  try {
    const { popularStoriesEnabled } = await import('../flags');
    return Boolean(await popularStoriesEnabled());
  } catch {
    return true;
  }
}
