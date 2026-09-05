import type { MetadataRoute } from 'next';
import { getSiteEdition, getSiteUrl } from '../lib/siteEdition';
import { fetchPublicSitemapPosts } from '../lib/blog';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const edition = await getSiteEdition();
  if (edition === 'beta' || process.env.VERCEL_ENV === 'preview') return [];
  const base = getSiteUrl(edition);
  const posts = await fetchPublicSitemapPosts(edition);
  return [ ...['/', '/blog', '/contact', '/shop'].map(path => ({ url: `${base}${path}` })),
    ...posts.map(post => ({ url: `${base}/blog/${post.slug}`, lastModified: post.date })),
  ];
}
