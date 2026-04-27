/**
 * Konkrete Pricing-Konfiguration für LocalPilot AI.
 *
 * Bronze, Silber und Gold sind die aktiv vermarkteten Stufen.
 * Platin existiert als String-Literal-Type (siehe `@/types/common`),
 * wird aber als "auf Anfrage" geführt und hat hier bewusst keinen
 * Datensatz – die Funktionsmenge dieser Stufe (Automationen, CRM,
 * WhatsApp-Anbindung) wird erst nach Session 22 modelliert.
 *
 * Jeder Datensatz wird beim Laden des Moduls über das Zod-Schema validiert.
 * Falls hier jemand einen FeatureKey vertippt oder ein Limit vergisst,
 * schlägt die App schon beim Booten fehl – das ist beabsichtigt.
 */

import type { PackageTier, FeatureKey } from "@/types/common";
import { PricingTierSchema, TIER_UNLIMITED } from "@/core/validation/pricing.schema";
import type { PricingTier, TierLimits } from "@/types/pricing";

// ---------------------------------------------------------------------------
// Feature-Vererbung
// ---------------------------------------------------------------------------

/** Genau die Capabilities, die in Bronze enthalten sind. */
const BRONZE_FEATURES: readonly FeatureKey[] = [
  "public_website",
  "industry_preset",
  "single_theme",
  "service_listing",
  "contact_form_basic",
  "opening_hours",
  "google_maps_link",
  "review_link",
  "review_booster_basic",
  "basic_seo",
];

/** Was Silber ZUSÄTZLICH zu Bronze freischaltet. */
const SILBER_ONLY_FEATURES: readonly FeatureKey[] = [
  "service_management",
  "lead_management",
  "review_booster_advanced",
  "ai_website_text",
  "ai_service_text",
  "ai_customer_reply",
  "ai_faq_generator",
  "ai_social_post",
  "social_media_basic",
  "multiple_themes",
  "copy_to_clipboard",
];

/** Was Gold ZUSÄTZLICH zu Silber freischaltet. */
const GOLD_ONLY_FEATURES: readonly FeatureKey[] = [
  "multi_section_landing",
  "ai_offer_generator",
  "ai_campaign_generator",
  "social_media_advanced",
  "multilingual_content",
  "premium_themes",
  "team_section",
  "lead_priority",
  "performance_analytics",
  "multi_location_ready",
];

const SILBER_FEATURES = [...BRONZE_FEATURES, ...SILBER_ONLY_FEATURES];
const GOLD_FEATURES = [...SILBER_FEATURES, ...GOLD_ONLY_FEATURES];

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

const BRONZE_LIMITS: TierLimits = {
  maxServices: 10,
  maxLandingPages: 1,
  maxLanguages: 1,
  maxLocations: 1,
  maxThemes: 1,
  maxAiGenerationsPerMonth: 0,
  maxLeads: TIER_UNLIMITED,
};

const SILBER_LIMITS: TierLimits = {
  maxServices: 30,
  maxLandingPages: 1,
  maxLanguages: 1,
  maxLocations: 1,
  maxThemes: 5,
  maxAiGenerationsPerMonth: 200,
  maxLeads: TIER_UNLIMITED,
};

const GOLD_LIMITS: TierLimits = {
  maxServices: 100,
  maxLandingPages: 5,
  maxLanguages: 3,
  maxLocations: 3,
  maxThemes: TIER_UNLIMITED,
  maxAiGenerationsPerMonth: 1000,
  maxLeads: TIER_UNLIMITED,
};

// ---------------------------------------------------------------------------
// Tier-Datensätze (Marketing-Texte werden über Zod auf Mindestlängen geprüft)
// ---------------------------------------------------------------------------

