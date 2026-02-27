import { getFeaturedStories } from "../lib/featured-stories";
import { getPopularStoriesEnabled } from "../lib/getPopularStoriesFlag";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const [featuredStories, popularStoriesEnabled] = await Promise.all([
    getFeaturedStories(),
    getPopularStoriesEnabled(),
  ]);
  return (
    <HomeClient
      featuredStories={featuredStories}
      popularStoriesEnabled={popularStoriesEnabled}
    />
  );
}
