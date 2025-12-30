"use client";
import Link from "next/link";
import { useRef, useState } from 'react';

interface TopAppBarIconProps {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function TopAppBarIcon({ 
  href, 
  ariaLabel, 
  children,
  style 
}: TopAppBarIconProps) {
  const iconRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!iconRef.current) return;
    
    const rect = iconRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate offset from center (normalized to -1 to 1)
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);
    
    // Apply subtle movement (max 6px in any direction)
    const maxMovement = 6;
    setMousePosition({
      x: offsetX * maxMovement,
      y: offsetY * maxMovement
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  return (
    <Link 
      ref={iconRef}
      href={href} 
      className="top-app-bar-icon"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        cursor: 'pointer',
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </div>
    </Link>
  );
}

