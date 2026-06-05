import { getYearSliderEnabled } from './getYearSliderFlag';
import { fetchAllBlogPosts, fetchBlogTags, type BlogPost, type BlogTag } from './blog';

export type RecentBlogPost = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  date: string;
};

async function resolveRecentPosts(limit: number, yearSliderEnabled: boolean): Promise<BlogPost[]> {
  let tags: BlogTag[] = [];
  try {
    tags = await fetchBlogTags();
  } catch {
    tags = [];
  }

  const year1Tag = tags.find((t) => t.slug === 'year-1' || t.name.toLowerCase() === 'year 1');
  const year2Tag = tags.find((t) => t.slug === 'year-2' || t.name.toLowerCase() === 'year 2');

  if (!year1Tag && !year2Tag) {
    const posts = await fetchAllBlogPosts();
    return posts.slice(0, limit);
  }

  if (year1Tag && (!year2Tag || !yearSliderEnabled)) {
    const posts = await fetchAllBlogPosts({ tagSlug: 'year-1' });
    return posts.slice(0, limit);
  }

  if (year1Tag && year2Tag && yearSliderEnabled) {
    const [batch1, batch2] = await Promise.all([
      fetchAllBlogPosts({ tagSlug: 'year-1' }),
      fetchAllBlogPosts({ tagSlug: 'year-2' }),
    ]);
    const byId = new Map<string, BlogPost>();
    for (const p of [...batch1, ...batch2]) {
      if (!byId.has(p.id)) byId.set(p.id, p);
    }
    return Array.from(byId.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  if (year2Tag && !year1Tag && yearSliderEnabled) {
    const posts = await fetchAllBlogPosts({ tagSlug: 'year-2' });
    return posts.slice(0, limit);
  }

  if (year2Tag && !year1Tag && !yearSliderEnabled) {
    return [];
  }

  const posts = await fetchAllBlogPosts();
  return posts.slice(0, limit);
}

export async function getRecentBlogPosts(limit = 6): Promise<RecentBlogPost[]> {
  try {
    const yearSliderEnabled = await getYearSliderEnabled();
    const posts = await resolveRecentPosts(limit, yearSliderEnabled);

    return posts.map(post => ({
      id: post.id,
      title: post.title.rendered,
      slug: post.slug,
      thumbnail: post.featuredImageUrl,
      date: post.date,
    }));
  } catch {
    return [];
  }
}
