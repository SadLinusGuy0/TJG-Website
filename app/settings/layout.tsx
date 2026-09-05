import { routeMetadata } from '../../lib/routeMetadata';
export function generateMetadata() { return routeMetadata('/settings', 'Settings', 'Display and reading preferences for That Josh Guy.', true); }
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
