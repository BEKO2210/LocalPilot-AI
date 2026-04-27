import { z } from "zod";
import {
  AILanguageSchema,
  IndustryKeySchema,
  PackageTierSchema,
  PostLengthSchema,
  ReviewRequestChannelSchema,
  SocialPlatformSchema,
  SocialPostGoalSchema,
} from "./common.schema";

/**
 * Gemeinsamer Kontext für jede KI-Generierung.
 *
 * Wird vom Aufrufer zusammengestellt (z. B. aus dem `Business`-Datensatz)
 * und der Provider entscheidet, wie er ihn in seine Prompts integriert.
 */
export const AIBusinessContextSchema = z.object({
  industryKey: IndustryKeySchema,
  packageTier: PackageTierSchema,
  language: AILanguageSchema.default("de"),
  businessName: z.string().min(2).max(120),
  city: z.string().min(2).max(120).optional(),
  toneOfVoice: z.array(z.string().min(2).max(40)).max(8).default([]),
  uniqueSellingPoints: z.array(z.string().min(2).max(160)).max(10).default([]),
});
export type AIBusinessContext = z.infer<typeof AIBusinessContextSchema>;

// ---------------------------------------------------------------------------
// Website-Texte
// ---------------------------------------------------------------------------

export const WebsiteCopyInputSchema = z.object({
  context: AIBusinessContextSchema,
  variant: z
    .enum(["hero", "about", "services_intro", "benefits_intro"])
    .default("hero"),
  hint: z.string().max(800).optional(),
});
export type WebsiteCopyInput = z.infer<typeof WebsiteCopyInputSchema>;

export const WebsiteCopyOutputSchema = z.object({
  heroTitle: z.string().min(2).max(160),
  heroSubtitle: z.string().min(2).max(280),
  aboutText: z.string().min(2).max(1200),
});
export type WebsiteCopyOutput = z.infer<typeof WebsiteCopyOutputSchema>;

// ---------------------------------------------------------------------------
// Service-Beschreibung verbessern
// ---------------------------------------------------------------------------

export const ServiceDescriptionInputSchema = z.object({
  context: AIBusinessContextSchema,
  serviceTitle: z.string().min(2).max(120),
  currentDescription: z.string().max(2000).default(""),
  targetLength: z.enum(["short", "medium", "long"]).default("medium"),
});
export type ServiceDescriptionInput = z.infer<typeof ServiceDescriptionInputSchema>;

export const ServiceDescriptionOutputSchema = z.object({
  shortDescription: z.string().min(2).max(240),
  longDescription: z.string().min(2).max(2000),
});
export type ServiceDescriptionOutput = z.infer<typeof ServiceDescriptionOutputSchema>;

// ---------------------------------------------------------------------------
// FAQ-Generator
// ---------------------------------------------------------------------------

export const FaqGenerationInputSchema = z.object({
  context: AIBusinessContextSchema,
  topics: z.array(z.string().min(2).max(120)).max(20).default([]),
  count: z.number().int().min(1).max(20).default(6),
});
export type FaqGenerationInput = z.infer<typeof FaqGenerationInputSchema>;

export const FaqGenerationOutputSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z.string().min(3).max(240),
        answer: z.string().min(3).max(2000),
      }),
    )
    .min(1)
    .max(20),
});
export type FaqGenerationOutput = z.infer<typeof FaqGenerationOutputSchema>;

// ---------------------------------------------------------------------------
// Bewertungs-Booster
// ---------------------------------------------------------------------------

export const ReviewRequestInputSchema = z.object({
  context: AIBusinessContextSchema,
  channel: ReviewRequestChannelSchema,
  tone: z.enum(["short", "friendly", "follow_up"]).default("friendly"),
  customerName: z.string().max(120).optional(),
  reviewLink: z.string().url().optional(),
});
export type ReviewRequestInput = z.infer<typeof ReviewRequestInputSchema>;

