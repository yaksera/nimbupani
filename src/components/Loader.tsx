"use client";

import { useEffect, useRef, useState } from "react";

import { useIntro } from "@/components/IntroProvider";
import { useMotionPreferences } from "@/components/MotionPreferences";
import { assets } from "@/lib/site.config";
import { gsap } from "@/lib/gsap";

/** Assets that must be decoded before the hero is worth revealing. */
const CRITICAL = [assets.environment.src, assets.bottle.src];

/** Hard ceiling — the reveal never waits longer than this, ready or not. */
const MAX_WAIT_MS = 1200;
const MIN_WAIT_MS = 420;

export function Loader() {
  const { finishIntro } = useIntro();
  const { reducedMotion, hydrated } = useMotionPreferences();
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    const root = rootRef.current;
    if (!root) {
      finishIntro();
      setGone(true);
      return;
    }

    document.documentElement.style.overflow = "hidden";

    const start = performance.now();
    let cancelled = false;

    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
        if (img.complete) resolve();
      });

    const ready = Promise.race([
      Promise.all(CRITICAL.map(preload)),
      new Promise((resolve) => window.setTimeout(resolve, MAX_WAIT_MS)),
    ]);

    // 0 → 100 counter. Eases toward 92 while waiting, then snaps home.
    const progress = { value: 0 };
    const counterTween = gsap.to(progress, {
      value: 92,
      duration: MAX_WAIT_MS / 1000,
      ease: "power2.out",
      onUpdate: () => {
        if (counterRef.current)
          counterRef.current.textContent = String(Math.round(progress.value));
      },
    });

    const release = () => {
      if (cancelled) return;
      counterTween.kill();

      const done = () => {
        document.documentElement.style.removeProperty("overflow");
        finishIntro();
        setGone(true);
      };

      if (reducedMotion) {
        if (counterRef.current) counterRef.current.textContent = "100";
        gsap.to(root, { autoAlpha: 0, duration: 0.2, onComplete: done });
        return;
      }

      const tl = gsap.timeline({ onComplete: done });
      tl.to(progress, {
        value: 100,
        duration: 0.24,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current)
            counterRef.current.textContent = String(Math.round(progress.value));
        },
      })
        .to(
          root.querySelectorAll<HTMLElement>("[data-loader-fade]"),
          { autoAlpha: 0, y: -8, duration: 0.24, stagger: 0.04 },
          "-=0.06",
        )
        // The lime ring becomes the mask: it scales out while the deep-forest
        // panel is punched open from the same centre, in the same curve.
        .to(
          ringRef.current,
          { scale: 34, opacity: 0, duration: 0.72, ease: "aperture" },
          "<",
        )
        .to(
          root,
          {
            "--reveal": "132%",
            duration: 0.72,
            ease: "aperture",
          },
          "<",
        );
    };

    ready.then(() => {
      const elapsed = performance.now() - start;
      window.setTimeout(release, Math.max(0, MIN_WAIT_MS - elapsed));
    });

    return () => {
      cancelled = true;
      counterTween.kill();
      document.documentElement.style.removeProperty("overflow");
    };
  }, [finishIntro, hydrated, reducedMotion]);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] grid place-items-center bg-forest"
      style={
        {
          "--reveal": "0%",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, transparent var(--reveal), #000 calc(var(--reveal) + 0.5%))",
          maskImage:
            "radial-gradient(circle at 50% 50%, transparent var(--reveal), #000 calc(var(--reveal) + 0.5%))",
        } as React.CSSProperties
      }
    >
      <div
        ref={ringRef}
        aria-hidden="true"
        className="absolute size-24 rounded-full border border-lime/70"
      />
      <div className="relative flex flex-col items-center gap-4">
        <span
          data-loader-fade
          className="t-eyebrow text-cream/55"
          aria-hidden="true"
        >
          Nimbu Paani
        </span>
        <p
          data-loader-fade
          role="status"
          aria-live="polite"
          className="font-display text-5xl tabular-nums text-lime"
        >
          <span ref={counterRef}>0</span>
          <span className="sr-only">% loaded</span>
        </p>
      </div>
    </div>
  );
}
