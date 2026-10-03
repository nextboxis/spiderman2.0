'use client';

import React from 'react';

export const GrainOverlay: React.FC = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Subtle Hardware-Accelerated CRT / Cyber Scanline Texture */}
      <div className="absolute inset-0 w-full h-full scanlines-overlay opacity-20 pointer-events-none will-change-transform" />

      {/* Cinematic Vignette Edge Shading */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(7,7,11,0.85)_100%)] pointer-events-none" />
    </div>
  );
};
