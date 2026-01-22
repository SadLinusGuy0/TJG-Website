import type { Metadata } from "next";
import { fetchPostBySlug, fetchPageBySlug, getFeaturedImageUrlAsync } from "../../../lib/wordpress";
import type { WPPost } from "../../../lib/wordpress";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import LightboxClient from "../../components/LightboxClient";
import Link from "next/link";
import TableOfContents from "../TableOfContents";
import BlogContent from "../BlogContent";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getContentForSlug(slug: string): Promise<WPPost | null> {
  try {
    const post = await fetchPostBySlug(slug);
    if (post) return post;
    return await fetchPageBySlug(slug);
  } catch (error) {
    console.error(`Failed to fetch content for slug "${slug}":`, error);
    return null;
  }
}

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
    `
    // Add more embeds here as needed
    // 'story-mindmap': '<div class="embed-wrapper">...</div>',
  };

  let processedContent = content;

  // Replace each keyphrase with its corresponding embed
  Object.entries(embedMap).forEach(([keyphrase, embedHtml]) => {
    processedContent = processedContent.replace(keyphrase, embedHtml);
  });

  return processedContent;
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
    const fallbackDescription = stripHtmlAndDecode(content.content?.rendered);
    const description = truncate(excerptText || fallbackDescription || "Explore the latest stories from That Josh Guy.");
    
    let featuredImageUrl: string | null = null;
    try {
      featuredImageUrl = await getFeaturedImageUrlAsync(content);
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
  const content = await getContentForSlug(slug);

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
            margin: 0 10px 6px 10px !important;
          }
          .body-text p:last-child {
            margin-bottom: 10px !important;
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
          .body-text img:not(.ko-compare__img) {
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            border-radius: 28px !important;
            display: block !important;
            margin: 12px 0 !important;
            padding: 0 !important;
          }

          /* Jetpack Image Compare (before/after) -> custom slider */
          .body-text .ko-compare {
            margin: 24px 0 !important;
          }
          .body-text .ko-compare__viewport {
            --_radius: 28px;
            position: relative !important;
            width: 100% !important;
            aspect-ratio: var(--ar, 16 / 9) !important;
            border-radius: var(--_radius) !important;
            overflow: hidden !important;
            user-select: none !important;
            touch-action: pan-y !important;
            background: rgba(0,0,0,0.06) !important;
          }
          .body-text .ko-compare__img {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            object-fit: cover !important;
            display: block !important;
          }
          .body-text .ko-compare__img--before {
            clip-path: inset(0 calc(100% - var(--pos, 50%)) 0 0) !important;
          }
          .body-text .ko-compare__img--after {
            clip-path: inset(0 0 0 var(--pos, 50%)) !important;
          }
          .body-text .ko-compare__handle {
            position: absolute !important;
            top: 0 !important;
            bottom: 0 !important;
            left: var(--pos, 50%) !important;
            transform: translateX(-50%) !important;
            width: 2px !important;
            background: var(--accent) !important;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.18) !important;
            pointer-events: auto !important;
            cursor: ew-resize !important;
          }
          .body-text .ko-compare__handle::after {
            content: "" !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 34px !important;
            height: 34px !important;
            border-radius: 999px !important;
            background: rgba(23, 23, 26, 0.87) !important;
            border: 1px solid rgba(255,255,255,0.18) !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.35) !important;
          }
          .body-text .ko-compare__handle::before {
            content: "|" !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            color: var(--accent) !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            z-index: 1 !important;
          }
          .wp-block-image {
            margin: 12px 0 !important;
          }
          .wp-block-image img {
            border-radius: 28px !important;
          }
          .body-text pre {
            overflow-x: auto !important;
            white-space: pre-wrap !important;
          }

          /* Blog content heading sizes and spacing */
          .body-text h1 { font-size: 32px !important; margin: 14px 10px 8px 10px !important;}
          .body-text h2 { font-size: 28px !important; margin: 12px 10px 6px 10px !important; }
          .body-text h3 { font-size: 24px !important; margin: 10px 10px 6px 10px !important; }
          .body-text h4 { font-size: 20px !important; margin: 8px 10px 4px 10px !important; }
          .body-text h5 { font-size: 18px !important; margin: 8px 10px 4px 10px !important; }
          .body-text h6 { font-size: 16px !important; margin: 6px 10px 4px 10px !important; }

          /* Lists spacing */
          .body-text ul, .body-text ol { margin: 6px 0 8px 20px !important; }
          .body-text li { margin: 4px 0 !important; }

          /* Gutenberg Gallery */
          .body-text .wp-block-gallery,
          .body-text .blocks-gallery-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            margin: 12px 0 !important;
            padding: 0 !important;
            list-style: none !important;
          }
          /* Respect Gutenberg-provided column counts */
          .body-text .wp-block-gallery.has-1-columns,
          .body-text .blocks-gallery-grid.has-1-columns,
          .body-text .wp-block-gallery.columns-1,
          .body-text .blocks-gallery-grid.columns-1 { grid-template-columns: repeat(1, 1fr) !important; }
          .body-text .wp-block-gallery.has-2-columns,
          .body-text .blocks-gallery-grid.has-2-columns,
          .body-text .wp-block-gallery.columns-2,
          .body-text .blocks-gallery-grid.columns-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .body-text .wp-block-gallery.has-3-columns,
          .body-text .blocks-gallery-grid.has-3-columns,
          .body-text .wp-block-gallery.columns-3,
          .body-text .blocks-gallery-grid.columns-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .body-text .wp-block-gallery.has-4-columns,
          .body-text .blocks-gallery-grid.has-4-columns,
          .body-text .wp-block-gallery.columns-4,
          .body-text .blocks-gallery-grid.columns-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .body-text .wp-block-gallery.has-5-columns,
          .body-text .blocks-gallery-grid.has-5-columns,
          .body-text .wp-block-gallery.columns-5,
          .body-text .blocks-gallery-grid.columns-5 { grid-template-columns: repeat(5, 1fr) !important; }
          .body-text .wp-block-gallery.has-6-columns,
          .body-text .blocks-gallery-grid.has-6-columns,
          .body-text .wp-block-gallery.columns-6,
          .body-text .blocks-gallery-grid.columns-6 { grid-template-columns: repeat(6, 1fr) !important; }
          .body-text .wp-block-gallery.has-7-columns,
          .body-text .blocks-gallery-grid.has-7-columns,
          .body-text .wp-block-gallery.columns-7,
          .body-text .blocks-gallery-grid.columns-7 { grid-template-columns: repeat(7, 1fr) !important; }
          .body-text .wp-block-gallery.has-8-columns,
          .body-text .blocks-gallery-grid.has-8-columns,
          .body-text .wp-block-gallery.columns-8,
          .body-text .blocks-gallery-grid.columns-8 { grid-template-columns: repeat(8, 1fr) !important; }

          /* Slideshow variant: use horizontal scroll with arrows and dots */
          .body-text .wp-block-gallery.is-slideshow,
          .body-text .wp-block-gallery.alignfull.is-style-slideshow,
          .body-text .wp-block-gallery.is-style-slideshow {
            display: block !important;
            position: relative !important;
            margin: 24px 0 !important;
          }
          .body-text .wp-block-gallery.is-slideshow .slideshow-track {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            gap: 8px !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
          }
          .body-text .wp-block-gallery.is-slideshow .slideshow-track::-webkit-scrollbar { display: none !important; }
          .body-text .wp-block-gallery.is-slideshow figure { flex: 0 0 100% !important; scroll-snap-align: center !important; margin: 0 !important; }
          .body-text .wp-block-gallery.is-slideshow img { width: 100% !important; height: auto !important; border-radius: 16px !important; }
          .body-text .wp-block-gallery.is-slideshow .slideshow-arrow { position: absolute !important; top: 50% !important; transform: translateY(-50%) !important; background: rgba(0,0,0,0.6) !important; color: white !important; border: none !important; width: 36px !important; height: 36px !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 2 !important; cursor: pointer !important; }
          .body-text .wp-block-gallery.is-slideshow .slideshow-prev { left: 8px !important; }
          .body-text .wp-block-gallery.is-slideshow .slideshow-next { right: 8px !important; }
          .body-text .wp-block-gallery.is-slideshow .slideshow-dots { display: flex !important; gap: 6px !important; justify-content: center !important; margin-top: 8px !important; }
          .body-text .wp-block-gallery.is-slideshow .slideshow-dot { width: 8px !important; height: 8px !important; border-radius: 50% !important; background: rgba(255,255,255,0.4) !important; border: 1px solid rgba(0,0,0,0.2) !important; }
          .body-text .wp-block-gallery.is-slideshow .slideshow-dot.active { background: white !important; }

          /* Jetpack Slideshow block support */
          .body-text .wp-block-jetpack-slideshow { position: relative !important; margin: 12px 0 !important; }
          .body-text .wp-block-jetpack-slideshow .wp-block-jetpack-slideshow_container { display: flex !important; overflow-x: auto !important; scroll-snap-type: x mandatory !important; gap: 8px !important; -webkit-overflow-scrolling: touch !important; scrollbar-width: none !important; }
          .body-text .wp-block-jetpack-slideshow .wp-block-jetpack-slideshow_container::-webkit-scrollbar { display: none !important; }
          .body-text .wp-block-jetpack-slideshow .wp-block-jetpack-slideshow_slide { flex: 0 0 100% !important; scroll-snap-align: center !important; margin: 0 !important; }
          .body-text .wp-block-jetpack-slideshow img { width: 100% !important; height: auto !important; border-radius: 16px !important; display: block !important; }
          .body-text .wp-block-jetpack-slideshow .slideshow-arrow { position: absolute !important; top: 50% !important; transform: translateY(-50%) !important; background: rgba(0,0,0,0.6) !important; color: white !important; border: none !important; width: 36px !important; height: 36px !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 2 !important; cursor: pointer !important; }
          .body-text .wp-block-jetpack-slideshow .slideshow-prev { left: 8px !important; }
          .body-text .wp-block-jetpack-slideshow .slideshow-next { right: 8px !important; }
          .body-text .wp-block-jetpack-slideshow .slideshow-dots { display: flex !important; gap: 6px !important; justify-content: center !important; margin-top: 8px !important; }
          .body-text .wp-block-jetpack-slideshow .slideshow-dot { width: 8px !important; height: 8px !important; border-radius: 50% !important; background: rgba(255,255,255,0.4) !important; border: 1px solid rgba(0,0,0,0.2) !important; }
          .body-text .wp-block-jetpack-slideshow .slideshow-dot.active { background: white !important; }
          @media (min-width: 768px) {
            .body-text .wp-block-gallery,
            .body-text .blocks-gallery-grid {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 10px !important;
            }
          }
          @media (min-width: 1024px) {
            .body-text .wp-block-gallery,
            .body-text .blocks-gallery-grid {
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 12px !important;
            }
          }
          .body-text .wp-block-gallery .blocks-gallery-item,
          .body-text .blocks-gallery-grid .blocks-gallery-item {
            margin: 0 !important;
          }
          .body-text .wp-block-gallery .blocks-gallery-item img,
          .body-text .blocks-gallery-grid .blocks-gallery-item img {
            width: 100% !important;
            height: auto !important;
            display: block !important;
            border-radius: 16px !important;
            margin: 0 !important;
          }
          .body-text .wp-block-gallery figcaption,
          .body-text .blocks-gallery-grid figcaption {
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
            color: var(--primary) !important;
            text-align: center !important;
            margin-top: 6px !important;
          }

          /* Classic [gallery] shortcode */
          .body-text .gallery {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            margin: 12px 0 !important;
          }
          .body-text .gallery .gallery-item {
            margin: 0 !important;
          }
          .body-text .gallery .gallery-item img {
            width: 100% !important;
            height: auto !important;
            display: block !important;
            border-radius: 16px !important;
            margin: 0 !important;
          }
          .body-text .gallery .gallery-caption {
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
            color: var(--primary) !important;
            text-align: center !important;
            margin: 6px 10px !important;
          }
          /* Map classic gallery columns to CSS grid */
          .body-text .gallery.gallery-columns-1 { grid-template-columns: repeat(1, 1fr) !important; }
          .body-text .gallery.gallery-columns-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .body-text .gallery.gallery-columns-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .body-text .gallery.gallery-columns-4 { grid-template-columns: repeat(4, 1fr) !important; }
          .body-text .gallery.gallery-columns-5 { grid-template-columns: repeat(5, 1fr) !important; }
          .body-text .gallery.gallery-columns-6 { grid-template-columns: repeat(6, 1fr) !important; }
          .body-text .gallery.gallery-columns-7 { grid-template-columns: repeat(7, 1fr) !important; }
          .body-text .gallery.gallery-columns-8 { grid-template-columns: repeat(8, 1fr) !important; }
          .body-text .gallery.gallery-columns-9 { grid-template-columns: repeat(9, 1fr) !important; }

          /* Ensure gallery images don't inherit default image margins */
          .body-text .wp-block-gallery img,
          .body-text .blocks-gallery-item img,
          .body-text .gallery .gallery-item img {
            margin: 0 !important;
          }

          /* Caption with gradient backdrop */
          .lightbox-caption-wrap { position: absolute !important; left: 0 !important; right: 0 !important; bottom: 0 !important; padding: 24px !important; pointer-events: none !important; z-index: 2 !important; }
          .lightbox-caption-gradient { position: absolute !important; left: 0 !important; right: 0 !important; bottom: 0 !important; height: 40% !important; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%) !important; }
          .lightbox-caption { position: relative !important; max-width: min(900px, 90%) !important; color: #fff !important; font-size: 0.95rem !important; line-height: 1.4 !important; text-shadow: 0 1px 2px rgba(0,0,0,0.4) !important; }

          /* WordPress Dividers */
          .body-text hr,
          .body-text .wp-block-separator,
          .body-text .wp-block-separator.is-style-dots,
          .body-text .wp-block-separator.is-style-wide {
            border: none !important;
            border-top: 1px solid rgba(127, 127, 127, 0.2) !important;
            margin: 6px 10px !important;
            height: 1px !important;
            background: none !important;
            width: auto !important;
          }
          .body-text .wp-block-separator.is-style-dots {
            border: none !important;
            height: auto !important;
            line-height: 1 !important;
            text-align: center !important;
            background: none !important;
            opacity: 0.4 !important;
          }
          .body-text .wp-block-separator.is-style-dots::before {
            content: '···' !important;
            color: var(--primary) !important;
            font-size: 1.5rem !important;
            letter-spacing: 0.5em !important;
            padding-left: 0.5em !important;
          }
          .body-text .wp-block-separator.is-style-wide {
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
          }

          /* WordPress Quote Blocks */
          .body-text .wp-block-quote {
            position: relative !important;
            margin: 20px 10px !important;
            padding: 20px 50px 20px 50px !important;
            border-left: none !important;
            font-style: italic !important;
            color: var(--primary) !important;
          }
          .body-text .wp-block-quote::before {
            content: '' !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 32px !important;
            height: 32px !important;
            background-color: var(--accent) !important;
            mask-image: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 3C4.34315 3 3 4.34315 3 6V10C3 11.6569 4.34315 13 6 13H8V11H6C5.44772 11 5 10.5523 5 10V6C5 5.44772 5.44772 5 6 5H8V3H6Z' fill='black'/%3E%3Cpath d='M18 3C16.3431 3 15 4.34315 15 6V10C15 11.6569 16.3431 13 18 13H20V11H18C17.4477 11 17 10.5523 17 10V6C17 5.44772 17.4477 5 18 5H20V3H18Z' fill='black'/%3E%3C/svg%3E") !important;
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 3C4.34315 3 3 4.34315 3 6V10C3 11.6569 4.34315 13 6 13H8V11H6C5.44772 11 5 10.5523 5 10V6C5 5.44772 5.44772 5 6 5H8V3H6Z' fill='black'/%3E%3Cpath d='M18 3C16.3431 3 15 4.34315 15 6V10C15 11.6569 16.3431 13 18 13H20V11H18C17.4477 11 17 10.5523 17 10V6C17 5.44772 17.4477 5 18 5H20V3H18Z' fill='black'/%3E%3C/svg%3E") !important;
            mask-size: contain !important;
            -webkit-mask-size: contain !important;
            mask-repeat: no-repeat !important;
            -webkit-mask-repeat: no-repeat !important;
            mask-position: center !important;
            -webkit-mask-position: center !important;
            z-index: 1 !important;
          }
          .body-text .wp-block-quote::after {
            content: '' !important;
            position: absolute !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 32px !important;
            height: 32px !important;
            background-color: var(--accent) !important;
            mask-image: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 3C4.34315 3 3 4.34315 3 6V10C3 11.6569 4.34315 13 6 13H8V11H6C5.44772 11 5 10.5523 5 10V6C5 5.44772 5.44772 5 6 5H8V3H6Z' fill='black'/%3E%3Cpath d='M18 3C16.3431 3 15 4.34315 15 6V10C15 11.6569 16.3431 13 18 13H20V11H18C17.4477 11 17 10.5523 17 10V6C17 5.44772 17.4477 5 18 5H20V3H18Z' fill='black'/%3E%3C/svg%3E") !important;
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 3C4.34315 3 3 4.34315 3 6V10C3 11.6569 4.34315 13 6 13H8V11H6C5.44772 11 5 10.5523 5 10V6C5 5.44772 5.44772 5 6 5H8V3H6Z' fill='black'/%3E%3Cpath d='M18 3C16.3431 3 15 4.34315 15 6V10C15 11.6569 16.3431 13 18 13H20V11H18C17.4477 11 17 10.5523 17 10V6C17 5.44772 17.4477 5 18 5H20V3H18Z' fill='black'/%3E%3C/svg%3E") !important;
            mask-size: contain !important;
            -webkit-mask-size: contain !important;
            mask-repeat: no-repeat !important;
            -webkit-mask-repeat: no-repeat !important;
            mask-position: center !important;
            -webkit-mask-position: center !important;
            transform: rotate(180deg) !important;
            z-index: 1 !important;
          }
          .body-text .wp-block-quote p {
            margin: 0 0 10px 0 !important;
            font-size: 1.1rem !important;
            line-height: 1.6 !important;
          }
          .body-text .wp-block-quote p:last-child {
            margin-bottom: 0 !important;
          }
          .body-text .wp-block-quote cite,
          .body-text .wp-block-quote .wp-block-quote__citation {
            display: block !important;
            margin-top: 12px !important;
            font-size: 0.9rem !important;
            font-style: normal !important;
            opacity: 0.7 !important;
            text-align: right !important;
          }
          .body-text .wp-block-quote cite::before,
          .body-text .wp-block-quote .wp-block-quote__citation::before {
            content: '— ' !important;
          }

          /* WordPress Tables */
          .body-text table,
          .body-text .wp-block-table {
            width: 100% !important;
            max-width: 100% !important;
            margin: 20px 0 !important;
            border-collapse: collapse !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            background: var(--container-background) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            box-sizing: border-box !important;
            table-layout: auto !important;
          }
          .body-text table thead,
          .body-text .wp-block-table thead {
            background: var(--container-background) !important;
          }
          .body-text table th,
          .body-text .wp-block-table th {
            padding: 12px 16px !important;
            text-align: left !important;
            font-weight: 600 !important;
            font-size: 0.95rem !important;
            color: var(--primary) !important;
            border-bottom: 2px solid rgba(127, 127, 127, 0.2) !important;
            background: var(--container-background) !important;
          }
          .body-text table td,
          .body-text .wp-block-table td {
            padding: 12px 16px !important;
            border-bottom: 1px solid rgba(127, 127, 127, 0.1) !important;
            color: var(--primary) !important;
            font-size: 0.9rem !important;
            line-height: 1.5 !important;
          }
          .body-text table tbody tr:last-child td,
          .body-text .wp-block-table tbody tr:last-child td {
            border-bottom: none !important;
          }
          .body-text table tbody tr:hover,
          .body-text .wp-block-table tbody tr:hover {
            background: rgba(127, 127, 127, 0.05) !important;
          }
          .body-text table tbody tr:nth-child(even),
          .body-text .wp-block-table tbody tr:nth-child(even) {
            background: rgba(127, 127, 127, 0.02) !important;
          }
          .body-text table tbody tr:nth-child(even):hover,
          .body-text .wp-block-table tbody tr:nth-child(even):hover {
            background: rgba(127, 127, 127, 0.08) !important;
          }
          /* Responsive table wrapper */
          .body-text .wp-block-table__wrapper {
            overflow-x: auto !important;
            overflow-y: hidden !important;
            margin: 20px 0 !important;
            -webkit-overflow-scrolling: touch !important;
            max-width: 100% !important;
            width: 100% !important;
            box-sizing: border-box !important;
            display: block !important;
          }
          .body-text .wp-block-table__wrapper table {
            margin: 0 !important;
            min-width: 100% !important;
            width: 100% !important;
            display: table !important;
          }
          /* Ensure regular tables are constrained */
          .body-text table {
            display: table !important;
          }
          /* Ensure table cells wrap text to prevent overflow */
          .body-text table th,
          .body-text table td,
          .body-text .wp-block-table th,
          .body-text .wp-block-table td {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
          /* For WordPress figure wrappers containing tables */
          .body-text figure.wp-block-table {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            margin: 20px 0 !important;
            max-width: 100% !important;
            display: block !important;
          }
          .body-text figure.wp-block-table table {
            margin: 0 !important;
            display: table !important;
          }
          @media (max-width: 768px) {
            .body-text table,
            .body-text .wp-block-table {
              font-size: 0.85rem !important;
            }
            .body-text table th,
            .body-text table td,
            .body-text .wp-block-table th,
            .body-text .wp-block-table td {
              padding: 10px 12px !important;
            }
          }

          /* Embed wrappers (Figma, etc.) */
          .body-text .figma-wrapper,
          .body-text .embed-wrapper {
            margin: 16px 0px !important;
            padding: 10px 0 !important;
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            border-radius: 12px !important;
            overflow: hidden !important;
          }
          .body-text .figma-wrapper iframe,
          .body-text .embed-wrapper iframe {
            width: 100% !important;
            max-width: 800px !important;
            height: 450px !important;
            border-radius: 12px !important;
          }
          @media (max-width: 768px) {
            .body-text .figma-wrapper iframe,
            .body-text .embed-wrapper iframe {
              height: 300px !important;
            }
          }
        `
      }} />
      <div className="containers">
        <Navigation hideMobile={true} />
        <div className="main-content">
          <div className="top-app-bar">
            <div className="top-app-bar-container back-only">
              <Link href="/blog" className="top-app-bar-icon" aria-label="Back">
                <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
                </svg>
              </Link>
              <TableOfContents content={content.content?.rendered || ''} />
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
                      <span>{new Date(content.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      <span style={{ opacity: 0.7 }}>•</span>
                      <span>{countWords(content.content?.rendered || '').toLocaleString()} words</span>
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
                      <span>{new Date(content.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      <span style={{ opacity: 0.5 }}>•</span>
                      <span>{countWords(content.content?.rendered || '').toLocaleString()} words</span>
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
          
           <div className="container settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%', overflow: 'hidden' }}>
             <BlogContent content={processContentWithEmbeds(content.content?.rendered || '')} />
           </div>
        </div>
      </div>
    </div>
  );
}
