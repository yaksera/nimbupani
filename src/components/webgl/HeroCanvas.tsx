"use client";

import { Canvas } from "@react-three/fiber";

import { useMotionPreferences } from "@/components/MotionPreferences";
import { BubbleField } from "@/components/webgl/BubbleField";
import { useCanvasActive } from "@/components/webgl/useCanvasActive";

/**
 * Carbonation behind the product. Purely atmospheric: it carries no
 * information, sits behind the bottle and is hidden from assistive tech.
 */
export default function HeroCanvas() {
  const { isMobile, reducedMotion } = useMotionPreferences();
  const { ref, frameloop } = useCanvasActive<HTMLDivElement>(!reducedMotion);

  if (reducedMotion) return null;

  return (
    <div ref={ref} aria-hidden="true" className="stack-layer">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ pointerEvents: "none" }}
      >
        <BubbleField
          count={isMobile ? 24 : 70}
          spread={isMobile ? 2.4 : 3.4}
          speed={isMobile ? 0.85 : 1}
        />
      </Canvas>
    </div>
  );
}
