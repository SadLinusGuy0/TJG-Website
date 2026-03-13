'use client';

import { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { WPPost } from '../../lib/wordpress';

type ActiveYear = 'year1' | 'year2';

interface BlogSearchContextType {
  year1Posts: WPPost[];
  year2Posts: WPPost[];
  activeYear: ActiveYear;
  setActiveYear: (year: ActiveYear) => void;
  activeCategory: number | null;
  setActiveCategory: (categoryId: number | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPosts: WPPost[];
  yearSliderEnabled: boolean;
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
  year1Posts: WPPost[];
  year2Posts: WPPost[];
  yearSliderEnabled: boolean;
  children: React.ReactNode;
}

export function BlogSearchProvider({ year1Posts, year2Posts, yearSliderEnabled, children }: BlogSearchProviderProps) {
  const [activeYear, setActiveYear] = useState<ActiveYear>('year1');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    const yearPosts = activeYear === 'year1' ? year1Posts : year2Posts;

    let result = yearPosts;

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
        const contentText = post.content?.rendered
          ? post.content.rendered.replace(/<[^>]*>/g, '').toLowerCase()
          : '';
        const contentMatch = contentText.includes(query);
        return titleMatch || excerptMatch || contentMatch;
      });
    }

    return result;
  }, [activeYear, year1Posts, year2Posts, activeCategory, searchQuery]);

  return (
    <BlogSearchContext.Provider value={{
      year1Posts,
      year2Posts,
      activeYear,
      setActiveYear,
      activeCategory,
      setActiveCategory,
      searchQuery,
      setSearchQuery,
      filteredPosts,
      yearSliderEnabled,
    }}>
      {children}
    </BlogSearchContext.Provider>
  );
}
