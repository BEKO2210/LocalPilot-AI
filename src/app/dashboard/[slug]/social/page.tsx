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
  title: "Social-Media-Generator – Vorschau",
  robots: { index: false, follow: false },
};

export default async function DashboardSocialPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="social">
      <ComingSoonSection
        business={business}
        title="Social-Media-Generator"
        description="Posts für Instagram, Facebook und Google Business – inkl. Hashtags, Bildidee und CTA."
        comingInSession={17}
        gatingFeature="ai_social_post"
        upcomingFeatures={[
          "Plattform und Ziel wählen (Termine, Aktion, Bewertung sammeln, …)",
          "Tonalität aus dem Industry-Preset",
          "Kurz- und Lang-Variante mit Hashtags",
          "Bildidee plus optionale Story-Idee",
          "Gold: Kampagnen über mehrere Wochen",
        ]}
      />
    </DashboardShell>
  );
}
