import type { Metadata } from "next";
import { cache, Suspense } from "react";
import Image from "next/image";
import { fetchAllBlogPosts, fetchBlogPostBySlug, fetchBlogPostFeaturedImage, type BlogPost } from "../../../lib/blog";
import { notFound } from "next/navigation";
import LightboxClient from "../../components/LightboxClient";
import { LoadingDots } from "../../components/LoadingAnim";
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
