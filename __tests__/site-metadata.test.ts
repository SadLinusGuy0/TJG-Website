import { headers, cookies } from 'next/headers';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import { routeMetadata } from '../lib/routeMetadata';
import { fetchPublicSitemapPosts } from '../lib/blog';

jest.mock('next/headers', () => ({ headers: jest.fn(), cookies: jest.fn() }));
jest.mock('../lib/blog', () => ({ fetchPublicSitemapPosts: jest.fn() }));
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv, NODE_ENV: 'production' };
  delete process.env.VERCEL_ENV;
  (cookies as jest.Mock).mockResolvedValue({ get: () => ({ value: 'college' }) });
  (fetchPublicSitemapPosts as jest.Mock).mockClear().mockResolvedValue([{ slug: 'example', date: '2026-09-06' }]);
});
afterEach(() => { process.env = originalEnv; });

it.each([
  ['thatjoshguy.me', 'normal', 'https://thatjoshguy.me', true],
  ['college.thatjoshguy.me', 'college', 'https://college.thatjoshguy.me', true],
  ['beta.thatjoshguy.me', 'normal', 'https://thatjoshguy.me', false],
  ['college.beta.thatjoshguy.me', 'college', 'https://college.thatjoshguy.me', false],
  ['website-git-beta.vercel.app', 'normal', 'https://thatjoshguy.me', false],
] as const)('serves metadata and sitemap for host %s regardless of content override cookies', async (host, edition, canonical, indexable) => {
  (headers as jest.Mock).mockResolvedValue(new Headers({ host: 'localhost:3100', 'x-forwarded-host': host }));
  const metadata = await routeMetadata('/blog', 'Blog', 'Blog description');
  expect(metadata.alternates?.canonical).toBe(`${canonical}/blog`);
  expect(metadata.robots).toEqual(indexable ? undefined : { index: false, follow: true });
  const rules = await robots();
  const urls = await sitemap();
  if (indexable) {
    expect(rules.sitemap).toBe(`${canonical}/sitemap.xml`);
    expect(fetchPublicSitemapPosts).toHaveBeenCalledWith(edition);
    expect(urls.at(-1)?.url).toBe(`${canonical}/blog/example`);
  } else {
    expect(rules.rules).toEqual({ userAgent: '*', disallow: '/' });
    expect(urls).toEqual([]);
    expect(fetchPublicSitemapPosts).not.toHaveBeenCalled();
  }
});
