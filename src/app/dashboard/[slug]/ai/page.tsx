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
  title: "KI-Assistent – Vorschau",
  robots: { index: false, follow: false },
};

export default async function DashboardAiPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="ai">
      <ComingSoonSection
        business={business}
        title="KI-Assistent"
        description="Texte für Website, Antworten und FAQ – auf Knopfdruck und passend zur Branche."
        comingInSession={13}
        gatingFeature="ai_website_text"
        upcomingFeatures={[
          "Provider-Adapter für Mock, OpenAI, Anthropic und Gemini",
          "Branchen-Kontext aus dem Industry-Preset (Tonalität, USPs)",
          "Hero-, Über-uns- und Service-Texte generieren",
          "Kundenantworten kurz/freundlich/professionell",
          "FAQ-Generator mit branchen-typischen Fragen",
          "Mock-Modus ohne API-Key – sofort nutzbar",
        ]}
      />
    </DashboardShell>
  );
}
