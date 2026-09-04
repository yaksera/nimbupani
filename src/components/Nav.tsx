"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useMotionPreferences } from "@/components/MotionPreferences";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";
import { siteConfig } from "@/lib/site.config";

/**
 * Framer Motion owns the navigation and the mobile menu — and nothing else.
 * No GSAP tween ever touches these nodes, so the two libraries can never
 * fight over the same transform.
 */
export function Nav() {
  const { nav, brand } = siteConfig;
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);
  const { reducedMotion } = useMotionPreferences();
  const { scrollTo, lock, unlock } = useSmoothScroll();

  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useMotionValueEvent(scrollY, "change", (y) => {
    setCondensed(y > 40);
  });

  const close = useCallback(() => setOpen(false), []);

  const go = useCallback(
    (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href.startsWith("#")) return;
      event.preventDefault();
      close();
      // Let the menu finish collapsing before the page moves.
      window.setTimeout(() => scrollTo(href), open ? 260 : 0);
    },
    [close, open, scrollTo],
  );

  // Scroll lock + focus management for the full-screen menu.
  useEffect(() => {
    if (!open) return;

    lock();
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    window.setTimeout(() => focusables()[0]?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlock();
      (previouslyFocused ?? toggle)?.focus?.();
    };
  }, [open, lock, unlock, close]);

  const duration = reducedMotion ? 0.12 : 0.5;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[120]">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 border-b border-cream/10 bg-forest/70 backdrop-blur-xl"
        initial={false}
        animate={{ opacity: condensed && !open ? 1 : 0 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      />

      <nav
        aria-label="Primary"
        className="shell pointer-events-auto relative flex h-[var(--nav-h)] items-center justify-between gap-6"
      >
        <a
          href="#hero"
          onClick={go("#hero")}
          className="group flex items-baseline gap-2 leading-none"
        >
          <span className="font-display text-[0.95rem] tracking-[-0.02em] text-cream uppercase">
            {brand.wordmark}
          </span>
          <span
            aria-hidden="true"
            className="hidden h-1.5 w-1.5 rounded-full bg-lime transition-transform duration-500 group-hover:scale-150 sm:block"
          />
          <span className="sr-only">— home</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={go(link.href)}
                className="t-eyebrow relative text-cream/70 transition-colors duration-300 hover:text-cream"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={nav.cta.href}
            onClick={go(nav.cta.href)}
            className="btn btn-lime hidden md:inline-flex"
          >
            {nav.cta.label}
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={menuId}
            className="relative z-10 grid size-11 place-items-center rounded-full border border-cream/25 text-cream md:hidden"
          >
            <span className="sr-only">
              {open ? "Close menu" : "Open menu"}
            </span>
            <span aria-hidden="true" className="relative block h-3 w-5">
              <motion.span
                className="absolute left-0 block h-px w-5 bg-current"
                animate={
                  open ? { top: 6, rotate: 45 } : { top: 0, rotate: 0 }
                }
                transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="absolute left-0 block h-px w-5 bg-current"
                animate={
                  open ? { top: 6, rotate: -45 } : { top: 12, rotate: 0 }
                }
                transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="pointer-events-auto fixed inset-0 z-[-1] flex flex-col justify-between bg-forest px-6 pt-[calc(var(--nav-h)+2rem)] pb-10 md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reducedMotion ? 0.12 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="flex flex-col gap-2">
              {nav.links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{
                    duration: reducedMotion ? 0.12 : 0.5,
                    delay: reducedMotion ? 0 : 0.12 + i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="border-b border-cream/10"
                >
                  <a
                    href={link.href}
                    onClick={go(link.href)}
                    className="t-lg block py-4 text-cream"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col gap-4">
              <a
                href={nav.cta.href}
                onClick={go(nav.cta.href)}
                className="btn btn-lime justify-center"
              >
                {nav.cta.label}
              </a>
              <p className="t-eyebrow text-cream/40">{brand.tagline}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
