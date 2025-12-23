"use client";
import { useState, useRef, useEffect } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  inverse?: boolean; // When true, starts at 700 and decreases to 200
}

export default function AnimatedText({ text, className, style, inverse = false }: AnimatedTextProps) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setMousePosition(null);
  };

  useEffect(() => {
    if (!mousePosition) {
      // Reset all weights when mouse leaves
      const resetWeight = inverse ? '700' : '400';
      charRefs.current.forEach((charRef) => {
        if (charRef) {
          charRef.style.fontWeight = resetWeight;
        }
      });
      return;
    }

    // Find the closest character to the mouse position
    let closestIndex = 0;
    let minDistance = Infinity;

    charRefs.current.forEach((charRef, index) => {
      if (!charRef || !containerRef.current) return;

      const charRect = charRef.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Get center position of the character relative to container
      const charCenterX = charRect.left - containerRect.left + charRect.width / 2;
      const charCenterY = charRect.top - containerRect.top + charRect.height / 2;
      
      // Calculate distance from mouse to character center
      const distance = Math.sqrt(
        Math.pow(mousePosition.x - charCenterX, 2) + 
        Math.pow(mousePosition.y - charCenterY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Apply font-weight based on character position relative to closest
    charRefs.current.forEach((charRef, index) => {
      if (!charRef) return;

      const distanceFromClosest = Math.abs(index - closestIndex);
      
      let weight: number;
      
      if (inverse) {
        // Inverse mode: starts at 700 (furthest), decreases to 200 (hovered)
        weight = 700; // Base weight (furthest away)
        if (distanceFromClosest === 0) {
          weight = 200; // Hovered character
        } else if (distanceFromClosest === 1) {
          weight = 300; // 1 position away
        } else if (distanceFromClosest === 2) {
          weight = 400; // 2 positions away
        } else if (distanceFromClosest === 3) {
          weight = 500; // 3 positions away
        } else if (distanceFromClosest === 4) {
          weight = 600; // 4 positions away
        }
        // Characters further away stay at 700
      } else {
        // Normal mode: starts at 900 (hovered), decreases to 400 (furthest)
        weight = 400; // Base weight
        if (distanceFromClosest === 0) {
          weight = 900; // Hovered character
        } else if (distanceFromClosest === 1) {
          weight = 800; // Neighboring characters
        } else if (distanceFromClosest === 2) {
          weight = 700;
        } else if (distanceFromClosest === 3) {
          weight = 600;
        } else if (distanceFromClosest === 4) {
          weight = 500;
        }
        // Characters further away stay at 400
      }
      
      charRef.style.fontWeight = weight.toString();
      charRef.style.transition = 'font-weight 0.15s ease-out';
    });
  }, [mousePosition, inverse]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ display: 'inline-block', cursor: 'default', ...style }}
    >
      {text.split('').map((char, index) => (
        <span
          key={index}
          ref={(el) => {
            charRefs.current[index] = el;
          }}
          style={{
            display: 'inline-block',
            fontFamily: 'One UI Sans',
            fontWeight: inverse ? 700 : 400,
            transition: 'font-weight 0.1s ease-out',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
}

