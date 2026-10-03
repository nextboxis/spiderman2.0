'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundFX } from '@/hooks/useSoundFX';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isSnapped, setIsSnapped] = useState(false);
  const [isLiftingOff, setIsLiftingOff] = useState(false);
  const { playThwip, playSpiderSense } = useSoundFX();

  useEffect(() => {
    // Phase 1: Web fluid pressurizing bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerating charging curve
        const step = Math.max(1, Math.floor((100 - prev) * 0.12));
        return Math.min(prev + step, 100);
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Phase 2: Snap into Spider-Man emblem with THWIP
      const snapTimer = setTimeout(() => {
        setIsSnapped(true);
        playThwip();
        playSpiderSense();
      }, 200);

      // Phase 3: Web-Zip liftoff
      const liftoffTimer = setTimeout(() => {
        setIsLiftingOff(true);
      }, 1400);

      // Phase 4: Complete and unmount
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 2100);

      return () => {
        clearTimeout(snapTimer);
        clearTimeout(liftoffTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [progress, onComplete, playThwip, playSpiderSense]);

  return (
    <AnimatePresence>
      {!isLiftingOff ? (
        <motion.div
          key="preloader-panel"
          initial={{ y: 0, opacity: 1 }}
          exit={{
            y: '-100vh',
            opacity: 0.9,
            transition: { duration: 0.85, ease: [0.7, 0, 0.2, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07070B] overflow-hidden select-none"
        >
          {/* Ambient Spider-Red & Blue Radial Glow */}
          <div className="absolute w-[650px] h-[650px] rounded-full bg-radial from-red-600/25 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

          {/* Center Stage Container */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
            {/* Morphing Spider Emblem Container */}
            <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {!isSnapped ? (
                  /* Charging Web Nozzle Ring */
                  <motion.div
                    key="charging-ring"
                    className="relative w-16 h-16 rounded-full border-2 border-dashed border-red-500/60 flex items-center justify-center animate-spin"
                    style={{ animationDuration: '2.5s' }}
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#E62429]" />
                  </motion.div>
                ) : (
                  /* Snapped Spider-Man Chest Emblem */
                  <motion.div
                    key="spider-emblem"
                    initial={{ scale: 0.2, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                    className="relative w-22 h-22 rounded-2xl bg-gradient-to-br from-[#E62429] to-[#0066FF] p-3 shadow-[0_0_50px_rgba(230,36,41,0.85)] border border-white/20"
                  >
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" aria-hidden="true">
                      <path d="M12 2C11.45 2 11 2.45 11 3V5.1C9.8 5.3 8.7 5.8 7.8 6.5L6.3 5C5.9 4.6 5.3 4.6 4.9 5C4.5 5.4 4.5 6 4.9 6.4L6.2 7.7C5.5 8.7 5.1 9.9 5 11.2H3C2.45 11.2 2 11.65 2 12.2C2 12.75 2.45 13.2 3 13.2H5C5.1 14.5 5.5 15.7 6.2 16.7L4.9 18C4.5 18.4 4.5 19 4.9 19.4C5.3 19.8 5.9 19.8 6.3 19.4L7.8 17.9C8.7 18.6 9.8 19.1 11 19.3V21.4C11 21.95 11.45 22.4 12 22.4C12.55 22.4 13 21.95 13 21.4V19.3C14.2 19.1 15.3 18.6 16.2 17.9L17.7 19.4C18.1 19.8 18.7 19.8 19.1 19.4C19.5 19 19.5 18.4 19.1 18L17.8 16.7C18.5 15.7 18.9 14.5 19 13.2H21C21.55 13.2 22 12.75 22 12.2C22 11.65 21.55 11.2 21 11.2H19C18.9 9.9 18.5 8.7 17.8 7.7L19.1 6.4C19.5 6 19.5 5.4 19.1 5C18.7 4.6 18.1 4.6 17.7 5L16.2 6.5C15.3 5.8 14.2 5.3 13 5.1V3C13 2.45 12.55 2 12 2ZM12 8C13.66 8 15 9.34 15 11C15 11.75 14.72 12.44 14.26 12.97C14.72 13.56 15 14.3 15 15.11C15 16.77 13.66 18.11 12 18.11C10.34 18.11 9 16.77 9 15.11C9 14.3 9.28 13.56 9.74 12.97C9.28 12.44 9 11.75 9 11C9 9.34 10.34 8 12 8Z" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SPIDER-MAN Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-5xl md:text-6xl tracking-[0.2em] text-white mb-2"
            >
              SPIDER-MAN
            </motion.h1>
            <p className="text-xs uppercase tracking-widest text-red-400 font-mono mb-8">
              {isSnapped ? 'WEB-SHOOTERS ARMED // SPIDER-SENSE ONLINE' : 'PRESSURIZING WEB-FLUID CARTRIDGES...'}
            </p>

            {/* Animated Charging Bar */}
            <div className="w-full h-2.5 bg-slate-900/90 rounded-full border border-white/15 p-0.5 overflow-hidden shadow-inner relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E62429] via-[#FFE600] to-[#0066FF] rounded-full relative"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              >
                {/* Leading Web Fluid Spark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#FFFFFF]" />
              </motion.div>
            </div>

            {/* Readout Metrics */}
            <div className="flex items-center justify-between w-full mt-3 text-xs font-mono text-slate-400">
              <span>PRESSURE: {Math.round(progress * 3.0)} PSI</span>
              <span className="text-[#E62429] font-bold">{progress}%</span>
              <span>TENSILE: {(progress * 4.5).toFixed(0)} kN</span>
            </div>
          </div>

          {/* Quick Skip button */}
          <button
            onClick={() => {
              setIsLiftingOff(true);
              playThwip();
              onComplete();
            }}
            className="absolute bottom-8 text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            [ Launch Web-Zip ]
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
