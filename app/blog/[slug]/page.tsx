import { fetchPostBySlug, fetchPageBySlug, getFeaturedImageUrlAsync } from "../../../lib/wordpress";
import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import LightboxClient from "../../components/LightboxClient";
import Link from "next/link";

export const revalidate = 60;

export default async function BlogPost(props: any) {
  const resolvedParams = typeof props?.params?.then === 'function' ? await props.params : props?.params;
  const { slug } = resolvedParams || {};

  // Try to fetch as post first, then as page
  let content = null;

  try {
    content = await fetchPostBySlug(slug);
    if (!content) {
      content = await fetchPageBySlug(slug);
    }
  } catch (error) {
    console.error("Failed to fetch content:", error);
    return notFound();
  }

  if (!content) return notFound();
  const featuredImageUrl = await getFeaturedImageUrlAsync(content);

  // Debug logging (remove in production)
  console.log("Post content:", {
    id: content.id,
    title: content.title.rendered,
    featured_media: content.featured_media,
    hasEmbedded: !!content._embedded?.["wp:featuredmedia"],
    embeddedMedia: content._embedded?.["wp:featuredmedia"],
    featuredImageUrl,
  });

  return (
    <div className="index">
      <style
        dangerouslySetInnerHTML={{
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
          .body-text img {
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            border-radius: 28px !important;
            display: block !important;
            margin: 12px 0 !important;
            padding: 0 !important;
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
            margin: 12px 0 !important;
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

          /* Tables (Gutenberg and plain HTML) */
          .body-text .wp-block-table,
          .body-text table {
            width: 100% !important;
            margin: 12px 0 !important;
          }
          /* Ensure Gutenberg's figure wrapper behaves */
          .body-text .wp-block-table { display: block !important; }
          .body-text .wp-block-table table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .body-text table {
            border-collapse: collapse !important;
            margin: 0 10px !important;
          }
          .body-text thead th {
            text-align: left !important;
            font-weight: 700 !important;
            border-bottom: 1px solid rgba(127,127,127,0.25) !important;
          }
          .body-text th,
          .body-text td {
            padding: 8px 10px !important;
            vertical-align: top !important;
            border-bottom: 1px solid rgba(127,127,127,0.15) !important;
          }
          .body-text table tr:last-child th,
          .body-text table tr:last-child td {
            border-bottom: none !important;
          }
          .body-text table caption {
            caption-side: bottom !important;
            text-align: left !important;
            font-size: 0.9rem !important;
            opacity: 0.8 !important;
            margin-top: 8px !important;
          }
          /* Mobile handling: allow horizontal scroll if content forces overflow */
          @media (max-width: 767px) {
            .body-text .wp-block-table,
            .body-text table {
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch !important;
              display: block !important;
            }
          }

          /* Gutenberg Media & Text */
          .body-text .wp-block-media-text {
            display: grid !important;
            grid-template-columns: 1fr !important;
            grid-template-areas:
              "media"
              "content" !important;
            gap: 12px !important;
            align-items: start !important;
            margin: 12px 0 !important;
          }
          .body-text .wp-block-media-text .wp-block-media-text__media { grid-area: media !important; }
          .body-text .wp-block-media-text .wp-block-media-text__content { grid-area: content !important; }

          /* Vertical alignment variants */
          .body-text .wp-block-media-text.is-vertically-aligned-top { align-items: start !important; }
          .body-text .wp-block-media-text.is-vertically-aligned-center { align-items: center !important; }
          .body-text .wp-block-media-text.is-vertically-aligned-bottom { align-items: end !important; }

          /* Two-column layout on wider screens; respects media side from WP */
          @media (min-width: 768px) {
            .body-text .wp-block-media-text {
              grid-template-columns: 1fr 1fr !important;
              grid-template-areas: "media content" !important;
            }
            .body-text .wp-block-media-text.has-media-on-the-right {
              grid-template-areas: "content media" !important;
            }
          }

          /* Media and content inner styles */
          .body-text .wp-block-media-text__media img,
          .body-text .wp-block-media-text__media video,
          .body-text .wp-block-media-text__media figure img {
            width: 100% !important;
            height: auto !important;
            display: block !important;
            border-radius: 20px !important;
            margin: 0 !important;
          }
          .body-text .wp-block-media-text__content > *:first-child { margin-top: 0 !important; }
          .body-text .wp-block-media-text__content > *:last-child { margin-bottom: 0 !important; }
          .body-text .wp-block-media-text__media figcaption {
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
            color: var(--primary) !important;
            text-align: center !important;
            margin-top: 6px !important;
          }

          /* General figcaption centering */
          .body-text figcaption {
            text-align: center !important;
          }

          /* Lightbox overlay */
          .lightbox-overlay {
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0,0,0,0.85) !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 9999 !important;
            padding: 24px !important;
            opacity: 0 !important;
            transition: opacity 200ms ease !important;
          }
          .lightbox-overlay.opening { display: flex !important; opacity: 0 !important; }
          .lightbox-overlay.open { display: flex !important; opacity: 1 !important; }
          /* Keep displayed during close so transition plays */
          .lightbox-overlay.closing { display: flex !important; opacity: 0 !important; }
          .lightbox-content { position: relative !important; width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; }
          .lightbox-stage { position: relative !important; width: 100% !important; height: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; }
          .lightbox-img { position: absolute !important; max-width: 100% !important; max-height: 100% !important; border-radius: 12px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.4) !important; transform: scale(0.98) translateX(0) !important; opacity: 0 !important; transition: transform 250ms ease, opacity 250ms ease !important; z-index: 1 !important; }
          .lightbox-img.incoming { opacity: 0 !important; transform: scale(1) translateX(var(--incomingStart, 0)) !important; }
          .lightbox-overlay.open .lightbox-img.current { transform: scale(1) translateX(0) !important; opacity: 1 !important; }
          /* Slide transitions - activate when sliding-active */
          .lightbox-overlay.open.slide-next.sliding-active .lightbox-img.current { transform: scale(0.98) translateX(-8%) !important; opacity: 0 !important; }
          .lightbox-overlay.open.slide-next.sliding-active .lightbox-img.incoming { transform: scale(1) translateX(0) !important; opacity: 1 !important; }
          .lightbox-overlay.open.slide-prev.sliding-active .lightbox-img.current { transform: scale(0.98) translateX(8%) !important; opacity: 0 !important; }
          .lightbox-overlay.open.slide-prev.sliding-active .lightbox-img.incoming { transform: scale(1) translateX(0) !important; opacity: 1 !important; }
          .lightbox-overlay.opening .lightbox-img { transform: scale(0.98) !important; opacity: 0 !important; }
          .lightbox-overlay.open .lightbox-img { transform: scale(1) !important; opacity: 1 !important; }
          .lightbox-overlay.closing .lightbox-img { transform: scale(0.98) !important; opacity: 0 !important; }
          .lightbox-close { position: absolute !important; top: 16px !important; right: 16px !important; background: rgba(0,0,0,0.6) !important; color: #fff !important; border: none !important; width: 40px !important; height: 40px !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; z-index: 2 !important; }
          .lightbox-close.left { left: 16px !important; right: auto !important; }
          .lightbox-arrow { position: absolute !important; top: 50% !important; transform: translateY(-50%) !important; background: rgba(0,0,0,0.6) !important; color: #fff !important; border: none !important; width: 44px !important; height: 44px !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; opacity: 0 !important; transition: opacity 200ms ease !important; z-index: 2 !important; }
          .lightbox-overlay.open .lightbox-arrow { opacity: 1 !important; }
          .lightbox-overlay.closing .lightbox-arrow { opacity: 0 !important; }
          .lightbox-prev { left: 16px !important; }
          .lightbox-next { right: 16px !important; }
          .lightbox-arrow svg, .lightbox-close svg { width: 20px !important; height: 20px !important; }

          /* Caption with gradient backdrop */
          .lightbox-caption-wrap { position: absolute !important; left: 0 !important; right: 0 !important; bottom: 0 !important; padding: 24px !important; pointer-events: none !important; z-index: 2 !important; }
          .lightbox-caption-gradient { position: absolute !important; left: 0 !important; right: 0 !important; bottom: 0 !important; height: 40% !important; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%) !important; }
          .lightbox-caption { position: relative !important; max-width: min(900px, 90%) !important; color: #fff !important; font-size: 0.95rem !important; line-height: 1.4 !important; text-shadow: 0 1px 2px rgba(0,0,0,0.4) !important; }
        `,
        }}
      />
      <div className="containers">
        <Navigation hideMobile={true} />
        <div className="main-content">
          <div className="top-app-bar">
            <div className="top-app-bar-container back-only">
              <Link href="/blog" className="top-app-bar-icon" aria-label="Back">
                <svg
                  width="10"
                  height="20"
                  viewBox="0 0 10 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z"
                    fill="var(--primary)"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Featured Image with Title Overlay or Placeholder */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "clamp(300px, 40vh, 500px)",
              marginTop: "16px",
              marginBottom: "16px",
              borderRadius: "28px",
              overflow: "hidden",
            }}
          >
            {featuredImageUrl ? (
              <>
                <img
                  src={featuredImageUrl}
                  alt="Featured image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    margin: 0,
                  }}
                />
                {/* Title and Date Container */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "clamp(16px, 4vw, 32px)",
                    left: "clamp(16px, 4vw, 32px)",
                    right: "clamp(16px, 4vw, 32px)",
                  }}
                >
                  <div
                    style={{
                      color: "white",
                      maxWidth: "100%",
                      background: "rgba(0, 0, 0, 0.3)",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <h1
                      style={{
                        fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                        fontWeight: "bold",
                        margin: 0,
                        marginBottom: "8px",
                        textShadow: "0 2px 8px rgba(0, 0, 0, 0.6)",
                        lineHeight: "1.2",
                      }}
                      dangerouslySetInnerHTML={{ __html: content.title.rendered }}
                    />
                    <div
                      style={{
                        fontSize: "1rem",
                        opacity: 0.9,
                        textShadow: "0 1px 4px rgba(0, 0, 0, 0.6)",
                        fontWeight: "500",
                      }}
                    >
                      {new Date(content.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Placeholder for missing featured image */
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* Title and Date Container for placeholder */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "clamp(16px, 4vw, 32px)",
                    left: "clamp(16px, 4vw, 32px)",
                    right: "clamp(16px, 4vw, 32px)",
                  }}
                >
                  <div
                    style={{
                      color: "var(--primary)",
                      maxWidth: "100%",
                      background: "rgba(255, 255, 255, 0.9)",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <h1
                      style={{
                        fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                        fontWeight: "bold",
                        margin: 0,
                        marginBottom: "8px",
                        lineHeight: "1.2",
                      }}
                      dangerouslySetInnerHTML={{ __html: content.title.rendered }}
                    />
                    <div
                      style={{
                        fontSize: "1rem",
                        opacity: 0.7,
                        fontWeight: "500",
                      }}
                    >
                      {new Date(content.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                {/* Subtle pattern overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),\n                    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),\n                    radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            )}
          </div>
          <div
            className="container settings"
            style={{ padding: "0", marginBottom: "0", maxWidth: "100%", overflow: "hidden" }}
          >
            <div
              className="body-text"
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: 0,
                padding: 0,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                maxWidth: "100%",
              }}
              dangerouslySetInnerHTML={{ __html: content.content?.rendered || "" }}
            />
          </div>
        </div>
      </div>
      <LightboxClient />
    </div>
  );
}


