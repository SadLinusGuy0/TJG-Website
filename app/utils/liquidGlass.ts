/**
 * Liquid glass SVG displacement filter generator.
 * Adapted from https://github.com/nikdelvin/liquid-glass
 *
 * Generates SVG displacement maps and filters as data URIs that create a
 * glass refraction effect when applied via backdrop-filter: url(...).
 */

type DisplacementMapOptions = {
  height: number;
  width: number;
  radius: number;
  depth: number;
};

type DisplacementFilterOptions = DisplacementMapOptions & {
  strength?: number;
  chromaticAberration?: number;
};

export function getDisplacementMap({
  height,
  width,
  radius,
  depth,
}: DisplacementMapOptions): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <style>.mix { mix-blend-mode: screen; }</style>
    <linearGradient id="left" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgb(${128 + depth},128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient>
    <linearGradient id="right" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="rgb(${128 - depth},128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(128,${128 + depth},128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient>
    <linearGradient id="bottom" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgb(128,${128 - depth},128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="rgb(128,128,128)" rx="${radius}"/>
  <rect class="mix" width="${width}" height="${height}" fill="url(#left)" rx="${radius}"/>
  <rect class="mix" width="${width}" height="${height}" fill="url(#right)" rx="${radius}"/>
  <rect class="mix" width="${width}" height="${height}" fill="url(#top)" rx="${radius}"/>
  <rect class="mix" width="${width}" height="${height}" fill="url(#bottom)" rx="${radius}"/>
</svg>`)
  );
}

export function getDisplacementFilter({
  height,
  width,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0,
}: DisplacementFilterOptions): string {
  const map = getDisplacementMap({ height, width, radius, depth });

  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="displace" x="0" y="0" width="${width}" height="${height}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feImage href="${map}" result="map" width="${width}" height="${height}"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${strength}" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
    <feGaussianBlur in="displaced" stdDeviation="${chromaticAberration}" result="blurred"/>
    <feComponentTransfer in="blurred" result="r"><feFuncR type="identity"/><feFuncG type="discrete" tableValues="0"/><feFuncB type="discrete" tableValues="0"/></feComponentTransfer>
    <feComponentTransfer in="blurred" result="g"><feFuncR type="discrete" tableValues="0"/><feFuncG type="identity"/><feFuncB type="discrete" tableValues="0"/></feComponentTransfer>
    <feComponentTransfer in="blurred" result="b"><feFuncR type="discrete" tableValues="0"/><feFuncG type="discrete" tableValues="0"/><feFuncB type="identity"/></feComponentTransfer>
    <feBlend in="r" in2="g" mode="screen" result="rg"/>
    <feBlend in="rg" in2="b" mode="screen"/>
  </filter>
</svg>`) +
    '#displace'
  );
}

let _supportsBackdropFilterUrl: boolean | null = null;

export function supportsBackdropFilterUrl(): boolean {
  if (_supportsBackdropFilterUrl !== null) return _supportsBackdropFilterUrl;
  if (typeof document === 'undefined') return false;
  const el = document.createElement('div');
  el.style.cssText = 'backdrop-filter: url(#test)';
  _supportsBackdropFilterUrl =
    el.style.backdropFilter === 'url(#test)' ||
    el.style.backdropFilter === 'url("#test")';
  return _supportsBackdropFilterUrl;
}

let _iconFilterValue: string | null = null;

/**
 * Pre-computed backdrop-filter value for 48x48 circular icon buttons
 * (40px width/height + 4px padding on each side).
 */
export function getIconLiquidGlassFilter(): string {
  if (_iconFilterValue) return _iconFilterValue;
  const filterUrl = getDisplacementFilter({
    width: 48,
    height: 48,
    radius: 24,
    depth: 8,
    strength: 100,
    chromaticAberration: 1,
  });
  _iconFilterValue = `blur(0px) url('${filterUrl}') blur(0px) brightness(1.1) saturate(1.5)`;
  return _iconFilterValue;
}
