import { fetchBlogPage } from './blog';
import { stripHtmlAndDecode } from './portableText';
export type RecentBlogPost = { id: string; title: string; slug: string; thumbnail: string | null; date: string };
export async function getRecentBlogPosts(limit = 6): Promise<RecentBlogPost[]> {
  try {
    const { posts } = await fetchBlogPage({ perPage: Math.min(6, Math.max(1, limit)) });
    return posts.map(p => ({ id: p.id, title: stripHtmlAndDecode(p.title.rendered), slug: p.slug, thumbnail: p.featuredImageUrl, date: p.date }));
  } catch {
    console.error('Recent blog posts unavailable');
    return [];
  }
}
