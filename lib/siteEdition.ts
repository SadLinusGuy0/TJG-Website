import { headers, cookies } from 'next/headers';

export const SITE_EDITIONS = ['main', 'college', 'beta'] as const;

export type SiteEdition = (typeof SITE_EDITIONS)[number];

const SITE_URLS: Record<SiteEdition, string> = {
  main: 'https://thatjoshguy.me',
  college: 'https://college.thatjoshguy.me',
  beta: 'https://beta.thatjoshguy.me',
};

function isSiteEdition(value: string | undefined): value is SiteEdition {
  return SITE_EDITIONS.includes(value as SiteEdition);
}

export function resolveSiteEditionFromHost(
  rawHost: string | null | undefined,
  fallback: SiteEdition = 'main',
): SiteEdition {
  const host = rawHost
    ?.split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');

  if (!host) return fallback;
  if (host === 'college.thatjoshguy.me' || host.startsWith('college.')) return 'college';
  if (host === 'beta.thatjoshguy.me' || host.startsWith('beta.')) return 'beta';
  if (host === 'thatjoshguy.me' || host === 'www.thatjoshguy.me') return 'main';

  return fallback;
}

function configuredFallback(): SiteEdition {
  const configured = process.env.SITE_EDITION?.trim().toLowerCase();
  if (isSiteEdition(configured)) return configured;
  return process.env.NODE_ENV === 'development' ? 'beta' : 'main';
}

export async function getSiteEdition(): Promise<SiteEdition> {
  const fallback = configuredFallback();

  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
    return resolveSiteEditionFromHost(host, fallback);
  } catch {
    // Build-time scripts and tests do not always have a request context.
    return fallback;
  }
}

export function getSiteUrl(edition: SiteEdition): string {
  return SITE_URLS[edition];
}

export function isPostVisibleOnEdition(tags: string[], edition: SiteEdition): boolean {
  const isCollegePost = tags.some((tag) => tag.trim().toLowerCase() === 'college');
  return edition === 'college' ? isCollegePost : !isCollegePost;
}

/** Browser-local content preview; site identity and canonical URLs remain host-based. */
export async function getBlogEdition(): Promise<SiteEdition> {
  try {
    const override = (await cookies()).get('ff-blog-content-edition')?.value;
    if (override === 'normal') return 'main';
    if (override === 'college') return 'college';
  } catch { /* Build-time callers use the site's configured edition. */ }
  return getSiteEdition();
}
