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
  title: "Betriebsdaten – Vorschau",
  robots: { index: false, follow: false },
};

export default async function DashboardBusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="business">
      <ComingSoonSection
        business={business}
        title="Betriebsdaten bearbeiten"
        description="Name, Tagline, Beschreibung, Adresse, Kontakt, Öffnungszeiten und Branding an einer Stelle pflegen."
        comingInSession={10}
        upcomingFeatures={[
          "Stammdaten-Formular mit React Hook Form und Zod-Validierung",
          "Branche, Paket und Theme im Dashboard wechselbar",
          "Öffnungszeiten-Editor mit geteilten Tagesslots",
          "Kontaktdaten inkl. WhatsApp und Google-Bewertungslink",
          "Logo- und Hero-Bild-Upload (Storage-Anbindung in Session 19)",
          "Live-Vorschau auf der Public Site",
        ]}
      />
    </DashboardShell>
  );
}
