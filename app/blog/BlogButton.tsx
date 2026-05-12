import * as Icons from '@thatjoshguy/oneui-icons';

interface BlogButtonProps {
  label: string;
  href: string;
  iconName?: string;
}

export default function BlogButton({ label, href, iconName }: BlogButtonProps) {
  const IconComponent = iconName ? (Icons as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[iconName] : null;

  return (
    <div className="blog-button-wrapper">
      <a href={href} className="blog-button" target="_blank" rel="noopener noreferrer">
        {IconComponent && <IconComponent size={20} color="#fff" />}
        <span>{label}</span>
      </a>
    </div>
  );
}
