import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';
const MAX_BODY = 16 * 1024;
function validToken(actual: string | null, expected: string) {
  if (!actual) return false;
  const a = Buffer.from(actual), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
function slugValue(value: unknown): string | undefined {
  const slug = typeof value === 'string' ? value : value && typeof value === 'object' && 'current' in value ? value.current : undefined;
  return typeof slug === 'string' && slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) ? slug : undefined;
}
export async function POST(request: NextRequest) {
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const sanitySecret = process.env.SANITY_WEBHOOK_SECRET;
  const tokenSecret = process.env.REVALIDATE_SECRET;
  const signed = Boolean(signature && sanitySecret);
  if (!signed && (!tokenSecret || !validToken(request.headers.get('x-revalidate-token'), tokenSecret))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY) { await reader.cancel(); return NextResponse.json({ error: 'Payload too large' }, { status: 413 }); }
        chunks.push(value);
      }
    } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }); }
  }
  const body = Buffer.concat(chunks).toString('utf8');
  if (signed) {
    let valid = false;
    try { valid = await isValidSignature(body, signature!, sanitySecret!); } catch { /* Invalid signature format. */ }
    if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const data = payload as Record<string, unknown>;
  const event = data.event ?? 'update';
  const slug = slugValue(data.slug);
  const oldSlug = slugValue(data.oldSlug);
  if (!['create', 'update', 'delete'].includes(String(event)) || (!slug && !oldSlug) ||
      (data.slug != null && !slug) || (data.oldSlug != null && !oldSlug)) {
    return NextResponse.json({ error: 'Invalid event or slug' }, { status: 400 });
  }
  // CMS readers share this tag, so list, search, homepage and taxonomy caches expire together.
  revalidateTag('blog', { expire: 0 });
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  revalidatePath('/blog/[slug]/[section]', 'page');
  const slugs = [...new Set([slug, oldSlug].filter((s): s is string => Boolean(s)))];
  slugs.forEach(value => revalidatePath(`/blog/${value}`));
  return NextResponse.json({ revalidated: true, event, slugs });
}
