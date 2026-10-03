'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SuitHologramSceneProps {
  accentColor: string;
}

const SuitHologramScene: React.FC<SuitHologramSceneProps> = ({ accentColor }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const scanPlaneRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Rotate main mannequin
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.5;
    }

    // Spin holographic data rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.8;
      ring1Ref.current.rotation.x = Math.sin(t * 0.6) * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.6;
      ring2Ref.current.rotation.y = Math.cos(t * 0.5) * 0.4;
    }

    // Oscillate vertical scan plane
    if (scanPlaneRef.current) {
      scanPlaneRef.current.position.y = Math.sin(t * 2) * 1.6;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.8} color={accentColor} />
      <pointLight position={[0, -2, 3]} intensity={1.5} color="#FFFFFF" />

      {/* Main Rotating Holographic Group */}
      <group ref={groupRef}>
        {/* Torso */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.55, 1.1, 8, 16]} />
          <meshStandardMaterial
            color={accentColor}
            wireframe
            emissive={accentColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Head & White Mask Eyes */}
        <mesh position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color={accentColor}
            wireframe
            emissive={accentColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh position={[0.13, 1.08, 0.3]}>
          <boxGeometry args={[0.14, 0.08, 0.05]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[-0.13, 1.08, 0.3]}>
          <boxGeometry args={[0.14, 0.08, 0.05]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        {/* Chest Spider Emblem Glyphs */}
        <mesh position={[0, 0.15, 0.52]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
        </mesh>

        {/* Limbs (Legs & Arms Wireframe) */}
        <mesh position={[-0.3, -1.2, 0]}>
          <cylinderGeometry args={[0.16, 0.12, 1.3, 8]} />
          <meshStandardMaterial color={accentColor} wireframe transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.3, -1.2, 0]}>
          <cylinderGeometry args={[0.16, 0.12, 1.3, 8]} />
          <meshStandardMaterial color={accentColor} wireframe transparent opacity={0.6} />
        </mesh>

        {/* Bicep & Forearms */}
        <mesh position={[-0.75, 0.1, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.14, 0.1, 1.0, 8]} />
          <meshStandardMaterial color={accentColor} wireframe transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.75, 0.1, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.14, 0.1, 1.0, 8]} />
          <meshStandardMaterial color={accentColor} wireframe transparent opacity={0.6} />
        </mesh>

        {/* Web-Shooter Wrist Nodes */}
        <mesh position={[-0.95, -0.35, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.95, -0.35, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Orbiting Holographic Telemetry Rings */}
      <mesh ref={ring1Ref} position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.8, 0.02, 8, 48]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0, 0]} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.1, 0.015, 8, 48]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.5} />
      </mesh>

      {/* Moving Laser Scan Plane */}
      <mesh ref={scanPlaneRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 1.7, 32]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

interface SuitHologram3DProps {
  accentColor: string;
  universe: string;
}

export const SuitHologram3D: React.FC<SuitHologram3DProps> = ({ accentColor, universe }) => {
  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[440px] relative rounded-2xl overflow-hidden bg-black/80 border border-white/10">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <SuitHologramScene accentColor={accentColor} />
      </Canvas>

      {/* Holographic Diagnostic Overlay */}
      <div className="absolute top-3 left-3 glass-panel px-3 py-1 rounded-lg border border-cyan-400/40 text-[10px] font-mono text-cyan-300 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block mr-1.5 animate-ping" />
        3D WIREFRAME BIOMETRIC SCAN
      </div>

      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[9px] font-mono text-slate-400 pointer-events-none">
        <span>ROTATION: 360° CONTINUOUS</span>
        <span className="text-red-400 font-bold uppercase">{universe} {'//'} BIO-MESH SYNCED</span>
      </div>
    </div>
  );
};
