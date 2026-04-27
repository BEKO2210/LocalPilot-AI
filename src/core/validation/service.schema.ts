import { z } from "zod";
import { IdSchema, UrlSchema } from "./common.schema";

/**
 * Eine einzelne Leistung eines Betriebs.
 *
 * `priceLabel` und `durationLabel` sind absichtlich freie Strings, weil viele
 * lokale Betriebe Preise als "ab 39 €" oder "auf Anfrage" angeben wollen.
 * Strukturierte Preise lassen sich später ergänzen, ohne den Typ zu brechen.
 */
export const ServiceSchema = z.object({
  id: IdSchema,
  businessId: IdSchema,
  category: z.string().min(1).max(80).optional(),
  title: z.string().min(2, "Titel zu kurz").max(120, "Titel zu lang"),
  shortDescription: z.string().max(240, "Maximal 240 Zeichen").default(""),
  longDescription: z.string().max(2000, "Maximal 2000 Zeichen").default(""),
  priceLabel: z.string().max(60).optional(),
  durationLabel: z.string().max(60).optional(),
  imageUrl: UrlSchema.optional(),
  icon: z.string().max(40).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
});
export type Service = z.infer<typeof ServiceSchema>;
