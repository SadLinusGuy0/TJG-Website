'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface HeadingInfo {
  id: string;
  text: string;
}

export default function PostSearchBar() {
  const [headings, setHeadings] = useState<HeadingInfo[]>([]);
  const [nextHeading, setNextHeading] = useState<HeadingInfo | null>(null);
  const [isBackToTop, setIsBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract h1 headings from .body-text and assign IDs
  useEffect(() => {
    const id = setTimeout(() => {
      const bodyText = document.querySelector('.body-text');
      if (!bodyText) return;
      const els = bodyText.querySelectorAll('h1');
      const extracted: HeadingInfo[] = [];
      els.forEach((el, i) => {
        const text = el.textContent?.trim() || '';
        if (!text) return;
        let elId = el.id;
        if (!elId) {
          elId =
            text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim() || `heading-${i}`;
          el.id = elId;
        }
        extracted.push({ id: elId, text });
      });
      setHeadings(extracted);
    }, 150);
    return () => clearTimeout(id);
  }, []);

  // Update which heading is next based on scroll position
  const updateNextHeading = useCallback(() => {
    if (headings.length === 0) return;
    const scrollPos = window.scrollY + 120;
    let found: HeadingInfo | null = null;
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el && el.offsetTop > scrollPos) {
        found = h;
        break;
      }
    }
    setNextHeading(found);
    setIsBackToTop(!found);
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;
    updateNextHeading();
    window.addEventListener('scroll', updateNextHeading, { passive: true });
    return () => window.removeEventListener('scroll', updateNextHeading);
  }, [headings, updateNextHeading]);

  // Remove all highlight marks from the DOM
  const clearHighlights = useCallback(() => {
    const bodyText = document.querySelector('.body-text');
    if (!bodyText) return;
    bodyText.querySelectorAll('mark.post-search-hl').forEach(mark => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(
        document.createTextNode(mark.textContent || ''),
        mark
      );
      parent.normalize();
    });
    setMatchCount(0);
  }, []);

  // Walk text nodes and wrap matches in <mark> elements
  const applyHighlights = useCallback(
    (query: string) => {
      clearHighlights();
      if (!query.trim()) return;
      const bodyText = document.querySelector('.body-text');
      if (!bodyText) return;

      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');

      const walker = document.createTreeWalker(
        bodyText,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const p = node.parentElement;
            if (!p) return NodeFilter.FILTER_REJECT;
            const tag = p.tagName.toLowerCase();
            if (
              ['script', 'style', 'mark', 'textarea', 'input'].includes(tag)
            )
              return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const nodes: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) nodes.push(n as Text);

      let count = 0;
      nodes.forEach(textNode => {
        const text = textNode.textContent || '';
        if (!regex.test(text)) {
          regex.lastIndex = 0;
          return;
        }
        regex.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(text)) !== null) {
          if (m.index > last)
            frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          const mark = document.createElement('mark');
          mark.className = 'post-search-hl';
          mark.textContent = m[0];
          frag.appendChild(mark);
          count++;
          last = regex.lastIndex;
        }
        if (last < text.length)
          frag.appendChild(document.createTextNode(text.slice(last)));
        textNode.parentNode?.replaceChild(frag, textNode);
      });

      setMatchCount(count);
    },
    [clearHighlights]
  );

  useEffect(() => {
    if (searchQuery) applyHighlights(searchQuery);
    else clearHighlights();
  }, [searchQuery, applyHighlights, clearHighlights]);

  // Clean up marks when unmounting
  useEffect(() => () => { clearHighlights(); }, [clearHighlights]);

  const handleJump = () => {
    if (headings.length === 0 || isBackToTop || !nextHeading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(nextHeading.id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  const jumpLabel =
    headings.length === 0 || isBackToTop
      ? 'Back to top'
      : nextHeading?.text ?? 'Back to top';
  const isBackToTopMode = headings.length === 0 || isBackToTop;

  return (
    <>
      <div className="post-search-anchor">
        <div className="post-search-positioner">
          <div className="post-search-bar">
            {/* Search icon */}
            <svg
              className="post-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.4131 3.4541C14.2501 3.4541 17.3711 6.57421 17.3711 10.4111C17.3711 12.0663 16.7893 13.5876 15.8213 14.7842L15.7275 14.9014L15.833 15.0068L20.375 19.5498C20.6025 19.7766 20.603 20.146 20.375 20.374V20.375C20.2618 20.4889 20.1126 20.5459 19.9629 20.5459C19.8134 20.5458 19.6649 20.4887 19.5518 20.375L15.0078 15.8311L14.9014 15.7256L14.7852 15.8193C13.5895 16.7874 12.0673 17.3701 10.4131 17.3701C6.57617 17.3701 3.45509 14.2481 3.45508 10.4111C3.45508 6.57421 6.5761 3.4541 10.4131 3.4541ZM10.4131 4.62012C7.21908 4.62012 4.62109 7.21705 4.62109 10.4111C4.62111 13.6051 7.21901 16.2041 10.4131 16.2041C13.6072 16.2041 16.2051 13.6051 16.2051 10.4111C16.2051 7.21705 13.6071 4.62012 10.4131 4.62012Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.333333"
              />
            </svg>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              className="post-search-input"
              placeholder="Search in post…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            {/* Match count */}
            {searchQuery && matchCount > 0 && (
              <span className="post-search-match-badge">{matchCount}</span>
            )}

            {/* Clear */}
            {searchQuery && (
              <button
                className="post-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {/* Divider */}
            <div className="post-search-divider" aria-hidden="true" />

            {/* Jump / Back to top */}
            <button
              className="post-search-jump"
              onClick={handleJump}
              aria-label={jumpLabel}
            >
              {isBackToTopMode ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              )}
              <span className="post-search-jump-text">{jumpLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
