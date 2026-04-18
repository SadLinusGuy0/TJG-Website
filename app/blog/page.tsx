import { Suspense } from "react";
import Navigation from "../components/Navigation";
import BlogIndexContent from "./BlogIndexContent";
import BlogIndexSkeleton from "./BlogIndexSkeleton";
export const revalidate = 300;

export default function BlogIndex() {
  return (
    <div className="index blog-page">
      <div className="containers">
        <Navigation />

        <Suspense fallback={<BlogIndexSkeleton />}>
          <BlogIndexContent />
        </Suspense>
      </div>
    </div>
  );
}
