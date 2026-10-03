'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { FloatingIslands } from './FloatingIslands';
import { PlasmaTetherArc } from './PlasmaTetherArc';

export const HeroScene3D: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.25]}
      >
        <Suspense fallback={null}>
          {/* Lighting - Spider-Man Crimson Red, Electric Blue & Spider-Sense Gold */}
          <ambientLight intensity={0.45} />
          <directionalLight position={[-8, 10, 5]} intensity={2.2} color="#E62429" />
          <directionalLight position={[8, -6, 4]} intensity={2.4} color="#0066FF" />
          <pointLight position={[0, 4, 3]} intensity={1.8} color="#FFE600" />

          {/* Floating Metropolis & Debris */}
          <FloatingIslands />

          {/* Glowing Acrobatic Plasma Tether */}
          <PlasmaTetherArc />
        </Suspense>
      </Canvas>
    </div>
  );
};
