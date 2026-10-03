'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

// Deterministic pseudo-random helper (React 19 compiler purity)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 1. Gradient Skydome Shader & Sparse Stars
const SKY_VERTEX_SHADER = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const SKY_FRAGMENT_SHADER = `
  varying vec3 vWorldPosition;
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;

  void main() {
    float h = normalize(vWorldPosition + offset).y;
    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
  }
`;

export const Skydome: React.FC = () => {
  const uniforms = useMemo(() => ({
    topColor: { value: new THREE.Color('#030712') }, // Deep zenith midnight navy
    bottomColor: { value: new THREE.Color('#2d150b') }, // Warm city-glow amber horizon
    offset: { value: 30 },
    exponent: { value: 0.6 },
  }), []);

  // Sparse Stars on Upper Hemisphere
  const starGeo = useMemo(() => {
    const coords: number[] = [];
    for (let i = 0; i < 220; i++) {
      const theta = seededRandom(i * 3 + 1) * Math.PI * 2;
      const phi = seededRandom(i * 3 + 2) * (Math.PI / 2.3);
      const r = 320;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.max(30, r * Math.cos(phi));
      const z = r * Math.sin(phi) * Math.sin(theta);
      coords.push(x, y, z);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    return geom;
  }, []);

  return (
    <group>
      {/* Inverted Gradient Sky Sphere */}
      <mesh>
        <sphereGeometry args={[350, 32, 16]} />
        <shaderMaterial
          vertexShader={SKY_VERTEX_SHADER}
          fragmentShader={SKY_FRAGMENT_SHADER}
          uniforms={uniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Sparse Stars */}
      <points geometry={starGeo}>
        <pointsMaterial color="#E2E8F0" size={1.8} sizeAttenuation transparent opacity={0.7} />
      </points>
    </group>
  );
};

// 2. Instanced Streetlights along Avenues (Zero Point Lights for 60fps)
export const InstancedStreetlights: React.FC = () => {
  const poleCount = 44;
  const poleMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightHeadMeshRef = useRef<THREE.InstancedMesh>(null);
  const conePoolMeshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!poleMeshRef.current || !lightHeadMeshRef.current || !conePoolMeshRef.current) return;

    const dummy = new THREE.Object3D();
    let idx = 0;

    // Place along east and west avenue sidewalks
    const lanes = [-28, -8, 8, 28];
    for (let l = 0; l < lanes.length; l++) {
      const x = lanes[l];
      for (let z = -140; z <= 20; z += 16) {
        if (idx >= poleCount) break;

        // Pole
        dummy.position.set(x, 4, z);
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        poleMeshRef.current.setMatrixAt(idx, dummy.matrix);

        // Glowing Emissive Lamp Head
        dummy.position.set(x, 7.8, z);
        dummy.updateMatrix();
        lightHeadMeshRef.current.setMatrixAt(idx, dummy.matrix);

        // Soft Fake Ground Light Pool (Oriented on ground plane)
        dummy.position.set(x, 0.1, z);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        conePoolMeshRef.current.setMatrixAt(idx, dummy.matrix);

        idx++;
      }
    }

    poleMeshRef.current.instanceMatrix.needsUpdate = true;
    lightHeadMeshRef.current.instanceMatrix.needsUpdate = true;
    conePoolMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* Metal Poles */}
      <instancedMesh ref={poleMeshRef} args={[undefined, undefined, poleCount]}>
        <cylinderGeometry args={[0.12, 0.16, 8, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </instancedMesh>

      {/* Emissive Lamp Heads */}
      <instancedMesh ref={lightHeadMeshRef} args={[undefined, undefined, poleCount]}>
        <boxGeometry args={[0.5, 0.3, 0.8]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={3.0} />
      </instancedMesh>

      {/* Fake Ground Light Cones / Pools */}
      <instancedMesh ref={conePoolMeshRef} args={[undefined, undefined, poleCount]}>
        <ringGeometry args={[0.2, 5.0, 16]} />
        <meshBasicMaterial color="#FEF08A" transparent opacity={0.14} depthWrite={false} />
      </instancedMesh>
    </group>
  );
};

// 3. Animated Neon Billboards & Signs
interface NeonSignProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  text: string;
  color: string;
  width?: number;
  height?: number;
}

export const NeonBillboard: React.FC<NeonSignProps> = ({
  position,
  rotation = [0, 0, 0],
  text,
  color,
  width = 14,
  height = 4.5,
}) => {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      // Gentle animated neon hum / pulse
      const pulse = 2.0 + Math.sin(t * 2.2 + position[0]) * 0.45;
      matRef.current.emissiveIntensity = pulse;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Billboard Backing Frame */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[width + 0.6, height + 0.6, 0.3]} />
        <meshStandardMaterial color="#0A0A12" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Emissive Front Panel */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          ref={matRef}
          color="#05050A"
          emissive={color}
          emissiveIntensity={2.2}
          roughness={0.2}
        />
      </mesh>

      {/* Glowing Neon Sign Text */}
      {text && (
        <Html position={[0, 0, 0.2]} center transform distanceFactor={28}>
          <div
            className="font-mono font-black tracking-widest text-center whitespace-nowrap uppercase select-none pointer-events-none px-4 py-2 border-2 rounded-lg bg-black/60 shadow-2xl"
            style={{
              color,
              borderColor: color,
              textShadow: `0 0 12px ${color}, 0 0 24px ${color}`,
              boxShadow: `0 0 20px ${color}40`,
              fontSize: '22px',
            }}
          >
            {text}
          </div>
        </Html>
      )}
    </group>
  );
};

// 4. High-Performance UnrealBloom & Vignette Post-Processing Pipeline
export const PostProcessingPipeline: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // High-performance bloom: half-resolution render buffer yields 4x faster blur with identical soft neon glow
    const bloomRes = new THREE.Vector2(
      Math.max(256, Math.floor(size.width * 0.5)),
      Math.max(256, Math.floor(size.height * 0.5))
    );
    const bloomPass = new UnrealBloomPass(
      bloomRes,
      0.82, // strength
      0.45, // radius
      0.25 // threshold
    );
    composer.addPass(bloomPass);

    // Vignette Shader Pass
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms['offset'].value = 1.05;
    vignettePass.uniforms['darkness'].value = 1.15;
    vignettePass.renderToScreen = true;
    composer.addPass(vignettePass);

    composerRef.current = composer;

    return () => {
      composer.dispose();
      composerRef.current = null;
    };
  }, [gl, scene, camera, size.width, size.height]);

  // Take over render loop with priority 1
  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, 1);

  return null;
};
