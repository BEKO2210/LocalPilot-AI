import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme";
import { mockBusinesses } from "@/data";
import { averageRatingByBusiness } from "@/data/mock-reviews";
import { leadsByBusiness } from "@/data/mock-dataset";
import { getPresetOrFallback } from "@/core/industries";
import { getThemeOrFallback } from "@/core/themes";
import { getTier } from "@/core/pricing";

export const metadata: Metadata = {
  title: "Demo-Betriebe",
  description:
    "Sechs vollständig validierte Demo-Betriebe für LocalPilot AI – jede Branche mit anderem Theme, alle drei Pakete vertreten.",
};

const TIER_BADGE: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-900 border-amber-200",
  silber: "bg-slate-100 text-slate-900 border-slate-200",
  gold: "bg-yellow-100 text-yellow-900 border-yellow-300",
  platin: "bg-violet-100 text-violet-900 border-violet-200",
};

export default function DemoOverviewPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section bg="muted">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="lp-eyebrow">Demo</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {mockBusinesses.length} Demo-Betriebe.
              </h1>
              <p className="mt-4 text-ink-600">
                Jeder Betrieb nutzt ein anderes Branchen-Preset und ein anderes
                Theme. Bronze, Silber und Gold sind vertreten. Die Inhalte sind
                fiktiv – keine echten Marken, keine echten Privatdaten.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {mockBusinesses.map((business) => {
                const theme = getThemeOrFallback(business.themeKey);
                const preset = getPresetOrFallback(business.industryKey);
                const tier = getTier(business.packageTier);
                const rating = averageRatingByBusiness[business.id] ?? 0;
                const leadCount = (leadsByBusiness[business.id] ?? []).length;

                return (
                  <article
                    key={business.id}
                    className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft"
                  >
                    {/* Meta-Header */}
                    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-200 bg-ink-50 px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                          {preset.label}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-ink-900">
                          {business.name}
                        </h2>
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-600">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {business.address.city}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${TIER_BADGE[tier.key] ?? ""}`}
                        >
                          {tier.label}
                        </span>
                        <span className="rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[10px] font-mono text-ink-600">
                          {theme.key}
                        </span>
                      </div>
                    </header>

                    {/* Themed-Vorschau */}
                    <ThemeProvider theme={theme} as="div" className="p-6">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-theme-button border px-2.5 py-1 text-xs font-medium"
                        style={{
                          borderColor: "rgb(var(--theme-border))",
                          backgroundColor: "rgb(var(--theme-muted))",
                          color: "rgb(var(--theme-muted-fg))",
                        }}
                      >
                        <Star className="h-3 w-3" aria-hidden />
                        {rating.toFixed(1)} · {business.reviews.length} Bewertungen
                      </span>
                      <h3 className="lp-theme-heading mt-3 text-xl">
                        {business.tagline}
                      </h3>
                      <p
                        className="mt-2 line-clamp-3 text-sm"
                        style={{ color: "rgb(var(--theme-muted-fg))" }}
                      >
                        {business.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span
                          className="rounded-theme-button px-3 py-1.5 text-xs font-medium"
                          style={{
                            backgroundColor: "rgb(var(--theme-primary))",
                            color: "rgb(var(--theme-primary-fg))",
                          }}
                        >
                          {business.services.length} Leistungen
                        </span>
                        <span
                          className="rounded-theme-button border px-3 py-1.5 text-xs font-medium"
                          style={{
                            borderColor: "rgb(var(--theme-border))",
                            color: "rgb(var(--theme-foreground))",
                          }}
                        >
                          {business.faqs.length} FAQs
                        </span>
                        <span
                          className="rounded-theme-button border px-3 py-1.5 text-xs font-medium"
                          style={{
                            borderColor: "rgb(var(--theme-border))",
                            color: "rgb(var(--theme-foreground))",
                          }}
                        >
                          {leadCount} Anfragen
                        </span>
                      </div>
                    </ThemeProvider>

                    {/* Actions */}
                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 bg-white px-5 py-3 text-sm">
                      <code className="text-xs text-ink-600">/site/{business.slug}</code>
                      <Link
                        href={`/site/${business.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                      >
                        Public Site ansehen
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </footer>
                  </article>
                );
              })}
            </div>

            <p className="mt-10 text-center text-xs text-ink-500">
              Jede Public Site wird zur Build-Zeit prerendered – das funktioniert
              auch auf rein statischen Hostern wie GitHub Pages.
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
