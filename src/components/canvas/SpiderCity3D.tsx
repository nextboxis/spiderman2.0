'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

import {
  Skydome,
  InstancedStreetlights,
  NeonBillboard,
  PostProcessingPipeline,
} from './CityAtmosphere3D';
import { ProceduralCityGrid3D } from './ProceduralCityGrid3D';
import { OscorpHeadquarters3D } from './OscorpHeadquarters3D';
import { SpiderHeroAvatar3D } from './SpiderHeroAvatar3D';
import { WebStrandEffect3D } from './WebStrandEffect3D';
import { SpeedLinesParticles3D } from './SpeedLinesParticles3D';
import { SpiderTokenCollectible3D } from './SpiderTokenCollectible3D';
import { CityStreetLife3D } from './CityStreetLife3D';

export type DimensionTheme = 'dusk' | 'noir' | 'neon';
export type CameraMode = 'chase' | 'fps';

export interface SpireAnchor {
  id: string;
  name: string;
  earth: string;
  position: [number, number, number];
  color: string;
  height: number;
}

export interface SpiderToken {
  id: number;
  position: [number, number, number];
  collected: boolean;
}

export interface TelemetryData {
  velocity: number;
  altitude: number;
  anchorName: string;
  nearGround: boolean;
  chainCombo: number;
  oscorpIndicator?: {
    inView: boolean;
    angleDeg: number;
  };
}

interface SpiderCity3DProps {
  theme: DimensionTheme;
  cameraMode: CameraMode;
  isWebAttached: boolean;
  onWebAttach: () => void;
  onWebRelease: () => void;
  onBoost: () => void;
  onCollectToken: (id: number) => void;
  onTelemetryUpdate: (telemetry: TelemetryData) => void;
}

// Iconic Manhattan Skyscraper Landmarks & Web Anchors
export const ICONIC_SPIRES: SpireAnchor[] = [
  {
    id: 'oscorp-tower',
    name: 'OSCORP HEADQUARTERS',
    earth: 'Earth-616',
    position: [0, 245, -74], // Apex beacon
    color: '#10B981',
    height: 245,
  },
  {
    id: 'daily-bugle',
    name: 'DAILY BUGLE SPIRE',
    earth: 'Earth-616',
    position: [-24, 90, -34],
    color: '#E62429',
    height: 90,
  },
  {
    id: 'chrysler-spire',
    name: 'CHRYSLER GARGOYLE',
    earth: 'Earth-616',
    position: [24, 100, -44],
    color: '#38BDF8',
    height: 100,
  },
  {
    id: 'stark-tower',
    name: 'STARK TOWER PYLON',
    earth: 'Earth-616',
    position: [-24, 115, -114],
    color: '#FFE600',
    height: 115,
  },
  {
    id: 'alchemax-citadel',
    name: 'ALCHEMAX CITADEL',
    earth: 'Earth-928',
    position: [24, 120, -145],
    color: '#A855F7',
    height: 120,
  },
  {
    id: 'sanctum-rooftop',
    name: 'BLEECKER SANCTUM',
    earth: 'Earth-616',
    position: [0, 65, -8],
    color: '#F97316',
    height: 65,
  },
];

// Static collectible token positions
const SPIDER_TOKENS: SpiderToken[] = [
  { id: 1, position: [0, 26, -14], collected: false },
  { id: 2, position: [-2, 32, -32], collected: false },
  { id: 3, position: [2, 30, -50], collected: false },
  { id: 4, position: [0, 36, -68], collected: false },
  { id: 5, position: [3, 38, -86], collected: false },
  { id: 6, position: [-3, 34, -104], collected: false },
  { id: 7, position: [0, 38, -122], collected: false },
  { id: 8, position: [-2, 40, -140], collected: false },
];

// Static scratch vectors hoisted to eliminate 900+ per-frame GC allocations
const _gravity = new THREE.Vector3(0, -9.8 * 2.0, 0);
const _spireVec = new THREE.Vector3();
const _anchorVec = new THREE.Vector3();
const _toAnchor = new THREE.Vector3();
const _tensionDir = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _oscorpVec = new THREE.Vector3(0, 245, -74);
const _oscorpProj = new THREE.Vector3();
const _tokenVec = new THREE.Vector3();

