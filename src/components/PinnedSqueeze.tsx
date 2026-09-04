"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";

import { useMotionPreferences } from "@/components/MotionPreferences";
import { assets, siteConfig } from "@/lib/site.config";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * The narrative beat. A single scrubbed master timeline drives every layer,
 * so scrolling back up plays the story backwards exactly. Nothing here is
 * event-fired, nothing loops, and the product stays centred and sharp.
 */
export function PinnedSqueeze() {
  const { reducedMotion, isMobile, hydrated } = useMotionPreferences();
  const sectionRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  // Only request the 2.4MB ribbon PNG once the section is within a screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "80% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const section = sectionRef.current;
    if (!section) return;

    // Reduced motion renders a different composition entirely (see below);
    // there is nothing here to animate.
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
      });

      // 0 · the seam out of the emerald hero
      tl.to("[data-squeeze-seam]", { opacity: 0, duration: 0.16 }, 0);

      // 1 · the product grows, with a restrained tilt
      tl.fromTo(
        "[data-squeeze-bottle]",
        { scale: 1, rotate: 0 },
        { scale: 1.13, rotate: isMobile ? 3 : 5.4, duration: 1 },
        0,
      );

      // 2 · SQUEEZE / SIP / RESET take turns passing behind the bottle
      const words = gsap.utils.toArray<HTMLElement>("[data-squeeze-word]");
      words.forEach((word, i) => {
        const start = 0.06 + i * 0.29;
        tl.fromTo(
          word,
          { xPercent: 42, opacity: 0 },
          { xPercent: 6, opacity: 1, duration: 0.13, ease: "chill" },
          start,
        ).to(
          word,
          { xPercent: -38, opacity: 0, duration: 0.14, ease: "squeeze" },
          start + 0.15,
        );
      });

      // 3 · ingredients counter-rotate at two different depths
      tl.fromTo(
        "[data-squeeze-lime]",
        { rotate: -6, yPercent: 10, xPercent: -2 },
        { rotate: 9, yPercent: -8, xPercent: 3, duration: 1 },
        0,
      ).fromTo(
        "[data-squeeze-ice]",
        { rotate: 8, yPercent: -6 },
        { rotate: -14, yPercent: 12, duration: 1 },
        0,
      );

      // 4 · the liquid ribbon draws itself along an SVG mask
      tl.fromTo(
        "[data-squeeze-ribbon-path]",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.55, ease: "squeeze" },
        0.12,
      ).fromTo(
        "[data-squeeze-ribbon]",
        { opacity: 0 },
        { opacity: 0.95, duration: 0.12 },
        0.12,
      );

      // 5 · the stage recedes before the sticky viewport releases, so the
      //     cream ground — not a hard cut — is what carries into the editorial
      tl.to(
        "[data-squeeze-bottle], [data-squeeze-ribbon], [data-squeeze-lime], [data-squeeze-ice]",
        { opacity: 0, duration: 0.12, ease: "chill" },
        0.88,
      );

      // 6 · acid lime settles into warm off-white, never as a hard cut
      tl.fromTo(
        "[data-squeeze-bg]",
        { backgroundColor: "#c7ff24" },
        { backgroundColor: "#f4f1df", duration: 0.42, ease: "chill" },
        0.5,
      );
    }, section);

    return () => ctx.revert();
  }, [hydrated, reducedMotion, isMobile]);

  // Refresh measurements once fonts have settled — pinned math depends on it.
  useEffect(() => {
    if (!("fonts" in document)) return;
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);

  /* ---------------------------------------------------------------------
     Reduced motion gets the same story as a still: no pin, no scrub, no
     stacked words fighting for the same pixels — an editorial spread that
     says SQUEEZE / SIP / RESET and shows the product, full stop.
  --------------------------------------------------------------------- */
  if (reducedMotion) {
    return (
      <section
        ref={sectionRef}
        id="story"
        className="relative bg-cream py-[clamp(3.5rem,9vh,7rem)] text-forest"
      >
        <div className="shell grid-editorial items-center gap-y-12">
          <div className="col-span-12 md:col-span-6">
            <h2 className="t-xl">
              {siteConfig.squeeze.words.map((word, i) => (
                <Fragment key={word}>
                  {i > 0 ? " " : null}
                  <span className="block">{word}</span>
                </Fragment>
              ))}
            </h2>
          </div>
          <div className="col-span-12 flex justify-center md:col-span-6">
            {/* PRODUCTION REPLACEMENT REQUIRED — concept cutout, see Hero.tsx. */}
            <Image
              src={assets.bottle.src}
              alt={assets.bottle.alt}
              width={assets.bottle.width}
              height={assets.bottle.height}
              sizes="(max-width: 768px) 60vw, 30vw"
              quality={90}
              className="h-auto w-[60vw] max-w-[22rem] md:w-[30vw]"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative h-[190svh] md:h-[250svh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          data-squeeze-bg
          aria-hidden="true"
          className="stack-layer z-0 bg-lime"
        />
        <div
          data-squeeze-seam
          aria-hidden="true"
          className="stack-layer z-[1] bg-gradient-to-b from-forest via-forest/60 to-transparent"
        />

        <h2 className="sr-only">
          {siteConfig.squeeze.words
            .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
            .join(". ")}
          .
        </h2>

        {/* ---------- giant masked typography, behind the product ---------- */}
        <div
          aria-hidden="true"
          className="stack-layer z-10 flex items-center justify-center overflow-hidden"
        >
          {siteConfig.squeeze.words.map((word) => (
            <span
              key={word}
              data-squeeze-word
              className="t-mega absolute whitespace-nowrap text-forest/85 opacity-0 mix-blend-multiply"
            >
              {word}
            </span>
          ))}
        </div>

        {/* ---------- liquid ribbon, revealed along an SVG mask ---------- */}
        <div
          data-squeeze-ribbon
          aria-hidden="true"
          className="stack-layer z-[14] flex items-center justify-center opacity-0"
        >
          <svg
            viewBox="0 0 1536 1024"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full max-w-none md:h-auto md:w-[135%]"
            role="presentation"
          >
            <defs>
              <mask
                id="ribbon-reveal"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="1536"
                height="1024"
              >
                <path
                  data-squeeze-ribbon-path
                  d="M110,640 C480,900 760,560 1000,430 C1180,332 1330,250 1500,190"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="760"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={1}
                />
              </mask>
            </defs>
            {/* Raw <image> so the SVG mask applies to the pixels directly.
                Requested only when the section is close (see `near`). */}
            {near ? (
              <image
                href={assets.splash.src}
                x="0"
                y="0"
                width="1536"
                height="1024"
                mask="url(#ribbon-reveal)"
                style={{ mixBlendMode: "screen" }}
                preserveAspectRatio="xMidYMid meet"
              />
            ) : null}
          </svg>
        </div>

        {/* ---------- ingredients, two depths ---------- */}
        <div
          aria-hidden="true"
          className="stack-layer z-[12] overflow-hidden opacity-70"
        >
          <div
            data-squeeze-ice
            className="absolute -top-[10%] -right-[14%] w-[70vw] max-w-[760px] mix-blend-multiply md:w-[38vw]"
          >
            {near ? (
              <Image
                src={assets.ice.src}
                alt=""
                width={assets.ice.width}
                height={assets.ice.height}
                sizes="(max-width: 768px) 70vw, 38vw"
                quality={70}
                className="h-auto w-full opacity-70"
              />
            ) : null}
          </div>
        </div>

        {/* PRODUCTION REPLACEMENT REQUIRED — concept cutout, see Hero.tsx. */}
        <div className="stack-layer z-20 flex items-center justify-center">
          <div
            data-squeeze-bottle
            className="relative aspect-[1024/1536] h-[52svh] w-auto will-change-transform md:h-[64svh]"
            style={{ filter: "drop-shadow(0 30px 54px rgba(4,55,41,0.28))" }}
          >
            <Image
              src={assets.bottle.src}
              alt={assets.bottle.alt}
              fill
              sizes="(max-width: 768px) 62vw, 32vw"
              quality={90}
              className="object-contain"
            />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="stack-layer z-[26] overflow-hidden"
        >
          <div
            data-squeeze-lime
            className="absolute -bottom-[16%] -left-[22%] w-[92vw] max-w-[880px] md:-left-[10%] md:w-[46vw]"
          >
            {near ? (
              <Image
                src={assets.limeMint.src}
                alt=""
                width={assets.limeMint.width}
                height={assets.limeMint.height}
                sizes="(max-width: 768px) 92vw, 46vw"
                quality={75}
                className="h-auto w-full"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
