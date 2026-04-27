import { notFound } from "next/navigation";
import { BackendReadyStatus, DashboardShell } from "@/components/dashboard";
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
  title: "Bewertungs-Booster – Status",
  robots: { index: false, follow: false },
};

export default async function DashboardReviewsPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="reviews">
      <BackendReadyStatus
        business={business}
        title="Bewertungs-Booster"
        description="Vorlagen für WhatsApp, SMS, E-Mail und persönlich – mit Platzhaltern für Kundenname und Bewertungslink."
        uiInSession={27}
        backendCapabilities={[
          "Mock-Provider liefert deterministische Vorlagen für alle 4 Kanäle × 3 Tonalitäten (kurz / freundlich / Follow-Up).",
          "Substitution für {{customerName}}, {{reviewLink}}, {{businessName}}.",
          "Branchen-spezifische Saatzeilen aus preset.reviewRequestTemplates (sofern hinterlegt) — sonst synthetisiert.",
          `in_person nutzt gesprochenen Stil mit „…"-Anführungszeichen.`,
          "Defensive Schema-Validierung; ungültige reviewLink-URLs werden mit invalid_input abgewiesen.",
        ]}
        upcomingUiFeatures={[
          "Bewertungslink des Betriebs zentral pflegen (Settings).",
          "Variante wählen, Platzhalter füllen, Copy-to-Clipboard.",
          "Live-Vorschau der drei Tonalitäts-Optionen nebeneinander.",
          "Direktversand-Buttons (mailto:, wa.me, sms:) für Mobile.",
          "Silber/Gold: A/B-Test über mehrere Tonalitäten mit Tracking-Param.",
        ]}
      />
    </DashboardShell>
  );
}
