"use client";

import { useEffect, useRef } from "react";

import { useMotionPreferences } from "@/components/MotionPreferences";
import { siteConfig } from "@/lib/site.config";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const COPIES = 3;

/**
 * Kinetic type, kept typographic. The first run of words is the real content;
 * the duplicates exist only to make the loop seamless and are hidden from
 * assistive technology. It slows, speeds and briefly reverses with scroll
 * velocity, and stops entirely on hover, on focus and in a hidden tab.
 */
export function FlavorTicker() {
  const { reducedMotion, hydrated } = useMotionPreferences();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated || reducedMotion) return;
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const loop = gsap.to(track, {
      xPercent: -100 / COPIES,
      duration: 26,
      ease: "none",
      repeat: -1,
    });

    let paused = false;
    const pause = () => {
      paused = true;
      loop.pause();
    };
    const resume = () => {
      paused = false;
      if (!document.hidden) loop.play();
    };

    // Scroll velocity nudges the speed and can flip the direction briefly.
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        const boost = gsap.utils.clamp(0.5, 3.4, 1 + Math.abs(velocity) / 1400);
        gsap.to(loop, {
          timeScale: (self.direction < 0 ? -1 : 1) * boost,
          duration: 0.45,
          overwrite: true,
        });
      },
    });

    const onVisibility = () => {
      if (document.hidden) loop.pause();
      else if (!paused) loop.play();
    };

    root.addEventListener("pointerenter", pause);
    root.addEventListener("pointerleave", resume);
    root.addEventListener("focusin", pause);
    root.addEventListener("focusout", resume);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      root.removeEventListener("pointerenter", pause);
      root.removeEventListener("pointerleave", resume);
      root.removeEventListener("focusin", pause);
      root.removeEventListener("focusout", resume);
      document.removeEventListener("visibilitychange", onVisibility);
      trigger.kill();
      loop.kill();
    };
  }, [hydrated, reducedMotion]);

  const run = siteConfig.ticker.words;

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden border-y border-forest/15 bg-cream py-[clamp(1.1rem,2.4vh,2rem)] text-forest select-none"
    >
      <div
        ref={trackRef}
        className="ticker-track flex w-max items-center will-change-transform"
      >
        {Array.from({ length: COPIES }).map((_, copy) => (
          <ul
            key={copy}
            className="flex items-center"
            aria-hidden={copy > 0 ? "true" : undefined}
          >
            {run.map((word) => (
              <li
                key={`${copy}-${word}`}
                className="t-lg flex items-center whitespace-nowrap"
              >
                <span className={copy % 2 === 1 ? "t-outline outline-forest" : undefined}>
                  {word}
                </span>
                <span
                  aria-hidden="true"
                  className="mx-[clamp(1rem,2.4vw,2.6rem)] inline-block size-[0.34em] rounded-full bg-signal"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
