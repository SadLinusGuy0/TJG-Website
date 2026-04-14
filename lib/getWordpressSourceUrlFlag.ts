/**
 * Gets the wordpress-source-url flag value.
 * Checks for a local developer override cookie (ff-wordpress-source-url) first.
 * Uses Vercel Flags when FLAGS env var is set, otherwise falls back to the default URL.
 * This allows the app to build and run before Vercel Flags is configured.
 */
const DEFAULT_URL = 'https://tjg8.wordpress.com';

export async function getWordpressSourceUrl(): Promise<string> {
  // Check for local developer override cookie (from Feature Flags page)
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-wordpress-source-url');
    if (override?.value) return override.value.replace(/\/$/, '');
  } catch {
    // cookies() not available during static generation
  }

  if (!process.env.FLAGS) {
    return DEFAULT_URL;
  }
  try {
    const { wordpressSourceUrl } = await import('../flags');
    const result = await wordpressSourceUrl();
    return (typeof result === 'string' && result)
      ? result.replace(/\/$/, '')
      : DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}
