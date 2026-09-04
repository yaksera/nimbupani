"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A WebGL canvas should only cost battery while it is both on screen and in a
 * visible tab. Returns the R3F `frameloop` value plus the ref to observe.
 */
export function useCanvasActive<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const active = enabled && onScreen && tabVisible;
  const frameloop: "always" | "never" = active ? "always" : "never";
  return { ref, active, frameloop };
}
