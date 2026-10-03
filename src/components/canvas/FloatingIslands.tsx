'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShardData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  rotSpeed: [number, number, number];
  floatSpeed: number;
  floatOffset: number;
  color: string;
  wireframe: boolean;
}

// Pure deterministic pseudo-random function to satisfy React Compiler purity rules
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Static shared geometries to avoid instantiating new geometries during render
const _sharedBoxGeom = new THREE.BoxGeometry(1, 1, 1);
const _sharedEdgesGeom = new THREE.EdgesGeometry(_sharedBoxGeom);

export const FloatingIslands: React.FC<{ mousePos?: { x: number; y: number } }> = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate low-poly Manhattan skyscrapers & dimensional shards
  const shards: ShardData[] = useMemo(() => {
    const list: ShardData[] = [];
    const colors = ['#080814', '#120816', '#1A0C18', '#E62429', '#0066FF'];

    // 1. Primary skyline skyscraper monoliths
    const buildings: Array<{ pos: [number, number, number]; scale: [number, number, number] }> = [
      { pos: [-6, -2, -3], scale: [2.2, 7.5, 2.2] },
      { pos: [-3, 1.5, -5], scale: [1.8, 6.0, 1.8] },
      { pos: [5.5, -1, -4], scale: [2.6, 9.0, 2.6] },
      { pos: [3, 2.5, -6], scale: [2.0, 5.5, 2.0] },
      { pos: [-7.5, 3.5, -7], scale: [2.4, 7.0, 2.4] },
      { pos: [8, 1, -8], scale: [3.0, 8.5, 3.0] },
    ];

    buildings.forEach((b, i) => {
      list.push({
        position: b.pos,
        rotation: [0.08 * (i % 3), 0.2 * i, 0.05 * (i % 2)],
        scale: b.scale,
        rotSpeed: [0.0008, 0.0012, 0.0005],
        floatSpeed: 0.8 + (i % 3) * 0.3,
        floatOffset: i * 1.2,
        color: '#0A0A16',
        wireframe: false,
      });
    });

    // 2. Suspended dimensional web debris & kinetic polyhedra (deterministic seeded values)
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 4 + (i % 7) * 1.5;
      const x = Math.cos(angle) * radius + ((i % 4) - 2);
      const y = ((i % 11) - 5) * 1.2;
      const z = -2 - (i % 8) * 1.4;

      const r1 = seededRandom(i * 7 + 1);
      const r2 = seededRandom(i * 7 + 2);
      const r3 = seededRandom(i * 7 + 3);
      const r4 = seededRandom(i * 7 + 4);
      const r5 = seededRandom(i * 7 + 5);
      const r6 = seededRandom(i * 7 + 6);
      const r7 = seededRandom(i * 7 + 7);

      list.push({
        position: [x, y, z],
        rotation: [r1 * Math.PI, r2 * Math.PI, r3 * Math.PI],
        scale: [
          0.3 + r4 * 0.6,
          0.4 + r5 * 0.9,
          0.3 + r6 * 0.6,
        ],
        rotSpeed: [
          (r1 - 0.5) * 0.015,
          (r2 - 0.5) * 0.015,
          (r3 - 0.5) * 0.015,
        ],
        floatSpeed: 0.5 + r7 * 1.2,
        floatOffset: r4 * 10,
        color: colors[i % colors.length],
        wireframe: i % 4 === 0,
      });
    }

    return list;
  }, []);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      const targetRotY = pointer.x * 0.25;
      const targetRotX = -pointer.y * 0.18;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);

      groupRef.current.position.y = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {shards.map((shard, idx) => (
        <FloatingShardItem key={idx} data={shard} index={idx} />
      ))}
    </group>
  );
};

const FloatingShardItem: React.FC<{ data: ShardData; index: number }> = ({ data, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x += data.rotSpeed[0];
      meshRef.current.rotation.y += data.rotSpeed[1];
      meshRef.current.rotation.z += data.rotSpeed[2];

      meshRef.current.position.y =
        data.position[1] + Math.sin(t * data.floatSpeed + data.floatOffset) * 0.25;
    }
  });

  const isWireframeAccent = index % 3 === 0;

  return (
    <group position={data.position}>
      <mesh ref={meshRef} scale={data.scale} rotation={data.rotation} geometry={_sharedBoxGeom}>
        <meshStandardMaterial
          color={data.color}
          roughness={0.4}
          metalness={0.7}
          wireframe={data.wireframe}
        />
        {/* Neon Wireframe Edge Highlight */}
        {isWireframeAccent && (
          <lineSegments geometry={_sharedEdgesGeom}>
            <lineBasicMaterial
              color={index % 2 === 0 ? '#E62429' : '#0066FF'}
              linewidth={1}
            />
          </lineSegments>
        )}
      </mesh>
    </group>
  );
};
