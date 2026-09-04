"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useMotionPreferences } from "@/components/MotionPreferences";
import type { OrbitState } from "@/components/webgl/IngredientCanvas";
import { assets, siteConfig } from "@/lib/site.config";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const IngredientCanvas = dynamic(
  () => import("@/components/webgl/IngredientCanvas"),
  { ssr: false },
);

/** One cheap probe, run once per page and then memoised. */
let webglSupport: boolean | undefined;
function supportsWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext("webgl2") || canvas.getContext("webgl")),
      );
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

const noopSubscribe = () => () => {};
/** Server (and first client render) always answers "no": the DOM fallback is
 *  what gets sent down the wire, and it is replaced only if WebGL is real. */
const serverSnapshot = () => false;

/**
 * Static composition shown when WebGL is unavailable or motion is reduced.
 * It carries the same idea — ingredients arranged around the line — using the
 * transparent ingredient and ice assets, and it is never the only source of
 * information on screen.
 */
function IngredientFallback() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[6%] left-1/2 w-[74vw] max-w-[720px] -translate-x-1/2 opacity-70 mix-blend-multiply md:w-[36vw]">
        <Image
          src={assets.limeMint.src}
          alt=""
          width={assets.limeMint.width}
          height={assets.limeMint.height}
          sizes="(max-width: 768px) 74vw, 36vw"
          quality={75}
          className="h-auto w-full"
        />
      </div>
      <div className="absolute -bottom-[8%] left-1/2 w-[86vw] max-w-[760px] -translate-x-1/2 opacity-45 mix-blend-multiply md:w-[40vw]">
        <Image
          src={assets.ice.src}
          alt=""
          width={assets.ice.width}
          height={assets.ice.height}
          sizes="(max-width: 768px) 86vw, 40vw"
          quality={70}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

export function IngredientScene() {
  const { ingredients } = siteConfig;
  const { reducedMotion, hydrated, isCoarsePointer } = useMotionPreferences();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const state = useRef<OrbitState>({ open: 0, yaw: 0, pitch: 0 });
  const [nearStage, setNearStage] = useState(false);
  const webgl = useSyncExternalStore(
    noopSubscribe,
    supportsWebGL,
    serverSnapshot,
  );

  // The canvas chunk is requested only when the section is one screen away.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearStage(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  // Scroll opens the cluster; the same trigger is the only writer of `open`.
  useEffect(() => {
    if (!hydrated || reducedMotion) return;
    const stage = stageRef.current;
    if (!stage) return;

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        state.current.open = gsap.utils.clamp(
          0,
          1,
          (self.progress - 0.22) / 0.36,
        );
      },
    });

    return () => trigger.kill();
  }, [hydrated, reducedMotion]);

  // Reveal of the line itself. DOM text, always in the accessibility tree.
  useEffect(() => {
    if (!hydrated) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.fromTo(
          "[data-orbit-line] > span, [data-orbit-hint]",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.05,
            scrollTrigger: { trigger: section, start: "top 80%" },
          },
        );
        return;
      }

      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top 55%", once: true },
        })
        .fromTo(
          "[data-orbit-line] > span",
          { yPercent: 118 },
          { yPercent: 0, duration: 1, stagger: 0.09, ease: "chill" },
        )
        .fromTo(
          "[data-orbit-hint]",
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.4",
        );
    }, section);

    return () => ctx.revert();
  }, [hydrated, reducedMotion]);

  // Clamped drag orbit. Vertical scrolling is never captured.
  useEffect(() => {
    if (!hydrated || reducedMotion) return;
    const stage = stageRef.current;
    if (!stage) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let baseYaw = 0;
    let basePitch = 0;

    const onDown = (event: PointerEvent) => {
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      baseYaw = state.current.yaw;
      basePitch = state.current.pitch;
      stage.setPointerCapture?.(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      const rect = stage.getBoundingClientRect();
      state.current.yaw =
        baseYaw + ((event.clientX - startX) / rect.width) * 0.8;
      // On touch the vertical axis belongs to the page, never to the cluster.
      if (event.pointerType !== "touch") {
        state.current.pitch =
          basePitch + ((event.clientY - startY) / rect.height) * 0.5;
      }
    };

    const onUp = (event: PointerEvent) => {
      dragging = false;
      stage.releasePointerCapture?.(event.pointerId);
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
    };
  }, [hydrated, reducedMotion]);

  const showCanvas = webgl && !reducedMotion && hydrated && nearStage;

  return (
    <section
      ref={sectionRef}
      id="ingredients"
      className="relative overflow-hidden bg-cream text-forest"
    >
      <div
        ref={stageRef}
        className="relative grid h-[100svh] min-h-[34rem] w-full place-items-center [touch-action:pan-y]"
      >
        {showCanvas ? (
          <IngredientCanvas state={state} />
        ) : (
          <IngredientFallback />
        )}

        <div className="shell relative z-10 text-center">
          <h2 className="t-xl mx-auto max-w-[14ch]">
            {ingredients.headline.map((line, i) => (
              <Fragment key={line}>
                {i > 0 ? " " : null}
                <span data-orbit-line className="line-mask">
                  <span className="block">{line}</span>
                </span>
              </Fragment>
            ))}
          </h2>
        </div>

        <p
          data-orbit-hint
          className="t-eyebrow absolute bottom-[clamp(1.5rem,5vh,3rem)] left-1/2 -translate-x-1/2 text-forest/45 opacity-0"
        >
          {showCanvas
            ? isCoarsePointer
              ? "Drag to explore"
              : "Drag to look around"
            : siteConfig.brand.tagline}
        </p>
      </div>
    </section>
  );
}
