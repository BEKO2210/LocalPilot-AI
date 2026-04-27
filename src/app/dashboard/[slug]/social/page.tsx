import { BackendReadyStatus, DashboardShell } from "@/components/dashboard";
import {
  listSlugParams,
  loadBusinessOrNotFound,
} from "@/lib/page-business";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export async function generateStaticParams(): Promise<Params[]> {
  return listSlugParams();
}

export const metadata = {
  title: "Social-Media-Generator – Status",
  robots: { index: false, follow: false },
};

export default async function DashboardSocialPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);

  return (
    <DashboardShell business={business} active="social">
      <BackendReadyStatus
        business={business}
        title="Social-Media-Generator"
        description="Posts für Instagram, Facebook, Google Business, LinkedIn und WhatsApp-Status – inkl. Hashtags, Bildidee und CTA."
        uiInSession={27}
        backendCapabilities={[
          "Mock-Provider deckt 5 Plattformen × 8 Goals × 3 Längen ab (40 Goal-Plattform-Kombinationen).",
          "Plattform-bewusste Hashtag-Anzahl: Instagram 5, LinkedIn 4, Facebook 2, Google-Business / WhatsApp-Status 0.",
          "Hyperlokal + Branche + Betrieb + Topic + Community im Hashtag-Pool, dedupliziert per NFKD-Normalisierung.",
          "Goal-spezifische CTAs (mehr Termine, Aktion bewerben, neuer Service, Bewertung sammeln, …).",
          "longPost wächst monoton mit length: short → 2 Absätze, medium → 3, long → 4 (inkl. USP-Trust-Block).",
        ]}
        upcomingUiFeatures={[
          "Plattform + Goal + Topic in einem Schritt wählen, sofort Vorschau.",
          "Kurz- und Lang-Variante nebeneinander, Hashtags ein/aus-Switch.",
          "Bildidee als Stilhinweis-Box, kopierbar.",
          `Speicher-Slot für „letzte 5 Posts" pro Betrieb (localStorage).`,
          "Gold: Kampagnen über mehrere Wochen (Track A im Backlog).",
        ]}
      />
    </DashboardShell>
  );
}
