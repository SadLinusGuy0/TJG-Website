import type { MetadataRoute } from 'next';
import { getSiteContext } from '../lib/siteEdition';
export const dynamic = 'force-dynamic';
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteContext();
  if (!site.indexable) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/settings'] }, sitemap: `${site.canonicalOrigin}/sitemap.xml` };
}
