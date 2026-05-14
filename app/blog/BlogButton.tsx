import * as Icons from '@thatjoshguy/oneui-icons';

interface BlogButtonProps {
  label: string;
  href: string;
  iconName?: string;
}

/** Google Drive `/file/d/…/view` links open a preview page; `/uc?export=download` triggers an actual download. */
function normalizedExternalHref(raw: string): string {
  const href = raw.trim();
  try {
    const u = new URL(href);
    if (u.hostname !== 'drive.google.com' && u.hostname !== 'www.drive.google.com') return href;

    const fileId = u.pathname.match(/^\/file\/d\/([^/]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    if (u.pathname === '/open') {
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    }
  } catch {
    return href;
  }
  return href;
}

export default function BlogButton({ label, href, iconName }: BlogButtonProps) {
  const IconComponent = iconName ? (Icons as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[iconName] : null;
  const resolvedHref = normalizedExternalHref(href);

  return (
    <div className="blog-button-wrapper">
      <a href={resolvedHref} className="blog-button" target="_blank" rel="noopener noreferrer">
        {IconComponent && <IconComponent size={20} color="#fff" />}
        <span>{label}</span>
      </a>
    </div>
  );
}
