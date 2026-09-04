# Nimbu Paani — landing page

A single-page, art-directed product story for the Nepalese lime beverage
**Nimbu Paani**. Built with Next.js (App Router), TypeScript, Tailwind CSS v4,
GSAP + ScrollTrigger, Lenis, Framer Motion and React Three Fiber.

---

## ⚠️ Production replacement note — read before launch

> **The bottle cutout is a concept image, not final commercial art.**
>
> `public/assets/01-hero-bottle-transparent.png` is an AI-generated concept
> packshot supplied with the brief. It appears in four places, each marked in
> the source with `PRODUCTION REPLACEMENT REQUIRED`:
> `src/components/Hero.tsx`, `src/components/PinnedSqueeze.tsx` (both the
> motion and reduced-motion branches) and `src/components/FinalCTA.tsx`.
>
> **Before launch:**
> 1. Replace the file with the official high-resolution commercial packshot —
>    transparent PNG or WebP, **≥ 2048 px tall**, colour-managed (sRGB),
>    shot or retouched with the real label artwork.
> 2. Update `assets.bottle` in `src/lib/site.config.ts` with the new
>    intrinsic `width`/`height` so the reserved aspect ratio stays exact and
>    no layout shift is introduced.
> 3. Re-check at 390 px, 768 px and 1440 px that no copy crosses the label —
>    the layout keeps type clear of it, but a differently proportioned bottle
>    moves that boundary.
> 4. `public/assets/00-original-brand-reference.jpg` is the authoritative
>    colour/brand reference; it is used only for Open Graph and should be
>    swapped for an approved OG image.
>
> No sourcing, health, heritage, award or sustainability claim appears
> anywhere on the page. Store links, contact and social URLs are unconfigured
> placeholders in `src/lib/site.config.ts` and render as plain text until real
> destinations are set.

---

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npx tsc --noEmit # type-check
npx eslint src   # lint
```

Node 20+ recommended. No environment variables, no external services, no
network access needed at build time (fonts are self-hosted).

---

## Folder structure

```
nimbu-paani-site/
├── next.config.ts             # image formats, quality allowlist, device sizes
├── package.json
├── tsconfig.json
├── public/
│   └── assets/                # the seven supplied brand assets, unmodified
│       ├── 00-original-brand-reference.jpg
│       ├── 01-hero-bottle-transparent.png   ← concept packshot (replace)
│       ├── 02-lime-mint-cluster-transparent.png
│       ├── 03-ice-droplets-transparent.png
│       ├── 04-water-splash-ribbon-transparent.png
│       ├── 05-hero-emerald-environment.png
│       └── 06-nepal-brand-story.png
└── src/
    ├── app/
    │   ├── layout.tsx         # fonts, metadata/OG, JSON-LD, providers, skip link
    │   ├── page.tsx           # section order, nothing else
    │   ├── globals.css        # design tokens, type scale, component classes
    │   └── icon.svg           # favicon placeholder
    ├── components/
    │   ├── MotionPreferences.tsx   # one source of truth for motion/breakpoint
    │   ├── SmoothScrollProvider.tsx# Lenis ↔ GSAP ticker ↔ ScrollTrigger
    │   ├── IntroProvider.tsx       # "the reveal is done" signal
    │   ├── Loader.tsx              # 0–100 counter + lime ring mask reveal
    │   ├── Nav.tsx                 # transparent → blurred, mobile menu
    │   ├── Hero.tsx                # 100svh layered scene + entrance timeline
    │   ├── PinnedSqueeze.tsx       # sticky scrubbed narrative
    │   ├── FreshnessStory.tsx      # editorial two-column spread
    │   ├── IngredientScene.tsx     # orbit section + DOM fallback
    │   ├── NepalStory.tsx          # cinematic panel + topographic texture
    │   ├── FlavorTicker.tsx        # velocity-reactive kinetic strip
    │   ├── FinalCTA.tsx            # closing product moment
    │   ├── SiteFooter.tsx
    │   └── webgl/
    │       ├── HeroCanvas.tsx      # carbonation canvas (dynamic, ssr:false)
    │       ├── BubbleField.tsx     # one instanced draw call, shader-driven
    │       ├── IngredientCanvas.tsx# limes, mint leaves, glass beads
    │       └── useCanvasActive.ts  # pause offscreen / in hidden tabs
    ├── fonts/                 # self-hosted woff2 (Archivo Black, Instrument Sans)
    └── lib/
        ├── site.config.ts     # every string, link and asset dimension
        └── gsap.ts            # plugin + custom easing registration (once)
