"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageHeading from '../components/PageHeading';
import { Settings } from '@thatjoshguy/oneui-icons';

export default function BlogDynamicHeader() {
  const pathname = usePathname();
  const settingsBtn = (
    <Link
      href={`/settings?from=${encodeURIComponent(pathname)}`}
      className="top-app-bar-icon"
      aria-label="Settings"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}
    >
      <Settings color="var(--primary)" />
    </Link>
  );

  return (
    <PageHeading
      title="Blog"
      trailingAction={settingsBtn}
      barTrailingAction={settingsBtn}
    />
  );
}
