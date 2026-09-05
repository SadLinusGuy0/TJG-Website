'use client';
import { stripHtmlAndDecode } from '../../lib/portableText';

import Image from 'next/image';
import Link from 'next/link';
import { useBlogSearch } from './BlogSearchWrapper';

interface BlogPostsWithSearchProps {
  categoryMap: Record<string, string>;
}

export default function BlogPostsWithSearch({ categoryMap }: BlogPostsWithSearchProps) {
  const { filteredPosts, loading, error, hasMore, loadMore, retry } = useBlogSearch();
  const initialImageIds = new Set(
    filteredPosts
      .filter((post) => Boolean(post.featuredImageUrl))
      .slice(0, 2)
      .map((post) => post.id)
  );

  return (
    <>
      <div className="blog-posts-slide-wrapper" aria-busy={loading}>
        {(loading || error) && (
          <p role="status" aria-live="polite">{loading ? 'Loading articles…' : error}</p>
        )}
        {error && <button onClick={retry}>Retry search</button>}
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
                            sizes="(max-width: 699px) calc(100vw - 56px), (max-width: 1200px) calc((100vw - 220px) / 2), 520px"
                            preload={initialImageIds.has(post.id)}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div className="blog-card-gradient" aria-hidden="true" />
                      <div className="blog-card-text-content">
                        <div className="body-text-blog-title" >{stripHtmlAndDecode(post.title.rendered)}</div>
                        <div className="information-wrapper">
                          <div className="information" >{stripHtmlAndDecode(post.excerpt.rendered)}</div>
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
              <h2 className="title">No Posts Found</h2>
            </div>
            <div className="panel settings">
              <div className="body-text">
                <p>No articles found. Try different keywords or categories.</p>
              </div>
            </div>
          </div>
        )}
        {hasMore && !error && <button className="blog-button" onClick={loadMore} disabled={loading}>Load more articles</button>}
      </div>
    </>
  );
}
