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
