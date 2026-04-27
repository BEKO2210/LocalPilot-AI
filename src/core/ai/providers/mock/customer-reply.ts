/**
 * Mock-Implementierung für `generateCustomerReply` (Code-Session 17).
 *
 * Deterministisch, branchenneutral, ohne externen API-Call. Liefert
 * einen passenden Antworttext in einer von drei Tonalitäten:
 *   - "short"        → 1–2 Sätze, kompakt, formelles „Sie".
 *   - "friendly"     → 3–4 Sätze, persönlicher Tonfall, immer noch „Sie".
 *   - "professional" → 3–4 Sätze, sachlich, mit explizitem nächsten
 *                       Schritt und Sie-Anrede.
 *
 * Themen-Erkennung: Aus der Kunden-Nachricht werden 1–2 Stamm-
 * begriffe extrahiert (Termin, Preis, Öffnungszeiten, Stornierung,
 * Reklamation, Angebot/KVA, …). Daran orientieren sich die Spiegel-
 * Phrase und der konkrete nächste Schritt. Trifft kein Stamm,
 * fällt der Reply auf eine generische, höfliche Standard-Antwort
 * zurück.
 *
 * Sicherheitsnetze:
 *   - Eingabe wird via `CustomerReplyInputSchema` validiert.
 *   - Ausgabe wird via `CustomerReplyOutputSchema` validiert.
 *   - `clamp` schneidet nur, falls der finale Text das 2000-Zeichen-
 *     Limit überraschend reißen würde — in der Praxis bleiben unsere
 *     Vorlagen weit darunter.
 */

