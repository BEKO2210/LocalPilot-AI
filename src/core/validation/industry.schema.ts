import { z } from "zod";
import {
  ComplianceTopicSchema,
  CtaIntentSchema,
  IndustryKeySchema,
  RecommendedSectionSchema,
  ReviewRequestChannelSchema,
  SocialPlatformSchema,
  SocialPostGoalSchema,
  ThemeKeySchema,
} from "./common.schema";
import { LeadFormFieldSchema } from "./lead.schema";

export const PresetCtaSchema = z.object({
  key: z.string().min(1).max(40),
  label: z.string().min(2).max(60),
  intent: CtaIntentSchema,
  primary: z.boolean().default(false),
});
export type PresetCta = z.infer<typeof PresetCtaSchema>;

export const PresetServiceSchema = z.object({
  key: z.string().min(1).max(60),
  title: z.string().min(2).max(120),
  shortDescription: z.string().max(240).default(""),
  category: z.string().max(80).optional(),
  defaultPriceLabel: z.string().max(60).optional(),
  defaultDurationLabel: z.string().max(60).optional(),
});
export type PresetService = z.infer<typeof PresetServiceSchema>;

export const PresetFaqSchema = z.object({
  question: z.string().min(3).max(240),
  answer: z.string().min(1).max(2000),
});
export type PresetFaq = z.infer<typeof PresetFaqSchema>;

export const PresetBenefitSchema = z.object({
  title: z.string().min(2).max(120),
  text: z.string().min(2).max(400),
});
export type PresetBenefit = z.infer<typeof PresetBenefitSchema>;

export const PresetProcessStepSchema = z.object({
  step: z.number().int().min(1).max(20),
  title: z.string().min(2).max(120),
  text: z.string().min(2).max(400),
});
export type PresetProcessStep = z.infer<typeof PresetProcessStepSchema>;

export const ReviewRequestTemplateSchema = z.object({
  key: z.string().min(1).max(60),
  channel: ReviewRequestChannelSchema,
  tone: z.enum(["short", "friendly", "follow_up"]),
  body: z
    .string()
    .min(10, "Vorlage zu kurz")
    .max(1000, "Vorlage zu lang"),
});
export type ReviewRequestTemplate = z.infer<typeof ReviewRequestTemplateSchema>;

export const SocialPostPromptSchema = z.object({
  key: z.string().min(1).max(60),
  goal: SocialPostGoalSchema,
  platforms: z.array(SocialPlatformSchema).min(1),
  tone: z.string().min(2).max(60),
  ideaShort: z.string().min(2).max(280),
});
export type SocialPostPrompt = z.infer<typeof SocialPostPromptSchema>;

export const WebsiteCopyPromptSchema = z.object({
  key: z.enum([
    "hero_title",
    "hero_subtitle",
    "about",
    "services_intro",
    "benefits_intro",
    "offer",
  ]),
  prompt: z.string().min(10).max(2000),
});
export type WebsiteCopyPrompt = z.infer<typeof WebsiteCopyPromptSchema>;

export const ImageGuidanceSchema = z.object({
  primaryStyle: z.string().min(2).max(240),
  recommendedSubjects: z.array(z.string().min(2).max(80)).max(20).default([]),
  avoid: z.array(z.string().min(2).max(80)).max(20).default([]),
});
export type ImageGuidance = z.infer<typeof ImageGuidanceSchema>;

export const ComplianceNoteSchema = z.object({
  topic: ComplianceTopicSchema,
  note: z.string().min(4).max(600),
});
export type ComplianceNote = z.infer<typeof ComplianceNoteSchema>;

export const RecommendedPricingLabelSchema = z.object({
  key: z.string().min(1).max(40),
  label: z.string().min(2).max(80),
});
export type RecommendedPricingLabel = z.infer<typeof RecommendedPricingLabelSchema>;

export const IndustryPresetSchema = z.object({
  key: IndustryKeySchema,
  label: z.string().min(2).max(60),
  pluralLabel: z.string().min(2).max(60),
  description: z.string().min(10).max(800),
  targetAudience: z.array(z.string().min(2).max(120)).min(1).max(20),
  defaultTagline: z.string().min(4).max(160),
  defaultHeroTitle: z.string().min(4).max(160),
  defaultHeroSubtitle: z.string().min(4).max(280),
  defaultCtas: z.array(PresetCtaSchema).min(1).max(8),
  recommendedSections: z.array(RecommendedSectionSchema).min(2).max(12),
  defaultServices: z.array(PresetServiceSchema).min(1).max(40),
  defaultFaqs: z.array(PresetFaqSchema).min(1).max(20),
  defaultBenefits: z.array(PresetBenefitSchema).min(1).max(12),
  defaultProcessSteps: z.array(PresetProcessStepSchema).min(0).max(8),
  leadFormFields: z.array(LeadFormFieldSchema).min(2).max(12),
  reviewRequestTemplates: z.array(ReviewRequestTemplateSchema).min(1).max(20),
  socialPostPrompts: z.array(SocialPostPromptSchema).min(1).max(20),
  websiteCopyPrompts: z.array(WebsiteCopyPromptSchema).min(1).max(20),
  recommendedThemes: z.array(ThemeKeySchema).min(1).max(10),
  recommendedPricingLabels: z
    .array(RecommendedPricingLabelSchema)
    .max(20)
    .default([]),
  imageGuidance: ImageGuidanceSchema,
  toneOfVoice: z.array(z.string().min(2).max(40)).min(1).max(10),
  complianceNotes: z.array(ComplianceNoteSchema).max(20).default([]),
});
export type IndustryPreset = z.infer<typeof IndustryPresetSchema>;
