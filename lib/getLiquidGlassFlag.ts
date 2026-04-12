/**
 * Gets the liquid-glass-enabled flag value.
 * Checks for a local developer override cookie (ff-liquid-glass-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to false.
 * Set LIQUID_GLASS_ENABLED=true in .env.local to test locally without Vercel Flags.
 */
export async function getLiquidGlassEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-liquid-glass-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (process.env.LIQUID_GLASS_ENABLED === 'true') {
    return true;
  }
  if (!process.env.FLAGS) {
    return false;
  }
  try {
    const { liquidGlassEnabled } = await import('../flags');
    return Boolean(await liquidGlassEnabled());
  } catch {
    return false;
  }
}
