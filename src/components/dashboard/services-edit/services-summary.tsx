import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { getTier, getTierLimits, formatLimit } from "@/core/pricing";
import type { PackageTier } from "@/types/common";

type ServicesSummaryProps = {
  tier: PackageTier;
  count: number;
  activeCount: number;
  featuredCount: number;
};

/**
 * Live-Indikator: wie viele Leistungen sind genutzt, wo liegt das
 * Paket-Limit, ist Upgrade nötig?
 */
export function ServicesSummary({
  tier,
  count,
  activeCount,
  featuredCount,
}: ServicesSummaryProps) {
  const limits = getTierLimits(tier);
  const limit = limits.maxServices;
  const tierConfig = getTier(tier);
  const ratio = Math.min(count / limit, 1) * 100;

  const atLimit = count >= limit;
  const overLimit = count > limit;

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Leistungen-Auslastung
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink-900">
            {count}
            <span className="text-base font-normal text-ink-500">
              {" "}
              / {formatLimit(limit)}
            </span>
          </p>
          <p className="mt-1 text-xs text-ink-600">
            Aktiv: <strong>{activeCount}</strong> · Hervorgehoben:{" "}
            <strong>{featuredCount}</strong> · Paket: <strong>{tierConfig.label}</strong>
          </p>
        </div>

        {(atLimit || overLimit) && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            <AlertTriangle className="h-3 w-3" aria-hidden />
            {overLimit ? "Über Limit" : "Limit erreicht"} — Upgrade ansehen
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        )}
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            overLimit
              ? "bg-rose-500"
              : atLimit
                ? "bg-amber-500"
                : "bg-brand-600",
          )}
          style={{ width: `${ratio}%` }}
          aria-hidden
        />
      </div>

      {overLimit ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          Sie haben {count - limit} Leistung(en) mehr als Ihr Paket erlaubt.
          Vor dem Speichern entweder Leistungen entfernen oder das Paket
          aufstocken.
        </p>
      ) : atLimit ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Limit erreicht. Neue Leistungen werden erst nach einem Upgrade
          akzeptiert (Bronze → 10, Silber → 30, Gold → 100).
        </p>
      ) : null}
    </div>
  );
}
