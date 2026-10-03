'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface OscorpHeadquarters3DProps {
  position?: [number, number, number];
  isTargeted?: boolean;
  onAttach?: () => void;
}

export const OscorpHeadquarters3D: React.FC<OscorpHeadquarters3DProps> = ({
  position = [0, 0, -75],
  isTargeted = true,
  onAttach,
}) => {
  const beaconRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.MeshStandardMaterial>(null);
  const signRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Pulsing green beacon on the apex spire
    if (beaconRef.current) {
      const scale = 1.0 + Math.sin(t * 4) * 0.25;
      beaconRef.current.scale.set(scale, scale, scale);
    }

    // 2. Animated breathing pulse along the central green emissive core
    if (coreRef.current) {
      coreRef.current.emissiveIntensity = 2.2 + Math.sin(t * 2.5) * 0.8;
    }

    // 3. Illuminated OSCORP neon signage pulse
    if (signRef.current) {
      signRef.current.emissiveIntensity = 2.5 + Math.sin(t * 3.0) * 0.5;
    }
  });

  const towerHeight = 210;
  const spireHeight = 35;

  return (
    <group position={position} onClick={onAttach}>
      {/* 1. Base Podium & Plaza Entrance */}
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[44, 20, 44]} />
        <meshStandardMaterial color="#0A1016" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 2. Main Diamond-Chiseled Tower Body */}
      <mesh position={[0, towerHeight / 2 + 10, 0]}>
        <boxGeometry args={[32, towerHeight, 32]} />
        <meshStandardMaterial
          color="#060C12"
          roughness={0.14}
          metalness={0.92}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* 3. Chiseled Architectural Facet Wings */}
      <mesh position={[0, towerHeight * 0.7 + 10, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[26, towerHeight * 0.5, 26]} />
        <meshStandardMaterial color="#04080D" roughness={0.15} metalness={0.95} />
      </mesh>

      {/* 4. Glowing Emerald Green Core Running Up the Central Spine */}
      <mesh position={[0, (towerHeight + 10) / 2, 16.1]}>
        <boxGeometry args={[3.2, towerHeight - 10, 0.4]} />
        <meshStandardMaterial
          ref={coreRef}
          color="#064E3B"
          emissive="#10B981"
          emissiveIntensity={2.5}
          roughness={0.2}
        />
      </mesh>
      {/* Rear Spine */}
      <mesh position={[0, (towerHeight + 10) / 2, -16.1]}>
        <boxGeometry args={[3.2, towerHeight - 10, 0.4]} />
        <meshStandardMaterial
          color="#064E3B"
          emissive="#10B981"
          emissiveIntensity={2.5}
          roughness={0.2}
        />
      </mesh>

      {/* 5. Illuminated "OSCORP" Lettering Billboard Near the Top */}
      <group position={[0, towerHeight - 14, 16.3]}>
        {/* Sign Backplate */}
        <mesh>
          <boxGeometry args={[22, 5.5, 0.4]} />
          <meshStandardMaterial color="#030712" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Emissive Neon Face */}
        <mesh position={[0, 0, 0.25]}>
          <planeGeometry args={[21, 4.5]} />
          <meshStandardMaterial
            ref={signRef}
            color="#064E3B"
            emissive="#10B981"
            emissiveIntensity={3.0}
            roughness={0.2}
          />
        </mesh>
        {/* Crisp HTML Sign Overlay */}
        <Html position={[0, 0, 0.4]} center distanceFactor={70}>
          <div className="font-display font-black text-2xl tracking-[0.25em] text-[#A7F3D0] uppercase drop-shadow-[0_0_12px_rgba(16,185,129,0.9)] select-none">
            OSCORP
          </div>
        </Html>
      </group>

      {/* 6. Rooftop Landing Pad at y = 220 */}
      <group position={[0, towerHeight + 10, 0]}>
        {/* Circular Landing Pad Platform */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[11, 32]} />
          <meshStandardMaterial color="#0A1016" roughness={0.6} metalness={0.6} />
        </mesh>
        {/* Glowing Green Perimeter Ring */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[9.5, 10.5, 32]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
        {/* Helipad 'H' Decal */}
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 4.0, 16]} />
          <meshBasicMaterial color="#34D399" />
        </mesh>
      </group>

      {/* 7. Apex Spire & Pulsing Green Beacon at y = 245 */}
      <group position={[0, towerHeight + 10, 0]}>
        {/* Needle Spire */}
        <mesh position={[0, spireHeight / 2, 0]}>
          <cylinderGeometry args={[0.3, 1.8, spireHeight, 8]} />
          <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Pulsing Green Beacon Orb */}
        <mesh ref={beaconRef} position={[0, spireHeight + 1.5, 0]}>
          <sphereGeometry args={[2.2, 16, 16]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>

        {/* Beacon Glow Point Light */}
        <pointLight position={[0, spireHeight + 2, 0]} color="#10B981" intensity={2.5} distance={35} />

        {/* In-World HUD Anchor Tag */}
        <Html position={[0, spireHeight + 5, 0]} center distanceFactor={55}>
          <div
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all shadow-2xl ${
              isTargeted
                ? 'bg-emerald-600 text-white border-2 border-[#A7F3D0] scale-110 shadow-[0_0_25px_rgba(16,185,129,0.9)]'
                : 'bg-black/80 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            ★ OSCORP HEADQUARTERS // APEX BEACON
          </div>
        </Html>
      </group>
    </group>
  );
};
