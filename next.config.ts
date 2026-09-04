import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Modern formats first; the transparent PNGs re-encode to AVIF/WebP with
    // alpha intact and lose 70-85% of their weight on the wire.
    formats: ["image/avif", "image/webp"],
    // Next 16 requires an explicit allowlist. These are the only values the
    // components ask for — see the `quality` props in src/components.
    qualities: [45, 70, 75, 80, 90],
    // Only the widths this layout actually asks for.
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [180, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
