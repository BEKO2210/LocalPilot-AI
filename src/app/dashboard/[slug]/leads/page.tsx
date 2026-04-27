import { notFound } from "next/navigation";
import {
  ComingSoonSection,
  DashboardShell,
} from "@/components/dashboard";
import { LeadsView } from "@/components/dashboard/leads-view";
import {
  getMockBusinessBySlug,
  leadsByBusiness,
  listMockBusinessSlugs,
} from "@/data";
import { hasFeature } from "@/core/pricing";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return listMockBusinessSlugs().map((slug) => ({ slug }));
}

export const metadata = {
  title: "Anfragen verwalten",
  robots: { index: false, follow: false },
};

export default async function DashboardLeadsPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  // Bronze: kein lead_management → ComingSoon mit Hinweis. Demo-Anfragen
  // bleiben sichtbar, nur die volle Verwaltung ist gesperrt.
  const canManage = hasFeature(business.packageTier, "lead_management");
  const initialLeads = leadsByBusiness[business.id] ?? [];

  if (!canManage) {
    return (
      <DashboardShell business={business} active="leads">
        <ComingSoonSection
          business={business}
          title="Anfragen verwalten"
          description="Filter, Detailansicht, Status-Wechsel und Antwort-Vorlagen sind ab Silber freigeschaltet. Bronze-Kund:innen sehen Anfragen aktuell nur als Übersicht im Dashboard."
          comingInSession={12}
          gatingFeature="lead_management"
          upcomingFeatures={[
            "Filter (Neu, Kontaktiert, Qualifiziert, Gewonnen, Verloren, Archiviert)",
            "Volltext-Suche (Name, Telefon, Nachricht)",
            "Detail-Pane mit Notizen, Zusatzfeldern und Direktkontakt-Buttons",
            "Antwort-Vorlagen mit Copy-to-Clipboard",
            "Persistierung im Browser (Demo) bzw. CRM-Sync (ab Session 19)",
          ]}
        />
        <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-700 shadow-soft">
          {initialLeads.length} Demo-Anfragen liegen bereits an – sichtbar in
          der Übersicht.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell business={business} active="leads">
      <LeadsView business={business} initialLeads={initialLeads} />
    </DashboardShell>
  );
}
