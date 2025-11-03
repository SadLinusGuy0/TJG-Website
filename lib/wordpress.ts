export type WPPost = {
  id: number;
  date: string;
  slug: string;
  link?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  categories?: number[];
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

const apiBaseUrl = (process.env.WP_API_URL?.replace(/\/$/, "") || "https://joshskinnertjg.wordpress.com");

function getApiUrls() {
  ensureConfigured();
  let hostname: string;
  try {
    hostname = new URL(apiBaseUrl).hostname;
  } catch {
    // If user passed a bare hostname
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
    console.error("Example: WP_API_URL=https://your-wordpress-site.com");
    throw new Error("WP_API_URL is not configured. Add it to your environment.");
  }
}

export async function fetchPosts(params: { page?: number; perPage?: number; categoryId?: number } = {}): Promise<WPPost[]> {
  const { page = 1, perPage = 10, categoryId } = params;
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/posts?_fields=id,date,slug,link,title,excerpt,content,categories,featured_media,jetpack_featured_media_url&_embed=wp:featuredmedia&page=${page}&per_page=${perPage}&orderby=date&order=desc${categoryId ? `&categories=${categoryId}` : ""}`;
  
  console.log('Fetching posts from URL:', url);
  console.log('API Base URL:', apiBaseUrl);
  console.log('Is WordPress.com:', isWPCom);
  
  const res = await fetch(url, { next: { revalidate: 0 } });
  console.log('Fetch response status:', res.status);
  
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  const data = await res.json();
  console.log('Posts data received:', data.length, 'posts');
  console.log('First post structure:', data[0] ? {
    id: data[0].id,
    title: data[0].title?.rendered,
    featured_media: data[0].featured_media,
    jetpack_featured_media_url: data[0].jetpack_featured_media_url,
    hasEmbedded: !!data[0]._embedded,
    embeddedKeys: data[0]._embedded ? Object.keys(data[0]._embedded) : []
  } : 'No posts');
  
  return data;
}

export async function fetchPages(params: { page?: number; perPage?: number } = {}): Promise<WPPost[]> {
  const { page = 1, perPage = 10 } = params;
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/pages?_fields=id,date,slug,link,title,excerpt&page=${page}&per_page=${perPage}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Failed to fetch pages: ${res.status}`);
  return res.json();
}

export async function fetchCategories(): Promise<WPCategory[]> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/categories?_fields=id,name,slug`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return res.json();
}

export async function fetchPostBySlug(slug: string): Promise<WPPost | null> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/posts?slug=${encodeURIComponent(slug)}&_fields=id,date,slug,link,title,excerpt,content,categories,featured_media,jetpack_featured_media_url&_embed=wp:featuredmedia`;
  
  console.log('Fetching post by slug from URL:', url);
  console.log('Slug:', slug);
  
  const res = await fetch(url, { next: { revalidate: 0 } });
  console.log('Post fetch response status:', res.status);
  
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  const data: WPPost[] = await res.json();
  console.log('Post data received:', data.length, 'posts');
  console.log('Post structure:', data[0] ? {
    id: data[0].id,
    title: data[0].title?.rendered,
    featured_media: data[0].featured_media,
    jetpack_featured_media_url: data[0].jetpack_featured_media_url,
    hasEmbedded: !!data[0]._embedded,
    embeddedKeys: data[0]._embedded ? Object.keys(data[0]._embedded) : [],
    embeddedMedia: data[0]._embedded?.['wp:featuredmedia']
  } : 'No post found');
  
  return data[0] || null;
}

