import 'server-only';
import sanitizeHtml from 'sanitize-html';
import { safeContentHref, safeEmbedHref, embedTitle } from './contentUrls';
/** Normalize rich content before SSR, preserving permitted media and layout. */
export function sanitizeBlogHtml(html: string): string {
  const ids = new Set<string>();
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe', 'video', 'audio', 'source', 'track', 'figure', 'figcaption'],
    allowedAttributes: {
      '*': ['class', 'id', 'style', 'title', 'lang', 'dir'],
      a: ['href', 'target', 'rel', 'data-src', 'data-iframe-src'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'fetchpriority', 'data-full'],
      iframe: ['src', 'title', 'width', 'height', 'loading', 'allow', 'allowfullscreen', 'referrerpolicy'],
      video: ['src', 'width', 'height', 'controls', 'preload', 'poster', 'playsinline', 'loop', 'muted'],
      audio: ['src', 'controls', 'preload'], source: ['src', 'type', 'media'],
      track: ['src', 'kind', 'srclang', 'label', 'default'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan', 'scope'], ol: ['start', 'reversed'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'], allowProtocolRelative: false,
    allowedStyles: { '*': Object.fromEntries(['width', 'height', 'max-width', 'max-height', 'min-height', 'aspect-ratio', 'object-fit', 'text-align', 'font-weight', 'font-style', 'text-decoration', 'margin', 'margin-top', 'margin-bottom', 'padding', 'border', 'border-radius', 'display', 'gap', 'grid-template-columns', 'flex-basis', 'vertical-align'].map(p => [p, [/^(?!.*(?:url|expression|@|\\)).+$/i]])) },
    transformTags: { '*': (tagName, attributes) => {
      const a = { ...attributes };
      if (a.id) { const base = a.id; let n = 2; while (ids.has(a.id)) a.id = `${base}-${n++}`; ids.add(a.id); }
      if (tagName === 'a') {
        a.href = safeContentHref(a.href || '');
        if (a.target === '_blank') a.rel = 'noopener noreferrer';
        for (const key of ['data-src', 'data-iframe-src']) if (a[key]) a[key] = safeEmbedHref(a[key]);
      }
      if (tagName === 'img') {
        a.src = safeContentHref(a.src || '', true);
        if (a['data-full']) a['data-full'] = safeContentHref(a['data-full'], true);
        a.alt = a.alt || ''; a.loading = 'lazy'; a.decoding = 'async'; a.fetchpriority = 'low';
      }
      if (tagName === 'iframe') {
        a.src = safeEmbedHref(a.src || ''); a.title = a.title?.trim() || embedTitle(a.src);
        a.loading = 'lazy'; a.referrerpolicy = 'strict-origin-when-cross-origin'; a.allow = 'fullscreen; picture-in-picture';
      }
      if (['audio', 'video', 'source', 'track'].includes(tagName)) {
        if (a.src) a.src = safeContentHref(a.src, true);
        if (a.poster) a.poster = safeContentHref(a.poster, true);
        if (tagName === 'audio' || tagName === 'video') { a.preload = 'metadata'; a.controls = ''; }
      }
      return { tagName, attribs: a };
    } },
    exclusiveFilter: frame => ['iframe', 'img'].includes(frame.tag) && !frame.attribs.src,
  });
}
