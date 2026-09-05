import { safeEmbedHref, embedTitle } from '../../lib/contentUrls';
/**
 * WordPress sometimes outputs lazy embed placeholders as an <a> carrying the
 * real URL in data-src / data-iframe-src, with a small inline script that
 * swaps in an iframe. React does not execute those inline scripts, so we
 * perform the same swap on the client after mount.
 */
export function enhanceWpBlockEmbeds(scope: ParentNode = document): () => void {
  const wrappers = scope.querySelectorAll<HTMLElement>(
    '.wp-block-embed .wp-block-embed__wrapper'
  );
  const placeholders: HTMLAnchorElement[] = [];

  wrappers.forEach((wrap) => {
    if (wrap.querySelector('iframe')) return;

    const placeholder = wrap.querySelector<HTMLAnchorElement>(
      'a[data-src], a[data-iframe-src]'
    );
    if (!placeholder) return;

    placeholders.push(placeholder);
  });

  const activate = (placeholder: HTMLAnchorElement) => {
    if (!placeholder.isConnected) return;

    const src =
      placeholder.getAttribute('data-iframe-src') ||
      placeholder.getAttribute('data-src') ||
      '';
    const safeSrc = safeEmbedHref(src);
    if (!safeSrc) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', safeSrc);
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.minHeight = '360px';

    const title = placeholder.getAttribute('title') || placeholder.textContent?.trim();
    iframe.setAttribute('title', title || embedTitle(safeSrc));

    placeholder.replaceWith(iframe);
  };

  if (!('IntersectionObserver' in window)) {
    placeholders.forEach(activate);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        activate(entry.target as HTMLAnchorElement);
      });
    },
    { rootMargin: '800px 0px' }
  );

  placeholders.forEach((placeholder) => observer.observe(placeholder));
  return () => observer.disconnect();
}
