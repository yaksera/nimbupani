"use client";

import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { useMotionPreferences } from "@/components/MotionPreferences";
import { useCanvasActive } from "@/components/webgl/useCanvasActive";

export type OrbitState = {
  /** 0 → 1, written by the section's ScrollTrigger. Opens the cluster. */
  open: number;
  /** Radians, clamped to ±12°, written by pointer drag. */
  yaw: number;
  pitch: number;
};

const MAX_ORBIT = THREE.MathUtils.degToRad(12);

/* -------------------------------------------------------------------------
   A mint leaf drawn in the fragment shader: no texture, no transparency
   sorting headaches beyond one alpha test, and it scales to any DPR.
------------------------------------------------------------------------- */
const leafVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const leafFragment = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform vec3 uVein;
  uniform float uOpacity;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float halfWidth = pow(max(0.0, 1.0 - abs(p.y)), 0.55) * 0.86;
    float body = smoothstep(halfWidth, halfWidth - 0.06, abs(p.x));
    if (body < 0.02) discard;

    float vein = smoothstep(0.045, 0.0, abs(p.x)) * 0.5;
    float ribs = smoothstep(0.03, 0.0, abs(abs(p.x) - abs(p.y) * 0.42)) * 0.18;
    float shade = 0.75 + 0.25 * (1.0 - abs(p.x));

    vec3 color = mix(uColor * shade, uVein, vein + ribs);
    gl_FragColor = vec4(color, body * uOpacity);
  }
`;

function MintLeaf({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#4aa25c") },
      uVein: { value: new THREE.Color("#b6ec8e") },
      uOpacity: { value: 0.88 },
    }),
    [],
  );

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1.55, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={leafVertex}
        fragmentShader={leafFragment}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function LimeSphere({
  position,
  radius,
}: {
  position: [number, number, number];
  radius: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 24]} />
      <meshStandardMaterial
        color="#a8d21f"
        roughness={0.55}
        metalness={0}
        emissive="#3f6b12"
        emissiveIntensity={0.22}
        flatShading={false}
      />
    </mesh>
  );
}

function Bead({
  position,
  radius,
  cheap,
}: {
  position: [number, number, number];
  radius: number;
  cheap: boolean;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, cheap ? 16 : 32, cheap ? 12 : 24]} />
      {cheap ? (
        // Mobile: no refraction pass at all, just a tinted translucent shell.
        <meshBasicMaterial
          color="#e6ffd9"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      ) : (
        <meshPhysicalMaterial
          color="#f2fff0"
          transmission={0.94}
          thickness={radius * 1.4}
          roughness={0.06}
          ior={1.33}
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      )}
    </mesh>
  );
}

type ClusterProps = {
  state: RefObject<OrbitState>;
  cheap: boolean;
};

function Cluster({ state, cheap }: ClusterProps) {
  const group = useRef<THREE.Group>(null);
  const shells = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    const limes: Array<{ p: [number, number, number]; r: number }> = [
      { p: [-0.95, 0.35, 0.2], r: 0.42 },
      { p: [0.9, -0.15, -0.35], r: 0.52 },
      { p: [0.15, 0.95, -0.1], r: 0.3 },
    ];
    const leaves: Array<{
      p: [number, number, number];
      rot: [number, number, number];
      s: number;
    }> = [
      { p: [-0.65, -0.95, 0.35], rot: [0.2, -0.3, 0.6], s: 0.8 },
      { p: [1.25, 0.8, 0.1], rot: [-0.25, 0.4, -0.5], s: 0.68 },
      { p: [-1.45, 0.15, -0.5], rot: [0.1, 0.6, 1.1], s: 0.6 },
    ];
    const beads: Array<{ p: [number, number, number]; r: number }> = (
      cheap
        ? [
            [0.55, 0.6, 0.6],
            [-0.5, 0.15, 0.75],
            [0.2, -0.75, 0.5],
          ]
        : [
            [0.55, 0.6, 0.6],
            [-0.5, 0.15, 0.75],
            [0.2, -0.75, 0.5],
            [1.1, -0.7, 0.3],
            [-1.05, 0.85, 0.4],
            [0.05, 0.25, 1.0],
          ]
    ).map((p, i) => ({
      p: p as [number, number, number],
      r: 0.12 + (i % 3) * 0.05,
    }));

    return { limes, leaves, beads };
  }, [cheap]);

  useFrame((_, delta) => {
    const t = Math.min(delta, 0.05);
    const s = state.current;

    if (group.current) {
      group.current.rotation.y +=
        (THREE.MathUtils.clamp(s.yaw, -MAX_ORBIT, MAX_ORBIT) -
          group.current.rotation.y) *
        Math.min(1, t * 6);
      group.current.rotation.x +=
        (THREE.MathUtils.clamp(s.pitch, -MAX_ORBIT, MAX_ORBIT) -
          group.current.rotation.x) *
        Math.min(1, t * 6);
    }

    if (shells.current) {
      // The cluster opens outward, it does not spin.
      const target = 1 + s.open * 0.62;
      shells.current.scale.lerp(
        new THREE.Vector3(target, target, target),
        Math.min(1, t * 5),
      );
    }
  });

  return (
    <group ref={group} scale={cheap ? 0.5 : 0.66}>
      <group ref={shells}>
        {items.limes.map((lime, i) => (
          <LimeSphere key={`lime-${i}`} position={lime.p} radius={lime.r} />
        ))}
        {items.leaves.map((leaf, i) => (
          <MintLeaf
            key={`leaf-${i}`}
            position={leaf.p}
            rotation={leaf.rot}
            scale={leaf.s}
          />
        ))}
        {items.beads.map((bead, i) => (
          <Bead key={`bead-${i}`} position={bead.p} radius={bead.r} cheap={cheap} />
        ))}
      </group>
    </group>
  );
}

export default function IngredientCanvas({
  state,
}: {
  state: RefObject<OrbitState>;
}) {
  const { isMobile, reducedMotion } = useMotionPreferences();
  const { ref, frameloop } = useCanvasActive<HTMLDivElement>(!reducedMotion);

  if (reducedMotion) return null;

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8.6], fov: 34 }}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "low-power" }}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 4, 5]} intensity={2.1} color="#ffffff" />
        <directionalLight
          position={[-4, -2, 2]}
          intensity={0.9}
          color="#c7ff24"
        />
        <Cluster state={state} cheap={isMobile} />
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}
