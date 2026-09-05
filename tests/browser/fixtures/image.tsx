import type { ImgHTMLAttributes } from 'react';
export default function Image({ fill: _fill, preload: _preload, priority: _priority, sizes, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; preload?: boolean; priority?: boolean }) {
  // Next's image service is tested separately; this fixture exercises actual media controls.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} sizes={sizes} alt={props.alt || ''} />;
}
