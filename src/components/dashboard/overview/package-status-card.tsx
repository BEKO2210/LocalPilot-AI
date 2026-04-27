import Link from "next/link";
import { ArrowUpRight, Crown } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { formatPrice, getTier, nextHigherTier } from "@/core/pricing";
import type { Business } from "@/types/business";
import type { PackageTier } from "@/types/common";

type PackageStatusCardProps = {
  business: Business;
};

/** Aktiv vermarktete Stufen in Reihenfolge – für die Fortschrittsanzeige. */
const ACTIVE_TIERS: readonly PackageTier[] = ["bronze", "silber", "gold"];

export function PackageStatusCard({ business }: PackageStatusCardProps) {
  const tier = getTier(business.packageTier);
  const next = nextHigherTier(business.packageTier);
  const nextTier = next ? getTier(next) : null;

  const currentRank = ACTIVE_TIERS.indexOf(business.packageTier);
  const ratio = ((Math.max(currentRank, 0) + 1) / ACTIVE_TIERS.length) * 100;

  return (
    <DashboardCard
      title="Aktuelles Paket"
      description="Welche Funktionen Ihr Betrieb aktiv nutzen kann."
      action={
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          Vergleichen
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Crown className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold text-ink-900">{tier.label}</p>
          <p className="text-xs text-ink-600">
            {formatPrice(tier.monthlyPrice, tier.currency)} pro Monat ·{" "}
            {formatPrice(tier.setupPrice, tier.currency)} Setup
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-brand-600"
            style={{ width: `${ratio}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-ink-500">
          <span>Bronze</span>
          <span>Silber</span>
          <span>Gold</span>
        </div>
      </div>

      {nextTier ? (
        <p className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-xs text-brand-900">
          <strong>Nächste Stufe: {nextTier.label}.</strong>{" "}
          {formatPrice(nextTier.monthlyPrice, nextTier.currency)} pro Monat
          schaltet u. a. weitere KI-Tools, Themes und Lead-Funktionen frei.
        </p>
      ) : (
        <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-900">
          <strong>Top-Stufe.</strong> Alle aktuell vermarkteten Funktionen sind enthalten.
        </p>
      )}
    </DashboardCard>
  );
}
