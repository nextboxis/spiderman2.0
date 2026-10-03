'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Deterministic pseudo-random helper (React 19 compiler purity)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const CITY_Z_MIN = -200;
const CITY_Z_MAX = 40;

// ---------------------------------------------------------------------------
// 1. Street traffic — yellow cabs, sedans, a few delivery trucks with
//    moving headlights / taillights. Everything instanced; zero point lights.
// ---------------------------------------------------------------------------
interface Car {
  lane: number; // x position
  dir: 1 | -1; // +1 drives toward +Z (toward camera), -1 toward -Z
  z: number;
  speed: number;
  kind: 'cab' | 'sedan' | 'truck';
}

// Lanes: central avenue (4 lanes), and the two side avenues between the blocks
const LANES: Array<{ x: number; dir: 1 | -1 }> = [
  { x: -7.5, dir: 1 },
  { x: -3.5, dir: 1 },
  { x: 3.5, dir: -1 },
  { x: 7.5, dir: -1 },
  { x: -44, dir: -1 },
  { x: -40, dir: 1 },
  { x: 40, dir: -1 },
  { x: 44, dir: 1 },
];

export const StreetTraffic3D: React.FC = () => {
  const CAR_COUNT = 56;
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const cabinRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const tailRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const initialCars = useMemo<Car[]>(() => {
    const list: Car[] = [];
    for (let i = 0; i < CAR_COUNT; i++) {
      const lane = LANES[i % LANES.length];
      const r = seededRandom(i * 3.7 + 1);
      const kind: Car['kind'] = r < 0.38 ? 'cab' : r < 0.9 ? 'sedan' : 'truck';
      list.push({
        lane: lane.x,
        dir: lane.dir,
        z: CITY_Z_MIN + seededRandom(i * 5.1 + 2) * (CITY_Z_MAX - CITY_Z_MIN),
        speed: (kind === 'truck' ? 9 : 13) + seededRandom(i * 7.3 + 3) * 6,
        kind,
      });
    }
    return list;
  }, []);
  // Mutable simulation state lives in a ref (never mutate memoised values)
  const carsRef = useRef<Car[]>(initialCars);

  // Per-instance body colours
  useEffect(() => {
    if (!bodyRef.current) return;
    const c = new THREE.Color();
    const cars = carsRef.current;
    const palette = ['#0F172A', '#1F2937', '#374151', '#7F1D1D', '#F8FAFC', '#1E3A8A', '#052E16'];
    cars.forEach((car, i) => {
      if (car.kind === 'cab') c.set('#FACC15');
      else if (car.kind === 'truck') c.set('#E2E8F0');
      else c.set(palette[Math.floor(seededRandom(i * 2.9 + 9) * palette.length)]);
      bodyRef.current!.setColorAt(i, c);
    });
    bodyRef.current.instanceColor!.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    if (!bodyRef.current || !cabinRef.current || !headRef.current || !tailRef.current) return;
    const dt = Math.min(delta, 0.05);

    carsRef.current.forEach((car, i) => {
      car.z += car.dir * car.speed * dt;
      if (car.z > CITY_Z_MAX) car.z = CITY_Z_MIN;
      if (car.z < CITY_Z_MIN) car.z = CITY_Z_MAX;

      const isTruck = car.kind === 'truck';
      const len = isTruck ? 6.5 : 4.2;
      const h = isTruck ? 2.6 : 1.1;
      const w = isTruck ? 2.3 : 1.9;
      const yaw = car.dir === 1 ? 0 : Math.PI;

      // Body
      dummy.position.set(car.lane, h / 2 + 0.1, car.z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(w, h, len);
      dummy.updateMatrix();
      bodyRef.current!.setMatrixAt(i, dummy.matrix);

      // Cabin (sedans / cabs get a glass cabin; trucks a cab box up front)
      if (isTruck) {
        dummy.position.set(car.lane, 1.2, car.z + car.dir * 2.6);
        dummy.scale.set(w * 0.95, 1.6, 1.8);
      } else {
        dummy.position.set(car.lane, h + 0.45, car.z - car.dir * 0.2);
        dummy.scale.set(w * 0.82, 0.75, len * 0.5);
      }
      dummy.updateMatrix();
      cabinRef.current!.setMatrixAt(i, dummy.matrix);

      // Headlights (front) and taillights (rear)
      dummy.scale.set(w * 0.9, 0.25, 0.15);
      dummy.position.set(car.lane, 0.7, car.z + car.dir * (len / 2 + 0.05));
      dummy.updateMatrix();
      headRef.current!.setMatrixAt(i, dummy.matrix);

      dummy.position.set(car.lane, 0.8, car.z - car.dir * (len / 2 + 0.05));
      dummy.updateMatrix();
      tailRef.current!.setMatrixAt(i, dummy.matrix);
    });

    bodyRef.current.instanceMatrix.needsUpdate = true;
    cabinRef.current.instanceMatrix.needsUpdate = true;
    headRef.current.instanceMatrix.needsUpdate = true;
    tailRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, CAR_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.7} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={cabinRef} args={[undefined, undefined, CAR_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0B1220" metalness={0.9} roughness={0.15} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, CAR_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FFFBEB" emissive="#FFF7D6" emissiveIntensity={4} />
      </instancedMesh>
      <instancedMesh ref={tailRef} args={[undefined, undefined, CAR_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7F1D1D" emissive="#EF4444" emissiveIntensity={3} />
      </instancedMesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 2. Street furniture — lane dashes, crosswalks, sidewalk curbs, traffic
//    lights, hydrants, newspaper boxes.
// ---------------------------------------------------------------------------
const CROSS_STREETS = [-174, -134, -94, -54, -14, 26];

const DASH_COUNT = 3 * 60;
const ZEBRA_COUNT = CROSS_STREETS.length * 3 * 8;
const CURB_COUNT = 6 * 7;
const SIGNAL_COUNT = CROSS_STREETS.length * 4;
const HYDRANT_COUNT = 24;

export const StreetFurniture3D: React.FC = () => {
  const dashRef = useRef<THREE.InstancedMesh>(null);
  const zebraRef = useRef<THREE.InstancedMesh>(null);
  const curbRef = useRef<THREE.InstancedMesh>(null);
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const redRef = useRef<THREE.InstancedMesh>(null);
  const greenRef = useRef<THREE.InstancedMesh>(null);
  const hydrantRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    // Lane dashes down the three avenues
    if (dashRef.current) {
      let i = 0;
      for (const x of [0, -42, 42]) {
        for (let z = CITY_Z_MIN; z < CITY_Z_MAX && i < DASH_COUNT; z += 4) {
          dummy.position.set(x, 0.06, z);
          dummy.rotation.set(-Math.PI / 2, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          dashRef.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      dashRef.current.count = i;
      dashRef.current.instanceMatrix.needsUpdate = true;
    }

    // Zebra crosswalks at every intersection
    if (zebraRef.current) {
      let i = 0;
      for (const z of CROSS_STREETS) {
        for (const x of [0, -42, 42]) {
          for (let s = 0; s < 8; s++) {
            dummy.position.set(x - 8.75 + s * 2.5, 0.07, z);
            dummy.rotation.set(-Math.PI / 2, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            zebraRef.current.setMatrixAt(i++, dummy.matrix);
          }
        }
      }
      zebraRef.current.instanceMatrix.needsUpdate = true;
    }

    // Sidewalk curbs along each block face bordering the avenues
    if (curbRef.current) {
      let i = 0;
      for (const x of [-12.5, 11.5, -52.5, -32.5, 31.5, 51.5]) {
        for (let b = 0; b < 7 && i < CURB_COUNT; b++) {
          const z = -194 + b * 40 + 6;
          dummy.position.set(x + 0.5, 0.2, z);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          curbRef.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      curbRef.current.instanceMatrix.needsUpdate = true;
    }

    // Traffic signals on the four corners of the central-avenue intersections
    if (poleRef.current && redRef.current && greenRef.current) {
      let i = 0;
      for (let c = 0; c < CROSS_STREETS.length; c++) {
        const z = CROSS_STREETS[c];
        const corners: Array<[number, number]> = [
          [-11, z - 7],
          [11, z - 7],
          [-11, z + 7],
          [11, z + 7],
        ];
        corners.forEach(([x, cz], k) => {
          dummy.position.set(x, 3, cz);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          poleRef.current!.setMatrixAt(i, dummy.matrix);

          // Alternate which axis is green so intersections look "live"
          const northSouthGreen = (c + k) % 2 === 0;
          dummy.position.set(x, 6.2, cz);
          dummy.scale.set(northSouthGreen ? 0.001 : 1, northSouthGreen ? 0.001 : 1, northSouthGreen ? 0.001 : 1);
          dummy.updateMatrix();
          redRef.current!.setMatrixAt(i, dummy.matrix);

          dummy.position.set(x, 5.5, cz);
          dummy.scale.set(northSouthGreen ? 1 : 0.001, northSouthGreen ? 1 : 0.001, northSouthGreen ? 1 : 0.001);
          dummy.updateMatrix();
          greenRef.current!.setMatrixAt(i, dummy.matrix);
          i++;
        });
      }
      poleRef.current.instanceMatrix.needsUpdate = true;
      redRef.current.instanceMatrix.needsUpdate = true;
      greenRef.current.instanceMatrix.needsUpdate = true;
    }

    // Fire hydrants on the sidewalks
    if (hydrantRef.current) {
      for (let i = 0; i < HYDRANT_COUNT; i++) {
        const side = i % 2 === 0 ? -11.2 : 11.2;
        const z = -190 + (i * 19) % 230;
        dummy.position.set(side, 0.55, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        hydrantRef.current.setMatrixAt(i, dummy.matrix);
      }
      hydrantRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <group>
      {/* Yellow lane dashes */}
      <instancedMesh ref={dashRef} args={[undefined, undefined, DASH_COUNT]}>
        <planeGeometry args={[0.35, 2.2]} />
        <meshBasicMaterial color="#D4A017" />
      </instancedMesh>
      {/* White crosswalk stripes */}
      <instancedMesh ref={zebraRef} args={[undefined, undefined, ZEBRA_COUNT]}>
        <planeGeometry args={[1.3, 6]} />
        <meshBasicMaterial color="#CBD5E1" transparent opacity={0.8} />
      </instancedMesh>
      {/* Sidewalk curbs */}
      <instancedMesh ref={curbRef} args={[undefined, undefined, CURB_COUNT]}>
        <boxGeometry args={[1.2, 0.4, 28]} />
        <meshStandardMaterial color="#334155" roughness={0.95} />
      </instancedMesh>
      {/* Traffic light poles */}
      <instancedMesh ref={poleRef} args={[undefined, undefined, SIGNAL_COUNT]}>
        <cylinderGeometry args={[0.1, 0.14, 6, 6]} />
        <meshStandardMaterial color="#1F2937" metalness={0.7} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={redRef} args={[undefined, undefined, SIGNAL_COUNT]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#7F1D1D" emissive="#EF4444" emissiveIntensity={3.5} />
      </instancedMesh>
      <instancedMesh ref={greenRef} args={[undefined, undefined, SIGNAL_COUNT]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#064E3B" emissive="#22C55E" emissiveIntensity={3.5} />
      </instancedMesh>
      {/* Hydrants */}
      <instancedMesh ref={hydrantRef} args={[undefined, undefined, HYDRANT_COUNT]}>
        <cylinderGeometry args={[0.22, 0.28, 1.1, 8]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.6} metalness={0.3} />
      </instancedMesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 3. Fire escapes on the canyon-facing brick facades — the classic
//    Spider-Man perch. Instanced landings, railings and diagonal stairs.
// ---------------------------------------------------------------------------
export const FireEscapes3D: React.FC = () => {
  const landingRef = useRef<THREE.InstancedMesh>(null);
  const railRef = useRef<THREE.InstancedMesh>(null);
  const stairRef = useRef<THREE.InstancedMesh>(null);
  const bracketRef = useRef<THREE.InstancedMesh>(null);

  const LEVELS = 6;
  const SITES = 12; // facades that get a fire escape
  const COUNT = LEVELS * SITES;

  useEffect(() => {
    if (!landingRef.current || !railRef.current || !stairRef.current || !bracketRef.current) return;
    const dummy = new THREE.Object3D();
    let i = 0;

    for (let s = 0; s < SITES; s++) {
      const side = s % 2 === 0 ? -1 : 1; // west or east wall of the central canyon
      const x = side * 12.2; // facade plane at |x| ≈ 12 (building edge)
      const z = -180 + Math.floor(s / 2) * 40 + 14 + seededRandom(s * 4.1) * 8;
      const baseY = 8 + seededRandom(s * 2.3) * 4;

      for (let l = 0; l < LEVELS; l++) {
        const y = baseY + l * 6.5;

        // Landing platform
        dummy.position.set(x - side * 1.1, y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        landingRef.current.setMatrixAt(i, dummy.matrix);

        // Railing on the outer edge
        dummy.position.set(x - side * 2.15, y + 0.6, z);
        dummy.updateMatrix();
        railRef.current.setMatrixAt(i, dummy.matrix);

        // Diagonal stair down to the previous landing
        dummy.position.set(x - side * 1.2, y - 3.25, z - 3.2);
        dummy.rotation.set(-0.85, 0, 0);
        dummy.updateMatrix();
        stairRef.current.setMatrixAt(i, dummy.matrix);

        // Wall bracket
        dummy.position.set(x - side * 0.4, y - 0.6, z);
        dummy.rotation.set(0, 0, side * 0.7);
        dummy.updateMatrix();
        bracketRef.current.setMatrixAt(i, dummy.matrix);

        i++;
      }
    }

    landingRef.current.instanceMatrix.needsUpdate = true;
    railRef.current.instanceMatrix.needsUpdate = true;
    stairRef.current.instanceMatrix.needsUpdate = true;
    bracketRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const iron = <meshStandardMaterial color="#1F2933" metalness={0.75} roughness={0.5} />;

  return (
    <group>
      <instancedMesh ref={landingRef} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[2.2, 0.12, 7.5]} />
        {iron}
      </instancedMesh>
      <instancedMesh ref={railRef} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[0.08, 1.2, 7.5]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.45} wireframe />
      </instancedMesh>
      <instancedMesh ref={stairRef} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1.1, 0.1, 7.2]} />
        {iron}
      </instancedMesh>
      <instancedMesh ref={bracketRef} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[0.1, 1.6, 0.1]} />
        {iron}
      </instancedMesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 4. Distant skyline backdrop — a ring of silhouetted towers beyond the
//    playable grid so the horizon never reads as empty. Cheap: one
//    instanced mesh with per-instance colour.
// ---------------------------------------------------------------------------
export const DistantSkyline3D: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const beaconRef = useRef<THREE.InstancedMesh>(null);
  const COUNT = 160;
  const BEACONS = 22;

  useEffect(() => {
    if (!ref.current || !beaconRef.current) return;
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    let b = 0;

    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2 + seededRandom(i * 1.3) * 0.05;
      const radius = 175 + seededRandom(i * 2.1) * 90;
      const x = Math.cos(angle) * radius;
      const z = -80 + Math.sin(angle) * radius;
      const h = 40 + seededRandom(i * 3.3) * 140;
      const w = 12 + seededRandom(i * 4.7) * 18;

      dummy.position.set(x, h / 2, z);
      dummy.rotation.set(0, seededRandom(i * 5.9) * 0.6, 0);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);

      // Slight hue variation so the silhouette layer has depth
      const t = seededRandom(i * 6.1);
      c.setRGB(0.05 + t * 0.03, 0.07 + t * 0.04, 0.13 + t * 0.06);
      ref.current.setColorAt(i, c);

      if (h > 140 && b < BEACONS) {
        dummy.position.set(x, h + 1.5, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        beaconRef.current.setMatrixAt(b++, dummy.matrix);
      }
    }
    beaconRef.current.count = b;
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor!.needsUpdate = true;
    beaconRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  const beaconMat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (beaconMat.current) {
      // Slow aviation-warning blink
      beaconMat.current.emissiveIntensity = Math.sin(clock.getElapsedTime() * 3) > 0.6 ? 4 : 0.3;
    }
  });

  return (
    <group>
      {/* Far ground so the horizon ring stands on something */}
      <mesh position={[0, -0.3, -80]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#04060C" roughness={1} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#1E3A8A" emissiveIntensity={0.18} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={beaconRef} args={[undefined, undefined, BEACONS]}>
        <sphereGeometry args={[1.4, 8, 8]} />
        <meshStandardMaterial ref={beaconMat} color="#7F1D1D" emissive="#EF4444" emissiveIntensity={3} />
      </instancedMesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 5. Sweeping searchlights — premiere-night beams raking the sky.
// ---------------------------------------------------------------------------
export const Searchlights3D: React.FC = () => {
  const refs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const bases: Array<[number, number, number]> = [
    [-70, 0, -40],
    [72, 0, -120],
    [-60, 0, -170],
  ];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.forEach((r, i) => {
      if (!r.current) return;
      r.current.rotation.z = Math.sin(t * 0.35 + i * 2.1) * 0.55;
      r.current.rotation.x = Math.cos(t * 0.27 + i * 1.3) * 0.45;
    });
  });

  return (
    <group>
      {bases.map((pos, i) => (
        <group key={i} position={pos}>
          <group ref={refs[i]}>
            <mesh position={[0, 110, 0]}>
              <coneGeometry args={[9, 220, 12, 1, true]} />
              <meshBasicMaterial
                color="#DBEAFE"
                transparent
                opacity={0.06}
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
          {/* Ground lamp housing */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[1.6, 2, 3, 12]} />
            <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 6. NYPD helicopter circling the skyline with a spotlight and strobe.
// ---------------------------------------------------------------------------
export const PoliceHelicopter3D: React.FC = () => {
  const group = useRef<THREE.Group>(null);
  const rotor = useRef<THREE.Mesh>(null);
  const tailRotor = useRef<THREE.Mesh>(null);
  const strobe = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      const a = t * 0.12;
      const r = 70;
      const x = Math.cos(a) * r;
      const z = -80 + Math.sin(a) * r * 0.8;
      group.current.position.set(x, 150 + Math.sin(t * 0.5) * 4, z);
      // Face along the tangent of the orbit, bank into the turn
      group.current.rotation.set(0, -a + Math.PI / 2, 0);
      group.current.rotation.z = -0.18;
    }
    if (rotor.current) rotor.current.rotation.y = t * 28;
    if (tailRotor.current) tailRotor.current.rotation.x = t * 40;
    if (strobe.current) strobe.current.emissiveIntensity = (t * 2) % 1 < 0.15 ? 6 : 0.2;
  });

  return (
    <group ref={group}>
      {/* Fuselage */}
      <mesh>
        <capsuleGeometry args={[1.4, 3.2, 4, 10]} />
        <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cockpit glass */}
      <mesh position={[0, 0.3, 2.2]}>
        <sphereGeometry args={[1.1, 12, 10]} />
        <meshStandardMaterial color="#0EA5E9" metalness={0.9} roughness={0.05} transparent opacity={0.85} />
      </mesh>
      {/* Tail boom */}
      <mesh position={[0, 0.3, -4.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.5, 5, 8]} />
        <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.2, -6.4]}>
        <boxGeometry args={[0.15, 1.8, 1.2]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      {/* Main rotor */}
      <mesh ref={rotor} position={[0, 1.9, 0]}>
        <boxGeometry args={[11, 0.08, 0.5]} />
        <meshStandardMaterial color="#334155" transparent opacity={0.7} />
      </mesh>
      {/* Tail rotor */}
      <mesh ref={tailRotor} position={[0.3, 1.2, -6.6]}>
        <boxGeometry args={[0.08, 2.2, 0.3]} />
        <meshStandardMaterial color="#334155" transparent opacity={0.7} />
      </mesh>
      {/* Skids */}
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, -1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 4.5, 6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      ))}
      {/* Strobe */}
      <mesh position={[0, 0.9, -1.5]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial ref={strobe} color="#7F1D1D" emissive="#EF4444" emissiveIntensity={4} />
      </mesh>
      {/* Spotlight beam pointing down at the streets */}
      <mesh position={[0, -60, 0]}>
        <coneGeometry args={[14, 120, 14, 1, true]} />
        <meshBasicMaterial
          color="#FFF7ED"
          transparent
          opacity={0.07}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 7. Manhole steam vents — drifting particle plumes at street level.
// ---------------------------------------------------------------------------
export const SteamVents3D: React.FC = () => {
  const VENTS: Array<[number, number]> = [
    [-6, -30],
    [5, -72],
    [-3, -118],
    [7, -160],
    [-42, -60],
    [43, -140],
  ];
  const PER_VENT = 40;
  const total = VENTS.length * PER_VENT;
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(total * 3);
    const seedArr = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      seedArr[i] = seededRandom(i * 1.17 + 0.5);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geometry: geom, seeds: seedArr };
  }, [total]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let v = 0; v < VENTS.length; v++) {
      const [vx, vz] = VENTS[v];
      for (let p = 0; p < PER_VENT; p++) {
        const i = v * PER_VENT + p;
        const s = seeds[i];
        const life = (t * 0.35 + s) % 1; // 0..1 rising
        const spread = life * 3.5;
        pos.setXYZ(
          i,
          vx + Math.sin(s * 40 + t * 0.6) * spread,
          0.2 + life * 9,
          vz + Math.cos(s * 55 + t * 0.5) * spread
        );
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#CBD5E1"
        size={1.6}
        sizeAttenuation
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </points>
  );
};

// ---------------------------------------------------------------------------
// 8. Low cloud deck / haze layer drifting between the towers.
// ---------------------------------------------------------------------------
export const CloudDeck3D: React.FC = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = Math.sin(clock.getElapsedTime() * 0.03) * 12;
  });
  const slabs = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        x: -90 + seededRandom(i * 9.1) * 180,
        y: 95 + seededRandom(i * 3.3) * 60,
        z: -190 + seededRandom(i * 5.7) * 220,
        w: 70 + seededRandom(i * 2.2) * 80,
        rot: seededRandom(i * 7.7) * Math.PI,
      })),
    []
  );
  return (
    <group ref={ref}>
      {slabs.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} rotation={[-Math.PI / 2, 0, s.rot]}>
          <planeGeometry args={[s.w, s.w * 0.55]} />
          <meshBasicMaterial
            color="#94A3B8"
            transparent
            opacity={0.05}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

/** Convenience wrapper: everything that makes the city feel alive. */
export const CityStreetLife3D: React.FC = () => (
  <group>
    <DistantSkyline3D />
    <StreetFurniture3D />
    <StreetTraffic3D />
    <FireEscapes3D />
    <Searchlights3D />
    <PoliceHelicopter3D />
    <SteamVents3D />
    <CloudDeck3D />
  </group>
);
