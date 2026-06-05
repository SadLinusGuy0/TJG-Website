import { mapSanityPostForTest } from '../lib/sanity';

jest.mock('@sanity/client', () => ({
  createClient: () => ({}),
}));

jest.mock('../lib/sanity.config', () => ({
  sanityConfig: {
    projectId: 'project',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
  },
}));

jest.mock('@sanity/image-url', () => () => ({
  image: () => ({
    auto: () => ({
      url: () => 'https://cdn.sanity.io/images/project/dataset/image.jpg',
    }),
  }),
}));

describe('Sanity blog mapping', () => {
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
    expect(mapped.contentSource).toBe('portableText');
    expect(mapped.portableBody).toHaveLength(1);
    expect(mapped.categories).toEqual(['unit-1']);
    expect(mapped.searchText).toContain('portable body text');
  });
});
