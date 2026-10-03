'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WebStrandEffect3DProps {
  isWebAttached: boolean;
  startPos?: THREE.Vector3;
  anchorPos?: THREE.Vector3;
  handPosRef?: React.RefObject<THREE.Vector3>;
  playerRef?: React.RefObject<{ pos: THREE.Vector3 }>;
  cameraMode?: 'chase' | 'fps';
  webColor?: string;
}

// Scratch objects to prevent per-frame allocations
const _fpsHandPos = new THREE.Vector3();
const _defaultStart = new THREE.Vector3();
const _defaultAnchor = new THREE.Vector3();
const _midPoint = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _orientation = new THREE.Quaternion();
const _up = new THREE.Vector3(0, 1, 0);

export const WebStrandEffect3D: React.FC<WebStrandEffect3DProps> = ({
  isWebAttached,
  startPos,
  anchorPos,
  handPosRef,
  playerRef,
  cameraMode = 'chase',
  webColor = '#F0FDFA',
}) => {
  const strandMeshRef = useRef<THREE.Mesh>(null);
  const splatMeshRef = useRef<THREE.Mesh>(null);
  const trailMeshRef = useRef<THREE.Mesh>(null);
  const splatMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const trailMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Track previous attachment state to trigger impact splat and release trail
  const wasAttachedRef = useRef(false);
  const splatTimeRef = useRef(0);
  const trailTimeRef = useRef(0);
  const lastReleasePosRef = useRef({ start: new THREE.Vector3(), end: new THREE.Vector3() });

  const strandMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      emissive: webColor,
      emissiveIntensity: 2.6,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
    });
  }, [webColor]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Determine accurate start and anchor points dynamically inside 60 FPS loop
    const currentAnchor = anchorPos ?? _defaultAnchor;
    let currentStart = handPosRef?.current ?? startPos ?? _defaultStart;
    if (cameraMode === 'fps' && playerRef?.current) {
      _fpsHandPos.set(
        playerRef.current.pos.x + 0.3,
        playerRef.current.pos.y - 0.2,
        playerRef.current.pos.z - 0.6
      );
      currentStart = _fpsHandPos;
    }

    // 1. Detect state transitions for splat & trail
    if (isWebAttached && !wasAttachedRef.current) {
      splatTimeRef.current = 0.5; // lasts 0.5s
    } else if (!isWebAttached && wasAttachedRef.current) {
      trailTimeRef.current = 0.4;
      lastReleasePosRef.current.start.copy(currentStart);
      lastReleasePosRef.current.end.copy(currentAnchor);
    }
    wasAttachedRef.current = isWebAttached;

    // 2. Active Web Strand Transformation
    if (strandMeshRef.current) {
      if (isWebAttached) {
        strandMeshRef.current.visible = true;

        // Position at midpoint between hand and anchor
        _midPoint.addVectors(currentStart, currentAnchor).multiplyScalar(0.5);
        strandMeshRef.current.position.copy(_midPoint);

        // Scale height to match distance
        const distance = currentStart.distanceTo(currentAnchor);
        strandMeshRef.current.scale.set(1, Math.max(0.1, distance), 1);

        // Orient along vector from start to anchor
        _dir.subVectors(currentAnchor, currentStart).normalize();
        _orientation.setFromUnitVectors(_up, _dir);
        strandMeshRef.current.quaternion.copy(_orientation);
      } else {
        strandMeshRef.current.visible = false;
      }
    }

    // 3. Anchor Impact Splat Effect
    if (splatMeshRef.current && splatMatRef.current) {
      if (splatTimeRef.current > 0) {
        splatTimeRef.current -= dt;
        splatMeshRef.current.visible = true;
        splatMeshRef.current.position.copy(currentAnchor);

        const progress = 1 - splatTimeRef.current / 0.5;
        const scale = 0.8 + progress * 2.2;
        splatMeshRef.current.scale.set(scale, scale, scale);
        splatMatRef.current.opacity = Math.max(0, 1 - progress);
      } else {
        splatMeshRef.current.visible = false;
      }
    }

    // 4. Release Vapor Trail
    if (trailMeshRef.current && trailMatRef.current) {
      if (trailTimeRef.current > 0) {
        trailTimeRef.current -= dt;
        trailMeshRef.current.visible = true;
        const progress = 1 - trailTimeRef.current / 0.4;
        trailMatRef.current.opacity = Math.max(0, (1 - progress) * 0.5);

        _midPoint
          .addVectors(lastReleasePosRef.current.start, lastReleasePosRef.current.end)
          .multiplyScalar(0.5);
        trailMeshRef.current.position.copy(_midPoint);

        const dist = lastReleasePosRef.current.start.distanceTo(lastReleasePosRef.current.end);
        trailMeshRef.current.scale.set(1 + progress * 0.8, dist, 1 + progress * 0.8);

        _dir
          .subVectors(lastReleasePosRef.current.end, lastReleasePosRef.current.start)
          .normalize();
        _orientation.setFromUnitVectors(_up, _dir);
        trailMeshRef.current.quaternion.copy(_orientation);
      } else {
        trailMeshRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Dynamic Tapered Web Cylinder (0.04 radius at hand, 0.08 radius at anchor) */}
      <mesh ref={strandMeshRef} visible={false}>
        <cylinderGeometry args={[0.08, 0.04, 1, 8, 1, false]} />
        <primitive object={strandMat} attach="material" />
      </mesh>

      {/* Anchor Impact Web Splat */}
      <mesh ref={splatMeshRef} visible={false}>
        <ringGeometry args={[0.2, 1.4, 16]} />
        <meshBasicMaterial
          ref={splatMatRef}
          color="#00F0FF"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Web Release Dissolving Trail */}
      <mesh ref={trailMeshRef} visible={false}>
        <cylinderGeometry args={[0.1, 0.06, 1, 6]} />
        <meshBasicMaterial
          ref={trailMatRef}
          color="#E0F2FE"
          transparent
          opacity={0.5}
          wireframe
        />
      </mesh>
    </group>
  );
};
