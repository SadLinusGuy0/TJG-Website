import { fetchAllBlogPosts, fetchBlogCategories, fetchBlogTags, type BlogPost, type BlogCategory, type BlogTag } from "../../lib/blog";
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
    if (year1Tag) {
      year1Posts = await fetchAllBlogPosts({ tagSlug: 'year-1' });
    }

    if (yearSliderFlag && year2Tag) {
      year2Posts = await fetchAllBlogPosts({ tagSlug: 'year-2' });
    }

    if (!year1Tag && !year2Tag) {
      year1Posts = await fetchAllBlogPosts();
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
                <p>Unable to load blog posts. Please check your WordPress API configuration.</p>
                <p>Make sure to set the <code>WP_API_URL</code> environment variable with your WordPress site URL.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <FloatingSearchBar categories={sortedCategories} />
    </BlogSearchProvider>
  );
}
