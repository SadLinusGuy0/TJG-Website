import { safeContentHref } from './contentUrls';
/**
 * WordPress often auto-wraps pasted URLs as `<a href="https://...">...</a>`.
 * Custom `(Label)[url]` markup then captures that whole HTML snippet as `url`;
 * browsers treat `<a href=...>` as a relative path → 404 on the blog host.
 *
 * Pull out a usable absolute URL whenever possible.
 */
function extractHref(raw: string): string {
  const t = raw.trim();
  if (!t) return t;

  const hrefAttrQuoted = /\bhref\s*=\s*["']([^"']+)["']/i.exec(t);
  if (hrefAttrQuoted?.[1]?.trim())
    return decodeMinimalEntities(hrefAttrQuoted[1].trim());

  const hrefAttrUnquoted = /\bhref\s*=\s*([^\s>]+)/i.exec(t);
  if (hrefAttrUnquoted?.[1]?.trim()) {
    const v = decodeMinimalEntities(hrefAttrUnquoted[1].trim().replace(/^["']+|["']+$/g, ''));
    return v;
  }

  const naked = /\b(https?:\/\/[^\s"'<>]+)/i.exec(t);
  if (naked?.[1]) return trimTrailingJunk(decodeMinimalEntities(naked[1]));

  const plain = stripHtmlTags(t).match(/\b(https?:\/\/[^\s"'<>]+)/i)?.[1];
  if (plain) return trimTrailingJunk(decodeMinimalEntities(plain));

  return t;
}

function stripHtmlTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeMinimalEntities(s: string): string {
  return s
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function trimTrailingJunk(url: string): string {
  return url.replace(/[.,;:!?)\]"'<>]+$/, '');
}

export function sanitizeBlogButtonHref(raw: string): string { return safeContentHref(extractHref(raw)); }
