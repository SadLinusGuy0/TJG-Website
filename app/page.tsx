import { routeMetadata } from '../lib/routeMetadata';
import './styles/home.css';
import { getFeaturedStories } from "../lib/featured-stories";
import { getProjects } from "../lib/projects";
import { getPopularStoriesEnabled } from "../lib/getPopularStoriesFlag";
import { getProjectsEnabled } from "../lib/getProjectsEnabledFlag";
import { getMiscSectionEnabled } from "../lib/getMiscSectionFlag";
import { getRecentBlogPostsEnabled } from "../lib/getRecentBlogPostsFlag";
import { getRecentBlogPosts } from "../lib/recent-blog-posts";
import { getHomeProfileFacts } from "../lib/home-profile";
import { getSiteEdition } from "../lib/siteEdition";
import HomeClient from "./components/HomeClient";

// Ensure flags are evaluated per-request (needed for toolbar overrides)
export const dynamic = "force-dynamic";

export default async function Home() {
  const [popularStoriesEnabled, projectsEnabled, miscSectionEnabled, recentBlogPostsEnabled, siteEdition] = await Promise.all([
    getPopularStoriesEnabled(), getProjectsEnabled(), getMiscSectionEnabled(), getRecentBlogPostsEnabled(), getSiteEdition(),
  ]);
  const [featuredStories, projects, recentBlogPosts, profileFacts] = await Promise.all([
    popularStoriesEnabled ? getFeaturedStories() : Promise.resolve([]),
    projectsEnabled ? getProjects() : Promise.resolve([]),
    recentBlogPostsEnabled ? getRecentBlogPosts(6) : Promise.resolve([]),
    getHomeProfileFacts(),
  ]);
  const environmentLabel = process.env.NODE_ENV === "development"
    ? "Dev"
    : siteEdition === "beta" || process.env.VERCEL_ENV === "preview"
      ? "Beta"
      : null;
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
      environmentLabel={environmentLabel}
    />
  );
}

export async function generateMetadata() {
  const college = await getSiteEdition() === 'college';
  return routeMetadata('/', college ? 'College Portfolio' : 'That Josh Guy', college ? 'Josh Skinner’s college portfolio and development journals.' : 'Designer, tech journalist and Samsung/Android creator. Explore my articles and design projects.');
}
