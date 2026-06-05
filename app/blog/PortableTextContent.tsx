import Image from 'next/image';
import type React from 'react';
import { getEmbedHtmlForKey, processContentWithEmbeds } from '../../lib/blogContentProcessing';
import { getSanityImageUrl, type SanityImageSource } from '../../lib/sanity';
import type { PortableTextBlock, PortableTextMarkDef, PortableTextSpan } from '../../lib/portableText';
import BlogButton from './BlogButton';
import BlogContent from './BlogContent';

interface PortableTextContentProps {
  blocks: PortableTextBlock[];
}

function getMarkDef(markDefs: PortableTextMarkDef[] | undefined, mark: string) {
  return markDefs?.find(def => def._key === mark);
}

function renderSpan(span: PortableTextSpan, markDefs: PortableTextMarkDef[] | undefined, index: number) {
  let node: React.ReactNode = span.text || '';

  for (const mark of span.marks || []) {
    const def = getMarkDef(markDefs, mark);
    if (def?._type === 'link' && def.href) {
      node = (
        <a key={`${span._key || index}-${mark}`} href={def.href} target="_blank" rel="noopener noreferrer">
          {node}
        </a>
      );
    } else if (mark === 'strong') {
      node = <strong key={`${span._key || index}-${mark}`}>{node}</strong>;
    } else if (mark === 'em') {
      node = <em key={`${span._key || index}-${mark}`}>{node}</em>;
    } else if (mark === 'code') {
      node = <code key={`${span._key || index}-${mark}`}>{node}</code>;
    } else if (mark === 'underline') {
      node = <u key={`${span._key || index}-${mark}`}>{node}</u>;
    }
  }

  return <span key={span._key || index}>{node}</span>;
}

function renderChildren(block: PortableTextBlock) {
  return block.children?.map((span, index) => renderSpan(span, block.markDefs, index));
}

function PortableImage({ block }: { block: PortableTextBlock }) {
  const src = getSanityImageUrl(block as SanityImageSource);
  if (!src) return null;

  return (
    <figure className="portable-image">
      <div className="portable-image-frame">
        <Image
          src={src}
          alt={block.alt || block.caption || ''}
          width={1200}
          height={800}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

function renderBlock(block: PortableTextBlock, index: number) {
  const key = block._key || index;

  if (block._type === 'image') {
    return <PortableImage key={key} block={block} />;
  }

  if (block._type === 'blogButton' && block.label && block.href) {
    return <BlogButton key={key} label={block.label} href={block.href} iconName={block.iconName} />;
  }

  if (block._type === 'embed' && block.embedKey) {
    const html = getEmbedHtmlForKey(block.embedKey);
    return html ? <div key={key} dangerouslySetInnerHTML={{ __html: html }} /> : null;
  }

  if (block._type === 'legacyHtml' && block.html) {
    return <BlogContent key={key} content={processContentWithEmbeds(block.html)} />;
  }

  const children = renderChildren(block);
  if (!children?.length) return null;

  if (block.listItem === 'bullet') {
    return <li key={key}>{children}</li>;
  }
  if (block.listItem === 'number') {
    return <li key={key}>{children}</li>;
  }

  switch (block.style) {
    case 'h1':
      return <h1 key={key}>{children}</h1>;
    case 'h2':
      return <h2 key={key}>{children}</h2>;
    case 'h3':
      return <h3 key={key}>{children}</h3>;
    case 'h4':
      return <h4 key={key}>{children}</h4>;
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>;
    default:
      return <p key={key}>{children}</p>;
  }
}

export default function PortableTextContent({ blocks }: PortableTextContentProps) {
  const renderedBlocks: React.ReactNode[] = [];
  let pendingList: React.ReactNode[] = [];
  let pendingListType: 'bullet' | 'number' | null = null;

  const flushList = () => {
    if (!pendingListType || pendingList.length === 0) return;
    const ListTag = pendingListType === 'number' ? 'ol' : 'ul';
    renderedBlocks.push(<ListTag key={`list-${renderedBlocks.length}`}>{pendingList}</ListTag>);
    pendingList = [];
    pendingListType = null;
  };

  blocks.forEach((block, index) => {
    if (block.listItem === 'bullet' || block.listItem === 'number') {
      if (pendingListType && pendingListType !== block.listItem) flushList();
      pendingListType = block.listItem;
      pendingList.push(renderBlock(block, index));
      return;
    }

    flushList();
    renderedBlocks.push(renderBlock(block, index));
  });
  flushList();

  return (
    <div className="body-text portable-text">
      {renderedBlocks}
    </div>
  );
}
