/**
 * Gets the recent-blog-posts-enabled flag value.
 * Checks for a local developer override cookie (ff-recent-blog-posts-enabled) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to true.
 */
export async function getRecentBlogPostsEnabled(): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-recent-blog-posts-enabled');
    if (override) return override.value === 'true';
  } catch {
    // cookies() not available during static generation
  }
  if (!process.env.FLAGS) {
    return true;
  }
  try {
    const { recentBlogPostsEnabled } = await import('../flags');
    return Boolean(await recentBlogPostsEnabled());
  } catch {
    return true;
  }
}
