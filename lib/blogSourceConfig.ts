import 'server-only';
import { DEFAULT_WORDPRESS_ORIGIN, trustedWordpressOrigin } from './wordpressOrigins';

/** Sanity is primary; WordPress fallback requires explicit deployment configuration. */
export async function getBlogContentSource(): Promise<'sanity' | 'wordpress'> {
  return process.env.BLOG_CONTENT_SOURCE === 'wordpress' ? 'wordpress' : 'sanity';
}

/** CMS destinations come only from trusted server configuration. */
export async function getWordpressSourceUrl(): Promise<string> {
  return trustedWordpressOrigin(process.env.WORDPRESS_SOURCE_URL || DEFAULT_WORDPRESS_ORIGIN);
}
