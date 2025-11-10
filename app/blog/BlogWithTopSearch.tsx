'use client';

import { useState, useCallback } from 'react';
import { WPPost } from '../../lib/wordpress';
import BlogPostsWithSearch from './BlogPostsWithSearch';

interface BlogWithTopSearchProps {
  initialPosts: WPPost[];
  categoryMap: Record<number, string>;
  onFilteredPostsChange: (posts: WPPost[]) => void;
}

export default function BlogWithTopSearch({ initialPosts, categoryMap, onFilteredPostsChange }: BlogWithTopSearchProps) {
  return (
    <BlogPostsWithSearch initialPosts={initialPosts} categoryMap={categoryMap} />
  );
}

