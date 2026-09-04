"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Rising carbonation. One instanced draw call: every bubble's position is
 * solved in the vertex shader from a per-instance seed, so animating a few
 * hundred of them costs one uniform update per frame on the CPU.
 */
const vertexShader = /* glsl */ `
  attribute vec4 aSeed; // x: lane, y: phase, z: speed, w: radius
  uniform float uTime;
  uniform float uSpread;
  varying vec2 vUv;
  varying float vFade;

  void main() {
    vUv = uv;
    float t = fract(aSeed.y + uTime * aSeed.z);

    vec3 offset;
    offset.x = aSeed.x * uSpread + sin((t + aSeed.y) * 6.2831853) * 0.22;
    offset.y = mix(-3.4, 3.6, t);
    offset.z = (aSeed.y - 0.5) * 3.2;

    vec4 mv = modelViewMatrix * vec4(offset, 1.0);
    mv.xy += position.xy * aSeed.w;

    vFade = smoothstep(0.0, 0.14, t) * (1.0 - smoothstep(0.78, 1.0, t));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uRim;
  varying vec2 vUv;
  varying float vFade;

  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p) * 2.0;
    if (d > 1.0) discard;

    // Thin refractive shell + a single specular pop, no texture fetch.
    float rim = smoothstep(1.0, 0.88, d) * smoothstep(0.6, 0.92, d);
    float body = smoothstep(1.0, 0.0, d) * 0.07;
    float spec = smoothstep(0.2, 0.0, length(p - vec2(-0.15, 0.15))) * 0.5;

    float alpha = (rim * 0.9 + body + spec) * vFade;
    if (alpha < 0.003) discard;

    vec3 color = mix(uColor, uRim, rim);
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Tiny deterministic PRNG (mulberry32) — no Math.random during render. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Props = {
  count: number;
  spread?: number;
  color?: string;
  rim?: string;
  speed?: number;
};

export function BubbleField({
  count,
  spread = 3.2,
  color = "#eafff2",
  rim = "#c7ff24",
  speed = 1,
}: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const seeds = useMemo(() => {
    // Seeded, so the field is identical on every render and every device:
    // the scatter is art-directed noise, not a lottery.
    const random = mulberry32(0x1e5cf1);
    const array = new Float32Array(count * 4);
    for (let i = 0; i < count; i += 1) {
      array[i * 4 + 0] = random() * 2 - 1; // lane
      array[i * 4 + 1] = random(); // phase / depth
      array[i * 4 + 2] = (0.035 + random() * 0.075) * speed; // rise speed
      array[i * 4 + 3] = 0.035 + random() * 0.14; // radius
    }
    return array;
  }, [count, speed]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpread: { value: spread },
      uColor: { value: new THREE.Color(color) },
      uRim: { value: new THREE.Color(rim) },
    }),
    [color, rim, spread],
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      // Clamp delta so a backgrounded tab never fast-forwards the field.
      materialRef.current.uniforms.uTime.value += Math.min(delta, 0.05);
    }
  });

  return (
    <instancedMesh args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]}>
        <instancedBufferAttribute
          attach="attributes-aSeed"
          args={[seeds, 4]}
          usage={THREE.StaticDrawUsage}
        />
      </planeGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
