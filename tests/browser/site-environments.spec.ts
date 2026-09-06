import { test, expect } from '@playwright/test';

const sites = [
  { host: 'thatjoshguy.me', edition: 'normal', environment: 'production', canonical: 'https://thatjoshguy.me', indexable: true },
  { host: 'college.thatjoshguy.me', edition: 'college', environment: 'production', canonical: 'https://college.thatjoshguy.me', indexable: true },
  { host: 'beta.thatjoshguy.me', edition: 'normal', environment: 'preview', canonical: 'https://thatjoshguy.me', indexable: false },
  { host: 'college.beta.thatjoshguy.me', edition: 'college', environment: 'preview', canonical: 'https://college.thatjoshguy.me', indexable: false },
];

for (const site of sites) {
  test(`${site.host} serves the correct identity, metadata and content`, async ({ page, request }) => {
    const headers = { 'x-forwarded-host': site.host };
    await page.setExtraHTTPHeaders(headers);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-site-edition', site.edition);
    await expect(page.locator('html')).toHaveAttribute('data-site-environment', site.environment);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', site.canonical);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', site.indexable ? '/favicon.ico' : '/favicon-preview.ico');
    if (!site.indexable) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('.hero-environment-chip')).toHaveText('Beta');
    } else {
      await expect(page.locator('.hero-environment-chip')).toHaveCount(0);
      expect(await page.locator('meta[name="robots"]').count()).toBe(0);
    }
    const robots = await (await request.get('/robots.txt', { headers })).text();
    const sitemap = await (await request.get('/sitemap.xml', { headers })).text();
    if (site.indexable) {
      expect(robots).toContain(`Sitemap: ${site.canonical}/sitemap.xml`);
      expect(sitemap).toContain(`<loc>${site.canonical}/blog</loc>`);
    } else {
      expect(robots).toContain('Disallow: /');
      expect(sitemap).not.toContain('<loc>');
    }
    // Local build uses public published CMS content when configured, as CI can too.
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      const visible = site.edition === 'college' ? 'getaway-driver-final-major-project' : 'oneui-design-kit';
      const hidden = site.edition === 'college' ? 'oneui-design-kit' : 'getaway-driver-final-major-project';
      await page.goto(`/blog/${visible}`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site.canonical}/blog/${visible}`);
      // Next.js can stream the loading shell with HTTP 200 before notFound().
      // Assert the final rendered rejection and noindex, not a pre-stream status.
      await page.goto(`/blog/${hidden}`);
      await expect(page.getByRole('heading', { name: 'Error 404' })).toBeVisible();
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
    }
    await page.goto('/blog');
    await expect(page.locator('html')).toHaveAttribute('data-site-edition', site.edition);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site.canonical}/blog`);
    // App navigation remains relative; it must not send testers to production.
    expect(await page.locator('a[href="/settings"]').count()).toBeGreaterThan(0);
  });
}
