import type { Metadata } from 'next';
import { getSiteEdition, getSiteUrl } from './siteEdition';
export async function routeMetadata(path: string, title: string, description: string, noIndex = false): Promise<Metadata> {
  const edition = await getSiteEdition();
  const url = `${getSiteUrl(edition)}${path}`;
  const fullTitle = title === 'That Josh Guy' ? title : `${title} | That Josh Guy`;
  return { title: fullTitle, description, alternates: { canonical: url },
    robots: noIndex || edition === 'beta' || process.env.VERCEL_ENV === 'preview' ? { index: false, follow: true } : undefined,
    openGraph: { title: fullTitle, description, url, type: 'website', images: [{ url: '/images/preview.png', width: 1200, height: 630, alt: 'That Josh Guy' }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: ['/images/preview.png'] },
  };
}
