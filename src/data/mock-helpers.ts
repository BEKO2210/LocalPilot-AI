/**
 * Kleine Helfer für Mock-Daten.
 *
 * Ziel: konsistente IDs, einfache Datums-Generatoren, gemeinsame
 * Schema-für-Standard-Öffnungszeiten. Keine Geschäftslogik, nur Convenience.
 */

import type { OpeningHoursDay, OpeningHours } from "@/core/validation/common.schema";

// ---------------------------------------------------------------------------
// IDs
// ---------------------------------------------------------------------------

/** `biz-studio-haarlinie` */
export function makeBusinessId(slug: string): string {
  return `biz-${slug}`;
}

/** `svc-studio-haarlinie-ladies-cut` */
export function makeServiceId(slug: string, key: string): string {
  return `svc-${slug}-${key}`;
}

/** `rev-studio-haarlinie-001` */
export function makeReviewId(slug: string, n: number): string {
  return `rev-${slug}-${String(n).padStart(3, "0")}`;
}

/** `lead-studio-haarlinie-001` */
export function makeLeadId(slug: string, n: number): string {
  return `lead-${slug}-${String(n).padStart(3, "0")}`;
}

/** `tm-studio-haarlinie-001` */
export function makeTeamMemberId(slug: string, n: number): string {
  return `tm-${slug}-${String(n).padStart(3, "0")}`;
}

/** `faq-studio-haarlinie-001` */
export function makeFaqId(slug: string, n: number): string {
  return `faq-${slug}-${String(n).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Daten
// ---------------------------------------------------------------------------

/**
 * Stabiler Erzeugungs-Zeitstempel für die Mock-Daten.
 * Wir wollen reproduzierbare Build-Outputs, deshalb keine Date.now()-Aufrufe.
 */
export const MOCK_NOW = "2026-04-27T09:00:00Z";

/** Vor X Tagen, ausgehend von MOCK_NOW. */
export function daysAgo(days: number, base: string = MOCK_NOW): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Öffnungszeiten – Standardvorlage
// ---------------------------------------------------------------------------

type OpeningSlotShort = { open: string; close: string };

/**
 * Helfer für eine kompakte Öffnungszeiten-Definition.
 *
 * Beispiel:
 *   buildOpeningHours({
 *     monday: "closed",
 *     tuesday: "09:00-18:00",
 *     thursday: ["09:00-12:30", "13:30-20:00"],
 *     ...
 *   })
 */
type OpeningHoursInput = Record<
  OpeningHoursDay["day"],
  "closed" | string | string[]
>;

function parseSlot(input: string): OpeningSlotShort {
  const [open, close] = input.split("-").map((s) => s.trim());
  if (!open || !close) {
    throw new Error(`Ungültiger Slot: "${input}". Format: "HH:mm-HH:mm".`);
  }
  return { open, close };
}

export function buildOpeningHours(input: OpeningHoursInput): OpeningHours {
  return (Object.entries(input) as Array<[OpeningHoursDay["day"], string | string[]]>).map(
    ([day, value]) => {
      if (value === "closed") {
        return { day, closed: true, slots: [] };
      }
      const list = Array.isArray(value) ? value : [value];
      return {
        day,
        closed: false,
        slots: list.map(parseSlot),
      };
    },
  );
}
