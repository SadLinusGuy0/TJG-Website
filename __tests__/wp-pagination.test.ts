import { collectWordpressPages } from '../lib/wpPagination';
import { fetchCategories, fetchPostBySlug, fetchTags, fetchAllPosts } from '../lib/wordpress';
afterEach(() => jest.restoreAllMocks());
it.each([0, 99, 100, 101, 200])('collects %i items without requesting a nonexistent page', async count => {
  const all = Array.from({ length: count }, (_, i) => i);
  const read = jest.fn(async (page: number) => {
    if (page > Math.max(1, Math.ceil(count / 100))) throw new Error('Invalid page');
    return { items: all.slice((page - 1) * 100, page * 100), totalPages: Math.ceil(count / 100) };
  });
  expect(await collectWordpressPages(read)).toEqual(all);
  expect(read).toHaveBeenCalledTimes(Math.max(1, Math.ceil(count / 100)));
});
it('rejects unbounded or malformed pagination', async () => {
  await expect(collectWordpressPages(async () => ({ items: [], totalPages: 1001 }))).rejects.toThrow();
});
it('loads every taxonomy page and keeps tags on single-post responses', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async input => {
    const url = new URL(String(input));
    const page = Number(url.searchParams.get('page') || 1);
    const fields = url.searchParams.get('_fields')!.split(',');
    if (url.pathname.endsWith('/posts')) {
      const fixture = { id: 1, tags: [150], categories: [120], title: { rendered: 'Title' } };
      return Response.json([Object.fromEntries(Object.entries(fixture).filter(([key]) => fields.includes(key)))], { headers: { 'x-wp-totalpages': '1' } });
    }
    const all = Array.from({ length: 150 }, (_, i) => ({ id: i + 1, slug: `term-${i + 1}`, name: `Term ${i + 1}` }));
    return Response.json(all.slice((page - 1) * 100, page * 100), { headers: { 'x-wp-totalpages': '2' } });
  });
  expect(await fetchCategories()).toHaveLength(150);
  expect(await fetchTags()).toHaveLength(150);
  expect((await fetchPostBySlug('title'))?.tags).toEqual([150]);
  await fetchAllPosts();
  expect(fetchMock.mock.calls.every(([, init]) => init?.redirect === 'error')).toBe(true);
});
