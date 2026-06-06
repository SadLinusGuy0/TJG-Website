const path = require('path');

function getOptionalFlagsDefinitionsAlias() {
  try {
    require.resolve('@vercel/flags-definitions');
    return null;
  } catch {
    return path.join(__dirname, 'lib/vercelFlagsDefinitionsStub.mjs');
  }
}

const flagsDefinitionsAlias = getOptionalFlagsDefinitionsAlias();
const turbopackFlagsDefinitionsAlias = flagsDefinitionsAlias
  ? './lib/vercelFlagsDefinitionsStub.mjs'
  : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [{ source: '/work', destination: '/', permanent: true }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.wordpress.com' },
      { protocol: 'https', hostname: '*.wp.com' },
      { protocol: 'https', hostname: '*.gravatar.com' },
      { protocol: 'https', hostname: 'joshskinnertjg.wordpress.com' },
      { protocol: 'https', hostname: 'static.gumroad.com' },
      { protocol: 'https', hostname: 'public-files.gumroad.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'sammyguru.com' },
      { protocol: 'https', hostname: 'www.sammobile.com' },
      { protocol: 'https', hostname: 'm-cdn.phonearena.com' },
      { protocol: 'https', hostname: 'www.androidheadlines.com' },
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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self'",
            "connect-src 'self' https://*.wordpress.com https://*.wp.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://sketchfab.com https://*.sketchfab.com https://*.sanity.io https://*.apicdn.sanity.io",
            "frame-src 'self' https://embed.figma.com https://www.figma.com https://forms.office.com https://docs.google.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com https://sketchfab.com https://*.sketchfab.com",
            "media-src 'self' https://*.wordpress.com https://*.wp.com https://cdn.sanity.io",
          ].join('; '),
        },
      ],
    },
  ],
  ...(turbopackFlagsDefinitionsAlias
    ? {
        turbopack: {
          resolveAlias: {
            '@vercel/flags-definitions': turbopackFlagsDefinitionsAlias,
          },
        },
      }
    : {}),
  webpack(config) {
    if (flagsDefinitionsAlias) {
      config.resolve.alias['@vercel/flags-definitions'] = flagsDefinitionsAlias;
    }
    return config;
  },
};

nextConfig.allowedDevOrigins = ['192.168.1.110'];

module.exports = nextConfig;
