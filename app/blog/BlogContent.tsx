'use client';

import { useEffect, useRef, useMemo } from 'react';
import { enhanceImageCompare } from './enhanceImageCompare';
import WordCounter from './WordCounter';
import NativeSlideshow, { type SlideData } from './NativeSlideshow';

const WORD_COUNTER_REGEX = /\{\{WORD_COUNTER\}\}:(\d+)/;

const SLIDESHOW_GALLERY_RE =
  /<figure\b[^>]*class="[^"]*(?:is-style-slideshow|is-slideshow)[^"]*"[^>]*>[\s\S]*?<\/figure>(?:\s*<\/figure>)*/gi;

const JETPACK_SLIDESHOW_RE =
  /<div\b[^>]*class="[^"]*wp-block-jetpack-slideshow[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi;

interface SlideshowSegment {
  type: 'slideshow';
  slides: SlideData[];
}

interface HtmlSegment {
  type: 'html';
  html: string;
}

type ContentSegment = HtmlSegment | SlideshowSegment;

function extractSlides(galleryHtml: string): SlideData[] {
  const slides: SlideData[] = [];
  const imgRe = /<img\b[^>]*>/gi;
  let imgMatch: RegExpExecArray | null;

  while ((imgMatch = imgRe.exec(galleryHtml)) !== null) {
    const tag = imgMatch[0];
    const src = tag.match(/src="([^"]+)"/i)?.[1] || '';
    const alt = tag.match(/alt="([^"]*?)"/i)?.[1] || '';

    let caption = '';
    const afterImg = galleryHtml.slice(imgMatch.index + tag.length);
    const capMatch = afterImg.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    if (capMatch) {
      caption = capMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    if (src) slides.push({ src, alt, caption: caption || undefined });
  }
  return slides;
}

function splitContentIntoSegments(html: string): ContentSegment[] {
  const combined = new RegExp(
    `(${SLIDESHOW_GALLERY_RE.source})|(${JETPACK_SLIDESHOW_RE.source})`,
    'gi'
  );

  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = combined.exec(html)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: 'html', html: html.slice(lastIndex, m.index) });
    }
    const slides = extractSlides(m[0]);
    if (slides.length > 0) {
      segments.push({ type: 'slideshow', slides });
    } else {
      segments.push({ type: 'html', html: m[0] });
    }
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < html.length) {
    segments.push({ type: 'html', html: html.slice(lastIndex) });
  }

  return segments;
}

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const segments = useMemo(() => splitContentIntoSegments(content || ''), [content]);

  useEffect(() => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.id) {
        const text = heading.textContent?.trim() || '';
        const slug = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        heading.id = slug || `heading-${index}`;
      }
    });

    enhanceImageCompare(contentRef.current);
  }, [content]);

  const bodyTextStyle: React.CSSProperties = {
    fontSize: '16px',
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%',
  };

  const wordCountMatch = content?.match(WORD_COUNTER_REGEX);

  const renderSegments = (segs: ContentSegment[]) =>
    segs.map((seg, i) => {
      if (seg.type === 'slideshow') {
        return <NativeSlideshow key={`slide-${i}`} slides={seg.slides} />;
      }

      let html = seg.html;
      const wcMatch = html.match(WORD_COUNTER_REGEX);
      if (wcMatch) {
        const count = parseInt(wcMatch[1], 10);
        const [before, after] = html.split(wcMatch[0]);
        return (
          <div key={`html-${i}`}>
            {before && <div dangerouslySetInnerHTML={{ __html: before }} />}
            <WordCounter count={count} />
            {after && <div dangerouslySetInnerHTML={{ __html: after }} />}
          </div>
        );
      }

      return <div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: html }} />;
    });

  const hasSlideshows = segments.some(s => s.type === 'slideshow');

  if (hasSlideshows || wordCountMatch) {
    return (
      <div ref={contentRef} className="body-text" style={bodyTextStyle}>
        {renderSegments(segments)}
      </div>
    );
  }

  return (
    <div
      ref={contentRef}
      className="body-text"
      style={bodyTextStyle}
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
}

