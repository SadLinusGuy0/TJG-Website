'use client';

import { useState, useMemo, useEffect } from 'react';
import { WPPost } from '../../lib/wordpress';

interface BlogSearchProps {
  posts: WPPost[];
  onFilteredPostsChange: (filteredPosts: WPPost[]) => void;
}

export default function BlogSearch({ posts, onFilteredPostsChange }: BlogSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return posts.filter(post => {
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
  }, [searchQuery, posts]);

  // Notify parent component of filtered posts
  useEffect(() => {
    onFilteredPostsChange(filteredPosts);
  }, [filteredPosts, onFilteredPostsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isExpanded && e.target.value.trim()) {
      setIsExpanded(true);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsExpanded(false);
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    // Keep expanded if there's a search query
    if (!searchQuery.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .blog-search-outer-container {
            position: absolute;
            bottom: 40px;
            left: 0;
            right: 0;
            z-index: 999;
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 20px;
            box-sizing: border-box;
          }

          .blog-search-container {
            width: 100%;
            max-width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }

          .blog-search-wrapper {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 14px;
            padding-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
            width: 100%;
            box-sizing: border-box;
          }

          .blog-search-wrapper:focus-within {
            background: rgba(0, 0, 0, 0.4);
            border-color: rgba(255, 255, 255, 0.25);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          }

          .blog-search-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            color: var(--primary);
            opacity: 0.8;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .blog-search-input {
            flex: 1;
            min-width: 0;
            background: transparent;
            border: none;
            outline: none;
            color: var(--primary);
            font-family: 'One UI Sans';
            font-size: 0.95rem;
            font-weight: 400;
            padding: 0;
            margin: 0;
          }

          .blog-search-input::placeholder {
            color: var(--primary);
            opacity: 0.6;
          }

          .blog-search-clear {
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

          .blog-search-clear:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
          }

          .blog-search-clear:active {
            opacity: 0.8;
          }

          .blog-search-results-count {
            position: absolute;
            bottom: calc(100% + 12px);
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 12px;
            padding: 6px 12px;
            font-family: 'One UI Sans';
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--primary);
            opacity: 0.9;
            white-space: nowrap;
            pointer-events: none;
            transition: opacity 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          @media (max-width: 767px) {
            .blog-search-outer-container {
              bottom: 20px;
              padding: 0 10px;
            }

            .blog-search-wrapper {
              padding: 12px 18px;
            }

            .blog-search-input {
              font-size: 0.9rem;
            }
          }
        `
      }} />
      <div className="blog-search-outer-container">
        <div className="blog-search-container">
          <div className="blog-search-wrapper">
          <svg 
            className="blog-search-icon" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.4131 3.4541C14.2501 3.4541 17.3711 6.57421 17.3711 10.4111C17.3711 12.0663 16.7893 13.5876 15.8213 14.7842L15.7275 14.9014L15.833 15.0068L20.375 19.5498C20.6025 19.7766 20.603 20.146 20.375 20.374V20.375C20.2618 20.4889 20.1126 20.5459 19.9629 20.5459C19.8134 20.5458 19.6649 20.4887 19.5518 20.375L15.0078 15.8311L14.9014 15.7256L14.7852 15.8193C13.5895 16.7874 12.0673 17.3701 10.4131 17.3701C6.57617 17.3701 3.45509 14.2481 3.45508 10.4111C3.45508 6.57421 6.5761 3.4541 10.4131 3.4541ZM10.4131 4.62012C7.21908 4.62012 4.62109 7.21705 4.62109 10.4111C4.62111 13.6051 7.21901 16.2041 10.4131 16.2041C13.6072 16.2041 16.2051 13.6051 16.2051 10.4111C16.2051 7.21705 13.6071 4.62012 10.4131 4.62012Z" fill="currentColor" stroke="currentColor" strokeWidth="0.333333"/>
          </svg>
          <input
            type="text"
            className="blog-search-input"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {searchQuery && (
            <button
              className="blog-search-clear"
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
          {isExpanded && searchQuery && (
            <div className="blog-search-results-count">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

