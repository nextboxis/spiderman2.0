'use client';

import { useState, useEffect, useRef } from 'react';
import { voltAnimationConfig } from '@/config/animationConfig';

export interface CursorState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  angle: number;
  stretch: number;
  isHovered: boolean;
  isClicking: boolean;
  targetType: 'default' | 'button' | 'link' | 'card';
}

export function useCursor() {
  const [cursorState, setCursorState] = useState<CursorState>({
    x: -100,
    y: -100,
    prevX: -100,
    prevY: -100,
    velocityX: 0,
    velocityY: 0,
    speed: 0,
    angle: 0,
    stretch: 0,
    isHovered: false,
    isClicking: false,
    targetType: 'default',
  });

  const mousePosRef = useRef({ x: -100, y: -100 });
  const prevPosRef = useRef({ x: -100, y: -100 });
  const lastTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    lastTimeRef.current = Date.now();
    // Disable custom cursor on touch devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      settledRef.current = false;

      // Detect hover target
      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest('button, a, [data-interactive="true"], input');
      let targetType: CursorState['targetType'] = 'default';

      if (interactiveEl) {
        if (interactiveEl.tagName === 'BUTTON') targetType = 'button';
        else if (interactiveEl.tagName === 'A') targetType = 'link';
        else targetType = 'card';
      }

      setCursorState((prev) => {
        if (prev.isHovered === !!interactiveEl && prev.targetType === targetType) {
          return prev;
        }
        return {
          ...prev,
          isHovered: !!interactiveEl,
          targetType,
        };
      });
    };

    const handleMouseDown = () => {
      setCursorState((prev) => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = () => {
      setCursorState((prev) => ({ ...prev, isClicking: false }));
    };

    // Physics update loop
    const updatePhysics = () => {
      const now = Date.now();
      const dt = Math.max((now - lastTimeRef.current) / 1000, 0.001);
      lastTimeRef.current = now;

      const currentX = mousePosRef.current.x;
      const currentY = mousePosRef.current.y;
      const prevX = prevPosRef.current.x;
      const prevY = prevPosRef.current.y;

      const dx = currentX - prevX;
      const dy = currentY - prevY;
      const distance = Math.hypot(dx, dy);

      // Settle check: If cursor hasn't moved and is already stationary, avoid re-rendering
      if (distance < 0.2) {
        if (settledRef.current) {
          rafRef.current = requestAnimationFrame(updatePhysics);
          return;
        }
        settledRef.current = true;
      } else {
        settledRef.current = false;
      }

      const rawSpeed = distance / (dt * 100); // normalized speed
      const speed = Math.min(rawSpeed, 12);
      const angle = distance > 0.5 ? Math.atan2(dy, dx) * (180 / Math.PI) : 0;
      const stretch = Math.min(
        distance * voltAnimationConfig.cursor.stretchMultiplier,
        voltAnimationConfig.cursor.maxTetherLength
      );

      prevPosRef.current = { x: currentX, y: currentY };

      setCursorState((prev) => ({
        ...prev,
        x: currentX,
        y: currentY,
        prevX,
        prevY,
        velocityX: dx,
        velocityY: dy,
        speed,
        angle: angle || prev.angle,
        stretch,
      }));

      rafRef.current = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    rafRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return cursorState;
}
