'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTilt } from '@/hooks/useTilt';
import { MagneticButton } from '../ui/MagneticButton';
import { TraversalPlayground } from '../ui/TraversalPlayground';
import { Zap, Compass, Radio, Crosshair, X, ArrowUpRight, ShieldCheck, Gauge } from 'lucide-react';

interface Ability {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  fullDetails: string;
  metrics: { label: string; value: string }[];
  schematics: string[];
  color: 'cyan' | 'violet' | 'amber';
  icon: React.ComponentType<{ className?: string }>;
}

const ABILITIES: Ability[] = [
  {
    id: 'web-shooters',
    number: '01',
    title: 'Web-Shooting & Wings',
    subtitle: 'Kinetic Slingshot & Glide Dynamics',
    description:
      'Dual-wrist pressurized ejectors launching high-tensile shear-thinning fluid capable of anchoring 45 kN and deploying aerodynamic web-wings.',
    fullDetails:
      'Engineered by Peter Parker and enhanced across the multiverse. Twin compressed fluid cartridges fire at 300 PSI, instantly polymerizing into tensile cable upon contact with oxygen. Accompanied by sub-axillary web-wings that convert terminal drops into high-speed directional glides across Manhattan avenues.',
    metrics: [
      { label: 'Ejection Speed', value: '340 m/s' },
      { label: 'Tensile Strength', value: '45 kN' },
      { label: 'Chamber Pressure', value: '300 PSI' },
    ],
    schematics: ['Shear-Thinning Fluid Polymer', 'Piezo-Electric Valve Trigger', 'Micro-Weave Web-Wings'],
    color: 'cyan',
    icon: Zap,
  },
  {
    id: 'spider-sense',
    number: '02',
    title: 'Spider-Sense Radar',
    subtitle: 'Omnidirectional Pre-Cognition',
    description:
      'Clairvoyant neurological warning reflex detecting incoming kinetic strikes, structural collapses, and multiversal anomalies milliseconds before impact.',
    fullDetails:
      'An instinctual pre-cognitive bio-electric pulse vibrating along the base of the skull. The Spider-Sense detects threats from every vector, calculating evasion trajectories, ricochets, and anchor points with zero visual confirmation needed.',
    metrics: [
      { label: 'Neural Latency', value: '0.02 ms' },
      { label: 'Threat Arc', value: '360° Sphere' },
      { label: 'Time Dilation', value: '10x Perception' },
    ],
    schematics: ['Synaptic Dilation Reflex', 'Sub-Conscious Danger Radar', 'Bio-Resonance Receptor'],
    color: 'amber',
    icon: Crosshair,
  },
  {
    id: 'venom-blast',
    number: '03',
    title: 'Venom Strike & Camo',
    subtitle: 'Miles Morales Bio-Electric Overdrive',
    description:
      'Channels up to 1.5 megavolts of bio-luminescent conduction into webbing and physical strikes, paired with full optical cloaking.',
    fullDetails:
      'A signature ability of Earth-1610. Miles Morales synthesizes organic electricity through his fingertips, paralyzing adversaries and short-circuiting heavy mechanical armor. When stealth is required, chromatophore cells shift optical refraction, rendering the suit entirely invisible.',
    metrics: [
      { label: 'Peak Surge', value: '1.5 MV' },
      { label: 'Camouflage', value: '99.8% Optical' },
      { label: 'EMP Radius', value: '24m' },
    ],
    schematics: ['Bio-Electrochemical Nodes', 'Photonic Active Camouflage', 'Chain-Lightning Web Tether'],
    color: 'violet',
    icon: Radio,
  },
  {
    id: 'wall-crawling',
    number: '04',
    title: 'Wall-Crawling & Reflexes',
    subtitle: 'Sub-Atomic Electrostatic Adhesion',
    description:
      'Consciously alters electrostatic attraction between surface atoms, enabling frictionless vertical runs and 15-ton proportional strength.',
    fullDetails:
      'Through controlled inter-molecular electrostatic forces, Spider-Man adheres to any surface regardless of slickness, ice, or velocity. Combined with proportional arachnid musculature, this enables 40-foot vertical leaps and 15-ton load bearing.',
    metrics: [
      { label: 'Lifting Capacity', value: '15 Tons' },
      { label: 'Adhesion Force', value: '65 kN/cm²' },
      { label: 'Vertical Leap', value: '40 Feet' },
    ],
    schematics: ['Electrostatic Attraction Force', 'Arachnid Muscle Density', 'Impact-Absorbing Tendons'],
    color: 'cyan',
    icon: Compass,
  },
];

