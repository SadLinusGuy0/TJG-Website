import { stripHtmlAndDecode } from './portableText';
export function headingSlug(text: string): string {
  return stripHtmlAndDecode(text).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() || 'section';
}
export function uniqueHeadingId(text: string, seen: Map<string, number>): string {
  const slug = headingSlug(text);
  const count = (seen.get(slug) || 0) + 1;
  seen.set(slug, count);
  return count === 1 ? slug : `${slug}-${count}`;
}
export function normalizeHtmlHeadings(html: string): string {
  const seen = new Map<string, number>();
  const shift = /<h1\b/i.test(html) ? 1 : 0;
  let previous = 1;
  return html.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, content: string) => {
    const next = Math.max(2, Math.min(6, Number(level) + shift, previous + 1));
    previous = next;
    const id = uniqueHeadingId(content, seen);
    return `<h${next} id="${id}" class="content-heading-h${level}">${content}</h${next}>`;
  });
}
