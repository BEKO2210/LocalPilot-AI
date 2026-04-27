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
  title: "Bewertungs-Booster – Vorschau",
  robots: { index: false, follow: false },
};

export default async function DashboardReviewsPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="reviews">
      <ComingSoonSection
        business={business}
        title="Bewertungs-Booster"
        description="Vorlagen für WhatsApp, SMS und E-Mail – mit Platzhaltern für Kundenname und Bewertungslink."
        comingInSession={16}
        gatingFeature="review_booster_basic"
        upcomingFeatures={[
          "Bewertungslink zentral pflegen",
          "Branchen-passende Vorlagen aus dem Preset",
          "Tonalität wählen (kurz / freundlich / Follow-up)",
          "Copy-to-Clipboard mit ersetzten Platzhaltern",
          "Silber/Gold: KI-Varianten und Kampagnen-Modi",
        ]}
      />
    </DashboardShell>
  );
}
