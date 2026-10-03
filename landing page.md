You are a senior creative front-end engineer. Build a single-page, production-quality landing page for "VOLT", an original anti-gravity superhero brand. VOLT is a masked urban acrobat who moves by launching and swinging on glowing plasma tethers through a floating, gravity-broken city. This is an ORIGINAL character — do not reference or imitate any existing comic, film, or game character, logo, suit, or brand.

TECH STACK
- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion for layout/scroll/gesture animation
- GSAP + ScrollTrigger for timeline-driven scroll choreography
- Three.js via @react-three/fiber + @react-three/drei for the 3D hero scene
- Lenis for smooth scrolling
- All assets must be generated in code (SVG, shaders, procedural geometry, CSS) or use license-free placeholders. No copyrighted imagery.

VISUAL DIRECTION
- Theme: anti-gravity. Nothing sits still — objects drift, hover, tilt, and rotate slowly as if weightless.
- Palette: near-black base (#07070B), electric violet (#8B5CF6), plasma cyan (#22D3EE), warning amber accent (#F59E0B). Neon glows with soft bloom.
- Typography: a condensed geometric display font for headlines (e.g. "Bebas Neue" or "Anton"), a clean grotesk for body ("Inter"). Oversized hero type, tight tracking, mixed weights.
- Mood: cinematic, futuristic, kinetic. Glassmorphism panels, chromatic aberration on hover, grain overlay, subtle scanlines.

PAGE SECTIONS (in order)
1. Preloader — animated tether "charging" bar that snaps into the hero logo, then the loader lifts off-screen as if losing gravity.
2. Hero — full-viewport 3D scene: a stylized low-poly city where buildings and debris float at different depths with parallax tied to mouse position. A glowing tether arcs across the scene on load. Headline text animates in letter-by-letter with a spring; each letter floats gently afterward. Custom cursor: a glowing ring that stretches into a tether line when the user moves fast.
3. Manifesto — pinned scroll section. Three statements reveal one at a time as the user scrolls; the background camera slowly tilts to sell the loss of gravity. Words split and drift apart on scroll velocity.
4. Abilities — 4 cards (Tether Launch, Zero-G Vault, Static Pulse, Freefall Sense). Cards hover in 3D tilt (react to cursor), glow on hover, and magnetically pull toward the cursor. Clicking a card expands it into a full-width detail panel with a shared-layout animation.
5. Gallery — horizontal scroll-jacked strip of procedurally generated "poster" panels (SVG shapes + gradients, no real images). Panels rotate on the Y axis as they pass center. Drag-enabled with inertia.
6. Timeline — vertical path drawn by a glowing SVG stroke as the user scrolls; each milestone node pulses and unfolds a caption.
7. CTA — "Join the Freefall" email capture. Input has a floating label, animated border gradient, success state where the button launches upward and confetti particles drift downward (inverted gravity). 
8. Footer — floating social icons on individual sine-wave loops; a "return to ground" button that scrolls to top with the page appearing to fall back into place.

MICRO-INTERACTIONS (mandatory on every interactive element)
- Buttons: magnetic pull, scale + glow on hover, ripple on click, spring release.
- Links: underline drawn from center outward, subtle chromatic split on hover.
- Nav: hides on scroll-down, reveals with a glass blur on scroll-up; active link has a floating indicator that eases between items.
- Images/cards: parallax depth on mouse, tilt with perspective, shadow that responds to cursor angle.
- Section transitions: staggered reveals (opacity + y + blur), clip-path wipes between major sections.
- Idle state: after 5s of no input, floating elements begin a slow orbital drift.

PERFORMANCE & QUALITY
- 60fps target. Use transform/opacity only for animations; will-change sparingly.
- Reduce or disable heavy effects when prefers-reduced-motion is set.
- Lazy-load the 3D scene; provide a CSS-only fallback for low-end devices.
- Fully responsive: mobile replaces 3D scene with a lighter 2D canvas particle field and touch-friendly gestures.
- Lighthouse performance ≥ 85, accessibility ≥ 95 (semantic HTML, focus states, aria labels, keyboard-navigable cards and gallery).

DELIVERABLES
- Complete file structure with components split by section.
- Reusable hooks: useMagnetic, useTilt, useScrollVelocity, useCursor.
- A short README explaining how to tune animation intensity via a single config object.
- Comment the animation timelines so they're easy to modify.

Before coding, briefly outline the component tree and animation timeline, then implement everything end-to-end. Do not leave placeholders or TODOs.