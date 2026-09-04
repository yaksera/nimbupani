"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MotionPreferenceState = {
  /** True when the visitor has asked the OS for reduced motion. */
  reducedMotion: boolean;
  /** True below the 768px breakpoint — drives the cheap-motion branch. */
  isMobile: boolean;
  /** Touch / pen primary input: no hover parallax, larger hit areas. */
  isCoarsePointer: boolean;
  /** False during the first client render so SSR and hydration always agree. */
  hydrated: boolean;
};

const defaultState: MotionPreferenceState = {
  reducedMotion: false,
  isMobile: false,
  isCoarsePointer: false,
  hydrated: false,
};

const MotionPreferenceContext =
  createContext<MotionPreferenceState>(defaultState);

/**
 * One place that answers "how much motion is this visitor allowed?".
 * Every animated component reads from here instead of querying matchMedia
 * itself, so the answer can never drift between components.
 */
export function MotionPreferences({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MotionPreferenceState>(defaultState);

  useEffect(() => {
    const queries = {
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)"),
      isMobile: window.matchMedia("(max-width: 767px)"),
      isCoarsePointer: window.matchMedia("(pointer: coarse)"),
    };

    const sync = () =>
      setState({
        reducedMotion: queries.reducedMotion.matches,
        isMobile: queries.isMobile.matches,
        isCoarsePointer: queries.isCoarsePointer.matches,
        hydrated: true,
      });

    sync();

    const listeners = Object.values(queries);
    listeners.forEach((q) => q.addEventListener("change", sync));
    return () => listeners.forEach((q) => q.removeEventListener("change", sync));
  }, []);

  const value = useMemo(() => state, [state]);

  return (
    <MotionPreferenceContext.Provider value={value}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreferences() {
  return useContext(MotionPreferenceContext);
}
