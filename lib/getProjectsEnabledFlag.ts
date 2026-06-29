/**
 * Gets the projects-enabled flag value.
 * Checks for a local developer override cookie (ff-projects-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 */
export async function getProjectsEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-projects-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (!process.env.FLAGS) {
    return true;
  }
  try {
    const { projectsEnabled } = await import('../flags');
    return Boolean(await projectsEnabled());
  } catch {
    return true;
  }
}
