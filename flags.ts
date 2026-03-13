import { flag } from 'flags/next';
import { vercelAdapter } from '@flags-sdk/vercel';

/**
 * Blog feature flag - controls visibility of the blog in navigation and access to blog pages.
 * Configure per-environment (Development, Preview, Production) in the Vercel Dashboard.
 */
export const blogEnabled = flag({
  key: 'blog-enabled',
  adapter: vercelAdapter(),
  defaultValue: true,
  description: 'Show the blog in navigation and allow access to blog pages',
  options: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
});

/**
 * Popular Stories feature flag - controls visibility of the Popular Stories section on the home page.
 */
export const popularStoriesEnabled = flag({
  key: 'popular-stories-enabled',
  adapter: vercelAdapter(),
  defaultValue: true,
  description: 'Show the Popular Stories section on the home page',
  options: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
});

/**
 * Year Slider feature flag - controls the Year 1/Year 2 toggle on the blog page.
 * When disabled, only Year 1 posts are shown without the toggle.
 */
export const yearSliderEnabled = flag({
  key: 'year-slider-enabled',
  adapter: vercelAdapter(),
  defaultValue: true,
  description: 'Show the Year 1/Year 2 slider toggle on the blog page',
  options: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
});
