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
      <style
        dangerouslySetInnerHTML={{
          __html: `
          mark.post-search-hl {
            background: color-mix(in srgb, var(--accent) 30%, transparent);
            color: inherit;
            border-radius: 3px;
            padding: 0 2px;
          }

          .post-search-anchor {
            position: fixed;
            bottom: 24px;
            left: 0;
            right: 0;
            z-index: 100;
            pointer-events: none;
            /* Override .main-content>* fadeInUp rule — opacity on a fixed
               overlay creates a stacking context that breaks backdrop-filter */
            animation: none !important;
            opacity: 1 !important;
          }

          .post-search-positioner {
            position: relative;
            margin-left: 34%;
            width: 64%;
            padding-left: 20px;
            box-sizing: border-box;
          }

          body.nav-collapsed .post-search-positioner {
            margin-left: 8% !important;
            width: 80% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          @media (max-width: 699px) {
            .post-search-positioner {
              margin-left: auto !important;
              margin-right: auto !important;
              width: 100% !important;
              padding: 0 16px !important;
              max-width: 386px;
            }
          }

          .post-search-bar {
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            background-color: color-mix(in srgb, var(--container-background) 80%, transparent 20%);
            backdrop-filter: blur(48px);
            -webkit-backdrop-filter: blur(48px);
            border-radius: 999px;
            padding: 8px 8px 8px 18px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.12);
            border: 1px solid rgba(0, 0, 0, 0.1);
            animation: postSearchIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          @keyframes postSearchIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          html[data-theme="dark"] .post-search-bar {
            border-color: rgba(255, 255, 255, 0.1);
          }

          .post-search-bar:focus-within {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 12px 40px rgba(0, 0, 0, 0.18);
          }

          .post-search-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            color: var(--primary);
            opacity: 0.55;
          }

          .post-search-input {
            flex: 1;
            min-width: 0;
            background: transparent;
            border: none;
            outline: none;
            color: var(--primary);
            font-family: 'One UI Sans', sans-serif;
            font-size: 0.95rem;
            font-weight: 400;
            padding: 6px 0;
            margin: 0;
          }

          .post-search-input::placeholder {
            color: var(--secondary);
            opacity: 0.7;
          }

          .post-search-match-badge {
            flex-shrink: 0;
            padding: 2px 9px;
            background: color-mix(in srgb, var(--accent) 15%, transparent);
            color: var(--accent);
            border-radius: 999px;
            font-family: 'One UI Sans', sans-serif;
            font-size: 0.75rem;
            font-weight: 600;
            white-space: nowrap;
          }

          .post-search-clear {
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            color: var(--primary);
            opacity: 0.5;
            transition: opacity 0.15s ease;
            border-radius: 50%;
          }
          .post-search-clear:hover { opacity: 1; }

          .post-search-divider {
            width: 1px;
            height: 20px;
            flex-shrink: 0;
            background: color-mix(in srgb, var(--secondary) 20%, transparent);
          }

          .post-search-jump {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--accent);
            border: none;
            border-radius: 999px;
            padding: 8px 14px 8px 10px;
            color: #fff;
            font-family: 'One UI Sans', sans-serif;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            max-width: 220px;
            overflow: hidden;
            transition: opacity 0.15s ease;
            line-height: 1.3;
          }
          .post-search-jump:hover { opacity: 0.85; }
          .post-search-jump:active { opacity: 0.7; }

          .post-search-jump svg {
            flex-shrink: 0;
            width: 14px;
            height: 14px;
          }

          .post-search-jump-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `,
        }}
      />
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
