/**
 * Gets the blog-enabled flag value.
 * Checks for a local developer override cookie (ff-blog-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 * This allows the app to build and run before Vercel Flags is configured.
 */
export async function getBlogEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-blog-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (!process.env.FLAGS) {
    return true;
  }
  try {
    const { blogEnabled } = await import('../flags');
    return Boolean(await blogEnabled());
  } catch {
    return true;
  }
}
