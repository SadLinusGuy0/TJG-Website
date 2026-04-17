import { getFeaturedStories } from "../lib/featured-stories";
import { getPopularStoriesEnabled } from "../lib/getPopularStoriesFlag";
import { getMergedWorkCarouselEnabled } from "../lib/getMergedWorkCarouselFlag";
import { getMiscSectionEnabled } from "../lib/getMiscSectionFlag";
import { getRecentBlogPostsEnabled } from "../lib/getRecentBlogPostsFlag";
import { getRecentBlogPosts } from "../lib/recent-blog-posts";
import HomeClient from "./components/HomeClient";

// Ensure flags are evaluated per-request (needed for toolbar overrides)
export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    featuredStories,
    popularStoriesEnabled,
    mergedWorkCarouselEnabled,
    miscSectionEnabled,
    recentBlogPostsEnabled,
  ] = await Promise.all([
    getFeaturedStories(),
    getPopularStoriesEnabled(),
    getMergedWorkCarouselEnabled(),
    getMiscSectionEnabled(),
    getRecentBlogPostsEnabled(),
  ]);
  const recentBlogPosts = recentBlogPostsEnabled ? await getRecentBlogPosts(6) : [];
  return (
    <HomeClient
      featuredStories={featuredStories}
      popularStoriesEnabled={popularStoriesEnabled}
      mergedWorkCarouselEnabled={mergedWorkCarouselEnabled}
      miscSectionEnabled={miscSectionEnabled}
      recentBlogPostsEnabled={recentBlogPostsEnabled}
      recentBlogPosts={recentBlogPosts}
    />
  );
}
