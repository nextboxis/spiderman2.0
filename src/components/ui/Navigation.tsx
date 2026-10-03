'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from './MagneticButton';
import { Menu, X, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useSoundFX } from '@/hooks/useSoundFX';

const NAV_ITEMS = [
  { label: 'The Web', href: '#manifesto' },
  { label: 'Spider-Abilities', href: '#abilities' },
  { label: 'Suit Armory', href: '#gallery' },
  { label: 'Rogues Matrix', href: '#villains' },
  { label: 'Chronology', href: '#timeline' },
];

export const Navigation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMuted, toggleMute, playClick, playThwip } = useSoundFX();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide on scroll down, show on scroll up
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && !mobileMenuOpen) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);

      // Detect active section
      const sections = ['hero', 'manifesto', 'abilities', 'gallery', 'villains', 'timeline', 'join'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false);
    playThwip();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : -110,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-4 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* Spider-Man Brand Emblem */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="group flex items-center gap-3 glass-panel px-4 py-2 rounded-2xl border border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            aria-label="Spider-Man Multiverse Homepage"
          >
            {/* Iconic Spider Glyph */}
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#E62429] to-[#0066FF] flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(230,36,41,0.6)] group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-white" aria-hidden="true">
                {/* Spider Emblem */}
                <path d="M12 2C11.45 2 11 2.45 11 3V5.1C9.8 5.3 8.7 5.8 7.8 6.5L6.3 5C5.9 4.6 5.3 4.6 4.9 5C4.5 5.4 4.5 6 4.9 6.4L6.2 7.7C5.5 8.7 5.1 9.9 5 11.2H3C2.45 11.2 2 11.65 2 12.2C2 12.75 2.45 13.2 3 13.2H5C5.1 14.5 5.5 15.7 6.2 16.7L4.9 18C4.5 18.4 4.5 19 4.9 19.4C5.3 19.8 5.9 19.8 6.3 19.4L7.8 17.9C8.7 18.6 9.8 19.1 11 19.3V21.4C11 21.95 11.45 22.4 12 22.4C12.55 22.4 13 21.95 13 21.4V19.3C14.2 19.1 15.3 18.6 16.2 17.9L17.7 19.4C18.1 19.8 18.7 19.8 19.1 19.4C19.5 19 19.5 18.4 19.1 18L17.8 16.7C18.5 15.7 18.9 14.5 19 13.2H21C21.55 13.2 22 12.75 22 12.2C22 11.65 21.55 11.2 21 11.2H19C18.9 9.9 18.5 8.7 17.8 7.7L19.1 6.4C19.5 6 19.5 5.4 19.1 5C18.7 4.6 18.1 4.6 17.7 5L16.2 6.5C15.3 5.8 14.2 5.3 13 5.1V3C13 2.45 12.55 2 12 2ZM12 8C13.66 8 15 9.34 15 11C15 11.75 14.72 12.44 14.26 12.97C14.72 13.56 15 14.3 15 15.11C15 16.77 13.66 18.11 12 18.11C10.34 18.11 9 16.77 9 15.11C9 14.3 9.28 13.56 9.74 12.97C9.28 12.44 9 11.75 9 11C9 9.34 10.34 8 12 8Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl tracking-widest text-white leading-none chromatic-hover">
                SPIDER-MAN
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#E62429] font-mono -mt-0.5">
                Multiverse Armory
              </span>
            </div>
          </a>

          {/* Desktop Nav Items with Floating Active Indicator */}
          <nav className="hidden md:flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="relative px-4 py-2 text-xs uppercase tracking-widest font-medium text-slate-300 hover:text-white transition-colors link-underline chromatic-hover"
                >
                  {/* Floating active pill */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-full bg-[#E62429]/25 border border-[#E62429]/60 shadow-[0_0_15px_rgba(230,36,41,0.4)] -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className={isActive ? 'text-red-400 font-semibold text-glow-spider-red' : ''}>
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Audio Sound FX Toggle & CTA & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClick();
                toggleMute();
              }}
              className="glass-panel p-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
              aria-label={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#E62429] animate-pulse" />
              )}
            </button>

            <MagneticButton
              variant="primary"
              size="sm"
              onClick={() => {
                playThwip();
                scrollToSection('#join');
              }}
              className="hidden sm:inline-flex text-xs bg-gradient-to-r from-[#E62429] to-[#0066FF] border-red-500/50 hover:shadow-[0_0_20px_rgba(230,36,41,0.5)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Spider-Society
            </MagneticButton>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden glass-panel p-2.5 rounded-xl border border-white/10 text-white hover:text-red-400"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 z-40 md:hidden glass-panel-glow p-6 rounded-3xl border border-red-500/40 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="px-4 py-3 text-lg font-display tracking-widest text-white border-b border-white/5 hover:text-red-400 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-mono text-red-400">WEB</span>
                </a>
              ))}
              <MagneticButton
                variant="primary"
                size="md"
                onClick={() => scrollToSection('#join')}
                className="w-full mt-2"
              >
                Join Spider-Society
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
