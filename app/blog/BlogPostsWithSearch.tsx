'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '../../lib/blog';
import { useBlogSearch } from './BlogSearchWrapper';

interface BlogPostsWithSearchProps {
  categoryMap: Record<string, string>;
}

export default function BlogPostsWithSearch({ categoryMap }: BlogPostsWithSearchProps) {
  const { filteredPosts, activeYear } = useBlogSearch();
  const [featuredImages, setFeaturedImages] = useState<Map<string, string | null>>(new Map());
  const [slideState, setSlideState] = useState<'idle' | 'out' | 'in'>('idle');
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>(filteredPosts);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const prevYear = useRef(activeYear);

  useEffect(() => {
    if (prevYear.current !== activeYear) {
      const dir = activeYear === 'year2' ? 'left' : 'right';
      setSlideDirection(dir);
      setSlideState('out');

      const timer = setTimeout(() => {
        setDisplayedPosts(filteredPosts);
        setSlideState('in');

        const inTimer = setTimeout(() => {
          setSlideState('idle');
        }, 300);
        return () => clearTimeout(inTimer);
      }, 250);

      prevYear.current = activeYear;
      return () => clearTimeout(timer);
    } else {
      setDisplayedPosts(filteredPosts);
    }
  }, [activeYear, filteredPosts]);

  useEffect(() => {
    const allPosts = [...filteredPosts, ...displayedPosts];
    const imageMap = new Map<string, string | null>();
    allPosts.forEach((post) => {
      if (!imageMap.has(post.id)) {
        imageMap.set(post.id, post.featuredImageUrl);
      }
    });
    setFeaturedImages(imageMap);
  }, [filteredPosts, displayedPosts]);

  const getSlideTransform = () => {
    if (slideState === 'out') {
      return slideDirection === 'left'
        ? 'translateX(-6%) scale(0.98)'
        : 'translateX(6%) scale(0.98)';
    }
    if (slideState === 'in') {
      return 'translateX(0) scale(1)';
    }
    return 'translateX(0) scale(1)';
  };

  const getSlideOpacity = () => {
    if (slideState === 'out') return 0;
    return 1;
  };

  return (
    <>
      <div
        className="blog-posts-slide-wrapper"
        style={{
          transform: getSlideTransform(),
          opacity: getSlideOpacity(),
        }}
      >
        {displayedPosts.length > 0 ? (
          <div className="section">
            <div className="list-group">
              {displayedPosts.map((post) => {
                const featuredImageUrl = featuredImages.get(post.id);
                
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="list">
                    <div className="blog-card-container" style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      alignItems: 'flex-start',
                      width: '100%'
                    }}>
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
                            <div style={{
                              fontSize: '0.75em',
                              padding: '4px 8px',
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                              borderRadius: 'var(--br-sm)',
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
                            
                            {post.categories && post.categories.length > 0 && (
                              <div style={{
                                fontSize: '0.75em',
                                padding: '4px 8px',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                borderRadius: 'var(--br-sm)',
                                color: 'var(--primary)',
                                fontWeight: '500'
                              }}>
                                {post.categories.map((catSlug: string) => categoryMap[catSlug]).filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {featuredImageUrl && (
                        <>
                          <div className="blog-card-desktop-thumbnail blog-card-thumbnail" style={{ 
                            flexShrink: 0,
                            width: '120px',
                            height: '80px',
                            borderRadius: 'var(--br-sm)',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <Image
                              src={featuredImageUrl}
                              alt="Featured image"
                              fill
                              sizes="120px"
                              style={{ objectFit: 'cover' }}
                              unoptimized={false}
                            />
                          </div>

                          <div className="blog-card-mobile-thumbnail" style={{ 
                            width: '100%',
                            height: '120px',
                            borderRadius: 'var(--br-sm)',
                            overflow: 'hidden',
                            position: 'relative',
                            marginBottom: '12px'
                          }}>
                            <Image
                              src={featuredImageUrl}
                              alt="Featured image"
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
