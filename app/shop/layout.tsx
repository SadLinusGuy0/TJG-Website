import { routeMetadata } from '../../lib/routeMetadata';
export function generateMetadata() { return routeMetadata('/shop', 'Shop', 'Digital designs and downloads from That Josh Guy.', false); }
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
