'use client';

import React, { useState, useRef, useCallback, TouchEvent, MouseEvent } from 'react';
import Image from 'next/image';
import { MoveHorizontal, Zap, Compass } from 'lucide-react';

interface GravimetricSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const GravimetricSlider: React.FC<GravimetricSliderProps> = ({
  beforeImage = '/images/marvels-spider-man-3840x2160-13013.jpeg',
  afterImage = '/images/spider-man-across-3840x2160-11773.jpg',
  beforeLabel = 'EARTH-616 // MANHATTAN DUSK',
  afterLabel = 'EARTH-1610 // SPIDER-VERSE RIFT',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      className="relative w-full h-[450px] sm:h-[540px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl select-none group cursor-ew-resize"
      role="slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Gravimetric Inversion Comparison Slider"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setSliderPosition((p) => Math.max(0, p - 5));
        if (e.key === 'ArrowRight') setSliderPosition((p) => Math.min(100, p + 5));
      }}
    >
      {/* Background Layer: "After" Zero-G Stratosphere */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070B] via-transparent to-transparent opacity-80" />
        <div className="absolute top-6 right-6 glass-panel px-4 py-1.5 rounded-full border border-violet-400/40 text-xs font-mono text-violet-300 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          {afterLabel}
        </div>
      </div>

      {/* Clipped Layer: "Before" 1.0G Ground Metropolis */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden transition-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full min-w-[700px] md:min-w-[1200px]">
          <Image
            src={beforeImage}
            alt={beforeLabel}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070B] via-transparent to-transparent opacity-80" />
        </div>
        <div className="absolute top-6 left-6 glass-panel px-4 py-1.5 rounded-full border border-cyan-400/40 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          {beforeLabel}
        </div>
      </div>

      {/* Dividing Split Line & Center Handle */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 via-white to-violet-500 pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.8)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Interactive Handle Button */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={() => setIsDragging(true)}
          className="pointer-events-auto absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full glass-panel-glow border border-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,211,238,0.8)] cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
        >
          <MoveHorizontal className="w-5 h-5 text-cyan-200" />
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none">
        <div className="glass-panel px-5 py-2 rounded-full border border-white/10 text-[11px] font-mono uppercase tracking-widest text-slate-300 flex items-center gap-3">
          <span className="text-red-400 font-bold">Earth-616 Dusk</span>
          <span>◄ DRAG DIMENSIONAL RIFT ({Math.round(sliderPosition)}%) ►</span>
          <span className="text-purple-400 font-bold">Earth-1610 Spider-Verse</span>
        </div>
      </div>
    </div>
  );
};
