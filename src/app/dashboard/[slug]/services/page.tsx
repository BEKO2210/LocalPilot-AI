import { notFound } from "next/navigation";
import { ComingSoonSection, DashboardShell } from "@/components/dashboard";
import {
  getMockBusinessBySlug,
  listMockBusinessSlugs,
} from "@/data";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return listMockBusinessSlugs().map((slug) => ({ slug }));
}

export const metadata = {
  title: "Leistungen – Vorschau",
  robots: { index: false, follow: false },
};

export default async function DashboardServicesPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="services">
      <ComingSoonSection
        business={business}
        title="Leistungen verwalten"
        description="Leistungen anlegen, bearbeiten, sortieren und je nach Paket-Limit freischalten."
        comingInSession={11}
        gatingFeature="service_management"
        upcomingFeatures={[
          "Liste aller Leistungen mit Sortier-Drag-and-Drop",
          "Anlegen, Bearbeiten, Aktivieren/Deaktivieren, Löschen",
          "Paket-Limit-Hinweise (Bronze 10, Silber 30, Gold 100)",
          "Kategorien und Tags",
          "Featured-Markierung für Public Site",
          "Vorschau-Link pro Leistung",
        ]}
      />
    </DashboardShell>
  );
}
