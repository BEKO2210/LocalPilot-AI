import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard";
import { AIPlayground } from "@/components/dashboard/ai-playground";
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
  title: "KI-Assistent",
  robots: { index: false, follow: false },
};

/**
 * KI-Assistent-Playground (Code-Session 27).
 *
 * Ablöse der Status-Stub-Seite aus Code-Session 25 durch ein echtes
 * Dashboard-UI: 7 Methoden-Picker + dynamisches Formular +
 * Ergebnis-Panel mit Copy-to-Clipboard. Aufruf clientseitig direkt
 * gegen den Mock-Provider — funktioniert auch im Static Export auf
 * GitHub Pages, kein Backend nötig.
 *
 * Live-Provider-Calls (OpenAI / Anthropic / Gemini) bleiben dem
 * API-Route-mit-Auth-Schritt aus Code-Session 28+ vorbehalten,
 * damit kein API-Key in den Browser-Bundle landet.
 */
export default async function DashboardAiPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <DashboardShell business={business} active="ai">
      <AIPlayground business={business} />
    </DashboardShell>
  );
}
