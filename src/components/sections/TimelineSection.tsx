'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Zap, Radio, Globe } from 'lucide-react';
import { useSoundFX } from '@/hooks/useSoundFX';

interface Milestone {
  id: string;
  year: string;
  earth: string;
  tag: string;
  title: string;
  caption: string;
  telemetry: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    year: '1962 // AMAZING FANTASY #15',
    earth: 'EARTH-616',
    tag: 'The Genesis',
    title: 'THE RADIOACTIVE BITE & THE VOW',
    caption:
      'Midtown High science prodigy Peter Parker is bitten by an irradiated arachnid. After the devastating loss of Uncle Ben, a universal creed is born: With Great Power, There Must Also Come Great Responsibility.',
    telemetry: 'GENETIC TRANSCRIPTION 100% // CANON EVENT 01 LOCKED',
    icon: Zap,
    accent: '#E62429',
  },
  {
    id: 'm2',
    year: '1992 // NUEVA YORK 2099',
    earth: 'EARTH-928',
    tag: 'Cybernetic Destiny',
    title: 'ALCHEMAX & MIGUEL O\'HARA',
    caption:
      'In a neon cyberpunk future dominated by mega-corporations, geneticist Miguel O’Hara splices his DNA with 50% spider genetics during a corporate betrayal. Armed with razor talons and solid-light gliders, 2099 rises.',
    telemetry: 'UNSTABLE MOLECULES SYNCED // LYLA AI ACTIVE',
    icon: Shield,
    accent: '#00F0FF',
  },
  {
    id: 'm3',
    year: '2011 // BROOKLYN VISIONS',
    earth: 'EARTH-1610',
    tag: 'Brooklyn Vanguard',
    title: 'MILES MORALES: LEAP OF FAITH',
    caption:
      'Following the tragic sacrifice of Peter Parker, 13-year-old Brooklyn teen Miles Morales manifests bio-electric venom blasts and optical camouflage. With a spray-painted spider on his chest, he takes the Leap of Faith.',
    telemetry: 'BIO-VOLTAGE DISCHARGE 1.2MV // BROOKLYN PROTECTED',
    icon: Sparkles,
    accent: '#FFE600',
  },
  {
    id: 'm4',
    year: '2018 - PRESENT // WEB OF DESTINY',
    earth: 'MULTIVERSE NEXUS',
    tag: 'The Spider-Society',
    title: 'ACROSS THE MULTIVERSE ALLIANCE',
    caption:
      'From Spider-Punk’s sonic guitars (Earth-138) and Peter Parker Noir’s 1933 shadows (Earth-90214) to Ghost-Spider, hundreds of variants unite across the Web of Life and Destiny to defend the continuum.',
    telemetry: '840+ SPIDER-VARIANTS ONLINE // CANON INTEGRITY 100%',
    icon: Globe,
    accent: '#A855F7',
  },
];

export const TimelineSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { playHover } = useSoundFX();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDist = el.offsetHeight - windowHeight * 0.4;
      const progress = Math.max(0, Math.min((-rect.top + windowHeight * 0.3) / totalDist, 1));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalPathLength = 1200;
  const strokeOffset = totalPathLength * (1 - scrollProgress);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="relative w-full py-28 px-4 md:px-8 bg-[#07070B] overflow-hidden"
      aria-label="Spider-Man Multiverse Canon Timeline"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 glass-panel px-3.5 py-1 rounded-full border border-red-500/40 text-xs font-mono text-red-400 tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(230,36,41,0.2)]">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            THE WEB OF LIFE AND DESTINY // CHRONOLOGY
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight text-white uppercase leading-none mb-4">
            Multiverse <span className="text-glow-spider text-red-500">Canon</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-light">
            Tracing key canon events across dimensions. Scroll to spin the Great Web and witness the pivotal moments that bind every Spider-Hero together.
          </p>
        </div>

        {/* Timeline Container with Vertical SVG Web Strand */}
        <div className="relative">
          {/* Central Vertical SVG Web Strand */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 pointer-events-none hidden sm:block">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 32 1200">
              <defs>
                <linearGradient id="webTimelineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#E62429" />
                  <stop offset="65%" stopColor="#00F0FF" />
                  <stop offset="100%" stopColor="#FFE600" />
                </linearGradient>
                <filter id="webLineGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background Guide Line */}
              <line
                x1="16"
                y1="0"
                x2="16"
                y2="1200"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />

              {/* Active Glowing Silk Web Line */}
              <line
                x1="16"
                y1="0"
                x2="16"
                y2="1200"
                stroke="url(#webTimelineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#webLineGlow)"
                style={{
                  strokeDasharray: totalPathLength,
                  strokeDashoffset: strokeOffset,
                  transition: 'stroke-dashoffset 0.1s linear',
                }}
              />
            </svg>
          </div>

          {/* Milestones List */}
          <div className="space-y-16 md:space-y-24">
            {MILESTONES.map((milestone, idx) => {
              const IconComp = milestone.icon;
              const nodeThreshold = (idx + 0.3) / MILESTONES.length;
              const isNodeActive = scrollProgress >= nodeThreshold;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={milestone.id}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Content Card */}
                  <motion.div
                    initial={{ opacity: 0.2, y: 30 }}
                    animate={{
                      opacity: isNodeActive ? 1 : 0.25,
                      y: isNodeActive ? 0 : 20,
                      scale: isNodeActive ? 1 : 0.96,
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    onMouseEnter={playHover}
                    className="w-full md:w-[calc(50%-48px)] glass-panel-glow p-6 md:p-8 rounded-3xl border border-white/10 hover:border-red-500/40 transition-colors shadow-xl bg-[#090912]/90 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <span className="text-xs font-mono font-bold text-red-400 tracking-widest uppercase">
                        {milestone.year}
                      </span>
                      <span className="glass-panel px-3 py-1 rounded-full border border-red-500/30 text-[10px] font-mono text-cyan-300">
                        {milestone.earth}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl text-white uppercase mb-3 group-hover:text-red-400 transition-colors">
                      {milestone.title}
                    </h3>

                    <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed mb-6">
                      {milestone.caption}
                    </p>

                    <div className="border-t border-white/5 pt-3 text-[11px] font-mono text-red-400/90 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      {milestone.telemetry}
                    </div>
                  </motion.div>

                  {/* Pulsing Node Anchor on Center Line */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full items-center justify-center z-20">
                    <motion.div
                      animate={{
                        scale: isNodeActive ? [1, 1.25, 1] : 1,
                        boxShadow: isNodeActive
                          ? `0 0 25px ${milestone.accent}`
                          : '0 0 0px transparent',
                      }}
                      transition={{ repeat: Infinity, duration: 2.2 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
                        isNodeActive
                          ? 'bg-gradient-to-tr from-red-600 to-blue-600 text-white'
                          : 'bg-slate-900 border border-white/20 text-slate-500'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </motion.div>
                  </div>

                  {/* Spacer for symmetry on desktop */}
                  <div className="hidden md:block w-[calc(50%-48px)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
