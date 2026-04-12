/**
 * Gets the in-post-search-bar-fmp-enabled flag value.
 * Checks for a local developer override cookie (ff-in-post-search-bar-fmp-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 */
export async function getInPostSearchBarFmpEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-in-post-search-bar-fmp-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
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
