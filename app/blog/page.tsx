import { Suspense } from "react";
import Navigation from "../components/Navigation";
import BlogIndexContent from "./BlogIndexContent";
import { LoadingDots } from "../components/LoadingAnim";
export const revalidate = 300;

export default function BlogIndex() {
  return (
    <div className="page blog-page">
      <div className="page-body">
        <Navigation />

        <Suspense fallback={
          <div className="main-content">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
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
