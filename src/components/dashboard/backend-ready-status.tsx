import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import { EmptyState } from "./empty-state";
import type { Business } from "@/types/business";

/**
 * Wiederverwendbare Status-Karte für Dashboard-Bereiche, deren
 * **Backend** bereits scharf ist, deren **UI** aber noch fehlt.
 * Ersetzt das generische `ComingSoonSection`-Snippet auf Seiten,
 * wo „Folgt in Session N" nicht mehr stimmt (siehe `/dashboard/<slug>/ai`,
 * `/reviews`, `/social`).
 *
 * Bewusst kompakt: vier Bullets pro Seite reichen — die ausführliche
 * Provider-Status-Tabelle steht zentral auf der `/ai`-Seite.
 */

interface BackendReadyStatusProps {
  readonly business: Business;
  readonly title: string;
  readonly description: string;
  /** Code-Session, in der die UI für diesen Bereich kommt. */
  readonly uiInSession: number;
  /** „Was funktioniert bereits headless?"-Liste (3–6 Bullets). */
  readonly backendCapabilities: readonly string[];
  /** Was die UI bringen wird (3–6 Bullets). */
  readonly upcomingUiFeatures: readonly string[];
}

export function BackendReadyStatus({
  business,
  title,
  description,
  uiInSession,
  backendCapabilities,
  upcomingUiFeatures,
}: BackendReadyStatusProps) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Status
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <Sparkles className="h-3 w-3" aria-hidden />
          Backend bereit · UI in Session {uiInSession}
        </span>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard
          title="Was bereits funktioniert (headless)"
          description="Smoketests im Repo decken diese Methoden ab."
        >
          <ul className="space-y-2 text-sm text-ink-700">
            {backendCapabilities.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 flex-none text-emerald-600"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          title={`Was die UI in Session ${uiInSession} bringt`}
          description="Im Browser anspielbar, mit Copy-to-Clipboard und Provider-Auswahl."
        >
          <ul className="space-y-2 text-sm text-ink-700">
            {upcomingUiFeatures.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 h-4 w-4 flex-none text-ink-400"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <EmptyState
        title="Hier ist noch nichts zum Anfassen"
        description={`Die Backend-Methoden sind über die KI-Schicht erreichbar (siehe Smoketests). Die UI wird in Code-Session ${uiInSession} ergänzt — als Teil des KI-Assistent-Playgrounds bzw. als eigene Seite.`}
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
