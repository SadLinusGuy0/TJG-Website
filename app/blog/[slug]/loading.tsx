import Navigation from "../../components/Navigation";
import { LoadingDots } from "../../components/LoadingAnim";

export default function BlogPostLoading() {
  return (
    <div className="index">
      <div className="containers">
        <Navigation hideMobile={true} />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <LoadingDots />
          </div>
        </div>
      </div>
    </div>
  );
}
