'use client';

import { useFmpCombinedView } from '../useReadingPreferences';
import Link from 'next/link';
import BlogContent from '../BlogContent';
import { extractH1Sections } from '../../../lib/fmpSections';

interface FmpViewWrapperProps {
  rawContent: string;
  processedContent: string;
  slug: string;
}

export default function FmpViewWrapper({ rawContent, processedContent, slug }: FmpViewWrapperProps) {
  const { combined: combinedView } = useFmpCombinedView();

  const sections = extractH1Sections(rawContent);

  if (sections.length === 0) {
    return (
      <div className="panel settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%' }}>
        <BlogContent content={processedContent} />
      </div>
    );
  }

  if (combinedView) {
    return (
      <>
        <div className="panel settings" style={{ padding: '0', marginBottom: '0', maxWidth: '100%' }}>
          <BlogContent content={processedContent} />
        </div>
        <Disclaimer />
      </>
    );
  }

  return <SeparatedView sections={sections} slug={slug} />;
}

function SeparatedView({ sections, slug }: { sections: { title: string; slug: string }[]; slug: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div className="list-group">
        {sections.map((section) => (
          <Link
            key={section.slug}
            href={`/blog/${slug}/${section.slug}`}
            className="list"
            style={{
              justifyContent: 'space-between',
              textDecoration: 'none',
              fontWeight: 600,
              fontFamily: "'One UI Sans', sans-serif",
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontFamily: "'One UI Sans', sans-serif" }}>{section.title}</span>
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, opacity: 0.45 }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M0.43584 1.15216C0.14084 0.861162 0.13684 0.386162 0.42784 0.091162C0.71884 -0.202838 1.19384 -0.205838 1.48884 0.085162L9.26684 7.75516C9.60284 8.08616 9.78784 8.52916 9.78784 9.00116C9.78784 9.47216 9.60284 9.91616 9.26684 10.2472L1.48884 17.9162C1.34284 18.0592 1.15284 18.1312 0.96184 18.1312C0.76884 18.1312 0.57484 18.0562 0.42784 17.9082C0.13684 17.6132 0.14084 17.1382 0.43584 16.8472L8.21284 9.17816C8.27884 9.11516 8.28784 9.04016 8.28784 9.00116C8.28784 8.96216 8.27884 8.88616 8.21284 8.82316L0.43584 1.15216Z" fill="currentColor"/>
            </svg>
          </Link>
        ))}
      </div>
      <Disclaimer />
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={{
      marginTop: 24,
      padding: '20px 20px',
      borderRadius: 'var(--br-9xl)',
      background: 'var(--container-background)',
      fontFamily: "'One UI Sans', sans-serif",
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: 'var(--secondary)',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
    }}>
      <p style={{ margin: '0 0 8px 0' }}>
        I confirm that the following website and associated work within is all my own work and does not include any work completed by anyone else other than myself.
      </p>
      <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>
        Josh Skinner<br />
        <a href="mailto:10694305@student.bpc.ac.uk" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          10694305@student.bpc.ac.uk
        </a>
      </p>
    </div>
  );
}
