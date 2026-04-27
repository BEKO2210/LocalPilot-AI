import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { DashboardCard, DashboardShell, EmptyState } from "@/components/dashboard";
import { hasFeature } from "@/core/pricing";
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
  title: "KI-Assistent – Status",
  robots: { index: false, follow: false },
};

/**
 * Status der KI-Schicht (Stand: Code-Sessions 13–25 abgeschlossen).
 *
 * Die KI-Backend-Methoden sind alle scharf:
 *   - Mock-Provider: alle 7 Methoden deterministisch (Sessions 14–20).
 *   - OpenAI-Provider: 2 Live-Methoden (Sessions 21, 22).
 *   - Anthropic-Provider: 2 Live-Methoden (Sessions 24, 25).
 *   - Gemini-Provider: folgt in Session 26.
 *
 * Was hier noch fehlt: die Dashboard-UI, um die Methoden direkt aus dem
 * Browser anzuspielen. Das kommt in Code-Session 27 als „KI-Assistent-
 * Playground" — eigene Tab-/Karten-UI mit clientseitigem Mock-Aufruf,
 * Copy-to-Clipboard, Provider-Auswahl-Badge.
 *
 * Die Stub-Variante mit „Folgt in Session 13" ist seit Code-Session 25
 * (UI-Catch-Up-Patch) durch diesen ehrlichen Status-Block ersetzt.
 */

interface MethodStatus {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly mock: boolean;
  readonly openai: boolean;
  readonly anthropic: boolean;
  readonly gemini: boolean;
}

const METHODS: readonly MethodStatus[] = [
  {
    id: "generateWebsiteCopy",
    label: "Website-Texte",
    description:
      "Hero-Titel, Hero-Untertitel und Über-uns-Text. 4 Varianten (Hero, About, Services-Intro, Benefits-Intro).",
    mock: true,
    openai: true,
    anthropic: true,
    gemini: false,
  },
  {
    id: "improveServiceDescription",
    label: "Service-Beschreibungen verbessern",
    description:
      "Kurz- und Langversion (≤ 240 / ≤ 2000 Zeichen). Bestehende Beschreibung wird poliert, nicht neu geschrieben.",
    mock: true,
    openai: true,
    anthropic: true,
    gemini: false,
  },
  {
    id: "generateFaqs",
    label: "FAQ-Generator",
    description:
      "Branchen-typische Q/A-Paare aus dem Industry-Preset, optional mit Topic-Hints. Bis zu 20 Einträge mit Deduplizierung.",
    mock: true,
    openai: false,
    anthropic: false,
    gemini: false,
  },
  {
    id: "generateCustomerReply",
    label: "Kundenantworten",
    description:
      "Drei Tonalitäten (kurz / freundlich / professionell). Themenspiegelung bei Termin, Preis, Stornierung, Reklamation.",
    mock: true,
    openai: false,
    anthropic: false,
    gemini: false,
  },
  {
    id: "generateReviewRequest",
    label: "Bewertungs-Anfragen",
    description:
      "Vier Kanäle (WhatsApp / SMS / E-Mail / persönlich) × drei Tonalitäten. Substitution für Kundenname + Bewertungslink.",
    mock: true,
    openai: false,
    anthropic: false,
    gemini: false,
  },
  {
    id: "generateSocialPost",
    label: "Social-Media-Posts",
    description:
      "Fünf Plattformen × acht Goals × drei Längen. Plattform-bewusste Hashtag-Anzahl (Instagram 5, LinkedIn 4, Facebook 2, Google-Business / WhatsApp-Status 0).",
    mock: true,
    openai: false,
    anthropic: false,
    gemini: false,
  },
  {
    id: "generateOfferCampaign",
    label: "Angebots-Kampagnen",
    description:
      "Headline + Subline + mehrteiliger Body + zeit-orientiertes CTA. Validitäts-Hinweis nur bei explizitem `validUntil` (echte Knappheit).",
    mock: true,
    openai: false,
    anthropic: false,
    gemini: false,
  },
];

function StatusDot({ done }: { done: boolean }) {
  return done ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="scharf" />
  ) : (
    <Clock className="h-4 w-4 text-ink-300" aria-label="offen" />
  );
}

export default async function DashboardAiPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  const featureUnlocked = hasFeature(business.packageTier, "ai_website_text");

  return (
    <DashboardShell business={business} active="ai">
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Status
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
              KI-Assistent
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-600">
              Backend-Schicht ist scharf: alle 7 Methoden laufen über den Mock-
              Provider, Website-Texte und Service-Beschreibungen zusätzlich
              live über OpenAI und Anthropic. Die Dashboard-UI zum
              Anspielen folgt in Code-Session 27.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <Sparkles className="h-3 w-3" aria-hidden />
            Backend bereit · UI in Session 27
          </span>
        </header>

        <DashboardCard
          title="Provider-Status"
          description="Welche Provider haben welche Methoden bereits scharf? Mock ist immer aktiv und ohne API-Key nutzbar."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="py-2 pr-3 font-medium">Methode</th>
                  <th className="px-2 text-center font-medium">Mock</th>
                  <th className="px-2 text-center font-medium">OpenAI</th>
                  <th className="px-2 text-center font-medium">Anthropic</th>
                  <th className="px-2 text-center font-medium">Gemini</th>
                </tr>
              </thead>
              <tbody>
                {METHODS.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-ink-100 align-top last:border-b-0"
                  >
                    <td className="py-3 pr-3">
                      <div className="font-medium text-ink-900">{m.label}</div>
                      <div className="mt-0.5 text-xs text-ink-600">
                        {m.description}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <StatusDot done={m.mock} />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <StatusDot done={m.openai} />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <StatusDot done={m.anthropic} />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <StatusDot done={m.gemini} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {featureUnlocked ? (
          <DashboardCard title="Status für Ihr aktuelles Paket">
            <p className="text-sm text-ink-700">
              <span className="font-medium text-emerald-700">
                Freigeschaltet.
              </span>{" "}
              Sobald die Dashboard-UI in Code-Session 27 fertig ist, können
              Sie hier alle 7 Methoden direkt anspielen — beginnend mit dem
              Mock-Provider (deterministisch, ohne API-Key, ohne Kosten).
              OpenAI- und Anthropic-Calls folgen, sobald die geschützte
              API-Route mit Auth steht.
            </p>
          </DashboardCard>
        ) : null}

        <EmptyState
          title="Nichts auszuspielen — die UI fehlt noch"
          description={`Die KI-Methoden funktionieren bereits headless (siehe Smoketests im Repo). Eine Dashboard-Oberfläche zum Anspielen kommt in Code-Session 27 als „KI-Assistent-Playground": Methoden-Picker, Formulare aus den jeweiligen Schemas, Copy-to-Clipboard, Provider-Auswahl-Badge.`}
          action={
            <Link
              href={`/dashboard/${business.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Zur Übersicht
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
      </div>
    </DashboardShell>
  );
}
