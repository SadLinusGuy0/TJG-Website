'use client';

import { useState, useRef, useEffect } from 'react';
import { useBlogSearch } from './BlogSearchWrapper';

interface FloatingSearchBarProps {
  categories: Array<{ id: number; slug: string; name: string }>;
}

export default function FloatingSearchBar({ categories }: FloatingSearchBarProps) {
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory } = useBlogSearch();
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleCategorySelect = (catId: number | null) => {
    setActiveCategory(catId);
    setFilterOpen(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .floating-search-anchor {
            position: fixed;
            bottom: 24px;
            left: 0;
            right: 0;
            z-index: 999;
            pointer-events: none;
          }

          .floating-search-positioner {
            margin-left: 35%;
            width: 64%;
            padding-left: 20px;
            padding-right: 20px;
            box-sizing: border-box;
          }

          body.nav-collapsed .floating-search-positioner {
            margin-left: 8% !important;
            width: 80% !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          @media (max-width: 699px) {
            .floating-search-anchor {
              bottom: 90px;
            }
            .floating-search-positioner {
              margin-left: auto !important;
              margin-right: auto !important;
              width: 100% !important;
              padding: 0 16px !important;
              max-width: 386px;
            }
          }

          .floating-search-bar {
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 12px;
            background-color: color-mix(in srgb, var(--container-background) 80%, transparent 20%);
            backdrop-filter: blur(48px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 28px;
            padding: 14px 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.12);
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
            corner-shape: round;
          }

          .floating-search-bar:focus-within {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 12px 40px rgba(0, 0, 0, 0.18);
          }

          .floating-search-icon {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
            color: var(--primary);
            opacity: 0.7;
          }

          .floating-search-input {
            flex: 1;
            min-width: 0;
            background: transparent;
            border: none;
            outline: none;
            color: var(--primary);
            font-family: 'One UI Sans', sans-serif;
            font-size: 0.95rem;
            font-weight: 400;
            padding: 0;
            margin: 0;
          }

          .floating-search-input::placeholder {
            color: var(--secondary);
            opacity: 0.7;
          }

          .floating-search-clear {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            color: var(--primary);
            opacity: 0.6;
            transition: opacity 0.15s ease;
            border-radius: 50%;
          }

          .floating-search-clear:hover {
            opacity: 1;
          }

          .floating-search-filter-wrapper {
            position: relative;
          }

          .floating-search-filter-btn {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
            background: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            color: var(--primary);
            opacity: 0.7;
            transition: opacity 0.15s ease, background 0.15s ease;
            border-radius: 50%;
          }

          .floating-search-filter-btn:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.08);
          }

          .floating-search-filter-btn[data-active="true"] {
            color: var(--accent);
            opacity: 1;
          }

          .floating-search-filter-menu {
            position: absolute;
            bottom: calc(100% + 12px);
            right: -8px;
            background: rgba(20, 20, 22, 0.9);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: var(--br-lg, 16px);
            padding: 8px;
            min-width: 180px;
            max-height: 320px;
            overflow-y: auto;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            gap: 2px;
            animation: filterMenuIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @keyframes filterMenuIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .floating-search-filter-menu::-webkit-scrollbar {
            width: 4px;
          }

          .floating-search-filter-menu::-webkit-scrollbar-track {
            background: transparent;
          }

          .floating-search-filter-menu::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 2px;
          }

          .floating-search-filter-item {
            background: transparent;
            border: none;
            color: var(--primary);
            font-family: 'One UI Sans', sans-serif;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 10px 14px;
            border-radius: var(--br-sm, 10px);
            cursor: pointer;
            text-align: left;
            transition: background 0.15s ease;
            white-space: nowrap;
          }

          .floating-search-filter-item:hover {
            background: rgba(255, 255, 255, 0.08);
          }

          .floating-search-filter-item[data-selected="true"] {
            background: var(--accent);
            color: #fff;
          }

          .floating-search-filter-item[data-selected="true"]:hover {
            background: var(--accent);
          }
        `
      }} />
      <div className="floating-search-anchor">
        <div className="floating-search-positioner">
        <div className="floating-search-bar">
          <svg
            className="floating-search-icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.4131 3.4541C14.2501 3.4541 17.3711 6.57421 17.3711 10.4111C17.3711 12.0663 16.7893 13.5876 15.8213 14.7842L15.7275 14.9014L15.833 15.0068L20.375 19.5498C20.6025 19.7766 20.603 20.146 20.375 20.374V20.375C20.2618 20.4889 20.1126 20.5459 19.9629 20.5459C19.8134 20.5458 19.6649 20.4887 19.5518 20.375L15.0078 15.8311L14.9014 15.7256L14.7852 15.8193C13.5895 16.7874 12.0673 17.3701 10.4131 17.3701C6.57617 17.3701 3.45509 14.2481 3.45508 10.4111C3.45508 6.57421 6.5761 3.4541 10.4131 3.4541ZM10.4131 4.62012C7.21908 4.62012 4.62109 7.21705 4.62109 10.4111C4.62111 13.6051 7.21901 16.2041 10.4131 16.2041C13.6072 16.2041 16.2051 13.6051 16.2051 10.4111C16.2051 7.21705 13.6071 4.62012 10.4131 4.62012Z" fill="currentColor" stroke="currentColor" strokeWidth="0.333333"/>
          </svg>

          <input
            ref={inputRef}
            type="text"
            className="floating-search-input"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery && (
            <button
              className="floating-search-clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          <div className="floating-search-filter-wrapper" ref={filterRef}>
            <button
              className="floating-search-filter-btn"
              data-active={activeCategory !== null}
              onClick={() => setFilterOpen(!filterOpen)}
              aria-label="Filter by category"
              aria-expanded={filterOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {filterOpen && (
              <div className="floating-search-filter-menu">
                <button
                  className="floating-search-filter-item"
                  data-selected={activeCategory === null}
                  onClick={() => handleCategorySelect(null)}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className="floating-search-filter-item"
                    data-selected={activeCategory === cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
