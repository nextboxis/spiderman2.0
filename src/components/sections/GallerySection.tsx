'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, AnimatePresence, type MotionValue } from 'framer-motion';
import { voltAnimationConfig } from '@/config/animationConfig';
import { ArrowLeft, ArrowRight, MoveHorizontal, Eye, Download, X, Shield, Radio, Box } from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';
import { useSoundFX } from '@/hooks/useSoundFX';

const SuitHologram3D = dynamic(
  () => import('../canvas/SuitHologram3D').then((mod) => mod.SuitHologram3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] sm:h-[440px] flex items-center justify-center bg-black/60 rounded-2xl border border-white/10 text-xs font-mono text-cyan-400">
        INITIALIZING 3D BIOMETRIC HOLOGRAM...
      </div>
    ),
  }
);

export interface SuitItem {
  id: string;
  code: string;
  title: string;
  hero: string;
  universe: 'Earth-616' | 'Earth-1610' | 'Earth-928' | 'Earth-1048' | 'MCU' | 'Alt-Verse';
  category: string;
  desc: string;
  fullLore: string;
  image: string;
  metrics: { label: string; value: string }[];
  accentColor: string;
}

export const ALL_SUITS: SuitItem[] = [
  // 1. Advanced Suit 2.0 (Earth-1048)
  {
    id: 'suit-adv-2',
    code: 'EARTH-1048 // ADVANCED 2.0',
    title: 'ADVANCED SUIT 2.0',
    hero: 'Peter Parker',
    universe: 'Earth-1048',
    category: 'White Spider Carbon Weave',
    desc: 'Flexible carbon nanofiber infused with white composite chest armor to absorb heavy kinetic strikes from the Sinister Six.',
    fullLore:
      'Co-engineered by Peter Parker and Dr. Otto Octavius, then further refined with high-tensile white composite polymers. Features micro-servos along the deltoids for augmented acrobatics and fluid dynamic webbing dispersion across Manhattan.',
    image: '/images/marvels-spider-man-2-5k-3840x2160-13725.jpg',
    metrics: [
      { label: 'Debut', value: 'Spider-Man 2 (PS5)' },
      { label: 'Designer', value: 'Peter & Otto' },
      { label: 'Signature', value: 'Web-Wings Surge' },
    ],
    accentColor: '#E62429',
  },
  // 2. Classic Red & Blue (Earth-616)
  {
    id: 'suit-classic-616',
    code: 'EARTH-616 // 1962 ORIGINAL',
    title: 'CLASSIC RED & BLUE',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Handcrafted Queens Spandex',
    desc: 'The timeless hand-stitched icon of Midtown High. Zero nanotech, pure unadulterated heart and grit.',
    fullLore:
      'First assembled on an old Singer sewing machine in Aunt May’s Queens home. Made from breathable synthetic spandex with heavy-duty black web-lining. Proves that it is not the armor that makes Spider-Man, but the vow behind the mask.',
    image: '/images/marvels-spider-man-3840x2160-13013.jpeg',
    metrics: [
      { label: 'Debut', value: 'Amazing Fantasy #15' },
      { label: 'Designer', value: 'Peter Parker' },
      { label: 'Signature', value: 'Classic Heart & Grit' },
    ],
    accentColor: '#E62429',
  },
  // 3. Web-Shooter Calibration Rig (Earth-616)
  {
    id: 'suit-web-calib',
    code: 'EARTH-616 // PARKER LABS',
    title: 'WEB-CALIBRATION RIG',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Tactical Fluid Dispersion',
    desc: 'Rapid-firing web-shooter wrist gauntlets with multi-nozzle spray and high-density ricochet webbing.',
    fullLore:
      'Peter’s specialized tactical loadout featuring custom-machined solenoid valves and rapid micro-cartridge revolving drums. Enables impact webbing, web-bombs, web-shields, and electric web stun lines.',
    image: '/images/marvels-spider-man-3840x2160-13286.jpeg',
    metrics: [
      { label: 'Debut', value: 'Amazing Spider-Man' },
      { label: 'Chamber PSI', value: '300 PSI' },
      { label: 'Signature', value: 'Impact Web Ricochet' },
    ],
    accentColor: '#0066FF',
  },
  // 4. Miles Bio-Electric Venom (Earth-1610)
  {
    id: 'suit-miles-bio',
    code: 'EARTH-1610 // BIO-VENOM',
    title: 'VENOM-BLAST STRIKE SUIT',
    hero: 'Miles Morales',
    universe: 'Earth-1610',
    category: 'Brooklyn Bio-Electric Weave',
    desc: 'Reinforced black-and-crimson mesh engineered to conduct and focus lethal bio-electric Venom charges.',
    fullLore:
      'Synthesized by Miles Morales with conductive micro-threads that channel his body’s natural bio-electric voltage into explosive Mega Venom Blasts and electric web tethers capable of disabling Roxxon armored enforcers.',
    image: '/images/miles-morales-power-beyond-death-mm-3840x2160.jpg',
    metrics: [
      { label: 'Debut', value: 'Miles Morales #1' },
      { label: 'Voltage', value: '1.2 Megavolts' },
      { label: 'Signature', value: 'Mega Venom Blast' },
    ],
    accentColor: '#FFE600',
  },
  // 5. Miles Leap of Faith (Earth-1610)
  {
    id: 'suit-miles-faith',
    code: 'EARTH-1610 // LEAP OF FAITH',
    title: 'LEAP OF FAITH SUIT',
    hero: 'Miles Morales',
    universe: 'Earth-1610',
    category: 'Brooklyn Streetwear Vanguard',
    desc: 'The iconic spray-painted red spider emblem worn over Nike Jordan 1s and black hoodie.',
    fullLore:
      'Born in a Brooklyn subway station with a can of red spray paint. Symbolizes the moment Miles stopped trying to be Peter Parker and embraced being the one and only Spider-Man of Brooklyn.',
    image: '/images/spider-man-into-the-spider-verse-miles-morales-spider-man-3840x2160-2948.jpg',
    metrics: [
      { label: 'Debut', value: 'Spider-Verse (2018)' },
      { label: 'Style', value: 'Jordan 1s & Hoodie' },
      { label: 'Signature', value: 'What’s Up Danger' },
    ],
    accentColor: '#E62429',
  },
  // 6. Chrono-2099 Cyber Rig (Earth-928)
  {
    id: 'suit-2099-chrono',
    code: 'EARTH-928 // NUEVA YORK 2099',
    title: 'CHRONO-2099 CYBER RIG',
    hero: 'Miguel O\'Hara',
    universe: 'Earth-928',
    category: 'Unstable-Molecule Exosuit',
    desc: 'Futuristic unstable-molecule suit featuring solid-light web gliders, talons, and accelerated sensory vision.',
    fullLore:
      'Engineered by geneticist Miguel O’Hara at Alchemax in Nueva York. Woven from 100% unstable-molecule fabric that never tears, paired with retractable razor talons that slice through titanium armor.',
    image: '/images/spiderman-2099-superhero-4k-8n-3840x2160.jpg',
    metrics: [
      { label: 'Debut', value: 'Spider-Man 2099 #1' },
      { label: 'Designer', value: 'Miguel O’Hara' },
      { label: 'Signature', value: 'Solid-Light Cape' },
    ],
    accentColor: '#00F0FF',
  },
  // 7. Nueva York Apex 2099 (8K)
  {
    id: 'suit-2099-8k',
    code: 'EARTH-928 // CITADEL LEADER',
    title: 'NUEVA YORK APEX 2099',
    hero: 'Miguel O\'Hara',
    universe: 'Earth-928',
    category: 'Hyper-Density Chitin Weave',
    desc: 'Uncompromising tactical suit built to maintain the stability of the Multiverse Canon at all costs.',
    fullLore:
      'Leader of the Spider-Society, Miguel commands the Multiverse watchtower with an iron will. His suit’s holographic interface communicates directly with Lyla, his sentient holographic AI companion.',
    image: '/images/spider-man-2099-8k-3840x2160-12436.jpg',
    metrics: [
      { label: 'Resolution', value: '8K Master' },
      { label: 'Companion', value: 'Lyla Holographic AI' },
      { label: 'Signature', value: 'Canon Event Shield' },
    ],
    accentColor: '#00F0FF',
  },
  // 8. Talon Protocol 2099
  {
    id: 'suit-2099-talon',
    code: 'EARTH-928 // ALCHEMAX GENETICS',
    title: 'TALON PROTOCOL 2099',
    hero: 'Miguel O\'Hara',
    universe: 'Earth-928',
    category: 'Predatory Arachnid Chassis',
    desc: 'High-speed predator chassis with bio-organic foreleg fangs and toxic micro-venom spinners.',
    fullLore:
      'When the canon is threatened, Miguel deploys the Talon Protocol. Equipped with gravimetric phase thrusters to chase dimensional anomalies through spacetime collapse events.',
    image: '/images/spider-man-2099-3840x2160-12392.jpg',
    metrics: [
      { label: 'Debut', value: 'Spider-Verse (2023)' },
      { label: 'Claws', value: 'Razor Chitin' },
      { label: 'Signature', value: 'Supersonic Dive' },
    ],
    accentColor: '#0066FF',
  },
  // 9. Spider-Punk Anarchy Overdrive
  {
    id: 'suit-punk',
    code: 'EARTH-138 // LONDON RIOT',
    title: 'ANARCHY-PUNK OVERDRIVE',
    hero: 'Hobie Brown',
    universe: 'Alt-Verse',
    category: 'Sonic-Static Distortion Vest',
    desc: 'Safety pins, studded leather vest, spiked mask, and an electric guitar that demolishes fascist police drones.',
    fullLore:
      'Hobie Brown refuses to follow corporate rules, fascist regimes, or standard animation frame rates. His suit generates 15,000 watts of discordant punk-rock feedback that paralyzes symbiote forces instantly.',
    image: '/images/spider-punk-spider-3840x2160-10004.jpg',
    metrics: [
      { label: 'Debut', value: 'Edge of Spider-Verse #2' },
      { label: 'Guitar Output', value: '15,000 Watts' },
      { label: 'Signature', value: 'Sonic Feedback Blast' },
    ],
    accentColor: '#FF0055',
  },
  // 10. Spider-Man Noir
  {
    id: 'suit-noir',
    code: 'EARTH-90214 // 1933 SHADOWS',
    title: 'PETER PARKER NOIR',
    hero: 'Peter Parker Noir',
    universe: 'Alt-Verse',
    category: 'Great Depression Trench Mantle',
    desc: 'Kevlar trench coat, pilot goggles, fedora, and a web that smells like leaded gasoline and egg creams.',
    fullLore:
      'Born in 1933 New York during the crushing depths of the Great Depression. This Spider-Man fights mobsters, corrupt politicians, and shadowy syndicates in stark black and white high-contrast shadow.',
    image: '/images/spiderman-noir-2026-3n-3840x2160.jpg',
    metrics: [
      { label: 'Debut', value: 'Spider-Man Noir #1 (2009)' },
      { label: 'Era', value: '1933 Prohibition NYC' },
      { label: 'Signature', value: 'Shadow Camouflage' },
    ],
    accentColor: '#94A3B8',
  },
  // 11. Across the Multiverse Rift
  {
    id: 'suit-across-rift',
    code: 'CITADEL // RIFT CORRIDOR',
    title: 'ACROSS THE MULTIVERSE RIFT',
    hero: 'Spider-Verse Alliance',
    universe: 'Earth-1610',
    category: 'Dimensional Convergence Point',
    desc: 'Hyperspatial transit junction where hundreds of Spider-Heroes converge to prevent canon collapse.',
    fullLore:
      'Connecting millions of parallel Earths via the Web of Life and Destiny. When a canon event is disrupted, alarm beacons flare across this dimension-spanning web structure.',
    image: '/images/spider-man-across-3840x2160-10010.jpg',
    metrics: [
      { label: 'Debut', value: 'Across the Spider-Verse' },
      { label: 'Allies', value: '840+ Variants' },
      { label: 'Signature', value: 'Multiverse Watch Travel' },
    ],
    accentColor: '#A855F7',
  },
  // 12. Spider-Society Citadel
  {
    id: 'suit-across-citadel',
    code: 'CITADEL // CANON CHAMBER',
    title: 'SPIDER-SOCIETY CITADEL',
    hero: 'Spider-Verse Alliance',
    universe: 'Earth-928',
    category: 'Central Multiverse Nexus',
    desc: 'The colossal holographic command center located in Nueva York 2099 overseen by Miguel O’Hara.',
    fullLore:
      'Home of the Go-Home Machine and the dimensional surveillance sphere. Here, every Spider-Variant must verify their biological frequency before being issued a Multiverse travel watch.',
    image: '/images/spider-man-across-3840x2160-11773.jpg',
    metrics: [
      { label: 'Location', value: 'Nueva York Watchtower' },
      { label: 'Tech', value: 'Go-Home Machine' },
      { label: 'Signature', value: 'Canon Event Tracker' },
    ],
    accentColor: '#00F0FF',
  },
  // 13. Brand New Day Armor
  {
    id: 'suit-brand-new',
    code: 'EARTH-616 // BRAND NEW DAY',
    title: 'BRAND NEW DAY ARMOR',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Stark-Tech Vanguard Prototype',
    desc: 'Polished ceramic-polymer plating with micro-nozzle web dispersion and heads-up tactical targeting.',
    fullLore:
      'Forged during Peter’s tenure at Parker Industries and Stark Labs. Features integrated optical HUD scanning, chemical sensors for airborne toxins, and emergency EMP dampeners.',
    image: '/images/spider-man-brand-3840x2160-26881.jpg',
    metrics: [
      { label: 'Debut', value: 'Amazing Spider-Man #546' },
      { label: 'Origin', value: 'Parker Industries' },
      { label: 'Signature', value: 'Tactical HUD Scan' },
    ],
    accentColor: '#E62429',
  },
  // 14. Spider-Sense Overdrive
  {
    id: 'suit-spidey-sense',
    code: 'EARTH-616 // PRECOG SENSOR',
    title: 'SPIDER-SENSE OVERDRIVE',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Neural-Synapse Precognition',
    desc: 'Neural mesh lining that mirrors the Spider-Sense brainwave frequency to trigger reflex dodges at 0.02ms.',
    fullLore:
      'Peter developed this rig after intense battles where his precognitive edge was pushed to the absolute limit. Micro-electrodes stimulate muscle twitches before conscious thought can process incoming danger.',
    image: '/images/spider-man-brand-new-day-spidey-senses-b9-3840x2160.jpg',
    metrics: [
      { label: 'Reflex Speed', value: '0.02 Milliseconds' },
      { label: 'Detection', value: '360° Omnidirectional' },
      { label: 'Signature', value: 'Pre-Cognitive Dodge' },
    ],
    accentColor: '#FFE600',
  },
  // 15. Symbiote Resonance Black Suit
  {
    id: 'suit-symbiote',
    code: 'EARTH-616 // KLYNTAR SYMBIOTE',
    title: 'SYMBIOTE BLACK SUIT',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Alien Klyntar Living Bio-Mass',
    desc: 'Unlimited organic webbing, terrifying strength amplification, and shapeshifting tendril strikes.',
    fullLore:
      'Retrieved from Battleworld during Secret Wars (1984). The alien symbiote bonds with Peter, amplifying his strength, speed, and endurance tenfold—at the perilous price of his morality and self-control.',
    image: '/images/spider-man-intense-3840x2160-25455.jpg',
    metrics: [
      { label: 'Debut', value: 'Secret Wars #8 (1984)' },
      { label: 'Origin', value: 'Klyntar Symbiote' },
      { label: 'Signature', value: 'Organic Web Tendrils' },
    ],
    accentColor: '#FFFFFF',
  },
  // 16. Manhattan Rooftop Guardian
  {
    id: 'suit-skyline-sentinel',
    code: 'EARTH-616 // MIDTOWN SENTINEL',
    title: 'MANHATTAN ROOFTOP GUARDIAN',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'High-Altitude Cold Weather Gear',
    desc: 'Reinforced thermal underlay and high-grip sole pads for vigilant winter watch over Manhattan.',
    fullLore:
      'Perched on the head of a Chrysler Building gargoyle through blizzards and rainstorms. Equipped with emergency hypothermia insulation and police scanner relays tuned to every precinct in NYC.',
    image: '/images/spider-man-rooftop-guardian-ce-3840x2160.jpg',
    metrics: [
      { label: 'Location', value: 'Chrysler Building Gargoyle' },
      { label: 'Radio Scanners', value: 'All 5 NYC Boroughs' },
      { label: 'Signature', value: 'Midnight Vigil' },
    ],
    accentColor: '#E62429',
  },
  // 17. The Devil Wears Red (Daredevil Team-Up)
  {
    id: 'suit-devil-red',
    code: 'EARTH-616 // HELL\'S KITCHEN',
    title: 'THE DEVIL WEARS RED',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Hell\'s Kitchen Night Patrol',
    desc: 'Impact-dampening baton holster and reinforced knuckles for close-quarters alleyway brawling.',
    fullLore:
      'Forged during joint alleyway sweeps with Daredevil through Hell’s Kitchen. Built to withstand Kingpin’s enforcers and heavy crowbar blows in dark Chinatown tenements.',
    image: '/images/spiderman-the-devil-wears-red-s5-3840x2160.jpg',
    metrics: [
      { label: 'Allies', value: 'Daredevil (Matt Murdock)' },
      { label: 'Territory', value: 'Hell’s Kitchen & Queens' },
      { label: 'Signature', value: 'Baton Strike Combination' },
    ],
    accentColor: '#E62429',
  },
  // 18. Friendly Neighborhood Hero
  {
    id: 'suit-queens-neighborhood',
    code: 'EARTH-616 // QUEENS PRIDE',
    title: 'FRIENDLY NEIGHBORHOOD HERO',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Forest Hills Everyday Classic',
    desc: 'Helping lost grandmas, retrieving stolen bicycles, and stopping convenience store robberies.',
    fullLore:
      'The soul of Peter Parker. It’s not just about stopping alien armadas or dimensional rifts—it’s about looking out for the little guy in Forest Hills, Queens. Your Friendly Neighborhood Spider-Man.',
    image: '/images/spiderman-your-friendly-neighborhood-hero-r3-3840x2160.jpg',
    metrics: [
      { label: 'Home Borough', value: 'Queens, New York' },
      { label: 'Civic Heart', value: '100% Everyday Hero' },
      { label: 'Signature', value: 'Friendly Neighborhood Quip' },
    ],
    accentColor: '#E62429',
  },
  // 19. NEW: Golden Hour Web-Swing (Earth-1048)
  {
    id: 'suit-golden-swing',
    code: 'EARTH-1048 // GOLDEN HOUR',
    title: 'GOLDEN HOUR WEB-SWING',
    hero: 'Peter Parker',
    universe: 'Earth-1048',
    category: 'Sunset Fifth Avenue Traversal',
    desc: 'Soaring down Fifth Avenue at sunset with the warm New York golden hour reflecting across the Empire State Building.',
    fullLore:
      'Captured in pristine 4K during Peter’s evening patrol across Manhattan. Demonstrates the fluid momentum and gravity-defying grace of dual-filament web slinging at 85 miles per hour.',
    image: '/images/marvels-spider-man-3840x2160-11811.jpeg',
    metrics: [
      { label: 'Debut', value: 'Marvel\'s Spider-Man PS4' },
      { label: 'Speed', value: '85 MPH Terminal Arc' },
      { label: 'Signature', value: 'Point Launch Catapult' },
    ],
    accentColor: '#F59E0B',
  },
  // 20. NEW: Inverted Skyline Perch
  {
    id: 'suit-inverted-perch',
    code: 'EARTH-616 // INVERTED PERCH',
    title: 'INVERTED SKYLINE PERCH',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Sub-Ceiling Wall-Hang Pose',
    desc: 'Hanging upside down from an elastic web thread while scouting the city below with classic Spidey wit.',
    fullLore:
      'The definitive Spider-Man silhouette. Using sub-atomic electrostatic attraction, Peter anchors a single high-tensile silk strand to a steel bridge girder, dangling in mid-air to surprise fleeing bank robbers.',
    image: '/images/marvels-spider-man-3840x2160-11990.jpeg',
    metrics: [
      { label: 'Debut', value: 'Amazing Spider-Man #300' },
      { label: 'Adhesion', value: 'Electrostatic Cling' },
      { label: 'Signature', value: 'Upside-Down Web Hang' },
    ],
    accentColor: '#0066FF',
  },
  // 21. NEW: Manhattan Showdown (Ultrawide 4K)
  {
    id: 'suit-manhattan-showdown',
    code: 'EARTH-1048 // ULTRAWIDE CINEMATIC',
    title: 'MANHATTAN SHOWDOWN',
    hero: 'Peter Parker',
    universe: 'Earth-1048',
    category: 'Panoramic Cinematic Battle',
    desc: 'Wide-angle 4096x1738 composition capturing the chaos and energy of defending New York rooftops.',
    fullLore:
      'Rendered in dramatic 21:9 ultrawide cinematic aspect ratio. Peter stands vigilant above the foggy Manhattan grid, preparing to intercept Doctor Octopus and the escaped villains from the Raft prison break.',
    image: '/images/marvels-spider-man-4096x1738-13276.jpeg',
    metrics: [
      { label: 'Aspect Ratio', value: '21:9 Ultrawide' },
      { label: 'Resolution', value: '4096 x 1738' },
      { label: 'Signature', value: 'Cinematic Rooftop Clash' },
    ],
    accentColor: '#E62429',
  },
  // 22. NEW: Midtown High Leap (5K Master)
  {
    id: 'suit-midtown-5k',
    code: 'EARTH-616 // 5K MASTERWORK',
    title: 'MIDTOWN HIGH LEAP',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: '5K High-Altitude Masterpiece',
    desc: 'Full 5120x2880 ultra-resolution depiction of Peter launching himself from a rooftop spire into the blue New York sky.',
    fullLore:
      'Every single seam, muscle contour, and web-nozzle valve is rendered in breathtaking 5K clarity. The sheer sense of scale, height, and aerial freedom captures what it truly feels like to be Spider-Man.',
    image: '/images/spider-man-5120x2880-21603.jpg',
    metrics: [
      { label: 'Resolution', value: '5120 x 2880 (5K)' },
      { label: 'Elevation', value: '+650 FT Freefall' },
      { label: 'Signature', value: 'Apex Springboard Leap' },
    ],
    accentColor: '#E62429',
  },
  // 23. NEW: Stealth Ops Night Monkey (MCU)
  {
    id: 'suit-night-monkey',
    code: 'MCU // S.H.I.E.L.D. STEALTH',
    title: 'STEALTH OPS "NIGHT MONKEY"',
    hero: 'Peter Parker',
    universe: 'MCU',
    category: 'S.H.I.E.L.D. Covert Tactical Suit',
    desc: 'Matte black Kevlar body armor and flip-up goggles provided by Nick Fury for covert European operations.',
    fullLore:
      'When Peter traveled to Prague, Nick Fury supplied this stealth suit to conceal Spider-Man’s identity abroad—prompting Ned Leeds to dub him the "Night Monkey". Features silenced web ejectors and non-reflective fabric.',
    image: '/images/spider-man-black-suit-spider-man-far-from-home-black-3840x2458-658.jpg',
    metrics: [
      { label: 'Debut', value: 'Far From Home (2019)' },
      { label: 'Supplier', value: 'Nick Fury / S.H.I.E.L.D.' },
      { label: 'Signature', value: 'Flip-Up Ballistic Goggles' },
    ],
    accentColor: '#64748B',
  },
  // 24. NEW: Iron Spider Nanotech Armor (5K)
  {
    id: 'suit-iron-spider-5k',
    code: 'EARTH-616 // STARK TECH 5K',
    title: 'IRON SPIDER NANOTECH ARMOR',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: 'Liquid Nanite Liquid-Metal Exosuit',
    desc: 'Stark Industries Model 17 armor featuring four golden mechanical waldo arms and repulsor-assisted web jumps.',
    fullLore:
      'Forged by Tony Stark ahead of the superhero Civil War. The metallic crimson-and-gold armor is woven from liquid nanites that can morph into four rapid-striking mechanical legs, glide chutes, and environmental life-support.',
    image: '/images/spider-man-brand-5120x3814-26879.jpg',
    metrics: [
      { label: 'Debut', value: 'Amazing Spider-Man #529' },
      { label: 'Designer', value: 'Tony Stark' },
      { label: 'Signature', value: '4 Retractable Waldoes' },
    ],
    accentColor: '#FFE600',
  },
  // 25. NEW: Panoramic Rooftop Sprint
  {
    id: 'suit-panoramic-sprint',
    code: 'EARTH-616 // PANORAMIC SPRINT',
    title: 'PANORAMIC ROOFTOP SPRINT',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: '5433x2160 Ultrawide Velocity',
    desc: 'Full-tilt sprint across iron fire escapes and water towers, timing the perfect web-shot to intercept villains.',
    fullLore:
      'An expansive panoramic perspective of Peter’s lightning-fast acrobatics across Manhattan. Built to showcase the horizontal speed and momentum of navigating New York’s dense rooftop landscape.',
    image: '/images/spider-man-brand-5433x2160-26134.jpg',
    metrics: [
      { label: 'Resolution', value: '5433 x 2160' },
      { label: 'Sprint Speed', value: '90 MPH Velocity' },
      { label: 'Signature', value: 'Fire Escape Wall-Run' },
    ],
    accentColor: '#E62429',
  },
  // 26. NEW: 8K Ultimate Spider-Man Icon
  {
    id: 'suit-ultimate-8k',
    code: 'EARTH-616 // 8K MASTER ICON',
    title: '8K ULTIMATE SPIDER-MAN',
    hero: 'Peter Parker',
    universe: 'Earth-616',
    category: '7680x4320 True Color Resolution',
    desc: 'The ultimate collector’s masterpiece rendered in monumental 8K fidelity, showing every spandex stitch and web line.',
    fullLore:
      'The crown jewel of the Multiverse Vault. Rendered in native 7680x4320 8K resolution, capturing the classic, heroic, and eternal spirit of Spider-Man standing tall as the protector of New York City.',
    image: '/images/spider-man-brand-7680x4320-26949.jpg',
    metrics: [
      { label: 'Resolution', value: '7680 x 4320 (8K)' },
      { label: 'Fidelity', value: 'True Marvel Master' },
      { label: 'Signature', value: 'Timeless Comic Icon' },
    ],
    accentColor: '#E62429',
  },
];

