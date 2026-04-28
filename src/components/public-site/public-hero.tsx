import { Star, Sparkles } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/contact-links";
import type { Business } from "@/types/business";
import type { IndustryPreset, PresetCta } from "@/types/industry";

type PublicHeroProps = {
  business: Business;
  preset: IndustryPreset;
  averageRating?: number;
  reviewCount?: number;
};

function ctaHref(business: Business, cta: PresetCta): string {
  switch (cta.intent) {
    case "call":
      return business.contact.phone ? telLink(business.contact.phone) : "#kontakt";
    case "whatsapp":
      return business.contact.whatsapp
        ? whatsappLink(business.contact.whatsapp)
        : "#kontakt";
    case "appointment":
    case "form":
      return "#kontakt";
    case "directions":
      return business.contact.googleMapsUrl ?? "#kontakt";
    case "review":
      return business.contact.googleReviewUrl ?? "#bewertungen";
    case "email":
      return business.contact.email
        ? `mailto:${business.contact.email}`
        : "#kontakt";
    case "custom":
    default:
      return "#kontakt";
  }
}

/**
 * Hero-Sektion. Headline, Subline und CTAs werden bevorzugt aus dem
 * Branchen-Preset entnommen, mit `{{city}}` durch die Adresse ersetzt.
 */
export function PublicHero({
  business,
  preset,
  averageRating,
  reviewCount,
}: PublicHeroProps) {
  const city = business.address.city;
  const tagline = business.tagline.replace(/\{\{city\}\}/g, city);
  const heroTitle = preset.defaultHeroTitle.replace(/\{\{city\}\}/g, city);
  const heroSubtitle = preset.defaultHeroSubtitle.replace(/\{\{city\}\}/g, city);

  return (
    <section
      id="top"
      className="lp-theme-section relative overflow-hidden border-b"
      style={{
        borderColor: "rgb(var(--theme-border) / 0.6)",
        backgroundColor: "rgb(var(--theme-muted))",
      }}
    >
      <div className="lp-container relative">
        <div className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-theme-button border px-3 py-1 text-xs font-medium uppercase tracking-wide"
            style={{
              borderColor: "rgb(var(--theme-border))",
              backgroundColor: "rgb(var(--theme-background))",
              color: "rgb(var(--theme-muted-fg))",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {preset.label} · {city}
          </span>

          <h1 className="lp-theme-heading mt-6 text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p
            className="mt-5 text-lg sm:text-xl"
            style={{ color: "rgb(var(--theme-muted-fg))" }}
          >
            {heroSubtitle}
          </p>

          {tagline && tagline !== heroTitle && tagline !== heroSubtitle && (
            <p
              className="mt-3 text-sm italic"
              style={{ color: "rgb(var(--theme-muted-fg))" }}
            >
              {tagline}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            {preset.defaultCtas.slice(0, 3).map((cta, idx) => {
              const isPrimary = cta.primary || idx === 0;
              return (
                <a
                  key={cta.key}
                  href={ctaHref(business, cta)}
                  className="lp-focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-theme-button px-6 text-base font-medium transition-opacity hover:opacity-90"
                  style={
                    isPrimary
                      ? {
                          backgroundColor: "rgb(var(--theme-primary))",
                          color: "rgb(var(--theme-primary-fg))",
                          boxShadow: "var(--theme-shadow)",
                        }
                      : {
                          borderWidth: 1,
                          borderColor: "rgb(var(--theme-border))",
                          backgroundColor: "rgb(var(--theme-background))",
                          color: "rgb(var(--theme-foreground))",
                        }
                  }
                >
                  {cta.label}
                </a>
              );
            })}
          </div>

          {/* Trust-Badge unten */}
          {averageRating && reviewCount && reviewCount > 0 ? (
            <p
              className="mt-6 inline-flex items-center justify-center gap-1.5 text-sm"
              style={{ color: "rgb(var(--theme-muted-fg))" }}
            >
              <Star
                className="h-4 w-4"
                aria-hidden
                style={{ color: "rgb(var(--theme-accent))" }}
              />
              <strong style={{ color: "rgb(var(--theme-foreground))" }}>
                {averageRating.toFixed(1)}
              </strong>
              · {reviewCount} Bewertungen
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
