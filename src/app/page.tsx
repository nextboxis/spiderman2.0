'use client';

import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Preloader } from '@/components/sections/Preloader';
import { HeroSection } from '@/components/sections/HeroSection';
import { ManifestoSection } from '@/components/sections/ManifestoSection';
import { AbilitiesSection } from '@/components/sections/AbilitiesSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { RoguesGallerySection } from '@/components/sections/RoguesGallerySection';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { CTASection } from '@/components/sections/CTASection';
import { FooterSection } from '@/components/sections/FooterSection';

import { Navigation } from '@/components/ui/Navigation';
import { TheDailyBugleTicker } from '@/components/ui/TheDailyBugleTicker';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { GrainOverlay } from '@/components/ui/GrainOverlay';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false);

  // Initialize Lenis Smooth Scroll and sync with GSAP ScrollTrigger
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Honor prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Update ScrollTrigger on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP ticker with Lenis RAF
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#07070B] text-[#F8FAFC]">
      {/* 1. Preloader Section */}
      <Preloader onComplete={() => setIsPreloaderComplete(true)} />

      {/* Global Interactive Custom Cursor */}
      <CustomCursor />

      {/* Cinematic Film Grain & CRT Scanline Atmosphere */}
      <GrainOverlay />

      {/* Persistent Glassmorphism Navigation */}
      <Navigation />

      {/* 2. Hero Section */}
      <HeroSection isLoaded={isPreloaderComplete} />

      {/* Breaking News Marquee: The Daily Bugle (J. Jonah Jameson Wire) */}
      <TheDailyBugleTicker />

      {/* 3. Manifesto Section (Pinned Scroll) */}
      <ManifestoSection />

      {/* 4. Abilities Section (3D Tilt & Shared Layout Modal) */}
      <AbilitiesSection />

      {/* 5. Gallery Section (26 Multiverse Suits Strip & 4K Viewer) */}
      <GallerySection />

      {/* 6. Sinister Rogues Gallery & Manhattan Threat Matrix */}
      <RoguesGallerySection />

      {/* 7. Timeline Section (Vertical Glowing SVG Path) */}
      <TimelineSection />

      {/* 7. CTA Section (Floating Label & Inverted Gravity Confetti) */}
      <CTASection />

      {/* 8. Footer Section (Floating Socials & Return To Ground) */}
      <FooterSection />
    </main>
  );
}
