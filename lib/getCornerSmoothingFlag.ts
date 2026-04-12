/**
 * Gets the corner-smoothing-enabled flag value.
 * Checks for a local developer override cookie (ff-corner-smoothing-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to false.
 * Set CORNER_SMOOTHING_ENABLED=true in .env.local to test locally without Vercel Flags.
 */
export async function getCornerSmoothingEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-corner-smoothing-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (process.env.CORNER_SMOOTHING_ENABLED === 'true') {
    return true;
  }
  if (!process.env.FLAGS) {
    return false;
  }
  try {
    const { cornerSmoothingEnabled } = await import('../flags');
    return Boolean(await cornerSmoothingEnabled());
  } catch {
    return false;
  }
}
