import { fetchPostBySlug, fetchPageBySlug, getFeaturedImageUrlAsync } from "../../../lib/wordpress";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import Link from "next/link";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost(props: PageProps) {
  const { slug } = await props.params;
  
  // Try to fetch as post first, then as page
  let content = null;
  
  try {
    content = await fetchPostBySlug(slug);
    if (!content) {
      content = await fetchPageBySlug(slug);
    }
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return notFound();
  }
  
  if (!content) return notFound();
  const featuredImageUrl = await getFeaturedImageUrlAsync(content);
  
  // Debug logging (remove in production)
  console.log('Post content:', {
    id: content.id,
    title: content.title.rendered,
    featured_media: content.featured_media,
    hasEmbedded: !!content._embedded?.['wp:featuredmedia'],
    embeddedMedia: content._embedded?.['wp:featuredmedia'],
    featuredImageUrl
  });
  
  return (
    <div className="index">
      <style dangerouslySetInnerHTML={{
        __html: `
          .body-text p {
            margin: 0 0 8px 0 !important;
          }
          .body-text p:last-child {
            margin-bottom: 0 !important;
          }
          .body-text p:has(img) {
            margin: 0 !important;
            padding: 0 !important;
          }
          .body-text * {
            max-width: 100% !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
          .body-text img {
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            border-radius: 28px !important;
            display: block !important;
            margin: 16px 0 !important;
            padding: 0 !important;
          }
          .wp-block-image {
            margin: 16px 0 !important;
          }
          .wp-block-image img {
            border-radius: 28px !important;
          }
          .body-text pre {
            overflow-x: auto !important;
            white-space: pre-wrap !important;
          }
        `
      }} />
      <div className="containers">
        <Navigation />
        <div className="main-content" style={{ paddingTop: 0 }}>
          <div className="top-app-bar">
            <div className="top-app-bar-container back-only">
              <Link href="/blog" className="top-app-bar-icon" aria-label="Back">
                <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Featured Image with Title Overlay or Placeholder */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: 'clamp(300px, 40vh, 500px)',
            marginTop: '16px',
            marginBottom: '16px',
            borderRadius: '28px',
            overflow: 'hidden'
          }}>
            {featuredImageUrl ? (
              <>
                <img 
                  src={featuredImageUrl} 
                  alt="Featured image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    margin: 0
                  }}
                />
                {/* Title and Date Container */}
                <div style={{
                  position: 'absolute',
                  bottom: 'clamp(16px, 4vw, 32px)',
                  left: 'clamp(16px, 4vw, 32px)',
                  right: 'clamp(16px, 4vw, 32px)'
                }}>
                  <div style={{ 
                    color: 'white', 
                    maxWidth: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <h1 style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                      fontWeight: 'bold',
                      margin: 0,
                      marginBottom: '8px',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                      lineHeight: '1.2'
                    }} dangerouslySetInnerHTML={{ __html: content.title.rendered }} />
                    <div style={{
                      fontSize: '1rem',
                      opacity: 0.9,
                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
                      fontWeight: '500'
                    }}>
                      {new Date(content.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Placeholder for missing featured image */
              <div style={{
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {/* Title and Date Container for placeholder */}
                <div style={{
                  position: 'absolute',
                  bottom: 'clamp(16px, 4vw, 32px)',
                  left: 'clamp(16px, 4vw, 32px)',
                  right: 'clamp(16px, 4vw, 32px)'
                }}>
                  <div style={{ 
                    color: 'var(--primary)', 
                    maxWidth: '100%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h1 style={{
                      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                      fontWeight: 'bold',
                      margin: 0,
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }} dangerouslySetInnerHTML={{ __html: content.title.rendered }} />
                    <div style={{
                      fontSize: '1rem',
                      opacity: 0.7,
                      fontWeight: '500'
                    }}>
                      {new Date(content.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Subtle pattern overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
                  `,
                  pointerEvents: 'none'
                }} />
              </div>
            )}
          </div>
          
           <div className="container settings" style={{ padding: '0 20px', marginBottom: '0', maxWidth: '100%', overflow: 'hidden' }}>
             <div className="body-text" style={{ 
               fontSize: '16px', 
               lineHeight: '1.5',
               margin: 0,
               padding: 0,
               wordWrap: 'break-word',
               overflowWrap: 'break-word',
               maxWidth: '100%'
             }} dangerouslySetInnerHTML={{ __html: content.content?.rendered || '' }} />
           </div>
        </div>
      </div>
    </div>
  );
}


