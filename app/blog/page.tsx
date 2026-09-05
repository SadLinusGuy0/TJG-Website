import { Suspense } from "react";
import BlogIndexContent from "./BlogIndexContent";
import { LoadingDots } from "../components/LoadingAnim";
export const revalidate = 300;

export default function BlogIndex() {
  return (
    <div className="page blog-page">
      <div className="page-body">

        <Suspense fallback={
          <div className="main-content">
            <div className="page-loading-spinner">
              <LoadingDots />
            </div>
          </div>
        }>
          <BlogIndexContent />
        </Suspense>
      </div>
    </div>
  );
}
