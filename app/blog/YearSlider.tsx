'use client';

import { useBlogSearch } from './BlogSearchWrapper';

export default function YearSlider() {
  const { activeYear, setActiveYear, yearSliderEnabled } = useBlogSearch();

  if (!yearSliderEnabled) return null;

  const isYear1 = activeYear === 'year1';

  return (
    <>
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