export async function fetchPageBySlug(slug: string): Promise<WPPost | null> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/pages?slug=${encodeURIComponent(slug)}&_fields=id,date,slug,link,title,excerpt,content,featured_media,jetpack_featured_media_url&_embed=wp:featuredmedia`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
  const data: WPPost[] = await res.json();
  return data[0] || null;
}

export async function fetchMediaById(mediaId: number): Promise<any | null> {
  const { isWPCom, wpJsonBase, wpComBase } = getApiUrls();
  const base = isWPCom ? wpComBase : wpJsonBase;
  const url = `${base}/media/${mediaId}`;
  
  console.log('Fetching media by ID from URL:', url);
  
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.log('Media fetch failed:', res.status);
      return null;
    }
    const data = await res.json();
    console.log('Media data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching media:', error);
    return null;
  }
}

export function getFeaturedImageUrl(post: WPPost): string | null {
  console.log('getFeaturedImageUrl called for post:', post.id, {
    hasEmbedded: !!post._embedded,
    embeddedKeys: post._embedded ? Object.keys(post._embedded) : [],
    hasFeaturedMedia: !!post._embedded?.['wp:featuredmedia'],
    hasContent: !!post.content?.rendered,
    featuredMediaId: post.featured_media,
    jetpackFeaturedMediaUrl: post.jetpack_featured_media_url
  });

  // First try jetpack_featured_media_url (WordPress.com specific)
  if (post.jetpack_featured_media_url) {
    console.log('Using jetpack_featured_media_url');
    return post.jetpack_featured_media_url;
  }

  // Then try embedded media (works for both WordPress.com and self-hosted)
  if (post._embedded?.['wp:featuredmedia']?.[0]) {
    const media = post._embedded['wp:featuredmedia'][0];
    console.log('Found embedded media:', media);
    
    // Try to get the best available size
    if (media.media_details?.sizes?.large?.source_url) {
      console.log('Using large size');
      return media.media_details.sizes.large.source_url;
    }
    if (media.media_details?.sizes?.medium_large?.source_url) {
      console.log('Using medium_large size');
      return media.media_details.sizes.medium_large.source_url;
    }
    if (media.media_details?.sizes?.full?.source_url) {
      console.log('Using full size');
      return media.media_details.sizes.full.source_url;
    }
    
    // Fallback to source_url
    console.log('Using fallback source_url');
    return media.source_url || null;
  }
  
  // If we have a featured_media ID but no embedded data, try to construct URL
  if (post.featured_media && !post._embedded?.['wp:featuredmedia']) {
    console.log('Has featured_media ID but no embedded data, trying to construct URL...');
    const { isWPCom, wpJsonBase } = getApiUrls();
    
    if (isWPCom) {
      console.log('WordPress.com site - would need to fetch media details');
    } else {
      console.log('Would need to fetch media details from:', `${wpJsonBase}/media/${post.featured_media}`);
    }
  }
  
  // For WordPress.com, try to extract image from content
  if (post.content?.rendered) {
    console.log('Trying to extract image from content...');
    
    // Try to find the best quality image by looking for different patterns
    const imgMatches = post.content.rendered.match(/<img[^>]+src="([^"]+)"[^>]*>/gi);
    
    if (imgMatches && imgMatches.length > 0) {
      console.log('Found', imgMatches.length, 'images in content');
      
      // Look for the best quality image
      for (const imgMatch of imgMatches) {
        const srcMatch = imgMatch.match(/src="([^"]+)"/i);
        if (srcMatch && srcMatch[1]) {
          let imageUrl = srcMatch[1];
          console.log('Processing image URL:', imageUrl);
          
          // For WordPress.com, try to get the highest quality version
          // Remove size parameters and try to get original size
          imageUrl = imageUrl.replace(/[?&]w=\d+/, '').replace(/[?&]h=\d+/, '');
          
          // If it's a WordPress.com image, try to get the original size
          if (imageUrl.includes('wordpress.com') && imageUrl.includes('/wp-content/uploads/')) {
            // Try to get the original size by removing any size suffixes
            imageUrl = imageUrl.replace(/-\d+x\d+\.(jpg|jpeg|png|gif|webp)/i, '.$1');
            console.log('Optimized WordPress.com URL:', imageUrl);
          }
          
          console.log('Final cleaned image URL:', imageUrl);
          return imageUrl;
        }
      }
    }
  }
  
  console.log('No featured image found');
  return null;
}

export async function getFeaturedImageUrlAsync(post: WPPost): Promise<string | null> {
  console.log('getFeaturedImageUrlAsync called for post:', post.id, {
    hasEmbedded: !!post._embedded,
    embeddedKeys: post._embedded ? Object.keys(post._embedded) : [],
    hasFeaturedMedia: !!post._embedded?.['wp:featuredmedia'],
    hasContent: !!post.content?.rendered,
    featuredMediaId: post.featured_media,
    jetpackFeaturedMediaUrl: post.jetpack_featured_media_url
  });

  // First try jetpack_featured_media_url (WordPress.com specific)
  if (post.jetpack_featured_media_url) {
    console.log('Using jetpack_featured_media_url');
    return post.jetpack_featured_media_url;
  }

  // Then try embedded media (works for both WordPress.com and self-hosted)
  if (post._embedded?.['wp:featuredmedia']?.[0]) {
    const media = post._embedded['wp:featuredmedia'][0];
    console.log('Found embedded media:', media);
    
    // Try to get the best available size
    if (media.media_details?.sizes?.large?.source_url) {
      console.log('Using large size');
      return media.media_details.sizes.large.source_url;
    }
    if (media.media_details?.sizes?.medium_large?.source_url) {
      console.log('Using medium_large size');
      return media.media_details.sizes.medium_large.source_url;
    }
    if (media.media_details?.sizes?.full?.source_url) {
      console.log('Using full size');
      return media.media_details.sizes.full.source_url;
    }
    
    // Fallback to source_url
    console.log('Using fallback source_url');
    return media.source_url || null;
  }
  
  // If we have a featured_media ID but no embedded data, fetch media details
  if (post.featured_media && !post._embedded?.['wp:featuredmedia']) {
    console.log('Has featured_media ID but no embedded data, fetching media details...');
    const media = await fetchMediaById(post.featured_media);
    
    if (media) {
      console.log('Fetched media details:', media);
      
      // Try to get the best available size
      if (media.media_details?.sizes?.large?.source_url) {
        console.log('Using fetched large size');
        return media.media_details.sizes.large.source_url;
      }
      if (media.media_details?.sizes?.medium_large?.source_url) {
        console.log('Using fetched medium_large size');
        return media.media_details.sizes.medium_large.source_url;
      }
      if (media.media_details?.sizes?.full?.source_url) {
        console.log('Using fetched full size');
        return media.media_details.sizes.full.source_url;
      }
      
      // Fallback to source_url
      if (media.source_url) {
        console.log('Using fetched source_url');
        return media.source_url;
      }
    }
  }
  
  // For WordPress.com, try to extract image from content
  if (post.content?.rendered) {
    console.log('Trying to extract image from content...');
    
    // Try to find the best quality image by looking for different patterns
    const imgMatches = post.content.rendered.match(/<img[^>]+src="([^"]+)"[^>]*>/gi);
    
    if (imgMatches && imgMatches.length > 0) {
      console.log('Found', imgMatches.length, 'images in content');
      
      // Look for the best quality image
      for (const imgMatch of imgMatches) {
        const srcMatch = imgMatch.match(/src="([^"]+)"/i);
        if (srcMatch && srcMatch[1]) {
          let imageUrl = srcMatch[1];
          console.log('Processing image URL:', imageUrl);
          
          // For WordPress.com, try to get the highest quality version
          // Remove size parameters and try to get original size
          imageUrl = imageUrl.replace(/[?&]w=\d+/, '').replace(/[?&]h=\d+/, '');
          
          // If it's a WordPress.com image, try to get the original size
          if (imageUrl.includes('wordpress.com') && imageUrl.includes('/wp-content/uploads/')) {
            // Try to get the original size by removing any size suffixes
            imageUrl = imageUrl.replace(/-\d+x\d+\.(jpg|jpeg|png|gif|webp)/i, '.$1');
            console.log('Optimized WordPress.com URL:', imageUrl);
          }
          
          console.log('Final cleaned image URL:', imageUrl);
          return imageUrl;
        }
      }
    }
  }
  
  console.log('No featured image found');
  return null;
}


