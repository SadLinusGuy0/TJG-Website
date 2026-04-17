/**
 * Gets the merged-work-carousel-enabled flag value.
 * Checks for a local developer override cookie (ff-merged-work-carousel-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 */
export async function getMergedWorkCarouselEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-merged-work-carousel-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (!process.env.FLAGS) {
    return true;
  }
  try {
    const { mergedWorkCarouselEnabled } = await import('../flags');
    return Boolean(await mergedWorkCarouselEnabled());
  } catch {
    return true;
  }
}
