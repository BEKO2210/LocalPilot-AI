import { z } from "zod";
import {
  FeatureKeySchema,
  MoneyAmountSchema,
  PackageTierSchema,
  SupportedCurrencySchema,
} from "./common.schema";
import { DEFAULT_CURRENCY } from "@/types/common";

/**
 * Numerische Limits pro Paket. `unlimited` wird durch eine sehr hohe Zahl
 * (Infinity wird in JSON nicht serialisiert) abgebildet, damit Vergleiche
 * trivial bleiben. `Number.MAX_SAFE_INTEGER` reicht in der Praxis.
 */
export const TIER_UNLIMITED = Number.MAX_SAFE_INTEGER;

export const TierLimitsSchema = z.object({
  maxServices: z.number().int().positive(),
  maxLandingPages: z.number().int().positive(),
  maxLanguages: z.number().int().positive(),
  maxLocations: z.number().int().positive(),
  maxThemes: z.number().int().positive(),
  maxAiGenerationsPerMonth: z.number().int().nonnegative(),
  maxLeads: z.number().int().nonnegative(),
});
export type TierLimits = z.infer<typeof TierLimitsSchema>;

export const PricingTierSchema = z.object({
  key: PackageTierSchema,
  label: z.string().min(2).max(40),
  setupPrice: MoneyAmountSchema,
  monthlyPrice: MoneyAmountSchema,
  currency: SupportedCurrencySchema.default(DEFAULT_CURRENCY),
  description: z.string().min(2).max(400),
  features: z.array(FeatureKeySchema).default([]),
  limits: TierLimitsSchema,
  recommendedFor: z.array(z.string().min(2).max(120)).default([]),
  ctaLabel: z.string().min(2).max(40),
  isHighlighted: z.boolean().default(false),
});
export type PricingTier = z.infer<typeof PricingTierSchema>;
