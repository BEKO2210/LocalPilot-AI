import { cn } from "@/lib/cn";
import { isFeatureLocked } from "@/core/pricing";
import { UpgradeHint } from "./upgrade-hint";
import type { FeatureKey, PackageTier } from "@/types/common";

type FeatureLockProps = {
  feature: FeatureKey;
  currentTier: PackageTier;
  children: React.ReactNode;
  /** Default: legt einen visuellen Lock-Overlay über die Inhalte. */
  variant?: "overlay" | "replace";
  upgradeHref?: string;
  className?: string;
};

/**
 * Wrappt UI-Bereiche, die paketabhängig sind.
 *
 * - `overlay` (default): Inhalte bleiben sichtbar, werden gedimmt und mit
 *   einem Hinweis überlagert. Gut für Listen und Karten, deren Form Teil der
 *   Verkaufsbotschaft ist.
 * - `replace`: Inhalte werden durch einen kompakten Upgrade-Hinweis ersetzt.
 *   Gut für komplexe Formulare oder schwere Komponenten.
 *
 * Ist das Feature freigeschaltet, werden die Kinder unverändert gerendert.
 */
export function FeatureLock({
  feature,
  currentTier,
  children,
  variant = "overlay",
  upgradeHref,
  className,
}: FeatureLockProps) {
  const locked = isFeatureLocked(currentTier, feature);

  if (!locked) {
    return <>{children}</>;
  }

  if (variant === "replace") {
    return (
      <div className={className}>
        <UpgradeHint feature={feature} upgradeHref={upgradeHref} />
      </div>
    );
  }

  return (
    <div className={cn("relative isolate", className)}>
      <div
        aria-hidden
        className="pointer-events-none select-none opacity-50 blur-[1px]"
      >
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex items-end justify-center p-3">
        <UpgradeHint
          feature={feature}
          upgradeHref={upgradeHref}
          className="max-w-md shadow-soft"
        />
      </div>
    </div>
  );
}
