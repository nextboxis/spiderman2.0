'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Skull, Crosshair, AlertTriangle, ChevronRight, X, Target } from 'lucide-react';
import { useSoundFX } from '@/hooks/useSoundFX';
import { MagneticButton } from '../ui/MagneticButton';

interface Villain {
  id: string;
  name: string;
  alias: string;
  earth: string;
  threatLevel: 'OMEGA' | 'ALPHA' | 'APOCALYPTIC' | 'MULTIVERSAL';
  badgeColor: string;
  borderColor: string;
  glowColor: string;
  weapons: string[];
  quote: string;
  tacticalLore: string;
  spideyCountermeasure: string;
  weakness: string;
}

const ROGUES: Villain[] = [
  {
    id: 'green-goblin',
    name: 'NORMAN OSBORN',
    alias: 'THE GREEN GOBLIN',
    earth: 'EARTH-616',
    threatLevel: 'OMEGA',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    glowColor: 'shadow-[0_0_35px_rgba(16,185,129,0.3)]',
    weapons: ['Turbine Goblin Glider', 'Pumpkin Bombs', 'Razor Bats', 'Goblin Formula Super-Strength'],
    quote: '"Poor Peter. Too weak to send me home to die... No good deed goes unpunished!"',
    tacticalLore:
      'Peter Parker’s most personal and psychotic arch-nemesis. Driven mad by the experimental Goblin Formula, Norman Osborn possesses superhuman strength, near-infinite Oscorp resources, and an obsessive hatred of Spider-Man.',
    spideyCountermeasure: 'Target the glider turbine thrusters with high-density web-balls to force a grounded brawl. Keep distance from proximity-fused pumpkin bombs.',
    weakness: 'Severe dissociative mental instability; vulnerable to EMP strikes disabling glider navigation.',
  },
  {
    id: 'doc-ock',
    name: 'DR. OTTO OCTAVIUS',
    alias: 'DOCTOR OCTOPUS',
    earth: 'EARTH-616 / 1048',
    threatLevel: 'ALPHA',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    glowColor: 'shadow-[0_0_35px_rgba(245,158,11,0.3)]',
    weapons: ['Four Telescopic Titanium Arms', 'Direct Neural Cyberlink', 'Genius Scientific Intellect'],
    quote: '"The power of the sun... in the palm of my hand. You’re in my way, Peter."',
    tacticalLore:
      'Once Peter’s scientific mentor and idol, Dr. Octavius was corrupted when the cranial inhibitor chip controlling his four cybernetic arms short-circuited, fusing the machine intelligence directly to his cerebral cortex.',
    spideyCountermeasure: 'Never fight all four tentacles head-on. Lure arms into intersecting web snares and use point-launch slingshots to target the cranial inhibitor chip at the base of his neck.',
    weakness: 'Exposed organic human body; fragile once mechanical arms are pinned or severed.',
  },
  {
    id: 'venom',
    name: 'EDDIE BROCK',
    alias: 'VENOM (SYMBIOTE)',
    earth: 'EARTH-616',
    threatLevel: 'APOCALYPTIC',
    badgeColor: 'bg-slate-200/20 text-white border-white/40',
    borderColor: 'border-white/30 hover:border-white',
    glowColor: 'shadow-[0_0_35px_rgba(255,255,255,0.35)]',
    weapons: ['Amorphous Living Klyntar Bio-Mass', 'Razor Tendrils & Fangs', 'Immune to Spider-Sense'],
    quote: '"Eyes, lungs, pancreas... so many snacks, so little time. WE ARE VENOM!"',
    tacticalLore:
      'The ultimate nightmare for Spider-Man. Because the alien symbiote was previously bonded to Peter, it bypassed his Spider-Sense completely, enabling lethal ambushes with 15-ton crushing brute strength.',
    spideyCountermeasure: 'Do not rely on precognition reflexes. Utilize environmental acoustic feedback (church bells, high-voltage transformers, or Spider-Punk’s guitar distortion) to destabilize the alien bond.',
    weakness: 'Intense high-frequency sound waves (440+ Hz) and extreme thermal heat/fire.',
  },
  {
    id: 'the-spot',
    name: 'DR. JONATHAN OHNN',
    alias: 'THE SPOT',
    earth: 'EARTH-1610 (SPIDER-VERSE)',
    threatLevel: 'MULTIVERSAL',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    glowColor: 'shadow-[0_0_35px_rgba(168,85,247,0.35)]',
    weapons: ['Inter-Dimensional Dark Matter Portals', 'Spacetime Fracture Tears', 'Multiverse Absorption'],
    quote: '"I am not the villain of the week, Miles. I am going to take everything from you."',
    tacticalLore:
      'Mutated by the Alchemax Super-Collider explosion in Brooklyn. After absorbing multiversal dark matter energy, The Spot evolved from an awkward joke into an omnipotent cosmic threat capable of destroying entire dimensions.',
    spideyCountermeasure: 'Never swing into open dark-matter tears. Synchronize Multiverse travel watches and coordinate multi-Spider team strikes to intercept his dimensional absorption points.',
    weakness: 'Portal disorientation when his own dark matter loops back onto his central core.',
  },
  {
    id: 'kingpin',
    name: 'WILSON FISK',
    alias: 'THE KINGPIN',
    earth: 'EARTH-616 / 1610',
    threatLevel: 'ALPHA',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    borderColor: 'border-red-500/30 hover:border-red-400',
    glowColor: 'shadow-[0_0_35px_rgba(239,68,68,0.3)]',
    weapons: ['450 lbs Pure Muscle & Judo', 'Obliterator Diamond Cane', 'New York Criminal Syndicate'],
    quote: '"You think you can defeat me, Spider-Man? I own the police, the judges, and every rooftop in this city."',
    tacticalLore:
      'The undisputed crime boss of New York City. Wilson Fisk hides brutal bone-crushing strength behind tailored three-piece suits, using the entire city infrastructure as his personal weapon.',
    spideyCountermeasure: 'Use continuous speed and agility. Fisk’s raw grip strength can crack titanium armor; stay airborne, wrap his arms in high-tensile web lines, and hit him with continuous quips.',
    weakness: 'Emotional vulnerability regarding his deceased family and reckless investments in super-colliders.',
  },
  {
    id: 'kraven',
    name: 'SERGEI KRAVINOFF',
    alias: 'KRAVEN THE HUNTER',
    earth: 'EARTH-616 / 1048',
    threatLevel: 'ALPHA',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    borderColor: 'border-yellow-500/30 hover:border-yellow-400',
    glowColor: 'shadow-[0_0_35px_rgba(234,179,8,0.3)]',
    weapons: ['Vibranium Spear & Daggers', 'Apex Animal Pheromones', 'Tracking Hound Army', 'Calibrated Nerve Toxins'],
    quote: '"They called me the greatest hunter on Earth. But until I kill the Spider, I have hunted nothing."',
    tacticalLore:
      'A Russian aristocrat and lethal big-game hunter who views Spider-Man as the ultimate quarry. Ingests mystical jungle elixirs that grant him the speed of a cheetah, the strength of a gorilla, and uncanny tactical tracking.',
    spideyCountermeasure: 'Disable hunting hounds with web-spread nets. Stay high above jungle traps and use inverted ceiling perches to break his line of sight.',
    weakness: 'Strict hunter’s code of honor; refuses to use firearms or cowardice, forcing direct physical combat.',
  },
];

