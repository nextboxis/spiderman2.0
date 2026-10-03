'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Deterministic pseudo-random helper (React 19 compiler purity)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 1. Procedural Window Canvas Texture Generator (Cached once at startup, zero per-frame cost)
function createProceduralWindowTexture(
  variant: 'warm' | 'cool' | 'mixed' | 'cyan' | 'brick',
  seed: number
): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    // SSR guard (component is loaded with ssr: false, so this never runs in practice)
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Facade background: dark glass / panel, or brownstone brick for the 'brick' variant
  ctx.fillStyle = variant === 'brick' ? '#1A0F0B' : '#05070D';
  ctx.fillRect(0, 0, 256, 512);

  if (variant === 'brick') {
    // Brick courses
    ctx.fillStyle = '#2A1710';
    for (let y = 0; y < 512; y += 6) {
      const offset = (y / 6) % 2 === 0 ? 0 : 6;
      for (let x = -6; x < 256; x += 12) {
        ctx.fillRect(x + offset, y, 11, 5);
      }
    }
  }

  const cols = variant === 'brick' ? 6 : 8;
  const rows = 24;
  const cellW = 256 / cols;
  const cellH = 512 / rows;
  const winW = cellW * (variant === 'brick' ? 0.45 : 0.65);
  const winH = cellH * (variant === 'brick' ? 0.62 : 0.55);
  const marginX = (cellW - winW) / 2;
  const marginY = (cellH - winH) / 2;

  for (let r = 0; r < rows; r++) {
    // ~22% of floors are completely unlit after hours
    const isDarkFloor = seededRandom(seed + r * 11.3) < 0.22;

    for (let c = 0; c < cols; c++) {
      const x = c * cellW + marginX;
      const y = r * cellH + marginY;

      // Unlit window: still draw a faint frame so the facade reads as glass, not a void
      const isLit = !isDarkFloor && seededRandom(seed + r * 17.1 + c * 7.7) > 0.52;
      if (!isLit) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = variant === 'brick' ? '#0B0705' : '#0B1220';
        ctx.fillRect(x, y, winW, winH);
        continue;
      }

      let color = '#FEF08A'; // Warm amber office glow
      const randColor = seededRandom(seed + r * 9.3 + c * 13.1);

      if (variant === 'cool') {
        color = randColor > 0.4 ? '#E0F2FE' : '#93C5FD';
      } else if (variant === 'mixed') {
        color = randColor > 0.65 ? '#FEF08A' : randColor > 0.3 ? '#BAE6FD' : '#FED7AA';
      } else if (variant === 'cyan') {
        color = randColor > 0.5 ? '#38BDF8' : '#67E8F9';
      } else if (variant === 'brick') {
        color = randColor > 0.5 ? '#FDBA74' : '#FDE68A'; // Apartment incandescent
      }

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.fillRect(x, y, winW, winH);

      // Occasional silhouette / curtain to break up uniform light
      if (seededRandom(seed + r * 5.5 + c * 3.3) > 0.8) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x + winW * 0.55, y, winW * 0.45, winH);
      }
    }
  }

  // Floor slab dividing bands
  ctx.shadowBlur = 0;
  ctx.fillStyle = variant === 'brick' ? '#120A07' : '#0A0F1D';
  for (let r = 0; r < rows; r++) {
    ctx.fillRect(0, r * cellH, 256, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 8);
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface BuildingSpec {
  id: number;
  silhouette: 'plain' | 'setback' | 'slab' | 'lowrise' | 'artdeco';
  materialType: 'glass' | 'concrete' | 'steel' | 'brick';
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  tiers?: Array<{ width: number; depth: number; height: number; y: number }>;
  hasProps: boolean;
  hasHelipad: boolean;
  hasBillboard: boolean;
  facesCanyon: boolean;
  roofHeight: number;
  textureIndex: number;
}

// Instance budgets for rooftop / facade props
const MAX = {
  water: 32,
  waterLegs: 32 * 4,
  ac: 48,
  bulkhead: 36,
  antenna: 28,
  beacon: 28,
  pilaster: 14 * 5,
  ledge: 14 * 6,
  billboard: 18,
  awning: 20,
};

export const ProceduralCityGrid3D: React.FC = () => {
  // 1. Procedural Window Canvas Textures (Generated once)
  const textures = useMemo(() => {
    return [
      createProceduralWindowTexture('warm', 101),
      createProceduralWindowTexture('cool', 202),
      createProceduralWindowTexture('mixed', 303),
      createProceduralWindowTexture('cyan', 404),
    ];
  }, []);
  const brickTexture = useMemo(() => createProceduralWindowTexture('brick', 505), []);

  // 2. City Block Grid Layout with Clear Central Swing Avenue (~24 units wide)
  const buildings: BuildingSpec[] = useMemo(() => {
    const list: BuildingSpec[] = [];
    let idCounter = 1;

    // Avenues along X (three rings of blocks each side of the canyon at X = 0)
    const avenues = [-104, -64, -24, 24, 64, 104];
    // Cross Streets along Z
    const streets = [-194, -154, -114, -74, -34, 6, 46];

    for (let ai = 0; ai < avenues.length; ai++) {
      for (let si = 0; si < streets.length; si++) {
        // Reserve open central plaza around Oscorp HQ at (X=0, Z=-74)
        if (Math.abs(avenues[ai]) <= 24 && Math.abs(streets[si] + 74) < 25) {
          continue;
        }

        const seed = ai * 31 + si * 19 + 7;
        const randS = seededRandom(seed + 1);
        const randM = seededRandom(seed + 2);
        const randH = seededRandom(seed + 3);
        const randW = seededRandom(seed + 4);
        const facesCanyon = Math.abs(avenues[ai]) === 24;
        const isOuterRing = Math.abs(avenues[ai]) >= 104;

        // Silhouette Types
        let silhouette: BuildingSpec['silhouette'] = 'plain';
        if (randS > 0.78) silhouette = 'artdeco';
        else if (randS > 0.6) silhouette = 'setback';
        else if (randS > 0.38) silhouette = 'slab';
        else if (randS < 0.2) silhouette = 'lowrise';

        // Facade Material Types (low-rises are brownstone walk-ups)
        let materialType: BuildingSpec['materialType'] =
          randM > 0.65 ? 'glass' : randM > 0.35 ? 'steel' : 'concrete';
        if (silhouette === 'lowrise') materialType = 'brick';

        // Dimensioning
        let width = 20 + randW * 6;
        let depth = 20 + randW * 6;
        let height = 55 + randH * 135;

        if (silhouette === 'lowrise') {
          height = 30 + randH * 22;
          width = 24 + randW * 4;
          depth = 24 + randW * 4;
        } else if (silhouette === 'slab') {
          width = 26 + randW * 4;
          depth = 16 + randW * 4;
          height = 80 + randH * 105;
        } else if (silhouette === 'artdeco') {
          width = 22 + randW * 4;
          depth = 22 + randW * 4;
          height = 110 + randH * 90;
        }
        // Outer ring rises so the skyline builds toward the horizon
        if (isOuterRing) height *= 1.15;

        const posX = avenues[ai];
        const posZ = streets[si];

        let tiers: BuildingSpec['tiers'] = undefined;
        let roofHeight = height;

        if (silhouette === 'setback') {
          const t1H = height * 0.52;
          const t2H = height * 0.3;
          const t3H = height * 0.18;
          tiers = [
            { width, depth, height: t1H, y: t1H / 2 },
            { width: width * 0.78, depth: depth * 0.78, height: t2H, y: t1H + t2H / 2 },
            { width: width * 0.55, depth: depth * 0.55, height: t3H, y: t1H + t2H + t3H / 2 },
          ];
          roofHeight = t1H + t2H + t3H;
        } else if (silhouette === 'artdeco') {
          // Empire-State style: tall shaft, two crown steps, needle added at render time
          const shaft = height * 0.7;
          const c1 = height * 0.18;
          const c2 = height * 0.12;
          tiers = [
            { width, depth, height: shaft, y: shaft / 2 },
            { width: width * 0.66, depth: depth * 0.66, height: c1, y: shaft + c1 / 2 },
            { width: width * 0.38, depth: depth * 0.38, height: c2, y: shaft + c1 + c2 / 2 },
          ];
          roofHeight = shaft + c1 + c2;
        }

        list.push({
          id: idCounter++,
          silhouette,
          materialType,
          position: [posX, height / 2, posZ],
          width,
          depth,
          height,
          tiers,
          hasProps: seededRandom(seed + 5) < 0.7,
          hasHelipad: height > 130 && seededRandom(seed + 6) > 0.6,
          hasBillboard: silhouette !== 'artdeco' && height < 110 && seededRandom(seed + 8) > 0.55,
          facesCanyon,
          roofHeight,
          textureIndex: Math.floor(seededRandom(seed + 7) * textures.length),
        });
      }
    }

    return list;
  }, [textures]);

  // 3. Facade Materials (Glass, Concrete, Steel, Brick)
  const materials = useMemo(() => {
    return textures.map((tex) => ({
      glass: new THREE.MeshStandardMaterial({
        color: '#080E1A',
        emissive: '#FFE680',
        emissiveMap: tex,
        emissiveIntensity: 1.1,
        metalness: 0.82,
        roughness: 0.18,
      }),
      concrete: new THREE.MeshStandardMaterial({
        color: '#1E293B',
        emissive: '#93C5FD',
        emissiveMap: tex,
        emissiveIntensity: 0.9,
        metalness: 0.08,
        roughness: 0.88,
      }),
      steel: new THREE.MeshStandardMaterial({
        color: '#111827',
        emissive: '#BAE6FD',
        emissiveMap: tex,
        emissiveIntensity: 1.05,
        metalness: 0.68,
        roughness: 0.32,
      }),
    }));
  }, [textures]);

  const brickMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3B2118',
        map: brickTexture,
        emissive: '#FDBA74',
        emissiveMap: brickTexture,
        emissiveIntensity: 0.75,
        metalness: 0.02,
        roughness: 0.95,
      }),
    [brickTexture]
  );

  // 4. Instanced Rooftop Props & Facade Details
  const waterTowerRef = useRef<THREE.InstancedMesh>(null);
  const waterCapRef = useRef<THREE.InstancedMesh>(null);
  const waterLegRef = useRef<THREE.InstancedMesh>(null);
  const acUnitRef = useRef<THREE.InstancedMesh>(null);
  const bulkheadRef = useRef<THREE.InstancedMesh>(null);
  const antennaRef = useRef<THREE.InstancedMesh>(null);
  const beaconRef = useRef<THREE.InstancedMesh>(null);
  const pilasterRef = useRef<THREE.InstancedMesh>(null);
  const ledgeRef = useRef<THREE.InstancedMesh>(null);
  const billboardRef = useRef<THREE.InstancedMesh>(null);
  const billboardFaceRef = useRef<THREE.InstancedMesh>(null);
  const awningRef = useRef<THREE.InstancedMesh>(null);


  useEffect(() => {
    const dummy = new THREE.Object3D();
    let wt = 0;
    let wl = 0;
    let ac = 0;
    let bh = 0;
    let an = 0;
    let bc = 0;
    let pl = 0;
    let lg = 0;
    let bb = 0;
    let aw = 0;

    buildings.forEach((b) => {
      const [bx, , bz] = b.position;
      const roofY = b.roofHeight;
      const topW = b.tiers ? b.tiers[b.tiers.length - 1].width : b.width;
      const topD = b.tiers ? b.tiers[b.tiers.length - 1].depth : b.depth;

      // --- Rooftop props ---
      if (b.hasProps) {
        // Water tower: barrel + conical cap + 4 legs
        if (b.id % 2 === 0 && wt < MAX.water && waterTowerRef.current && waterCapRef.current && waterLegRef.current) {
          const tx = bx - topW * 0.24;
          const tz = bz + topD * 0.24;
          dummy.position.set(tx, roofY + 4.4, tz);
          dummy.scale.set(1.2, 1.2, 1.2);
          dummy.rotation.set(0, b.id, 0);
          dummy.updateMatrix();
          waterTowerRef.current.setMatrixAt(wt, dummy.matrix);

          dummy.position.set(tx, roofY + 7.4, tz);
          dummy.updateMatrix();
          waterCapRef.current.setMatrixAt(wt, dummy.matrix);

          for (let l = 0; l < 4; l++) {
            const a = (l / 4) * Math.PI * 2 + Math.PI / 4;
            dummy.position.set(tx + Math.cos(a) * 1.6, roofY + 1.2, tz + Math.sin(a) * 1.6);
            dummy.scale.set(1, 1, 1);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            waterLegRef.current.setMatrixAt(wl++, dummy.matrix);
          }
          wt++;
        }

        // Stairwell bulkhead / elevator penthouse
        if (bh < MAX.bulkhead && bulkheadRef.current) {
          dummy.position.set(bx + topW * 0.22, roofY + 1.8, bz + topD * 0.18);
          dummy.scale.set(4.5, 3.6, 3.5);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          bulkheadRef.current.setMatrixAt(bh++, dummy.matrix);
        }

        // HVAC chiller units (two per roof for variety)
        for (let u = 0; u < 2 && ac < MAX.ac && acUnitRef.current; u++) {
          dummy.position.set(bx + topW * (0.25 - u * 0.5), roofY + 1.0, bz - topD * 0.25);
          dummy.scale.set(2.2, 1.6, 2.8);
          dummy.rotation.set(0, u * 0.4, 0);
          dummy.updateMatrix();
          acUnitRef.current.setMatrixAt(ac++, dummy.matrix);
        }
      }

      // Antenna masts + blinking aviation beacons on tall towers
      if (b.height > 100 && an < MAX.antenna && antennaRef.current && beaconRef.current) {
        const mastH = b.silhouette === 'artdeco' ? 22 : 12;
        dummy.position.set(bx, roofY + mastH / 2, bz);
        dummy.scale.set(1, mastH / 12, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        antennaRef.current.setMatrixAt(an, dummy.matrix);

        dummy.position.set(bx, roofY + mastH + 0.5, bz);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        beaconRef.current.setMatrixAt(bc++, dummy.matrix);
        an++;
      }

      // --- Canyon-facing facade detail (the walls the player actually sees up close) ---
      if (b.facesCanyon && b.silhouette !== 'lowrise') {
        const faceX = bx - Math.sign(bx) * (b.width / 2 + 0.15);
        // Vertical pilasters
        for (let p = 0; p < 5 && pl < MAX.pilaster && pilasterRef.current; p++) {
          const z = bz - b.depth / 2 + (b.depth / 4) * p;
          dummy.position.set(faceX, b.height / 2, z);
          dummy.scale.set(0.5, b.height, 0.9);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          pilasterRef.current.setMatrixAt(pl++, dummy.matrix);
        }
        // Horizontal ledges every ~25 units
        for (let l = 1; l <= 6 && lg < MAX.ledge && ledgeRef.current; l++) {
          const y = l * 25;
          if (y > b.height - 6) break;
          dummy.position.set(faceX, y, bz);
          dummy.scale.set(0.9, 0.5, b.depth + 0.4);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          ledgeRef.current.setMatrixAt(lg++, dummy.matrix);
        }
      }

      // Storefront awnings on canyon-facing walk-ups
      if (b.facesCanyon && b.silhouette === 'lowrise' && aw < MAX.awning && awningRef.current) {
        const faceX = bx - Math.sign(bx) * (b.width / 2 + 1.2);
        for (let s = -1; s <= 1 && aw < MAX.awning; s++) {
          dummy.position.set(faceX, 4.6, bz + s * 8);
          dummy.scale.set(2.4, 0.25, 6);
          dummy.rotation.set(0, 0, Math.sign(bx) * 0.25);
          dummy.updateMatrix();
          awningRef.current.setMatrixAt(aw++, dummy.matrix);
        }
      }

      // Rooftop billboard frames on mid-height buildings
      if (b.hasBillboard && bb < MAX.billboard && billboardRef.current && billboardFaceRef.current) {
        const faceCanyon = b.facesCanyon;
        const yaw = faceCanyon ? (bx < 0 ? -Math.PI / 2 : Math.PI / 2) : 0;
        dummy.position.set(bx, roofY + 6, bz);
        dummy.rotation.set(0, yaw, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        billboardRef.current.setMatrixAt(bb, dummy.matrix);
        billboardFaceRef.current.setMatrixAt(bb, dummy.matrix);
        bb++;
      }
    });

    const finalize = (ref: React.RefObject<THREE.InstancedMesh | null>, count: number) => {
      if (!ref.current) return;
      ref.current.count = count;
      ref.current.instanceMatrix.needsUpdate = true;
    };
    finalize(waterTowerRef, wt);
    finalize(waterCapRef, wt);
    finalize(waterLegRef, wl);
    finalize(acUnitRef, ac);
    finalize(bulkheadRef, bh);
    finalize(antennaRef, an);
    finalize(beaconRef, bc);
    finalize(pilasterRef, pl);
    finalize(ledgeRef, lg);
    finalize(billboardRef, bb);
    finalize(billboardFaceRef, bb);
    finalize(awningRef, aw);
  }, [buildings]);

  // Blinking aviation beacons + slow billboard colour cycle
  const beaconMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const billboardMatRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beaconMatRef.current) {
      beaconMatRef.current.emissiveIntensity = Math.sin(t * 2.6) > 0.5 ? 5 : 0.4;
    }
    if (billboardMatRef.current) {
      billboardMatRef.current.emissive.setHSL((t * 0.03) % 1, 0.85, 0.5);
    }
  });

  return (
    <group>
      {/* Ground Level: Asphalt Street Surface */}
      <mesh position={[0, -0.1, -74]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[280, 300]} />
        <meshStandardMaterial color="#060910" roughness={0.92} metalness={0.08} />
      </mesh>

      {/* Wet-asphalt sheen down the central avenue */}
      <mesh position={[0, 0.02, -74]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 300]} />
        <meshStandardMaterial color="#0A1220" roughness={0.25} metalness={0.6} />
      </mesh>

      {/* Sidewalk paving */}
      <mesh position={[0, 0.05, -74]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[270, 290]} />
        <meshStandardMaterial color="#0B1320" roughness={0.82} />
      </mesh>

      {/* Buildings */}
      {buildings.map((b) => {
        const mat = b.materialType === 'brick' ? brickMaterial : materials[b.textureIndex][b.materialType];

        // 1. Tiered towers: stepped setbacks and art-deco crowns
        if ((b.silhouette === 'setback' || b.silhouette === 'artdeco') && b.tiers) {
          return (
            <group key={b.id} position={[b.position[0], 0, b.position[2]]}>
              {b.tiers.map((tier, tidx) => (
                <group key={tidx} position={[0, tier.y, 0]}>
                  <mesh>
                    <boxGeometry args={[tier.width, tier.height, tier.depth]} />
                    <primitive object={mat} attach="material" />
                  </mesh>
                  {/* Edge trim */}
                  <mesh position={[0, tier.height / 2 + 0.1, 0]}>
                    <boxGeometry args={[tier.width + 0.35, 0.45, tier.depth + 0.35]} />
                    <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
                  </mesh>
                  {/* Art-deco crowns get gilded vertical fins */}
                  {b.silhouette === 'artdeco' && tidx > 0 && (
                    <>
                      {[-1, 1].map((s) => (
                        <mesh key={s} position={[s * (tier.width / 2 + 0.2), 0, 0]}>
                          <boxGeometry args={[0.4, tier.height, tier.depth * 0.6]} />
                          <meshStandardMaterial color="#B08D57" metalness={0.95} roughness={0.25} emissive="#7C5A2A" emissiveIntensity={0.4} />
                        </mesh>
                      ))}
                    </>
                  )}
                </group>
              ))}
              {/* Ground-floor lobby glow */}
              <mesh position={[0, 2, 0]}>
                <boxGeometry args={[b.width + 0.25, 4, b.depth + 0.25]} />
                <meshStandardMaterial color="#09101C" emissive="#FEF08A" emissiveIntensity={0.6} roughness={0.4} />
              </mesh>
              {/* Needle spire on art-deco towers */}
              {b.silhouette === 'artdeco' && (
                <mesh position={[0, b.roofHeight + 6, 0]}>
                  <coneGeometry args={[1.6, 12, 6]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.15} />
                </mesh>
              )}
            </group>
          );
        }

        // 2. Standard Tower, Slab, or Brownstone Low-Rise
        return (
          <group key={b.id} position={b.position}>
            <mesh>
              <boxGeometry args={[b.width, b.height, b.depth]} />
              <primitive object={mat} attach="material" />
            </mesh>

            {/* Roof parapet */}
            <mesh position={[0, b.height / 2 + 0.25, 0]}>
              <boxGeometry args={[b.width + 0.35, 0.55, b.depth + 0.35]} />
              <meshStandardMaterial color={b.materialType === 'brick' ? '#4A2C1F' : '#475569'} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Brownstone cornice */}
            {b.materialType === 'brick' && (
              <mesh position={[0, b.height / 2 - 1.2, 0]}>
                <boxGeometry args={[b.width + 1.2, 1.0, b.depth + 1.2]} />
                <meshStandardMaterial color="#5A3A2A" roughness={0.9} />
              </mesh>
            )}

            {/* Glowing ground storefront strip */}
            <mesh position={[0, -b.height / 2 + 1.8, 0]}>
              <boxGeometry args={[b.width + 0.25, 3.2, b.depth + 0.25]} />
              <meshStandardMaterial
                color="#09101C"
                emissive={b.materialType === 'brick' ? '#F97316' : '#FEF08A'}
                emissiveIntensity={0.65}
                roughness={0.4}
              />
            </mesh>

            {/* Helipad on tallest towers */}
            {b.hasHelipad && (
              <mesh position={[0, b.height / 2 + 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.2, 4.8, 16]} />
                <meshBasicMaterial color="#EAB308" />
              </mesh>
            )}

            {/* Slab spire crown */}
            {b.silhouette === 'slab' && (
              <mesh position={[0, b.height / 2 + 5, 0]}>
                <coneGeometry args={[2.8, 10, 4]} />
                <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* --- Instanced rooftop props --- */}
      <instancedMesh ref={waterTowerRef} args={[undefined, undefined, MAX.water]}>
        <cylinderGeometry args={[1.8, 1.8, 3.6, 10]} />
        <meshStandardMaterial color="#573D26" roughness={0.9} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={waterCapRef} args={[undefined, undefined, MAX.water]}>
        <coneGeometry args={[2.1, 1.6, 10]} />
        <meshStandardMaterial color="#3F2A1A" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={waterLegRef} args={[undefined, undefined, MAX.waterLegs]}>
        <cylinderGeometry args={[0.12, 0.12, 2.4, 5]} />
        <meshStandardMaterial color="#1F2933" metalness={0.8} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={bulkheadRef} args={[undefined, undefined, MAX.bulkhead]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={acUnitRef} args={[undefined, undefined, MAX.ac]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={antennaRef} args={[undefined, undefined, MAX.antenna]}>
        <cylinderGeometry args={[0.08, 0.35, 12, 6]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={beaconRef} args={[undefined, undefined, MAX.beacon]}>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshStandardMaterial ref={beaconMatRef} color="#7F1D1D" emissive="#EF4444" emissiveIntensity={4} />
      </instancedMesh>

      {/* --- Facade detail --- */}
      <instancedMesh ref={pilasterRef} args={[undefined, undefined, MAX.pilaster]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={ledgeRef} args={[undefined, undefined, MAX.ledge]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={awningRef} args={[undefined, undefined, MAX.awning]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7F1D1D" roughness={0.9} />
      </instancedMesh>

      {/* --- Rooftop billboards (frame + colour-cycling face) --- */}
      <instancedMesh ref={billboardRef} args={[undefined, undefined, MAX.billboard]}>
        <boxGeometry args={[14, 7, 0.4]} />
        <meshStandardMaterial color="#0A0A12" metalness={0.9} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={billboardFaceRef} args={[undefined, undefined, MAX.billboard]}>
        <boxGeometry args={[13.2, 6.2, 0.6]} />
        <meshStandardMaterial ref={billboardMatRef} color="#05050A" emissive="#E11D48" emissiveIntensity={1.6} roughness={0.3} />
      </instancedMesh>
    </group>
  );
};
