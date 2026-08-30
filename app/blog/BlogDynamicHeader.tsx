import TopAppBar from '../components/TopAppBar';

export default function BlogDynamicHeader() {
  return (
    <TopAppBar
      title="Blog"
      hideBarTitleOnMobile
      mobileSettingsHref="/settings?from=%2Fblog"
    />
  );
}
