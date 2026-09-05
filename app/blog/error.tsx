'use client';
export default function BlogError({ reset }: { reset: () => void }) {
  return <div className="main-content"><h1>Articles are temporarily unavailable</h1>
    <div className="panel settings"><p>We couldn’t load this content. Please try again.</p>
      <button onClick={reset}>Try again</button><p><a href="/blog">Back to articles</a></p>
    </div></div>;
}
