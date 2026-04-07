/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.wordpress.com' },
      { protocol: 'https', hostname: '*.wp.com' },
      { protocol: 'https', hostname: '*.gravatar.com' },
      { protocol: 'https', hostname: 'joshskinnertjg.wordpress.com' },
      { protocol: 'https', hostname: 'static.gumroad.com' },
      { protocol: 'https', hostname: 'public-files.gumroad.com' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://*.wordpress.com https://*.wp.com https://*.gravatar.com https://joshskinnertjg.wordpress.com https://static.gumroad.com https://public-files.gumroad.com",
            "font-src 'self'",
            "connect-src 'self' https://*.wordpress.com https://*.wp.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
            "frame-src 'self' https://embed.figma.com https://www.figma.com https://forms.office.com https://docs.google.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
            "media-src 'self' https://*.wordpress.com https://*.wp.com",
          ].join('; '),
        },
      ],
    },
  ],
};

nextConfig.allowedDevOrigins = ['192.168.1.110'];

module.exports = nextConfig;