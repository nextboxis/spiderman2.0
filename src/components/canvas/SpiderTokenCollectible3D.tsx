'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpiderTokenCollectible3DProps {
  id: number;
  position: [number, number, number];
  collected: boolean;
}

export const SpiderTokenCollectible3D: React.FC<SpiderTokenCollectible3DProps> = ({
  id,
  position,
  collected,
}) => {
  const tokenGroupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const burstMeshRef = useRef<THREE.Mesh>(null);
  const burstMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Burst animation state tracked through refs to avoid cascading renders
  const burstActiveRef = useRef(false);
  const burstProgressRef = useRef(0);
  const prevCollectedRef = useRef(collected);

  const materials = useMemo(() => {
    // Golden core crystal with bright emissive bloom
    const coreMat = new THREE.MeshStandardMaterial({
      color: '#F59E0B',
      emissive: '#FBBF24',
      emissiveIntensity: 2.8,
      metalness: 0.9,
      roughness: 0.15,
    });

    // Orbital spinning gyro rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#FDE047',
      emissive: '#F59E0B',
      emissiveIntensity: 1.8,
      metalness: 0.85,
      roughness: 0.2,
    });

    return { coreMat, ringMat };
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() + id * 1.5;
    const dt = Math.min(delta, 0.05);

    // Trigger burst when collected transitions from false to true
    if (!prevCollectedRef.current && collected) {
      prevCollectedRef.current = true;
      burstActiveRef.current = true;
      burstProgressRef.current = 0;
      if (burstMeshRef.current) {
        burstMeshRef.current.visible = true;
      }
    }

    // 1. Hover Bobbing & Dual Ring Rotation
    if (!collected && tokenGroupRef.current && ring1Ref.current && ring2Ref.current) {
      tokenGroupRef.current.position.y = position[1] + Math.sin(t * 2.5) * 0.45;

      // Gyroscopic counter-rotations
      ring1Ref.current.rotation.x = t * 1.8;
      ring1Ref.current.rotation.y = t * 1.2;

      ring2Ref.current.rotation.y = -t * 1.5;
      ring2Ref.current.rotation.z = t * 2.0;

      if (coreMeshRef.current) {
        coreMeshRef.current.rotation.y = t * 3.0;
        coreMeshRef.current.rotation.x = Math.sin(t * 2) * 0.3;
      }
    }

    // 2. Collection Burst Expansion & Fade
    if (burstActiveRef.current && burstMeshRef.current) {
      burstProgressRef.current += dt * 3.0; // Complete in ~0.33s
      const p = burstProgressRef.current;

      if (p < 1.0) {
        const scale = 1.0 + p * 5.0;
        burstMeshRef.current.scale.set(scale, scale, scale);
        if (burstMatRef.current) {
          burstMatRef.current.opacity = Math.max(0, 1.0 - p);
        }
      } else {
        burstActiveRef.current = false;
        burstMeshRef.current.visible = false;
      }
    }
  });

  return (
    <group position={position}>
      {/* 1. Uncollected Token Collectible Mesh */}
      {!collected && (
        <group ref={tokenGroupRef}>
          {/* Central Faceted Gem Core */}
          <mesh ref={coreMeshRef}>
            <octahedronGeometry args={[0.9, 0]} />
            <primitive object={materials.coreMat} attach="material" />
          </mesh>

          {/* Inner Golden Spider Insignia Core */}
          <mesh>
            <sphereGeometry args={[0.45, 12, 12]} />
            <primitive object={materials.coreMat} attach="material" />
          </mesh>

          {/* Outer Gyro Ring 1 */}
          <mesh ref={ring1Ref}>
            <torusGeometry args={[1.4, 0.08, 8, 24]} />
            <primitive object={materials.ringMat} attach="material" />
          </mesh>

          {/* Outer Gyro Ring 2 */}
          <mesh ref={ring2Ref}>
            <torusGeometry args={[1.7, 0.06, 8, 24]} />
            <primitive object={materials.ringMat} attach="material" />
          </mesh>

          {/* Subtle Ambient Glow Light */}
          <pointLight color="#FDE047" intensity={1.8} distance={8} />
        </group>
      )}

      {/* 2. Pickup Shockwave Burst Mesh */}
      <mesh ref={burstMeshRef} visible={false}>
        <ringGeometry args={[0.5, 1.2, 24]} />
        <meshBasicMaterial
          ref={burstMatRef}
          color="#FEF08A"
          transparent
          opacity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
