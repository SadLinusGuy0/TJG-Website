import {
  Add,
  Apps,
  ArrowRight,
  Document,
  Download,
  Figma,
  Github,
  Link,
  Open,
  Refresh,
  Shopping,
  Youtube,
} from '@thatjoshguy/oneui-icons';
import { sanitizeBlogButtonHref } from '../../lib/sanitizeBlogButtonHref';

type BlogButtonIcon = React.ComponentType<{ size?: string | number; color?: string }>;

const BLOG_BUTTON_ICONS: Record<string, BlogButtonIcon> = {
  Add,
  Apps,
  ArrowRight,
  Document,
  Download,
  Figma,
  Github,
  GitHub: Github,
  Link,
  Open,
  Refresh,
  Shopping,
  Youtube,
  YouTube: Youtube,
};

interface BlogButtonProps {
  label: string;
  href: string;
  iconName?: string;
}

export default function BlogButton({ label, href, iconName }: BlogButtonProps) {
  const IconComponent = iconName ? BLOG_BUTTON_ICONS[iconName] : null;
  const resolvedHref = sanitizeBlogButtonHref(href);

  return (
    <div className="blog-button-wrapper">
      <a href={resolvedHref} className="blog-button" target="_blank" rel="noopener noreferrer">
        {IconComponent && <IconComponent size={20} color="#fff" />}
        <span>{label}</span>
      </a>
    </div>
  );
}
