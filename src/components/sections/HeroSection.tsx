'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';
import { Mobile2DFallback } from '../canvas/Mobile2DFallback';
import { voltAnimationConfig } from '@/config/animationConfig';
import { ChevronDown, Sparkles, Activity, Compass, Zap } from 'lucide-react';
import { useSoundFX } from '@/hooks/useSoundFX';

// Dynamic import of 3D scene for performance and SSR safety
const HeroScene3D = dynamic(
  () => import('../canvas/HeroScene3D').then((mod) => mod.HeroScene3D),
  { ssr: false, loading: () => <Mobile2DFallback /> }
);

interface HeroSectionProps {
  isLoaded: boolean;
}

interface HeroProfile {
  id: string;
  name: string;
  alias: string;
  earth: string;
  quote: string;
  color: string;
  accentText: string;
  threatMatrix: string;
  webConductance: string;
}

const HERO_PROFILES: HeroProfile[] = [
  {
    id: 'peter',
    name: 'Peter Parker',
    alias: 'The Amazing Spider-Man',
    earth: 'Earth-616',
    quote: '"With great power comes great responsibility. This is my gift, my curse."',
    color: '#E62429',
    accentText: 'text-red-500 text-glow-spider-red',
    threatMatrix: 'SINISTER SYNDICATE // ELEVATED',
    webConductance: '100% TENSILE FORMULA',
  },
  {
    id: 'miles',
    name: 'Miles Morales',
    alias: 'Spider-Man of Brooklyn',
    earth: 'Earth-1610',
    quote: '"Everyone keeps telling me how my story is supposed to go. Nah. I’ma do my own thing."',
    color: '#FFE600',
    accentText: 'text-amber-400 text-glow-miles-gold',
    threatMatrix: 'ANOMALY DETECTED // HIGH',
    webConductance: '1.4 MV BIO-ELECTRIC',
  },
  {
    id: 'miguel',
    name: 'Miguel O’Hara',
    alias: 'Spider-Man 2099',
    earth: 'Earth-928',
    quote: '"I’m not like the rest of you. I do what has to be done to save the multiverse."',
    color: '#00F0FF',
    accentText: 'text-cyan-400 text-glow-cyan',
    threatMatrix: 'CANON EVENT // CRITICAL',
    webConductance: 'SOLID-LIGHT FILAMENTS',
  },
  {
    id: 'hobie',
    name: 'Hobie Brown',
    alias: 'Spider-Punk',
    earth: 'Earth-138',
    quote: '"I don’t believe in consistency. Or authority. Let’s play it loud."',
    color: '#EC4899',
    accentText: 'text-pink-400 text-glow-violet',
    threatMatrix: 'SYSTEM OVERRIDE // ANARCHY',
    webConductance: '148 dB ACOUSTIC SURGE',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ isLoaded }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeHero, setActiveHero] = useState<HeroProfile>(HERO_PROFILES[0]);
  const { playThwip, playSpiderSense } = useSoundFX();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const headlineLine1 = 'BE GREATER.';
  const headlineLine2 = 'TOGETHER.';

  const handleSwitchHero = (hero: HeroProfile) => {
    setActiveHero(hero);
    playThwip();
    playSpiderSense();
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#07070B] pt-28 pb-20 select-none"
      aria-label="Spider-Man Multiverse Hero Section"
    >
      {/* 3D or 2D Interactive Canvas Layer */}
      {isMobile ? <Mobile2DFallback /> : <HeroScene3D />}

      {/* Atmospheric Depth Gradients */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#07070B]/50 to-[#07070B] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#07070B] via-[#07070B]/80 to-transparent pointer-events-none" />

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
        {/* Spider-Sense Threat Telemetry Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full border border-red-500/40 mb-6 shadow-[0_0_25px_rgba(230,36,41,0.3)] animate-spider-sense"
        >
          <span className="w-2 h-2 rounded-full bg-[#E62429] animate-ping" />
          <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
            SPIDER-SENSE ONLINE // {activeHero.earth} MATRIX LOCKED
          </span>
        </motion.div>

        {/* Hero Character Quick-Switcher Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex items-center gap-1.5 sm:gap-3 glass-panel p-1.5 rounded-2xl border border-white/10 mb-8 max-w-2xl overflow-x-auto"
        >
          {HERO_PROFILES.map((hero) => {
            const isActive = activeHero.id === hero.id;
            return (
              <button
                key={hero.id}
                onClick={() => handleSwitchHero(hero)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E62429] to-[#0066FF] text-white font-bold shadow-[0_0_20px_rgba(230,36,41,0.5)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hero.color }} />
                <span>{hero.name}</span>
                <span className="hidden sm:inline text-[9px] opacity-70">({hero.earth})</span>
              </button>
            );
          })}
        </motion.div>

        {/* Letter-by-Letter Animated Display Headline */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white leading-none uppercase select-none mb-6">
          {/* Line 1 */}
          <div className="flex flex-wrap justify-center overflow-hidden py-1">
            {headlineLine1.split('').map((char, index) => (
              <motion.span
                key={`l1-${index}`}
                initial={{ y: 120, opacity: 0, rotate: index % 2 === 0 ? 12 : -12 }}
                animate={
                  isLoaded
                    ? {
                        y: [0, index % 2 === 0 ? -6 : 6, 0],
                        opacity: 1,
                        rotate: 0,
                      }
                    : {}
                }
                transition={
                  isLoaded
                    ? {
                        y: {
                          repeat: Infinity,
                          repeatType: 'reverse',
                          duration: 2.8 + (index % 3) * 0.4,
                          ease: 'easeInOut',
                          delay: index * voltAnimationConfig.hero.letterStaggerDelay,
                        },
                        opacity: {
                          duration: 0.6,
                          delay: index * voltAnimationConfig.hero.letterStaggerDelay,
                        },
                      }
                    : {}
                }
                className={`inline-block ${char === ' ' ? 'w-4 md:w-8' : ''} text-glow-spider-red text-white`}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Line 2 with Spider-Red to Electric-Blue Glow */}
          <div className="flex flex-wrap justify-center overflow-hidden py-1">
            {headlineLine2.split('').map((char, index) => (
              <motion.span
                key={`l2-${index}`}
                initial={{ y: 120, opacity: 0, rotate: index % 2 === 0 ? -12 : 12 }}
                animate={
                  isLoaded
                    ? {
                        y: [0, index % 2 === 0 ? 6 : -6, 0],
                        opacity: 1,
                        rotate: 0,
                      }
                    : {}
                }
                transition={
                  isLoaded
                    ? {
                        y: {
                          repeat: Infinity,
                          repeatType: 'reverse',
                          duration: 3.2 + (index % 3) * 0.4,
                          ease: 'easeInOut',
                          delay: 0.35 + index * voltAnimationConfig.hero.letterStaggerDelay,
                        },
                        opacity: {
                          duration: 0.6,
                          delay: 0.35 + index * voltAnimationConfig.hero.letterStaggerDelay,
                        },
                      }
                    : {}
                }
                className={`inline-block ${char === ' ' ? 'w-4 md:w-8' : ''} text-transparent bg-clip-text bg-gradient-to-r from-[#E62429] via-[#FFE600] to-[#0066FF] text-glow-spider-red`}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </h1>

        {/* Dynamic Character Quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHero.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mb-8"
          >
            <p className="text-base sm:text-lg md:text-xl text-slate-200 font-light italic leading-relaxed mb-2">
              {activeHero.quote}
            </p>
            <span className={`text-xs font-mono uppercase tracking-widest font-semibold ${activeHero.accentText}`}>
              {`— ${activeHero.alias} // ${activeHero.earth}`}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Primary Interactive Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <MagneticButton
            variant="primary"
            size="lg"
            onClick={() => {
              playThwip();
              document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-gradient-to-r from-[#E62429] to-[#0066FF] border-red-500/60 shadow-[0_0_30px_rgba(230,36,41,0.45)] text-white"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            Explore 26-Suit Armory (4K/8K)
          </MagneticButton>

          <MagneticButton
            variant="secondary"
            size="lg"
            onClick={() => {
              playThwip();
              document.getElementById('abilities')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="border-white/20 hover:border-red-500/50"
          >
            <Zap className="w-4 h-4 text-red-400" />
            Web Traversal Engine
          </MagneticButton>
        </motion.div>

        {/* Floating HUD Telemetry Readouts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full"
        >
          <div className="glass-panel px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3 text-left">
            <Activity className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Cartridge Pressure</div>
              <div className="text-sm font-bold text-white font-mono">300 PSI // LOCKED</div>
            </div>
          </div>

          <div className="glass-panel px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3 text-left">
            <Compass className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Web Conductance</div>
              <div className="text-sm font-bold text-white font-mono">{activeHero.webConductance}</div>
            </div>
          </div>

          <div className="glass-panel px-4 py-3 rounded-2xl border border-white/5 col-span-2 md:col-span-1 flex items-center gap-3 text-left">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#FFE600] shrink-0" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Threat Matrix</div>
              <div className="text-sm font-bold text-amber-300 font-mono">{activeHero.threatMatrix}</div>
            </div>
          </div>
        </motion.div>

        {/* Kinetic Scroll Down Trigger */}
        <motion.a
          href="#manifesto"
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-14 inline-flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          <span>Descend Into The Web</span>
          <ChevronDown className="w-4 h-4 text-red-500 animate-bounce" />
        </motion.a>
      </div>
    </section>
  );
};
