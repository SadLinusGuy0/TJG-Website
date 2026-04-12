/**
 * Gets the year-slider-enabled flag value.
 * Checks for a local developer override cookie (ff-year-slider-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 * This allows the app to build and run before Vercel Flags is configured.
 */
export async function getYearSliderEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-year-slider-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (!process.env.FLAGS) {
    return true;
  }
  try {
    const { yearSliderEnabled } = await import('../flags');
    return Boolean(await yearSliderEnabled());
  } catch {
    return true;
  }
}
