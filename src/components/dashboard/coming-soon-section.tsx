import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "./empty-state";
import { hasFeature, requiredTierFor } from "@/core/pricing";
import type { Business } from "@/types/business";
import type { FeatureKey, PackageTier } from "@/types/common";

type ComingSoonSectionProps = {
  business: Business;
  title: string;
  description: string;
  /** Welche Session diesen Bereich ausbaut. */
  comingInSession: number;
  /** Was wird der Bereich konkret können (3-6 Stichpunkte)? */
  upcomingFeatures: readonly string[];
  /**
   * Optional: Feature, das diesen Bereich gatet.
   * Wenn gesetzt, wird zusätzlich gezeigt, ob das aktuelle Paket es enthält
   * und welches Upgrade nötig wäre.
   */
  gatingFeature?: FeatureKey;
};

const TIER_LABEL: Record<PackageTier, string> = {
  bronze: "Bronze",
  silber: "Silber",
  gold: "Gold",
  platin: "Platin",
};

/**
 * Vorschau-Karte für Dashboard-Bereiche, die in einer späteren Session
 * vollständig ausgebaut werden. Statt einer leeren Seite zeigen wir, was
 * geplant ist und ob das aktuelle Paket den Bereich überhaupt freischaltet.
 */
export function ComingSoonSection({
  business,
  title,
  description,
  comingInSession,
  upcomingFeatures,
  gatingFeature,
}: ComingSoonSectionProps) {
  const currentTier = business.packageTier;
  const featureUnlocked = gatingFeature
    ? hasFeature(currentTier, gatingFeature)
    : true;
  const requiredTier = gatingFeature ? requiredTierFor(gatingFeature) : undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Vorschau
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
          <Sparkles className="h-3 w-3" aria-hidden />
          Folgt in Session {comingInSession}
        </span>
      </header>

      <DashboardCard
        title="Was diese Sektion können wird"
        description="Roadmap aus dem Master-Briefing (Claude.md)."
      >
        <ul className="space-y-2 text-sm text-ink-700">
          {upcomingFeatures.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full bg-brand-600" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </DashboardCard>

      {gatingFeature ? (
        <DashboardCard title="Status für Ihr aktuelles Paket">
          {featureUnlocked ? (
            <p className="text-sm text-ink-700">
              <span className="font-medium text-emerald-700">Freigeschaltet.</span>{" "}
              Das Paket <strong>{TIER_LABEL[currentTier]}</strong> enthält
              diese Funktion. Sobald Session {comingInSession} live ist, können
              Sie hier loslegen.
            </p>
          ) : (
            <p className="text-sm text-ink-700">
              <span className="font-medium text-amber-700">Im Paket Bronze gesperrt.</span>{" "}
              Diese Funktion ist ab{" "}
              <strong>{requiredTier ? TIER_LABEL[requiredTier] : "Silber"}</strong>{" "}
              enthalten. Sie können bereits jetzt im Hintergrund vorbereitet werden.
            </p>
          )}
        </DashboardCard>
      ) : null}

      <EmptyState
        title={`Inhalte folgen mit Session ${comingInSession}`}
        description="Aktuell ist dieser Bereich nur als Vorschau hinterlegt. In der Übersicht sehen Sie schon Paketstatus, Anfragen und Schnellaktionen für diesen Betrieb."
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
  );
}
