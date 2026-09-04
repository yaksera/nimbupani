"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type IntroState = {
  /** True once the loading mask has opened. Hero waits for this. */
  introDone: boolean;
  finishIntro: () => void;
};

const IntroContext = createContext<IntroState>({
  introDone: true,
  finishIntro: () => {},
});

/** Hands the hero a single, reliable "you may start now" signal. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);
  const value = useMemo(
    () => ({ introDone, finishIntro }),
    [introDone, finishIntro],
  );
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  return useContext(IntroContext);
}
