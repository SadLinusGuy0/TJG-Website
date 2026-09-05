import { renderToStaticMarkup } from 'react-dom/server';
import BlogContent from '../app/blog/BlogContent';
import PortableTextContent from '../app/blog/PortableTextContent';
import { extractH1Sections, extractPostSections } from '../lib/fmpSections';
import { processContentWithEmbeds } from '../lib/blogContentProcessing';
import type { PortableTextBlock } from '../lib/portableText';
jest.mock('../lib/sanity', () => ({ getSanityImageUrl: () => null }));
it('renders every mixed marker without losing surrounding content', () => {
  const content = processContentWithEmbeds('<p>Before</p><p>(First)[https://example.com]</p><p>word-count</p><p>(Second)[/blog]</p><p>After</p>');
  const html = renderToStaticMarkup(<BlogContent content={content} />);
  expect(html.match(/class="blog-button"/g)).toHaveLength(2);
  expect(html).not.toContain('{{BUTTON:'); expect(html).not.toContain('{{WORD_COUNTER');
  expect(html).toContain('Before'); expect(html).toContain('After');
});
it('normalizes heading hierarchy with unique stable IDs', () => {
  const html = processContentWithEmbeds('<h1>Intro</h1><h4>Detail</h4><h1>Intro</h1>');
  expect(html).toContain('<h2 id="intro"'); expect(html).toContain('<h3 id="detail"'); expect(html).toContain('<h2 id="intro-2"');
});
it('keeps legacy section URLs when migrated to Portable Text', () => {
  const html = '<h1>My section</h1><p>A</p><h1>My section</h1><p>B</p>';
  const blocks: PortableTextBlock[] = [
    { _type: 'block', style: 'h1', children: [{ _type: 'span', text: 'My section' }] },
    { _type: 'block', children: [{ _type: 'span', text: 'A' }] },
    { _type: 'block', style: 'h1', children: [{ _type: 'span', text: 'My section' }] },
    { _type: 'block', children: [{ _type: 'span', text: 'B' }] },
  ];
  expect(extractPostSections({ contentSource: 'portableText', portableBody: blocks }).map(s => s.slug)).toEqual(extractH1Sections(html).map(s => s.slug));
});
it('nests mixed Portable Text lists inside their parent list items', () => {
  const blocks: PortableTextBlock[] = [
    { _type: 'block', listItem: 'bullet', level: 1, children: [{ _type: 'span', text: 'Parent' }] },
    { _type: 'block', listItem: 'number', level: 2, children: [{ _type: 'span', text: 'Child' }] },
    { _type: 'block', listItem: 'bullet', level: 1, children: [{ _type: 'span', text: 'Sibling' }] },
  ];
  expect(renderToStaticMarkup(<PortableTextContent blocks={blocks} />)).toContain('<ul><li><span>Parent</span><ol><li><span>Child</span></li></ol></li><li><span>Sibling</span></li></ul>');
});
