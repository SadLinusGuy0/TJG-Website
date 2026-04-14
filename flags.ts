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
 * In-post search bar feature flag - shows the search bar on every blog post.
 */
export const inPostSearchBarEnabled = flag({
  key: 'in-post-search-bar-enabled',
  adapter: vercelAdapter(),
  defaultValue: false,
  description: 'Show the in-post search bar on every blog post',
  options: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
});

/**
 * In-post search bar FMP flag - shows the search bar on the FMP post only.
 * Only used when in-post-search-bar-enabled is false.
 */
export const inPostSearchBarFmpEnabled = flag({
  key: 'in-post-search-bar-fmp-enabled',
  adapter: vercelAdapter(),
  defaultValue: true,
  description: 'Show the in-post search bar on the FMP post only',
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

/**
 * Corner Smoothing feature flag - enables the squircle corner smoothing toggle in Settings.
 * When enabled, users with a supported browser can opt in to squircle-shaped corners.
 */
export const cornerSmoothingEnabled = flag({
  key: 'corner-smoothing-enabled',
  adapter: vercelAdapter(),
  defaultValue: false,
  description: 'Enable corner smoothing (squircle) toggle in Settings',
  options: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
});

/**
 * Liquid Glass feature flag - enables the liquid glass refraction effect on the mobile nav bar.
 * When enabled, a toggle appears in Settings for users to opt in.
 */
export const liquidGlassEnabled = flag({
  key: 'liquid-glass-enabled',
  adapter: vercelAdapter(),
  defaultValue: false,
  description: 'Enable liquid glass effect on mobile navigation bar',
  options: [
    { value: true, label: 'Enabled' },
    { value: false, label: 'Disabled' },
  ],
});

/**
 * WordPress source URL flag - controls which WordPress site the blog loads from.
 * Configure per-environment in the Vercel Dashboard (e.g. college vs main site).
 */
export const wordpressSourceUrl = flag<string>({
  key: 'wordpress-source-url',
  adapter: vercelAdapter(),
  defaultValue: 'https://tjg8.wordpress.com',
  description: 'The WordPress site URL used as the blog data source',
  options: [
    { value: 'https://tjg8.wordpress.com', label: 'Main Site' },
    { value: 'https://joshskinnertjg.wordpress.com', label: 'College Site' },
  ],
});
