import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { mockBusinesses } from "@/data";
import { averageRatingByBusiness } from "@/data/mock-reviews";
import { leadsByBusiness } from "@/data/mock-dataset";
import { getPresetOrFallback } from "@/core/industries";
import { getTier } from "@/core/pricing";

export const metadata: Metadata = {
  title: "Dashboard – Demo wählen",
  description:
    "Wählen Sie einen Demo-Betrieb, um das Dashboard von LocalPilot AI zu erkunden.",
};

const TIER_BADGE: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-900 border-amber-200",
  silber: "bg-slate-100 text-slate-900 border-slate-200",
  gold: "bg-yellow-100 text-yellow-900 border-yellow-300",
};

export default function DashboardPickerPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section bg="muted">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="lp-eyebrow">Dashboard-Demo</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Welchen Betrieb möchten Sie verwalten?
              </h1>
              <p className="mt-4 text-ink-600">
                Aktuell zeigt das Dashboard sechs Demo-Betriebe. Tippen Sie
                eine Karte an, um die Übersicht für diesen Betrieb zu öffnen –
                Pakete, Anfragen, Schnellaktionen und Public-Site-Vorschau
                inklusive.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockBusinesses.map((business) => {
                const preset = getPresetOrFallback(business.industryKey);
                const tier = getTier(business.packageTier);
                const rating = averageRatingByBusiness[business.id] ?? 0;
                const leadCount = (leadsByBusiness[business.id] ?? []).length;
                const newLeads = (leadsByBusiness[business.id] ?? []).filter(
                  (l) => l.status === "new",
                ).length;

                return (
                  <Link
                    key={business.id}
                    href={`/dashboard/${business.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    <header className="flex flex-wrap items-start justify-between gap-2 border-b border-ink-200 bg-ink-50 px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                          {preset.label}
                        </p>
                        <p className="mt-0.5 truncate text-base font-semibold text-ink-900">
                          {business.name}
                        </p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-600">
                          <MapPin className="h-3 w-3" aria-hidden />
                          {business.address.city}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${TIER_BADGE[tier.key] ?? ""}`}
                      >
                        {tier.label}
                      </span>
                    </header>
                    <div className="grid flex-1 grid-cols-3 gap-3 p-5 text-center">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-500">
                          Anfragen
                        </p>
                        <p className="mt-1 text-lg font-semibold text-ink-900">
                          {leadCount}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {newLeads > 0 ? `${newLeads} neu` : "alle bearbeitet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-500">
                          Bewertung
                        </p>
                        <p className="mt-1 text-lg font-semibold text-ink-900">
                          {rating.toFixed(1)}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {business.reviews.length} Stimmen
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-500">
                          Leistungen
                        </p>
                        <p className="mt-1 text-lg font-semibold text-ink-900">
                          {business.services.length}
                        </p>
                        <p className="text-[11px] text-ink-500">aktiv</p>
                      </div>
                    </div>
                    <footer className="flex items-center justify-between gap-3 border-t border-ink-200 bg-white px-5 py-3 text-sm">
                      <code className="text-xs text-ink-600">/dashboard/{business.slug}</code>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 group-hover:text-brand-800">
                        Öffnen
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </footer>
                  </Link>
                );
              })}
            </div>
            <p className="mt-8 text-center text-xs text-ink-500">
              Alle Demos sind statisch prerendert – kein Backend, keine echten
              Daten. Sobald Auth (Session 19+) live ist, sehen Sie hier nur
              Ihren eigenen Betrieb.
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