export const AbilitiesSection: React.FC = () => {
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAbility(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section
      id="abilities"
      className="relative w-full min-h-screen py-24 px-4 md:px-8 bg-[#07070B] overflow-hidden select-none"
      aria-label="Spider-Man Abilities and Web-Shooters"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 glass-panel px-3.5 py-1 rounded-full border border-red-500/40 text-xs font-mono text-red-400 tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(230,36,41,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              ARACHNID COMBAT MATRIX
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight text-white uppercase leading-none">
              Spider <span className="text-glow-spider-red text-red-500">Abilities</span>
            </h2>
          </div>
          <p className="max-w-md text-slate-400 text-sm md:text-base font-light mt-4 md:mt-0">
            Four iconic superpowers engineered across the multiverse for high-altitude acrobatics, danger avoidance, and non-lethal neutralization.
          </p>
        </div>

        {/* 4 Cards Grid with 3D Tilt & Magnetic Pull */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ABILITIES.map((ability) => (
            <AbilityCard
              key={ability.id}
              ability={ability}
              onSelect={() => setSelectedAbility(ability)}
            />
          ))}
        </div>

        {/* Interactive Acrobatic Traversal Simulator */}
        <TraversalPlayground />
      </div>

      {/* Full-width Modal with Shared Layout Animation */}
      <AnimatePresence>
        {selectedAbility && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedAbility(null)}
          >
            <motion.div
              layoutId={`card-${selectedAbility.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl glass-panel-glow p-6 md:p-10 rounded-3xl border border-cyan-400/40 shadow-[0_0_60px_rgba(34,211,238,0.3)] overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedAbility(null)}
                className="absolute top-6 right-6 p-2 rounded-full glass-panel border border-white/10 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
                aria-label="Close ability detail"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Content */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase">
                  MODULE // {selectedAbility.number}
                </span>
                <span className="w-8 h-[1px] bg-cyan-400/40" />
                <span className="text-xs font-mono text-violet-400 uppercase">
                  {selectedAbility.subtitle}
                </span>
              </div>

              <h3 className="font-display text-4xl sm:text-5xl text-white uppercase mb-4 text-glow-cyan">
                {selectedAbility.title}
              </h3>

              <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 font-light">
                {selectedAbility.fullDetails}
              </p>

              {/* Performance Metrics Table */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {selectedAbility.metrics.map((metric) => (
                  <div key={metric.label} className="glass-panel p-4 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">{metric.label}</div>
                    <div className="text-xl font-bold font-mono text-cyan-300">{metric.value}</div>
                  </div>
                ))}
              </div>

              {/* Tactical Schematics */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  Tactical Component Specifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAbility.schematics.map((item) => (
                    <span
                      key={item}
                      className="glass-panel px-3 py-1.5 rounded-xl border border-white/5 text-xs font-mono text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Trigger */}
              <div className="mt-8 flex justify-end">
                <MagneticButton
                  variant="primary"
                  size="md"
                  onClick={() => setSelectedAbility(null)}
                >
                  Confirm Diagnostics
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const AbilityCard: React.FC<{ ability: Ability; onSelect: () => void }> = ({
  ability,
  onSelect,
}) => {
  const { ref, tiltProps, glarePosition } = useTilt<HTMLDivElement>({
    maxTilt: 14,
    perspective: 1000,
  });

  const IconComponent = ability.icon;

  const colorMap = {
    cyan: {
      border: 'hover:border-cyan-400/60',
      badge: 'text-cyan-400 border-cyan-400/30',
      iconBg: 'from-cyan-500/20 to-violet-600/20 text-cyan-300',
      shadow: 'hover:shadow-[0_10px_35px_rgba(34,211,238,0.25)]',
    },
    violet: {
      border: 'hover:border-violet-400/60',
      badge: 'text-violet-400 border-violet-400/30',
      iconBg: 'from-violet-500/20 to-indigo-600/20 text-violet-300',
      shadow: 'hover:shadow-[0_10px_35px_rgba(139,92,246,0.25)]',
    },
    amber: {
      border: 'hover:border-amber-400/60',
      badge: 'text-amber-400 border-amber-400/30',
      iconBg: 'from-amber-500/20 to-orange-600/20 text-amber-300',
      shadow: 'hover:shadow-[0_10px_35px_rgba(245,158,11,0.25)]',
    },
  }[ability.color];

  return (
    <motion.div
      layoutId={`card-${ability.id}`}
      ref={ref}
      {...tiltProps}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative glass-panel p-6 rounded-3xl border border-white/10 ${colorMap.border} ${colorMap.shadow} transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-[420px] select-none`}
      data-interactive="true"
      aria-label={`Inspect ${ability.title}`}
    >
      {/* Dynamic Specular Glare Reflection */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
          opacity: glarePosition.opacity,
        }}
      />

      {/* Top Metadata */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className={`glass-panel px-3 py-1 rounded-full border ${colorMap.badge} text-[10px] font-mono tracking-widest`}>
            {`// ${ability.number}`}
          </div>
          <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-cyan-400/50 transition-colors">
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Ability Icon */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorMap.iconBg} border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
          <IconComponent className="w-7 h-7" />
        </div>

        {/* Title & Subtitle */}
        <div className="text-xs font-mono uppercase text-slate-400 mb-1">{ability.subtitle}</div>
        <h3 className="font-display text-3xl text-white uppercase mb-3 group-hover:text-cyan-300 transition-colors">
          {ability.title}
        </h3>

        <p className="text-slate-400 text-xs leading-relaxed font-light line-clamp-3">
          {ability.description}
        </p>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          {ability.metrics[0].label}
        </span>
        <span className="text-white font-bold">{ability.metrics[0].value}</span>
      </div>
    </motion.div>
  );
};