```

---

## Animation ownership

Each library owns one layer, and no two libraries ever animate the same CSS
property on the same node.

| Library | Owns | Never touches |
| --- | --- | --- |
| **GSAP + ScrollTrigger** | Hero entrance timeline, the pinned squeeze master timeline, text line-masks, image parallax, the ribbon's SVG mask draw-on, the ticker loop and its velocity response | Anything inside `Nav.tsx` |
| **Lenis** | Scroll-position interpolation only. Driven by `gsap.ticker` (one RAF loop for the page) and pushing `ScrollTrigger.update()` on every frame | Any element transform |
| **React Three Fiber / three.js** | Carbonation behind the hero product, the ingredient cluster, lighting and depth | The DOM |
| **Framer Motion** | Navigation background, the hamburger, the full-screen mobile menu and its list stagger | Anything with a `data-*` hook used by GSAP |

Details worth knowing:

- **One master timeline** drives the pinned section (`scrub: 0.55`), so the
  story is fully reversible and every beat is tied to scroll position rather
  than fired as a separate event.
- **Custom easing** is registered once in `src/lib/gsap.ts` via `CustomEase`
  (`chill`, `squeeze`, `overshoot`, `aperture`) and mirrored as CSS variables
  in `globals.css`, so JS and CSS motion share the same curves.
- **Cursor parallax** shifts foreground layers by 8–18 px maximum, only for
  fine pointers, and returns to rest when the cursor leaves. There is no idle
  wobble anywhere on the page.
- **Reduced motion** (`prefers-reduced-motion: reduce`) removes every scrubbed
  transform, never constructs the Lenis instance, renders the pinned section
  as a static editorial spread instead of a sticky sequence, swaps the WebGL
  cluster for a DOM composition, and stops the ticker. All content stays.

---

## Asset optimisation notes

- The seven supplied files are stored **unmodified** in `public/assets/` as the
  masters. Everything served to a browser is derived from them at request time
  by the Next image optimiser.
- `next.config.ts` sets `formats: ["image/avif", "image/webp"]`. The
  transparent PNGs re-encode to AVIF/WebP with alpha intact, typically 70–85%
  smaller than the 1.4–2.8 MB source files.
- `qualities` is an explicit allowlist (`[45, 70, 75, 80, 90]`) — required from
  Next 16 onwards. Only these values appear as `quality` props: 90 for the
  product, 80 for the two hero/story photographs, 70–75 for the atmospheric
  ingredient layers, 45 for the blurred reflection. Adding a new value to a
  component means adding it to that list, or the optimiser rejects the request.
- `deviceSizes` / `imageSizes` are trimmed to the widths this layout actually
  requests, so the build never generates unused variants.
- Every `<Image>` either uses `fill` inside an element with a fixed
  `aspect-ratio`, or passes the true intrinsic `width`/`height` from
  `assets` in `src/lib/site.config.ts`. Nothing on the page shifts while media
  loads.
- Only the hero environment and the hero bottle are `priority` /
  `fetchPriority="high"`. Everything below the fold is lazy by default, and the
  heavy ribbon PNG in the pinned section is not even added to the DOM until an
  IntersectionObserver says the section is within 80% of a viewport.
- **The one exception to the optimiser**: the ribbon in `PinnedSqueeze.tsx` is
  drawn as a raw `<image>` inside an `<svg>` so the SVG mask can be applied to
  its pixels directly. It is served as the original PNG. If its weight matters
  more than the draw-on effect, pre-export a WebP of that asset and point the
  `href` at it.
- Fonts are self-hosted `woff2` subsets (Archivo Black 18 KB, Instrument Sans
  variable 30 KB) loaded through `next/font/local` — no third-party font
  request, no render-blocking stylesheet, no build-time network dependency.
- The WebGL bundle (~230 KB gzipped) is dynamically imported with `ssr: false`
  and mounted only **after** the intro finishes and the main thread goes idle,
  so it can never compete with the largest contentful paint. The ingredient
  canvas waits until its section is one screen away. Both canvases cap DPR at
  1.5, halve their object counts below 768 px, drop the refraction pass on
  mobile in favour of a flat translucent material, and set `frameloop: never`
  when offscreen or in a hidden tab.
- Film grain and the topographic texture are inline SVG/CSS — no extra request.

---

## Accessibility

- One `<h1>`, then a `<h2>` per section, in document order.
- Skip link, `header` / `nav` / `main` / `footer` landmarks, visible 3 px lime
  focus ring on every focusable element.
- The mobile menu is a real dialog: `aria-modal`, focus moved in on open,
  Tab cycles inside it, Escape closes it, focus returns to the toggle, and the
  page behind it is scroll-locked.
- Decorative imagery carries `alt=""` and `aria-hidden`; every meaningful image
  has a descriptive alt. Nothing is communicated only inside a canvas — the
  ingredient section's line is DOM text and the pinned section's words are
  echoed in a screen-reader-only heading.
- The ticker's duplicated runs are `aria-hidden`; it pauses on hover, on focus
  and whenever the tab is hidden.

---

## Content and claims

Every string on the page lives in `src/lib/site.config.ts`. The page states
only what the physical pack and the brief state: the name, the line
"THE TASTE OF NEPAL.", the 250 mL net quantity, and that it is a bright lime
refreshment for everyday Nepali moments. Structured data (`Product` JSON-LD in
`layout.tsx`) carries only those facts — no price, availability, rating or
review is asserted. Set `meta.url` to the production origin before launch so
canonical and Open Graph URLs resolve.
