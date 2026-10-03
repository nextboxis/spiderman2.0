'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Radio, Terminal, Disc, Share2, Globe } from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';
import { useSoundFX } from '@/hooks/useSoundFX';

const SPIDER_COMM_LINKS = [
  {
    name: 'SPIDER-SOCIETY CITADEL // DISCORD',
    icon: Radio,
    href: '#',
    freq: 2.4,
    amp: 10,
    phase: 0,
  },
  {
    name: 'PARKER TECH LAB // GITHUB',
    icon: Terminal,
    href: '#',
    freq: 3.1,
    amp: 13,
    phase: 1.4,
  },
  {
    name: 'METRO-SOUNDTRACK // SPIDER-VERSE',
    icon: Disc,
    href: '#',
    freq: 2.7,
    amp: 9,
    phase: 2.8,
  },
  {
    name: 'MULTIVERSE DISPATCH // GLOBAL',
    icon: Share2,
    href: '#',
    freq: 3.4,
    amp: 11,
    phase: 4.2,
  },
];

export const FooterSection: React.FC = () => {
  const [isLanding, setIsLanding] = useState(false);
  const { playWebZip, playHover } = useSoundFX();

  const returnToSkyline = () => {
    setIsLanding(true);
    playWebZip();

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(() => {
      setIsLanding(false);
    }, 1200);
  };

  return (
    <footer
      className="relative w-full py-20 px-4 md:px-8 bg-[#050508] border-t border-white/10 overflow-hidden"
      aria-label="Spider-Man Multiverse Footer"
    >
      {/* Background Ambience */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
          {/* Brand & Creed */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-blue-600 flex items-center justify-center p-2 shadow-[0_0_25px_rgba(230,36,41,0.5)]">
                {/* Spider Emblem */}
                <svg viewBox="0 0 24 24" className="w-full h-full fill-white" aria-hidden="true">
                  <path d="M12 2C10.5 4 8 7 8 11C8 13.5 9.5 15.5 12 16C14.5 15.5 16 13.5 16 11C16 7 13.5 4 12 2ZM4 8C6 9 7.5 11 8 13L5 15C4 13 3 10.5 4 8ZM20 8C21 10.5 20 13 19 15L16 13C16.5 11 18 9 20 8ZM2 14C3.5 15 6 16 7 16.5L6 19C4 18 2.5 16.5 2 14ZM22 14C21.5 16.5 20 18 18 19L17 16.5C18 16 20.5 15 22 14ZM8 17.5L6.5 22C8 22.5 10 22 11 21L10.5 18C9.5 18 8.8 17.8 8 17.5ZM16 17.5C15.2 17.8 14.5 18 13.5 18L13 21C14 22 16 22.5 17.5 22L16 17.5Z" />
                </svg>
              </div>
              <span className="font-display text-2xl sm:text-3xl tracking-widest text-white leading-none">
                SPIDER-MAN
              </span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm font-light max-w-md leading-relaxed">
              Dedicated to the belief that anyone can wear the mask. Celebrating Peter Parker, Miles Morales, Miguel O’Hara, and every hero united across the Web of Life and Destiny.
            </p>
          </div>

          {/* Floating Comm Badges on Independent Sine Waves */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            {SPIDER_COMM_LINKS.map((item) => {
              const IconComp = item.icon;
              return (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onMouseEnter={playHover}
                  animate={{
                    y: [-item.amp, item.amp, -item.amp],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    duration: item.freq,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: item.phase,
                  }}
                  className="group glass-panel p-4 rounded-2xl border border-white/10 hover:border-red-500/60 hover:shadow-[0_0_25px_rgba(230,36,41,0.4)] transition-all cursor-pointer bg-[#090912]/80"
                  aria-label={item.name}
                  title={item.name}
                >
                  <IconComp className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                </motion.a>
              );
            })}
          </div>

          {/* Return To Skyline (Web-Zip to Top) Button */}
          <div>
            <MagneticButton
              variant="primary"
              size="md"
              onClick={returnToSkyline}
              className="text-xs flex items-center gap-2"
            >
              <ArrowUp className={`w-4 h-4 text-white ${isLanding ? 'animate-ping' : 'animate-bounce'}`} />
              {isLanding ? 'Ascending...' : 'Web-Zip to Skyline Apex'}
            </MagneticButton>
          </div>
        </div>

        {/* Multiverse Earth Coordinates */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 mb-8 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-500" />
            <span className="text-white font-bold">SYNCHRONIZED REALITIES:</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-red-400">EARTH-616 // PRIME NYC</span>
            <span>•</span>
            <span className="text-amber-400">EARTH-1610 // BROOKLYN</span>
            <span>•</span>
            <span className="text-cyan-400">EARTH-928 // NUEVA YORK</span>
            <span>•</span>
            <span className="text-pink-400">EARTH-138 // ANARCHY-LONDON</span>
            <span>•</span>
            <span className="text-slate-300">EARTH-90214 // 1933 SHADOWS</span>
          </div>
        </div>

        {/* Bottom Legal & Acknowledgments Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span>© 2026 SPIDER-MAN MULTIVERSE ARCHIVE. WITH GREAT POWER COMES GREAT RESPONSIBILITY.</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <span className="hover:text-red-400 transition-colors cursor-pointer">
              WEB-SHOOTER PROTOCOLS
            </span>
            <span>•</span>
            <span className="hover:text-red-400 transition-colors cursor-pointer">
              CANON EVENT STABILITY
            </span>
            <span>•</span>
            <span className="hover:text-red-400 transition-colors cursor-pointer">
              SPIDER-SOCIETY CLEARANCE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
