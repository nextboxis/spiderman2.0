/**
 * VOLT - Animation Tuning Configuration
 * 
 * Adjust these parameters to scale animation intensity, timings,
 * physics spring stiffness, and particle density across the entire landing page.
 */
export const voltAnimationConfig = {
  // Global intensity multiplier (0.0 = static, 1.0 = normal, 1.5 = high kinetic energy)
  globalMotionScale: 1.0,

  // Idle state trigger duration (milliseconds of no input before orbital drift begins)
  idleTimeoutMs: 5000,
  idleOrbitalSpeed: 0.35,

  // Cursor tether physics
  cursor: {
    ringRadius: 28,
    stretchMultiplier: 0.45,
    maxTetherLength: 160,
    tensionSpring: 0.18,
    friction: 0.72,
    glowBlur: 14,
  },

  // Magnetic button pull dynamics
  magnetic: {
    pullRadius: 90,        // Distance in px where magnetic pull activates
    pullFactor: 0.35,       // Strength of the pull towards cursor (0 - 1)
    springDamping: 15,     // Spring damping
    springStiffness: 180,   // Spring stiffness
  },

  // 3D Card Tilt parameters
  tilt: {
    maxTiltDeg: 14,        // Maximum tilt angle in degrees
    perspective: 1000,     // CSS perspective depth in px
    glareOpacity: 0.28,    // Intensity of specular reflection glare
    returnSpeedMs: 400,    // Transition duration to return to flat
  },

  // Hero section animations
  hero: {
    letterStaggerDelay: 0.035, // Stagger between letters
    springStiffness: 220,
    springDamping: 12,
    floatingAmplitude: 6,      // Persistent drift amplitude in px
    floatingFrequency: 2.2,    // Floating cycle speed in seconds
  },

  // Three.js 3D scene parameters
  threeScene: {
    cameraFov: 50,
    mouseParallaxFactor: 0.8,  // Camera pan response to mouse
    floatingShardCount: 36,    // Number of floating debris pieces
    rotationSpeed: 0.0015,     // Orbital background drift
    tetherPulsesPerSecond: 2.5,
  },

  // Manifesto pinned scroll parameters
  manifesto: {
    pinDurationVh: 300,        // Total scroll height for pinned section in vh
    cameraTiltMaxDeg: 9,       // Max background tilt in degrees
    wordVelocityDriftMax: 45,  // Max horizontal drift of words on rapid scroll
  },

  // Gallery horizontal scroll
  gallery: {
    cardPerspectiveRotateY: 32, // Rotation in degrees as cards cross edges
    dragFriction: 0.88,
  },

  // Timeline stroke animation
  timeline: {
    strokeWidth: 3,
    pulseSpeed: 1.8,
  },

  // Confetti / Inverted Gravity CTA
  cta: {
    invertedGravity: -0.65,    // Negative gravity value for upward launch
    particleCount: 65,
    burstVelocity: 28,
  },

  // Colors
  colors: {
    baseDark: '#07070B',
    electricViolet: '#8B5CF6',
    plasmaCyan: '#22D3EE',
    warningAmber: '#F59E0B',
    surfaceDark: '#0E0E18',
    surfaceElevated: '#17172A',
  },
} as const;

export type VoltAnimationConfig = typeof voltAnimationConfig;
