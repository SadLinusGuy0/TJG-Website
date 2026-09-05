'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import type { BlogPage, BlogSummary } from '../../lib/blog';
interface BlogSearchContextType {
  activeCategory: string | null; setActiveCategory: (category: string | null) => void;
  searchQuery: string; setSearchQuery: (query: string) => void;
  filteredPosts: BlogSummary[]; loading: boolean; error: string | null; hasMore: boolean;
  loadMore: () => void; retry: () => void;
}
const BlogSearchContext = createContext<BlogSearchContextType | null>(null);
export function useBlogSearch() {
  const context = useContext(BlogSearchContext);
  if (!context) throw new Error('useBlogSearch requires BlogSearchProvider');
  return context;
}
export function BlogSearchProvider({ initialPage, children }: { initialPage: BlogPage; children: React.ReactNode }) {
  const [activeCategory, setCategory] = useState<string | null>(null);
  const [searchQuery, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (page === 1 && !searchQuery.trim() && !activeCategory && revision === 0) {
      setResult(initialPage); setError(null); setLoading(false); return;
    }
    const controller = new AbortController();
    setLoading(true); setError(null);
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({ page: String(page), q: searchQuery.trim() });
        if (activeCategory) query.set('category', activeCategory);
        const response = await fetch(`/api/blog/posts?${query}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Search is temporarily unavailable. Please retry.');
        const next: BlogPage = await response.json();
        if (controller.signal.aborted) return;
        setResult(previous => ({ ...next, posts: page === 1 ? next.posts : [...previous.posts, ...next.posts].filter((p, i, all) => all.findIndex(v => v.slug === p.slug) === i) }));
      } catch {
        if (!controller.signal.aborted) setError('Search is temporarily unavailable. Please retry.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, page === 1 ? 250 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery, activeCategory, page, revision, initialPage]);
  return <BlogSearchContext.Provider value={{ activeCategory, searchQuery,
    setActiveCategory: value => { setCategory(value); setPage(1); },
    setSearchQuery: value => { setQuery(value.slice(0, 200)); setPage(1); },
    filteredPosts: result.posts, hasMore: result.hasMore, loading, error,
    loadMore: () => setPage(p => p + 1), retry: () => setRevision(r => r + 1),
  }}>{children}</BlogSearchContext.Provider>;
}
