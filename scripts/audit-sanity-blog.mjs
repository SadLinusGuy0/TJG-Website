import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

if (!projectId) {
  console.error('NEXT_PUBLIC_SANITY_PROJECT_ID is required.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  perspective: 'published',
  useCdn: false,
  token: process.env.SANITY_READ_TOKEN,
});

const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  contentSource,
  legacyHtml,
  body,
  featuredImage,
  "featuredImageAlt": featuredImage.alt,
  "categories": categories[]->{ "slug": slug.current, title },
  "tags": tags[]->{ "slug": slug.current, title }
}`);

const issues = [];
const warnings = [];
const slugMap = new Map();

for (const post of posts) {
  const label = `${post.title || '(untitled)'} (${post.slug || post._id})`;

  if (!post.slug) {
    issues.push(`[slug] Missing slug: ${label}`);
  } else {
    const existing = slugMap.get(post.slug) || [];
    existing.push(label);
    slugMap.set(post.slug, existing);
  }

  if (!post.featuredImage?.asset?._ref) {
    warnings.push(`[image] No featured image; the site fallback will be used: ${label}`);
  } else if (!post.featuredImageAlt) {
    issues.push(`[image] Missing featured image alt text: ${label}`);
  }

  if (!post.categories?.length) {
    issues.push(`[taxonomy] Missing categories: ${label}`);
  }

  const source = post.contentSource || (post.legacyHtml ? 'legacyHtml' : 'portableText');
  const hasLegacyHtml = Boolean(post.legacyHtml?.trim());
  const hasPortableBody = Array.isArray(post.body) && post.body.length > 0;
  if (source === 'legacyHtml' && !hasLegacyHtml) {
    issues.push(`[body] Legacy HTML source has no legacyHtml: ${label}`);
  }
  if (source === 'portableText' && !hasPortableBody) {
    issues.push(`[body] Portable Text source has no body: ${label}`);
  }
  if (!hasLegacyHtml && !hasPortableBody) {
    issues.push(`[body] No renderable body: ${label}`);
  }

  const content = [post.legacyHtml, JSON.stringify(post.body || [])].join('\n');
  const suspiciousLinks = content.match(/\b(?:src|href)\s*:\s*sanity\b/gi) || [];
  if (suspiciousLinks.length > 0) {
    issues.push(`[links] Suspicious src/href sanity artifact: ${label}`);
  }
}

for (const [slug, labels] of slugMap.entries()) {
  if (labels.length > 1) {
    issues.push(`[slug] Duplicate slug "${slug}": ${labels.join(' | ')}`);
  }
}

console.log(`Audited ${posts.length} Sanity blog posts.`);

if (warnings.length > 0) {
  console.log(`Found ${warnings.length} warning(s):`);
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (issues.length === 0) {
  console.log('No migration issues found.');
  process.exit(0);
}

console.log(`Found ${issues.length} issue(s):`);
for (const issue of issues) {
  console.log(`- ${issue}`);
}

process.exitCode = 1;
