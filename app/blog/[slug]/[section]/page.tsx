import type { Metadata } from "next";
import { cache, Suspense } from "react";
import Image from "next/image";
import { fetchBlogPostBySlug, fetchBlogPostFeaturedImage, type BlogPost } from "../../../../lib/blog";
import { notFound } from "next/navigation";
import LightboxClient from "../../../components/LightboxClient";
import { LoadingDots } from "../../../components/LoadingAnim";
import BlogContent from "../../BlogContent";
import { extractH1Sections } from "../../../../lib/fmpSections";
import { countWords, processContentWithEmbeds } from "../../../../lib/blogContentProcessing";
import { stripHtmlAndDecode } from "../../../../lib/portableText";
import TopAppBar from "../../../components/TopAppBar";
import TableOfContents from "../../TableOfContents";
import PostActions from "../../PostActions";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string; section: string }>;
}

const getContentForSlug = cache(async (slug: string): Promise<BlogPost | null> => {
  try {
    return await fetchBlogPostBySlug(slug);
  } catch (error) {
    console.error(`Failed to fetch content for slug "${slug}":`, error);
    return null;
  }
});

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug, section } = await props.params;
  const content = await getContentForSlug(slug);
  if (!content) notFound();

  try {
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
  const content = await getContentForSlug(slug);
  if (!content) notFound();

  return (
    <div className="page">
      <div className="page-body">
        <div className="main-content">
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <LoadingDots />
            </div>
          }>
            <SectionBody slug={slug} section={section} />
          </Suspense>
        </div>
      </div>
      <LightboxClient />
    </div>
  );
}

async function SectionBody({ slug, section }: { slug: string; section: string }) {
  const content = await getContentForSlug(slug);
  if (!content) return notFound();

  const sections = extractH1Sections(content.content?.rendered || '');
  const matched = sections.find(s => s.slug === section);
  if (!matched) return notFound();

  const featuredImageUrl = content.featuredImageUrl ?? await fetchBlogPostFeaturedImage(slug);
  const sectionContent = processContentWithEmbeds(
    matched.html.replace(/^<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '')
  );
  const postTitle = stripHtmlAndDecode(content.title?.rendered) || "Final Major Project";
  const sectionWordCount = countWords(matched.html);

  return (
    <>
      <TopAppBar
        title={matched.title}
        backHref={`/blog/${slug}`}
        collapseTarget=".post-hero-card"
        actions={
          <>
            <TableOfContents content={matched.html} />
            <PostActions slug={slug} />
          </>
        }
      />

      <div className="post-hero-card post-hero-card--section">
        {featuredImageUrl ? (
          <>
            <Image
              src={featuredImageUrl}
              alt={content.featuredImageAlt || `${matched.title} featured image`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              style={{ objectFit: 'cover' }}
            />
            <div className="post-hero-gradient" />
            <div className="post-hero-text">
              <h1 className="post-hero-title">{matched.title}</h1>
              <div className="post-hero-meta">
                <span className="post-hero-chip post-hero-chip--context" title={postTitle}>
                  {postTitle}
                </span>
                <span className="post-hero-chip">
                  {sectionWordCount.toLocaleString()} words
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="post-hero-fallback">
            <h1 className="post-hero-title" style={{ color: 'var(--primary)' }}>
              {matched.title}
            </h1>
            <div className="post-hero-meta">
              <span className="post-hero-chip post-hero-chip--context" title={postTitle}>
                {postTitle}
              </span>
              <span className="post-hero-chip">
                {sectionWordCount.toLocaleString()} words
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="panel settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%' }}>
        <BlogContent content={sectionContent} />
      </div>
    </>
  );
}
