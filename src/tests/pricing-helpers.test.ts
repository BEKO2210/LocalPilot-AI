/**
 * Smoketest für die Pricing-Helfer aus Session 3.
 *
 * Wie die übrigen Tests in diesem Ordner läuft dieser Test bewusst ohne
 * Test-Runner: jede Assertion ist ein direkter `if (...) throw`. Damit greifen
 * sowohl `tsc --noEmit` (Typkonsistenz) als auch ein einfacher
 * `node --import tsx --test`-Lauf (Laufzeitverhalten), sobald Vitest in
 * Session 20 ergänzt wird.
 */

import {
  BRONZE_TIER,
  SILBER_TIER,
  GOLD_TIER,
  PRICING_TIERS,
  TIER_ORDER,
  compareTiers,
  formatLimit,
  formatPrice,
  getAllTiers,
  getTier,
  getTierLimits,
  hasFeature,
  isAtLeastTier,
  isFeatureLocked,
  isLimitExceeded,
  nextHigherTier,
  requiredTierFor,
  tryGetTier,
  UnknownTierError,
} from "@/core/pricing";
import { TIER_UNLIMITED } from "@/core/validation/pricing.schema";
import { FEATURE_KEYS, type FeatureKey, type PackageTier } from "@/types/common";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Pricing helper assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Tier-Lookup
// ---------------------------------------------------------------------------

assert(getTier("bronze") === BRONZE_TIER, "getTier('bronze') liefert BRONZE_TIER");
assert(getTier("silber") === SILBER_TIER, "getTier('silber') liefert SILBER_TIER");
assert(getTier("gold") === GOLD_TIER, "getTier('gold') liefert GOLD_TIER");
assert(tryGetTier("platin") === undefined, "platin ist (noch) nicht konfiguriert");

let unknownTierThrew = false;
try {
  getTier("platin");
} catch (error) {
  unknownTierThrew = error instanceof UnknownTierError;
}
assert(unknownTierThrew, "getTier('platin') wirft UnknownTierError");

assert(getAllTiers().length === 3, "Genau drei aktiv vermarktete Stufen");
assert(PRICING_TIERS.length === 3, "PRICING_TIERS hat genau drei Einträge");

// ---------------------------------------------------------------------------
// Reihenfolge / Vergleich
// ---------------------------------------------------------------------------

assert(TIER_ORDER[0] === "bronze", "Bronze ist der unterste Tier");
assert(TIER_ORDER[1] === "silber", "Silber kommt nach Bronze");
assert(TIER_ORDER[2] === "gold", "Gold kommt nach Silber");
assert(TIER_ORDER[3] === "platin", "Platin ist als Top-Stufe vorgesehen");

assert(compareTiers("bronze", "silber") < 0, "Bronze < Silber");
assert(compareTiers("gold", "silber") > 0, "Gold > Silber");
assert(compareTiers("silber", "silber") === 0, "Silber == Silber");

assert(isAtLeastTier("gold", "silber"), "Gold erfüllt Silber");
assert(!isAtLeastTier("bronze", "silber"), "Bronze erfüllt nicht Silber");
assert(isAtLeastTier("bronze", "bronze"), "Bronze erfüllt Bronze");

assert(nextHigherTier("bronze") === "silber", "Bronze → Silber");
assert(nextHigherTier("silber") === "gold", "Silber → Gold");
assert(nextHigherTier("gold") === undefined, "Gold ist (aktuell) das Top");

// ---------------------------------------------------------------------------
// Feature-Checks (Vererbung Bronze → Silber → Gold)
// ---------------------------------------------------------------------------

assert(hasFeature("bronze", "public_website"), "Bronze hat öffentliche Website");
assert(!hasFeature("bronze", "ai_website_text"), "Bronze hat keine KI-Texte");
assert(hasFeature("silber", "public_website"), "Silber erbt Bronze-Features");
assert(hasFeature("silber", "ai_website_text"), "Silber hat KI-Texte");
assert(!hasFeature("silber", "ai_campaign_generator"), "Silber hat keinen Kampagnen-Generator");
assert(hasFeature("gold", "ai_campaign_generator"), "Gold hat Kampagnen-Generator");
assert(hasFeature("gold", "public_website"), "Gold erbt alle Bronze/Silber-Features");

