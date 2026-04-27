import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { LinkButton } from "@/components/ui/button";
import { formatPrice } from "@/core/pricing";
import type { PricingTier } from "@/types/pricing";
import type { PackageTier } from "@/types/common";

type PricingCardProps = {
  tier: PricingTier;
  ctaHref: string;
  /**
   * Wenn gesetzt und identisch mit `tier.key`, wird die Karte als
   * "Aktuelles Paket" markiert (z. B. im Dashboard).
   */
  currentTier?: PackageTier;
  className?: string;
};

export function PricingCard({
  tier,
  ctaHref,
  currentTier,
  className,
}: PricingCardProps) {
  const isCurrent = currentTier === tier.key;
  const isHighlighted = tier.isHighlighted;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white p-7 shadow-soft",
        isHighlighted
          ? "border-brand-600 ring-2 ring-brand-600/15"
          : "border-ink-200",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-ink-900">{tier.label}</h3>
        <div className="flex flex-wrap justify-end gap-2">
          {isCurrent ? (
            <span className="rounded-full bg-ink-900 px-2.5 py-1 text-xs font-medium text-white">
              Aktuelles Paket
            </span>
          ) : null}
          {isHighlighted ? (
            <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white">
              Beliebt
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-sm text-ink-600">{tier.description}</p>

      <div className="mt-5 space-y-1">
        <p className="text-2xl font-semibold text-ink-900">
          {formatPrice(tier.monthlyPrice, tier.currency)}
          <span className="text-sm font-normal text-ink-600"> / Monat</span>
        </p>
        <p className="text-sm text-ink-600">
          {formatPrice(tier.setupPrice, tier.currency)} einmalig
        </p>
      </div>

      {tier.marketingHighlights.length > 0 ? (
        <ul className="mt-6 space-y-3 text-sm text-ink-700">
          {tier.marketingHighlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
              <Check
                className="mt-0.5 h-4 w-4 flex-none text-brand-600"
                aria-hidden
              />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {tier.recommendedFor.length > 0 ? (
        <p className="mt-6 text-xs uppercase tracking-wide text-ink-500">
          Passend für: {tier.recommendedFor[0]}
        </p>
      ) : null}

      <LinkButton
        href={ctaHref}
        variant={isHighlighted ? "primary" : "outline"}
        className="mt-7"
        aria-disabled={isCurrent}
      >
        {isCurrent ? "Bereits aktiv" : tier.ctaLabel}
      </LinkButton>
    </div>
  );
}
