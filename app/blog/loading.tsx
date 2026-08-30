import { LoadingDots } from "../components/LoadingAnim";
import TopAppBar from "../components/TopAppBar";

export default function BlogLoading() {
  return (
    <div className="page blog-page">
      <div className="page-body">
        <div className="main-content">
          <TopAppBar
            title="Blog"
            hideBarTitleOnMobile
            mobileSettingsHref="/settings?from=%2Fblog"
          />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <LoadingDots />
          </div>
        </div>
      </div>
    </div>
  );
}
