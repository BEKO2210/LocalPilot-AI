import { cn } from "@/lib/cn";
import { formatLimit, getAllTiers, getTierLimits } from "@/core/pricing";
import type { TierLimits } from "@/types/pricing";

const LIMIT_ROWS: ReadonlyArray<{
  key: keyof TierLimits;
  label: string;
  description: string;
}> = [
  {
    key: "maxServices",
    label: "Leistungen",
    description: "Wie viele Leistungen Sie auf der Website zeigen können.",
  },
  {
    key: "maxLandingPages",
    label: "Landingpage-Sektionen",
    description: "Eigene Aktions- oder Saisonseiten zusätzlich zur Hauptseite.",
  },
  {
    key: "maxLanguages",
    label: "Sprachen",
    description: "Mehrsprachige Inhalte für internationale Kund:innen.",
  },
  {
    key: "maxLocations",
    label: "Standorte",
    description: "Anzahl Filialen, die im selben Vertrag laufen können.",
  },
  {
    key: "maxThemes",
    label: "Designs",
    description: "Wie viele Themes parallel verwaltet werden dürfen.",
  },
  {
    key: "maxAiGenerationsPerMonth",
    label: "KI-Generierungen / Monat",
    description: "Inkludierte KI-Texte für Website, Antworten und Posts.",
  },
  {
    key: "maxLeads",
    label: "Anfragen",
    description: "Pro Monat angenommene Lead-Einträge.",
  },
];

type LimitsTableProps = {
  className?: string;
};

export function LimitsTable({ className }: LimitsTableProps) {
  const tiers = getAllTiers();

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="bg-ink-50">
            <th className="rounded-tl-2xl border-b border-ink-200 bg-ink-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-500">
              Limit
            </th>
            {tiers.map((tier, idx) => (
              <th
                key={tier.key}
                className={cn(
                  "border-b border-ink-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide",
                  idx === tiers.length - 1 && "rounded-tr-2xl",
                  tier.isHighlighted ? "bg-brand-50 text-brand-800" : "text-ink-700",
                )}
              >
                {tier.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LIMIT_ROWS.map((row, rowIdx) => {
            const isLast = rowIdx === LIMIT_ROWS.length - 1;
            return (
              <tr key={row.key} className="hover:bg-ink-50/60">
                <th
                  scope="row"
                  className={cn(
                    "bg-white px-4 py-3 align-top",
                    !isLast && "border-b border-ink-200/70",
                  )}
                >
                  <span className="block text-sm font-medium text-ink-900">
                    {row.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-500">
                    {row.description}
                  </span>
                </th>
                {tiers.map((tier) => {
                  const value = getTierLimits(tier.key)[row.key];
                  return (
                    <td
                      key={tier.key}
                      className={cn(
                        "px-4 py-3 text-center text-sm font-semibold text-ink-900",
                        !isLast && "border-b border-ink-200/70",
                      )}
                    >
                      {formatLimit(value)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
