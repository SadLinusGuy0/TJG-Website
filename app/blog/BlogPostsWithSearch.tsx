'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WPPost, getFeaturedImageUrl } from '../../lib/wordpress';
import { useBlogSearch } from './BlogSearchWrapper';

interface BlogPostsWithSearchProps {
  initialPosts: WPPost[];
  categoryMap: Record<number, string>;
}

export default function BlogPostsWithSearch({ initialPosts, categoryMap }: BlogPostsWithSearchProps) {
  const { filteredPosts } = useBlogSearch();
  const [featuredImages, setFeaturedImages] = useState<Map<number, string | null>>(new Map());

  // Load featured images for filtered posts
  useEffect(() => {
    const loadImages = async () => {
      const imageMap = new Map<number, string | null>();
      
      // Use the synchronous getFeaturedImageUrl for client-side
      filteredPosts.forEach((post) => {
        if (!imageMap.has(post.id)) {
          const imageUrl = getFeaturedImageUrl(post);
          imageMap.set(post.id, imageUrl);
        }
      });
      
      setFeaturedImages(imageMap);
    };
    
    loadImages();
  }, [filteredPosts]);

  return (
    <>
      {filteredPosts.length > 0 ? (
        <div className="blank-div">
          <div className="theme-container">
            {filteredPosts.map((post) => {
              const featuredImageUrl = featuredImages.get(post.id);
              
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="list3">
                  <div className="blog-card-container" style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'flex-start',
                    width: '100%'
                  }}>
                    {/* Text Content - Left Side */}
                    <div className="blog-card-text-content" style={{ 
                      flex: 1, 
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontFamily: 'One UI Sans',
                      fontWeight: '600'
                    }}>
                      <div className="body-text-blog-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                      <div className="information-wrapper">
                        <div className="information" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: 'One UI Sans'
                        }}>
                          {/* Date Tag */}
                          <div style={{
                            fontSize: '0.75em',
                            padding: '4px 8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: '12px',
                            color: 'var(--primary)',
                            fontWeight: '500',
                            fontFamily: 'One UI Sans'
                          }}>
                            {new Date(post.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          
                          {/* Categories */}
                          {post.categories && post.categories.length > 0 && (
                            <div style={{
                              fontSize: '0.75em',
                              padding: '4px 8px',
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              borderRadius: '12px',
                              color: 'var(--primary)',
                              fontWeight: '500'
                            }}>
                              {post.categories.map((catId: number) => categoryMap[catId]).filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Image Thumbnail - Right Side (Desktop) / Above Text (Mobile) */}
                    {featuredImageUrl && (
                      <>
                        {/* Desktop Layout - Right Side */}
                        <div className="blog-card-desktop-thumbnail blog-card-thumbnail" style={{ 
                          flexShrink: 0,
                          width: '120px',
                          height: '80px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <img 
                            src={featuredImageUrl} 
                            alt="Featured image"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        </div>
                        
                        {/* Mobile Layout - Above Text */}
                        <div className="blog-card-mobile-thumbnail" style={{ 
                          width: '100%',
                          height: '120px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative',
                          marginBottom: '12px'
                        }}>
                          <img 
                            src={featuredImageUrl} 
                            alt="Featured image"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
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
        <div className="blank-div">
          <div className="container1">
            <div className="title">No Posts Found</div>
          </div>
          <div className="container settings">
            <div className="body-text">
              <p>No articles match your search. Try different keywords.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

