'use client';

import { useRef, useState, useEffect } from 'react';
import { voltAnimationConfig } from '@/config/animationConfig';

interface MagneticOptions {
  radius?: number;
  strength?: number;
  disabled?: boolean;
}

export function useMagnetic<T extends HTMLElement = HTMLButtonElement>(options: MagneticOptions = {}) {
  const ref = useRef<T | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isAttracted, setIsAttracted] = useState(false);

  const radius = options.radius ?? voltAnimationConfig.magnetic.pullRadius;
  const strength = options.strength ?? voltAnimationConfig.magnetic.pullFactor;
  const disabled = options.disabled ?? false;

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);

      if (distance < radius) {
        setIsAttracted(true);
        // Magnetic pull toward cursor
        const pullX = distX * strength * voltAnimationConfig.globalMotionScale;
        const pullY = distY * strength * voltAnimationConfig.globalMotionScale;
        setPosition({ x: pullX, y: pullY });
      } else {
        setIsAttracted(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setIsAttracted(false);
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [radius, strength, disabled]);

  return { ref, x: position.x, y: position.y, isAttracted };
}
