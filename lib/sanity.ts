import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { sanityConfig } from './sanity.config';

const REVALIDATE_SECONDS = 60;

let _client: SanityClient | null = null;

function getClient(): SanityClient {
  if (!_client) {
    if (!sanityConfig.projectId) {
      throw new Error(
        'Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID to use Sanity as the blog content source.',
      );
    }
    _client = createClient({
      ...sanityConfig,
      token: process.env.SANITY_API_TOKEN,
    });
  }
  return _client;
}

function fetchOptions() {
  return {
    next: { revalidate: REVALIDATE_SECONDS },
  } as Record<string, unknown>;
}

function imageUrl(source: SanityImageSource): string | null {
  if (!source?.asset) return null;
  const builder = imageUrlBuilder(getClient());
  return builder.image(source).auto('format').url();
}

type SanityImageSource = {
  asset?: { _ref?: string };
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
} | null;

type SanityPostDoc = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string | null;
  featuredImage: SanityImageSource;
  featuredImageAlt: string | null;
  categories: Array<{ _id: string; title: string; slug: { current: string } }> | null;
  tags: Array<{ _id: string; title: string; slug: { current: string } }> | null;
  legacyHtml: string | null;
  contentSource: 'legacyHtml' | 'portableText';
  wordCount: number | null;
  body: unknown[] | null;
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
  featuredImageAlt,
  contentSource,
  legacyHtml,
  wordCount,
  "categories": categories[]->{ _id, title, slug },
  "tags": tags[]->{ _id, title, slug }
`;

function mapPost(doc: SanityPostDoc): BlogPost {
  let contentHtml = '';
  if (doc.contentSource === 'legacyHtml' && doc.legacyHtml) {
    contentHtml = doc.legacyHtml;
  }

  return {
    id: doc._id,
    date: doc.publishedAt,
    slug: doc.slug.current,
    title: { rendered: doc.title },
    excerpt: { rendered: doc.excerpt || '' },
    content: { rendered: contentHtml },
    categories: doc.categories?.map(c => c.slug.current) ?? [],
    tags: doc.tags?.map(t => t.slug.current) ?? [],
    featuredImageUrl: imageUrl(doc.featuredImage),
    featuredImageAlt: doc.featuredImageAlt ?? undefined,
    wordCount: doc.wordCount ?? undefined,
  };
}

export async function fetchAllPosts(options?: { tagSlug?: string }): Promise<BlogPost[]> {
  const filter = options?.tagSlug
    ? `*[_type == "post" && references(*[_type == "tag" && slug.current == $tagSlug]._id)]`
    : `*[_type == "post"]`;

  const docs = await getClient().fetch<SanityPostDoc[]>(
    `${filter} | order(publishedAt desc) { ${POST_FIELDS} }`,
    options?.tagSlug ? { tagSlug: options.tagSlug } : {},
    fetchOptions(),
  );

  return docs.map(mapPost);
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const doc = await getClient().fetch<SanityPostDoc | null>(
    `*[_type == "post" && slug.current == $slug][0] { ${POST_FIELDS} }`,
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
    id: d._id,
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
    id: d._id,
    name: d.title,
    slug: d.slug.current,
  }));
}
