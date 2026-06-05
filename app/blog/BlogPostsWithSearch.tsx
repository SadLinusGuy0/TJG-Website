'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBlogSearch } from './BlogSearchWrapper';

interface BlogPostsWithSearchProps {
  categoryMap: Record<string, string>;
}

export default function BlogPostsWithSearch({ categoryMap }: BlogPostsWithSearchProps) {
  const { filteredPosts } = useBlogSearch();

  return (
    <>
      <div className="blog-posts-slide-wrapper">
        {filteredPosts.length > 0 ? (
          <div className="section">
            <div className="list-group">
              {filteredPosts.map((post) => {
                const featuredImageUrl = post.featuredImageUrl;
                const categories = post.categories
                  ?.map((catSlug: string) => categoryMap[catSlug] || catSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
                  .filter(Boolean) ?? [];
                
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="list blog-index-card">
                    <div className={`blog-card-container${featuredImageUrl ? ' blog-card-container--image' : ' blog-card-container--fallback'}`}>
                      {featuredImageUrl && (
                        <div className="blog-card-background" aria-hidden="true">
                          <Image
                            src={featuredImageUrl}
                            alt=""
                            fill
                            sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1200px) 80vw, 70vw"
                            style={{ objectFit: 'cover' }}
                            unoptimized={false}
                          />
                        </div>
                      )}
                      <div className="blog-card-gradient" aria-hidden="true" />
                      <div className="blog-card-text-content">
                        <div className="body-text-blog-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                        <div className="information-wrapper">
                          <div className="information" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                          <div className="blog-card-meta">
                            <div className="blog-card-pill">
                              {new Date(post.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            
                            {categories.length > 0 && (
                              <div className="blog-card-pill blog-card-pill-muted">
                                {categories.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="section">
            <div className="section-header">
              <div className="title">No Posts Found</div>
            </div>
            <div className="panel settings">
              <div className="body-text">
                <p>No articles match your search. Try different keywords.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