export const BRONZE_TIER: PricingTier = PricingTierSchema.parse({
  key: "bronze",
  label: "Bronze",
  setupPrice: 499,
  monthlyPrice: 49,
  currency: "EUR",
  description:
    "Schnelle, saubere digitale Präsenz für kleine Betriebe ohne Marketingressourcen.",
  features: BRONZE_FEATURES,
  marketingHighlights: [
    "Eine öffentliche Website",
    "Branchen-Preset & Basis-Theme",
    "Bis zu 10 Leistungen",
    "Kontaktformular & Bewertungslink",
    "Öffnungszeiten & Google-Maps-Link",
  ],
  limits: BRONZE_LIMITS,
  recommendedFor: [
    "Inhabergeführte Betriebe ohne eigene Website",
    "Kunden, die schnell sichtbar werden möchten",
  ],
  ctaLabel: "Bronze anfragen",
  isHighlighted: false,
});

export const SILBER_TIER: PricingTier = PricingTierSchema.parse({
  key: "silber",
  label: "Silber",
  setupPrice: 999,
  monthlyPrice: 99,
  currency: "EUR",
  description:
    "Dashboard, KI-Texte und Bewertungs-Booster nehmen wiederkehrende Marketing-Aufgaben ab.",
  features: SILBER_FEATURES,
  marketingHighlights: [
    "Alles aus Bronze",
    "Dashboard für Inhalte & Anfragen",
    "KI-Texte für Website & Antworten",
    "Bewertungs-Booster mit mehreren Vorlagen",
    "Social-Media-Postgenerator",
    "Bis zu 30 Leistungen, mehrere Themes",
  ],
  limits: SILBER_LIMITS,
  recommendedFor: [
    "Etablierte Betriebe mit regelmäßigem Marketingbedarf",
    "Teams, die Inhalte selbst pflegen wollen",
  ],
  ctaLabel: "Silber anfragen",
  isHighlighted: true,
});

export const GOLD_TIER: PricingTier = PricingTierSchema.parse({
  key: "gold",
  label: "Gold",
  setupPrice: 1999,
  monthlyPrice: 199,
  currency: "EUR",
  description:
    "Vollständiges lokales Marketing-System mit Kampagnen, Mehrsprachigkeit und Premium-Designs.",
  features: GOLD_FEATURES,
  marketingHighlights: [
    "Alles aus Silber",
    "Mehrere Landingpage-Sektionen",
    "Kampagnen- & Angebots-Generator",
    "Premium-Themes & Mehrsprachigkeit",
    "Team-Bereich, Lead-Priorisierung, Auswertung",
    "Bis zu 100 Leistungen, Mehrstandorte vorbereitet",
  ],
  limits: GOLD_LIMITS,
  recommendedFor: [
    "Wachsende Betriebe mit mehreren Leistungen oder Standorten",
    "Marketingaffine Teams, die Kampagnen fahren",
  ],
  ctaLabel: "Gold anfragen",
  isHighlighted: false,
});

// ---------------------------------------------------------------------------
// Registrierung
// ---------------------------------------------------------------------------

/**
 * Reihenfolge entspricht der Wertigkeit (aufsteigend).
 * `compareTiers()` und Upgrade-Logik bauen darauf auf.
 */
export const TIER_ORDER: readonly PackageTier[] = [
  "bronze",
  "silber",
  "gold",
  "platin",
];

/** Aktiv vermarktete Stufen (Platin ist auf Anfrage und nicht enthalten). */
export const PRICING_TIERS: readonly PricingTier[] = [
  BRONZE_TIER,
  SILBER_TIER,
  GOLD_TIER,
];

/**
 * Lookup-Map. Für `platin` existiert bewusst kein Eintrag – der
 * `getTier()`-Helper wirft in dem Fall einen sprechenden Fehler.
 */
export const PRICING_TIERS_BY_KEY: Readonly<
  Partial<Record<PackageTier, PricingTier>>
> = {
  bronze: BRONZE_TIER,
  silber: SILBER_TIER,
  gold: GOLD_TIER,
};

/**
 * Pakete, die in Marketing-Karten dargestellt werden. Identisch zu
 * `PRICING_TIERS`, eigener Export, falls Marketing später eine andere
 * Sortierung oder Auswahl braucht.
 */
export function getMarketingTiers(): readonly PricingTier[] {
  return PRICING_TIERS;
}
