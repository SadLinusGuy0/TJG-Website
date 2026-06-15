import type { Metadata } from "next";
import { cache, Suspense } from "react";
import Image from "next/image";
import { fetchAllBlogPosts, fetchBlogPostBySlug, fetchBlogPostFeaturedImage, type BlogPost } from "../../../lib/blog";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import LightboxClient from "../../components/LightboxClient";
import { LoadingDots } from "../../components/LoadingAnim";
import Link from "next/link";
import BlogContent from "../BlogContent";
import PortableTextContent from "../PortableTextContent";
import PostSearchBar from "../PostSearchBar";
import { FMP_SLUG } from "../../../lib/fmpSections";
import FmpViewWrapper from "./FmpViewWrapper";
import { getInPostSearchBarEnabled } from "../../../lib/getInPostSearchBarFlag";
import { getInPostSearchBarFmpEnabled } from "../../../lib/getInPostSearchBarFmpFlag";
import PostHeroTopAppBar from "./PostHeroTopAppBar";
import { getDisplayWordCount, processContentWithEmbeds } from "../../../lib/blogContentProcessing";
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
    const seoTitle = stripHtmlAndDecode(content.seo?.title) || titleText;
    const excerptText = stripHtmlAndDecode(content.excerpt?.rendered);
    const fallbackDescription = getRenderableText(content);
    const description = truncate(
      stripHtmlAndDecode(content.seo?.description) || excerptText || fallbackDescription || "Explore the latest stories from That Josh Guy.",
    );

    let featuredImageUrl: string | null = content.seo?.openGraphImageUrl || content.featuredImageUrl;
    if (!featuredImageUrl) {
      try {
        featuredImageUrl = await fetchBlogPostFeaturedImage(slug);
      } catch (error) {
        console.error('Error fetching featured image:', error);
      }
    }

    const imageAlt = content.seo?.openGraphImageAlt || getFeaturedImageAltText(content) || seoTitle;

    return {
      title: `${seoTitle} | That Josh Guy`,
      description,
      robots: content.seo?.noIndex ? { index: false, follow: false } : undefined,
      openGraph: {
        title: `${seoTitle} | That Josh Guy`,
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
        title: `${seoTitle} | That Josh Guy`,
        description,
        images: featuredImageUrl ? [featuredImageUrl] : undefined,
      },
      alternates: {
        canonical: content.seo?.canonicalUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thatjoshguy.me'}/blog/${slug}`,
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
      <div className="top-app-bar post-hero-app-bar">
        <div className="top-app-bar-container back-only">
          <Link href="/blog" className="top-app-bar-icon" aria-label="Back">
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
            </svg>
          </Link>
          <div
            className="skeleton-box"
            style={{ width: 80, height: 28, marginLeft: 'auto', borderRadius: 'var(--br-xl)' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Hero image skeleton */}
      <div
        className="post-hero-card post-hero-card--loading skeleton-box"
        style={{
          height: 'clamp(280px, 38vh, 460px)',
        }}
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
  const displayedWordCount = getDisplayWordCount(content.wordCount, legacyHtml || portablePlainText);
  const titleText = stripHtmlAndDecode(content.title?.rendered) || "Blog Post";

  return (
    <>
      <PostHeroTopAppBar content={tocContent} slug={slug} title={titleText} />

      {/* Featured Image with Title Overlay */}
      <div className="post-hero-card">
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
            <div className="post-hero-gradient" />
            <div className="post-hero-text">
              <h1
                className="post-hero-title"
                dangerouslySetInnerHTML={{ __html: content.title.rendered }}
              />
              <div className="post-hero-meta">
                <span className="post-hero-chip">
                  {new Date(content.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="post-hero-chip">
                  {displayedWordCount.toLocaleString()} words
                </span>
                {content.categories
                  .filter(c => c !== 'uncategorized')
                  .map(cat => (
                    <span key={cat} className="post-hero-chip post-hero-chip--category">
                      {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="post-hero-fallback">
            <h1
              className="post-hero-title"
              style={{ color: 'var(--primary)' }}
              dangerouslySetInnerHTML={{ __html: content.title.rendered }}
            />
            <div className="post-hero-meta">
              <span className="post-hero-chip" style={{ background: 'var(--background)' }}>
                {new Date(content.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="post-hero-chip" style={{ background: 'var(--background)' }}>
                {displayedWordCount.toLocaleString()} words
              </span>
              {content.categories
                .filter(c => c !== 'uncategorized')
                .map(cat => (
                  <span key={cat} className="post-hero-chip post-hero-chip--category">
                    {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
            </div>
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
