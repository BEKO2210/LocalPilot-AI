import { Calendar, Phone } from "lucide-react";
import { telLink } from "@/lib/contact-links";
import type { Business } from "@/types/business";

type PublicSiteHeaderProps = {
  business: Business;
};

/**
 * Sticky-Header für die Public Site eines Betriebs.
 * Logo-Initial + Name + ein Primär-CTA (Termin oder Anrufen).
 */
export function PublicSiteHeader({ business }: PublicSiteHeaderProps) {
  const initial = business.name.trim().charAt(0).toUpperCase() || "·";
  const phone = business.contact.phone;

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{
        borderColor: "rgb(var(--theme-border) / 0.6)",
        backgroundColor: "rgb(var(--theme-background) / 0.85)",
        color: "rgb(var(--theme-foreground))",
      }}
    >
      <div className="lp-container flex h-16 items-center justify-between gap-3">
        <a
          href="#top"
          className="lp-focus-ring flex min-w-0 items-center gap-3 rounded-sm"
        >
          <span
            aria-hidden
            className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-theme-button text-base font-bold"
            style={{
              backgroundColor: "rgb(var(--theme-primary))",
              color: "rgb(var(--theme-primary-fg))",
            }}
          >
            {initial}
          </span>
          <span className="lp-theme-heading min-w-0 truncate text-base">
            {business.name}
          </span>
        </a>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          <a
            href="#leistungen"
            className="lp-focus-ring rounded-sm hover:underline"
            style={{ color: "rgb(var(--theme-muted-fg))" }}
          >
            Leistungen
          </a>
          <a
            href="#bewertungen"
            className="lp-focus-ring rounded-sm hover:underline"
            style={{ color: "rgb(var(--theme-muted-fg))" }}
          >
            Bewertungen
          </a>
          <a
            href="#kontakt"
            className="lp-focus-ring rounded-sm hover:underline"
            style={{ color: "rgb(var(--theme-muted-fg))" }}
          >
            Kontakt
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {phone && (
            <a
              href={telLink(phone)}
              className="lp-focus-ring hidden h-10 items-center gap-1.5 rounded-theme-button border px-3 text-sm font-medium sm:inline-flex"
              style={{
                borderColor: "rgb(var(--theme-border))",
                color: "rgb(var(--theme-foreground))",
              }}
            >
              <Phone className="h-4 w-4" aria-hidden />
              Anrufen
            </a>
          )}
          <a
            href="#kontakt"
            className="lp-focus-ring inline-flex h-10 items-center gap-1.5 rounded-theme-button px-4 text-sm font-medium shadow-theme transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "rgb(var(--theme-primary))",
              color: "rgb(var(--theme-primary-fg))",
            }}
          >
            <Calendar className="h-4 w-4" aria-hidden />
            Anfragen
          </a>
        </div>
      </div>
    </header>
  );
}
