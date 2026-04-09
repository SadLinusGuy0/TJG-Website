/**
 * Gets the liquid-glass-enabled flag value.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to false.
 * Set LIQUID_GLASS_ENABLED=true in .env.local to test locally without Vercel Flags.
 */
export async function getLiquidGlassEnabled(): Promise<boolean> {
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
