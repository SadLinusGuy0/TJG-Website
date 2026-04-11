export default function BlogIndexSkeleton() {
  return (
    <div className="main-content">
      {/* Page title */}
      <div className="header-container">
        <div className="title" style={{ paddingBottom: 8 }}>Blog</div>
      </div>

      {/* Year slider skeleton */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div
          className="skeleton-box"
          style={{ width: 80, height: 32 }}
          aria-hidden="true"
        />
        <div
          className="skeleton-box"
          style={{ width: 80, height: 32 }}
          aria-hidden="true"
        />
      </div>

      {/* Post card skeletons */}
      <div className="blank-div">
        <div className="list-group">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="list3"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Mobile thumbnail (full-width, shown on small screens) */}
      <div
        className="blog-card-mobile-thumbnail skeleton-box"
        style={{
          width: '100%',
          height: 120,
          marginBottom: 12,
          borderRadius: 'var(--br-sm)',
        }}
      />

      <div
        className="blog-card-container"
        style={{ display: 'flex', gap: 16, alignItems: 'flex-start', width: '100%' }}
      >
        {/* Text content */}
        <div
          className="blog-card-text-content"
          style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {/* Title line */}
          <div className="skeleton-box" style={{ height: 18, width: '75%' }} />
          {/* Excerpt lines */}
          <div className="skeleton-box" style={{ height: 14, width: '90%' }} />
          <div className="skeleton-box" style={{ height: 14, width: '60%' }} />
          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <div className="skeleton-box" style={{ height: 22, width: 80, borderRadius: 'var(--br-sm)' }} />
            <div className="skeleton-box" style={{ height: 22, width: 64, borderRadius: 'var(--br-sm)' }} />
          </div>
        </div>

        {/* Desktop thumbnail */}
        <div
          className="blog-card-desktop-thumbnail blog-card-thumbnail skeleton-box"
          style={{
            flexShrink: 0,
            width: 120,
            height: 80,
            borderRadius: 'var(--br-sm)',
          }}
        />
      </div>
    </div>
  );
}
