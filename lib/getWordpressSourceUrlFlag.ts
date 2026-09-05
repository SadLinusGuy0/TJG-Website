import { DEFAULT_WORDPRESS_ORIGIN, trustedWordpressOrigin } from './wordpressOrigins';
export async function getWordpressSourceUrl(): Promise<string> {
  // A public cookie must never select a server fetch destination.
  if (process.env.WORDPRESS_SOURCE_URL) return trustedWordpressOrigin(process.env.WORDPRESS_SOURCE_URL);
  if (process.env.FLAGS) {
    try {
      const { wordpressSourceUrl } = await import('../flags');
      const value = await wordpressSourceUrl();
      if (typeof value === 'string') return trustedWordpressOrigin(value);
    } catch { /* Preserve a trusted default when cloud configuration fails. */ }
  }
  return DEFAULT_WORDPRESS_ORIGIN;
}
