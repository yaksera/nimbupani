import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { MotionPreferences } from "@/components/MotionPreferences";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { assets, siteConfig } from "@/lib/site.config";

import "./globals.css";

/**
 * Fonts are self-hosted (files sourced from the Fontsource packages) so the
 * build never depends on a third-party font CDN and there is no render-blocking
 * stylesheet or FOUT beyond the local swap.
 */
const archivoBlack = localFont({
  src: "../fonts/archivo-black-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-archivo-black",
  fallback: ["Arial Black", "Helvetica Neue", "sans-serif"],
  adjustFontFallback: false,
});

const instrumentSans = localFont({
  src: "../fonts/instrument-sans-latin-wght-normal.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-instrument-sans",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.meta.url),
  title: {
    default: siteConfig.meta.title,
    template: `%s — ${siteConfig.brand.name}`,
  },
  description: siteConfig.meta.description,
  applicationName: siteConfig.brand.name,
  keywords: ["Nimbu Paani", "lime soda", "Nepal", "soft drink", "lemon"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.meta.locale,
    url: siteConfig.meta.url,
    siteName: siteConfig.brand.name,
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    images: [
      {
        url: siteConfig.meta.ogImage,
        width: assets.reference.width,
        height: assets.reference.height,
        alt: assets.reference.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    images: [siteConfig.meta.ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#043729",
  colorScheme: "dark",
};

/**
 * Only values printed on the physical pack are described here. No price,
 * availability, rating or review data is asserted.
 */
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: siteConfig.brand.name,
  description: siteConfig.meta.description,
  image: siteConfig.meta.ogImage,
  category: "Carbonated soft drink",
  brand: { "@type": "Brand", name: siteConfig.brand.name },
  size: siteConfig.brand.netQuantity,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${instrumentSans.variable}`}
    >
      <body className="bg-forest text-cream antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:rounded-full focus:bg-lime focus:px-5 focus:py-3 focus:text-ink focus:t-eyebrow"
        >
          Skip to content
        </a>
        <MotionPreferences>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </MotionPreferences>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      </body>
    </html>
  );
}
