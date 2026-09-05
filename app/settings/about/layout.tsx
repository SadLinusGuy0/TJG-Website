import { routeMetadata } from '../../../lib/routeMetadata';
export function generateMetadata() { return routeMetadata('/settings/about', 'About this website', 'About this website for That Josh Guy.', true); }
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
