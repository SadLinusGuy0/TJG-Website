import * as Icons from '@thatjoshguy/oneui-icons';
import { sanitizeBlogButtonHref } from '../../lib/sanitizeBlogButtonHref';

interface BlogButtonProps {
  label: string;
  href: string;
  iconName?: string;
}

export default function BlogButton({ label, href, iconName }: BlogButtonProps) {
  const IconComponent = iconName ? (Icons as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[iconName] : null;
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
