import { fetchAllBlogPosts, fetchBlogCategories, fetchBlogTags, getBlogContentSource, type BlogPost, type BlogCategory, type BlogTag } from "../../lib/blog";
import { getYearSliderEnabled } from "../../lib/getYearSliderFlag";
import { BlogSearchProvider } from "./BlogSearchWrapper";
import BlogPostsWithSearch from "./BlogPostsWithSearch";
import YearSlider from "./YearSlider";
import FloatingSearchBar from "./FloatingSearchBar";
import BlogDynamicHeader from "./BlogDynamicHeader";

export default async function BlogIndexContent() {
  let categories: BlogCategory[] = [];
  let tags: BlogTag[] = [];
  let year1Posts: BlogPost[] = [];
  let year2Posts: BlogPost[] = [];
  let yearSliderFlag = true;

  yearSliderFlag = await getYearSliderEnabled();
  const contentSource = await getBlogContentSource();

  const [fetchedCategories, fetchedTags] = await Promise.allSettled([
    fetchBlogCategories(),
    fetchBlogTags(),
  ]);

  if (fetchedCategories.status === 'fulfilled') categories = fetchedCategories.value;
  if (fetchedTags.status === 'fulfilled') tags = fetchedTags.value;

  const customOrder = ['blender', 'unit-1', 'unit-2', 'unit-3', 'unit-4', 'unit-5', 'unit-6', 'unit-7', 'final-major-project', 'uncategorized'];
  const sortedCategories = [...categories].sort((a, b) => {
    const aIndex = customOrder.indexOf(a.slug);
    const bIndex = customOrder.indexOf(b.slug);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const year1Tag = tags.find(t => t.slug === 'year-1' || t.name.toLowerCase() === 'year 1');
  const year2Tag = tags.find(t => t.slug === 'year-2' || t.name.toLowerCase() === 'year 2');

  try {
    const allPosts = await fetchAllBlogPosts();

    if (year1Tag || year2Tag) {
      const year1Slugs = new Set<string>();
      const year2Slugs = new Set<string>();

      for (const post of allPosts) {
        const hasYear1 = post.tags.includes('year-1');
        const hasYear2 = post.tags.includes('year-2');

        if (hasYear1) year1Slugs.add(post.slug);
        if (yearSliderFlag && hasYear2) year2Slugs.add(post.slug);
        if (!hasYear1 && !hasYear2) year1Slugs.add(post.slug);
      }

      year1Posts = allPosts.filter(p => year1Slugs.has(p.slug));
      year2Posts = allPosts.filter(p => year2Slugs.has(p.slug));
    } else {
      year1Posts = allPosts;
    }
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  const categoryMapObj = Object.fromEntries(categories.map(cat => [cat.slug, cat.name]));
  const hasPosts = year1Posts.length > 0 || year2Posts.length > 0;

  return (
    <BlogSearchProvider
      year1Posts={year1Posts}
      year2Posts={year2Posts}
      yearSliderEnabled={yearSliderFlag}
    >
      <div className="main-content">
        <BlogDynamicHeader />

        <div style={{
          position: 'fixed',
          bottom: '8px',
          left: '8px',
          background: contentSource === 'sanity' ? '#f97316' : '#3b82f6',
          color: '#fff',
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '4px',
          zIndex: 9999,
          opacity: 0.85,
          pointerEvents: 'none',
          fontFamily: 'monospace',
        }}>
          src: {contentSource}
        </div>

        <YearSlider />

        {hasPosts ? (
          <BlogPostsWithSearch categoryMap={categoryMapObj} />
        ) : (
          <div className="section">
            <div className="section-header">
              <div className="title">No Posts Available</div>
            </div>
            <div className="panel settings">
              <div className="body-text">
                <p>Unable to load blog posts. Please check your CMS configuration.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <FloatingSearchBar categories={sortedCategories} />
    </BlogSearchProvider>
  );
}
