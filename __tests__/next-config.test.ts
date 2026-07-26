const nextConfig = require('../next.config.js');

describe('Next.js redirects', () => {
  it('preserves the removed work routes', async () => {
    await expect(nextConfig.redirects()).resolves.toEqual(
      expect.arrayContaining([
        {
          source: '/work',
          destination: '/#design-work',
          permanent: true,
        },
        {
          source: '/work/oneui-design-kit',
          destination: '/blog/oneui-design-kit',
          permanent: true,
        },
      ]),
    );
  });
});
