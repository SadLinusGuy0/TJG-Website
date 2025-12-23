'use client';

import { useState, useRef, useEffect } from 'react';
import { WPPost } from '../../lib/wordpress';
import { useBlogSearch } from './BlogSearchWrapper';

interface TopAppBarSearchProps {
  posts: WPPost[];
  onFilteredPostsChange?: (filteredPosts: WPPost[]) => void;
}

export default function TopAppBarSearch({ posts, onFilteredPostsChange }: TopAppBarSearchProps) {
  const { setFilteredPosts } = useBlogSearch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      onFilteredPostsChange?.(posts);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    
    const filtered = posts.filter(post => {
      // Search in title
      const titleMatch = post.title.rendered.toLowerCase().includes(query);
      
      // Search in excerpt
      const excerptText = post.excerpt.rendered
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .toLowerCase();
      const excerptMatch = excerptText.includes(query);
      
      // Search in content if available
      const contentText = post.content?.rendered
        ? post.content.rendered.replace(/<[^>]*>/g, '').toLowerCase()
        : '';
      const contentMatch = contentText.includes(query);
      
      return titleMatch || excerptMatch || contentMatch;
    });

    setFilteredPosts(filtered);
    onFilteredPostsChange?.(filtered);
  }, [searchQuery, posts, setFilteredPosts, onFilteredPostsChange]);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        isExpanded &&
        !searchQuery.trim()
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, searchQuery]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleIconClick = () => {
    setIsExpanded(true);
  };

  const handleInputBlur = () => {
    // Only collapse if there's no search query
    if (!searchQuery.trim()) {
      // Delay to allow click outside handler to work
      setTimeout(() => {
        if (!searchQuery.trim()) {
          setIsExpanded(false);
        }
      }, 200);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsExpanded(false);
    setFilteredPosts(posts);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .top-app-bar-search-container {
            position: relative;
            display: flex;
            align-items: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .top-app-bar-search-icon-button {
            width: 40px;
            height: 40px;
            overflow: hidden;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--container-experimental);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            cursor: pointer;
            transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 0;
            margin: 0;
            opacity: 1;
            transform: scale(1);
          }
          
          .top-app-bar-search-container.expanded .top-app-bar-search-icon-button {
            opacity: 0;
            width: 0;
            margin: 0;
            transform: scale(0.8);
            pointer-events: none;
          }

          .top-app-bar-search-icon-button:hover {
            background: var(--container-experimental);
            border-color: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
          }

          .top-app-bar-search-icon-button svg {
            width: 20px;
            height: 20px;
            color: var(--primary);
            opacity: 0.8;
            transition: all 0.3s ease;
          }

          .top-app-bar-search-expanded {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--container-experimental);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 12px;
            min-width: 200px;
            flex: 1;
            max-width: 400px;
            height: 40px;
            box-sizing: border-box;
            opacity: 0;
            max-width: 0;
            transform: scale(0.9);
            overflow: hidden;
            transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .top-app-bar-search-expanded.expanded {
            opacity: 1;
            max-width: 400px;
            transform: scale(1);
            overflow: visible;
          }
          
          @media (max-width: 767px) {
            .top-app-bar-search-expanded.expanded {
              max-width: 250px;
            }
          }

          .top-app-bar-search-expanded:focus-within {
            background: var(--container-experimental);
            border-color: rgba(255, 255, 255, 0.3);
          }

          .top-app-bar-search-input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: var(--primary);
            font-family: 'One UI Sans';
            font-size: 0.9rem;
            font-weight: 400;
            padding: 0;
            margin: 0;
            min-width: 0;
          }

          .top-app-bar-search-input::placeholder {
            color: var(--primary);
            opacity: 0.5;
          }

          .top-app-bar-search-clear {
            width: 20px;
            height: 20px;
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
            transition: opacity 0.2s ease;
            border-radius: 50%;
          }

          .top-app-bar-search-clear:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
          }

          .top-app-bar-search-icon-expanded {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            color: var(--primary);
            opacity: 0.8;
          }

          @media (max-width: 767px) {
            .top-app-bar-search-expanded {
              min-width: 150px;
            }
            
            .top-app-bar-search-expanded.expanded {
              max-width: 250px;
            }
          }
        `
      }} />
      <div className={`top-app-bar-search-container ${isExpanded ? 'expanded' : ''}`} ref={searchContainerRef}>
        <button
          className="top-app-bar-search-icon-button"
          onClick={handleIconClick}
          aria-label="Search"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.4131 3.4541C14.2501 3.4541 17.3711 6.57421 17.3711 10.4111C17.3711 12.0663 16.7893 13.5876 15.8213 14.7842L15.7275 14.9014L15.833 15.0068L20.375 19.5498C20.6025 19.7766 20.603 20.146 20.375 20.374V20.375C20.2618 20.4889 20.1126 20.5459 19.9629 20.5459C19.8134 20.5458 19.6649 20.4887 19.5518 20.375L15.0078 15.8311L14.9014 15.7256L14.7852 15.8193C13.5895 16.7874 12.0673 17.3701 10.4131 17.3701C6.57617 17.3701 3.45509 14.2481 3.45508 10.4111C3.45508 6.57421 6.5761 3.4541 10.4131 3.4541ZM10.4131 4.62012C7.21908 4.62012 4.62109 7.21705 4.62109 10.4111C4.62111 13.6051 7.21901 16.2041 10.4131 16.2041C13.6072 16.2041 16.2051 13.6051 16.2051 10.4111C16.2051 7.21705 13.6071 4.62012 10.4131 4.62012Z" fill="currentColor" stroke="currentColor" strokeWidth="0.333333"/>
          </svg>
        </button>
        <div className={`top-app-bar-search-expanded ${isExpanded ? 'expanded' : ''}`}>
            <svg 
              className="top-app-bar-search-icon-expanded"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.4131 3.4541C14.2501 3.4541 17.3711 6.57421 17.3711 10.4111C17.3711 12.0663 16.7893 13.5876 15.8213 14.7842L15.7275 14.9014L15.833 15.0068L20.375 19.5498C20.6025 19.7766 20.603 20.146 20.375 20.374V20.375C20.2618 20.4889 20.1126 20.5459 19.9629 20.5459C19.8134 20.5458 19.6649 20.4887 19.5518 20.375L15.0078 15.8311L14.9014 15.7256L14.7852 15.8193C13.5895 16.7874 12.0673 17.3701 10.4131 17.3701C6.57617 17.3701 3.45509 14.2481 3.45508 10.4111C3.45508 6.57421 6.5761 3.4541 10.4131 3.4541ZM10.4131 4.62012C7.21908 4.62012 4.62109 7.21705 4.62109 10.4111C4.62111 13.6051 7.21901 16.2041 10.4131 16.2041C13.6072 16.2041 16.2051 13.6051 16.2051 10.4111C16.2051 7.21705 13.6071 4.62012 10.4131 4.62012Z" fill="currentColor" stroke="currentColor" strokeWidth="0.333333"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="top-app-bar-search-input"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={handleInputBlur}
            />
            {searchQuery && (
              <button
                className="top-app-bar-search-clear"
                onClick={handleClear}
                aria-label="Clear search"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
      </div>
    </>
  );
}

