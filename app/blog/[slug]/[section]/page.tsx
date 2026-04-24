import type { Metadata } from "next";
import { cache, Suspense } from "react";
import Image from "next/image";
import { fetchPostBySlug, fetchPageBySlug, getFeaturedImageUrlAsync } from "../../../../lib/wordpress";
import type { WPPost } from "../../../../lib/wordpress";
import { notFound } from "next/navigation";
import Navigation from "../../../components/Navigation";
import Link from "next/link";
import LightboxClient from "../../../components/LightboxClient";
import TableOfContents from "../../TableOfContents";
import BlogContent from "../../BlogContent";
import { FMP_SLUG, extractH1Sections } from "../../../../lib/fmpSections";
import { getWordpressSourceUrl } from "../../../../lib/getWordpressSourceUrlFlag";
import { replaceTransitModelPlaceholder } from "../../../../lib/transitModelSketchfabEmbed";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string; section: string }>;
}

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
  return withoutTags
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
}

function countWords(content: string): number {
  const text = stripHtmlAndDecode(content);
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function countWordsAboveMarker(content: string, marker: string): number {
  const idx = content.indexOf(marker);
  if (idx === -1) return 0;
  return countWords(content.substring(0, idx));
}

function processContentWithEmbeds(content: string): string {
  const embedMap: Record<string, string> = {
    'story-mindmap': `<div class="figma-wrapper"><iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/JFh3pE1bu21Ad74KUibZug/Unit-4---Storytelling?node-id=0-1&embed-host=share" allowfullscreen></iframe></div>`,
    'gdd-results': `<div class="figma-wrapper"><iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://forms.office.com/Pages/AnalysisPage.aspx?AnalyzerToken=Svsr8OjeTHhXu0MsS6MiWcVyyd1M3BbD&id=0JsvSSEvbkyhotOQXlsYcw32xjNmmxRNrKwdPrtn9KRUM0s1OEFZWFZLOUNLNklZRThROFc3U1ZQOS4u" allowfullscreen></iframe></div>`,
    'story-results': `<div class="figma-wrapper"><iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://forms.office.com/Pages/AnalysisPage.aspx?AnalyzerToken=etTOj7nVjPy1Bt4CWPzEeAfutjr6345P&id=0JsvSSEvbkyhotOQXlsYcw32xjNmmxRNrKwdPrtn9KRUNlJPUklRRlRXSDVCUkRCVUZMT1RINTRJTS4u" allowfullscreen></iframe></div>`,
    'google-doc-name': `<div class="figma-wrapper"><iframe src="https://docs.google.com/document/d/e/2PACX-1vRZR3r5IoEGDi0okO7E-GHVfb9yPtadU3H8v6urWH_bvpmze1qFmm_OZL_63jmjGfiG7ML-ahpuoSPC/pub?embedded=true"></iframe></div>`,
    'figma-ux-workflow': `<div class="figma-wrapper"><iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/S8xl4FFql9Q6V4O3S0Zayw/UX-Workflow?node-id=0-1&embed-host=share" allowfullscreen></iframe></div>`,
    'maps-embed': `<div class="figma-wrapper"><iframe src="https://www.google.com/maps/embed?pb=!4v1770888651744!6m8!1m7!1sEwCt_D72XDwMDw9hPLITpA!2m2!1d50.75749897863136!2d-2.076732351682947!3f240.73163492541838!4f-6.098039408431191!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`,
    'figma-prototype': `<div class="figma-wrapper"><iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="800" src="https://embed.figma.com/proto/mCrLxeF17zSEftGhESIB9u/One-UI-Setup-Flow?page-id=1%3A2&node-id=14-772&p=f&viewport=-4%2C538%2C0.13&scaling=min-zoom&content-scaling=responsive&starting-point-node-id=14%3A772&embed-host=share" allowfullscreen></iframe></div>`,
    'fmp-pitch-embed': `<div class="figma-wrapper"><iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="600" src="https://embed.figma.com/deck/tovF81JJShr77717qeJ883/FMP-Proposal?node-id=1-28&p=f&viewport=493%2C302%2C0.3&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&embed-host=share" allowfullscreen></iframe></div>`,
    'fmp-mindmap': `<div class="figma-wrapper"><iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/B9dwuVyhvqnIYIyi2NypXd/FMP-Moodboard?node-id=0-1&embed-host=share" allowfullscreen></iframe></div>`,
  };

  let processedContent = content;
  Object.entries(embedMap).forEach(([keyphrase, embedHtml]) => {
    processedContent = processedContent.replace(keyphrase, embedHtml);
  });

  const wordCountMarker = "word-count";
  const wordCounterPlaceholder = "{{WORD_COUNTER}}";
  if (processedContent.includes(wordCountMarker)) {
    const wordsAbove = countWordsAboveMarker(processedContent, wordCountMarker);
    processedContent = processedContent.replace(wordCountMarker, `${wordCounterPlaceholder}:${wordsAbove}`);
  }

  processedContent = replaceTransitModelPlaceholder(processedContent);

  return processedContent;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const { slug, section } = await props.params;
    const apiBaseUrl = await getWordpressSourceUrl();
    const content = await getContentForSlug(slug, apiBaseUrl);
    if (!content) {
      return { title: "Section | That Josh Guy" };
    }

    const sections = extractH1Sections(content.content?.rendered || '');
    const matched = sections.find(s => s.slug === section);
    const sectionTitle = matched?.title || section;
    const postTitle = stripHtmlAndDecode(content.title?.rendered) || "That Josh Guy";

    return {
      title: `${sectionTitle} - ${postTitle} | That Josh Guy`,
      description: `${sectionTitle} section of ${postTitle}.`,
    };
  } catch {
    return { title: "Section | That Josh Guy" };
  }
}

