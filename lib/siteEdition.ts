import { headers, cookies } from 'next/headers';

export const SITE_EDITIONS = ['normal', 'college'] as const;
export type SiteEdition = (typeof SITE_EDITIONS)[number];
export type SiteEnvironment = 'development' | 'preview' | 'production';

const PRODUCTION_ORIGINS: Record<SiteEdition, string> = {
  normal: 'https://thatjoshguy.me',
  college: 'https://college.thatjoshguy.me',
};
const HOST_EDITIONS: Record<string, SiteEdition> = {
  'thatjoshguy.me': 'normal',
  'www.thatjoshguy.me': 'normal',
  'college.thatjoshguy.me': 'college',
  'beta.thatjoshguy.me': 'normal',
  'college.beta.thatjoshguy.me': 'college',
  'normal.localhost': 'normal',
  'beta.localhost': 'normal',
  'college.localhost': 'college',
  'college.beta.localhost': 'college',
};
const PREVIEW_HOSTS = new Set(['beta.thatjoshguy.me', 'college.beta.thatjoshguy.me']);
const PUBLIC_HOSTS = new Set(['thatjoshguy.me', 'www.thatjoshguy.me', 'college.thatjoshguy.me']);

function parseHost(rawHost: string | null | undefined): URL | undefined {
  const host = rawHost?.split(',')[0].trim().toLowerCase();
  if (!host || /[\s/@\\?#]/.test(host)) return undefined;
  try { return new URL(`https://${host}`); } catch { return undefined; }
}

export function resolveSiteEditionFromHost(rawHost: string | null | undefined, fallback: SiteEdition = 'normal'): SiteEdition {
  const host = parseHost(rawHost)?.hostname;
  return host && Object.hasOwn(HOST_EDITIONS, host) ? HOST_EDITIONS[host] : fallback;
}

function configuredEdition(value: string | undefined): SiteEdition {
  // Compatibility with existing deployments; main/beta both meant normal content.
  return value?.trim().toLowerCase() === 'college' ? 'college' : 'normal';
}

export interface SiteContext {
  edition: SiteEdition;
  environment: SiteEnvironment;
  origin: string;
  canonicalOrigin: string;
  indexable: boolean;
}

export function resolveSiteContext(rawHost: string | null | undefined, config: {
  siteEdition?: string;
  vercelEnv?: string;
  nodeEnv?: string;
} = {}): SiteContext {
  const parsed = parseHost(rawHost);
  const hostname = parsed?.hostname ?? '';
  const edition = resolveSiteEditionFromHost(rawHost, configuredEdition(config.siteEdition));
  const local = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1' || hostname === '[::1]';
  const vercelHost = hostname.endsWith('.vercel.app');
  const environment: SiteEnvironment = config.vercelEnv === 'preview' || config.vercelEnv === 'development'
    ? config.vercelEnv
    : config.vercelEnv === 'production' ? 'production'
    : config.nodeEnv === 'development' ? 'development'
    : PREVIEW_HOSTS.has(hostname) || vercelHost ? 'preview'
    : config.nodeEnv === 'production' ? 'production' : 'development';
  const canonicalOrigin = getCanonicalSiteUrl(edition);
  const origin = parsed && (Object.hasOwn(HOST_EDITIONS, hostname) || local || vercelHost)
    ? `${local ? 'http:' : 'https:'}//${parsed.host}` : canonicalOrigin;
  return {
    edition, environment, origin, canonicalOrigin,
    indexable: environment === 'production' && PUBLIC_HOSTS.has(hostname),
  };
}

export async function getSiteContext(): Promise<SiteContext> {
  let host: string | null = null;
  try {
    const requestHeaders = await headers();
    host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  } catch {
    // Build-time scripts and tests may not have a request context.
  }
  return resolveSiteContext(host, {
    siteEdition: process.env.SITE_EDITION,
    vercelEnv: process.env.VERCEL_ENV,
    nodeEnv: process.env.NODE_ENV,
  });
}

export async function getSiteEdition(): Promise<SiteEdition> {
  return (await getSiteContext()).edition;
}

export function getCanonicalSiteUrl(edition: SiteEdition): string {
  return PRODUCTION_ORIGINS[edition];
}

export function isPostVisibleOnEdition(tags: string[], edition: SiteEdition): boolean {
  const isCollegePost = tags.some((tag) => tag.trim().toLowerCase() === 'college');
  return edition === 'college' ? isCollegePost : !isCollegePost;
}

/** Browser-local content preview; identity, origins and indexing remain host-based. */
export async function getBlogEdition(): Promise<SiteEdition> {
  try {
    const override = (await cookies()).get('ff-blog-content-edition')?.value;
    if (override === 'normal' || override === 'college') return override;
  } catch { /* Build-time callers use the site's configured edition. */ }
  return getSiteEdition();
}
