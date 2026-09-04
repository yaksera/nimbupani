"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { useMotionPreferences } from "@/components/MotionPreferences";
import { assets, siteConfig } from "@/lib/site.config";
import { gsap } from "@/lib/gsap";

/**
 * Editorial, not cards. Two columns, one oversized statement, one deep crop
 * of the ingredient plate, and three labels tied together with hairlines.
 */
export function FreshnessStory() {
  const { freshness } = siteConfig;
  const { reducedMotion, hydrated } = useMotionPreferences();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.fromTo(
          "[data-fresh-fade]",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.04,
            scrollTrigger: { trigger: root, start: "top 85%" },
          },
        );
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "chill" },
        scrollTrigger: { trigger: root, start: "top 68%", once: true },
      });

      tl.fromTo(
        "[data-fresh-line] > span",
        { yPercent: 112 },
        { yPercent: 0, duration: 0.95, stagger: 0.08 },
        0,
      )
        .fromTo(
          "[data-fresh-crop]",
          { clipPath: "inset(0% 0% 100% 0%)", scale: 1.12 },
          { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.15 },
          0.12,
        )
        .fromTo(
          "[data-fresh-fade]",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
          0.3,
        )
        .fromTo(
          "[data-fresh-rule]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, stagger: 0.12, ease: "squeeze" },
          0.42,
        );
    }, root);

    return () => ctx.revert();
  }, [hydrated, reducedMotion]);

  return (
    <section
      ref={rootRef}
      id="freshness"
      className="relative bg-cream py-[clamp(4.5rem,11vh,9rem)] text-forest"
    >
      <div className="shell grid-editorial items-stretch gap-y-14">
        {/* ---------- left: the statement ---------- */}
        <div className="col-span-12 flex flex-col lg:col-span-7">
          <p data-fresh-fade className="t-eyebrow text-emerald">
            {freshness.eyebrow}
          </p>

          <h2 className="t-mega mt-6">
            <span data-fresh-line className="line-mask">
              <span className="block">{freshness.headline[0]}</span>
            </span>{" "}
            <span data-fresh-line className="line-mask">
              <span className="t-outline outline-emerald block">
                {freshness.headline[1]}
              </span>
            </span>
          </h2>

          {/* Three compact labels, tied together with hairlines. */}
          <ul className="mt-[clamp(2.5rem,5vh,4rem)] flex max-w-[34rem] items-center lg:mt-auto lg:pb-[2vh]">
            {freshness.labels.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-4 last:flex-none">
                <span
                  data-fresh-fade
                  className="t-eyebrow shrink-0 text-forest"
                >
                  {label}
                </span>
                {i < freshness.labels.length - 1 ? (
                  <span
                    data-fresh-rule
                    aria-hidden="true"
                    className="rule w-full text-emerald"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- right: the deep crop ---------- */}
        <div className="col-span-12 lg:col-span-5 lg:pt-[6vh]">
          <div
            data-fresh-crop
            className="relative aspect-[4/5] w-full overflow-hidden bg-emerald/10 will-change-transform"
          >
            <Image
              src={assets.limeMint.src}
              alt={assets.limeMint.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              quality={80}
              className="object-cover object-[62%_52%]"
            />
            <div
              aria-hidden="true"
              className="stack-layer bg-gradient-to-t from-cream/35 to-transparent"
            />
          </div>

          <p
            data-fresh-fade
            className="t-body mt-7 max-w-[30ch] text-forest/85"
          >
            {freshness.body}
          </p>
        </div>
      </div>
    </section>
  );
}
