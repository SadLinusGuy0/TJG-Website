'use client';

import { useState, useEffect, useRef } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract headings from rendered DOM (after BlogContent has added IDs)
  useEffect(() => {
    // Wait for DOM to be ready
    const timeoutId = setTimeout(() => {
      const bodyTextElement = document.querySelector('.body-text');
      if (!bodyTextElement) return;

      const headingElements = bodyTextElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      const extractedHeadings: Heading[] = [];
      
      headingElements.forEach((heading, index) => {
        const text = heading.textContent?.trim() || '';
        if (!text) return;

        // Use existing ID or generate one
        let id = heading.id;
        if (!id) {
          // Generate a slug from the heading text
          const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          id = slug || `heading-${index}`;
          heading.id = id;
        }

        const level = parseInt(heading.tagName.charAt(1));
        extractedHeadings.push({ id, text, level });
      });

      setHeadings(extractedHeadings);
    }, 100); // Small delay to ensure BlogContent has processed the headings

    return () => clearTimeout(timeoutId);
  }, [content]);

  // Handle scroll to update active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for top app bar

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop) {
            setActiveHeading(headings[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsHovered(false);
      }
    };

    if (isHovered) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHovered]);

  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.offsetTop - 80; // Offset for top app bar
      window.scrollTo({ top, behavior: 'smooth' });
      setIsHovered(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="toc-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={(e) => {
          // Only close if mouse is not moving to the dropdown
          const relatedTarget = e.relatedTarget as Node | null;
          if (!dropdownRef.current?.contains(relatedTarget)) {
            setIsHovered(false);
          }
        }}
      >
        <div className="toc-dashes">
          {headings.slice(0, 5).map((heading, index) => (
            <div 
              key={heading.id} 
              className={`toc-dash level-${heading.level}`}
            />
          ))}
        </div>
        {isHovered && (
          <div 
            ref={dropdownRef} 
            className={`toc-dropdown ${isHovered ? 'visible' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={(e) => {
              // Only close if mouse is not moving to the dashes container
              const relatedTarget = e.relatedTarget as Node | null;
              if (!containerRef.current?.contains(relatedTarget)) {
                setIsHovered(false);
              }
            }}
          >
            {headings.map((heading) => (
              <div
                key={heading.id}
                className={`toc-item level-${heading.level} ${activeHeading === heading.id ? 'active' : ''}`}
                onClick={() => handleHeadingClick(heading.id)}
              >
                {heading.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

