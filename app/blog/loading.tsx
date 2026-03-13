import { LoadingDots } from '../components/LoadingAnim';
import Navigation from '../components/Navigation';

export default function BlogLoading() {
  return (
    <div className="index blog-page">
      <div className="containers">
        <Navigation />
        <div className="main-content" style={{ paddingTop: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LoadingDots />
        </div>
      </div>
    </div>
  );
}
