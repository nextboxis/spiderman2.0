'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import { voltAnimationConfig } from '@/config/animationConfig';
import { GravimetricSlider } from '../ui/GravimetricSlider';

const STATEMENTS = [
  {
    tag: 'AXIOM // 01',
    headline: 'WITH GREAT POWER COMES RESPONSIBILITY.',
    body: 'Uncle Ben’s eternal lesson remains the unbreakable anchor across every dimension. Having the strength to act means you never have the right to look away.',
  },
  {
    tag: 'AXIOM // 02',
    headline: 'ANYONE CAN WEAR THE MASK.',
    body: 'It isn’t your DNA, your borough, or your dimension that defines the hero. It’s having the courage to step off the ledge, shoot your web, and take the leap of faith.',
  },
  {
    tag: 'AXIOM // 03',
    headline: 'WE ALWAYS GET BACK UP.',
    body: 'No matter how devastating the blow, no matter how many canon events threaten to shatter reality, Spider-Man always rises. That single truth binds the entire Web of Life and Destiny.',
  },
];

export const ManifestoSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { normalizedVelocity } = useScrollVelocity();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalHeight = el.offsetHeight - window.innerHeight;
      const currentProgress = Math.max(0, Math.min(-rect.top / totalHeight, 1));
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine active statement index
  const activeIndex = Math.min(Math.floor(scrollProgress * 3), 2);

  // Kinetic tilt angles selling multiversal dimensional disorientation
  const tiltZ = (scrollProgress - 0.5) * voltAnimationConfig.manifesto.cameraTiltMaxDeg * -2;
  const tiltX = Math.sin(scrollProgress * Math.PI) * 6;

  // Velocity-driven word drift offset
  const velocityOffset = normalizedVelocity * voltAnimationConfig.manifesto.wordVelocityDriftMax;

  return (
    <section
      id="manifesto"
      ref={containerRef}
      className="relative w-full h-[300vh] bg-[#07070B]"
      aria-label="Spider-Man Multiverse Creed & Manifesto"
    >
      {/* Sticky Fullscreen Scrollytelling Viewport */}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden px-4 md:px-8">
        {/* Tilting Atmospheric Background Matrix */}
        <div
          className="absolute inset-0 w-[120vw] h-[120vh] -left-[10vw] -top-[10vh] pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(1000px) rotateZ(${tiltZ.toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg)`,
          }}
        >
          {/* Atmospheric High-Res Metropolis Depth Layer */}
          <div className="absolute inset-0 w-full h-full opacity-25 mix-blend-luminosity overflow-hidden pointer-events-none">
            <Image
              src="/images/spider-man-across-3840x2160-10010.jpg"
              alt="Multiverse Portal Skyline"
              fill
              sizes="100vw"
              className="object-cover object-center filter blur-[1px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07070B] via-transparent to-[#07070B] opacity-90" />
          </div>

          {/* Spider-Web Blueprint Overlay */}
          <div className="absolute inset-0 web-pattern-bg opacity-40" />

          {/* Floating Dimensional Shards */}
          <div
            className="absolute top-1/4 left-1/6 w-64 h-64 border border-red-500/20 rounded-3xl transform rotate-45 transition-transform duration-500"
            style={{ transform: `rotate(${45 + scrollProgress * 60}deg) translateY(${scrollProgress * -40}px)` }}
          />
          <div
            className="absolute bottom-1/4 right-1/6 w-80 h-80 border border-blue-500/20 rounded-full transition-transform duration-500"
            style={{ transform: `scale(${0.8 + scrollProgress * 0.4})` }}
          />
        </div>

        {/* Dynamic Progress Indicator Bar on side */}
        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-4 z-20">
          <span className="text-[10px] font-mono text-red-400 rotate-90 uppercase tracking-widest origin-center font-bold">
            WEB CONVERGENCE
          </span>
          <div className="w-1 h-36 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="w-full bg-gradient-to-b from-[#E62429] via-[#FFE600] to-[#0066FF] rounded-full transition-all duration-150"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-400 font-bold">
            0{activeIndex + 1}/03
          </span>
        </div>

        {/* Centered Statement Panels */}
        <div className="relative z-10 max-w-4xl w-full mx-auto text-center px-4">
          {STATEMENTS.map((item, index) => {
            const isCurrent = index === activeIndex;
            return (
              <div
                key={item.tag}
                className={`transition-all duration-700 absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center ${
                  isCurrent
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                {/* Axiom Badge */}
                <div className="inline-flex items-center gap-2 glass-panel px-4 py-1 rounded-full border border-red-500/40 text-xs font-mono text-red-400 tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(230,36,41,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {item.tag}
                </div>

                {/* Splitting Kinetic Headline */}
                <h2 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white uppercase mb-6 leading-tight select-none">
                  {item.headline.split(' ').map((word, wIdx) => {
                    // Alternate word horizontal drift on scroll velocity
                    const wordDrift = (wIdx % 2 === 0 ? 1 : -1) * velocityOffset;
                    return (
                      <span
                        key={wIdx}
                        className="inline-block mx-2 sm:mx-3 transition-transform duration-100 text-glow-spider-red text-white"
                        style={{
                          transform: `translateX(${wordDrift.toFixed(1)}px)`,
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </h2>

                {/* Expository Body Text */}
                <p className="max-w-2xl text-slate-200 text-base md:text-xl font-light leading-relaxed">
                  {item.body}
                </p>

                {/* Velocity Alert Tag */}
                {Math.abs(normalizedVelocity) > 0.4 && (
                  <div className="mt-8 text-xs font-mono text-red-400 uppercase tracking-widest animate-pulse font-bold">
                    [ DIMENSIONAL FLUX ACCELERATION: {(normalizedVelocity * 100).toFixed(0)}% ]
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll Prompt Guidance */}
        <div className="absolute bottom-8 inset-x-0 flex justify-center z-20">
          <div className="glass-panel px-4 py-1.5 rounded-full border border-white/10 text-[11px] font-mono uppercase tracking-widest text-slate-400">
            Scroll To Navigate The Web [{Math.round(scrollProgress * 100)}%]
          </div>
        </div>
      </div>

      {/* Interactive Multiverse Dimensional Comparison Slider */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-8 py-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-1 rounded-full border border-red-500/40 text-xs font-mono text-red-400 tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(230,36,41,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            DIMENSIONAL RIFT INSPECTOR
          </div>
          <h3 className="font-display text-3xl sm:text-5xl text-white uppercase">
            Classic Earth-616 <span className="text-red-500 text-glow-spider-red">vs</span> Spider-Verse Earth-1610
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2 font-light">
            Drag the dimensional divider to compare Peter Parker’s Manhattan skyline with Miles Morales’ cosmic Spider-Verse freefall.
          </p>
        </div>
        <GravimetricSlider
          beforeLabel="EARTH-616 // MANHATTAN DUSK"
          afterLabel="EARTH-1610 // SPIDER-VERSE RIFT"
        />
      </div>
    </section>
  );
};
