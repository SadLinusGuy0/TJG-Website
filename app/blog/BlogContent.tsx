'use client';

import { useEffect, useRef } from 'react';
import { enhanceImageCompare } from './enhanceImageCompare';
import WordCounter from './WordCounter';

const WORD_COUNTER_REGEX = /\{\{WORD_COUNTER\}\}:(\d+)/;

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Add IDs to all headings that don't have them
    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.id) {
        // Generate a slug from the heading text
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

    // Enhance Jetpack before/after blocks into our compare slider
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

  const match = content?.match(WORD_COUNTER_REGEX);
  if (match) {
    const [fullMatch, countStr] = match;
    const count = parseInt(countStr, 10);
    const [before, after] = content.split(fullMatch);
    return (
      <div ref={contentRef} className="body-text" style={bodyTextStyle}>
        {before && <div dangerouslySetInnerHTML={{ __html: before }} />}
        <WordCounter count={count} />
        {after && <div dangerouslySetInnerHTML={{ __html: after }} />}
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

