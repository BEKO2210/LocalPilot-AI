/**
 * Sammlung aller Demo-Betriebe für LocalPilot AI.
 *
 * Jeder Betrieb wird in seiner eigenen Datei gepflegt und beim Module-Load
 * via `BusinessSchema.parse(...)` validiert. Hier wird nur aggregiert,
 * indiziert und für Konsumenten exportiert.
 */

import type { Business } from "@/types/business";
import type { BusinessSlugIndex } from "./mock-types";

import { autoserviceMueller } from "./businesses/autoservice-mueller";
import { beautyAtelier } from "./businesses/beauty-atelier";
import { fahrschuleStadtmitte } from "./businesses/fahrschule-stadtmitte";
import { glanzwerkReinigung } from "./businesses/glanzwerk-reinigung";
import { meisterbauSchneider } from "./businesses/meisterbau-schneider";
import { studioHaarlinie } from "./businesses/studio-haarlinie";

/** Reihenfolge entspricht der Anzeige in der Demo-Übersicht (`/demo`). */
export const mockBusinesses: readonly Business[] = [
  studioHaarlinie,
  autoserviceMueller,
  glanzwerkReinigung,
  beautyAtelier,
  meisterbauSchneider,
  fahrschuleStadtmitte,
];

// Konsistenz-Check: jeder Slug nur einmal.
{
  const seen = new Set<string>();
  for (const b of mockBusinesses) {
    if (seen.has(b.slug)) {
      throw new Error(`mockBusinesses: doppelter Slug "${b.slug}"`);
    }
    seen.add(b.slug);
  }
}

/**
 * Schneller Slug-Lookup für die Public Site (`/site/[slug]`) und das
 * Dashboard. Type wird in `mock-types.ts` definiert.
 */
export const businessesBySlug: BusinessSlugIndex = Object.freeze(
  Object.fromEntries(mockBusinesses.map((b) => [b.slug, b])),
);

export function getMockBusinessBySlug(slug: string): Business | undefined {
  return businessesBySlug[slug];
}

export function listMockBusinessSlugs(): readonly string[] {
  return mockBusinesses.map((b) => b.slug);
}

// Re-Exports der Einzelbetriebe (für punktuelle Tests / Imports)
export {
  autoserviceMueller,
  beautyAtelier,
  fahrschuleStadtmitte,
  glanzwerkReinigung,
  meisterbauSchneider,
  studioHaarlinie,
};
