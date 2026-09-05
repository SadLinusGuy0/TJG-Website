import type { MetadataRoute } from 'next';
import { getSiteEdition, getSiteUrl } from '../lib/siteEdition';
export const dynamic = 'force-dynamic';
export default async function robots(): Promise<MetadataRoute.Robots> {
  const edition = await getSiteEdition();
  if (edition === 'beta' || process.env.VERCEL_ENV === 'preview') return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/settings'] }, sitemap: `${getSiteUrl(edition)}/sitemap.xml` };
}
