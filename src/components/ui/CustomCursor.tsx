'use client';

import React, { useSyncExternalStore } from 'react';
import { useCursor } from '@/hooks/useCursor';

const emptySubscribe = () => () => {};

export const CustomCursor: React.FC = () => {
  const cursor = useCursor();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted || cursor.x < 0 || cursor.y < 0) return null;

  // Compute web stretch factor based on speed
  const stretchFactor = Math.min(cursor.speed * 0.18, 2.2);
  const ringScaleX = 1 + stretchFactor;
  const ringScaleY = Math.max(1 - stretchFactor * 0.35, 0.45);

  const isInteractive = cursor.isHovered;
  const isClicking = cursor.isClicking;

  // Web strand trailing coordinates
  const tailX = cursor.x - Math.cos((cursor.angle * Math.PI) / 180) * cursor.stretch;
  const tailY = cursor.y - Math.sin((cursor.angle * Math.PI) / 180) * cursor.stretch;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block"
      aria-hidden="true"
    >
      {/* Dynamic Spider Web Filament SVG trailing line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="webGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#E62429" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {cursor.stretch > 10 && (
          <>
            {/* Outer Glow Stroke */}
            <line
              x1={tailX}
              y1={tailY}
              x2={cursor.x}
              y2={cursor.y}
              stroke="#E62429"
              strokeWidth={Math.min(cursor.speed * 0.8 + 4, 7)}
              strokeLinecap="round"
              opacity={0.35}
            />
            {/* Core Web Filament */}
            <line
              x1={tailX}
              y1={tailY}
              x2={cursor.x}
              y2={cursor.y}
              stroke="url(#webGradient)"
              strokeWidth={Math.min(cursor.speed * 0.5 + 1.5, 3.0)}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {/* Main Spider-Sense Reticle */}
      <div
        className="absolute top-0 left-0 transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%) rotate(${cursor.angle}deg)`,
        }}
      >
        {/* Outer Spider-Sense Crosshair Ring */}
        <div
          className={`relative rounded-full border transition-all duration-200 ease-out flex items-center justify-center ${
            isInteractive
              ? 'w-14 h-14 border-[#E62429] bg-[#E62429]/15 shadow-[0_0_25px_rgba(230,36,41,0.7)]'
              : 'w-8 h-8 border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.5)]'
          } ${isClicking ? 'scale-75' : ''}`}
          style={{
            transform: `scale(${isInteractive ? 1.3 : 1}) scale(${ringScaleX}, ${ringScaleY})`,
          }}
        >
          {/* 4 Cardinal Spider-Sense Crosshair Notches */}
          <div className="absolute top-0 w-0.5 h-1.5 bg-[#E62429]" />
          <div className="absolute bottom-0 w-0.5 h-1.5 bg-[#E62429]" />
          <div className="absolute left-0 w-1.5 h-0.5 bg-[#E62429]" />
          <div className="absolute right-0 w-1.5 h-0.5 bg-[#E62429]" />

          {/* Inner Spider Web Core Dot */}
          <div
            className={`rounded-full transition-all duration-150 ${
              isInteractive
                ? 'w-2.5 h-2.5 bg-[#FFE600] shadow-[0_0_10px_#FFE600]'
                : 'w-1.5 h-1.5 bg-white shadow-[0_0_6px_#FFFFFF]'
            }`}
          />
        </div>

        {/* Orbiting Spider-Sense Warning Arc */}
        {isInteractive && (
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E62429] -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_8px_#E62429]" />
          </div>
        )}
      </div>
    </div>
  );
};
