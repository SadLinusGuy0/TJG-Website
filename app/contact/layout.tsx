import { routeMetadata } from '../../lib/routeMetadata';
export function generateMetadata() { return routeMetadata('/contact', 'Contact', 'Get in touch with Josh Skinner about writing, design and creative projects.', false); }
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
