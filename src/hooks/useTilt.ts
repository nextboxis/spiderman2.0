'use client';

import { useState, useRef, useCallback, MouseEvent } from 'react';
import { voltAnimationConfig } from '@/config/animationConfig';

interface TiltOptions {
  maxTilt?: number;
  perspective?: number;
  glare?: boolean;
}

export function useTilt<T extends HTMLElement = HTMLDivElement>(options: TiltOptions = {}) {
  const ref = useRef<T | null>(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
  });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const maxTilt = options.maxTilt ?? voltAnimationConfig.tilt.maxTiltDeg;
  const perspective = options.perspective ?? voltAnimationConfig.tilt.perspective;
  const showGlare = options.glare ?? true;

  const handleMouseMove = useCallback((e: MouseEvent<T>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 2 - 1; // -1 to 1
    const percentY = (y / rect.height) * 2 - 1; // -1 to 1

    const tiltX = -percentY * maxTilt * voltAnimationConfig.globalMotionScale;
    const tiltY = percentX * maxTilt * voltAnimationConfig.globalMotionScale;

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.08s ease-out',
    });

    if (showGlare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: voltAnimationConfig.tilt.glareOpacity,
      });
    }
  }, [maxTilt, perspective, showGlare]);

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    });
    if (showGlare) {
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [perspective, showGlare]);

  return {
    ref,
    tiltProps: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      style: tiltStyle,
    },
    glarePosition,
  };
}
