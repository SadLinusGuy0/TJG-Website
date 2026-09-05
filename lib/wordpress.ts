import 'server-only';
import { trustedWordpressOrigin } from './wordpressOrigins';
import { collectWordpressPages } from './wpPagination';
import { readBoundedJson, UpstreamError } from './upstream';
export type WPPost = {
  id: number;
  date: string;
  slug: string;
  link?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  categories?: number[];
  tags?: number[];
  type?: string;
  featured_media?: number;
  jetpack_featured_media_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: {
          full?: { source_url: string };
          large?: { source_url: string };
          medium_large?: { source_url: string };
        };
      };
    }>;
  };
};

export type WPCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WPTag = {
  id: number;
  name: string;
  slug: string;
};

const defaultApiBaseUrl = "https://tjg8.wordpress.com";
/** Revalidate every N seconds. 300 = 5 min. Set WP_REVALIDATE_SECONDS=0 to disable cache. */
const revalidateSeconds = parseInt(process.env.WP_REVALIDATE_SECONDS ?? "300", 10);

function getApiUrls(apiBaseUrl?: string) {
  const base = trustedWordpressOrigin(apiBaseUrl || defaultApiBaseUrl);
  ensureConfigured(base);
  let hostname: string;
  try {
    hostname = new URL(base).hostname;
  } catch {
    hostname = base.replace(/^https?:\/\//, "");
  }
  const isWPCom = /\.wordpress\.com$/i.test(hostname);

  return {
    isWPCom,
    hostname,
    wpJsonBase: `${base}/wp-json/wp/v2`,
    wpComBase: `https://public-api.wordpress.com/wp/v2/sites/${hostname}`,
  };
}

async function wpRequest(path: string, apiBaseUrl?: string): Promise<Response> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls(apiBaseUrl);
  const base = isWPCom ? wpComBase : wpJsonBase;
  try {
    return await fetch(`${base}${path}`, {
      ...(revalidateSeconds === 0 ? { cache: 'no-store' as const } : { next: { revalidate: revalidateSeconds, tags: ['blog'] } }),
      redirect: 'error', signal: AbortSignal.timeout(10000),
    });
  } catch { throw new UpstreamError('WordPress'); }
}
async function wpFetch<T>(path: string, _errorLabel: string, apiBaseUrl?: string): Promise<T> {
  return readBoundedJson<T>(await wpRequest(path, apiBaseUrl), 'WordPress');
}
async function wpPage<T>(path: string, apiBaseUrl?: string): Promise<{ items: T[]; totalPages: number }> {
  const response = await wpRequest(path, apiBaseUrl);
  const items = await readBoundedJson<T[]>(response, 'WordPress');
  const header = response.headers.get('x-wp-totalpages');
  if (!Array.isArray(items) || header === null) throw new UpstreamError('WordPress');
  return { items, totalPages: Number(header) };
}

function ensureConfigured(base: string): void {
  if (!base) {
    console.error("WordPress API URL is not configured.");
    throw new Error("WordPress API URL is not configured.");
  }
}

export type PostQuery = { page?: number; perPage?: number; categoryId?: number; tagId?: number; excludeTagId?: number; search?: string; apiBaseUrl?: string; summary?: boolean };
export async function fetchPostPage(params: PostQuery = {}) {
  const { page = 1, perPage = 12, categoryId, tagId, excludeTagId, search, apiBaseUrl, summary = true } = params;
  const query = new URLSearchParams({
    _fields: `id,date,slug,link,title,excerpt,${summary ? '' : 'content,'}categories,tags,featured_media,jetpack_featured_media_url,_embedded`,
    _embed: 'wp:featuredmedia', page: String(page), per_page: String(perPage), orderby: 'date', order: 'desc',
  });
  if (categoryId) query.set('categories', String(categoryId));
  if (tagId) query.set('tags', String(tagId));
  if (excludeTagId) query.set('tags_exclude', String(excludeTagId));
  if (search) query.set('search', search);
  const result = await wpPage<WPPost>(`/posts?${query}`, apiBaseUrl);
  return { ...result, hasMore: page < result.totalPages };
}
export async function fetchPosts(params: PostQuery = {}): Promise<WPPost[]> {
  return (await fetchPostPage(params)).items;
}
export async function fetchAllPosts(params: PostQuery = {}): Promise<WPPost[]> {
  return collectWordpressPages((page) => fetchPostPage({ ...params, page, perPage: 100 }));
}