export const ReviewRequestOutputSchema = z.object({
  variants: z
    .array(
      z.object({
        channel: ReviewRequestChannelSchema,
        tone: z.enum(["short", "friendly", "follow_up"]),
        body: z.string().min(10).max(1000),
      }),
    )
    .min(1)
    .max(8),
});
export type ReviewRequestOutput = z.infer<typeof ReviewRequestOutputSchema>;

// ---------------------------------------------------------------------------
// Social-Media-Generator
// ---------------------------------------------------------------------------

export const SocialPostInputSchema = z.object({
  context: AIBusinessContextSchema,
  platform: SocialPlatformSchema,
  goal: SocialPostGoalSchema,
  topic: z.string().min(2).max(280),
  length: PostLengthSchema.default("medium"),
  includeHashtags: z.boolean().default(true),
});
export type SocialPostInput = z.infer<typeof SocialPostInputSchema>;

export const SocialPostOutputSchema = z.object({
  shortPost: z.string().min(2).max(280),
  longPost: z.string().min(2).max(2000),
  hashtags: z.array(z.string().min(2).max(40)).max(20).default([]),
  imageIdea: z.string().min(2).max(280),
  cta: z.string().min(2).max(160),
});
export type SocialPostOutput = z.infer<typeof SocialPostOutputSchema>;

// ---------------------------------------------------------------------------
// Kundenantworten
// ---------------------------------------------------------------------------

export const CustomerReplyInputSchema = z.object({
  context: AIBusinessContextSchema,
  customerMessage: z.string().min(2).max(4000),
  tone: z.enum(["short", "friendly", "professional"]).default("friendly"),
});
export type CustomerReplyInput = z.infer<typeof CustomerReplyInputSchema>;

export const CustomerReplyOutputSchema = z.object({
  reply: z.string().min(2).max(2000),
});
export type CustomerReplyOutput = z.infer<typeof CustomerReplyOutputSchema>;

// ---------------------------------------------------------------------------
// Angebots-/Kampagnen-Generator (Gold)
// ---------------------------------------------------------------------------

export const OfferCampaignInputSchema = z.object({
  context: AIBusinessContextSchema,
  offerTitle: z.string().min(2).max(160),
  details: z.string().max(2000).default(""),
  validUntil: z.string().max(40).optional(),
});
export type OfferCampaignInput = z.infer<typeof OfferCampaignInputSchema>;

export const OfferCampaignOutputSchema = z.object({
  headline: z.string().min(2).max(120),
  subline: z.string().min(2).max(280),
  bodyText: z.string().min(2).max(2000),
  cta: z.string().min(2).max(120),
});
export type OfferCampaignOutput = z.infer<typeof OfferCampaignOutputSchema>;

// ---------------------------------------------------------------------------
// Provider-Interface (rein typseitig, Implementierung in Session 13)
// ---------------------------------------------------------------------------

export const AIErrorCodeSchema = z.enum([
  "no_api_key",
  "provider_unavailable",
  "rate_limited",
  "invalid_input",
  "empty_response",
  "unknown",
]);
export type AIErrorCode = z.infer<typeof AIErrorCodeSchema>;

export class AIProviderError extends Error {
  readonly code: AIErrorCode;

  constructor(code: AIErrorCode, message: string) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
  }
}

export interface AIProvider {
  readonly key: import("@/types/common").AIProviderKey;
  generateWebsiteCopy(input: WebsiteCopyInput): Promise<WebsiteCopyOutput>;
  improveServiceDescription(
    input: ServiceDescriptionInput,
  ): Promise<ServiceDescriptionOutput>;
  generateFaqs(input: FaqGenerationInput): Promise<FaqGenerationOutput>;
  generateReviewRequest(
    input: ReviewRequestInput,
  ): Promise<ReviewRequestOutput>;
  generateSocialPost(input: SocialPostInput): Promise<SocialPostOutput>;
  generateCustomerReply(
    input: CustomerReplyInput,
  ): Promise<CustomerReplyOutput>;
  generateOfferCampaign(
    input: OfferCampaignInput,
  ): Promise<OfferCampaignOutput>;
}
