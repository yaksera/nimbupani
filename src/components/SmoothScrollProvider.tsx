"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotionPreferences } from "@/components/MotionPreferences";

type ScrollApi = {
  /** Scroll to an element or offset, honouring reduced motion. */
  scrollTo: (target: string | number | HTMLElement) => void;
  /** Freeze the page behind the mobile menu. */
  lock: () => void;
  unlock: () => void;
};

const ScrollContext = createContext<ScrollApi | null>(null);

/**
 * Lenis does one job: interpolate the scroll position. It never animates
 * anything itself. It is wired into the GSAP ticker (single RAF loop for the
 * whole page) and pushes ScrollTrigger.update on every frame so pinned
 * sections stay perfectly in sync with the smoothed position.
 *
 * With prefers-reduced-motion the instance is never created and the browser's
 * native scrolling is used untouched.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const { reducedMotion, hydrated } = useMotionPreferences();

  useEffect(() => {
    if (!hydrated) return;

    if (reducedMotion) {
      // Native scroll only. Still let ScrollTrigger measure the page.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      // Matches --ease-chill so smoothing and animation feel like one system.
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
      smoothWheel: true,
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // One RAF loop for the page: GSAP drives Lenis, not the other way round.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion, hydrated]);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, {
          offset: typeof target === "number" ? 0 : -8,
          duration: 1.1,
        });
        return;
      }
      // Reduced-motion / pre-init fallback.
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "auto" });
        return;
      }
      const el =
        typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reducedMotion],
  );

  const lock = useCallback(() => {
    lenisRef.current?.stop();
    document.documentElement.style.setProperty("overflow", "hidden");
  }, []);

  const unlock = useCallback(() => {
    lenisRef.current?.start();
    document.documentElement.style.removeProperty("overflow");
  }, []);

  return (
    <ScrollContext.Provider value={{ scrollTo, lock, unlock }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useSmoothScroll(): ScrollApi {
  const ctx = useContext(ScrollContext);
  if (ctx) return ctx;
  // Safe no-op shape so consumers never need a null check.
  return {
    scrollTo: (target) => {
      if (typeof target === "number") window.scrollTo({ top: target });
      else
        (typeof target === "string"
          ? document.querySelector(target)
          : target
        )?.scrollIntoView();
    },
    lock: () => {},
    unlock: () => {},
  };
}
