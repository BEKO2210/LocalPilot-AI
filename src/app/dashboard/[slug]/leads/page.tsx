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
  title: "Anfragen – Vorschau",
  robots: { index: false, follow: false },
};

export default async function DashboardLeadsPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="leads">
      <ComingSoonSection
        business={business}
        title="Anfragen verwalten"
        description="Eingehende Anfragen sortieren, Status setzen, Notizen pflegen, Kontakt aufnehmen."
        comingInSession={12}
        gatingFeature="lead_management"
        upcomingFeatures={[
          "Listenansicht mit Filter (Neu, Kontaktiert, Qualifiziert, Gewonnen, Verloren, Archiviert)",
          "Detail-Drawer mit Notizen, branchenspezifischen Zusatzfeldern und CTAs (Anrufen, WhatsApp, E-Mail)",
          "Dynamisches Kontaktformular auf der Public Site (Felder aus IndustryPreset)",
          "Antwort-Vorlagen mit Copy-to-Clipboard",
          "CSV-Export für Übergabe an CRM",
        ]}
      />
    </DashboardShell>
  );
}
