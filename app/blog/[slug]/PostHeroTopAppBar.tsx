"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TableOfContents from "../TableOfContents";
import ForceRefreshButton from "./ForceRefreshButton";

interface PostHeroTopAppBarProps {
  content: string;
  slug: string;
  title: string;
}

export default function PostHeroTopAppBar({ content, slug, title }: PostHeroTopAppBarProps) {
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".post-hero-card");
    if (!hero) return;

    let frame = 0;
    const updateTitleVisibility = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        setShowTitle(rect.bottom <= 0);
      });
    };

    updateTitleVisibility();
    window.addEventListener("scroll", updateTitleVisibility, { passive: true });
    window.addEventListener("resize", updateTitleVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTitleVisibility);
      window.removeEventListener("resize", updateTitleVisibility);
    };
  }, []);

  return (
    <div className="top-app-bar post-hero-app-bar">
      <div className="top-app-bar-container back-only">
        <Link href="/blog" className="top-app-bar-icon" aria-label="Back">
          <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M9.56416 2.15216C9.85916 1.86116 9.86316 1.38616 9.57216 1.09116C9.28116 0.797162 8.80616 0.794162 8.51116 1.08516L0.733159 8.75516C0.397159 9.08616 0.212158 9.52916 0.212158 10.0012C0.212158 10.4722 0.397159 10.9162 0.733159 11.2472L8.51116 18.9162C8.65716 19.0592 8.84716 19.1312 9.03816 19.1312C9.23116 19.1312 9.42516 19.0562 9.57216 18.9082C9.86316 18.6132 9.85916 18.1382 9.56416 17.8472L1.78716 10.1782C1.72116 10.1152 1.71216 10.0402 1.71216 10.0012C1.71216 9.96216 1.72116 9.88616 1.78716 9.82316L9.56416 2.15216Z" fill="var(--primary)"/>
          </svg>
        </Link>
        <span className={`post-hero-app-bar-title${showTitle ? " is-visible" : ""}`} aria-hidden={!showTitle}>
          {title}
        </span>
        <div className="post-hero-actions">
          <TableOfContents content={content} />
          <ForceRefreshButton slug={slug} />
        </div>
      </div>
    </div>
  );
}
