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
  title: "Einstellungen – Vorschau",
  robots: { index: false, follow: false },
};

export default async function DashboardSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="settings">
      <ComingSoonSection
        business={business}
        title="Einstellungen"
        description="Slug, Veröffentlichungsstatus, Sprache und Theme an einer Stelle. Backend (Settings-Schema, Slug-Validierung, Repository-Layer) folgt parallel zum Backend-Meilenstein 4."
        comingInSession={32}
        upcomingFeatures={[
          "Slug ändern (mit Slug-Validierung gegen Doppelvergaben)",
          "Veröffentlichungsstatus umschalten",
          "Sprache und Theme wählen",
          "Impressum- und Datenschutz-Platzhalter pflegen",
          "Feature-Lock-Vergleichsmatrix für Upgrade-Entscheidung",
          "Hinweis: Diese Sektion benötigt im Gegensatz zu KI/Reviews/Social ein echtes Backend (Schema + Persistierung), folgt daher erst mit Meilenstein 4.",
        ]}
      />
    </DashboardShell>
  );
}