export async function fetchPages(params: { page?: number; perPage?: number; apiBaseUrl?: string } = {}): Promise<WPPost[]> {
  const { page = 1, perPage = 10, apiBaseUrl } = params;
  const path = `/pages?_fields=id,date,slug,link,title,excerpt&page=${page}&per_page=${perPage}`;
  return wpFetch<WPPost[]>(path, "pages", apiBaseUrl);
}

export async function fetchCategories(apiBaseUrl?: string): Promise<WPCategory[]> {
  return collectWordpressPages((page) => wpPage<WPCategory>(`/categories?_fields=id,name,slug&per_page=100&page=${page}`, apiBaseUrl));
}

export async function fetchTags(apiBaseUrl?: string): Promise<WPTag[]> {
  return collectWordpressPages((page) => wpPage<WPTag>(`/tags?_fields=id,name,slug&per_page=100&page=${page}`, apiBaseUrl));
}

export async function fetchPostBySlug(slug: string, apiBaseUrl?: string): Promise<WPPost | null> {
  const path = `/posts?slug=${encodeURIComponent(slug)}&_fields=id,date,slug,link,title,excerpt,content,categories,tags,_embedded,featured_media,jetpack_featured_media_url&_embed=wp:featuredmedia`;
  const data = await wpFetch<WPPost[]>(path, "post", apiBaseUrl);
  return data[0] || null;
}

export async function fetchPageBySlug(slug: string, apiBaseUrl?: string): Promise<WPPost | null> {
  const path = `/pages?slug=${encodeURIComponent(slug)}&_fields=id,date,slug,link,title,excerpt,content,categories,tags,_embedded,featured_media,jetpack_featured_media_url&_embed=wp:featuredmedia`;
  const data = await wpFetch<WPPost[]>(path, "page", apiBaseUrl);
  return data[0] || null;
}

export async function fetchMediaById(mediaId: number, apiBaseUrl?: string): Promise<{ source_url?: string; media_details?: { sizes?: { full?: { source_url: string }; large?: { source_url: string }; medium_large?: { source_url: string } } } } | null> {
  try {
    return await wpFetch(`/media/${mediaId}`, "media", apiBaseUrl);
  } catch {
    return null;
  }
}

export function getFeaturedImageUrl(post: WPPost): string | null {
  if (post.jetpack_featured_media_url) {
    return post.jetpack_featured_media_url;
  }

  if (post._embedded?.['wp:featuredmedia']?.[0]) {
    const media = post._embedded['wp:featuredmedia'][0];
    return (
      media.media_details?.sizes?.large?.source_url ||
      media.media_details?.sizes?.medium_large?.source_url ||
      media.media_details?.sizes?.full?.source_url ||
      media.source_url ||
      null
    );
  }

  if (post.content?.rendered) {
    const imgMatches = post.content.rendered.match(/<img[^>]+src="([^"]+)"[^>]*>/gi);
    if (imgMatches?.length) {
      for (const imgMatch of imgMatches) {
        const srcMatch = imgMatch.match(/src="([^"]+)"/i);
        if (srcMatch?.[1]) {
          let imageUrl = srcMatch[1]
            .replace(/[?&]w=\d+/, '')
            .replace(/[?&]h=\d+/, '');
          if (imageUrl.includes('wordpress.com') && imageUrl.includes('/wp-content/uploads/')) {
            imageUrl = imageUrl.replace(/-\d+x\d+\.(jpg|jpeg|png|gif|webp)/i, '.$1');
          }
          return imageUrl;
        }
      }
    }
  }

  return null;
}

export async function getFeaturedImageUrlAsync(post: WPPost, apiBaseUrl?: string): Promise<string | null> {
  // Fast path: resolve from embedded data (no extra fetch needed)
  const syncResult = getFeaturedImageUrl(post);
  if (syncResult) return syncResult;

  // Slow path: embedded data missing, fetch media record separately
  if (post.featured_media) {
    const media = await fetchMediaById(post.featured_media, apiBaseUrl);
    if (media) {
      return (
        media.media_details?.sizes?.large?.source_url ||
        media.media_details?.sizes?.medium_large?.source_url ||
        media.media_details?.sizes?.full?.source_url ||
        media.source_url ||
        null
      );
    }
  }

  return null;
}
