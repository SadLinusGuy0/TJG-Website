import { processContentWithEmbeds } from '../lib/blogContentProcessing';
import { dedupeBlogPostsBySlug, type BlogPost } from '../lib/blog';
import { getBlogContentSource } from '../lib/getBlogContentSourceFlag';
import { portableTextToPlainText, type PortableTextBlock } from '../lib/portableText';

jest.mock('../lib/sanity', () => ({
  fetchAllPosts: jest.fn(),
  fetchPostBySlug: jest.fn(),
  fetchCategories: jest.fn(),
  fetchTags: jest.fn(),
}));

function post(slug: string, id = slug): BlogPost {
  return {
    id,
    date: '2026-06-05T00:00:00.000Z',
    slug,
    title: { rendered: slug },
    excerpt: { rendered: '' },
    content: { rendered: '' },
    categories: [],
    tags: [],
    featuredImageUrl: null,
    contentSource: 'legacyHtml',
    searchText: slug,
  };
}

describe('blog migration compatibility', () => {
  beforeEach(() => {
    delete process.env.FLAGS;
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  });

  it('defaults the blog content source to Sanity without FLAGS configured', async () => {
    await expect(getBlogContentSource()).resolves.toBe('sanity');
  });

  it('uses Sanity when Sanity is configured even if cloud flags are present', async () => {
    process.env.FLAGS = 'configured';
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'project';

    await expect(getBlogContentSource()).resolves.toBe('sanity');
  });

  it('deduplicates posts by slug and keeps the first result', () => {
    const result = dedupeBlogPostsBySlug([
      post('hello-world', 'first'),
      post('testing-sanity'),
      post('hello-world', 'second'),
      post('Hello-World', 'third'),
    ]);

    expect(result.map(item => item.id)).toEqual(['first', 'testing-sanity']);
  });

  it('keeps legacy embed, word counter, and button syntax processing', () => {
    const html = [
      '<p>Intro words before marker</p>',
      '<p>word-count</p>',
      '<p>story-mindmap</p>',
      '<p>(Open project)[https://example.com]{Download}</p>',
    ].join('');

    const processed = processContentWithEmbeds(html);

    expect(processed).toContain('{{WORD_COUNTER}}:4');
    expect(processed).toContain('embed.figma.com/board/JFh3pE1bu21Ad74KUibZug');
    expect(processed).toContain('{{BUTTON:Open project|https://example.com|Download}}');
  });

  it('extracts searchable text from Portable Text blocks', () => {
    const blocks: PortableTextBlock[] = [
      {
        _type: 'block',
        children: [
          { _type: 'span', text: 'Portable ' },
          { _type: 'span', text: 'future post' },
        ],
      },
      { _type: 'blogButton', label: 'Download', href: 'https://example.com' },
    ];

    expect(portableTextToPlainText(blocks)).toBe('Portable future post\n\nDownload');
  });
});
