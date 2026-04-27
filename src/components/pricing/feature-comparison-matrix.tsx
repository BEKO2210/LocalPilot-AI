import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  FEATURE_LABELS,
  type FeatureGroup,
  hasFeature,
  getAllTiers,
} from "@/core/pricing";
import { FEATURE_KEYS, type FeatureKey, type PackageTier } from "@/types/common";

const GROUP_ORDER: readonly FeatureGroup[] = [
  "website",
  "design",
  "lead",
  "review",
  "ai",
  "social",
  "operations",
];

const GROUP_LABEL: Record<FeatureGroup, string> = {
  website: "Website",
  design: "Design",
  lead: "Anfragen",
  review: "Bewertungen",
  ai: "KI-Assistent",
  social: "Social Media",
  operations: "Verwaltung",
};

function groupedFeatures(): Record<FeatureGroup, FeatureKey[]> {
  const result: Record<FeatureGroup, FeatureKey[]> = {
    website: [],
    design: [],
    lead: [],
    review: [],
    ai: [],
    social: [],
    operations: [],
  };
  for (const key of FEATURE_KEYS) {
    const group = FEATURE_LABELS[key].group;
    result[group].push(key);
  }
  return result;
}

type FeatureComparisonMatrixProps = {
  className?: string;
};

/**
 * Vollständige Feature-Vergleichsmatrix Bronze/Silber/Gold.
 *
 * Reihen kommen aus FEATURE_LABELS (gruppiert), Spalten aus den aktiv
 * vermarkteten Tiers. Die Werte werden zur Build-Zeit aus
 * `hasFeature()` berechnet – keine Doppelpflege, keine Drift.
 */
export function FeatureComparisonMatrix({ className }: FeatureComparisonMatrixProps) {
  const groups = groupedFeatures();
  const tiers = getAllTiers();

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="bg-ink-50">
            <th className="sticky left-0 z-10 rounded-tl-2xl border-b border-ink-200 bg-ink-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-500">
              Funktion
            </th>
            {tiers.map((tier, idx) => {
              const isHighlighted = tier.isHighlighted;
              return (
                <th
                  key={tier.key}
                  scope="col"
                  className={cn(
                    "border-b border-ink-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide",
                    idx === tiers.length - 1 && "rounded-tr-2xl",
                    isHighlighted ? "bg-brand-50 text-brand-800" : "text-ink-700",
                  )}
                >
                  {tier.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {GROUP_ORDER.map((group) => {
            const features = groups[group];
            if (features.length === 0) return null;
            return (
              <FeatureGroupRows
                key={group}
                group={group}
                features={features}
                tierKeys={tiers.map((t) => t.key)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FeatureGroupRows({
  group,
  features,
  tierKeys,
}: {
  group: FeatureGroup;
  features: readonly FeatureKey[];
  tierKeys: readonly PackageTier[];
}) {
  return (
    <>
      <tr>
        <th
          scope="rowgroup"
          colSpan={tierKeys.length + 1}
          className="border-b border-ink-200 bg-white px-4 pb-2 pt-6 text-left text-xs font-semibold uppercase tracking-wide text-ink-500"
        >
          {GROUP_LABEL[group]}
        </th>
      </tr>
      {features.map((featureKey, rowIdx) => {
        const label = FEATURE_LABELS[featureKey];
        const isLast = rowIdx === features.length - 1;
        return (
          <tr key={featureKey} className="hover:bg-ink-50/60">
            <th
              scope="row"
              className={cn(
                "sticky left-0 z-10 bg-white px-4 py-3 align-top",
                !isLast && "border-b border-ink-200/70",
              )}
            >
              <span className="block text-sm font-medium text-ink-900">
                {label.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink-500">
                {label.description}
              </span>
            </th>
            {tierKeys.map((tier) => {
              const enabled = hasFeature(tier, featureKey);
              return (
                <td
                  key={tier}
                  className={cn(
                    "px-4 py-3 text-center",
                    !isLast && "border-b border-ink-200/70",
                  )}
                >
                  {enabled ? (
                    <Check
                      className="mx-auto h-5 w-5 text-brand-600"
                      aria-label={`In ${tier} enthalten`}
                    />
                  ) : (
                    <Minus
                      className="mx-auto h-4 w-4 text-ink-300"
                      aria-label={`In ${tier} nicht enthalten`}
                    />
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
