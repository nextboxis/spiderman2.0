# Thematic Lore Standards & Anti-AI-Slop Invariants

## Scope & Objective
When creating, maintaining, or expanding branded, themed, or narrative web experiences (such as Marvel, superhero, cinematic, or franchise tributes), agents must strictly adhere to authentic canonical lore and completely eliminate generic robotic AI buzzwords.

---

## 1. Zero AI Slop & Buzzword Prohibition
Never populate themed components with hallucinated pseudo-sci-fi jargon or corporate tech boilerplate, including but not limited to:
- ❌ *"0G Squad"*, *"Inertia Null 99.8%"*, *"Gravimetric Stratosphere 0.0G"*
- ❌ *"Photonic Trench Mantle"*, *"Radar Cross 0.001m²"*, *"Optical Refraction Node"*
- ❌ *"Recruitment Protocol"*, *"Vanguard Directive"*, *"Tether Core 01"*

---

## 2. Canonical Lore Grounding Invariants
Always anchor characters, suits, equipment, and storytelling in genuine canonical source material:
1. **Real Comic & Cinematic Debuts**:
   - Explicitly cite real issues and films (e.g. *Amazing Fantasy #15*, *Secret Wars #8*, *Spider-Man 2099 #1*, *Amazing Spider-Man #529*, *Spider-Man: Far From Home*).
2. **In-Universe Creators & Designers**:
   - Attribute gear and suits to authentic lore creators (Peter Parker, Otto Octavius, Tony Stark, Nick Fury / S.H.I.E.L.D., Alchemax, Hobie Brown).
3. **Canonical Combat Mechanics & Abilities**:
   - Feature genuine superhero powers (Spider-Sense precognition, Web-Wings, Bio-Electric Venom Blast, Optical Camouflage, Wall-Crawling electrostatic adhesion).
4. **In-Universe Media & Dialogue**:
   - Integrate living world elements like *The Daily Bugle* breaking news ticker with authentic J. Jonah Jameson quotes, front-page photos, and Peter Parker freelancing lore.
5. **Authentic Rogues & Tactical Countermeasures**:
   - Detail recognized arch-nemeses (Green Goblin, Doctor Octopus, Venom, The Spot, Kingpin, Kraven) alongside verified tactical countermeasures and exploitable weaknesses.

---

## 3. Sandboxed Asset Pipeline Synchronization
When assets or images are added directly to the workspace root and shell file-copy commands are constrained by local environment sandboxes:
- Programmatically sync assets via build hooks in `next.config.ts` using Node `fs.readdirSync` and `fs.copyFileSync`.
- Automatically copy root-level media files into `public/images/` at startup to ensure immediate asset availability with zero broken image links.
