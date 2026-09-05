import { uniqueHeadingId } from './headings';
import { portableTextToPlainText, type PortableTextBlock } from './portableText';
export const FMP_SLUG = 'getaway-driver-final-major-project';

export interface FmpSection {
  title: string;
  slug: string;
  html: string;
  blocks?: PortableTextBlock[];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)));
}

/**
 * Splits WordPress HTML content by `<h1>` tags into discrete sections.
 * Each section contains everything from one H1 up to (but not including) the next H1.
 * Any content before the first H1 is discarded.
 */
export function extractH1Sections(html: string): FmpSection[] {
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  const matches: { title: string; index: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = h1Regex.exec(html)) !== null) {
    const rawTitle = decodeHtmlEntities(match[1].replace(/<[^>]*>/g, '').trim());
    matches.push({ title: rawTitle, index: match.index });
  }

  if (matches.length === 0) return [];

  const sections: FmpSection[] = [];
  const seen = new Map<string, number>();
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : html.length;
    const sectionHtml = html.slice(start, end).trim();
    const slug = uniqueHeadingId(matches[i].title, seen);

    if (slug) {
      sections.push({ title: matches[i].title, slug, html: sectionHtml });
    }
  }

  return sections;
}

export function extractPostSections(post: { contentSource: string; content?: { rendered: string }; portableBody?: PortableTextBlock[] }): FmpSection[] {
  if (post.contentSource !== 'portableText') return extractH1Sections(post.content?.rendered || '');
  const sections: FmpSection[] = [];
  const seen = new Map<string, number>();
  for (const block of post.portableBody || []) {
    if (block._type === 'block' && block.style === 'h1') {
      const title = portableTextToPlainText([block]);
      sections.push({ title, slug: uniqueHeadingId(title, seen), html: '', blocks: [] });
    } else if (sections.length) sections[sections.length - 1].blocks!.push(block);
  }
  return sections;
}
