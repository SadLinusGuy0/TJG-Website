import { canonicalContentHref } from '../lib/contentUrls';

it.each([
  ['https://thatjoshguy.me/blog/oneui-design-kit', 'https://tjg.gg/blog/oneui-design-kit'],
  ['http://WWW.THATJOSHGUY.ME/blog/a%20b?q=a%2Fb#heading', 'https://tjg.gg/blog/a%20b?q=a%2Fb#heading'],
  ['https://college.thatjoshguy.me/blog/project', 'https://college.tjg.gg/blog/project'],
  ['https://beta.thatjoshguy.me/blog/post', 'https://tjg.gg/blog/post'],
  ['https://college.beta.thatjoshguy.me/blog/post', 'https://college.tjg.gg/blog/post'],
  ['https://sammyguru.com/article', 'https://sammyguru.com/article'],
  ['https://thatjoshguy.me.example.com/post', 'https://thatjoshguy.me.example.com/post'],
  ['/blog/post', '/blog/post'],
  ['javascript:alert(1)', ''],
])('normalizes the canonical %s without changing unrelated URLs', (input, expected) => {
  expect(canonicalContentHref(input)).toBe(expected);
});
