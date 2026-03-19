/**
 * Feature flags configuration
 * Set these values to enable/disable features across the application
 */

export const featureFlags = {
  /**
   * Enable or disable the blog page
   * Set to true to show the blog navigation item and allow access to blog pages
   */
  blogEnabled: true,
  /**
   * Enable or disable the Popular Stories section on the home page
   */
  popularStoriesEnabled: true,
  /**
   * Show the in-post search bar on every blog post
   */
  inPostSearchBarEnabled: false,
  /**
   * Show the in-post search bar on the FMP post only (ignored when inPostSearchBarEnabled is true)
   */
  inPostSearchBarFmpEnabled: true,
} as const;

