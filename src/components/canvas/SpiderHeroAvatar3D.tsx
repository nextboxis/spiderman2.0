'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type HeroPoseState = 'idle' | 'freefall' | 'swinging' | 'slingshot' | 'crouch';
export type SuitVariant = 'dusk' | 'noir' | 'neon';

interface SpiderHeroAvatar3DProps {
  position?: THREE.Vector3;
  velocity?: THREE.Vector3;
  playerRef?: React.RefObject<{ pos: THREE.Vector3; vel: THREE.Vector3 }>;
  isWebAttached: boolean;
  anchorPosition?: THREE.Vector3 | null;
  cameraMode: 'chase' | 'fps';
  /** Which Earth the suit belongs to: 616 classic, 90214 Noir, 928 (2099) */
  suit?: SuitVariant;
  onHandPositionUpdate?: (handPos: THREE.Vector3) => void;
}

// ---------------------------------------------------------------------------
// Procedural suit textures (built once, zero per-frame cost)
// ---------------------------------------------------------------------------

/** Classic Ditko-style web pattern: radial spokes + sagging concentric strands. */
function createWebTexture(baseColor: string, lineColor: string, repeat: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle fabric shading so the red isn't flat
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, 'rgba(255,255,255,0.06)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = lineColor;
  ctx.lineCap = 'round';

  const cx = 256;
  const cy = 256;
  const spokes = 16;

  // Radial spokes (drawn past the edge so tiling looks continuous)
  ctx.lineWidth = 3.2;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 420, cy + Math.sin(a) * 420);
    ctx.stroke();
  }

  // Concentric strands that sag between spokes (the classic "droop")
  ctx.lineWidth = 2.4;
  for (let ring = 1; ring <= 9; ring++) {
    const r = ring * 30;
    const sag = 0.82;
    ctx.beginPath();
    for (let i = 0; i <= spokes; i++) {
      const a0 = (i / spokes) * Math.PI * 2;
      const a1 = ((i + 1) / spokes) * Math.PI * 2;
      const mid = (a0 + a1) / 2;
      const p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r];
      const pm = [cx + Math.cos(mid) * r * sag, cy + Math.sin(mid) * r * sag];
      const p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
      if (i === 0) ctx.moveTo(p0[0], p0[1]);
      ctx.quadraticCurveTo(pm[0], pm[1], p1[0], p1[1]);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Fine hex "nano-mesh" weave used on the 2099 suit and the blue panels. */
function createWeaveTexture(baseColor: string, lineColor: string, repeat: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  const s = 14;
  for (let y = 0; y < 256 + s; y += s * 0.87) {
    const row = Math.round(y / (s * 0.87));
    for (let x = row % 2 === 0 ? 0 : s / 2; x < 256 + s; x += s) {
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        const px = x + Math.cos(a) * (s / 2) * 0.92;
        const py = y + Math.sin(a) * (s / 2) * 0.92;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface SuitPalette {
  primary: string; // webbed areas (red on 616)
  primaryLines: string;
  secondary: string; // panels (blue on 616)
  secondaryLines: string;
  gloveBoot: string;
  emblemFront: string;
  emblemBack: string;
  lens: string;
  lensRim: string;
  lensEmissive: number;
  rimLight: string;
  shooter: string;
}

const PALETTES: Record<SuitVariant, SuitPalette> = {
  // Earth-616 — Peter Parker's classic (Amazing Fantasy #15)
  dusk: {
    primary: '#C41E24',
    primaryLines: '#1A0507',
    secondary: '#1E3A8A',
    secondaryLines: '#132A63',
    gloveBoot: '#C41E24',
    emblemFront: '#0A0A0A',
    emblemBack: '#C41E24',
    lens: '#F8FAFC',
    lensRim: '#0A0A0A',
    lensEmissive: 0.55,
    rimLight: '#FFB4B4',
    shooter: '#94A3B8',
  },
  // Earth-90214 — Spider-Man Noir (trench-coat-era black suit, goggle lenses)
  noir: {
    primary: '#1C1C1F',
    primaryLines: '#0A0A0C',
    secondary: '#2A2A2E',
    secondaryLines: '#151517',
    gloveBoot: '#111114',
    emblemFront: '#3F3F46',
    emblemBack: '#3F3F46',
    lens: '#E5E7EB',
    lensRim: '#52525B',
    lensEmissive: 0.9,
    rimLight: '#CBD5E1',
    shooter: '#71717A',
  },
  // Earth-928 — Miguel O'Hara, Spider-Man 2099 (Alchemax unstable-molecule suit)
  neon: {
    primary: '#0B1B5E',
    primaryLines: '#071240',
    secondary: '#0A1548',
    secondaryLines: '#061034',
    gloveBoot: '#0B1B5E',
    emblemFront: '#E11D2B',
    emblemBack: '#E11D2B',
    lens: '#E11D2B',
    lensRim: '#0A0A0A',
    lensEmissive: 2.4,
    rimLight: '#FF5A6A',
    shooter: '#E11D2B',
  },
};

// ---------------------------------------------------------------------------
// Pose targets (radians) — blended with lerp for smooth transitions
// ---------------------------------------------------------------------------
interface JointPose {
  spineX: number;
  headX: number;
  lShoulder: [number, number, number];
  rShoulder: [number, number, number];
  lElbow: number;
  rElbow: number;
  lHip: [number, number, number];
  rHip: [number, number, number];
  lKnee: number;
  rKnee: number;
}

const POSES: Record<HeroPoseState, JointPose> = {
  swinging: {
    spineX: 0.3,
    headX: -0.35,
    lShoulder: [0.9, 0, -0.7],
    rShoulder: [-2.75, 0, 0.35],
    lElbow: -0.9,
    rElbow: -0.25,
    lHip: [0.55, 0, -0.1],
    rHip: [0.9, 0, 0.12],
    lKnee: 0.9,
    rKnee: 1.2,
  },
  slingshot: {
    spineX: 0.55,
    headX: -0.5,
    lShoulder: [-2.5, 0, -0.18],
    rShoulder: [-2.5, 0, 0.18],
    lElbow: -0.1,
    rElbow: -0.1,
    lHip: [-0.15, 0, -0.06],
    rHip: [-0.15, 0, 0.06],
    lKnee: 0.15,
    rKnee: 0.15,
  },
  crouch: {
    spineX: -0.55,
    headX: 0.35,
    lShoulder: [-0.5, 0, -0.9],
    rShoulder: [-0.5, 0, 0.9],
    lElbow: -0.6,
    rElbow: -0.6,
    lHip: [-1.5, 0, -0.35],
    rHip: [-1.5, 0, 0.35],
    lKnee: 2.0,
    rKnee: 2.0,
  },
  idle: {
    spineX: 0,
    headX: 0,
    lShoulder: [0.15, 0, -0.25],
    rShoulder: [0.15, 0, 0.25],
    lElbow: -0.35,
    rElbow: -0.35,
    lHip: [0.05, 0, -0.05],
    rHip: [0.05, 0, 0.05],
    lKnee: 0.1,
    rKnee: 0.1,
  },
  freefall: {
    spineX: 0.12,
    headX: -0.2,
    lShoulder: [-0.9, 0, -1.1],
    rShoulder: [-0.9, 0, 1.1],
    lElbow: -0.7,
    rElbow: -0.7,
    lHip: [0.35, 0, -0.35],
    rHip: [0.25, 0, 0.35],
    lKnee: 0.6,
    rKnee: 0.5,
  },
};

// ---------------------------------------------------------------------------
// Sub-parts
// ---------------------------------------------------------------------------

interface MatSet {
  web: THREE.MeshStandardMaterial;
  panel: THREE.MeshStandardMaterial;
  glove: THREE.MeshStandardMaterial;
  emblemFront: THREE.MeshStandardMaterial;
  emblemBack: THREE.MeshStandardMaterial;
  lens: THREE.MeshStandardMaterial;
  lensRim: THREE.MeshStandardMaterial;
  shooter: THREE.MeshStandardMaterial;
}

/** Eight-legged spider emblem built from boxes, lying in the XY plane facing +Z. */
const SpiderEmblem: React.FC<{ material: THREE.Material; scale?: number; mirror?: boolean }> = ({
  material,
  scale = 1,
  mirror = false,
}) => {
  const legAngles = [0.95, 0.45, -0.35, -0.85];
  return (
    <group scale={[scale, scale, scale]} rotation={[0, mirror ? Math.PI : 0, 0]}>
      {/* Abdomen */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.048, 10, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Thorax / head */}
      <mesh position={[0, 0.035, 0]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Legs */}
      {legAngles.map((a, i) => (
        <React.Fragment key={i}>
          <mesh position={[0.07, 0.02 - i * 0.03, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.16, 0.012, 0.008]} />
            <primitive object={material} attach="material" />
          </mesh>
          <mesh position={[-0.07, 0.02 - i * 0.03, 0]} rotation={[0, 0, -a]}>
            <boxGeometry args={[0.16, 0.012, 0.008]} />
            <primitive object={material} attach="material" />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
};

/** Teardrop mask lens with a black rim, oriented outward from the head sphere. */
const MaskLens: React.FC<{ side: 1 | -1; mats: MatSet }> = ({ side, mats }) => (
  <group position={[side * 0.1, 0.18, 0.185]} rotation={[0.1, side * 0.42, side * -0.32]}>
    {/* Black rim */}
    <mesh scale={[1.32, 0.86, 0.3]} position={[0, 0, -0.01]}>
      <sphereGeometry args={[0.1, 14, 10]} />
      <primitive object={mats.lensRim} attach="material" />
    </mesh>
    {/* White lens */}
    <mesh scale={[1.12, 0.7, 0.28]}>
      <sphereGeometry args={[0.1, 14, 10]} />
      <primitive object={mats.lens} attach="material" />
    </mesh>
  </group>
);

/** Glove with four fingers + thumb and a wrist-mounted web-shooter. */
const Hand: React.FC<{ side: 1 | -1; mats: MatSet; handRef?: React.Ref<THREE.Mesh> }> = ({
  side,
  mats,
  handRef,
}) => (
  <group>
    {/* Web-shooter cartridge on the inner wrist */}
    <mesh position={[0, 0.03, 0.06]}>
      <boxGeometry args={[0.05, 0.05, 0.03]} />
      <primitive object={mats.shooter} attach="material" />
    </mesh>
    <mesh position={[0, 0.03, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.01, 0.01, 0.02, 6]} />
      <primitive object={mats.shooter} attach="material" />
    </mesh>
    {/* Palm */}
    <mesh ref={handRef} position={[0, -0.05, 0]}>
      <boxGeometry args={[0.085, 0.1, 0.05]} />
      <primitive object={mats.glove} attach="material" />
    </mesh>
    {/* Fingers */}
    {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
      <mesh key={i} position={[x, -0.135, 0.005]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.017, 0.075, 0.02]} />
        <primitive object={mats.glove} attach="material" />
      </mesh>
    ))}
    {/* Thumb */}
    <mesh position={[side * 0.05, -0.06, 0.015]} rotation={[0.3, 0, side * -0.6]}>
      <boxGeometry args={[0.018, 0.06, 0.02]} />
      <primitive object={mats.glove} attach="material" />
    </mesh>
  </group>
);

interface ArmProps {
  side: 1 | -1;
  mats: MatSet;
  shoulderRef: React.RefObject<THREE.Group | null>;
  elbowRef: React.RefObject<THREE.Group | null>;
  handRef?: React.Ref<THREE.Mesh>;
}

const Arm: React.FC<ArmProps> = ({ side, mats, shoulderRef, elbowRef, handRef }) => (
  <group ref={shoulderRef} position={[side * 0.33, 0.52, 0]}>
    {/* Deltoid (red, webbed) */}
    <mesh>
      <sphereGeometry args={[0.115, 12, 10]} />
      <primitive object={mats.web} attach="material" />
    </mesh>
    {/* Upper arm (blue panel) */}
    <mesh position={[side * 0.06, -0.19, 0]} rotation={[0, 0, side * -0.12]}>
      <cylinderGeometry args={[0.078, 0.066, 0.32, 10]} />
      <primitive object={mats.panel} attach="material" />
    </mesh>
    {/* Elbow joint */}
    <group ref={elbowRef} position={[side * 0.08, -0.36, 0]}>
      <mesh>
        <sphereGeometry args={[0.065, 10, 8]} />
        <primitive object={mats.panel} attach="material" />
      </mesh>
      {/* Forearm (red, webbed) */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.064, 0.056, 0.28, 10]} />
        <primitive object={mats.web} attach="material" />
      </mesh>
      {/* Glove cuff ridge */}
      <mesh position={[0, -0.27, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 10]} />
        <primitive object={mats.glove} attach="material" />
      </mesh>
      <group position={[0, -0.3, 0]}>
        <Hand side={side} mats={mats} handRef={handRef} />
      </group>
    </group>
  </group>
);

interface LegProps {
  side: 1 | -1;
  mats: MatSet;
  hipRef: React.RefObject<THREE.Group | null>;
  kneeRef: React.RefObject<THREE.Group | null>;
}

const Leg: React.FC<LegProps> = ({ side, mats, hipRef, kneeRef }) => (
  <group ref={hipRef} position={[side * 0.15, -0.14, 0]}>
    {/* Thigh (blue) */}
    <mesh position={[0, -0.24, 0]}>
      <cylinderGeometry args={[0.105, 0.088, 0.44, 10]} />
      <primitive object={mats.panel} attach="material" />
    </mesh>
    {/* Knee */}
    <group ref={kneeRef} position={[0, -0.47, 0]}>
      <mesh>
        <sphereGeometry args={[0.085, 10, 8]} />
        <primitive object={mats.panel} attach="material" />
      </mesh>
      {/* Shin (blue upper) */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.082, 0.07, 0.24, 10]} />
        <primitive object={mats.panel} attach="material" />
      </mesh>
      {/* Boot (red, webbed) with a pointed cuff */}
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.072, 0.07, 0.16, 10]} />
        <primitive object={mats.web} attach="material" />
      </mesh>
      <mesh position={[0, -0.255, 0.04]} rotation={[0.35, 0, 0]}>
        <coneGeometry args={[0.06, 0.09, 4]} />
        <primitive object={mats.web} attach="material" />
      </mesh>
      {/* Foot */}
      <mesh position={[0, -0.44, 0.06]}>
        <boxGeometry args={[0.095, 0.07, 0.22]} />
        <primitive object={mats.web} attach="material" />
      </mesh>
      {/* Sole */}
      <mesh position={[0, -0.478, 0.06]}>
        <boxGeometry args={[0.1, 0.012, 0.23]} />
        <primitive object={mats.emblemFront} attach="material" />
      </mesh>
    </group>
  </group>
);

// ---------------------------------------------------------------------------
// Main avatar
// ---------------------------------------------------------------------------

export const SpiderHeroAvatar3D: React.FC<SpiderHeroAvatar3DProps> = ({
  position,
  velocity,
  playerRef,
  isWebAttached,
  cameraMode,
  suit = 'dusk',
  onHandPositionUpdate,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const lShoulderRef = useRef<THREE.Group>(null);
  const rShoulderRef = useRef<THREE.Group>(null);
  const lElbowRef = useRef<THREE.Group>(null);
  const rElbowRef = useRef<THREE.Group>(null);
  const lHipRef = useRef<THREE.Group>(null);
  const rHipRef = useRef<THREE.Group>(null);
  const lKneeRef = useRef<THREE.Group>(null);
  const rKneeRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);
  const worldHand = useMemo(() => new THREE.Vector3(), []);

  const palette = PALETTES[suit];

  const mats: MatSet = useMemo(() => {
    const webTex = createWebTexture(palette.primary, palette.primaryLines, 2.2);
    const panelTex = createWeaveTexture(palette.secondary, palette.secondaryLines, 3);

    const isNeon = suit === 'neon';
    const isNoir = suit === 'noir';

    return {
      web: new THREE.MeshStandardMaterial({
        map: webTex,
        color: '#FFFFFF',
        metalness: isNeon ? 0.45 : 0.08,
        roughness: isNoir ? 0.85 : 0.55,
      }),
      panel: new THREE.MeshStandardMaterial({
        map: panelTex,
        color: '#FFFFFF',
        metalness: isNeon ? 0.55 : 0.12,
        roughness: isNoir ? 0.9 : 0.5,
      }),
      glove: new THREE.MeshStandardMaterial({
        map: webTex,
        color: '#FFFFFF',
        metalness: 0.1,
        roughness: 0.55,
      }),
      emblemFront: new THREE.MeshStandardMaterial({
        color: palette.emblemFront,
        emissive: isNeon ? palette.emblemFront : '#000000',
        emissiveIntensity: isNeon ? 1.4 : 0,
        roughness: 0.4,
      }),
      emblemBack: new THREE.MeshStandardMaterial({
        color: palette.emblemBack,
        emissive: isNeon ? palette.emblemBack : '#000000',
        emissiveIntensity: isNeon ? 1.4 : 0,
        roughness: 0.4,
      }),
      lens: new THREE.MeshStandardMaterial({
        color: palette.lens,
        emissive: palette.lens,
        emissiveIntensity: palette.lensEmissive,
        roughness: 0.15,
        metalness: 0.1,
      }),
      lensRim: new THREE.MeshStandardMaterial({
        color: palette.lensRim,
        roughness: 0.5,
      }),
      shooter: new THREE.MeshStandardMaterial({
        color: palette.shooter,
        metalness: 0.85,
        roughness: 0.25,
        emissive: isNeon ? palette.shooter : '#000000',
        emissiveIntensity: isNeon ? 0.8 : 0,
      }),
    };
  }, [palette, suit]);

  // Frame animation: pose blending & kinematics
  useFrame(({ clock }) => {
    if (!rootGroupRef.current) return;

    const curPos = playerRef?.current ? playerRef.current.pos : position;
    const curVel = playerRef?.current ? playerRef.current.vel : velocity;
    if (!curPos || !curVel) return;

    const t = clock.getElapsedTime();
    const speed = curVel.length();
    const isDiving = curVel.y < -3.0;
    const isNearGround = curPos.y < 12;

    // 1. Determine pose
    let pose: HeroPoseState = 'freefall';
    if (isWebAttached) pose = 'swinging';
    else if (speed > 18 && !isDiving) pose = 'slingshot';
    else if (isNearGround) pose = 'crouch';
    else if (speed < 4) pose = 'idle';

    // 2. Root orientation follows motion
    rootGroupRef.current.position.copy(curPos);
    if (speed > 0.5) {
      const targetYaw = Math.atan2(-curVel.x, -curVel.z);
      rootGroupRef.current.rotation.y = THREE.MathUtils.lerp(rootGroupRef.current.rotation.y, targetYaw, 0.14);
    }
    const rollTarget = THREE.MathUtils.clamp(curVel.x * -0.06, -0.45, 0.45);
    rootGroupRef.current.rotation.z = THREE.MathUtils.lerp(rootGroupRef.current.rotation.z, rollTarget, 0.12);
    const pitchTarget = THREE.MathUtils.clamp(curVel.y * -0.035, -0.7, 0.6);
    rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, pitchTarget, 0.12);

    // 3. Blend joints toward the target pose
    const P = POSES[pose];
    const k = 0.16;
    const lerpRot = (g: THREE.Group | null, x: number, y: number, z: number) => {
      if (!g) return;
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, x, k);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, y, k);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, z, k);
    };

    // Secondary motion layered on top of the pose
    const breath = Math.sin(t * 2.5);
    const kick = Math.sin(t * 8);
    const flutter = Math.sin(t * 4);

    lerpRot(spineRef.current, P.spineX + (pose === 'idle' ? breath * 0.02 : 0), 0, 0);
    lerpRot(headRef.current, P.headX, pose === 'swinging' ? Math.sin(t * 1.5) * 0.15 : 0, 0);

    lerpRot(lShoulderRef.current, P.lShoulder[0] + (pose === 'idle' ? breath * 0.05 : 0), P.lShoulder[1], P.lShoulder[2]);
    lerpRot(rShoulderRef.current, P.rShoulder[0] - (pose === 'idle' ? breath * 0.05 : 0), P.rShoulder[1], P.rShoulder[2]);
    lerpRot(lElbowRef.current, P.lElbow, 0, 0);
    lerpRot(rElbowRef.current, P.rElbow, 0, 0);

    const legSwing = pose === 'swinging' ? kick * 0.15 : pose === 'freefall' ? flutter * 0.1 : 0;
    lerpRot(lHipRef.current, P.lHip[0] + legSwing, P.lHip[1], P.lHip[2]);
    lerpRot(rHipRef.current, P.rHip[0] - legSwing, P.rHip[1], P.rHip[2]);
    lerpRot(lKneeRef.current, P.lKnee + legSwing * 0.6, 0, 0);
    lerpRot(rKneeRef.current, P.rKnee - legSwing * 0.6, 0, 0);

    // 4. Report web-shooter hand position to the web strand
    if (rightHandRef.current && onHandPositionUpdate) {
      rightHandRef.current.getWorldPosition(worldHand);
      onHandPositionUpdate(worldHand);
    }
  });

  if (cameraMode === 'fps') return null;

  return (
    <group ref={rootGroupRef} scale={[1.65, 1.65, 1.65]}>
      {/* Rim lights so the suit separates from the dark skyline */}
      <pointLight position={[0.6, 1.9, 1.3]} color={palette.rimLight} intensity={1.4} distance={5} />
      <pointLight position={[-0.8, 0.5, -1.2]} color="#60A5FA" intensity={0.9} distance={4} />

      {/* Pelvis (blue) */}
      <group position={[0, 0.95, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 0.26, 0.25]} />
          <primitive object={mats.panel} attach="material" />
        </mesh>
        {/* Belt line where red meets blue */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.44, 0.03, 0.29]} />
          <primitive object={mats.web} attach="material" />
        </mesh>

        {/* Torso */}
        <group ref={spineRef} position={[0, 0.2, 0]}>
          {/* Chest & back: red webbed */}
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.5, 0.6, 0.3]} />
            <primitive object={mats.web} attach="material" />
          </mesh>
          {/* Blue side panels wrapping under the arms */}
          <mesh position={[0.245, 0.24, 0]}>
            <boxGeometry args={[0.04, 0.42, 0.31]} />
            <primitive object={mats.panel} attach="material" />
          </mesh>
          <mesh position={[-0.245, 0.24, 0]}>
            <boxGeometry args={[0.04, 0.42, 0.31]} />
            <primitive object={mats.panel} attach="material" />
          </mesh>
          {/* Pecs for a heroic silhouette */}
          <mesh position={[0.12, 0.44, 0.13]} rotation={[0.3, 0, 0]}>
            <sphereGeometry args={[0.11, 12, 8]} />
            <primitive object={mats.web} attach="material" />
          </mesh>
          <mesh position={[-0.12, 0.44, 0.13]} rotation={[0.3, 0, 0]}>
            <sphereGeometry args={[0.11, 12, 8]} />
            <primitive object={mats.web} attach="material" />
          </mesh>

          {/* Front spider emblem (black) */}
          <group position={[0, 0.36, 0.2]}>
            <SpiderEmblem material={mats.emblemFront} scale={1.05} />
          </group>
          {/* Back spider emblem (large red) */}
          <group position={[0, 0.34, -0.155]}>
            <SpiderEmblem material={mats.emblemBack} scale={1.9} mirror />
          </group>

          {/* Neck */}
          <mesh position={[0, 0.66, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.1, 10]} />
            <primitive object={mats.web} attach="material" />
          </mesh>

          {/* Head */}
          <group ref={headRef} position={[0, 0.68, 0]}>
            <mesh position={[0, 0.17, 0]} scale={[1, 1.12, 1.02]}>
              <sphereGeometry args={[0.22, 24, 20]} />
              <primitive object={mats.web} attach="material" />
            </mesh>
            {/* Jawline */}
            <mesh position={[0, 0.03, 0.04]} scale={[1, 0.7, 1]}>
              <sphereGeometry args={[0.16, 16, 12]} />
              <primitive object={mats.web} attach="material" />
            </mesh>
            <MaskLens side={1} mats={mats} />
            <MaskLens side={-1} mats={mats} />
          </group>

          <Arm side={-1} mats={mats} shoulderRef={lShoulderRef} elbowRef={lElbowRef} />
          <Arm side={1} mats={mats} shoulderRef={rShoulderRef} elbowRef={rElbowRef} handRef={rightHandRef} />
        </group>

        <Leg side={-1} mats={mats} hipRef={lHipRef} kneeRef={lKneeRef} />
        <Leg side={1} mats={mats} hipRef={rHipRef} kneeRef={rKneeRef} />
      </group>
    </group>
  );
};
