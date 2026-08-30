import TopAppBar from "./components/TopAppBar";

export default function HomeLoading() {
  return (
    <div className="page">
      <div className="page-body">
        <div className="main-content">
          <TopAppBar mobileSettingsHref="/settings?from=%2F" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 32, paddingBottom: 24 }}>
            <div className="skeleton-box" style={{ width: 120, height: 120, borderRadius: '50%' }} aria-hidden="true" />
            <div className="skeleton-box" style={{ height: 20, width: 120 }} aria-hidden="true" />
            <div className="skeleton-box" style={{ height: 40, width: 240 }} aria-hidden="true" />
            <div className="skeleton-box" style={{ height: 16, width: 200 }} aria-hidden="true" />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="skeleton-box"
                style={{ flex: '1 1 160px', height: 88, borderRadius: 'var(--br-2lg)' }}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="skeleton-box" style={{ height: 16, width: 140, marginBottom: 12 }} aria-hidden="true" />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  className="skeleton-box"
                  style={{ width: '100%', height: 100, borderRadius: 'var(--br-md)' }}
                  aria-hidden="true"
                />
                <div className="skeleton-box" style={{ height: 14, width: '85%' }} aria-hidden="true" />
                <div className="skeleton-box" style={{ height: 12, width: '55%' }} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
