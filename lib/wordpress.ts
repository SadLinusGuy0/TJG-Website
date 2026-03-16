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

const apiBaseUrl = (process.env.WP_API_URL?.replace(/\/$/, "") || "https://joshskinnertjg.wordpress.com");

function getApiUrls() {
  ensureConfigured();
  let hostname: string;
  try {
    hostname = new URL(apiBaseUrl).hostname;
  } catch {
    hostname = apiBaseUrl.replace(/^https?:\/\//, "");
  }
  const isWPCom = /\.wordpress\.com$/i.test(hostname);

  return {
    isWPCom,
    hostname,
    wpJsonBase: `${apiBaseUrl}/wp-json/wp/v2`,
    wpComBase: `https://public-api.wordpress.com/wp/v2/sites/${hostname}`,
  };
}

function ensureConfigured(): void {
  if (!apiBaseUrl) {
    console.error("WP_API_URL is not configured. Please set the WP_API_URL environment variable.");
    throw new Error("WP_API_URL is not configured. Add it to your environment.");
  }
}

export async function fetchPosts(params: { page?: number; perPage?: number; categoryId?: number; tagId?: number } = {}): Promise<WPPost[]> {
  const { page = 1, perPage = 10, categoryId, tagId } = params;
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/posts?_fields=id,date,slug,link,title,excerpt,content,categories,tags,featured_media,jetpack_featured_media_url&_embed=wp:featuredmedia&page=${page}&per_page=${perPage}&orderby=date&order=desc${categoryId ? `&categories=${categoryId}` : ""}${tagId ? `&tags=${tagId}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  return res.json();
}

/** Fetches all posts by paginating through the API. Use when you need the complete set (e.g. blog index). */
export async function fetchAllPosts(params: { categoryId?: number; tagId?: number } = {}): Promise<WPPost[]> {
  const perPage = 100; // WordPress REST API max
  const all: WPPost[] = [];
  let page = 1;

  while (true) {
    const batch = await fetchPosts({ page, perPage, ...params });
    all.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return all;
}

export async function fetchPages(params: { page?: number; perPage?: number } = {}): Promise<WPPost[]> {
  const { page = 1, perPage = 10 } = params;
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/pages?_fields=id,date,slug,link,title,excerpt&page=${page}&per_page=${perPage}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch pages: ${res.status}`);
  return res.json();
}

export async function fetchCategories(): Promise<WPCategory[]> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/categories?_fields=id,name,slug`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return res.json();
}

export async function fetchTags(): Promise<WPTag[]> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/tags?_fields=id,name,slug&per_page=100`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch tags: ${res.status}`);
  return res.json();
}

export async function fetchPostBySlug(slug: string): Promise<WPPost | null> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/posts?slug=${encodeURIComponent(slug)}&_fields=id,date,slug,link,title,excerpt,content,categories,featured_media,jetpack_featured_media_url&_embed=wp:featuredmedia`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  const data: WPPost[] = await res.json();
  return data[0] || null;
}

export async function fetchPageBySlug(slug: string): Promise<WPPost | null> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/pages?slug=${encodeURIComponent(slug)}&_fields=id,date,slug,link,title,excerpt,content,featured_media,jetpack_featured_media_url&_embed=wp:featuredmedia`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  const data: WPPost[] = await res.json();
  return data[0] || null;
}

export async function fetchMediaById(mediaId: number): Promise<{ source_url?: string; media_details?: { sizes?: { full?: { source_url: string }; large?: { source_url: string }; medium_large?: { source_url: string } } } } | null> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/media/${mediaId}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
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

export async function getFeaturedImageUrlAsync(post: WPPost): Promise<string | null> {
  // Fast path: resolve from embedded data (no extra fetch needed)
  const syncResult = getFeaturedImageUrl(post);
  if (syncResult) return syncResult;

  // Slow path: embedded data missing, fetch media record separately
  if (post.featured_media) {
    const media = await fetchMediaById(post.featured_media);
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
