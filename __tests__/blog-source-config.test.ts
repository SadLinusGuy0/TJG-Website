import { getBlogContentSource, getWordpressSourceUrl } from '../lib/blogSourceConfig';

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({ get: () => ({ value: 'wordpress' }) })),
}));
jest.mock('../flags', () => ({
  blogContentSource: jest.fn(async () => 'wordpress'),
  wordpressSourceUrl: jest.fn(async () => 'https://joshskinnertjg.wordpress.com'),
}));

const originalEnv = { ...process.env };
beforeEach(() => {
  process.env = { ...originalEnv };
  delete process.env.BLOG_CONTENT_SOURCE;
  delete process.env.WORDPRESS_SOURCE_URL;
});
afterEach(() => { process.env = { ...originalEnv }; });

it('ignores retired CMS flags and cookies even without a configured Sanity project', async () => {
  process.env.FLAGS = 'configured';
  delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  await expect(getBlogContentSource()).resolves.toBe('sanity');
  await expect(getWordpressSourceUrl()).resolves.toBe('https://tjg8.wordpress.com');
});

it('preserves an explicitly configured WordPress fallback', async () => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'project';
  process.env.BLOG_CONTENT_SOURCE = 'wordpress';
  process.env.WORDPRESS_SOURCE_URL = 'https://joshskinnertjg.wordpress.com';
  await expect(getBlogContentSource()).resolves.toBe('wordpress');
  await expect(getWordpressSourceUrl()).resolves.toBe('https://joshskinnertjg.wordpress.com');
});

it('defaults an unknown source to Sanity and rejects an untrusted fallback destination', async () => {
  process.env.BLOG_CONTENT_SOURCE = 'unknown';
  process.env.WORDPRESS_SOURCE_URL = 'https://untrusted.example';
  await expect(getBlogContentSource()).resolves.toBe('sanity');
  await expect(getWordpressSourceUrl()).rejects.toThrow('Untrusted WordPress origin');
});