export const GallerySection: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'PETER' | 'MILES' | '2099' | 'ALT'>('ALL');
  const [selectedSuit, setSelectedSuit] = useState<SuitItem | null>(null);
  const [modalTab, setModalTab] = useState<'image' | '3d'>('image');
  const { playHover, playSpiderSense, playThwip } = useSoundFX();
  const x = useMotionValue(0);

  const filteredSuits = ALL_SUITS.filter((suit) => {
    if (filter === 'ALL') return true;
    if (filter === 'PETER') return suit.hero.includes('Peter Parker') && (suit.universe === 'Earth-616' || suit.universe === 'Earth-1048' || suit.universe === 'MCU');
    if (filter === 'MILES') return suit.hero.includes('Miles Morales') || suit.universe === 'Earth-1610';
    if (filter === '2099') return suit.hero.includes('Miguel') || suit.universe === 'Earth-928';
    if (filter === 'ALT') return suit.universe === 'Alt-Verse';
    return true;
  });

  const slideLeft = () => {
    playHover();
    x.set(Math.min(x.get() + 380, 0));
  };

  const slideRight = () => {
    playHover();
    const minX = -Math.max(0, (filteredSuits.length - 3) * 380);
    x.set(Math.max(x.get() - 380, minX));
  };

  const handleFilterChange = (newFilter: 'ALL' | 'PETER' | 'MILES' | '2099' | 'ALT') => {
    playSpiderSense();
    setFilter(newFilter);
    x.set(0);
  };

  const handleCardSelect = (suit: SuitItem) => {
    playThwip();
    setModalTab('image');
    setSelectedSuit(suit);
  };

  return (
    <section
      id="gallery"
      className="relative w-full py-28 bg-[#07070B] overflow-hidden select-none"
      aria-label="Multiverse Suit Armory & 4K Archives"
    >
      {/* Dynamic Spider-Glow Atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2 glass-panel px-3.5 py-1 rounded-full border border-red-500/40 text-xs font-mono text-red-400 tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(230,36,41,0.2)]">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            MULTIVERSE SUIT VAULT // 26 AUTHENTIC MASTERPIECES
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight text-white uppercase leading-none">
            Multiverse <span className="text-glow-spider text-red-500">Armory</span>
          </h2>
          <p className="text-slate-300 text-sm md:text-base mt-2 max-w-xl font-light">
            Explore all 26 high-resolution suits from Earth-616, Earth-1610, Earth-928, and Earth-1048. Inspect comic debuts, suit creators, combat abilities, and download ultra-HD wallpapers.
          </p>
        </div>

        {/* Dimension Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 md:mt-0">
          <div className="flex flex-wrap items-center glass-panel p-1 rounded-2xl border border-white/10 gap-1">
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${
                filter === 'ALL'
                  ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(230,36,41,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL (26)
            </button>
            <button
              onClick={() => handleFilterChange('PETER')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${
                filter === 'PETER'
                  ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(230,36,41,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PETER (616/1048)
            </button>
            <button
              onClick={() => handleFilterChange('MILES')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${
                filter === 'MILES'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MILES (1610)
            </button>
            <button
              onClick={() => handleFilterChange('2099')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${
                filter === '2099'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MIGUEL (928)
            </button>
            <button
              onClick={() => handleFilterChange('ALT')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all ${
                filter === 'ALT'
                  ? 'bg-pink-600 text-white font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PUNK & NOIR
            </button>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={slideLeft}
              className="p-3 rounded-full glass-panel border border-white/10 text-slate-300 hover:text-white hover:border-red-500 transition-colors"
              aria-label="Previous suit"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={slideRight}
              className="p-3 rounded-full glass-panel border border-white/10 text-slate-300 hover:text-white hover:border-red-500 transition-colors"
              aria-label="Next suit"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Drag Instruction */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 flex items-center justify-between text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <MoveHorizontal className="w-4 h-4 text-red-500 animate-pulse" />
          <span>DRAG HORIZONTALLY • CLICK ANY SUIT TO INSPECT ULTRA-HD 4K/5K/8K DOSSIER</span>
        </div>
        <div className="text-slate-400">
          SHOWING <span className="text-white font-bold">{filteredSuits.length}</span> OF 26 SUITS
        </div>
      </div>

      {/* Horizontal Draggable Strip with 3D Y-Axis Dynamic Rotation */}
      <div className="cursor-grab active:cursor-grabbing px-4 md:px-8 overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ left: -Math.max(0, (filteredSuits.length - 3) * 380), right: 0 }}
          dragElastic={0.15}
          style={{ x }}
          className="flex gap-6 md:gap-8 w-max py-6"
        >
          {filteredSuits.map((suit, index) => (
            <SuitCard
              key={suit.id}
              suit={suit}
              index={index}
              parentX={x}
              onSelect={() => handleCardSelect(suit)}
            />
          ))}
        </motion.div>
      </div>

      {/* 4K/5K/8K Cinematic Lightbox Modal */}
      <AnimatePresence>
        {selectedSuit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl"
            onClick={() => setSelectedSuit(null)}
          >
            <motion.div
              layoutId={`suit-${selectedSuit.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl glass-panel-glow p-6 md:p-10 rounded-3xl border border-red-500/50 shadow-[0_0_80px_rgba(230,36,41,0.35)] overflow-hidden max-h-[92vh] overflow-y-auto flex flex-col lg:flex-row gap-8 items-center bg-[#0B0B14]/95"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedSuit(null)}
                className="absolute top-6 right-6 p-2.5 rounded-full glass-panel border border-white/10 text-slate-300 hover:text-white hover:border-red-500 transition-colors z-20"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Media Display: 4K Artwork or 3D Holographic Scanner */}
              <div className="relative w-full lg:w-3/5 flex flex-col gap-3">
                {/* View Mode Switcher */}
                <div className="flex items-center gap-2 self-start glass-panel p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => {
                      playHover();
                      setModalTab('image');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalTab === 'image'
                        ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(230,36,41,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>4K Artwork</span>
                  </button>
                  <button
                    onClick={() => {
                      playHover();
                      setModalTab('3d');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalTab === '3d'
                        ? 'bg-cyan-600 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5 text-cyan-300" />
                    <span>3D Hologram Scan</span>
                  </button>
                </div>

                {/* Viewport: 4K Wallpaper vs 3D Hologram */}
                {modalTab === 'image' ? (
                  <div className="relative w-full h-[340px] sm:h-[440px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                    <Image
                      src={selectedSuit.image}
                      alt={selectedSuit.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 700px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070B] via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 glass-panel px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-red-400 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-red-500" />
                      AUTHENTIC MARVEL MASTER // 4K / 5K / 8K RESOLUTION
                    </div>
                  </div>
                ) : (
                  <SuitHologram3D
                    accentColor={selectedSuit.accentColor}
                    universe={selectedSuit.universe}
                  />
                )}
              </div>

              {/* Tactical Dossier Details */}
              <div className="w-full lg:w-2/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-red-400 tracking-widest uppercase">
                      {selectedSuit.code}
                    </span>
                    <span className="text-xs font-mono text-slate-500">•</span>
                    <span className="text-xs font-mono text-slate-300 uppercase">
                      {selectedSuit.hero}
                    </span>
                    <span className="text-xs font-mono text-slate-500">•</span>
                    <span className="text-xs font-mono text-cyan-400 uppercase">
                      {selectedSuit.universe}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl text-white uppercase mb-4 text-glow-spider">
                    {selectedSuit.title}
                  </h3>

                  <div className="inline-block text-[11px] font-mono px-2.5 py-1 rounded-md bg-red-600/20 text-red-300 border border-red-500/30 uppercase tracking-widest mb-4">
                    {selectedSuit.category}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6 font-light">
                    {selectedSuit.fullLore}
                  </p>

                  {/* Authentic Superhero & Combat Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {selectedSuit.metrics.map((m) => (
                      <div key={m.label} className="glass-panel p-3 rounded-xl border border-white/5 text-center">
                        <div className="text-[9px] font-mono uppercase text-slate-400">{m.label}</div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-red-400 mt-0.5 truncate">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                  <a
                    href={selectedSuit.image}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 glass-panel px-4 py-3 rounded-xl border border-red-500/40 text-xs font-mono uppercase tracking-wider text-white hover:bg-red-600/30 transition-colors shadow-[0_0_15px_rgba(230,36,41,0.2)]"
                  >
                    <Download className="w-4 h-4 text-red-400" />
                    Download Ultra-HD
                  </a>
                  <MagneticButton
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedSuit(null)}
                    className="flex-1"
                  >
                    Close Dossier
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const SuitCard: React.FC<{ suit: SuitItem; index: number; parentX: MotionValue<number>; onSelect: () => void }> = ({
  suit,
  index,
  parentX,
  onSelect,
}) => {
  const cardOffset = index * 380;
  const rotateY = useTransform(
    parentX,
    [-cardOffset - 500, -cardOffset + 200, -cardOffset + 900],
    [
      voltAnimationConfig.gallery.cardPerspectiveRotateY,
      0,
      -voltAnimationConfig.gallery.cardPerspectiveRotateY,
    ]
  );

  return (
    <motion.div
      style={{
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1200,
      }}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      onClick={onSelect}
      className="relative w-[300px] sm:w-[350px] md:w-[390px] h-[540px] rounded-3xl glass-panel border border-white/10 p-4 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_15px_45px_rgba(230,36,41,0.3)] hover:border-red-500/60 cursor-pointer group bg-[#0A0A12]/90"
    >
      {/* High-Resolution Suit Artwork */}
      <div className="relative w-full h-[350px] rounded-2xl overflow-hidden border border-white/5 bg-slate-950">
        <Image
          src={suit.image}
          alt={suit.title}
          fill
          sizes="(max-width: 768px) 350px, 390px"
          className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E18] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 scanlines-overlay opacity-20 pointer-events-none" />

        {/* Floating Universe Badge */}
        <div className="absolute top-3 left-3 glass-panel px-2.5 py-1 rounded-lg border border-white/10 text-[9px] font-mono tracking-widest text-red-400">
          {suit.code}
        </div>

        {/* Hero Tag */}
        <div className="absolute top-3 right-3 glass-panel px-2.5 py-1 rounded-lg border border-white/10 text-[9px] font-mono tracking-widest text-white/90">
          {suit.universe}
        </div>

        {/* Quick View Pill */}
        <div className="absolute bottom-3 right-3 glass-panel px-3 py-1 rounded-full border border-red-500/40 text-[10px] font-mono uppercase text-white flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/30">
          <Eye className="w-3.5 h-3.5 text-red-400" />
          Inspect Ultra-HD
        </div>
      </div>

      {/* Metadata */}
      <div className="pt-3 px-1">
        <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-1 flex items-center justify-between">
          <span className="truncate max-w-[200px]">{suit.category}</span>
          <span className="text-slate-400">{suit.hero}</span>
        </div>
        <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2 group-hover:text-red-400 transition-colors">
          {suit.title}
        </h3>
        <p className="text-slate-400 text-xs font-light leading-relaxed line-clamp-2">
          {suit.desc}
        </p>
      </div>

      {/* Bottom Metric Tags */}
      <div className="border-t border-white/5 pt-3 px-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>{suit.metrics[0].label}: <strong className="text-red-400">{suit.metrics[0].value}</strong></span>
        <span>{suit.metrics[2].label}: <strong className="text-cyan-400">{suit.metrics[2].value}</strong></span>
      </div>
    </motion.div>
  );
};
