import Link from "next/link";
import { Lock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  getFeatureLabel,
  getTier,
  requiredTierFor,
} from "@/core/pricing";
import type { FeatureKey, PackageTier } from "@/types/common";

type UpgradeHintProps = {
  /**
   * Genau eines von `feature` oder `requiredTier` muss gesetzt sein.
   * `feature` schlägt automatisch die nötige Stufe nach.
   */
  feature?: FeatureKey;
  requiredTier?: PackageTier;
  upgradeHref?: string;
  className?: string;
  /** Kompakte Inline-Variante ohne Icon-Hintergrund. */
  inline?: boolean;
};

/**
 * Kleiner Hinweis: "Verfügbar ab Silber" o. Ä.
 * Wird dort eingesetzt, wo das gesperrte Feature gar nicht sichtbar sein soll,
 * sondern nur ein Verweis aufs Upgrade.
 */
export function UpgradeHint({
  feature,
  requiredTier,
  upgradeHref = "/#pakete",
  className,
  inline = false,
}: UpgradeHintProps) {
  const resolvedTier = requiredTier ?? (feature ? requiredTierFor(feature) : undefined);
  if (!resolvedTier) return null;

  const tierConfig = getTier(resolvedTier);
  const featureLabel = feature ? getFeatureLabel(feature).label : null;

  if (inline) {
    return (
      <Link
        href={upgradeHref}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:text-brand-800",
          className,
        )}
      >
        <Lock className="h-3.5 w-3.5" aria-hidden />
        {featureLabel ? `${featureLabel} · ` : null}
        Verfügbar ab {tierConfig.label}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-900",
        className,
      )}
    >
      <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-white text-brand-700 shadow-soft">
        <Lock className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-medium">
          {featureLabel ?? "Diese Funktion"} ist ab {tierConfig.label} verfügbar.
        </p>
        <Link
          href={upgradeHref}
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          Pakete vergleichen
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
