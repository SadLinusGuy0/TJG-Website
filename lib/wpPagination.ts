/** WordPress explicitly reports its last page; never probe past an exact full page. */
export async function collectWordpressPages<T>(read: (page: number) => Promise<{ items: T[]; totalPages: number }>, maxPages = 1000): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const { items, totalPages } = await read(page);
    if (!Number.isInteger(totalPages) || totalPages < 0 || totalPages > maxPages) throw new Error('Invalid WordPress pagination');
    all.push(...items);
    if (page >= totalPages) return all;
  }
  throw new Error('WordPress pagination limit exceeded');
}
