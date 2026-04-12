/**
 * Gets the popular-stories-enabled flag value.
 * Checks for a local developer override cookie (ff-popular-stories-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 */
export async function getPopularStoriesEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-popular-stories-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
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
