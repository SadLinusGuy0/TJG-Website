import type { Metadata } from "next";
import { cache, Suspense } from "react";
import Image from "next/image";
import { fetchAllPosts, fetchPostBySlug, fetchPageBySlug, getFeaturedImageUrlAsync } from "../../../lib/wordpress";
import type { WPPost } from "../../../lib/wordpress";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import LightboxClient from "../../components/LightboxClient";
import Link from "next/link";
import TableOfContents from "../TableOfContents";
import BlogContent from "../BlogContent";
import PostSearchBar from "../PostSearchBar";
import { FMP_SLUG, extractH1Sections } from "../../../lib/fmpSections";
import { getInPostSearchBarEnabled } from "../../../lib/getInPostSearchBarFlag";
import { getInPostSearchBarFmpEnabled } from "../../../lib/getInPostSearchBarFmpFlag";
import { getWordpressSourceUrl } from "../../../lib/getWordpressSourceUrlFlag";
import ForceRefreshButton from "./ForceRefreshButton";

export const revalidate = 300;

// Pre-build all known post slugs at deploy time; new posts fall back to SSR
export async function generateStaticParams() {
  try {
    const posts = await fetchAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Cached so generateMetadata and BlogPostBody share one fetch per request
const getContentForSlug = cache(async (slug: string, apiBaseUrl?: string): Promise<WPPost | null> => {
  try {
    const post = await fetchPostBySlug(slug, apiBaseUrl);
    if (post) return post;
    return await fetchPageBySlug(slug, apiBaseUrl);
  } catch (error) {
    console.error(`Failed to fetch content for slug "${slug}":`, error);
    return null;
  }
});

function stripHtmlAndDecode(value?: string): string {
  if (!value) return "";
  const withoutTags = value.replace(/<[^>]*>/g, " ");
  const decoded = withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
  return decoded;
}

function truncate(value: string, maxLength = 160): string {
  if (value.length <= maxLength) return value;
  const sliceLength = Math.max(0, maxLength - 3);
  return `${value.slice(0, sliceLength).trimEnd()}...`;
}

function getFeaturedImageAltText(post: WPPost): string | undefined {
  return post._embedded?.['wp:featuredmedia']?.[0]?.alt_text?.trim() || undefined;
}

function countWords(content: string): number {
  const text = stripHtmlAndDecode(content);
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

function countWordsAboveMarker(content: string, marker: string): number {
  const idx = content.indexOf(marker);
  if (idx === -1) return 0;
  const contentAbove = content.substring(0, idx);
  return countWords(contentAbove);
}

function processContentWithEmbeds(content: string): string {
  // Define embed mappings - keyphrase to embed HTML
  const embedMap: Record<string, string> = {
    'story-mindmap': `
      <div class="figma-wrapper">
        <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/JFh3pE1bu21Ad74KUibZug/Unit-4---Storytelling?node-id=0-1&embed-host=share" allowfullscreen></iframe>
      </div>
    `,
    'gdd-results': `
      <div class="figma-wrapper">
        <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://forms.office.com/Pages/AnalysisPage.aspx?AnalyzerToken=Svsr8OjeTHhXu0MsS6MiWcVyyd1M3BbD&id=0JsvSSEvbkyhotOQXlsYcw32xjNmmxRNrKwdPrtn9KRUM0s1OEFZWFZLOUNLNklZRThROFc3U1ZQOS4u" allowfullscreen></iframe>
      </div>
    `,
    'story-results': `
      <div class="figma-wrapper">
        <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://forms.office.com/Pages/AnalysisPage.aspx?AnalyzerToken=etTOj7nVjPy1Bt4CWPzEeAfutjr6345P&id=0JsvSSEvbkyhotOQXlsYcw32xjNmmxRNrKwdPrtn9KRUNlJPUklRRlRXSDVCUkRCVUZMT1RINTRJTS4u" allowfullscreen></iframe>
      </div>
    `,
    'google-doc-name': `
      <div class="figma-wrapper">
        <iframe src="https://docs.google.com/document/d/e/2PACX-1vRZR3r5IoEGDi0okO7E-GHVfb9yPtadU3H8v6urWH_bvpmze1qFmm_OZL_63jmjGfiG7ML-ahpuoSPC/pub?embedded=true"></iframe>
      </div>
    `,
    'figma-ux-workflow': `
      <div class="figma-wrapper">
        <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/S8xl4FFql9Q6V4O3S0Zayw/UX-Workflow?node-id=0-1&embed-host=share" allowfullscreen></iframe>
      </div>
    `,
    'maps-embed': `
      <div class="figma-wrapper">
        <iframe src="https://www.google.com/maps/embed?pb=!4v1770888651744!6m8!1m7!1sEwCt_D72XDwMDw9hPLITpA!2m2!1d50.75749897863136!2d-2.076732351682947!3f240.73163492541838!4f-6.098039408431191!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    `,
    'figma-prototype': `
      <div class="figma-wrapper">
        <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="800" src="https://embed.figma.com/proto/mCrLxeF17zSEftGhESIB9u/One-UI-Setup-Flow?page-id=1%3A2&node-id=14-772&p=f&viewport=-4%2C538%2C0.13&scaling=min-zoom&content-scaling=responsive&starting-point-node-id=14%3A772&embed-host=share" allowfullscreen></iframe>
      </div>
    `,
    'fmp-pitch-embed': `
      <div class="figma-wrapper">
        <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="600" src="https://embed.figma.com/deck/tovF81JJShr77717qeJ883/FMP-Proposal?node-id=1-28&p=f&viewport=493%2C302%2C0.3&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&embed-host=share" allowfullscreen></iframe>
      </div>
    `,
    'fmp-mindmap': `
      <div class="figma-wrapper">
      <iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/B9dwuVyhvqnIYIyi2NypXd/FMP-Moodboard?node-id=0-1&embed-host=share" allowfullscreen></iframe>
      </div>
    `,
    // Add more embeds here as needed
    // 'story-mindmap': '<div class="embed-wrapper">...</div>',
  };

  let processedContent = content;

  // Replace each keyphrase with its corresponding embed
  Object.entries(embedMap).forEach(([keyphrase, embedHtml]) => {
    processedContent = processedContent.replace(keyphrase, embedHtml);
  });

  // Replace "word-count" with a placeholder for the WordCounter component (rendered in BlogContent)
  const wordCountMarker = "word-count";
  const wordCounterPlaceholder = "{{WORD_COUNTER}}";
  if (processedContent.includes(wordCountMarker)) {
    const wordsAbove = countWordsAboveMarker(processedContent, wordCountMarker);
    processedContent = processedContent.replace(wordCountMarker, `${wordCounterPlaceholder}:${wordsAbove}`);
  }

  return processedContent;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const { slug } = await props.params;
    const apiBaseUrl = await getWordpressSourceUrl();
    const content = await getContentForSlug(slug, apiBaseUrl);

    if (!content) {
      return {
        title: "Blog Post | That Josh Guy",
        description: "Explore the latest stories from That Josh Guy.",
      };
    }

    const titleText = stripHtmlAndDecode(content.title?.rendered) || "That Josh Guy";
    const excerptText = stripHtmlAndDecode(content.excerpt?.rendered);
    const fallbackDescription = stripHtmlAndDecode(content.content?.rendered);
    const description = truncate(excerptText || fallbackDescription || "Explore the latest stories from That Josh Guy.");

    let featuredImageUrl: string | null = null;
    try {
      featuredImageUrl = await getFeaturedImageUrlAsync(content, apiBaseUrl);
    } catch (error) {
      console.error('Error fetching featured image:', error);
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
        canonical: content.link || undefined,
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
    <div className="index">
      <div className="containers">
        {/* Navigation renders immediately — client component, no server data */}
        <Navigation hideMobile={true} />
        <div className="main-content">
          {/* Post body streams in; skeleton fallback keeps layout stable */}
          <Suspense fallback={<BlogPostBodySkeleton />}>
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
      <div className="container settings" style={{ padding: 0, marginBottom: 0, maxWidth: '100%' }}>
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
  const apiBaseUrl = await getWordpressSourceUrl();
  const content = await getContentForSlug(slug, apiBaseUrl);
  if (!content) return notFound();

  const [featuredImageUrl, searchBarEnabled, searchBarFmpEnabled] = await Promise.all([
    getFeaturedImageUrlAsync(content, apiBaseUrl),
    getInPostSearchBarEnabled(),
    getInPostSearchBarFmpEnabled(),
  ]);

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
            <TableOfContents content={content.content?.rendered || ''} />
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
                  <span>{countWords(content.content?.rendered || '').toLocaleString()} words</span>
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
                  <span>{countWords(content.content?.rendered || '').toLocaleString()} words</span>
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
        <FmpSectionButtons content={content.content?.rendered || ''} slug={slug} />
      ) : (
        <div className="container settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%' }}>
          <BlogContent content={processContentWithEmbeds(content.content?.rendered || '')} />
        </div>
      )}
      {(searchBarEnabled || (searchBarFmpEnabled && slug === FMP_SLUG)) && (
        <PostSearchBar />
      )}
    </>
  );
}

function FmpSectionButtons({ content, slug }: { content: string; slug: string }) {
  const sections = extractH1Sections(content);

  if (sections.length === 0) {
    return (
      <div className="container settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%' }}>
        <BlogContent content={processContentWithEmbeds(content)} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div className="list-group">
        {sections.map((section) => (
          <Link
            key={section.slug}
            href={`/blog/${slug}/${section.slug}`}
            className="list3"
            style={{
              justifyContent: 'space-between',
              textDecoration: 'none',
              fontWeight: 600,
              fontFamily: "'One UI Sans', sans-serif",
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontFamily: "'One UI Sans', sans-serif" }}>{section.title}</span>
            <div className="list-item-separator" />
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, opacity: 0.45 }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M0.43584 1.15216C0.14084 0.861162 0.13684 0.386162 0.42784 0.091162C0.71884 -0.202838 1.19384 -0.205838 1.48884 0.085162L9.26684 7.75516C9.60284 8.08616 9.78784 8.52916 9.78784 9.00116C9.78784 9.47216 9.60284 9.91616 9.26684 10.2472L1.48884 17.9162C1.34284 18.0592 1.15284 18.1312 0.96184 18.1312C0.76884 18.1312 0.57484 18.0562 0.42784 17.9082C0.13684 17.6132 0.14084 17.1382 0.43584 16.8472L8.21284 9.17816C8.27884 9.11516 8.28784 9.04016 8.28784 9.00116C8.28784 8.96216 8.27884 8.88616 8.21284 8.82316L0.43584 1.15216Z" fill="currentColor"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* Disclaimer — update name and email below */}
      <div style={{
        marginTop: 24,
        padding: '20px 20px',
        borderRadius: 'var(--br-9xl)',
        background: 'var(--container-background)',
        fontFamily: "'One UI Sans', sans-serif",
        fontSize: '0.875rem',
        lineHeight: 1.6,
        color: 'var(--secondary)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          I confirm that the following website and associated work within is all my own work and does not include any work completed by anyone else other than myself.
        </p>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>
          Josh Skinner<br />
          <a href="mailto:10694305@student.bpc.ac.uk" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            10694305@student.bpc.ac.uk
          </a>
        </p>
      </div>
    </div>
  );
}
