import { Suspense } from "react";
import Navigation from "../components/Navigation";
import BlogIndexContent from "./BlogIndexContent";
import BlogIndexSkeleton from "./BlogIndexSkeleton";
export const revalidate = 300;

export default function BlogIndex() {
  return (
    <div className="page blog-page">
      <div className="page-body">
        <Navigation />

        <Suspense fallback={<BlogIndexSkeleton />}>
          <BlogIndexContent />
        </Suspense>
      </div>
    </div>
  );
}
