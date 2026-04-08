/**
 * Gets the corner-smoothing-enabled flag value.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to false.
 * Set CORNER_SMOOTHING_ENABLED=true in .env.local to test locally without Vercel Flags.
 */
export async function getCornerSmoothingEnabled(): Promise<boolean> {
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
