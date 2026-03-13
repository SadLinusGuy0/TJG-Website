'use client';

import { useBlogSearch } from './BlogSearchWrapper';

export default function YearSlider() {
  const { activeYear, setActiveYear, yearSliderEnabled } = useBlogSearch();

  if (!yearSliderEnabled) return null;

  const isYear1 = activeYear === 'year1';

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .year-slider {
            display: flex;
            width: 100%;
            padding: 0 0 20px 0;
          }

          .year-slider-track {
            position: relative;
            display: flex;
            width: 100%;
            background: color-mix(in srgb, var(--container-background) 60%, transparent);
            border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent);
            border-radius: 999px;
            padding: 4px;
            gap: 0;
          }

          .year-slider-indicator {
            position: absolute;
            top: 4px;
            bottom: 4px;
            width: calc(50% - 4px);
            border-radius: 999px;
            background: var(--accent);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 0;
          }

          .year-slider-indicator[data-active="year1"] {
            transform: translateX(0);
          }

          .year-slider-indicator[data-active="year2"] {
            transform: translateX(100%);
          }

          .year-slider-btn {
            position: relative;
            z-index: 1;
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px 32px;
            font-family: 'One UI Sans', sans-serif;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            border-radius: 999px;
            transition: color 0.25s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }

          .year-slider-btn[data-selected="true"] {
            color: #fff;
          }

          .year-slider-btn[data-selected="false"] {
            color: var(--secondary);
          }

          .year-slider-btn[data-selected="false"]:hover {
            color: var(--primary);
          }
        `
      }} />
      <div className="year-slider">
        <div className="year-slider-track">
          <div className="year-slider-indicator" data-active={activeYear} />
          <button
            className="year-slider-btn"
            data-selected={isYear1}
            onClick={() => setActiveYear('year1')}
            aria-pressed={isYear1}
          >
            Year 1
          </button>
          <button
            className="year-slider-btn"
            data-selected={!isYear1}
            onClick={() => setActiveYear('year2')}
            aria-pressed={!isYear1}
          >
            Year 2
          </button>
        </div>
      </div>
    </>
  );
}
