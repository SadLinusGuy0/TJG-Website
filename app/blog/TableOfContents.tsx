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
      <style dangerouslySetInnerHTML={{
        __html: `
          .toc-container {
            position: relative;
            display: flex;
            align-items: center;
            margin-left: auto;
          }

          .toc-dashes {
            display: none;
          }

          .toc-dashes:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .toc-dash {
            height: 2px;
            background-color: var(--primary);
            opacity: 0.6;
            border-radius: 1px;
            transition: opacity 0.2s ease;
          }

          .toc-dash.level-1 {
            width: 20px;
            height: 3px;
          }

          .toc-dash.level-2 {
            width: 16px;
            height: 2.5px;
          }

          .toc-dash.level-3 {
            width: 12px;
            height: 2px;
          }

          .toc-dash.level-4 {
            width: 10px;
            height: 1.5px;
          }

          .toc-dash.level-5 {
            width: 8px;
            height: 1.5px;
          }

          .toc-dash.level-6 {
            width: 6px;
            height: 1px;
          }

          .toc-dashes:hover .toc-dash {
            opacity: 1;
          }

          .toc-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            background: var(--container-experimental);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            min-width: 240px;
            max-width: 320px;
            max-height: 60vh;
            overflow-y: auto;
            z-index: 1001;
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
            pointer-events: none;
            transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                        transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .toc-dropdown.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
          }

          .toc-dropdown::-webkit-scrollbar {
            width: 6px;
          }

          .toc-dropdown::-webkit-scrollbar-track {
            background: transparent;
          }

          .toc-dropdown::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }

          .toc-dropdown::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .toc-item {
            padding: 8px 16px;
            cursor: pointer;
            transition: background-color 0.15s ease;
            color: var(--primary);
            font-family: 'One UI Sans';
            font-size: 0.9rem;
            line-height: 1.4;
            border-left: 2px solid transparent;
          }

          .toc-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .toc-item.active {
            border-left-color: var(--primary);
            background-color: rgba(255, 255, 255, 0.05);
            font-weight: 500;
          }

          .toc-item.level-1 {
            padding-left: 16px;
            font-weight: 600;
          }

          .toc-item.level-2 {
            padding-left: 24px;
            font-weight: 500;
          }

          .toc-item.level-3 {
            padding-left: 32px;
            font-weight: 400;
          }

          .toc-item.level-4,
          .toc-item.level-5,
          .toc-item.level-6 {
            padding-left: 40px;
            font-weight: 400;
            font-size: 0.85rem;
            opacity: 0.9;
          }

          @media (max-width: 700px) {
            .toc-container {
              display: none;
            }
          }
        `
      }} />
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

