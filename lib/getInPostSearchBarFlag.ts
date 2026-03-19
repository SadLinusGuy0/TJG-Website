/**
 * Gets the in-post-search-bar-enabled flag value.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to false.
 */
export async function getInPostSearchBarEnabled(): Promise<boolean> {
  if (!process.env.FLAGS) {
    return false;
  }
  try {
    const { inPostSearchBarEnabled } = await import('../flags');
    return Boolean(await inPostSearchBarEnabled());
  } catch {
    return false;
  }
}
