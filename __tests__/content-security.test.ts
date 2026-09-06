import { sanitizeBlogHtml } from '../lib/sanitizeBlogHtml';
import { sanitizeBlogButtonHref } from '../lib/sanitizeBlogButtonHref';
import { trustedWordpressOrigin } from '../lib/wordpressOrigins';
import { getWordpressSourceUrl } from '../lib/blogSourceConfig';
import { processContentWithEmbeds } from '../lib/blogContentProcessing';

jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'http://127.0.0.1:3101' }) }) }));

it.each(['http://127.0.0.1', 'https://evil.example', 'https://tjg8.wordpress.com@evil.example', 'https://tjg8.wordpress.com/?url=evil', 'https://tjg8.wordpress.com/#evil'])('rejects an untrusted source %s', value => {
  expect(() => trustedWordpressOrigin(value)).toThrow();
});
it('ignores visitor cookies for destination selection', async () => {
  delete process.env.FLAGS; delete process.env.WORDPRESS_SOURCE_URL;
  await expect(getWordpressSourceUrl()).resolves.toBe('https://tjg8.wordpress.com');
});
it('removes active HTML while preserving supported lazy media', () => {
  const html = sanitizeBlogHtml('<script>alert(1)</script><img src="https://example.com/a.png" onerror="alert(1)"><iframe src="https://evil.example" srcdoc="evil"></iframe><iframe src="https://www.youtube.com/embed/test"></iframe><a href="jav&#x61;script:alert(1)">bad</a>');
  expect(html).not.toMatch(/<script|onerror|srcdoc|evil\.example|javascript:/i);
  expect(html).toContain('loading="lazy"'); expect(html).toContain('title="www.youtube.com embedded content');
});
it.each(['javascript:alert(1)', '<a href="javascript:alert(1)">x</a>', 'data:text/html,evil', '//evil.example'])('rejects unsafe custom href %s', value => {
  expect(sanitizeBlogButtonHref(value)).toBe('');
});
it('keeps safe custom embeds and buttons after normalization', () => {
  const html = processContentWithEmbeds('<p>story-mindmap</p><p>(Open)[https://example.com]</p>');
  expect(html).toContain('embed.figma.com'); expect(html).toContain('{{BUTTON:Open|https://example.com}}');
});
