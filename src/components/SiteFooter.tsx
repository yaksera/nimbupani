import { siteConfig } from "@/lib/site.config";

/**
 * Minimal by design. Every destination comes from siteConfig; a link that has
 * not been configured yet renders as plain text rather than a dead anchor, so
 * the page never ships a broken or invented URL.
 */
export function SiteFooter() {
  const { footer, brand } = siteConfig;

  return (
    <footer className="bg-forest text-cream">
      <div className="shell flex flex-col gap-10 py-[clamp(2.5rem,6vh,4.5rem)]">
        <div className="flex flex-col gap-8 border-b border-cream/10 pb-8 md:flex-row md:items-end md:justify-between">
          <p className="font-display text-[clamp(1.6rem,4vw,2.6rem)] leading-none tracking-[-0.03em] uppercase">
            {brand.wordmark}
          </p>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {footer.links.map((link) =>
                link.configured ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="t-eyebrow text-cream/70 transition-colors duration-300 hover:text-lime"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    {/* Not yet configured — see siteConfig.footer.links */}
                    <span
                      className="t-eyebrow text-cream/30"
                      title="Link not configured yet"
                    >
                      {link.label}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <p className="max-w-[52ch] text-xs leading-relaxed text-cream/45">
            {footer.disclaimer}
          </p>
          <p className="text-xs text-cream/45">
            {footer.copyright} · {brand.netQuantity}
          </p>
        </div>
      </div>
    </footer>
  );
}
