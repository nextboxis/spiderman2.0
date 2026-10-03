# Three.js & React Three Fiber SSR Architecture Standards

## Scope & Objective
When integrating 3D WebGL scenes using Three.js and `@react-three/fiber` in Next.js App Router (React 19), developers and agents must adhere to strict leaf-level encapsulation and geometry standards to prevent SSR hydration errors and JSX type collisions.

---

## 1. Strict Leaf-Level `<Canvas>` Encapsulation
- **Do not export naked R3F scene components** that require the parent page or higher-level UI container to import or render `<Canvas>`.
- **Always encapsulate `<Canvas>` inside the dedicated 3D component file**:
  ```tsx
  // Inner Scene (uses useFrame, useThree, 3D meshes)
  const MySceneInner: React.FC<Props> = (props) => { ... };

  // Exported Leaf Component (encapsulates Canvas)
  export const MyScene3D: React.FC<Props> = (props) => (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <MySceneInner {...props} />
      </Canvas>
    </div>
  );
  ```
- **Consume via `next/dynamic` with `ssr: false`**:
  Parent containers must load the 3D leaf component dynamically:
  ```tsx
  const MyScene3D = dynamic(
    () => import('./MyScene3D').then((mod) => mod.MyScene3D),
    { ssr: false, loading: () => <FallbackLoading /> }
  );
  ```
  This guarantees that WebGL contexts, canvas DOM elements, and Three.js fiber reconcilers are never evaluated during server rendering, preventing hydration mismatches.

---

## 2. Standard 3D Mesh Geometries Over Ambiguous Primitives
- In React 19 JSX namespaces, raw `<line>` elements can conflict with SVG `<line>` type definitions.
- To represent 3D cables, web strands, or laser beams, prefer a dynamic 3D cylinder mesh oriented along the target direction:
  ```tsx
  <mesh ref={cylinderRef} visible={false}>
    <cylinderGeometry args={[radius, radius, 1, 8]} />
    <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.8} />
  </mesh>
  ```
  Update position to the midpoint, scale Y to distance, and quaternion via:
  ```typescript
  const dir = new THREE.Vector3().subVectors(target, origin).normalize();
  const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  mesh.quaternion.copy(orientation);
  ```
  This avoids JSX collisions, renders with true 3D depth and thickness on all GPU backends, and supports specular and emissive lighting.
