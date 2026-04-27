import { z } from "zod";
import {
  AI_LANGUAGES,
  AI_PROVIDER_KEYS,
  BUTTON_STYLES,
  CARD_STYLES,
  COMPLIANCE_TOPICS,
  CTA_INTENTS,
  DEFAULT_CURRENCY,
  FEATURE_KEYS,
  INDUSTRY_KEYS,
  LEAD_FORM_FIELD_TYPES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  PACKAGE_TIERS,
  POST_LENGTHS,
  RECOMMENDED_SECTIONS,
  REVIEW_REQUEST_CHANNELS,
  REVIEW_SOURCES,
  SECTION_STYLES,
  SOCIAL_PLATFORMS,
  SOCIAL_POST_GOALS,
  SUPPORTED_CURRENCIES,
  SUPPORTED_LOCALES,
  THEME_KEYS,
  THEME_RADII,
  THEME_SHADOWS,
  WEEK_DAYS,
} from "@/types/common";

// ---------------------------------------------------------------------------
// Primitive
// ---------------------------------------------------------------------------

export const IdSchema = z.string().min(1, "id darf nicht leer sein");

export const IsoDateSchema = z
  .string()
  .min(1, "Datum darf nicht leer sein")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Datum muss ein ISO-8601-String sein",
  });

export const SlugSchema = z
  .string()
  .min(2, "Slug zu kurz")
  .max(64, "Slug zu lang")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug nur a-z, 0-9 und Bindestriche",
  });

export const ColorHexSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: 'Hex-Farbe wie "#1f47d6" erforderlich',
  });

export const PhoneSchema = z
  .string()
  .min(4, "Telefonnummer zu kurz")
  .max(40, "Telefonnummer zu lang");

export const EmailSchema = z.string().email("Bitte eine gültige E-Mail eingeben");

export const UrlSchema = z.string().url("Bitte eine gültige URL eingeben");

// ---------------------------------------------------------------------------
// Enum-Schemas (alle aus Konstanten in @/types/common abgeleitet)
// ---------------------------------------------------------------------------

export const PackageTierSchema = z.enum(PACKAGE_TIERS);
export const FeatureKeySchema = z.enum(FEATURE_KEYS);
export const IndustryKeySchema = z.enum(INDUSTRY_KEYS);
export const ThemeKeySchema = z.enum(THEME_KEYS);
export const ThemeRadiusSchema = z.enum(THEME_RADII);
export const ThemeShadowSchema = z.enum(THEME_SHADOWS);
export const SectionStyleSchema = z.enum(SECTION_STYLES);
export const ButtonStyleSchema = z.enum(BUTTON_STYLES);
export const CardStyleSchema = z.enum(CARD_STYLES);
export const LeadStatusSchema = z.enum(LEAD_STATUSES);
export const LeadSourceSchema = z.enum(LEAD_SOURCES);
export const LeadFormFieldTypeSchema = z.enum(LEAD_FORM_FIELD_TYPES);
export const ReviewSourceSchema = z.enum(REVIEW_SOURCES);
export const ReviewRequestChannelSchema = z.enum(REVIEW_REQUEST_CHANNELS);
export const SocialPlatformSchema = z.enum(SOCIAL_PLATFORMS);
export const SocialPostGoalSchema = z.enum(SOCIAL_POST_GOALS);
export const PostLengthSchema = z.enum(POST_LENGTHS);
export const RecommendedSectionSchema = z.enum(RECOMMENDED_SECTIONS);
export const CtaIntentSchema = z.enum(CTA_INTENTS);
export const ComplianceTopicSchema = z.enum(COMPLIANCE_TOPICS);
export const WeekDaySchema = z.enum(WEEK_DAYS);
export const AIProviderKeySchema = z.enum(AI_PROVIDER_KEYS);
export const AILanguageSchema = z.enum(AI_LANGUAGES);
export const SupportedLocaleSchema = z.enum(SUPPORTED_LOCALES);
export const SupportedCurrencySchema = z.enum(SUPPORTED_CURRENCIES);

// ---------------------------------------------------------------------------
// Geld
// ---------------------------------------------------------------------------

export const MoneyAmountSchema = z
  .number()
  .int("Beträge sind als ganze Einheiten zu speichern")
  .nonnegative("Beträge dürfen nicht negativ sein");

export const PriceSchema = z.object({
  amount: MoneyAmountSchema,
  currency: SupportedCurrencySchema.default(DEFAULT_CURRENCY),
});
export type Price = z.infer<typeof PriceSchema>;

// ---------------------------------------------------------------------------
// Öffnungszeiten
// ---------------------------------------------------------------------------

const TimeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "Uhrzeit im Format HH:mm",
  });

export const OpeningSlotSchema = z
  .object({
    open: TimeOfDaySchema,
    close: TimeOfDaySchema,
  })
  .refine((slot) => slot.open < slot.close, {
    message: "Öffnungs- muss vor Schließzeit liegen",
  });
export type OpeningSlot = z.infer<typeof OpeningSlotSchema>;

export const OpeningHoursDaySchema = z.object({
  day: WeekDaySchema,
  closed: z.boolean().default(false),
  slots: z.array(OpeningSlotSchema).default([]),
});
export type OpeningHoursDay = z.infer<typeof OpeningHoursDaySchema>;

export const OpeningHoursSchema = z
  .array(OpeningHoursDaySchema)
  .max(7, "Maximal 7 Tage")
  .refine(
    (days) => new Set(days.map((d) => d.day)).size === days.length,
    { message: "Ein Wochentag darf nur einmal vorkommen" },
  );
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;
