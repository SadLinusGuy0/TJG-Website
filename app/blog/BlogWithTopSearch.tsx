'use client';

import BlogPostsWithSearch from './BlogPostsWithSearch';

interface BlogWithTopSearchProps {
  categoryMap: Record<number, string>;
}

/** @deprecated This component is no longer used. */
export default function BlogWithTopSearch({ categoryMap }: BlogWithTopSearchProps) {
  return (
    <BlogPostsWithSearch categoryMap={categoryMap} />
  );
}
