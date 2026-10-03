'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PlasmaTetherArc: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.PointLight>(null);

  // Generate multiple interwoven spider-web catenary splines across NYC spires
  const { primaryCurve, secondaryCurve, points } = useMemo(() => {
    const pts1 = [
      new THREE.Vector3(-9, -4.2, -2),
      new THREE.Vector3(-4.5, 1.8, 1),
      new THREE.Vector3(0, 3.8, 0.5),
      new THREE.Vector3(4.5, 0.9, -1),
      new THREE.Vector3(9, -3.5, -3),
    ];
    const pts2 = [
      new THREE.Vector3(-8, -2.5, -4),
      new THREE.Vector3(-3.2, 0.5, -1),
      new THREE.Vector3(2.5, 2.8, 0.2),
      new THREE.Vector3(7.5, -1.8, -2.5),
    ];
    return {
      primaryCurve: new THREE.CatmullRomCurve3(pts1),
      secondaryCurve: new THREE.CatmullRomCurve3(pts2),
      points: pts1,
    };
  }, []);

  const primaryGeometry = useMemo(() => {
    return new THREE.TubeGeometry(primaryCurve, 100, 0.04, 8, false);
  }, [primaryCurve]);

  const outerSheathGeometry = useMemo(() => {
    return new THREE.TubeGeometry(primaryCurve, 100, 0.1, 8, false);
  }, [primaryCurve]);

  const secondaryGeometry = useMemo(() => {
    return new THREE.TubeGeometry(secondaryCurve, 80, 0.03, 6, false);
  }, [secondaryCurve]);

  const nodeSphereGeometry = useMemo(() => new THREE.SphereGeometry(0.2, 10, 10), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      // Elastic web line oscillation
      meshRef.current.position.y = Math.sin(t * 2.4) * 0.06;
    }
    if (pulseRef.current) {
      // Traveling web pulse
      const progress = (t * 0.7) % 1;
      const pt = primaryCurve.getPointAt(progress);
      pulseRef.current.position.copy(pt);
      pulseRef.current.intensity = 2.8 + Math.sin(t * 14) * 0.9;
    }
  });

  return (
    <group>
      {/* Primary High-Tensile White Web Strand */}
      <mesh ref={meshRef} geometry={primaryGeometry}>
        <meshBasicMaterial
          color="#FFFFFF"
          toneMapped={false}
          wireframe={false}
        />
      </mesh>

      {/* Spider-Red Glow Outer Sheath */}
      <mesh geometry={outerSheathGeometry}>
        <meshBasicMaterial
          color="#E62429"
          transparent
          opacity={0.4}
          wireframe={false}
          toneMapped={false}
        />
      </mesh>

      {/* Secondary Spider-Blue Web Line */}
      <mesh geometry={secondaryGeometry}>
        <meshBasicMaterial
          color="#0066FF"
          transparent
          opacity={0.7}
          wireframe={false}
          toneMapped={false}
        />
      </mesh>

      {/* Moving Spider-Sense Electro-Pulse Light */}
      <pointLight
        ref={pulseRef}
        color="#FFE600"
        distance={6}
        intensity={3}
      />

      {/* Web Attachment Nodes on Spires */}
      {points.map((pt, idx) => (
        <mesh key={idx} position={pt} geometry={nodeSphereGeometry}>
          <meshBasicMaterial color={idx % 2 === 0 ? '#FFFFFF' : '#E62429'} />
        </mesh>
      ))}
    </group>
  );
};
