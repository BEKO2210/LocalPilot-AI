/**
 * Subset von BusinessSchema für den Bearbeitungs-Editor (Session 10).
 *
 * Im Dashboard ändert die Inhaberin Stammdaten + Branding. Services,
 * Reviews, FAQs, TeamMembers leben in eigenen Editoren (Sessions 11+).
 * Slug, Paket, Veröffentlichungsstatus und Systemfelder bleiben in den
 * Settings (Session 18) bzw. werden vom Repository-Layer verwaltet.
 */

import { z } from "zod";
import {
  AddressSchema,
  ContactDetailsSchema,
} from "./business.schema";
import {
  ColorHexSchema,
  IndustryKeySchema,
  OpeningHoursSchema,
  SupportedLocaleSchema,
  ThemeKeySchema,
  UrlSchema,
} from "./common.schema";

export const BusinessProfileSchema = z.object({
  name: z.string().min(2, "Name zu kurz").max(120, "Name zu lang"),
  industryKey: IndustryKeySchema,
  locale: SupportedLocaleSchema.default("de"),
  tagline: z
    .string()
    .min(2, "Bitte einen kurzen Untertitel angeben")
    .max(160, "Maximal 160 Zeichen"),
  description: z
    .string()
    .min(10, "Mindestens 10 Zeichen Beschreibung")
    .max(2000, "Maximal 2000 Zeichen"),
  logoUrl: UrlSchema.optional().or(z.literal("").transform(() => undefined)),
  coverImageUrl: UrlSchema.optional().or(z.literal("").transform(() => undefined)),
  address: AddressSchema,
  contact: ContactDetailsSchema,
  openingHours: OpeningHoursSchema,
  themeKey: ThemeKeySchema,
  primaryColor: ColorHexSchema.optional().or(
    z.literal("").transform(() => undefined),
  ),
  secondaryColor: ColorHexSchema.optional().or(
    z.literal("").transform(() => undefined),
  ),
  accentColor: ColorHexSchema.optional().or(
    z.literal("").transform(() => undefined),
  ),
});

export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;
