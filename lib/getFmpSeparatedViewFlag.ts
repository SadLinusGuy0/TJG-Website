/**
 * Gets the fmp-separated-view-enabled flag value.
 * Checks for a local developer override cookie (ff-fmp-separated-view-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to false.
 */
export async function getFmpSeparatedViewEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-fmp-separated-view-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (!process.env.FLAGS) {
    return false;
  }
  try {
    const { fmpSeparatedViewEnabled } = await import('../flags');
    return Boolean(await fmpSeparatedViewEnabled());
  } catch {
    return false;
  }
}
