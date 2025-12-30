import { Suspense } from 'react';
import BlogContentLoader from './BlogContentLoader';
import { LoadingDots } from '../components/LoadingAnim';
import Navigation from '../components/Navigation';

type Props = { searchParams?: Promise<{ unit?: string }> };

export default async function BlogIndex({ searchParams }: Props) {
  // Await searchParams to ensure it's resolved
  await searchParams;

  return (
    <Suspense fallback={
      <div className="index">
        <div className="containers">
          <Navigation />
          <div className="main-content" style={{ paddingTop: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <LoadingDots />
          </div>
        </div>
      </div>
    }>
      <BlogContentLoader />
    </Suspense>
  );
}


