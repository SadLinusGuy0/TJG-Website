import 'server-only';
import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { sanityConfig } from './sanity.config';
import { portableTextToPlainText, stripHtmlAndDecode, type PortableTextBlock } from './portableText';
import type { SiteEdition } from './siteEdition';

const REVALIDATE_SECONDS = 60;

let _client: SanityClient | null = null;

export function isSanityConfigured(): boolean {
  return Boolean(sanityConfig.projectId);
}

function getClient(): SanityClient {
  if (!_client) {
    if (!isSanityConfigured()) {
      throw new Error(
        'Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID to use Sanity as the blog content source.',
      );
    }
    _client = createClient({
      ...sanityConfig,
      token: process.env.SANITY_READ_TOKEN,
      timeout: 10000,
      maxRetries: 1,
    });
  }
  return _client;
}

function fetchOptions() {
  return {
    next: { revalidate: REVALIDATE_SECONDS, tags: ['blog'] },
  } as Record<string, unknown>;
}

export function getSanityImageUrl(source: SanityImageSource): string | null {
  if (!source?.asset) return null;
  if (!isSanityConfigured()) return null;
  const builder = createImageUrlBuilder(getClient());
  return builder.image(source).auto('format').width(1200).quality(75).url();
}

export type SanityImageSource = {
  asset?: { _ref?: string };
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
} | null;

export type BlogSeo = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  openGraphImage?: SanityImageSource;
  openGraphImageAlt?: string;
  openGraphImageUrl?: string | null;
  noIndex?: boolean;
};

export type SanityPostDoc = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string | null;
  featuredImage: SanityImageSource;
  featuredImageAlt: string | null;
  categories: Array<{ _id: string; title: string; slug: { current: string } } | null> | null;
  tags: Array<{ _id: string; title: string; slug: { current: string } } | null> | null;
  legacyHtml: string | null;
  contentSource: 'legacyHtml' | 'portableText';
  wordCount: number | null;
  body: PortableTextBlock[] | null;
  seo?: BlogSeo | null;
};

export type BlogPost = {
  id: string;
  date: string;
  slug: string;
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
  seo?: BlogSeo;
};

export type BlogCategory = { id: string; name: string; slug: string };
export type BlogTag = { id: string; name: string; slug: string };

const POST_FIELDS = `
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  featuredImage,
  "featuredImageAlt": featuredImage.alt,
  contentSource,
  legacyHtml,
  wordCount,
  body,
  seo,
  "categories": categories[]->{ _id, title, slug },
  "tags": tags[]->{ _id, title, slug }
`;

function mapPost(doc: SanityPostDoc): BlogPost {
  const source = doc.contentSource || (doc.legacyHtml ? 'legacyHtml' : 'portableText');
  let contentHtml = '';
  if (source === 'legacyHtml' && doc.legacyHtml) {
    contentHtml = doc.legacyHtml;
  }
  const portableText = portableTextToPlainText(doc.body);
  const plainLegacyText = stripHtmlAndDecode(contentHtml);
  const searchText = [doc.title, doc.excerpt || '', plainLegacyText || portableText]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return {
    id: doc._id,
    date: doc.publishedAt,
    slug: doc.slug.current,
    title: { rendered: doc.title },
    excerpt: { rendered: doc.excerpt || '' },
    content: { rendered: contentHtml },
    categories: doc.categories
      ?.flatMap((category) => category?.slug?.current ? [category.slug.current] : []) ?? [],
    tags: doc.tags
      ?.flatMap((tag) => tag?.slug?.current ? [tag.slug.current] : []) ?? [],
    featuredImageUrl: getSanityImageUrl(doc.featuredImage),
    featuredImageAlt: doc.featuredImageAlt ?? undefined,
    wordCount: typeof doc.wordCount === 'number' && doc.wordCount > 0 ? doc.wordCount : undefined,
    contentSource: source,
    portableBody: source === 'portableText' ? doc.body ?? [] : undefined,
    searchText,
    seo: doc.seo ? {
      ...doc.seo,
      openGraphImageUrl: getSanityImageUrl(doc.seo.openGraphImage ?? null),
    } : undefined,
  };
}

export const mapSanityPostForTest = mapPost;

