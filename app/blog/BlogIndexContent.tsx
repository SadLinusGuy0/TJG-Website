import { fetchAllBlogPosts, fetchBlogCategories, type BlogPost, type BlogCategory } from "../../lib/blog";
import { BlogSearchProvider } from "./BlogSearchWrapper";
import BlogPostsWithSearch from "./BlogPostsWithSearch";
import FloatingSearchBar from "./FloatingSearchBar";
import BlogDynamicHeader from "./BlogDynamicHeader";

export default async function BlogIndexContent() {
  let categories: BlogCategory[] = [];
  let posts: BlogPost[] = [];

  const [fetchedCategories, fetchedPosts] = await Promise.allSettled([
    fetchBlogCategories(),
    fetchAllBlogPosts(),
  ]);

  if (fetchedCategories.status === 'fulfilled') categories = fetchedCategories.value;
  if (fetchedPosts.status === 'fulfilled') posts = fetchedPosts.value;

  const customOrder = ['blender', 'unit-1', 'unit-2', 'unit-3', 'unit-4', 'unit-5', 'unit-6', 'unit-7', 'final-major-project', 'uncategorized'];
  const visibleCategorySlugs = new Set(posts.flatMap((post) => post.categories));
  const sortedCategories = categories
    .filter((category) => visibleCategorySlugs.has(category.slug))
    .sort((a, b) => {
      const aIndex = customOrder.indexOf(a.slug);
      const bIndex = customOrder.indexOf(b.slug);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

  const categoryMapObj = Object.fromEntries(categories.map(cat => [cat.slug, cat.name]));
  const hasPosts = posts.length > 0;

  return (
    <BlogSearchProvider
      posts={posts}
    >
      <div className="main-content">
        <BlogDynamicHeader />

        {hasPosts ? (
          <BlogPostsWithSearch categoryMap={categoryMapObj} />
        ) : (
          <div className="section">
            <div className="section-header">
              <div className="title">No Posts Available</div>
            </div>
            <div className="panel settings">
              <div className="body-text">
                <p>Unable to load blog posts. Please check your blog CMS configuration.</p>
                <p>For Sanity, confirm <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and <code>NEXT_PUBLIC_SANITY_DATASET</code> are set.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <FloatingSearchBar categories={sortedCategories} />
    </BlogSearchProvider>
  );
}
