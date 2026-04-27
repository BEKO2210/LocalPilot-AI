import type { Metadata } from "next";
import {
  DashboardShell,
  LeadsSummaryCard,
  PackageStatusCard,
  PreviewLinkCard,
  QuickActionsCard,
  RecentLeadsList,
} from "@/components/dashboard";
import { leadsByBusiness } from "@/data";
import {
  listSlugParams,
  loadBusinessOrNotFound,
} from "@/lib/page-business";
import { getBusinessRepository } from "@/core/database/repositories";
import { getPresetOrFallback } from "@/core/industries";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

/** Statisch prerendete Übersicht pro bekanntem Slug — Repository-Pfad. */
export async function generateStaticParams(): Promise<Params[]> {
  return listSlugParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Metadata darf bei unbekanntem Slug NICHT 404'en (sonst kollidiert
  // das mit dem 404-Pfad der Page). Direkt-Repository-Aufruf statt
  // `loadBusinessOrNotFound`.
  const business = await getBusinessRepository().findBySlug(slug);
  if (!business) return {};
  return {
    title: `Dashboard – ${business.name}`,
    description: `Übersicht für ${business.name}: Paketstatus, offene Anfragen, Schnellaktionen und Public-Site-Vorschau.`,
    robots: { index: false, follow: false },
  };
}

export default async function DashboardOverviewPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);

  const leads = leadsByBusiness[business.id] ?? [];
  const preset = getPresetOrFallback(business.industryKey);

  return (
    <DashboardShell business={business} active="overview">
      <div className="space-y-6">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Übersicht
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            Willkommen zurück.
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">
            Schneller Überblick zu Paket, offenen Anfragen und nächsten
            Schritten für <strong>{business.name}</strong> ({preset.label} in{" "}
            {business.address.city}).
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <PackageStatusCard business={business} />
          <PreviewLinkCard business={business} />
        </div>

        <LeadsSummaryCard slug={business.slug} leads={leads} />

        <div className="grid gap-4 lg:grid-cols-2">
          <QuickActionsCard business={business} />
          <RecentLeadsList slug={business.slug} leads={leads} />
        </div>
      </div>
    </DashboardShell>
  );
}
