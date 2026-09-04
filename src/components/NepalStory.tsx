"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { useMotionPreferences } from "@/components/MotionPreferences";
import { assets, siteConfig } from "@/lib/site.config";
import { gsap } from "@/lib/gsap";

/**
 * A cinematic panel, not a hero clone. The photograph is anchored right and
 * the gradient protects the negative space the image was framed to leave.
 *
 * Copy is limited to what the brand has actually stated. No sourcing, health,
 * heritage, award or sustainability claims are made anywhere on this page.
 */
export function NepalStory() {
  const { nepal } = siteConfig;
  const { reducedMotion, hydrated } = useMotionPreferences();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.fromTo(
          "[data-nepal-fade], [data-nepal-line] > span",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.05,
            scrollTrigger: { trigger: root, start: "top 82%" },
          },
        );
        return;
      }

      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 62%", once: true },
          defaults: { ease: "chill" },
        })
        .fromTo(
          "[data-nepal-line] > span",
          { yPercent: 115 },
          { yPercent: 0, duration: 1, stagger: 0.09 },
        )
        .fromTo(
          "[data-nepal-fade]",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
          "-=0.7",
        );

      // Slow counter-drift on the photograph — depth, not decoration.
      gsap.fromTo(
        "[data-nepal-image]",
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [hydrated, reducedMotion]);

  return (
    <section
      ref={rootRef}
      id="nepal"
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-forest py-[clamp(4rem,10vh,8rem)] text-cream grain"
    >
      <div data-nepal-image className="stack-layer z-0 scale-[1.08]">
        <Image
          src={assets.nepal.src}
          alt={assets.nepal.alt}
          fill
          sizes="100vw"
          quality={80}
          className="object-cover object-[78%_50%]"
        />
      </div>

      {/* Gradients tuned to the crop: the left third of the photograph is
          already empty, so the type sits in the picture, not on top of it. */}
      <div
        aria-hidden="true"
        className="stack-layer z-[1] bg-gradient-to-r from-forest via-forest/75 to-transparent md:from-forest/95 md:via-forest/35 md:to-transparent"
      />
      <div
        aria-hidden="true"
        className="stack-layer z-[1] bg-gradient-to-t from-forest via-forest/25 to-transparent"
      />

      {/* Quiet topographic texture. Vector, ~1KB, no flags, no clichés. */}
      <svg
        aria-hidden="true"
        className="stack-layer z-[2] h-full w-full text-lime opacity-[0.13]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M-40 ${180 + i * 62} C 180 ${120 + i * 58}, 320 ${
              300 + i * 54
            }, 540 ${250 + i * 60} S 900 ${140 + i * 66}, 1240 ${230 + i * 58}`}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
          />
        ))}
      </svg>

      <div className="shell relative z-10 w-full">
        <div className="max-w-[46rem]">
          <p data-nepal-fade className="t-eyebrow text-lime">
            {nepal.eyebrow}
          </p>
          <h2 className="t-xl mt-6">
            <span data-nepal-line className="line-mask">
              <span className="block">{nepal.headline[0]}</span>
            </span>{" "}
            <span data-nepal-line className="line-mask">
              <span className="t-outline outline-lime block">
                {nepal.headline[1]}
              </span>
            </span>
          </h2>
          <p
            data-nepal-fade
            className="t-body mt-8 max-w-[34ch] text-cream/80"
          >
            {nepal.body}
          </p>
        </div>
      </div>
    </section>
  );
}
