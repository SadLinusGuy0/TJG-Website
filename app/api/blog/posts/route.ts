import { NextRequest, NextResponse } from 'next/server';
import { fetchBlogPage } from '../../../../lib/blog';
import { getBlogEnabled } from '../../../../lib/getBlogFlag';
export async function GET(request: NextRequest) {
  if (!await getBlogEnabled()) return NextResponse.json({ error: 'Blog unavailable' }, { status: 404 });
  const query = request.nextUrl.searchParams;
  const page = Number(query.get('page') || 1);
  const search = (query.get('q') || '').trim();
  const category = query.get('category') || undefined;
  if (!Number.isInteger(page) || page < 1 || page > 1000 || search.length > 200 || (category && !/^[a-z0-9-]{1,200}$/.test(category))) {
    return NextResponse.json({ error: 'Invalid search' }, { status: 400 });
  }
  try { return NextResponse.json(await fetchBlogPage({ page, search, category }), { headers: { 'Cache-Control': 'private, no-store' } }); }
  catch { console.error('Blog search unavailable'); return NextResponse.json({ error: 'Search is temporarily unavailable. Please retry.' }, { status: 503 }); }
}