export default async function SectionPage(props: PageProps) {
  const { slug, section } = await props.params;

  return (
    <div className="index">
      <div className="containers">
        <Navigation hideMobile={true} />
        <div className="main-content">
          <Suspense fallback={<SectionSkeleton />}>
            <SectionBody slug={slug} section={section} />
          </Suspense>
        </div>
      </div>
      <LightboxClient />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <>
      <div className="top-app-bar">
        <div className="top-app-bar-container back-only">
          <Link href={`/blog/${FMP_SLUG}`} className="top-app-bar-icon" aria-label="Back">
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
            </svg>
          </Link>
        </div>
      </div>
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
      <div className="container settings" style={{ padding: 0, marginBottom: 0, maxWidth: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 10px' }}>
          {[90, 100, 85, 100, 75, 100, 60].map((w, i) => (
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

async function SectionBody({ slug, section }: { slug: string; section: string }) {
  const apiBaseUrl = await getWordpressSourceUrl();
  const content = await getContentForSlug(slug, apiBaseUrl);
  if (!content) return notFound();

  const sections = extractH1Sections(content.content?.rendered || '');
  const matched = sections.find(s => s.slug === section);
  if (!matched) return notFound();

  const featuredImageUrl = await getFeaturedImageUrlAsync(content, apiBaseUrl);
  const sectionContent = processContentWithEmbeds(
    matched.html.replace(/^<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '')
  );

  return (
    <>
      <div className="top-app-bar">
        <div className="top-app-bar-container back-only">
          <Link href={`/blog/${slug}`} className="top-app-bar-icon" aria-label="Back">
            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
            </svg>
          </Link>
          <TableOfContents content={matched.html} />
        </div>
      </div>

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
                }}>{matched.title}</h1>
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
                  <span>{stripHtmlAndDecode(content.title?.rendered)}</span>
                  <span style={{ opacity: 0.7 }}>·</span>
                  <span>{countWords(matched.html).toLocaleString()} words</span>
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
                }}>{matched.title}</h1>
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
                  <span>{stripHtmlAndDecode(content.title?.rendered)}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{countWords(matched.html).toLocaleString()} words</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="container settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%' }}>
        <BlogContent content={sectionContent} />
      </div>
    </>
  );
}
