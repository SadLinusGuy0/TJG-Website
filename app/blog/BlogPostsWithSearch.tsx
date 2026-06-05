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
                
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="list">
                    <div className="blog-card-container">
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
                            
                            {post.categories && post.categories.length > 0 && (
                              <div className="blog-card-pill blog-card-pill-muted">
                                {post.categories.map((catSlug: string) => categoryMap[catSlug]).filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {featuredImageUrl && (
                        <>
                          <div className="blog-card-desktop-thumbnail blog-card-thumbnail">
                            <Image
                              src={featuredImageUrl}
                              alt={post.featuredImageAlt || `Featured image for ${post.title.rendered.replace(/<[^>]*>/g, '')}`}
                              fill
                              sizes="120px"
                              style={{ objectFit: 'cover' }}
                              unoptimized={false}
                            />
                          </div>

                          <div className="blog-card-mobile-thumbnail">
                            <Image
                              src={featuredImageUrl}
                              alt={post.featuredImageAlt || `Featured image for ${post.title.rendered.replace(/<[^>]*>/g, '')}`}
                              fill
                              sizes="100vw"
                              style={{ objectFit: 'cover' }}
                              unoptimized={false}
                            />
                          </div>
                        </>
                      )}
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