assert(isFeatureLocked("bronze", "ai_social_post"), "Social-Posts sind in Bronze gesperrt");
assert(!isFeatureLocked("silber", "ai_social_post"), "Social-Posts in Silber freigeschaltet");

assert(requiredTierFor("ai_campaign_generator") === "gold", "Kampagnen brauchen Gold");
assert(requiredTierFor("ai_website_text") === "silber", "KI-Texte brauchen Silber");
assert(requiredTierFor("public_website") === "bronze", "Website schon ab Bronze");

// Sicherheit: jedes Feature, das mindestens irgendwo aktiv ist, hat ein required tier.
const ALL_FEATURES_IN_USE: ReadonlySet<FeatureKey> = new Set(
  PRICING_TIERS.flatMap((tier) => tier.features),
);
for (const feature of ALL_FEATURES_IN_USE) {
  const required = requiredTierFor(feature);
  assert(required !== undefined, `Feature ${feature} hat eine erste Stufe`);
}

// Konsistenz: jeder FeatureKey hat ein Klartext-Label (Compile-Zeit-geprüft via Record-Typ),
// hier zusätzlich Laufzeitprüfung.
import { FEATURE_LABELS } from "@/core/pricing/feature-labels";
for (const key of FEATURE_KEYS) {
  const label = FEATURE_LABELS[key];
  assert(typeof label.label === "string" && label.label.length > 0, `Label für ${key}`);
}

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

assert(getTierLimits("bronze").maxServices === 10, "Bronze maxServices = 10");
assert(getTierLimits("silber").maxServices === 30, "Silber maxServices = 30");
assert(getTierLimits("gold").maxServices === 100, "Gold maxServices = 100");

assert(isLimitExceeded("bronze", "maxServices", 11), "11 Leistungen > Bronze-Limit");
assert(!isLimitExceeded("bronze", "maxServices", 10), "10 Leistungen = Bronze-Limit");
assert(!isLimitExceeded("silber", "maxServices", 25), "25 Leistungen unter Silber-Limit");

assert(getTierLimits("bronze").maxLeads === TIER_UNLIMITED, "Leads sind in Bronze unbegrenzt");
assert(getTierLimits("gold").maxThemes === TIER_UNLIMITED, "Themes in Gold unbegrenzt");

// ---------------------------------------------------------------------------
// Formatierung
// ---------------------------------------------------------------------------

const formatted499 = formatPrice(499);
assert(formatted499.includes("499"), `formatPrice enthält 499: ${formatted499}`);
assert(formatted499.includes("€"), `formatPrice nutzt EUR-Symbol: ${formatted499}`);

assert(formatLimit(10) === "10", "formatLimit für endliche Werte");
assert(formatLimit(TIER_UNLIMITED) === "unbegrenzt", "formatLimit für unbegrenzt");
assert(formatLimit(TIER_UNLIMITED, "ohne Limit") === "ohne Limit", "Eigene Bezeichnung");

// ---------------------------------------------------------------------------
// Sicherstellung der Vererbung Bronze ⊂ Silber ⊂ Gold
// ---------------------------------------------------------------------------

const bronzeSet = new Set(BRONZE_TIER.features);
const silberSet = new Set(SILBER_TIER.features);
const goldSet = new Set(GOLD_TIER.features);
for (const f of bronzeSet) assert(silberSet.has(f), `Silber muss ${f} erben`);
for (const f of silberSet) assert(goldSet.has(f), `Gold muss ${f} erben`);

// Nicht-Trivialität: Silber und Gold haben jeweils mindestens ein zusätzliches Feature.
assert(silberSet.size > bronzeSet.size, "Silber hat zusätzliche Features");
assert(goldSet.size > silberSet.size, "Gold hat zusätzliche Features");

// Damit Linter/Bundler die Datei nicht als ungenutzt entfernen.
const _ALL_TIERS_FOR_TYPE_CHECK: readonly PackageTier[] = TIER_ORDER;
export const __PRICING_HELPERS_SMOKETEST__ = {
  bronzeFeatureCount: bronzeSet.size,
  silberFeatureCount: silberSet.size,
  goldFeatureCount: goldSet.size,
  tierOrder: _ALL_TIERS_FOR_TYPE_CHECK,
};
