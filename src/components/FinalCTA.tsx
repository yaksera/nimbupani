"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";

import { useMotionPreferences } from "@/components/MotionPreferences";
import { assets, siteConfig } from "@/lib/site.config";
import { gsap } from "@/lib/gsap";

/**
 * The closing product moment: back to deep emerald, the bottle on a luminous
 * plane with one restrained halo and a single reflection. No new ideas here —
 * it is the hero, answered.
 */
export function FinalCTA() {
  const { finalCta } = siteConfig;
  const { reducedMotion, hydrated } = useMotionPreferences();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.fromTo(
          "[data-final-fade], [data-final-line] > span",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.05,
            scrollTrigger: { trigger: root, start: "top 80%" },
          },
        );
        return;
      }

      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 65%", once: true },
          defaults: { ease: "chill" },
        })
        .fromTo(
          "[data-final-halo]",
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 1.3, ease: "aperture" },
          0,
        )
        .fromTo(
          "[data-final-bottle]",
          { yPercent: 10, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.15, ease: "overshoot" },
          0.1,
        )
        .fromTo(
          "[data-final-line] > span",
          { yPercent: 115 },
          { yPercent: 0, duration: 0.95, stagger: 0.08 },
          0.3,
        )
        .fromTo(
          "[data-final-fade]",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
          0.55,
        );
    }, root);

    return () => ctx.revert();
  }, [hydrated, reducedMotion]);

  return (
    <section
      ref={rootRef}
      id="find"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-emerald pt-[clamp(3rem,8vh,5.5rem)] text-cream grain"
    >
      <div
        data-final-halo
        aria-hidden="true"
        className="absolute top-[18%] left-1/2 aspect-square w-[120vw] max-w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(199,255,36,0.42)_0%,rgba(0,155,99,0)_62%)] md:w-[62vw]"
      />

      <div className="shell relative z-10 flex flex-col items-center text-center">
        <h2 className="t-xl max-w-[13ch]">
          {finalCta.headline.map((line, i) => (
            <Fragment key={line}>
              {i > 0 ? " " : null}
              <span data-final-line className="line-mask">
                <span
                  className={i === 1 ? "t-outline outline-cream block" : "block"}
                >
                  {line}
                </span>
              </span>
            </Fragment>
          ))}
        </h2>

        <a
          data-final-fade
          href={finalCta.cta.href}
          className="btn btn-lime mt-9"
        >
          {finalCta.cta.label}
          <span aria-hidden="true">→</span>
        </a>

        {/* PRODUCTION REPLACEMENT REQUIRED — concept cutout, see Hero.tsx. */}
        <div
          data-final-bottle
          className="relative mt-[clamp(1.75rem,4.5vh,3.5rem)] aspect-[1024/1536] h-[40svh] w-auto md:h-[46svh]"
        >
          <Image
            src={assets.bottle.src}
            alt={assets.bottle.alt}
            fill
            sizes="(max-width: 768px) 56vw, 30vw"
            quality={90}
            className="object-contain drop-shadow-[0_28px_46px_rgba(2,40,28,0.45)]"
          />

          {/* One reflection, faded into the plane rather than mirrored hard.
              The fade lives on the outer box and the flip on the inner one,
              so the gradient stays the right way up. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-full h-full opacity-20 blur-[2px]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent 46%)",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent 46%)",
            }}
          >
            <div className="relative h-full w-full -scale-y-100">
              <Image
                src={assets.bottle.src}
                alt=""
                fill
                sizes="(max-width: 768px) 56vw, 30vw"
                quality={45}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* The luminous plane the bottle stands on. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[26svh] bg-[linear-gradient(to_top,rgba(4,55,41,0.95),rgba(4,55,41,0)_78%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[22svh] h-px w-full bg-gradient-to-r from-transparent via-lime/45 to-transparent"
      />
    </section>
  );
}
