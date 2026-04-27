import Link from "next/link";
import { Briefcase, Inbox, Sparkles, Star } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { hasFeature, isFeatureLocked, requiredTierFor } from "@/core/pricing";
import type { Business } from "@/types/business";
import type { FeatureKey, PackageTier } from "@/types/common";

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  feature?: FeatureKey;
};

type QuickActionsCardProps = {
  business: Business;
};

const TIER_LABEL: Record<PackageTier, string> = {
  bronze: "Bronze",
  silber: "Silber",
  gold: "Gold",
  platin: "Platin",
};

export function QuickActionsCard({ business }: QuickActionsCardProps) {
  const slug = business.slug;
  const tier = business.packageTier;

  const actions: QuickAction[] = [
    {
      href: `/dashboard/${slug}/services`,
      label: "Neue Leistung",
      description: "Titel, Preis-Label und Kategorie hinzufügen.",
      icon: Briefcase,
      feature: "service_management",
    },
    {
      href: `/dashboard/${slug}/leads`,
      label: "Anfragen prüfen",
      description: "Status setzen, Notizen pflegen.",
      icon: Inbox,
      feature: "lead_management",
    },
    {
      href: `/dashboard/${slug}/reviews`,
      label: "Bewertung anfragen",
      description: "Vorlage kopieren, an Kund:in senden.",
      icon: Star,
      feature: "review_booster_basic",
    },
    {
      href: `/dashboard/${slug}/ai`,
      label: "KI-Text erstellen",
      description: "Headline, Service-Beschreibung oder Antwort.",
      icon: Sparkles,
      feature: "ai_website_text",
    },
  ];

  return (
    <DashboardCard
      title="Schnellaktionen"
      description="Was Sie als nächstes tun könnten."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const locked = action.feature
            ? isFeatureLocked(tier, action.feature)
            : false;
          const required = action.feature
            ? requiredTierFor(action.feature)
            : undefined;

          return (
            <li key={action.label}>
              <Link
                href={action.href}
                aria-disabled={locked || undefined}
                className={`group flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  locked
                    ? "border-ink-200 bg-ink-50/60 hover:bg-ink-50"
                    : "border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/40"
                }`}
              >
                <span
                  className={`inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg ${
                    locked
                      ? "bg-ink-100 text-ink-500"
                      : "bg-brand-50 text-brand-700"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-600">
                    {locked && required
                      ? `Verfügbar ab ${TIER_LABEL[required]}`
                      : action.description}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {!hasFeature(tier, "ai_website_text") ? (
        <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs text-amber-900">
          KI-Aktionen sind in Bronze noch gesperrt.{" "}
          <Link href="/pricing" className="font-medium underline">
            Pakete vergleichen
          </Link>
          .
        </p>
      ) : null}
    </DashboardCard>
  );
}
