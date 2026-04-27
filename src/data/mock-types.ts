/**
 * Plan der Mock-Datenstruktur (wird in Session 6 mit Inhalten gefüllt).
 *
 * Ziel: ein einziges, validiertes Bundle, das alle Demo-Inhalte für die App
 * trägt. Damit kann die Public Site (`/site/[slug]`) und das Dashboard ohne
 * externe DB laufen, bis Supabase in Session 19 angebunden wird.
 *
 * Diese Datei enthält bewusst noch keine konkreten Mock-Inhalte. Sie definiert
 * nur die Form. Real-Daten kommen in `src/data/mock-businesses.ts`,
 * `mock-services.ts`, `mock-reviews.ts`, `mock-leads.ts`.
 */

import { z } from "zod";
import { BusinessSchema } from "@/core/validation/business.schema";
import { LeadSchema } from "@/core/validation/lead.schema";
import { IsoDateSchema } from "@/core/validation/common.schema";

import type { Business } from "@/types/business";
import type { Lead } from "@/types/lead";

/**
 * Übergreifende Form aller Mock-Daten.
 *
 * - `businesses`: jeder Eintrag enthält bereits seine `services`, `reviews`,
 *   `faqs`, `teamMembers` (siehe BusinessSchema). Damit fungiert er als
 *   "vollständig geladene" Domänenentität, wie sie auch eine echte Repository-
 *   Schicht zurückgeben würde.
 * - `leads`: separat, weil Leads pro Betrieb wachsen und im Dashboard pro
 *   Status gefiltert werden.
 * - `generatedAt`: Zeitstempel, hilft beim Debuggen.
 */
export const MockDatasetSchema = z.object({
  generatedAt: IsoDateSchema,
  businesses: z.array(BusinessSchema).min(0).max(50),
  leads: z.array(LeadSchema).min(0).max(500),
});
export type MockDataset = z.infer<typeof MockDatasetSchema>;

/**
 * Hilfstyp für die Repository-Schicht: ein Slug-Index der Businesses.
 * Wird in Session 6/7 von `getBusinessBySlug()` verwendet.
 */
export type BusinessSlugIndex = Readonly<Record<string, Business>>;

/**
 * Hilfstyp für das Dashboard: Leads gruppiert nach businessId.
 */
export type LeadsByBusiness = Readonly<Record<string, readonly Lead[]>>;

/**
 * Validiert ein gesamtes Mock-Dataset und wirft eine sprechende Fehlermeldung.
 * Wird in den Mock-Modulen aufgerufen, sobald sie Inhalte liefern.
 */
export function validateMockDataset(dataset: unknown): MockDataset {
  return MockDatasetSchema.parse(dataset);
}
