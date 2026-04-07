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