import {
  CustomerReplyInputSchema,
  CustomerReplyOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type { CustomerReplyInput, CustomerReplyOutput } from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";

function clamp(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

type Topic =
  | "appointment"
  | "pricing"
  | "hours"
  | "cancel"
  | "complaint"
  | "offer"
  | "general";

interface DetectedTopic {
  readonly topic: Topic;
  /** Kurzes Substantiv für die Spiegelung im Antwortsatz. */
  readonly mirrorNoun: string;
}

/**
 * Erkennt das Hauptthema einer Kunden-Nachricht über Wortstämme.
 * Erste passende Regel gewinnt; Reihenfolge ist nach Häufigkeit
 * im Lokalbetrieb-Alltag gewählt (Reklamation vor allgemeinem
 * „Problem", damit Beschwerden zuerst greifen).
 */
function detectTopic(message: string): DetectedTopic {
  const m = message.toLowerCase();

  if (/(reklam|beschwer|unzufrieden|nicht zufrieden|mangel)/.test(m)) {
    return { topic: "complaint", mirrorNoun: "Ihre Rückmeldung" };
  }
  if (/(stornier|absag|verschieb)/.test(m)) {
    return { topic: "cancel", mirrorNoun: "Ihre Terminänderung" };
  }
  if (/(termin|buch|reserv|wann.*frei|verfügbar)/.test(m)) {
    return { topic: "appointment", mirrorNoun: "Ihre Terminanfrage" };
  }
  if (/(angebot|kostenvoranschlag|\bkva\b)/.test(m)) {
    return { topic: "offer", mirrorNoun: "Ihre Angebotsanfrage" };
  }
  if (/(preis|kost|tarif|honorar|wie ?viel|wieviel)/.test(m)) {
    return { topic: "pricing", mirrorNoun: "Ihre Frage zu den Preisen" };
  }
  if (/(öffnung|geöffnet|geoffnet|öffnungszeit|sprechzeit|wann.*offen)/.test(m)) {
    return { topic: "hours", mirrorNoun: "Ihre Frage zu den Öffnungszeiten" };
  }
  return { topic: "general", mirrorNoun: "Ihre Nachricht" };
}

/**
 * Liefert einen knappen „nächsten Schritt"-Satz passend zum Thema.
 * Bewusst ohne Negativwörter („nicht", „leider"), da das in der
 * Recherche zu 2026-Customer-Service-Patterns als Standard genannt
 * ist.
 */
function nextStepFor(topic: Topic): string {
  switch (topic) {
    case "appointment":
      return `Wir prüfen die nächsten freien Slots und melden uns mit ein bis zwei Vorschlägen zurück.`;
    case "pricing":
      return `Wir senden Ihnen eine transparente Preisübersicht zu Ihrem Anliegen zu.`;
    case "hours":
      return `Die aktuellen Öffnungszeiten finden Sie auf unserer Startseite – außerhalb dieser Zeiten antworten wir am nächsten Werktag.`;
    case "cancel":
      return `Wir tragen die Änderung gleich für Sie ein und bestätigen den neuen Termin per Antwortnachricht.`;
    case "complaint":
      return `Wir schauen uns den Vorgang umgehend an und melden uns persönlich bei Ihnen, um eine faire Lösung zu finden.`;
    case "offer":
      return `Wir prüfen Ihre Angaben und senden Ihnen ein nachvollziehbares Angebot mit klaren Positionen zu.`;
    case "general":
    default:
      return `Wir kümmern uns um Ihr Anliegen und melden uns innerhalb eines Werktags bei Ihnen.`;
  }
}

function buildShort(
  topic: DetectedTopic,
  businessName: string,
): string {
  const step = nextStepFor(topic.topic);
  return [
    `Guten Tag,`,
    `vielen Dank für ${topic.mirrorNoun}. ${step}`,
    `Beste Grüße, ${businessName}`,
  ].join("\n");
}

function buildFriendly(
  topic: DetectedTopic,
  businessName: string,
  city: string | undefined,
): string {
  const step = nextStepFor(topic.topic);
  const cityLine = city
    ? `Wir freuen uns, dass Sie sich an uns in ${city} wenden.`
    : `Wir freuen uns, dass Sie sich an uns wenden.`;
  return [
    `Hallo,`,
    `vielen Dank für ${topic.mirrorNoun} – wir haben sie eben in Ruhe gelesen.`,
    `${cityLine} ${step}`,
    `Falls in der Zwischenzeit etwas Wichtiges aufkommt, antworten Sie gerne direkt auf diese Nachricht.`,
    `Herzliche Grüße,\n${businessName}`,
  ].join("\n\n");
}

function buildProfessional(
  topic: DetectedTopic,
  businessName: string,
  industryLabel: string,
): string {
  const step = nextStepFor(topic.topic);
  return [
    `Sehr geehrte Damen und Herren,`,
    `vielen Dank, dass Sie sich mit ${topic.mirrorNoun} an ${businessName} gewendet haben. Wir behandeln Ihr Anliegen im Rahmen unserer ${industryLabel}-Praxis sorgfältig und vertraulich.`,
    step,
    `Bei Rückfragen erreichen Sie uns über die im Footer hinterlegten Kontaktwege.`,
    `Mit freundlichen Grüßen\n${businessName}`,
  ].join("\n\n");
}

export async function mockGenerateCustomerReply(
  input: CustomerReplyInput,
): Promise<CustomerReplyOutput> {
  const parsed = CustomerReplyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateCustomerReply: ${parsed.error.message}`,
    );
  }
  const { context, customerMessage, tone } = parsed.data;

  const preset = getPresetOrFallback(context.industryKey);
  const businessName = context.businessName;
  const city = context.city;
  const industryLabel = preset.label;

  const detected = detectTopic(customerMessage);

  let reply: string;
  switch (tone) {
    case "short":
      reply = buildShort(detected, businessName);
      break;
    case "professional":
      reply = buildProfessional(detected, businessName, industryLabel);
      break;
    case "friendly":
    default:
      reply = buildFriendly(detected, businessName, city);
      break;
  }

  const result = { reply: clamp(reply, 2000) };
  return CustomerReplyOutputSchema.parse(result);
}
