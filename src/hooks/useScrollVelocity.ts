'use client';

import { useState, useEffect, useRef } from 'react';

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const [normalizedVelocity, setNormalizedVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    lastTimestamp.current = Date.now();
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(now - lastTimestamp.current, 10);
      const currentScrollY = window.scrollY;
      const dy = currentScrollY - lastScrollY.current;

      const rawVelocity = (dy / dt) * 100; // px per 100ms
      lastScrollY.current = currentScrollY;
      lastTimestamp.current = now;

      setVelocity(rawVelocity);
      // Normalized between -1 and 1 with clamping
      setNormalizedVelocity(Math.max(Math.min(rawVelocity / 150, 1), -1));
    };

    // Decay loop to smoothly return velocity to 0 when scrolling stops
    const decay = () => {
      setVelocity((prev) => (Math.abs(prev) < 0.1 ? 0 : prev * 0.9));
      setNormalizedVelocity((prev) => (Math.abs(prev) < 0.005 ? 0 : prev * 0.9));
      rafRef.current = requestAnimationFrame(decay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(decay);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { velocity, normalizedVelocity };
}
