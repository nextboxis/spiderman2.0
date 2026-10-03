'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ShieldAlert,
  Award,
  Eye,
  Crosshair,
  Sparkles,
  Flame,
  Sun,
  Moon,
  Compass,
  Radio,
} from 'lucide-react';
import { useSoundFX } from '@/hooks/useSoundFX';
import { DimensionTheme, CameraMode } from '../canvas/SpiderCity3D';

// Dynamically import 3D Scene for SSR safety
const SpiderCity3D = dynamic(
  () => import('../canvas/SpiderCity3D').then((mod) => mod.SpiderCity3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#07070F] text-slate-400 gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-red-400 font-bold">
          SYNCHRONIZING 3D MANHATTAN GRID...
        </span>
      </div>
    ),
  }
);

export const TraversalPlayground: React.FC = () => {
  // 3D Environment & Camera State
  const [theme, setTheme] = useState<DimensionTheme>('dusk');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [isWebAttached, setIsWebAttached] = useState(false);
  const [tokensCollected, setTokensCollected] = useState(0);

  // Discrete status states (only trigger re-renders when actually toggled)
  const [nearGround, setNearGround] = useState(false);
  const [chainCombo, setChainCombo] = useState(0);
  const [isOscorpInView, setIsOscorpInView] = useState(false);

  // Direct DOM refs for 60Hz high-frequency telemetry text/rotations (zero React re-renders)
  const velocityRef = useRef<HTMLSpanElement>(null);
  const altitudeRef = useRef<HTMLSpanElement>(null);
  const anchorNameRef = useRef<HTMLSpanElement>(null);
  const oscorpArrowRef = useRef<HTMLDivElement>(null);

  const { playThwip, playWebZip, playHover, playSuccess } = useSoundFX();

  // Web-Swinging Controls memoized with useCallback
  const handleWebAttach = React.useCallback(() => {
    setIsWebAttached(true);
    playThwip();
  }, [playThwip]);

  const handleWebRelease = React.useCallback(() => {
    setIsWebAttached(false);
    playWebZip();
  }, [playWebZip]);

  const handleBoost = React.useCallback(() => {
    playWebZip();
  }, [playWebZip]);

  const handleCollectToken = React.useCallback(() => {
    setTokensCollected((prev) => prev + 1);
    playSuccess();
  }, [playSuccess]);

  // High-performance 60Hz telemetry handler (Zero React reconciliations on number ticks)
  const handleTelemetryUpdate = React.useCallback((t: {
    velocity: number;
    altitude: number;
    anchorName: string;
    nearGround: boolean;
    chainCombo: number;
    oscorpIndicator?: {
      inView: boolean;
      angleDeg: number;
    };
  }) => {
    if (velocityRef.current) velocityRef.current.textContent = String(t.velocity);
    if (altitudeRef.current) altitudeRef.current.textContent = String(t.altitude);
    if (anchorNameRef.current) anchorNameRef.current.textContent = t.anchorName;
    if (oscorpArrowRef.current && t.oscorpIndicator) {
      oscorpArrowRef.current.style.transform = `rotate(${t.oscorpIndicator.angleDeg}deg)`;
    }

    setNearGround((prev) => (prev !== t.nearGround ? t.nearGround : prev));
    setChainCombo((prev) => (prev !== t.chainCombo ? t.chainCombo : prev));
    if (t.oscorpIndicator) {
      const inView = t.oscorpIndicator.inView;
      setIsOscorpInView((prev) => (prev !== inView ? inView : prev));
    }
  }, []);

  // Keyboard Shortcuts (Space to Thwip, Shift to Slingshot, C to Toggle Cam, R to Reset)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleWebAttach();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        handleBoost();
      } else if (e.code === 'KeyC') {
        setCameraMode((prev) => (prev === 'chase' ? 'fps' : 'chase'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleWebRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleWebAttach, handleWebRelease, handleBoost]);

  // Combo Titles
  const getComboTitle = (chain: number) => {
    if (chain >= 15) return { title: 'ULTIMATE SPIDER-MAN', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' };
    if (chain >= 10) return { title: 'SPECTACULAR!', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' };
    if (chain >= 6) return { title: 'AMAZING!', color: 'text-red-400 border-red-500/40 bg-red-500/10' };
    if (chain >= 3) return { title: 'SENSATIONAL', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' };
    return { title: 'WEB READY', color: 'text-slate-400 border-white/10 bg-white/5' };
  };

  const currentCombo = getComboTitle(chainCombo);

  return (
    <div className="mt-16 w-full glass-panel-glow rounded-3xl border border-red-500/30 overflow-hidden shadow-2xl relative select-none bg-[#05050A]">
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-black/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold">
              3D WEB-SWINGING SIMULATOR // PHYSICS ENGINE
            </span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-white tracking-wide uppercase flex items-center gap-2">
            Manhattan Traversal & Aerial Kinematics
          </h3>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Camera Mode Toggle */}
          <div className="glass-panel p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => {
                playHover();
                setCameraMode('chase');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraMode === 'chase'
                  ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(230,36,41,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chase Cam</span>
            </button>
            <button
              onClick={() => {
                playHover();
                setCameraMode('fps');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraMode === 'fps'
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>1st-Person POV</span>
            </button>
          </div>

          {/* Multiverse Dimension Switcher */}
          <div className="glass-panel p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => {
                playHover();
                setTheme('dusk');
              }}
              title="Earth-616 Manhattan Dusk"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                theme === 'dusk' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 inline mr-1" />
              <span className="hidden sm:inline">Dusk 616</span>
            </button>
            <button
              onClick={() => {
                playHover();
                setTheme('noir');
              }}
              title="Earth-90214 1933 Noir"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                theme === 'noir' ? 'bg-slate-200 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 inline mr-1" />
              <span className="hidden sm:inline">Noir 1933</span>
            </button>
            <button
              onClick={() => {
                playHover();
                setTheme('neon');
              }}
              title="Earth-928 Cyberpunk Nueva York"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                theme === 'neon' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 inline mr-1 text-cyan-300" />
              <span className="hidden sm:inline">Neon 2099</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 3D WebGL Canvas Viewport */}
      <div
        className="relative w-full h-[520px] bg-black overflow-hidden cursor-crosshair"
        onMouseDown={handleWebAttach}
        onMouseUp={handleWebRelease}
        onTouchStart={handleWebAttach}
        onTouchEnd={handleWebRelease}
      >
        <Suspense fallback={null}>
          <SpiderCity3D
            theme={theme}
            cameraMode={cameraMode}
            isWebAttached={isWebAttached}
            onWebAttach={handleWebAttach}
            onWebRelease={handleWebRelease}
            onBoost={handleBoost}
            onCollectToken={handleCollectToken}
            onTelemetryUpdate={handleTelemetryUpdate}
          />
        </Suspense>

        {/* Dynamic First-Person Crosshair Reticle (Visible in FPS mode) */}
        {cameraMode === 'fps' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full border border-dashed transition-all duration-150 ${isWebAttached ? 'scale-125 border-red-500 rotate-45' : 'border-cyan-400/70'}`} />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute" />
          </div>
        )}

        {/* Spider-Sense Precognitive Alert Overlay (Near ground or low altitude) */}
        <AnimatePresence>
          {nearGround && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none border-4 border-red-600/70 animate-pulse bg-red-950/20 flex items-start justify-center pt-8"
            >
              <div className="glass-panel px-4 py-1.5 rounded-full border border-red-500 bg-black/80 text-xs font-mono text-red-400 font-bold tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(230,36,41,0.8)]">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-bounce" />
                <span>SPIDER-SENSE TINGLE // LOW ALTITUDE GRAVITY HAZARD</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating In-World Anchor Target Pill */}
        <div className="absolute top-6 left-6 pointer-events-none glass-panel px-4 py-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md flex items-center gap-3">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
              <Compass className="w-3 h-3 text-red-400" />
              LOCKED WEB-ANCHOR
            </div>
            <div className="font-mono text-xs font-bold text-white tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span ref={anchorNameRef}>OSCORP HEADQUARTERS</span>
            </div>
          </div>

          {/* Off-screen Navigation Arrow pointing toward Oscorp */}
          {!isOscorpInView && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <div
                ref={oscorpArrowRef}
                className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center transition-transform duration-75 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              >
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-emerald-400 -translate-y-[1px]" />
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-wider">
                OSCORP
              </span>
            </div>
          )}
        </div>

        {/* Collectible Tokens Counter */}
        <div className="absolute top-6 right-6 pointer-events-none glass-panel px-4 py-2 rounded-2xl border border-amber-500/30 bg-black/60 backdrop-blur-md">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
            <Sparkles className="w-3 h-3 text-amber-300" />
            SPIDER-TOKENS
          </div>
          <div className="font-mono text-xs font-bold text-white tracking-wider">
            {tokensCollected.toString().padStart(2, '0')} / 08 COLLECTED
          </div>
        </div>

        {/* Bottom Interactive Primary Action Bar */}
        <div className="absolute bottom-6 inset-x-0 flex flex-col sm:flex-row items-center justify-center gap-3 px-4 pointer-events-none">
          {/* Big Action Button (Click / Hold) */}
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              handleWebAttach();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              handleWebRelease();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleWebAttach();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleWebRelease();
            }}
            className={`pointer-events-auto px-8 py-3.5 rounded-2xl font-mono text-xs uppercase tracking-widest font-extrabold flex items-center gap-3 shadow-2xl transition-all duration-200 cursor-pointer ${
              isWebAttached
                ? 'bg-red-600 text-white scale-105 shadow-[0_0_35px_rgba(230,36,41,0.8)] border-2 border-[#FFE600]'
                : 'bg-black/80 hover:bg-black text-slate-200 hover:text-white border border-red-500/50 hover:shadow-[0_0_20px_rgba(230,36,41,0.4)]'
            }`}
          >
            <Zap className={`w-4 h-4 ${isWebAttached ? 'text-[#FFE600] animate-spin' : 'text-red-500'}`} />
            <span>{isWebAttached ? 'HOLDING WEB LINE (SWINGING!)' : 'HOLD CLICK / SPACE TO THWIP WEB'}</span>
          </button>

          {/* Quick Boost Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBoost();
            }}
            className="pointer-events-auto px-5 py-3.5 rounded-2xl font-mono text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-black/70 hover:bg-black border border-white/10 hover:border-cyan-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Slingshot Zip [Shift]</span>
          </button>
        </div>
      </div>

      {/* 3. Real-Time Flight Telemetry Readout */}
      <div className="p-4 sm:p-6 bg-black/60 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Velocity */}
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Velocity
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-baseline gap-1">
            <span ref={velocityRef}>52</span>
            <span className="text-xs text-red-400 font-normal">MPH</span>
          </div>
        </div>

        {/* Altitude */}
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            Altitude
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-baseline gap-1">
            <span ref={altitudeRef}>320</span>
            <span className="text-xs text-blue-400 font-normal">FT</span>
          </div>
        </div>

        {/* Combo Title */}
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Acrobatics Chain
          </div>
          <div className={`text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-md inline-block border ${currentCombo.color}`}>
            {currentCombo.title}
          </div>
        </div>

        {/* Environment Profile */}
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Dimension Sync
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono text-slate-200 uppercase">
            {theme === 'dusk' ? 'EARTH-616 DUSK' : theme === 'noir' ? 'EARTH-90214 NOIR' : 'EARTH-928 NUEVA YORK'}
          </div>
        </div>
      </div>
    </div>
  );
};
