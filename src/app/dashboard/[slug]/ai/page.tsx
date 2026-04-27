import { DashboardShell } from "@/components/dashboard";
import { AIPlayground } from "@/components/dashboard/ai-playground";
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
  const business = await loadBusinessOrNotFound(slug);

  return (
    <DashboardShell business={business} active="ai">
      <AIPlayground business={business} />
    </DashboardShell>
  );
}
