'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpeedLinesParticles3DProps {
  playerPos?: THREE.Vector3;
  velocity?: THREE.Vector3;
  playerRef?: React.RefObject<{ pos: THREE.Vector3; vel: THREE.Vector3 }>;
}

// Static scratch objects to eliminate per-frame allocations
const _dummy = new THREE.Object3D();
const _forwardDir = new THREE.Vector3();
const _upVector = new THREE.Vector3(0, 1, 0);
const _orientation = new THREE.Quaternion();

export const SpeedLinesParticles3D: React.FC<SpeedLinesParticles3DProps> = ({
  playerPos,
  velocity,
  playerRef,
}) => {
  const count = 40;
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Particle streak state stored in ref for 60fps simulation state (React Compiler pure)
  const particlesRef = useRef(
    Array.from({ length: count }, (_, i) => ({
      offsetX: (Math.sin(i * 99) * 2 - 1) * 12,
      offsetY: (Math.cos(i * 77) * 2 - 1) * 8,
      offsetZ: (Math.sin(i * 33) * 2 - 1) * 25,
      speedMult: 0.8 + Math.sin(i * 11) * 0.4,
      length: 2.5 + Math.cos(i * 17) * 1.5,
    }))
  );

  useFrame((_, delta) => {
    if (!instancedMeshRef.current || !materialRef.current) return;

    const pPos = playerRef?.current ? playerRef.current.pos : playerPos;
    const pVel = playerRef?.current ? playerRef.current.vel : velocity;
    if (!pPos || !pVel) return;

    const speed = pVel.length();
    // Speed threshold: 14 units/s (~60 MPH)
    const speedRatio = Math.max(0, Math.min(1, (speed - 12) / 16));

    // Fade opacity smoothly with speed
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      speedRatio * 0.75,
      0.15
    );

    if (materialRef.current.opacity < 0.02) {
      instancedMeshRef.current.visible = false;
      return;
    }
    instancedMeshRef.current.visible = true;

    const dt = Math.min(delta, 0.05);

    // Direction of motion (zero allocations)
    if (speed > 0.001) {
      _forwardDir.copy(pVel).normalize();
      _orientation.setFromUnitVectors(_upVector, _forwardDir);
    }

    const particles = particlesRef.current;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      // Stream particles backwards relative to player velocity
      p.offsetZ += speed * p.speedMult * dt * 2.2;
      if (p.offsetZ > 20) {
        p.offsetZ = -30;
      }

      // Compute particle world position relative to player
      _dummy.position.set(
        pPos.x + p.offsetX,
        pPos.y + p.offsetY,
        pPos.z + p.offsetZ
      );

      // Elongate streak with speed
      _dummy.scale.set(0.04, p.length * (1 + speedRatio * 1.5), 0.04);
      _dummy.quaternion.copy(_orientation);
      _dummy.updateMatrix();

      instancedMeshRef.current.setMatrixAt(i, _dummy.matrix);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.04, 0.04, 1, 4]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#A5F3FC"
        transparent
        opacity={0.0}
        depthWrite={false}
      />
    </instancedMesh>
  );
};