function editionFilter(edition: SiteEdition): string {
  const referencesCollegeTag =
    `references(*[_type == "tag" && slug.current == "college"]._id)`;
  return edition === 'college' ? referencesCollegeTag : `!${referencesCollegeTag}`;
}

const SUMMARY_FIELDS = `
  _id, title, slug, publishedAt, excerpt, featuredImage, "featuredImageAlt": featuredImage.alt,
  "categories": categories[]->{ _id, title, slug }, "tags": tags[]->{ _id, title, slug }
`;
export async function fetchPostPage(options: { edition: SiteEdition; tagSlug?: string; category?: string; search?: string; page?: number; perPage?: number }) {
  const page = options.page ?? 1;
  const perPage = options.perPage ?? 12;
  const filters = [`_type == "post"`, `defined(slug.current)`, `coalesce(hideFromBlogLists, false) == false`, editionFilter(options.edition)];
  const params: Record<string, string | number> = { start: (page - 1) * perPage, end: page * perPage + 1 };
  if (options.tagSlug) { filters.push(`references(*[_type == "tag" && slug.current == $tagSlug]._id)`); params.tagSlug = options.tagSlug; }
  if (options.category) { filters.push(`references(*[_type == "category" && slug.current == $category]._id)`); params.category = options.category; }
  if (options.search) {
    filters.push(`(title match $search || excerpt match $search || pt::text(body) match $search || legacyHtml match $search)`);
    params.search = options.search;
  }
  const docs = await getClient().fetch<SanityPostDoc[]>(
    `*[${filters.join(' && ')}] | order(publishedAt desc, _id asc) [$start...$end] { ${SUMMARY_FIELDS} }`, params, fetchOptions(),
  );
  return { posts: docs.slice(0, perPage).map(mapPost), hasMore: docs.length > perPage };
}
export async function fetchAllPosts(options: { edition: SiteEdition; tagSlug?: string }): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  for (let page = 1; page <= 1000; page++) {
    const result = await fetchPostPage({ ...options, page, perPage: 100 });
    posts.push(...result.posts);
    if (!result.hasMore) return posts;
  }
  throw new Error('Blog pagination limit exceeded');
}

export async function fetchPostBySlug(
  slug: string,
  edition: SiteEdition,
): Promise<BlogPost | null> {
  const doc = await getClient().fetch<SanityPostDoc | null>(
    `*[_type == "post" && slug.current == $slug && ${editionFilter(edition)}][0] { ${POST_FIELDS} }`,
    { slug },
    fetchOptions(),
  );
  return doc ? mapPost(doc) : null;
}

export async function fetchCategories(): Promise<BlogCategory[]> {
  const docs = await getClient().fetch<Array<{ _id: string; title: string; slug: { current: string } }>>(
    `*[_type == "category"] | order(title asc) { _id, title, slug }`,
    {},
    fetchOptions(),
  );

  return docs.map(d => ({
    id: d.slug.current,
    name: d.title,
    slug: d.slug.current,
  }));
}

export async function fetchTags(): Promise<BlogTag[]> {
  const docs = await getClient().fetch<Array<{ _id: string; title: string; slug: { current: string } }>>(
    `*[_type == "tag"] | order(title asc) { _id, title, slug }`,
    {},
    fetchOptions(),
  );

  return docs.map(d => ({
    id: d.slug.current,
    name: d.title,
    slug: d.slug.current,
  }));
}

/** Public crawl inventory ignores visitor preview cookies and unpublished/no-index content. */
export async function fetchSitemapPosts(edition: SiteEdition): Promise<Array<{ slug: string; date: string }>> {
  const all: Array<{ slug: string; date: string }> = [];
  for (let start = 0; start < 100000; start += 500) {
    const posts = await getClient().fetch<Array<{ slug: string; date: string }>>(
      `*[_type == "post" && defined(slug.current) && coalesce(hideFromBlogLists, false) == false && coalesce(seo.noIndex, false) == false && !defined(seo.canonicalUrl) && ${editionFilter(edition)}] | order(_id asc) [$start...$end] { "slug": slug.current, "date": _updatedAt }`,
      { start, end: start + 500 }, fetchOptions(),
    );
    all.push(...posts);
    if (posts.length < 500) return all.filter((post, i) => all.findIndex(p => p.slug === post.slug) === i);
  }
  throw new Error('Sitemap pagination limit exceeded');
}
