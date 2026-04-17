/**
 * Gets the misc-section-enabled flag value.
 * Checks for a local developer override cookie (ff-misc-section-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 */
export async function getMiscSectionEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-misc-section-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (!process.env.FLAGS) {
    return true;
  }
  try {
    const { miscSectionEnabled } = await import('../flags');
    return Boolean(await miscSectionEnabled());
  } catch {
    return true;
  }
}
