/**
 * Gets the in-post-search-bar-fmp-enabled flag value.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 */
export async function getInPostSearchBarFmpEnabled(): Promise<boolean> {
  if (!process.env.FLAGS) {
    return true;
  }
  try {
    const { inPostSearchBarFmpEnabled } = await import('../flags');
    return Boolean(await inPostSearchBarFmpEnabled());
  } catch {
    return true;
  }
}
