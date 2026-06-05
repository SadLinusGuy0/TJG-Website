'use client';

import { useState, useCallback, useMemo, createContext, useContext } from 'react';
import type { BlogPost } from '../../lib/blog';

interface BlogSearchContextType {
  activeCategory: string | null;
  setActiveCategory: (categorySlug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPosts: BlogPost[];
}

const BlogSearchContext = createContext<BlogSearchContextType | null>(null);

export function useBlogSearch() {
  const context = useContext(BlogSearchContext);
  if (!context) {
    throw new Error('useBlogSearch must be used within BlogSearchProvider');
  }
  return context;
}

interface BlogSearchProviderProps {
  posts: BlogPost[];
  children: React.ReactNode;
}

export function BlogSearchProvider({ posts, children }: BlogSearchProviderProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (activeCategory !== null) {
      result = result.filter(post =>
        post.categories?.includes(activeCategory)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(post => {
        const titleMatch = post.title.rendered.toLowerCase().includes(query);
        const excerptText = post.excerpt.rendered.replace(/<[^>]*>/g, '').toLowerCase();
        const excerptMatch = excerptText.includes(query);
        const contentText = post.searchText || '';
        const contentMatch = contentText.includes(query);
        return titleMatch || excerptMatch || contentMatch;
      });
    }

    return result;
  }, [posts, activeCategory, searchQuery]);

  return (
    <BlogSearchContext.Provider value={{
      activeCategory,
      setActiveCategory,
      searchQuery,
      setSearchQuery,
      filteredPosts,
    }}>
      {children}
    </BlogSearchContext.Provider>
  );
}
