/**
 * Gets the in-post-search-bar-enabled flag value.
 * Checks for a local developer override cookie (ff-in-post-search-bar-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to false.
 */
export async function getInPostSearchBarEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-in-post-search-bar-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
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
