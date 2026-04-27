/**
 * Pricing-Helfer: prüfen, was ein bestimmtes Paket darf,
 * ermitteln das nötige Upgrade, formatieren Preise.
 *
 * Sämtliche Funktionen sind reine Funktionen ohne Seiteneffekte und damit
 * sowohl in Server- als auch in Client-Komponenten nutzbar.
 */

import type {
  FeatureKey,
  PackageTier,
  SupportedCurrency,
} from "@/types/common";
import type { PricingTier, TierLimits } from "@/types/pricing";
import {
  PRICING_TIERS,
  PRICING_TIERS_BY_KEY,
  TIER_ORDER,
} from "./pricing-tiers";

// ---------------------------------------------------------------------------
// Tier-Lookup
// ---------------------------------------------------------------------------

export class UnknownTierError extends Error {
  readonly tier: PackageTier;
  constructor(tier: PackageTier) {
    super(
      `Für die Paketstufe "${tier}" ist aktuell keine Konfiguration hinterlegt. ` +
        `Bekannt: ${Object.keys(PRICING_TIERS_BY_KEY).join(", ")}.`,
    );
    this.name = "UnknownTierError";
    this.tier = tier;
  }
}

/** Gibt die Konfiguration einer Paketstufe zurück, wirft falls unbekannt. */
export function getTier(tier: PackageTier): PricingTier {
  const found = PRICING_TIERS_BY_KEY[tier];
  if (!found) {
    throw new UnknownTierError(tier);
  }
  return found;
}

/** Liefert eine Stufe oder `undefined`, wenn sie nicht konfiguriert ist. */
export function tryGetTier(tier: PackageTier): PricingTier | undefined {
  return PRICING_TIERS_BY_KEY[tier];
}

/** Gibt alle aktiv vermarkteten Stufen zurück. */
export function getAllTiers(): readonly PricingTier[] {
  return PRICING_TIERS;
}

// ---------------------------------------------------------------------------
// Feature-Checks
// ---------------------------------------------------------------------------

/** Hat das angegebene Paket diese Capability freigeschaltet? */
export function hasFeature(tier: PackageTier, feature: FeatureKey): boolean {
  const config = tryGetTier(tier);
  if (!config) return false;
  return config.features.includes(feature);
}

/** Gegenstück zu `hasFeature` – nützlich für UI-Locks. */
export function isFeatureLocked(
  tier: PackageTier,
  feature: FeatureKey,
): boolean {
  return !hasFeature(tier, feature);
}

/**
 * Niedrigste Stufe, die dieses Feature anbietet.
 * Praktisch für Upgrade-Hinweise: "Verfügbar ab Silber".
 */
export function requiredTierFor(
  feature: FeatureKey,
): PackageTier | undefined {
  for (const tier of TIER_ORDER) {
    const config = tryGetTier(tier);
    if (config?.features.includes(feature)) {
      return tier;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

/** Limit-Datensatz für ein bestimmtes Paket. */
export function getTierLimits(tier: PackageTier): TierLimits {
  return getTier(tier).limits;
}

/**
 * Prüft, ob ein konkreter Wert das Limit überschreitet.
 * Nutzungsbeispiel: `isLimitExceeded(tier, "maxServices", services.length)`.
 */
export function isLimitExceeded(
  tier: PackageTier,
  limitKey: keyof TierLimits,
  value: number,
): boolean {
  return value > getTierLimits(tier)[limitKey];
}

// ---------------------------------------------------------------------------
// Tier-Vergleich / Upgrade-Logik
// ---------------------------------------------------------------------------

/** Position der Stufe in der Wertigkeitsreihenfolge. -1 falls unbekannt. */
function rankOf(tier: PackageTier): number {
  return TIER_ORDER.indexOf(tier);
}

/**
 * Vergleicht zwei Stufen.
 * Negativ → `a` ist niedriger, 0 → gleich, positiv → `a` ist höher.
 */
export function compareTiers(a: PackageTier, b: PackageTier): number {
  return rankOf(a) - rankOf(b);
}

/** `current` erfüllt mindestens `required`? */
export function isAtLeastTier(
  current: PackageTier,
  required: PackageTier,
): boolean {
  return compareTiers(current, required) >= 0;
}

/** Nächsthöhere konfigurierte Stufe oder `undefined`, falls bereits am Top. */
export function nextHigherTier(
  current: PackageTier,
): PackageTier | undefined {
  const rank = rankOf(current);
  if (rank < 0) return undefined;
  for (let i = rank + 1; i < TIER_ORDER.length; i++) {
    const candidate = TIER_ORDER[i];
    if (candidate && tryGetTier(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Formatierung
// ---------------------------------------------------------------------------

const CURRENCY_FORMATTERS: Partial<
  Record<SupportedCurrency, Intl.NumberFormat>
> = {};

function getFormatter(currency: SupportedCurrency): Intl.NumberFormat {
  let formatter = CURRENCY_FORMATTERS[currency];
  if (!formatter) {
    formatter = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    CURRENCY_FORMATTERS[currency] = formatter;
  }
  return formatter;
}

/** Lokalisierte Preisanzeige, z. B. `formatPrice(499)` → `"499 €"`. */
export function formatPrice(
  amount: number,
  currency: SupportedCurrency = "EUR",
): string {
  return getFormatter(currency).format(amount);
}

/**
 * Hilfsfunktion für sehr große Limits: Wenn das Limit dem
 * `TIER_UNLIMITED`-Sentinel entspricht, gib eine sprechende Bezeichnung zurück.
 */
export function formatLimit(
  value: number,
  unlimitedLabel = "unbegrenzt",
): string {
  if (value >= Number.MAX_SAFE_INTEGER) return unlimitedLabel;
  return value.toString();
}
