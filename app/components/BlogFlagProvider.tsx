"use client";

import { createContext, useContext } from 'react';

const BlogFlagContext = createContext<boolean>(true);

export function useBlogEnabled() {
  return useContext(BlogFlagContext);
}

export function BlogFlagProvider({ 
  children, 
  blogEnabled 
}: { 
  children: React.ReactNode; 
  blogEnabled: boolean;
}) {
  return (
    <BlogFlagContext.Provider value={blogEnabled}>
      {children}
    </BlogFlagContext.Provider>
  );
}
