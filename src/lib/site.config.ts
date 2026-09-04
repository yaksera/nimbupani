/**
 * Single source of truth for every fact, label and link on the page.
 *
 * Nothing in the UI invents copy. If a value is not verified by the brand
 * owner it lives here as an obvious placeholder (see `PLACEHOLDER` markers)
 * so it can be swapped before launch without touching component code.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type ExternalLink = {
  label: string;
  /** PLACEHOLDER — replace with the real destination before launch. */
  href: string;
  /** When false the link renders as disabled text instead of an <a>. */
  configured: boolean;
};

export type SiteConfig = {
  brand: {
    name: string;
    wordmark: string;
    tagline: string;
    /** Net quantity printed on the physical label. */
    netQuantity: string;
  };
  meta: {
    title: string;
    description: string;
    url: string;
    ogImage: string;
    locale: string;
  };
  nav: {
    links: NavLink[];
    cta: { label: string; href: string };
  };
  hero: {
    eyebrow: string;
    headline: string[];
    support: string;
    primaryCta: { label: string; href: string };
    scrollCue: string;
  };
  squeeze: { words: string[] };
  freshness: {
    eyebrow: string;
    headline: string[];
    body: string;
    labels: string[];
  };
  ingredients: { headline: string[] };
  nepal: {
    eyebrow: string;
    /** Rendered as two deliberate lines; the second is the outlined one. */
    headline: [string, string];
    body: string;
  };
  ticker: { words: string[] };
  finalCta: {
    headline: string[];
    cta: { label: string; href: string };
  };
  footer: {
    links: ExternalLink[];
    /** Legal / regulatory line. Keep factual and short. */
    disclaimer: string;
    copyright: string;
  };
};

export const siteConfig: SiteConfig = {
  brand: {
    name: "Nimbu Paani",
    wordmark: "NIMBU PAANI",
    tagline: "THE TASTE OF NEPAL.",
    netQuantity: "250 mL",
  },
  meta: {
    title: "Nimbu Paani — The Taste of Nepal",
    description:
      "A bright, familiar lime refreshment made for everyday Nepali moments. Cold, citrusy, sparkling.",
    // PLACEHOLDER — set the production origin before launch (used for OG/canonical).
    url: "https://example.com",
    ogImage: "/assets/00-original-brand-reference.jpg",
    locale: "en_NP",
  },
  nav: {
    links: [
      { label: "Story", href: "#story" },
      { label: "Freshness", href: "#freshness" },
      { label: "Ingredients", href: "#ingredients" },
      { label: "Nepal", href: "#nepal" },
    ],
    cta: { label: "Find Nimbu Paani", href: "#find" },
  },
  hero: {
    eyebrow: "COLD. CITRUSY. NEPALI.",
    headline: ["A HIT", "OF NIMBU."],
    support: "Fresh lime attitude with a cold, sparkling finish.",
    primaryCta: { label: "Taste the chill", href: "#freshness" },
    scrollCue: "Scroll to squeeze",
  },
  squeeze: {
    words: ["SQUEEZE", "SIP", "RESET"],
  },
  freshness: {
    eyebrow: "What's inside the cold",
    headline: ["REAL LIME", "ENERGY."],
    body: "Bright citrus. Cool mint. A finish that wakes everything up.",
    labels: ["LIME", "MINT", "CHILL"],
  },
  ingredients: {
    headline: ["FRESHNESS,", "IN EVERY DIRECTION."],
  },
  nepal: {
    eyebrow: "ROOTED HERE",
    headline: ["THE TASTE", "OF NEPAL."],
    body: "A bright, familiar lime refreshment made for everyday Nepali moments.",
  },
  ticker: {
    words: ["ZESTY", "COLD", "BRIGHT", "NEPALI"],
  },
  finalCta: {
    headline: ["YOUR NEXT", "COLD ONE."],
    // PLACEHOLDER — point at the real stockist page / store locator when it exists.
    cta: { label: "Find Nimbu Paani", href: "#find" },
  },
  footer: {
    links: [
      // PLACEHOLDER — no store locations, handles or URLs are invented here.
      // Set `configured: true` and a real href once each destination exists.
      { label: "Story", href: "#story", configured: true },
      { label: "Contact", href: "mailto:hello@example.com", configured: false },
      { label: "Instagram", href: "https://instagram.com/", configured: false },
    ],
    disclaimer:
      "Product imagery is a design concept. Packaging, net quantity and label information are subject to change.",
    copyright: `© ${new Date().getFullYear()} Nimbu Paani`,
  },
};

/**
 * Brand asset manifest. Intrinsic dimensions are recorded so every <Image>
 * can reserve space and the page never shifts while media loads.
 */
export const assets = {
  reference: {
    src: "/assets/00-original-brand-reference.jpg",
    width: 563,
    height: 563,
    alt: "Nimbu Paani bottle on an emerald background surrounded by lime slices, mint and ice.",
  },
  bottle: {
    src: "/assets/01-hero-bottle-transparent.png",
    width: 1024,
    height: 1536,
    alt: "A chilled 250 mL bottle of Nimbu Paani, beaded with condensation.",
  },
  limeMint: {
    src: "/assets/02-lime-mint-cluster-transparent.png",
    width: 1536,
    height: 1024,
    alt: "Whole and sliced limes with mint leaves suspended in water droplets.",
  },
  ice: {
    src: "/assets/03-ice-droplets-transparent.png",
    width: 1254,
    height: 1254,
    alt: "Ice cubes and water droplets suspended in mid-air.",
  },
  splash: {
    src: "/assets/04-water-splash-ribbon-transparent.png",
    width: 1536,
    height: 1024,
    alt: "A ribbon of clear liquid caught mid-splash.",
  },
  environment: {
    src: "/assets/05-hero-emerald-environment.png",
    width: 1672,
    height: 941,
    alt: "",
  },
  nepal: {
    src: "/assets/06-nepal-brand-story.png",
    width: 1536,
    height: 1024,
    alt: "Limes and mint resting on a wet river stone in a misty Nepali gorge.",
  },
} as const;

export type AssetKey = keyof typeof assets;
