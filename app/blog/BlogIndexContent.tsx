import { fetchBlogPage, fetchBlogCategories,  type BlogCategory } from "../../lib/blog";
import { BlogSearchProvider } from "./BlogSearchWrapper";
import BlogPostsWithSearch from "./BlogPostsWithSearch";
import FloatingSearchBar from "./FloatingSearchBar";
import BlogDynamicHeader from "./BlogDynamicHeader";

export default async function BlogIndexContent() {
  const [categories, result] = await Promise.all([fetchBlogCategories(), fetchBlogPage()]);
  const customOrder = ['blender', 'unit-1', 'unit-2', 'unit-3', 'unit-4', 'unit-5', 'unit-6', 'unit-7', 'final-major-project', 'uncategorized'];
  const sortedCategories = categories
    .sort((a, b) => {
      const aIndex = customOrder.indexOf(a.slug);
      const bIndex = customOrder.indexOf(b.slug);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

  const categoryMapObj = Object.fromEntries(categories.map(cat => [cat.slug, cat.name]));

  return (
    <BlogSearchProvider
      initialPage={result}
    >
      <div className="main-content">
        <BlogDynamicHeader />

        <BlogPostsWithSearch categoryMap={categoryMapObj} />
      </div>

      <FloatingSearchBar categories={sortedCategories} />
    </BlogSearchProvider>
  );
}
