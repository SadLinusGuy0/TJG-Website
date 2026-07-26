import { fetchAllPosts, fetchPostBySlug, mapSanityPostForTest } from '../lib/sanity';

const mockFetch = jest.fn();
jest.mock('@sanity/client', () => ({
  createClient: () => ({ fetch: mockFetch }),
}));

jest.mock('../lib/sanity.config', () => ({
  sanityConfig: {
    projectId: 'project',
    dataset: 'production',
    apiVersion: '2024-01-01',
    perspective: 'published',
    useCdn: true,
  },
}));

jest.mock('@sanity/image-url', () => ({
  createImageUrlBuilder: () => ({
    image: () => ({
      auto: () => ({
        width: () => ({
          quality: () => ({
            url: () => 'https://cdn.sanity.io/images/project/dataset/image.jpg?w=1200&q=75&auto=format',
          }),
        }),
      }),
    }),
  }),
}));

describe('Sanity blog mapping', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('excludes hidden posts from lists while keeping direct slug lookups available', async () => {
    mockFetch.mockResolvedValue([]);

    await fetchAllPosts();
    expect(mockFetch.mock.calls[0][0]).toContain('coalesce(hideFromBlogLists, false) == false');

    await fetchAllPosts({ tagSlug: 'year-2' });
    expect(mockFetch.mock.calls[1][0]).toContain('coalesce(hideFromBlogLists, false) == false');

    mockFetch.mockResolvedValue(null);
    await fetchPostBySlug('private-policy');
    expect(mockFetch.mock.calls[2][0]).not.toContain('hideFromBlogLists');
  });

  it('maps nested featured image alt text and Portable Text body', () => {
    const mapped = mapSanityPostForTest({
      _id: 'post-1',
      title: 'Future Post',
      slug: { current: 'future-post' },
      publishedAt: '2026-06-05T00:00:00.000Z',
      excerpt: 'A new Sanity post.',
      featuredImage: { asset: { _ref: 'image-abc' } },
      featuredImageAlt: 'A useful alt description',
      categories: [{ _id: 'cat-1', title: 'Unit 1', slug: { current: 'unit-1' } }],
      tags: [{ _id: 'tag-1', title: 'Year 2', slug: { current: 'year-2' } }],
      legacyHtml: null,
      contentSource: 'portableText',
      wordCount: null,
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Portable body text' }],
        },
      ],
    });

    expect(mapped.featuredImageAlt).toBe('A useful alt description');
    expect(mapped.featuredImageUrl).toContain('w=1200');
    expect(mapped.featuredImageUrl).toContain('q=75');
    expect(mapped.contentSource).toBe('portableText');
    expect(mapped.portableBody).toHaveLength(1);
    expect(mapped.categories).toEqual(['unit-1']);
    expect(mapped.searchText).toContain('portable body text');
  });

  it('treats zero Sanity word counts as missing so Portable Text can be counted', () => {
    const mapped = mapSanityPostForTest({
      _id: 'post-2',
      title: 'Zero Count Post',
      slug: { current: 'zero-count-post' },
      publishedAt: '2026-06-05T00:00:00.000Z',
      excerpt: null,
      featuredImage: null,
      featuredImageAlt: null,
      categories: null,
      tags: null,
      legacyHtml: null,
      contentSource: 'portableText',
      wordCount: 0,
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Portable body text' }],
        },
      ],
    });

    expect(mapped.wordCount).toBeUndefined();
  });

  it('ignores stale category and tag references returned as null', () => {
    const mapped = mapSanityPostForTest({
      _id: 'post-3',
      title: 'Post with a stale reference',
      slug: { current: 'stale-reference' },
      publishedAt: '2026-07-26T00:00:00.000Z',
      excerpt: null,
      featuredImage: null,
      featuredImageAlt: null,
      categories: [null, { _id: 'cat-1', title: 'Games', slug: { current: 'games' } }],
      tags: [null, { _id: 'tag-1', title: 'College', slug: { current: 'college' } }],
      legacyHtml: null,
      contentSource: 'portableText',
      wordCount: null,
      body: [],
    });

    expect(mapped.categories).toEqual(['games']);
    expect(mapped.tags).toEqual(['college']);
  });
});
