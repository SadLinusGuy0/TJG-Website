export interface FeaturedStory {
  title: string;
  thumbnail: string;
  site: string;
  url: string;
}

const FEATURED_STORIES: FeaturedStory[] = [
  {
    title: "Here's the first glimpse of a One UI 9.0 Galaxy AI feature!",
    thumbnail: "https://www.sammobile.com/wp-content/uploads/2026/01/Now-Brief-Galaxy-AI-1200x675.jpg",
    site: "SamMobile",
    url: "https://www.sammobile.com/news/samsung-one-ui-9-galaxy-ai-now-nudge/",
  },
  {
    title: "Breaking – Samsung Removes Bootloader Unlocking with One UI 8",
    thumbnail: "https://sammyguru.com/wp-content/uploads/2025/07/Galaxy-Z-Fold-7-SammyGuru-38-main-display.jpg",
    site: "SammyGuru",
    url: "https://sammyguru.com/breaking-samsung-removes-bootloader-unlocking-with-one-ui-8/",
  },
  {
    title: "Here's How the Galaxy S26 Ultra's Privacy Display Will Work",
    thumbnail: "https://sammyguru.com/wp-content/uploads/2026/01/Privacy-Display-thumbnail.png",
    site: "SammyGuru",
    url: "https://sammyguru.com/galaxy-s26-ultra-privacy-display-animation/",
  },
  {
    title: "Samsung's rumored Perplexity-powered Bixby leaks in new video",
    thumbnail: "https://m-cdn.phonearena.com/images/article/176996-wide-two_1200/Samsungs-rumored-Perplexity-powered-Bixby-leaks-in-new-video.webp?1767393754",
    site: "PhoneArena",
    url: "https://example.com/story-2",
  },
];

export function getFeaturedStories(): FeaturedStory[] {
  return FEATURED_STORIES;
}
