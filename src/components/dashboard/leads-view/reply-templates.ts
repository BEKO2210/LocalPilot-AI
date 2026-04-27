/**
 * Branchen-neutrale Antwort-Vorlagen für eingegangene Anfragen.
 *
 * Platzhalter:
 *   {{name}} – Name aus dem Lead
 *   {{betrieb}} – Name des Betriebs
 *
 * Konkrete branchen-spezifische Vorlagen folgen aus dem KI-System
 * (Sessions 13–15) und ergänzen diese Defaults.
 */

import type { Lead } from "@/types/lead";

export type ReplyTemplate = {
  key: string;
  label: string;
  body: string;
};

export const REPLY_TEMPLATES: readonly ReplyTemplate[] = [
  {
    key: "short_ack",
    label: "Kurze Bestätigung",
    body:
      "Hallo {{name}},\n\n" +
      "vielen Dank für Ihre Anfrage bei {{betrieb}}. Wir melden uns " +
      "innerhalb eines Werktags mit einem konkreten Vorschlag.\n\n" +
      "Beste Grüße",
  },
  {
    key: "friendly_followup",
    label: "Freundlicher Rückruf-Vorschlag",
    body:
      "Hallo {{name}},\n\n" +
      "danke für Ihre Anfrage. Damit wir alles passend vorbereiten, " +
      "rufen wir Sie heute oder morgen kurz zurück. Wenn ein Zeitfenster " +
      "besser passt, geben Sie es uns gerne durch.\n\n" +
      "Viele Grüße,\nIhr Team von {{betrieb}}",
  },
  {
    key: "detailed_proposal",
    label: "Detail-Vorschlag",
    body:
      "Hallo {{name}},\n\n" +
      "vielen Dank für Ihr Vertrauen. Anbei eine erste Einschätzung " +
      "zu Ihrer Anfrage. Wenn Sie zustimmen, fixieren wir den Termin " +
      "direkt im Anschluss.\n\n" +
      "[Vorschlag hier ergänzen]\n\n" +
      "Beste Grüße,\n{{betrieb}}",
  },
];

/** Setzt Platzhalter in der Vorlage. Unbekannte Platzhalter bleiben stehen. */
export function fillTemplate(
  body: string,
  context: { lead: Lead; businessName: string },
): string {
  return body
    .replaceAll("{{name}}", context.lead.name || "Kund:in")
    .replaceAll("{{betrieb}}", context.businessName);
}
