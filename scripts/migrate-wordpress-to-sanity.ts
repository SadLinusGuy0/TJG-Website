/**
 * Migration script: WordPress.com → Sanity CMS
 *
 * Usage:
 *   npx tsx scripts/migrate-wordpress-to-sanity.ts
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID - Your Sanity project ID
 *   NEXT_PUBLIC_SANITY_DATASET    - Dataset name (default: "production")
 *   SANITY_API_TOKEN              - Write-capable API token
 *   WP_SOURCE_URL                 - WordPress site URL (default: "https://tjg8.wordpress.com")
 */

import { createClient } from '@sanity/client';

const WP_SOURCE = process.env.WP_SOURCE_URL || 'https://tjg8.wordpress.com';

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN!,
});

type WPPost = {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  tags: number[];
  featured_media: number;
  jetpack_featured_media_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text?: string;
      media_details?: {
        sizes?: {
          full?: { source_url: string };
          large?: { source_url: string };
        };
      };
    }>;
  };
};

type WPCategory = { id: number; name: string; slug: string };
type WPTag = { id: number; name: string; slug: string };

function getWpApiBase(): string {
  const hostname = new URL(WP_SOURCE).hostname;
  if (/\.wordpress\.com$/i.test(hostname)) {
    return `https://public-api.wordpress.com/wp/v2/sites/${hostname}`;
  }
  return `${WP_SOURCE}/wp-json/wp/v2`;
}

async function wpFetch<T>(path: string): Promise<T> {
  const url = `${getWpApiBase()}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WP API error: ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

async function fetchAllWpPosts(): Promise<WPPost[]> {
  const all: WPPost[] = [];
  let page = 1;
  while (true) {
    const batch = await wpFetch<WPPost[]>(
      `/posts?_embed=wp:featuredmedia&per_page=100&page=${page}&orderby=date&order=desc`
    );
    all.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return all;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(html: string): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function getFeaturedImageUrl(post: WPPost): string | null {
  if (post.jetpack_featured_media_url) return post.jetpack_featured_media_url;
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (media) {
    return media.media_details?.sizes?.large?.source_url
      || media.media_details?.sizes?.full?.source_url
      || media.source_url
      || null;
  }
  return null;
}

function getFeaturedImageAlt(post: WPPost): string {
  return post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '';
}

async function uploadImageFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';
    const asset = await sanity.assets.upload('image', buffer, { filename });
    return asset._id;
  } catch (err) {
    console.warn(`  Failed to upload image: ${url}`, err);
    return null;
  }
}

async function run() {
  console.log(`Migrating from: ${WP_SOURCE}`);
  console.log(`Target Sanity project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`);
  console.log('');

  // Fetch WordPress data
  console.log('Fetching WordPress categories...');
  const wpCategories = await wpFetch<WPCategory[]>('/categories?per_page=100');
  console.log(`  Found ${wpCategories.length} categories`);

  console.log('Fetching WordPress tags...');
  const wpTags = await wpFetch<WPTag[]>('/tags?per_page=100');
  console.log(`  Found ${wpTags.length} tags`);

  console.log('Fetching WordPress posts...');
  const wpPosts = await fetchAllWpPosts();
  console.log(`  Found ${wpPosts.length} posts`);
  console.log('');

  // Create categories in Sanity
  console.log('Creating categories in Sanity...');
  const catIdMap = new Map<number, string>(); // WP id -> Sanity _id
  for (const cat of wpCategories) {
    const doc = await sanity.createOrReplace({
      _id: `category-${cat.slug}`,
      _type: 'category',
      title: cat.name,
      slug: { _type: 'slug', current: cat.slug },
    });
    catIdMap.set(cat.id, doc._id);
    console.log(`  ✓ ${cat.name} (${cat.slug})`);
  }

  // Create tags in Sanity
  console.log('Creating tags in Sanity...');
  const tagIdMap = new Map<number, string>(); // WP id -> Sanity _id
  for (const tag of wpTags) {
    const doc = await sanity.createOrReplace({
      _id: `tag-${tag.slug}`,
      _type: 'tag',
      title: tag.name,
      slug: { _type: 'slug', current: tag.slug },
    });
    tagIdMap.set(tag.id, doc._id);
    console.log(`  ✓ ${tag.name} (${tag.slug})`);
  }

  // Create posts in Sanity
  console.log('');
  console.log('Migrating posts...');
  let successCount = 0;
  let errorCount = 0;

  for (const post of wpPosts) {
    try {
      process.stdout.write(`  [${successCount + errorCount + 1}/${wpPosts.length}] ${post.slug}...`);

      // Upload featured image
      let featuredImageAssetId: string | null = null;
      const imgUrl = getFeaturedImageUrl(post);
      if (imgUrl) {
        featuredImageAssetId = await uploadImageFromUrl(imgUrl);
      }

      const doc: Record<string, unknown> = {
        _id: `post-${post.slug}`,
        _type: 'post',
        title: stripHtml(post.title.rendered),
        slug: { _type: 'slug', current: post.slug },
        publishedAt: post.date,
        excerpt: stripHtml(post.excerpt.rendered),
        contentSource: 'legacyHtml',
        legacyHtml: post.content.rendered,
        wordCount: countWords(post.content.rendered),
        categories: post.categories
          .filter(id => catIdMap.has(id))
          .map(id => ({ _type: 'reference', _ref: catIdMap.get(id)!, _key: `cat-${id}` })),
        tags: post.tags
          .filter(id => tagIdMap.has(id))
          .map(id => ({ _type: 'reference', _ref: tagIdMap.get(id)!, _key: `tag-${id}` })),
      };

      if (featuredImageAssetId) {
        doc.featuredImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: featuredImageAssetId },
        };
        const alt = getFeaturedImageAlt(post);
        if (alt) {
          (doc.featuredImage as Record<string, unknown>).alt = alt;
        }
      }

      await sanity.createOrReplace(doc);
      successCount++;
      console.log(' ✓');
    } catch (err) {
      errorCount++;
      console.log(' ✗');
      console.error(`    Error: ${err}`);
    }
  }

  console.log('');
  console.log('Migration complete!');
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors:  ${errorCount}`);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
