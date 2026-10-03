# React 19 & React Compiler Engineering Standards

## 1. Component Purity & Idempotence
- Never call impure functions (`Math.random()`, `Date.now()`, `crypto.getRandomValues()`) directly in render functions or `useMemo` blocks.
- When generating visual variations (e.g. 3D geometry coordinates, rotation, particle sizes), use deterministic index-based algorithms or seeded pseudo-random formulas:
  ```ts
  function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  ```

## 2. Client Hydration Detection
- Do not use `useState(false)` + `useEffect(() => setMounted(true), [])` to detect client mounting. This causes cascading re-renders flagged by React Compiler.
- Always prefer `useSyncExternalStore`:
  ```ts
  const emptySubscribe = () => () => {};
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  ```

## 3. JSX Text Invariants
- Never place unescaped `//` or `/* */` characters as raw JSX child text.
- Always encapsulate them in string literals:
  ```tsx
  {/* Correct */}
  <span>{`// ${id}`}</span>
  
  {/* Incorrect (Triggers JSX parser error) */}
  <span>// {id}</span>
  ```

## 4. Web Audio API Typing
- Avoid using `(window as any).webkitAudioContext`.
- Type window properly with an interface:
  ```ts
  interface WindowWithAudio extends Window {
    webkitAudioContext?: typeof AudioContext;
  }
  const AudioCtx = window.AudioContext || (window as unknown as WindowWithAudio).webkitAudioContext;
  ```
