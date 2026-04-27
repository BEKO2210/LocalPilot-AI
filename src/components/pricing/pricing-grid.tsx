import { cn } from "@/lib/cn";
import { getAllTiers } from "@/core/pricing";
import { PricingCard } from "./pricing-card";
import type { PricingTier } from "@/types/pricing";
import type { PackageTier } from "@/types/common";

type PricingGridProps = {
  tiers?: readonly PricingTier[];
  ctaHref?: string;
  currentTier?: PackageTier;
  className?: string;
};

export function PricingGrid({
  tiers,
  ctaHref = "#kontakt",
  currentTier,
  className,
}: PricingGridProps) {
  const list = tiers ?? getAllTiers();

  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-3",
        list.length === 2 && "lg:grid-cols-2",
        list.length >= 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {list.map((tier) => (
        <PricingCard
          key={tier.key}
          tier={tier}
          ctaHref={ctaHref}
          currentTier={currentTier}
        />
      ))}
    </div>
  );
}
