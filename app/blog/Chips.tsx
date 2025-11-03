"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type React from "react";

type Chip = { label: string; href: string; selected: boolean };

type Props = {
  categories: Array<{ id: number; slug: string; name: string }>;
  selectedSlug?: string;
};

export default function Chips({ categories, selectedSlug }: Props) {
  const searchParams = useSearchParams();
  const urlSelected = searchParams?.get('unit') || undefined;
  const effectiveSelected = selectedSlug ?? urlSelected;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setScrollStartLeft(scrollRef.current.scrollLeft);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    const delta = e.clientX - dragStartX;
    scrollRef.current.scrollLeft = scrollStartLeft - delta;
  };

  const onMouseUpLeave = () => setIsDragging(false);
  const chips: Chip[] = [
    { label: "All", href: "/blog", selected: !effectiveSelected },
    ...categories.map(c => ({
      label: c.name,
      href: `/blog?unit=${encodeURIComponent(c.slug)}`,
      selected: effectiveSelected === c.slug,
    }))
  ];

  return (
    <div
      ref={scrollRef}
      className="chips-scroll"
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'nowrap',
        padding: '8px 0 0 0',
        paddingRight: 16,
        marginRight: -16,
        marginBottom: 12,
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
<<<<<<< HEAD
=======
        touchAction: 'pan-x',
        overscrollBehaviorX: 'contain',
>>>>>>> college
        width: '100%',
        maxWidth: '100%'
      }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUpLeave}
      onMouseLeave={onMouseUpLeave}
    >
      {chips.map((chip, idx) => (
        <Link
          key={idx}
          href={chip.href}
          className="chip-link"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            outline: 'none',
            flex: '0 0 auto'
          }}
        >
          <div
            className="chip"
            style={{
              borderRadius: 24,
              padding: '8px 16px',
              border: chip.selected
                ? '2px solid var(--accent)'
                : '1px solid color-mix(in srgb, var(--secondary) 40%, transparent)',
              backgroundColor: chip.selected
                ? '#387aff'
                : 'color-mix(in srgb, var(--container-background) 50%, transparent)',
              color: chip.selected ? '#fff' : 'var(--secondary)',
              fontSize: 16,
              fontFamily: 'One UI Sans',
<<<<<<< HEAD
              fontWeight: '500',
=======
              fontWeight: 500,
>>>>>>> college
              lineHeight: '20px',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease'
            }}
          >
            {chip.label}
          </div>
        </Link>
      ))}
      <style jsx global>{`
        .chips-scroll { scrollbar-width: none; cursor: ${'${isDragging ? "grabbing" : "grab"}'}; }
        .chip-link .chip:hover { background-color: color-mix(in srgb, var(--container-background) 85%, transparent); }
        .chip-link .chip:active { background-color: color-mix(in srgb, var(--container-background) 90%, transparent); }
        .chip-link:focus-visible .chip { outline: 2px solid var(--primary); outline-offset: 2px; }
        .chips-scroll::-webkit-scrollbar { display: none; height: 0; width: 0; }
      `}</style>
    </div>
  );
}

