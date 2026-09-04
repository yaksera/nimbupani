"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { useIntro } from "@/components/IntroProvider";
import { useMotionPreferences } from "@/components/MotionPreferences";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";
import { assets, siteConfig } from "@/lib/site.config";
import { gsap } from "@/lib/gsap";

// WebGL is never part of the first payload and never rendered on the server.
const HeroCanvas = dynamic(() => import("@/components/webgl/HeroCanvas"), {
  ssr: false,
});

export function Hero() {
  const { hero } = siteConfig;
  const { introDone } = useIntro();
  const { reducedMotion, isCoarsePointer, hydrated } = useMotionPreferences();
  const { scrollTo } = useSmoothScroll();
  const rootRef = useRef<HTMLElement>(null);
  const [canvasMounted, setCanvasMounted] = useState(false);

  /* The WebGL chunk is ~230KB gzipped. It is fetched only once the intro has
     finished and the main thread is idle, so it can never delay the LCP
     image or the entrance timeline. */
  useEffect(() => {
    if (!introDone || reducedMotion || !hydrated) return;
    const mount = () => setCanvasMounted(true);
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(mount, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = window.setTimeout(mount, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [introDone, reducedMotion, hydrated]);

  /* ---------------------------------------------------------------------
     Orchestrated entrance. One timeline, ~1.4s, fired once the loading mask
     has opened: background aperture -> headline line masks -> bottle rise
     with a single confident overshoot -> splash draw-on -> ingredients
     drifting back into depth -> interface.
  --------------------------------------------------------------------- */
  useEffect(() => {
    if (!introDone || !hydrated) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(
          "[data-hero-bg], [data-hero-line] > span, [data-hero-rise], [data-hero-splash], [data-hero-ingredient], [data-hero-ui]",
          { clearProps: "all", opacity: 1, y: 0, x: 0, scale: 1 },
        );
        gsap.fromTo(
          "[data-hero-line] > span, [data-hero-ui]",
          { opacity: 0 },
          { opacity: 1, duration: 0.25, stagger: 0.03 },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "chill" } });

      tl.fromTo(
        "[data-hero-bg]",
        {
          clipPath: "inset(14% 18% 14% 18% round 42%)",
          scale: 1.14,
          opacity: 0.55,
        },
        {
          clipPath: "inset(0% 0% 0% 0% round 0%)",
          scale: 1,
          opacity: 1,
          duration: 1.05,
          ease: "aperture",
        },
        0,
      )
        .fromTo(
          "[data-hero-line] > span",
          { yPercent: 115 },
          { yPercent: 0, duration: 0.95, stagger: 0.09 },
          0.16,
        )
        .fromTo(
          "[data-hero-rise]",
          { yPercent: 16, scale: 0.94, opacity: 0 },
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            duration: 1.05,
            ease: "overshoot",
          },
          0.26,
        )
        .fromTo(
          "[data-hero-splash]",
          { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 0.9,
            ease: "squeeze",
          },
          0.5,
        )
        .fromTo(
          "[data-hero-ingredient]",
          { opacity: 0, scale: 1.08, yPercent: 6 },
          {
            opacity: 1,
            scale: 1,
            yPercent: 0,
            duration: 1,
            stagger: 0.12,
          },
          0.62,
        )
        .fromTo(
          "[data-hero-ui]",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
          0.86,
        );
    }, root);

    return () => ctx.revert();
  }, [introDone, reducedMotion, hydrated]);

  /* ---------------------------------------------------------------------
     Cursor depth. Foreground layers shift by 8-18px, nothing more, and only
     for fine pointers. No idle wobble: the scene is still when the cursor is.
  --------------------------------------------------------------------- */
  useEffect(() => {
    if (!hydrated || reducedMotion || isCoarsePointer) return;
    const root = rootRef.current;
    if (!root) return;

    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]"),
    ).map((el) => ({
      el,
      depth: Number(el.dataset.parallax) || 10,
      x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
    }));

    const onMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = (event.clientY / window.innerHeight - 0.5) * 2;
      layers.forEach((layer) => {
        layer.x(nx * layer.depth);
        layer.y(ny * layer.depth * 0.55);
      });
    };

    const onLeave = () => layers.forEach((l) => (l.x(0), l.y(0)));

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      layers.forEach((l) => gsap.set(l.el, { x: 0, y: 0 }));
    };
  }, [hydrated, reducedMotion, isCoarsePointer]);

  return (
    <section
      ref={rootRef}
      id="hero"
      aria-label="Nimbu Paani — a hit of nimbu"
      className="relative isolate h-[100svh] min-h-[34rem] w-full overflow-hidden bg-forest grain"
    >
      {/* ---------- z0 · environment ---------- */}
      <div data-hero-bg className="stack-layer z-0 will-change-transform">
        <Image
          src={assets.environment.src}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={80}
          className="object-cover object-center"
        />
      </div>
      <div
        aria-hidden="true"
        className="stack-layer z-[2] bg-[radial-gradient(115%_78%_at_50%_38%,transparent_28%,rgba(4,55,41,0.55)_70%,rgba(4,55,41,0.92)_100%)]"
      />
      <div
        aria-hidden="true"
        className="stack-layer z-[3] bg-gradient-to-b from-forest/85 via-transparent to-forest/70"
      />

      {/* ---------- z10 · carbonation (WebGL, behind the product) ---------- */}
      <div className="stack-layer z-10">{canvasMounted ? <HeroCanvas /> : null}</div>

      {/* ---------- z12 · ice, set back in depth ---------- */}
      <div
        aria-hidden="true"
        data-parallax="8"
        className="stack-layer z-[12] opacity-45 mix-blend-screen"
      >
        <div
          data-hero-ingredient
          className="absolute -top-[6%] left-1/2 w-[120vw] max-w-[1500px] -translate-x-1/2 md:w-[86vw]"
        >
          <Image
            src={assets.ice.src}
            alt=""
            width={assets.ice.width}
            height={assets.ice.height}
            sizes="(max-width: 768px) 120vw, 86vw"
            quality={70}
            className="h-auto w-full object-contain blur-[1px]"
          />
        </div>
      </div>

      {/* ---------- z14 · liquid ribbon, behind the bottle ---------- */}
      <div
        aria-hidden="true"
        data-parallax="14"
        className="stack-layer z-[14] flex items-center justify-center"
      >
        <div
          data-hero-splash
          className="w-[142vw] max-w-[1500px] translate-y-[8%] opacity-90 mix-blend-screen md:w-[74vw]"
        >
          <Image
            src={assets.splash.src}
            alt=""
            width={assets.splash.width}
            height={assets.splash.height}
            sizes="(max-width: 768px) 142vw, 74vw"
            quality={75}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>

      {/* ---------- z16 · headline, passing behind the bottle ----------
          One <h1>. On desktop the two lines are thrown to opposite corners so
          the product reads between them; below md they stack under the eyebrow,
          well clear of the label. */}
      <div className="stack-layer shell z-[16]">
        <h1 className="relative h-full text-cream">
          <span
            data-hero-line
            className="line-mask t-mega absolute top-[calc(var(--nav-h)+7vh)] left-0 md:top-[19vh]"
          >
            <span className="block">{hero.headline[0]}</span>
          </span>{" "}
          <span
            data-hero-line
            className="line-mask t-mega absolute top-[calc(var(--nav-h)+7vh+0.84em)] left-0 md:top-auto md:right-0 md:bottom-[21vh] md:left-auto md:text-right"
          >
            <span className="t-outline outline-cream block">{hero.headline[1]}</span>
          </span>
        </h1>
      </div>

      {/* ---------- z20 · the protagonist ----------
          PRODUCTION REPLACEMENT REQUIRED
          `01-hero-bottle-transparent.png` is a CONCEPT cutout, not final art.
          Before launch, swap it for the official high-resolution commercial
          packshot (transparent PNG or WebP, >= 2048px tall, colour-managed),
          update `assets.bottle` in src/lib/site.config.ts with the real
          intrinsic dimensions, and re-check that no copy overlaps the label.
      ------------------------------------------------------------------- */}
      <div className="stack-layer z-20 flex items-center justify-center">
        <div
          data-parallax="10"
          className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-1/2"
        >
          <div
            data-hero-rise
            className="relative aspect-[1024/1536] h-[46svh] w-auto sm:h-[52svh] md:h-[58svh] lg:h-[62svh]"
            style={{
              filter: "drop-shadow(0 34px 60px rgba(2,26,19,0.55))",
            }}
          >
            <Image
              src={assets.bottle.src}
              alt={assets.bottle.alt}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 60vw, 34vw"
              quality={90}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* ---------- z26 · lime and mint, in front, clear of the label ---------- */}
      <div
        aria-hidden="true"
        data-parallax="18"
        className="stack-layer z-[26] overflow-hidden"
      >
        <div
          data-hero-ingredient
          className="absolute -bottom-[8%] -left-[18%] w-[86vw] max-w-[900px] md:-bottom-[14%] md:-left-[6%] md:w-[46vw]"
        >
          <Image
            src={assets.limeMint.src}
            alt=""
            width={assets.limeMint.width}
            height={assets.limeMint.height}
            sizes="(max-width: 768px) 86vw, 46vw"
            quality={75}
            className="h-auto w-full object-contain"
          />
        </div>
        <div
          data-hero-ingredient
          className="absolute -right-[16%] bottom-[6%] hidden w-[34vw] max-w-[620px] opacity-80 mix-blend-screen md:block"
        >
          <Image
            src={assets.ice.src}
            alt=""
            width={assets.ice.width}
            height={assets.ice.height}
            sizes="34vw"
            quality={70}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>

      {/* ---------- z36 · legibility scrim for the interface band ---------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[36] h-[46%] bg-[linear-gradient(to_top,rgba(4,55,41,0.88)_0%,rgba(4,55,41,0.45)_38%,rgba(4,55,41,0)_100%)]"
      />

      {/* ---------- z40 · interface ---------- */}
      <div className="stack-layer shell z-40 flex h-full flex-col justify-between pt-[var(--nav-h)] pb-[clamp(1.25rem,4vh,2.75rem)]">
        <div className="pt-[2vh] md:pt-[7vh]">
          <p data-hero-ui className="t-eyebrow text-lime">
            {hero.eyebrow}
          </p>
        </div>

        <div className="pointer-events-auto flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[26ch]">
            <p data-hero-ui className="t-body text-cream/80">
              {hero.support}
            </p>
            <a
              data-hero-ui
              href={hero.primaryCta.href}
              onClick={(event) => {
                event.preventDefault();
                scrollTo(hero.primaryCta.href);
              }}
              className="btn btn-lime mt-6"
            >
              {hero.primaryCta.label}
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <p
            data-hero-ui
            className="t-eyebrow flex items-center gap-3 text-cream/55"
          >
            <span
              aria-hidden="true"
              className="relative block h-px w-12 overflow-hidden bg-cream/25"
            >
              <span className="absolute inset-y-0 left-0 block w-4 bg-lime motion-safe:animate-[cue_2.6s_var(--ease-chill)_infinite]" />
            </span>
            {hero.scrollCue}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cue {
          0% { transform: translateX(-100%); }
          55%, 100% { transform: translateX(300%); }
        }
      `}</style>
    </section>
  );
}
