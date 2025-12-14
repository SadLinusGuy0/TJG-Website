'use client';

import { useEffect, useRef } from 'react';

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
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className="body-text" 
      style={{ 
        fontSize: '16px', 
        lineHeight: '1.5',
        margin: 0,
        padding: 0,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%'
      }} 
      dangerouslySetInnerHTML={{ __html: content || '' }} 
    />
  );
}

