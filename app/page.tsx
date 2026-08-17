import { getFeaturedStories } from "../lib/featured-stories";
import { getProjects } from "../lib/projects";
import { getPopularStoriesEnabled } from "../lib/getPopularStoriesFlag";
import { getProjectsEnabled } from "../lib/getProjectsEnabledFlag";
import { getMiscSectionEnabled } from "../lib/getMiscSectionFlag";
import { getRecentBlogPostsEnabled } from "../lib/getRecentBlogPostsFlag";
import { getRecentBlogPosts } from "../lib/recent-blog-posts";
import { getHomeProfileFacts } from "../lib/home-profile";
import HomeClient from "./components/HomeClient";

// Ensure flags are evaluated per-request (needed for toolbar overrides)
export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    featuredStories,
    projects,
    popularStoriesEnabled,
    projectsEnabled,
    miscSectionEnabled,
    recentBlogPostsEnabled,
    profileFacts,
  ] = await Promise.all([
    getFeaturedStories(),
    getProjects(),
    getPopularStoriesEnabled(),
    getProjectsEnabled(),
    getMiscSectionEnabled(),
    getRecentBlogPostsEnabled(),
    getHomeProfileFacts(),
  ]);
  const recentBlogPosts = recentBlogPostsEnabled ? await getRecentBlogPosts(6) : [];
  return (
    <HomeClient
      featuredStories={featuredStories}
      projects={projects}
      popularStoriesEnabled={popularStoriesEnabled}
      projectsEnabled={projectsEnabled}
      miscSectionEnabled={miscSectionEnabled}
      recentBlogPostsEnabled={recentBlogPostsEnabled}
      recentBlogPosts={recentBlogPosts}
      profileFacts={profileFacts}
    />
  );
}
