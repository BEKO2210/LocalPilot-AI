import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme";
import { mockBusinesses } from "@/data";
import { averageRatingByBusiness } from "@/data/mock-reviews";
import { getPresetOrFallback } from "@/core/industries";
import { getThemeOrFallback } from "@/core/themes";
import { getTier } from "@/core/pricing";

const TIER_BADGE: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-900",
  silber: "bg-slate-100 text-slate-900",
  gold: "bg-yellow-100 text-yellow-900",
};

/**
 * Live-Demo-Showcase auf der Marketing-Startseite.
 * Sechs Mini-Karten – jede Karte zeigt eine echte Public Site, klickbar.
 * Beste Antwort auf "Wie sieht das aus, wenn ich Kunde bin?".
 */
export function DemoShowcase() {
  return (
    <Section id="live-demos">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">Live-Demos</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Sehen Sie, wie es bei Ihnen aussehen würde.
          </h2>
          <p className="mt-4 text-ink-600">
            Sechs vollständig validierte Demo-Betriebe – jeder mit eigenem
            Branchen-Preset und eigenem Theme. Tippen Sie auf eine Karte,
            um die fertige öffentliche Website zu öffnen.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockBusinesses.map((business) => {
            const preset = getPresetOrFallback(business.industryKey);
            const theme = getThemeOrFallback(business.themeKey);
            const tier = getTier(business.packageTier);
            const rating = averageRatingByBusiness[business.id] ?? 0;

            return (
              <Link
                key={business.id}
                href={`/site/${business.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <header className="flex flex-wrap items-start justify-between gap-2 border-b border-ink-200 bg-ink-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                      {preset.label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">
                      {business.name}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TIER_BADGE[tier.key] ?? "bg-ink-100 text-ink-900"}`}
                  >
                    {tier.label}
                  </span>
                </header>

                <ThemeProvider theme={theme} as="div" className="flex-1 p-5">
                  <span
                    className="inline-flex items-center gap-1 rounded-theme-button border px-2 py-1 text-[10px] font-medium uppercase tracking-wide"
                    style={{
                      borderColor: "rgb(var(--theme-border))",
                      backgroundColor: "rgb(var(--theme-muted))",
                      color: "rgb(var(--theme-muted-fg))",
                    }}
                  >
                    {rating.toFixed(1)} · {business.reviews.length} Bewertungen
                  </span>
                  <p
                    className="lp-theme-heading mt-3 line-clamp-2 text-base"
                    style={{ color: "rgb(var(--theme-foreground))" }}
                  >
                    {business.tagline.replace(/\{\{city\}\}/g, business.address.city)}
                  </p>
                  <p
                    className="mt-2 inline-flex items-center gap-1 text-xs"
                    style={{ color: "rgb(var(--theme-muted-fg))" }}
                  >
                    <MapPin className="h-3 w-3" aria-hidden />
                    {business.address.city}
                  </p>
                </ThemeProvider>

                <footer className="flex items-center justify-between gap-3 border-t border-ink-200 bg-white px-4 py-3 text-sm">
                  <code className="text-xs text-ink-600">/site/{business.slug}</code>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 group-hover:text-brand-800">
                    Öffnen
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </footer>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <LinkButton href="/demo" variant="outline">
            Alle Demo-Betriebe ansehen
          </LinkButton>
          <LinkButton href="/themes" variant="ghost">
            Themes-Galerie öffnen
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
