import { LoadingDots } from '../components/LoadingAnim';
import TopAppBar from '../components/TopAppBar';

export default function ShopLoading() {
  return <div className="page"><div className="page-body"><div className="main-content">
    <TopAppBar title="Shop" hideBarTitleOnMobile mobileSettingsHref="/settings?from=%2Fshop" />
    <div className="page-loading-spinner"><LoadingDots /></div>
  </div></div></div>;
}
