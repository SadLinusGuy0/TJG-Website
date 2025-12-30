import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPostBySlug, fetchPageBySlug, getFeaturedImageUrlAsync } from "../../../lib/wordpress";
import type { WPPost } from "../../../lib/wordpress";
import Navigation from "../../components/Navigation";
import { LoadingDots } from "../../components/LoadingAnim";
import BlogPostContentLoader from "./BlogPostContentLoader";

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
  // Await params to ensure it's resolved
  await props.params;

  return (
    <Suspense fallback={
      <div className="index">
        <div className="containers">
          <Navigation hideMobile={true} />
          <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <LoadingDots />
          </div>
        </div>
      </div>
    }>
      <BlogPostContentLoader />
    </Suspense>
  );
}
