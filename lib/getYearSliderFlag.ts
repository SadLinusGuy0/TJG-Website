/**
 * Gets the year-slider-enabled flag value.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 * This allows the app to build and run before Vercel Flags is configured.
 */
export async function getYearSliderEnabled(): Promise<boolean> {
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
