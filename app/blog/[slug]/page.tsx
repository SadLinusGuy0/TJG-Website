import type { Metadata } from "next";
import { cache, Suspense } from "react";
import Image from "next/image";
import { fetchAllBlogPosts, fetchBlogPostBySlug, fetchBlogPostFeaturedImage, type BlogPost } from "../../../lib/blog";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import LightboxClient from "../../components/LightboxClient";
import { LoadingDots } from "../../components/LoadingAnim";
import Link from "next/link";
import TableOfContents from "../TableOfContents";
import BlogContent from "../BlogContent";
import PortableTextContent from "../PortableTextContent";
import PostSearchBar from "../PostSearchBar";
import { FMP_SLUG } from "../../../lib/fmpSections";
import FmpViewWrapper from "./FmpViewWrapper";
import { getInPostSearchBarEnabled } from "../../../lib/getInPostSearchBarFlag";
import { getInPostSearchBarFmpEnabled } from "../../../lib/getInPostSearchBarFmpFlag";
import ForceRefreshButton from "./ForceRefreshButton";
import { countWords, processContentWithEmbeds } from "../../../lib/blogContentProcessing";
import { portableTextToPlainText, stripHtmlAndDecode } from "../../../lib/portableText";

export const revalidate = 300;

// Pre-build all known post slugs at deploy time; new posts fall back to SSR
export async function generateStaticParams() {
  try {
    const posts = await fetchAllBlogPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getContentForSlug = cache(async (slug: string): Promise<BlogPost | null> => {
  try {
    return await fetchBlogPostBySlug(slug);
  } catch (error) {
    console.error(`Failed to fetch content for slug "${slug}":`, error);
    return null;
  }
});

function truncate(value: string, maxLength = 160): string {
  if (value.length <= maxLength) return value;
  const sliceLength = Math.max(0, maxLength - 3);
  return `${value.slice(0, sliceLength).trimEnd()}...`;
}

function getFeaturedImageAltText(post: BlogPost): string | undefined {
  return post.featuredImageAlt;
}

function getRenderableText(post: BlogPost): string {
  return post.contentSource === 'portableText'
    ? portableTextToPlainText(post.portableBody)
    : stripHtmlAndDecode(post.content?.rendered);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const { slug } = await props.params;
    const content = await getContentForSlug(slug);

    if (!content) {
      return {
        title: "Blog Post | That Josh Guy",
        description: "Explore the latest stories from That Josh Guy.",
      };
    }

    const titleText = stripHtmlAndDecode(content.title?.rendered) || "That Josh Guy";
    const excerptText = stripHtmlAndDecode(content.excerpt?.rendered);
    const fallbackDescription = getRenderableText(content);
    const description = truncate(excerptText || fallbackDescription || "Explore the latest stories from That Josh Guy.");

    let featuredImageUrl: string | null = content.featuredImageUrl;
    if (!featuredImageUrl) {
      try {
        featuredImageUrl = await fetchBlogPostFeaturedImage(slug);
      } catch (error) {
        console.error('Error fetching featured image:', error);
      }
    }

    const imageAlt = getFeaturedImageAltText(content) || titleText;

    return {
      title: `${titleText} | That Josh Guy`,
      description,
      openGraph: {
        title: `${titleText} | That Josh Guy`,
        description,
        type: "article",
        images: featuredImageUrl
          ? [
              {
                url: featuredImageUrl,
                alt: imageAlt,
              },
            ]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${titleText} | That Josh Guy`,
        description,
        images: featuredImageUrl ? [featuredImageUrl] : undefined,
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thatjoshguy.me'}/blog/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Blog Post | That Josh Guy",
      description: "Explore the latest stories from That Josh Guy.",
    };
  }
}

export default async function BlogPost(props: PageProps) {
  const { slug } = await props.params;

  return (
    <div className="page">
      <div className="page-body">
        {/* Navigation renders immediately — client component, no server data */}
        <Navigation hideMobile={true} />
        <div className="main-content">
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <LoadingDots />
            </div>
          }>
            <BlogPostBody slug={slug} />
          </Suspense>
        </div>
      </div>
      {/* LightboxClient is a client component — renders immediately */}
      <LightboxClient />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton shown while the post is fetching
// ---------------------------------------------------------------------------
function BlogPostBodySkeleton() {
  return (
    <>
      {/* Top app bar */}
      <div className="top-app-bar">
        <div className="top-app-bar-container back-only">
          <Link href="/blog" className="top-app-bar-icon" aria-label="Back">
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
            </svg>
          </Link>
          {/* TOC pill placeholder */}
          <div
            className="skeleton-box"
            style={{ width: 80, height: 28, marginLeft: 'auto', borderRadius: 'var(--br-xl)' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Hero image skeleton */}
      <div
        className="skeleton-box"
        style={{
          width: '100%',
          height: 'clamp(300px, 40vh, 500px)',
          marginTop: 16,
          marginBottom: 16,
          borderRadius: 'var(--br-9xl)',
        }}
        aria-hidden="true"
      />

      {/* Article body skeleton */}
      <div className="panel settings" style={{ padding: 0, marginBottom: 0, maxWidth: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 10px' }}>
          {[90, 100, 85, 100, 75, 100, 60, 100, 88, 100, 70].map((w, i) => (
            <div
              key={i}
              className="skeleton-box"
              style={{ height: 14, width: `${w}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Async component: fetches the post and renders the full content
// ---------------------------------------------------------------------------
async function BlogPostBody({ slug }: { slug: string }) {
  const content = await getContentForSlug(slug);
  if (!content) return notFound();

  const [resolvedFeaturedImage, searchBarEnabled, searchBarFmpEnabled] = await Promise.all([
    content.featuredImageUrl ? Promise.resolve(content.featuredImageUrl) : fetchBlogPostFeaturedImage(slug),
    getInPostSearchBarEnabled(),
    getInPostSearchBarFmpEnabled(),
  ]);
  const featuredImageUrl = resolvedFeaturedImage;
  const legacyHtml = content.content?.rendered || '';
  const portablePlainText = portableTextToPlainText(content.portableBody);
  const tocContent = legacyHtml || portablePlainText;
  const displayedWordCount = content.wordCount ?? countWords(legacyHtml || portablePlainText);

  return (
    <>
      {/* Top app bar with real back button + Table of Contents */}
      <div className="top-app-bar">
        <div className="top-app-bar-container back-only">
          <Link href="/blog" className="top-app-bar-icon" aria-label="Back">
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
            </svg>
          </Link>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TableOfContents content={tocContent} />
            <ForceRefreshButton slug={slug} />
          </div>
        </div>
      </div>

      {/* Featured Image with Title Overlay */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(300px, 40vh, 500px)',
        marginTop: '16px',
        marginBottom: '16px',
        borderRadius: 'var(--br-9xl)',
        overflow: 'hidden'
      }}>
        {featuredImageUrl ? (
          <>
            <Image
              src={featuredImageUrl}
              alt="Featured image"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              style={{ objectFit: 'cover' }}
            />
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
                borderRadius: 'var(--br-sm)',
                backdropFilter: 'blur(10px)'
              }}>
                <h1 style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                  fontWeight: 'bold',
                  margin: 0,
                  marginBottom: '8px',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                  lineHeight: '1.2',
                  fontFamily: 'One UI Sans'
                }} dangerouslySetInnerHTML={{ __html: content.title.rendered }} />
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.9,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
                  fontWeight: '500',
                  fontFamily: 'One UI Sans',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <span>{new Date(content.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span style={{ opacity: 0.7 }}>•</span>
                  <span>{displayedWordCount.toLocaleString()} words</span>
                </div>
              </div>
            </div>
          </>
        ) : (
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
                borderRadius: 'var(--br-sm)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <h1 style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                  fontWeight: 'bold',
                  margin: 0,
                  marginBottom: '8px',
                  lineHeight: '1.2',
                  fontFamily: 'One UI Sans'
                }} dangerouslySetInnerHTML={{ __html: content.title.rendered }} />
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.7,
                  fontWeight: '500',
                  fontFamily: 'One UI Sans',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <span>{new Date(content.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span style={{ opacity: 0.5 }}>•</span>
                  <span>{displayedWordCount.toLocaleString()} words</span>
                </div>
              </div>
            </div>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
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

      {slug === FMP_SLUG ? (
        <FmpViewWrapper
          rawContent={legacyHtml}
          processedContent={processContentWithEmbeds(legacyHtml)}
          slug={slug}
        />
      ) : content.contentSource === 'portableText' ? (
        <div className="panel settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%' }}>
          <PortableTextContent blocks={content.portableBody || []} />
        </div>
      ) : (
        <div className="panel settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%' }}>
          <BlogContent content={processContentWithEmbeds(legacyHtml)} />
        </div>
      )}
      {(searchBarEnabled || (searchBarFmpEnabled && slug === FMP_SLUG)) && (
        <PostSearchBar />
      )}
    </>
  );
}
