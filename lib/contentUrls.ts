/** URL rules shared by HTML normalization and embed enhancement. */
export const EMBED_HOSTS = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com', 'open.spotify.com', 'embed.figma.com', 'www.figma.com', 'docs.google.com', 'www.google.com', 'forms.office.com', 'sketchfab.com'];
export function safeContentHref(value: string, media = false): string {
  const input = value.trim();
  if (!input || /[\u0000-\u0020\u007f\\]/.test(input)) return '';
  if (/^\/(?!\/)/.test(input) || input.startsWith('#')) return input;
  try {
    const url = new URL(input);
    if (url.username || url.password) return '';
    return (media ? ['https:'] : ['https:', 'http:', 'mailto:', 'tel:']).includes(url.protocol) ? input : '';
  } catch { return ''; }
}
export function safeEmbedHref(value: string): string {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && EMBED_HOSTS.includes(u.hostname) ? u.href : '';
  } catch { return ''; }
}
export function embedTitle(src: string): string {
  try { const u = new URL(src); return `${u.hostname} embedded content — ${u.pathname.split('/').filter(Boolean).at(-1) || 'media'}`; }
  catch { return 'Embedded content'; }
}
