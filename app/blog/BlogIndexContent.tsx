import { fetchAllPosts, fetchCategories, fetchTags, WPPost, WPCategory, WPTag } from "../../lib/wordpress";
import { getYearSliderEnabled } from "../../lib/getYearSliderFlag";
import { getWordpressSourceUrl } from "../../lib/getWordpressSourceUrlFlag";
import { BlogSearchProvider } from "./BlogSearchWrapper";
import BlogPostsWithSearch from "./BlogPostsWithSearch";
import YearSlider from "./YearSlider";
import FloatingSearchBar from "./FloatingSearchBar";

export default async function BlogIndexContent() {
  let categories: WPCategory[] = [];
  let tags: WPTag[] = [];
  let year1Posts: WPPost[] = [];
  let year2Posts: WPPost[] = [];
  let yearSliderFlag = true;

  // Resolve flags first (sub-millisecond — reads from cookie/config, not network)
  const [apiBaseUrl, yearSliderResult] = await Promise.all([
    getWordpressSourceUrl(),
    getYearSliderEnabled(),
  ]);
  yearSliderFlag = yearSliderResult;

  // Fetch WordPress data using the resolved URL
  const [fetchedCategories, fetchedTags] = await Promise.allSettled([
    fetchCategories(apiBaseUrl),
    fetchTags(apiBaseUrl),
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
      year1Posts = await fetchAllPosts({ tagId: year1Tag.id, apiBaseUrl });
    }

    if (yearSliderFlag && year2Tag) {
      year2Posts = await fetchAllPosts({ tagId: year2Tag.id, apiBaseUrl });
    }

    if (!year1Tag && !year2Tag) {
      year1Posts = await fetchAllPosts({ apiBaseUrl });
    }
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  const categoryMapObj = Object.fromEntries(categories.map(cat => [cat.id, cat.name]));
  const hasPosts = year1Posts.length > 0 || year2Posts.length > 0;

  return (
    <BlogSearchProvider
      year1Posts={year1Posts}
      year2Posts={year2Posts}
      yearSliderEnabled={yearSliderFlag}
    >
      <div className="main-content">
        <div className="header-container">
          <div className="title" style={{ paddingBottom: 8 }}>Blog</div>
        </div>

        <YearSlider />

        {hasPosts ? (
          <BlogPostsWithSearch categoryMap={categoryMapObj} />
        ) : (
          <div className="blank-div">
            <div className="container1">
              <div className="title">No Posts Available</div>
            </div>
            <div className="container settings">
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
