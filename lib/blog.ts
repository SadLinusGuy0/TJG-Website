import 'server-only';
import { getBlogContentSource, getWordpressSourceUrl } from './blogSourceConfig';
import * as wp from './wordpress';
import * as sanity from './sanity';
import { stripHtmlAndDecode, type PortableTextBlock } from './portableText';
import { getBlogEdition, isPostVisibleOnEdition, type SiteEdition } from './siteEdition';

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
  const [cats, tags] = await Promise.all([
    wp.fetchCategories(apiBaseUrl),
    wp.fetchTags(apiBaseUrl),
  ]);
  const catMap = new Map<number, string>();
  const tagMap = new Map<number, string>();
  cats.forEach(c => catMap.set(c.id, c.slug));
  tags.forEach(t => tagMap.set(t.id, t.slug));
  return { catMap, tagMap, cats, tags };
}

export async function fetchAllBlogPosts(opts?: { tagSlug?: string }): Promise<BlogPost[]> {
  const [source, edition] = await Promise.all([
    getBlogContentSource(),
    getBlogEdition(),
  ]);

  if (source === 'sanity') {
    const posts = await sanity.fetchAllPosts({ ...opts, edition });
    return dedupeBlogPostsBySlug(posts).filter((post) =>
      isPostVisibleOnEdition(post.tags, edition)
    );
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const { catMap, tagMap, tags } = await wpSlugMaps(apiBaseUrl);

  let tagId: number | undefined;
  if (opts?.tagSlug) {
    const tag = tags.find(t => t.slug === opts.tagSlug);
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
    getBlogEdition(),
  ]);

  if (source === 'sanity') {
    const post = await sanity.fetchPostBySlug(slug, edition);
    return post && isPostVisibleOnEdition(post.tags, edition) ? post : null;
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const [post, { catMap, tagMap }] = await Promise.all([
    wp.fetchPostBySlug(slug, apiBaseUrl),
    wpSlugMaps(apiBaseUrl),
  ]);
  if (post) {
    const mappedPost = wpPostToBlogPost(post, catMap, tagMap);
    return isPostVisibleOnEdition(mappedPost.tags, edition) ? mappedPost : null;
  }

  const page = await wp.fetchPageBySlug(slug, apiBaseUrl);
  if (page) {
    const mappedPage = wpPostToBlogPost(page, catMap, tagMap);
    return isPostVisibleOnEdition(mappedPage.tags, edition) ? mappedPage : null;
  }

  return null;
}

export async function fetchBlogPostFeaturedImage(slug: string): Promise<string | null> {
  const [source, edition] = await Promise.all([
    getBlogContentSource(),
    getBlogEdition(),
  ]);

  if (source === 'sanity') {
    const post = await sanity.fetchPostBySlug(slug, edition);
    return post?.featuredImageUrl ?? null;
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const [post, { catMap, tagMap }] = await Promise.all([
    wp.fetchPostBySlug(slug, apiBaseUrl),
    wpSlugMaps(apiBaseUrl),
  ]);
  if (!post) return null;
  const mappedPost = wpPostToBlogPost(post, catMap, tagMap);
  return isPostVisibleOnEdition(mappedPost.tags, edition)
    ? wp.getFeaturedImageUrlAsync(post, apiBaseUrl)
    : null;
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const source = await getBlogContentSource();

  if (source === 'sanity') {
    return sanity.fetchCategories();
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const cats = await wp.fetchCategories(apiBaseUrl);
  return cats.map(c => ({ id: c.slug, name: c.name, slug: c.slug }));
}

export async function fetchBlogTags(): Promise<BlogTag[]> {
  const source = await getBlogContentSource();

  if (source === 'sanity') {
    return sanity.fetchTags();
  }

  const apiBaseUrl = await getWordpressSourceUrl();
  const tags = await wp.fetchTags(apiBaseUrl);
  return tags.map(t => ({ id: t.slug, name: t.name, slug: t.slug }));
}

/** Listing boundary: never serialize article bodies, SEO data, or full search text. */
export type BlogSummary = Pick<BlogPost, 'id' | 'date' | 'slug' | 'title' | 'excerpt' | 'categories' | 'tags' | 'featuredImageUrl' | 'featuredImageAlt'>;
export type BlogPage = { posts: BlogSummary[]; hasMore: boolean };
function summary(post: BlogPost): BlogSummary {
  const { id, date, slug, categories, tags, featuredImageUrl, featuredImageAlt } = post;
  return { id, date, slug, categories, tags, featuredImageUrl, featuredImageAlt,
    title: { rendered: stripHtmlAndDecode(post.title.rendered) },
    excerpt: { rendered: stripHtmlAndDecode(post.excerpt.rendered).slice(0, 400) },
  };
}
export async function fetchBlogPage(options: { page?: number; perPage?: number; category?: string; search?: string } = {}): Promise<BlogPage> {
  const page = Math.max(1, Math.min(1000, Math.trunc(options.page || 1)));
  const perPage = Math.max(1, Math.min(100, Math.trunc(options.perPage || 12)));
  const [source, edition] = await Promise.all([getBlogContentSource(), getBlogEdition()]);
  if (source === 'sanity') {
    const result = await sanity.fetchPostPage({ ...options, page, perPage, edition });
    return { posts: dedupeBlogPostsBySlug(result.posts).map(summary), hasMore: result.hasMore };
  }
  const apiBaseUrl = await getWordpressSourceUrl();
  const { catMap, tagMap, cats, tags } = await wpSlugMaps(apiBaseUrl);
  const collegeId = tags.find(t => t.slug === 'college')?.id;
  const categoryId = options.category ? cats.find(c => c.slug === options.category)?.id : undefined;
  if ((edition === 'college' && !collegeId) || (options.category && !categoryId)) return { posts: [], hasMore: false };
  const result = await wp.fetchPostPage({ page, perPage, apiBaseUrl, categoryId, search: options.search,
    tagId: edition === 'college' ? collegeId : undefined, excludeTagId: edition === 'college' ? undefined : collegeId,
  });
  return { posts: dedupeBlogPostsBySlug(result.items.map(p => wpPostToBlogPost(p, catMap, tagMap)))
    .filter(p => isPostVisibleOnEdition(p.tags, edition)).map(summary), hasMore: result.hasMore };
}

export async function fetchPublicSitemapPosts(edition: SiteEdition): Promise<Array<{ slug: string; date: string }>> {
  if (await getBlogContentSource() === 'sanity') return sanity.fetchSitemapPosts(edition);
  const apiBaseUrl = await getWordpressSourceUrl();
  const { catMap, tagMap } = await wpSlugMaps(apiBaseUrl);
  const posts = await wp.fetchAllPosts({ apiBaseUrl, summary: true });
  return dedupeBlogPostsBySlug(posts.map(p => wpPostToBlogPost(p, catMap, tagMap)))
    .filter(p => isPostVisibleOnEdition(p.tags, edition)).map(p => ({ slug: p.slug, date: p.date }));
}
