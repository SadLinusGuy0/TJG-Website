export const DEFAULT_WORDPRESS_ORIGIN = 'https://tjg8.wordpress.com';
/** Origins are deployment configuration, never public request input. */
export function trustedWordpressOrigin(value: string): string {
  const url = new URL(value);
  const configured = (process.env.WORDPRESS_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const origins = [DEFAULT_WORDPRESS_ORIGIN, 'https://joshskinnertjg.wordpress.com', ...configured];
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/' || !origins.includes(url.origin)) throw new Error('Untrusted WordPress origin');
  return url.origin;
}
