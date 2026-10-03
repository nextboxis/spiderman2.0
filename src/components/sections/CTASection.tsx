'use client';

import React, { useState, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';
import confetti from 'canvas-confetti';
import { Send, Radio, Award } from 'lucide-react';
import { useSoundFX } from '@/hooks/useSoundFX';

export const CTASection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [spiderId, setSpiderId] = useState('');
  const [assignedEarth, setAssignedEarth] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { playThwip, playSpiderSense } = useSoundFX();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    playThwip();

    const universes = ['EARTH-616 // QUEENS NYC', 'EARTH-1610 // BROOKLYN', 'EARTH-928 // NUEVA YORK', 'EARTH-138 // ANARCHY-LONDON', 'EARTH-90214 // 1933 SHADOWS'];
    const randomEarth = universes[Math.floor(Math.random() * universes.length)];
    const generatedId = `SPDR-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setSpiderId(generatedId);
      setAssignedEarth(randomEarth);
      playSpiderSense();

      try {
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.8 },
          colors: ['#E62429', '#0066FF', '#FFE600', '#FFFFFF', '#00F0FF'],
          gravity: -0.4, // Web-slinging upward drift
          scalar: 1.2,
          ticks: 350,
          shapes: ['circle', 'square'],
        });
      } catch (err) {
        console.error('Confetti trigger', err);
      }
    }, 850);
  };

  return (
    <section
      id="join"
      ref={containerRef}
      className="relative w-full py-28 px-4 md:px-8 bg-[#07070B] overflow-hidden"
      aria-label="Enlist in the Spider-Society"
    >
      {/* Dynamic Background Spider-Web Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-tr from-red-600/15 via-blue-600/15 to-transparent rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full border border-red-500/40 text-xs font-mono text-red-400 tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(230,36,41,0.25)]">
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          SPIDER-SOCIETY CITADEL // MULTIVERSE ENLISTMENT
        </div>

        {/* Section Headline */}
        <h2 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-none mb-6">
          Weave Your <span className="text-glow-spider text-red-500">Destiny</span>
        </h2>

        <p className="max-w-xl mx-auto text-slate-300 text-base md:text-lg font-light leading-relaxed mb-12">
          Sync your bio-genetic frequency with the Web of Life and Destiny. Claim your authenticated Spider-Society clearance pass, dimensional travel watch, and stand shoulder-to-shoulder with Peter, Miles, and Miguel across the Multiverse.
        </p>

        {/* Interactive Clearance Form */}
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="spider-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative flex flex-col sm:flex-row gap-4 items-stretch p-2.5 rounded-2xl glass-panel-glow border border-red-500/40 shadow-[0_10px_40px_rgba(0,0,0,0.7)] bg-[#090912]/95"
              >
                {/* Input Container */}
                <div className="relative flex-1">
                  <input
                    id="spider-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder=""
                    className="w-full h-14 bg-transparent px-5 pt-6 pb-1 text-white text-base font-mono outline-none border-none placeholder-transparent"
                  />
                  {/* Floating Label */}
                  <label
                    htmlFor="spider-email-input"
                    className={`absolute left-5 transition-all duration-200 pointer-events-none font-mono uppercase tracking-widest ${
                      isFocused || email.length > 0
                        ? 'top-1.5 text-[9px] text-red-400 font-bold'
                        : 'top-1/2 -translate-y-1/2 text-xs text-slate-400'
                    }`}
                  >
                    Transmit Spider-ID or Email
                  </label>
                </div>

                {/* Submit Launch Button */}
                <motion.div
                  animate={
                    isSubmitting
                      ? { y: -140, opacity: 0, scale: 1.2 }
                      : { y: 0, opacity: 1, scale: 1 }
                  }
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <MagneticButton
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-14"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Weaving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-white" />
                        Claim Spider-Pass
                      </span>
                    )}
                  </MagneticButton>
                </motion.div>
              </motion.form>
            ) : (
              /* Success State Card with Allocated Spider-Pass */
              <motion.div
                key="spider-success-card"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-panel-glow p-8 rounded-3xl border border-red-500/50 shadow-[0_0_50px_rgba(230,36,41,0.4)] text-center flex flex-col items-center bg-[#0C0C18]/95"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_25px_rgba(230,36,41,0.5)]">
                  <Award className="w-8 h-8" />
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-red-400 mb-2">
                  BIOMETRIC SYNC CONFIRMED // MASK ACQUIRED
                </div>
                <h3 className="font-display text-4xl text-white uppercase mb-2 text-glow-spider">
                  Welcome to the Spider-Society
                </h3>
                <p className="text-slate-300 text-sm max-w-md font-light mb-6">
                  Your biological frequency has been registered on the Web of Life and Destiny. Multiverse watch telemetry is active.
                </p>

                {/* Allocated Credentials */}
                <div className="w-full max-w-sm flex flex-col gap-2.5 mb-6">
                  <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 font-mono text-xs text-slate-300 flex items-center justify-between">
                    <span className="text-slate-400">CLEARANCE ID:</span>
                    <span className="text-red-400 font-bold">{spiderId}</span>
                  </div>
                  <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 font-mono text-xs text-slate-300 flex items-center justify-between">
                    <span className="text-slate-400">SECTOR ASSIGNED:</span>
                    <span className="text-cyan-300 font-bold">{assignedEarth}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  [ Register Another Variant ]
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Multiverse Compliance Footnote */}
        <div className="mt-8 text-xs font-mono text-slate-500 flex items-center justify-center gap-4 flex-wrap">
          <span>CANON EVENT PROTECTED</span>
          <span>•</span>
          <span>QUANTUM WEB-LINK</span>
          <span>•</span>
          <span>ALL EARTHS SYNCHRONIZED</span>
        </div>
      </div>
    </section>
  );
};
