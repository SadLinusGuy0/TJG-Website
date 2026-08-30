import TopAppBar from "../../components/TopAppBar";

export default function BlogPostLoading() {
  return (
    <div className="page">
      <div className="page-body">
        <div className="main-content">
          <TopAppBar
            backHref="/blog"
            collapseTarget=".post-hero-card"
            actions={
              <div
                className="skeleton-box"
                style={{ width: 80, height: 28, borderRadius: 'var(--br-xl)' }}
                aria-hidden="true"
              />
            }
          />

          {/* Hero image skeleton */}
          <div
            className="post-hero-card post-hero-card--loading skeleton-box"
            style={{
              height: 'clamp(300px, 40vh, 500px)',
            }}
          />

          {/* Article body skeleton — alternating paragraph widths for realism */}
          <div className="panel settings" style={{ padding: 0, marginBottom: 0, maxWidth: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 10px' }}>
              {[90, 100, 85, 100, 75, 100, 60, 100, 88, 100, 70].map((w, i) => (
                <div
                  key={i}
                  className="skeleton-box"
                  style={{ height: 14, width: `${w}%` }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