export const RoguesGallerySection: React.FC = () => {
  const [selectedVillain, setSelectedVillain] = useState<Villain | null>(null);
  const { playSpiderSense, playHover } = useSoundFX();

  const handleCardClick = (villain: Villain) => {
    playSpiderSense();
    setSelectedVillain(villain);
  };

  return (
    <section
      id="villains"
      className="relative w-full py-28 px-4 md:px-8 bg-[#05050A] overflow-hidden select-none border-t border-white/5"
      aria-label="Spider-Man Rogues Gallery & Threat Matrix"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-1 rounded-full border border-red-500/40 text-xs font-mono text-red-400 tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(230,36,41,0.25)]">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            MANHATTAN THREAT MATRIX // ACTIVE ROGUES GALLERY
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight text-white uppercase leading-none mb-4">
            Arch-Nemeses & <span className="text-glow-spider text-red-500">Canon Threats</span>
          </h2>
          <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed">
            A hero is measured by the monsters they face. Inspect tactical files, iconic quotes, and Peter & Miles’ classified countermeasures against the most dangerous villains in the Multiverse.
          </p>
        </div>

        {/* Rogues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROGUES.map((v) => (
            <motion.div
              key={v.id}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => handleCardClick(v)}
              onMouseEnter={playHover}
              className={`glass-panel p-6 rounded-3xl border ${v.borderColor} bg-[#0A0A14]/90 transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-xl ${v.glowColor}`}
            >
              <div>
                {/* Threat Badge & Earth */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${v.badgeColor}`}>
                    THREAT: {v.threatLevel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    {v.earth}
                  </span>
                </div>

                {/* Villain Name & Title */}
                <div className="text-xs font-mono text-red-400 uppercase tracking-wider mb-1">
                  {v.name}
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-wide mb-3 group-hover:text-red-400 transition-colors">
                  {v.alias}
                </h3>

                {/* Quote Callout */}
                <p className="text-slate-300 text-xs italic font-light leading-relaxed mb-4 border-l-2 border-red-500/60 pl-3">
                  {v.quote}
                </p>

                {/* Weapons Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {v.weapons.map((w) => (
                    <span key={w} className="glass-panel px-2 py-0.5 rounded-md border border-white/5 text-[10px] font-mono text-slate-300">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-red-400 group-hover:text-white transition-colors">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-red-500" />
                  Inspect Countermeasures
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tactical Dossier Lightbox Modal */}
        <AnimatePresence>
          {selectedVillain && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl"
              onClick={() => setSelectedVillain(null)}
            >
              <motion.div
                layoutId={`villain-${selectedVillain.id}`}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-3xl glass-panel-glow p-6 md:p-10 rounded-3xl border ${selectedVillain.borderColor} bg-[#0C0C18]/95 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedVillain(null)}
                  className="absolute top-6 right-6 p-2.5 rounded-full glass-panel border border-white/10 text-slate-300 hover:text-white hover:border-red-500 transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${selectedVillain.badgeColor}`}>
                    THREAT: {selectedVillain.threatLevel}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    ORIGIN: {selectedVillain.earth}
                  </span>
                </div>

                <div className="text-sm font-mono text-red-400 uppercase tracking-widest mb-1">
                  CLASSIFIED CIVILIAN IDENTITY: {selectedVillain.name}
                </div>
                <h3 className="font-display text-4xl sm:text-5xl text-white uppercase mb-4 text-glow-spider">
                  {selectedVillain.alias}
                </h3>

                <blockquote className="text-base sm:text-lg text-slate-200 italic font-light leading-relaxed mb-6 border-l-4 border-red-600 pl-4 py-1 bg-red-600/10 rounded-r-xl">
                  {selectedVillain.quote}
                </blockquote>

                {/* Dossier Body */}
                <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-light mb-8">
                  <div>
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Skull className="w-4 h-4 text-red-500" />
                      CRIMINAL PROFILE & MOTIVATION
                    </h4>
                    <p className="text-slate-300">{selectedVillain.tacticalLore}</p>
                  </div>

                  <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-950/20">
                    <h4 className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-red-500" />
                      SPIDER-MAN TACTICAL COUNTERMEASURE
                    </h4>
                    <p className="text-white font-normal">{selectedVillain.spideyCountermeasure}</p>
                  </div>

                  <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
                    <h4 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      CONFIRMED EXPLOITABLE WEAKNESS
                    </h4>
                    <p className="text-amber-200">{selectedVillain.weakness}</p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-4 border-t border-white/10">
                  <MagneticButton
                    variant="primary"
                    size="md"
                    onClick={() => setSelectedVillain(null)}
                  >
                    Dismiss Threat File
                  </MagneticButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
