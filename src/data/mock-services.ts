/**
 * Flache Liste aller Services aus den Demo-Betrieben.
 *
 * Praktisch für Repository-Layer-Vorbereitung (Session 19) und Filter-UI im
 * Dashboard. Die Source-of-Truth bleibt das jeweilige `Business`-Objekt –
 * wir extrahieren hier nur, ohne zu kopieren.
 */

import type { Service } from "@/types/service";
import { mockBusinesses } from "./mock-businesses";

export const mockServices: readonly Service[] = mockBusinesses.flatMap(
  (business) => business.services,
);

/** Services gruppiert nach businessId. */
export const servicesByBusiness: Readonly<Record<string, readonly Service[]>> =
  Object.freeze(
    Object.fromEntries(
      mockBusinesses.map((b) => [b.id, b.services] as const),
    ),
  );

export function getMockServiceById(id: string): Service | undefined {
  return mockServices.find((s) => s.id === id);
}
