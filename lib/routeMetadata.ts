import type { Metadata } from 'next';
import { getSiteContext } from './siteEdition';
export async function routeMetadata(path: string, title: string, description: string, noIndex = false): Promise<Metadata> {
  const site = await getSiteContext();
  const url = `${site.canonicalOrigin}${path}`;
  const fullTitle = title === 'That Josh Guy' ? title : `${title} | That Josh Guy`;
  return { title: fullTitle, description, alternates: { canonical: url },
    robots: noIndex || !site.indexable ? { index: false, follow: true } : undefined,
    openGraph: { title: fullTitle, description, url, type: 'website', images: [{ url: '/images/preview.png', width: 1200, height: 630, alt: 'That Josh Guy' }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: ['/images/preview.png'] },
  };
}
