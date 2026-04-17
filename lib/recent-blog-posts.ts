import { getWordpressSourceUrl } from './getWordpressSourceUrlFlag';
import { getYearSliderEnabled } from './getYearSliderFlag';
import { fetchPosts, fetchTags, getFeaturedImageUrlAsync, type WPPost } from './wordpress';

export type RecentBlogPost = {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  date: string;
};

/** Mirrors `BlogIndexContent` year pools: Year 2 posts only when the Year Slider flag is on. */
async function resolveRecentPosts(apiBaseUrl: string, limit: number, yearSliderEnabled: boolean): Promise<WPPost[]> {
  let tags: Awaited<ReturnType<typeof fetchTags>> = [];
  try {
    tags = await fetchTags(apiBaseUrl);
  } catch {
    tags = [];
  }

  const year1Tag = tags.find((t) => t.slug === 'year-1' || t.name.toLowerCase() === 'year 1');
  const year2Tag = tags.find((t) => t.slug === 'year-2' || t.name.toLowerCase() === 'year 2');

  if (!year1Tag && !year2Tag) {
    return fetchPosts({ perPage: limit, apiBaseUrl });
  }

  if (year1Tag && (!year2Tag || !yearSliderEnabled)) {
    return fetchPosts({ perPage: limit, tagId: year1Tag.id, apiBaseUrl });
  }

  if (year1Tag && year2Tag && yearSliderEnabled) {
    const [batch1, batch2] = await Promise.all([
      fetchPosts({ perPage: limit, tagId: year1Tag.id, apiBaseUrl }),
      fetchPosts({ perPage: limit, tagId: year2Tag.id, apiBaseUrl }),
    ]);
    const byId = new Map<number, WPPost>();
    for (const p of [...batch1, ...batch2]) {
      if (!byId.has(p.id)) byId.set(p.id, p);
    }
    return Array.from(byId.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  if (year2Tag && !year1Tag && yearSliderEnabled) {
    return fetchPosts({ perPage: limit, tagId: year2Tag.id, apiBaseUrl });
  }

  if (year2Tag && !year1Tag && !yearSliderEnabled) {
    return [];
  }

  return fetchPosts({ perPage: limit, apiBaseUrl });
}

export async function getRecentBlogPosts(limit = 6): Promise<RecentBlogPost[]> {
  try {
    const [apiBaseUrl, yearSliderEnabled] = await Promise.all([
      getWordpressSourceUrl(),
      getYearSliderEnabled(),
    ]);
    const posts = await resolveRecentPosts(apiBaseUrl, limit, yearSliderEnabled);
    const results: RecentBlogPost[] = [];

    for (const post of posts) {
      const thumbnail = await getFeaturedImageUrlAsync(post, apiBaseUrl);
      results.push({
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        thumbnail,
        date: post.date,
      });
    }

    return results;
  } catch {
    return [];
  }
}
