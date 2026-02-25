"use client";
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`toast ${isVisible ? 'toast-visible' : ''}`}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--container-background)',
        color: 'var(--primary)',
        padding: '12px 24px',
        borderRadius: 'var(--br-9xl)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        zIndex: 10000,
        fontSize: '14px',
        fontFamily: 'var(--body)',
        fontWeight: 500,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent 80%)',
      }}
    >
      {message}
    </div>
  );
}