const SpiderCityScene: React.FC<SpiderCity3DProps> = ({
  theme,
  cameraMode,
  isWebAttached,
  onWebAttach,
  onWebRelease,
  onCollectToken,
  onTelemetryUpdate,
}) => {
  // Collectible Golden Spider-Tokens collection tracking
  const [collectedMap, setCollectedMap] = useState<Record<number, boolean>>({});
  const collectedMapRef = useRef<Record<number, boolean>>({});

  // Active targeted anchor state (ensures pure JSX rendering without reading refs)
  const [targetedAnchorId, setTargetedAnchorId] = useState<string>(ICONIC_SPIRES[0].id);
  const targetedAnchorIdRef = useRef<string>(ICONIC_SPIRES[0].id);

  const activeAnchor = useMemo(() => {
    return ICONIC_SPIRES.find((s) => s.id === targetedAnchorId) ?? ICONIC_SPIRES[0];
  }, [targetedAnchorId]);

  const anchorPosition = useMemo(() => {
    return new THREE.Vector3(...activeAnchor.position);
  }, [activeAnchor]);

  // 2. Player Kinematics & Physics State
  const playerRef = useRef({
    pos: new THREE.Vector3(0, 28, 8),
    vel: new THREE.Vector3(0, -0.05, -0.65),
    acc: new THREE.Vector3(0, 0, 0),
    activeAnchor: ICONIC_SPIRES[0], // Default: Oscorp Headquarters
    tetherLength: 42,
    combo: 0,
    acrobaticRoll: 0,
  });

  const rightHandPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 28, 8));
  const wasWebAttachedRef = useRef(false);
  const lastTelemetryTimeRef = useRef(0);

  // Theme Lighting Configuration
  const themeColors = useMemo(() => {
    switch (theme) {
      case 'noir':
        return {
          fog: '#06070B',
          skyHemisphere: '#111827',
          groundHemisphere: '#1C1917',
          moonlight: '#E2E8F0',
          web: '#F8FAFC',
        };
      case 'neon':
        return {
          fog: '#0A051A',
          skyHemisphere: '#1E0E38',
          groundHemisphere: '#2A0826',
          moonlight: '#00F0FF',
          web: '#00F0FF',
        };
      case 'dusk':
      default:
        return {
          fog: '#0A0E1A',
          skyHemisphere: '#1E293B',
          groundHemisphere: '#26150B',
          moonlight: '#93C5FD',
          web: '#FFFFFF',
        };
    }
  }, [theme]);

  // Main 60 FPS Physics, Swing Pendulum & Camera Loop
  useFrame((state, delta) => {
    const camera = state.camera;
    const dt = Math.min(delta, 0.05); // Stable time-step cap
    const player = playerRef.current;

    // A. Gravity Acceleration
    player.acc.copy(_gravity);

    // B. Find Nearest / Forward Anchor Spire
    let closestSpire = ICONIC_SPIRES[0];
    let minDistance = 999;
    for (let i = 0; i < ICONIC_SPIRES.length; i++) {
      const spire = ICONIC_SPIRES[i];
      _spireVec.set(spire.position[0], spire.position[1], spire.position[2]);
      if (_spireVec.z < player.pos.z + 20) {
        const dist = player.pos.distanceTo(_spireVec);
        if (dist < minDistance) {
          minDistance = dist;
          closestSpire = spire;
        }
      }
    }
    if (!isWebAttached) {
      player.activeAnchor = closestSpire;
      if (targetedAnchorIdRef.current !== closestSpire.id) {
        targetedAnchorIdRef.current = closestSpire.id;
        setTargetedAnchorId(closestSpire.id);
      }
    }

    // C. Web Tension / Pendulum Constraint Physics
    _anchorVec.set(player.activeAnchor.position[0], player.activeAnchor.position[1], player.activeAnchor.position[2]);
    _toAnchor.subVectors(_anchorVec, player.pos);
    const currentDist = _toAnchor.length();

    // On initial attachment: calibrate tether length to match latch distance
    if (isWebAttached && !wasWebAttachedRef.current) {
      player.tetherLength = Math.max(18, Math.min(75, currentDist * 0.94));
    }
    wasWebAttachedRef.current = isWebAttached;

    if (isWebAttached) {
      if (currentDist > player.tetherLength) {
        _tensionDir.copy(_toAnchor).normalize();
        // Nullify outward radial velocity along the web line
        const radialVel = player.vel.dot(_tensionDir);
        if (radialVel < 0) {
          player.vel.addScaledVector(_tensionDir, -radialVel);
        }

        // Apply progressive elastic spring tension
        const stretch = currentDist - player.tetherLength;
        player.acc.addScaledVector(_tensionDir, stretch * 22);

        // Forward swing momentum boost
        player.vel.z -= 0.42 * dt * 60;
        // Upward swing arc lift
        player.vel.y += 0.22 * dt * 60;
      }
    } else {
      // Aerodynamic glide & air friction
      player.vel.z -= 0.16 * dt * 60;
      player.vel.x *= 0.985;
    }

    // Integrate Kinematics (Zero allocations via scaled vectors)
    player.vel.addScaledVector(player.acc, dt);
    player.pos.addScaledVector(player.vel, dt);

    // Ground Bounce / Safety Net
    if (player.pos.y < 8) {
      player.pos.y = 8;
      player.vel.y = Math.abs(player.vel.y) * 0.65 + 5.5; // Dynamic upward bounce
    }

    // Keep within avenue corridor (soft steering)
    if (Math.abs(player.pos.x) > 9) {
      player.vel.x *= -0.5;
      player.pos.x = Math.sign(player.pos.x) * 9;
    }

    // Loop Manhattan strip seamlessly
    if (player.pos.z < -160) {
      player.pos.z = 10;
      player.pos.y = 28;
      player.vel.set(0, -0.05, -0.65);
      if (isWebAttached && onWebRelease) {
        onWebRelease();
      }
    }

    // D. Acrobatics Banking Roll
    const targetRoll = isWebAttached
      ? Math.sin(state.clock.getElapsedTime() * 5) * 0.42
      : player.vel.x * -0.15;
    player.acrobaticRoll = THREE.MathUtils.lerp(player.acrobaticRoll, targetRoll, 0.1);

    // E. Golden Spider-Token Collision Detection
    for (let i = 0; i < SPIDER_TOKENS.length; i++) {
      const token = SPIDER_TOKENS[i];
      if (!collectedMapRef.current[token.id]) {
        _tokenVec.set(token.position[0], token.position[1], token.position[2]);
        if (player.pos.distanceTo(_tokenVec) < 4.5) {
          collectedMapRef.current[token.id] = true;
          player.combo += 1;
          onCollectToken(token.id);
          setCollectedMap((prev) => ({ ...prev, [token.id]: true }));
        }
      }
    }

    // F. Camera Follow Rig (Hero Centric + Smooth Lag + Dynamic FOV + Roll)
    const currentSpeedMph = Math.round(player.vel.length() * 2.24 + 28);
    if (cameraMode === 'chase') {
      _targetCamPos.set(
        player.pos.x * 0.65,
        player.pos.y + 2.6,
        player.pos.z + 6.2
      );
      camera.position.lerp(_targetCamPos, 0.12);

      _lookTarget.set(
        player.pos.x,
        player.pos.y + 0.8,
        player.pos.z - 6.0
      );
      camera.lookAt(_lookTarget);

      // FOV widens slightly during fast swings
      if ('fov' in camera) {
        const persp = camera as THREE.PerspectiveCamera;
        const targetFov = 52 + Math.min(22, (currentSpeedMph / 100) * 22);
        persp.fov = THREE.MathUtils.lerp(persp.fov, targetFov, 0.08);
        persp.updateProjectionMatrix();
      }

      // Subtle camera roll on sharp turns
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, player.acrobaticRoll * 0.28, 0.08);
    } else {
      // 1st-Person Web-Shooter POV
      camera.position.copy(player.pos);
      camera.position.y += 0.4;
      _lookTarget.set(
        player.pos.x,
        player.pos.y,
        player.pos.z - 20
      );
      camera.lookAt(_lookTarget);

      if ('fov' in camera) {
        const persp = camera as THREE.PerspectiveCamera;
        persp.fov = 74;
        persp.updateProjectionMatrix();
      }
    }

    // G. Off-screen Reticle Direction Calculation for Oscorp
    _oscorpProj.copy(_oscorpVec).project(camera);
    const isOscorpInView =
      _oscorpProj.z > 0 &&
      _oscorpProj.z < 1 &&
      Math.abs(_oscorpProj.x) < 0.90 &&
      Math.abs(_oscorpProj.y) < 0.90;
    let oscorpAngleDeg = Math.atan2(_oscorpProj.y, _oscorpProj.x) * (180 / Math.PI);
    if (_oscorpProj.z > 1) {
      oscorpAngleDeg += 180;
    }

    // H. Telemetry Feedback to UI HUD throttled to 12.5Hz (80ms) to avoid locking React
    const now = state.clock.getElapsedTime();
    if (now - lastTelemetryTimeRef.current >= 0.08) {
      lastTelemetryTimeRef.current = now;
      onTelemetryUpdate({
        velocity: currentSpeedMph,
        altitude: Math.round(player.pos.y * 12),
        anchorName: player.activeAnchor.name,
        nearGround: player.pos.y < 12,
        chainCombo: player.combo,
        oscorpIndicator: {
          inView: isOscorpInView,
          angleDeg: oscorpAngleDeg,
        },
      });
    }
  });

  return (
    <>
      {/* 1. Dynamic Atmosphere, Gradient Sky & Exponential Fog */}
      <color attach="background" args={[themeColors.fog]} />
      <fogExp2 attach="fog" args={[themeColors.fog, 0.0075]} />
      <Skydome />

      {/* 2. Rich Atmospheric City Lighting */}
      {/* Soft Ambient / Hemisphere Light */}
      <hemisphereLight
        args={[themeColors.skyHemisphere, themeColors.groundHemisphere, 0.85]}
      />
      {/* Dim Directional Moonlight with Soft Ambient Shadow */}
      <directionalLight
        position={[40, 80, 50]}
        color={themeColors.moonlight}
        intensity={1.1}
        castShadow
      />
      {/* Ambient Ground Upward Bounce Light */}
      <directionalLight position={[0, -20, -60]} color="#1E3A8A" intensity={0.4} />

      {/* 3. Instanced Streetlights along Avenues (Zero Point Lights) */}
      <InstancedStreetlights />

      {/* 4. Procedural Manhattan Skyscrapers & Rooftop Props */}
      <ProceduralCityGrid3D />

      {/* 4b. Street life: traffic, crosswalks, fire escapes, searchlights,
          NYPD chopper, steam vents, distant skyline & cloud deck */}
      <CityStreetLife3D />

      {/* 5. Oscorp Headquarters Landmark (Tallest Spire & Green Core) */}
      <OscorpHeadquarters3D
        position={[0, 0, -74]}
        isTargeted={targetedAnchorId === 'oscorp-tower'}
        onAttach={() => {
          playerRef.current.activeAnchor = ICONIC_SPIRES[0];
          targetedAnchorIdRef.current = ICONIC_SPIRES[0].id;
          setTargetedAnchorId(ICONIC_SPIRES[0].id);
          onWebAttach();
        }}
      />

      {/* Animated Neon Signage on Facades */}
      <NeonBillboard
        position={[-24, 48, -25]}
        rotation={[0, Math.PI / 2, 0]}
        text="DAILY BUGLE"
        color="#EF4444"
        width={14}
        height={4.2}
      />
      <NeonBillboard
        position={[24, 52, -45]}
        rotation={[0, -Math.PI / 2, 0]}
        text="STARK INDUSTRIES"
        color="#F59E0B"
        width={16}
        height={4.2}
      />
      <NeonBillboard
        position={[-24, 40, -105]}
        rotation={[0, Math.PI / 2, 0]}
        text="F.E.A.S.T."
        color="#22C55E"
        width={12}
        height={3.6}
      />
      <NeonBillboard
        position={[24, 44, -125]}
        rotation={[0, -Math.PI / 2, 0]}
        text="ROXXON"
        color="#A855F7"
        width={13}
        height={3.8}
      />
      <NeonBillboard
        position={[-24, 30, -150]}
        rotation={[0, Math.PI / 2, 0]}
        text="EMPIRE STATE UNIVERSITY"
        color="#38BDF8"
        width={15}
        height={3.4}
      />

      {/* 6. Iconic Landmark Anchor Spires (Bugle, Chrysler, Stark, Alchemax, Sanctum) */}
      {ICONIC_SPIRES.slice(1).map((spire) => {
        const isTargeted = targetedAnchorId === spire.id;
        return (
          <group
            key={spire.id}
            position={spire.position}
            onClick={(e) => {
              e.stopPropagation();
              playerRef.current.activeAnchor = spire;
              targetedAnchorIdRef.current = spire.id;
              setTargetedAnchorId(spire.id);
              onWebAttach();
            }}
          >
            {/* Spire Antenna Mast */}
            <mesh position={[0, -spire.height / 2, 0]}>
              <cylinderGeometry args={[0.5, 1.2, spire.height * 0.4, 8]} />
              <meshStandardMaterial
                color={spire.color}
                emissive={spire.color}
                emissiveIntensity={isTargeted ? 2.0 : 0.8}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing Target Anchor Orb */}
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[isTargeted ? 1.8 : 1.2, 16, 16]} />
              <meshStandardMaterial
                color={isTargeted ? '#FFE600' : spire.color}
                emissive={isTargeted ? '#FFE600' : spire.color}
                emissiveIntensity={isTargeted ? 3.0 : 1.4}
              />
            </mesh>

            {/* In-World Anchor HUD Label */}
            <Html position={[0, 5.5, 0]} center distanceFactor={50}>
              <div
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all shadow-xl cursor-pointer ${
                  isTargeted
                    ? 'bg-red-600 text-white border-2 border-[#FFE600] scale-110 shadow-[0_0_20px_rgba(230,36,41,0.9)]'
                    : 'bg-black/80 text-slate-300 border border-white/20 hover:border-white/60'
                }`}
              >
                {spire.name}
              </div>
            </Html>
          </group>
        );
      })}

      {/* 7. Collectible 3D Golden Spider-Tokens */}
      {SPIDER_TOKENS.map((token) => (
        <SpiderTokenCollectible3D
          key={token.id}
          id={token.id}
          position={token.position}
          collected={!!collectedMap[token.id]}
        />
      ))}

      {/* 8. Stylized Spider-Man Low-Poly Avatar */}
      <SpiderHeroAvatar3D
        playerRef={playerRef}
        isWebAttached={isWebAttached}
        cameraMode={cameraMode}
        suit={theme}
        onHandPositionUpdate={(pos) => {
          rightHandPosRef.current.copy(pos);
        }}
      />

      {/* 9. Dynamic Tapered Web Line & Anchor Impact Splat */}
      <WebStrandEffect3D
        isWebAttached={isWebAttached}
        handPosRef={rightHandPosRef}
        playerRef={playerRef}
        anchorPos={anchorPosition}
        cameraMode={cameraMode}
        webColor={themeColors.web}
      />

      {/* 10. High-Velocity Speed Streak Lines */}
      <SpeedLinesParticles3D
        playerRef={playerRef}
      />

      {/* 11. UnrealBloom & Vignette Post-Processing Pipeline */}
      <PostProcessingPipeline />
    </>
  );
};

export const SpiderCity3D: React.FC<SpiderCity3DProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 30, 14], fov: 55 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.25]}
      >
        <SpiderCityScene {...props} />
      </Canvas>
    </div>
  );
};
