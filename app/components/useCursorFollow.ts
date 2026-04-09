import { useRef, useState } from 'react';

interface CursorFollowResult<T extends HTMLElement> {
  ref: React.RefObject<T>;
  style: React.CSSProperties;
  handlers: {
    onMouseMove: (e: React.MouseEvent<T>) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

export function useCursorFollow<T extends HTMLElement>(maxMovement = 6): CursorFollowResult<T> {
  const ref = useRef<T>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<T>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);
    setMousePosition({ x: offsetX * maxMovement, y: offsetY * maxMovement });
  };

  const handleMouseEnter = () => setIsHovering(true);

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const style: React.CSSProperties = {
    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
    transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
  };

  return {
    ref,
    style,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}
