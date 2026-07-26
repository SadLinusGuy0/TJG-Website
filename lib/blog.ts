import { getBlogContentSource } from './getBlogContentSourceFlag';
import { getWordpressSourceUrl } from './getWordpressSourceUrlFlag';
import * as wp from './wordpress';
import * as sanity from './sanity';
import { stripHtmlAndDecode, type PortableTextBlock } from './portableText';
import { getSiteEdition, isPostVisibleOnEdition } from './siteEdition';

export { getBlogContentSource };

export type BlogPost = {
  id: string;
  date: string;
  slug: string;
  link?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  categories: string[];
  tags: string[];
  featuredImageUrl: string | null;
  featuredImageAlt?: string;
  wordCount?: number;
  contentSource: 'legacyHtml' | 'portableText';
  portableBody?: PortableTextBlock[];
  searchText: string;
  legacySourceUrl?: string;
  seo?: sanity.BlogSeo;
};

export type BlogCategory = { id: string; name: string; slug: string };
export type BlogTag = { id: string; name: string; slug: string };

function wpPostToBlogPost(
  post: wp.WPPost,
  catSlugMap: Map<number, string>,
  tagSlugMap: Map<number, string>,
): BlogPost {
  const searchText = [
    stripHtmlAndDecode(post.title?.rendered),
    stripHtmlAndDecode(post.excerpt?.rendered),
    stripHtmlAndDecode(post.content?.rendered),
  ].filter(Boolean).join(' ').toLowerCase();

  return {
    id: String(post.id),
    date: post.date,
    slug: post.slug,
    link: post.link,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    categories: post.categories?.map(id => catSlugMap.get(id) ?? String(id)) ?? [],
    tags: post.tags?.map(id => tagSlugMap.get(id) ?? String(id)) ?? [],
    featuredImageUrl: wp.getFeaturedImageUrl(post),
    featuredImageAlt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text?.trim() || undefined,
    contentSource: 'legacyHtml',
    searchText,
    legacySourceUrl: post.link,
  };
}

export function dedupeBlogPostsBySlug(posts: BlogPost[]): BlogPost[] {
  const seen = new Set<string>();
  return posts.filter((post) => {
    const key = post.slug.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function wpSlugMaps(apiBaseUrl: string) {
  const [cats, tags] = await Promise.allSettled([
    wp.fetchCategories(apiBaseUrl),
    wp.fetchTags(apiBaseUrl),
  ]);
  const catMap = new Map<number, string>();
  const tagMap = new Map<number, string>();
  if (cats.status === 'fulfilled') cats.value.forEach(c => catMap.set(c.id, c.slug));
  if (tags.status === 'fulfilled') tags.value.forEach(t => tagMap.set(t.id, t.slug));
  return { catMap, tagMap, cats, tags };
}

export async function fetchAllBlogPosts(opts?: { tagSlug?: string }): Promise<BlogPost[]> {
  const [source, edition] = await Promise.all([
    getBlogContentSource(),
    getSiteEdition(),
  ]);

  if (source === 'sanity') {
    if (!sanity.isSanityConfigured()) return [];
    const posts = await sanity.fetchAllPosts(opts);
    return dedupeBlogPostsBySlug(posts).filter((post) =>
      isPostVisibleOnEdition(post.tags, edition)
    );
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const { catMap, tagMap, tags } = await wpSlugMaps(apiBaseUrl);

  let tagId: number | undefined;
  if (opts?.tagSlug && tags.status === 'fulfilled') {
    const tag = tags.value.find(t => t.slug === opts.tagSlug);
    tagId = tag?.id;
    if (!tagId) return [];
  }

  const posts = await wp.fetchAllPosts({ tagId, apiBaseUrl });
  return dedupeBlogPostsBySlug(posts.map(p => wpPostToBlogPost(p, catMap, tagMap)))
    .filter((post) => isPostVisibleOnEdition(post.tags, edition));
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const [source, edition] = await Promise.all([
    getBlogContentSource(),
    getSiteEdition(),
  ]);

  if (source === 'sanity') {
    if (!sanity.isSanityConfigured()) return null;
    const post = await sanity.fetchPostBySlug(slug);
    return post && isPostVisibleOnEdition(post.tags, edition) ? post : null;
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const post = await wp.fetchPostBySlug(slug, apiBaseUrl);
  if (post) {
    const mappedPost = wpPostToBlogPost(post, new Map(), new Map());
    return isPostVisibleOnEdition(mappedPost.tags, edition) ? mappedPost : null;
  }

  const page = await wp.fetchPageBySlug(slug, apiBaseUrl);
  if (page) {
    const mappedPage = wpPostToBlogPost(page, new Map(), new Map());
    return isPostVisibleOnEdition(mappedPage.tags, edition) ? mappedPage : null;
  }

  return null;
}

export async function fetchBlogPostFeaturedImage(slug: string): Promise<string | null> {
  const source = await getBlogContentSource();

  if (source === 'sanity') {
    if (!sanity.isSanityConfigured()) return null;
    const post = await sanity.fetchPostBySlug(slug);
    return post?.featuredImageUrl ?? null;
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const post = await wp.fetchPostBySlug(slug, apiBaseUrl);
  if (!post) return null;
  return wp.getFeaturedImageUrlAsync(post, apiBaseUrl);
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const source = await getBlogContentSource();

  if (source === 'sanity') {
    if (!sanity.isSanityConfigured()) return [];
    return sanity.fetchCategories();
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const cats = await wp.fetchCategories(apiBaseUrl);
  return cats.map(c => ({ id: c.slug, name: c.name, slug: c.slug }));
}

export async function fetchBlogTags(): Promise<BlogTag[]> {
  const source = await getBlogContentSource();

  if (source === 'sanity') {
    if (!sanity.isSanityConfigured()) return [];
    return sanity.fetchTags();
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const tags = await wp.fetchTags(apiBaseUrl);
  return tags.map(t => ({ id: t.slug, name: t.name, slug: t.slug }));
}
