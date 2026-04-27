/**
 * Flache Liste aller Reviews aus den Demo-Betrieben.
 *
 * Wie bei den Services: Source-of-Truth bleibt der Business-Datensatz,
 * dies ist nur die Aggregation.
 */

import type { Review } from "@/types/review";
import { mockBusinesses } from "./mock-businesses";

export const mockReviews: readonly Review[] = mockBusinesses.flatMap(
  (business) => business.reviews,
);

/** Reviews gruppiert nach businessId. */
export const reviewsByBusiness: Readonly<Record<string, readonly Review[]>> =
  Object.freeze(
    Object.fromEntries(
      mockBusinesses.map((b) => [b.id, b.reviews] as const),
    ),
  );

/** Durchschnittliche Bewertung pro Betrieb (gerundet auf 0,1). */
export const averageRatingByBusiness: Readonly<Record<string, number>> =
  Object.freeze(
    Object.fromEntries(
      mockBusinesses.map((b) => {
        if (b.reviews.length === 0) return [b.id, 0] as const;
        const sum = b.reviews.reduce((acc, r) => acc + r.rating, 0);
        return [b.id, Math.round((sum / b.reviews.length) * 10) / 10] as const;
      }),
    ),
  );
