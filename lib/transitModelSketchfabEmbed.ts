/**
 * WordPress placeholder: a lone <p>…</p> whose text is exactly `transit-model`
 * (Design Log — Ford Transit asset). Replaced server-side because inline WP
 * embed scripts do not run under React dangerouslySetInnerHTML.
 *
 * Model page: https://sketchfab.com/3d-models/2020-ford-transit-9801fbf49bfc456497495e45efa6df0c
 */
const SKETCHFAB_MODEL_ID = '9801fbf49bfc456497495e45efa6df0c';

const SKETCHFAB_TRANSIT_EMBED = `<div class="figma-wrapper sketchfab-embed"><iframe title="2020 Ford Transit (Sketchfab)" width="800" height="480" style="width:100%;max-width:100%;min-height:480px;border:0;display:block;border-radius:var(--br-9xl)" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://sketchfab.com/models/${SKETCHFAB_MODEL_ID}/embed?autostart=0&amp;ui_theme=dark"></iframe></div>`;

/** Match a paragraph whose only text is the placeholder (any attrs on <p>). */
const TRANSIT_MODEL_P_RE = /<p\b[^>]*>\s*transit-model\s*<\/p>/gi;

export function replaceTransitModelPlaceholder(html: string): string {
  if (!html.includes('transit-model')) return html;
  return html.replace(TRANSIT_MODEL_P_RE, SKETCHFAB_TRANSIT_EMBED);
}
