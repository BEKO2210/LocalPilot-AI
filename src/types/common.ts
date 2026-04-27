/**
 * Gemeinsame Schlüssel und Primitive für das LocalPilot-AI-Datenmodell.
 *
 * Diese Datei enthält bewusst keine Zod-Abhängigkeit, damit sie auch in
 * Edge-/Client-Kontexten ohne Validierungsoverhead nutzbar ist.
 * Die Zod-Schemas leben in `src/core/validation/`.
 */

// ---------------------------------------------------------------------------
// Primitive
// ---------------------------------------------------------------------------

/** Stabile, vom System vergebene ID (UUID, ULID oder slug-basiert). */
export type Id = string;

/** ISO-8601-Datum als String (z. B. "2026-04-27T08:30:00Z"). */
export type IsoDate = string;

/** URL-tauglicher Slug, z. B. "studio-haarlinie". */
export type Slug = string;

/** Hex-Farbe inkl. Raute, z. B. "#1f47d6". */
export type ColorHex = string;

// ---------------------------------------------------------------------------
// Pakete
// ---------------------------------------------------------------------------

export const PACKAGE_TIERS = ["bronze", "silber", "gold", "platin"] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

/**
 * Einzelne Capabilities, die je Paket aktiv sind.
 * `services_max_*`-Limits sind separat als numerische Limits modelliert.
 */
export const FEATURE_KEYS = [
  "public_website",
  "industry_preset",
  "single_theme",
  "multiple_themes",
  "premium_themes",
  "service_listing",
  "service_management",
  "contact_form_basic",
  "lead_management",
  "opening_hours",
  "google_maps_link",
  "review_link",
  "review_booster_basic",
  "review_booster_advanced",
  "ai_website_text",
  "ai_service_text",
  "ai_faq_generator",
  "ai_customer_reply",
  "ai_social_post",
  "ai_offer_generator",
  "ai_campaign_generator",
  "social_media_basic",
  "social_media_advanced",
  "multi_section_landing",
  "team_section",
  "lead_priority",
  "performance_analytics",
  "multilingual_content",
  "multi_location_ready",
  "copy_to_clipboard",
  "basic_seo",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

// ---------------------------------------------------------------------------
// Branchen
// ---------------------------------------------------------------------------

/**
 * Bekannte Branchen-Schlüssel.
 *
 * Neue Branchen werden hier ergänzt und in `src/core/industries/` als Preset
 * registriert. Schlüssel sind snake_case auf Englisch, damit sie URL-,
 * DB- und ENV-tauglich bleiben.
 */
export const INDUSTRY_KEYS = [
  "hairdresser",
  "barbershop",
  "auto_workshop",
  "cleaning_company",
  "cosmetic_studio",
  "nail_studio",
  "craftsman_general",
  "electrician",
  "painter",
  "driving_school",
  "tutoring",
  "personal_trainer",
  "photographer",
  "real_estate_broker",
  "restaurant",
  "cafe",
  "local_shop",
  "dog_grooming",
  "wellness_practice",
  "garden_landscaping",
] as const;
export type IndustryKey = (typeof INDUSTRY_KEYS)[number];

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

export const THEME_KEYS = [
  "clean_light",
  "premium_dark",
  "warm_local",
  "medical_clean",
  "beauty_luxury",
  "automotive_strong",
  "craftsman_solid",
  "creative_studio",
  "fitness_energy",
  "education_calm",
] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

export const THEME_RADII = ["none", "sm", "md", "lg", "xl", "2xl"] as const;
export type ThemeRadius = (typeof THEME_RADII)[number];

export const THEME_SHADOWS = ["none", "subtle", "soft", "elevated"] as const;
export type ThemeShadow = (typeof THEME_SHADOWS)[number];

export const SECTION_STYLES = ["compact", "comfortable", "spacious"] as const;
export type SectionStyle = (typeof SECTION_STYLES)[number];

export const BUTTON_STYLES = ["rounded", "pill", "square"] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

export const CARD_STYLES = ["flat", "outlined", "soft", "elevated"] as const;
export type CardStyle = (typeof CARD_STYLES)[number];

// ---------------------------------------------------------------------------
// Lead-System
// ---------------------------------------------------------------------------

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
  "archived",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "website_form",
  "phone",
  "whatsapp",
  "email",
  "walk_in",
  "referral",
  "social",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_FORM_FIELD_TYPES = [
  "text",
  "phone",
  "email",
  "textarea",
  "select",
  "date",
  "time",
  "number",
] as const;
export type LeadFormFieldType = (typeof LEAD_FORM_FIELD_TYPES)[number];

// ---------------------------------------------------------------------------
// Bewertungen
// ---------------------------------------------------------------------------

export const REVIEW_SOURCES = [
  "google",
  "facebook",
  "internal",
  "trustpilot",
  "other",
] as const;
export type ReviewSource = (typeof REVIEW_SOURCES)[number];

export const REVIEW_REQUEST_CHANNELS = [
  "whatsapp",
  "sms",
  "email",
  "in_person",
] as const;
export type ReviewRequestChannel = (typeof REVIEW_REQUEST_CHANNELS)[number];

// ---------------------------------------------------------------------------
// Social Media
// ---------------------------------------------------------------------------

export const SOCIAL_PLATFORMS = [
  "instagram",
  "facebook",
  "google_business",
  "linkedin",
  "whatsapp_status",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_POST_GOALS = [
  "more_appointments",
  "promote_offer",
  "new_service",
  "collect_review",
  "seasonal",
  "before_after",
  "trust_building",
  "team_intro",
] as const;
export type SocialPostGoal = (typeof SOCIAL_POST_GOALS)[number];

export const POST_LENGTHS = ["short", "medium", "long"] as const;
export type PostLength = (typeof POST_LENGTHS)[number];

// ---------------------------------------------------------------------------
// Sektionen, CTAs und sonstige UI-Bausteine
// ---------------------------------------------------------------------------

export const RECOMMENDED_SECTIONS = [
  "hero",
  "services",
  "benefits",
  "process",
  "reviews",
  "faq",
  "contact",
  "opening_hours",
  "location",
  "team",
  "gallery",
  "offers",
] as const;
export type RecommendedSection = (typeof RECOMMENDED_SECTIONS)[number];

export const CTA_INTENTS = [
  "call",
  "whatsapp",
  "appointment",
  "form",
  "directions",
  "review",
  "email",
  "custom",
] as const;
export type CtaIntent = (typeof CTA_INTENTS)[number];

export const COMPLIANCE_TOPICS = [
  "medical",
  "legal",
  "finance",
  "general",
] as const;
export type ComplianceTopic = (typeof COMPLIANCE_TOPICS)[number];

// ---------------------------------------------------------------------------
// Wochentage / Öffnungszeiten
// ---------------------------------------------------------------------------

export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

// ---------------------------------------------------------------------------
// AI-Provider
// ---------------------------------------------------------------------------

export const AI_PROVIDER_KEYS = [
  "mock",
  "openai",
  "anthropic",
  "gemini",
] as const;
export type AIProviderKey = (typeof AI_PROVIDER_KEYS)[number];

export const AI_LANGUAGES = ["de", "en"] as const;
export type AILanguage = (typeof AI_LANGUAGES)[number];

// ---------------------------------------------------------------------------
// Sprache / Lokalisierung
// ---------------------------------------------------------------------------

export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "de";

// ---------------------------------------------------------------------------
// Währung
// ---------------------------------------------------------------------------

export const SUPPORTED_CURRENCIES = ["EUR", "CHF"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = "EUR";
