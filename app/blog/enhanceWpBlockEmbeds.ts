/**
 * WordPress sometimes outputs lazy embed placeholders as an <a> carrying the
 * real URL in data-src / data-iframe-src, with a small inline script that
 * swaps in an iframe. React does not execute those inline scripts, so we
 * perform the same swap on the client after mount.
 */
export function enhanceWpBlockEmbeds(scope: ParentNode = document) {
  const wrappers = scope.querySelectorAll<HTMLElement>(
    '.wp-block-embed .wp-block-embed__wrapper'
  );

  wrappers.forEach((wrap) => {
    if (wrap.querySelector('iframe')) return;

    const placeholder = wrap.querySelector<HTMLAnchorElement>(
      'a[data-src], a[data-iframe-src]'
    );
    if (!placeholder) return;

    const src =
      placeholder.getAttribute('data-iframe-src') ||
      placeholder.getAttribute('data-src') ||
      '';
    if (!src.trim()) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', src.trim());
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.minHeight = '360px';

    const title = placeholder.getAttribute('title') || placeholder.textContent?.trim();
    if (title) iframe.setAttribute('title', title);

    placeholder.replaceWith(iframe);
  });
}
