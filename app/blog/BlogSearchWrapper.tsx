'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { WPPost } from '../../lib/wordpress';

interface BlogSearchContextType {
  filteredPosts: WPPost[];
  setFilteredPosts: (posts: WPPost[]) => void;
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
  initialPosts: WPPost[];
  children: React.ReactNode;
}

export function BlogSearchProvider({ initialPosts, children }: BlogSearchProviderProps) {
  const [filteredPosts, setFilteredPosts] = useState<WPPost[]>(initialPosts);

  return (
    <BlogSearchContext.Provider value={{ filteredPosts, setFilteredPosts }}>
      {children}
    </BlogSearchContext.Provider>
  );
}

