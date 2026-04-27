import { z } from "zod";
import {
  ColorHexSchema,
  EmailSchema,
  IdSchema,
  IndustryKeySchema,
  IsoDateSchema,
  OpeningHoursSchema,
  PackageTierSchema,
  PhoneSchema,
  SlugSchema,
  SupportedLocaleSchema,
  ThemeKeySchema,
  UrlSchema,
} from "./common.schema";
import { ServiceSchema } from "./service.schema";
import { ReviewSchema } from "./review.schema";
import { FAQSchema } from "./faq.schema";

export const TeamMemberSchema = z.object({
  id: IdSchema,
  name: z.string().min(2).max(120),
  role: z.string().min(2).max(120),
  photoUrl: UrlSchema.optional(),
  bio: z.string().max(800).optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

/**
 * Adresse als eigene Entität, damit Mehrstandort-Betriebe (Gold/Platin) später
 * problemlos andocken können, ohne das Business-Modell zu ändern.
 */
export const AddressSchema = z.object({
  street: z.string().min(2).max(160),
  city: z.string().min(2).max(120),
  postalCode: z.string().min(2).max(20),
  country: z
    .string()
    .length(2, "ISO-3166-Alpha-2 Ländercode erwartet (z. B. 'DE')")
    .default("DE"),
});
export type Address = z.infer<typeof AddressSchema>;

export const ContactDetailsSchema = z.object({
  phone: PhoneSchema.optional(),
  email: EmailSchema.optional(),
  website: UrlSchema.optional(),
  whatsapp: PhoneSchema.optional(),
  googleMapsUrl: UrlSchema.optional(),
  googleReviewUrl: UrlSchema.optional(),
});
export type ContactDetails = z.infer<typeof ContactDetailsSchema>;

/**
 * Vollständiger Betrieb inklusive seiner abhängigen Datensätze.
 *
 * Dieses Modell ist absichtlich "fett": für die Public Site lädt der Resolver
 * einen Business-Datensatz mit allem, was sie braucht (services, reviews, faqs).
 * Die Repository-Schicht (Session 19) entscheidet, woher diese Daten kommen.
 */
export const BusinessSchema = z.object({
  id: IdSchema,
  slug: SlugSchema,
  name: z.string().min(2).max(120),
  industryKey: IndustryKeySchema,
  packageTier: PackageTierSchema,
  locale: SupportedLocaleSchema.default("de"),
  tagline: z.string().min(2).max(160),
  description: z.string().min(10).max(2000),
  logoUrl: UrlSchema.optional(),
  coverImageUrl: UrlSchema.optional(),
  address: AddressSchema,
  contact: ContactDetailsSchema,
  openingHours: OpeningHoursSchema,
  themeKey: ThemeKeySchema,
  primaryColor: ColorHexSchema.optional(),
  secondaryColor: ColorHexSchema.optional(),
  accentColor: ColorHexSchema.optional(),
  services: z.array(ServiceSchema).default([]),
  teamMembers: z.array(TeamMemberSchema).default([]),
  reviews: z.array(ReviewSchema).default([]),
  faqs: z.array(FAQSchema).default([]),
  isPublished: z.boolean().default(false),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type Business = z.infer<typeof BusinessSchema>;
