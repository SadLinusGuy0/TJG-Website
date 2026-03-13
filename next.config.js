/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // WordPress.com hosted sites
      { protocol: 'https', hostname: '*.wordpress.com' },
      // WordPress.com image CDN (i0.wp.com, i1.wp.com, i2.wp.com, etc.)
      { protocol: 'https', hostname: '*.wp.com' },
      // Gravatar (author avatars)
      { protocol: 'https', hostname: '*.gravatar.com' },
      // Self-hosted WordPress sites using the WP_API_URL env var
      // Wildcard covers any hostname so custom installs work without config changes
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
