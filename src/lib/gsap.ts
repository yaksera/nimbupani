"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP owns every scroll-driven transform on this page. Plugins and the
 * house easing curves are registered exactly once, from one module, so no
 * component has to think about it.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // Signature curves — deliberately not GSAP defaults.
  CustomEase.create("chill", "M0,0 C0.22,1 0.36,1 1,1"); // cubic-bezier(.22,1,.36,1)
  CustomEase.create("squeeze", "M0,0 C0.65,0 0.35,1 1,1"); // cubic-bezier(.65,0,.35,1)
  CustomEase.create("overshoot", "M0,0 C0.34,1.4 0.44,1 1,1"); // confident, single overshoot
  CustomEase.create("aperture", "M0,0 C0.16,1 0.3,1 1,1");

  gsap.defaults({ ease: "chill" });
}

export const EASE = {
  chill: "chill",
  squeeze: "squeeze",
  overshoot: "overshoot",
  aperture: "aperture",
} as const;

export { gsap, ScrollTrigger };
