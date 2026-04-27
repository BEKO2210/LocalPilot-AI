/**
 * Mock-Implementierung für `generateReviewRequest` (Code-Session 18).
 *
 * Liefert eine Liste von 1–3 Review-Request-Varianten für den
 * angefragten Kanal in jeweils unterschiedlicher Tonalität:
 *   - "short"      → 1 Satz, direkter Ask.
 *   - "friendly"   → 2–3 Sätze, warm, Dank + Ask + sanfte Eskalation.
 *   - "follow_up"  → 3–4 Sätze, Bezug zum letzten Besuch, sanfter
 *                     Re-Ask, ohne pushy zu klingen.
 *
 * Vorgehensweise:
 *   1. Erste Variante ist immer die explizit angefragte (channel, tone)
 *      Kombination — entweder aus `preset.reviewRequestTemplates` per
 *      Match, oder synthetisiert aus einer Channel/Tone-Matrix.
 *   2. Zwei zusätzliche Varianten: gleiche Channel, aber die anderen
 *      beiden Tones, damit der Betrieb Phrasing-Alternativen hat.
 *   3. `{{customerName}}` und `{{reviewLink}}` werden aus dem Input
 *      ersetzt; fehlen sie, kommen neutrale Platzhalter zum Einsatz,
 *      die der Anwender vor dem Versand füllt.
 *
 * Quellen-Strategie für die Inhalte basiert auf 2026-Best-Practices
 * (höchste Conversion bei WhatsApp/in_person, ein einziger Follow-Up
 * verdoppelt die Antwortrate, kurzer Pfad zum Link, Personalisierung
 * + Direkt-Link = ~3× Antworten).
 *
 * Output wird defensiv durch `ReviewRequestOutputSchema` validiert.
 */

import {
  ReviewRequestInputSchema,
  ReviewRequestOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type {
  ReviewRequestInput,
  ReviewRequestOutput,
} from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";
import type {
  ReviewRequestTemplate,
} from "@/types/industry";
import type { ReviewRequestChannel } from "@/types/common";

type Tone = "short" | "friendly" | "follow_up";

const FALLBACK_REVIEW_LINK = "[Bewertungs-Link einfügen]";
const FALLBACK_CUSTOMER_NAME = "und Hallo";

function clamp(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

function substitute(
  body: string,
  customerName: string | undefined,
  reviewLink: string | undefined,
  businessName: string,
): string {
  return body
    .replace(/\{\{customerName\}\}/g, customerName ?? FALLBACK_CUSTOMER_NAME)
    .replace(/\{\{reviewLink\}\}/g, reviewLink ?? FALLBACK_REVIEW_LINK)
    .replace(/\{\{businessName\}\}/g, businessName);
}

/**
 * Synthetische Vorlage für eine (Channel, Tone)-Kombination, falls
 * im Preset kein Match existiert. Phrasing ist absichtlich
 * kanal-typisch:
 *   - whatsapp: kurz, locker, ein dezentes Emoji nur bei `friendly`.
 *   - sms:      sehr kurz, kein Emoji, klar formuliert.
 *   - email:    längere Form, ggf. Anrede, Absatz-Strukturen.
 *   - in_person: gesprochener Stil, kein Link nötig (wir empfehlen
 *                eine Karte mit QR; im Text geben wir den Link
 *                trotzdem als Hinweis aus).
 */
function synthesizeBody(
  channel: ReviewRequestChannel,
  tone: Tone,
  businessName: string,
): string {
  const safeBusiness = businessName;

  if (channel === "whatsapp") {
    if (tone === "short") {
      return `Hallo {{customerName}}, eine kurze Google-Bewertung würde ${safeBusiness} sehr helfen: {{reviewLink}}`;
    }
    if (tone === "follow_up") {
      return `Hallo {{customerName}}, kurz nochmal von ${safeBusiness}: hat alles gepasst? Wenn ja, hilft uns eine kurze Google-Bewertung sehr → {{reviewLink}}. Falls doch etwas nicht stimmt, antworten Sie gern direkt – wir kümmern uns persönlich.`;
    }
    // friendly
    return `Hallo {{customerName}}, vielen Dank für Ihren Besuch bei ${safeBusiness}! 🙂 Wenn Sie zufrieden waren, würde uns eine kurze Google-Bewertung sehr helfen: {{reviewLink}}`;
  }

  if (channel === "sms") {
    if (tone === "short") {
      return `${safeBusiness}: Danke für Ihren Besuch. Eine kurze Google-Bewertung hilft uns sehr: {{reviewLink}}`;
    }
    if (tone === "follow_up") {
      return `${safeBusiness}: Hallo {{customerName}}, alles passend gewesen? Falls ja, freuen wir uns über eine kurze Google-Bewertung: {{reviewLink}}. Falls nicht, antworten Sie bitte direkt.`;
    }
    // friendly
    return `Hallo {{customerName}}, ${safeBusiness} hier. Vielen Dank für Ihren Besuch. Eine kurze Bewertung würde uns sehr helfen: {{reviewLink}}`;
  }

  if (channel === "email") {
    if (tone === "short") {
      return `Hallo {{customerName}},\n\nvielen Dank für Ihren Besuch bei ${safeBusiness}. Wenn Sie zufrieden waren, würde uns eine kurze Google-Bewertung sehr helfen: {{reviewLink}}\n\nVielen Dank!`;
    }
    if (tone === "follow_up") {
      return `Hallo {{customerName}},\n\nwir wollten uns kurz nach Ihrem Termin bei ${safeBusiness} melden. Falls alles wie gewünscht gelaufen ist, hilft uns eine kurze Google-Bewertung sehr weiter:\n${"{{reviewLink}}"}\n\nSollte dagegen etwas nicht passen, antworten Sie bitte direkt auf diese E-Mail – wir kümmern uns persönlich darum.\n\nViele Grüße\n${safeBusiness}`;
    }
    // friendly
    return `Hallo {{customerName}},\n\nvielen Dank, dass Sie bei ${safeBusiness} waren. Wir hoffen, der Termin hat Ihnen gefallen.\n\nFalls Sie zufrieden waren, würde uns eine kurze Google-Bewertung sehr weiterhelfen — sie ist in 30 Sekunden erledigt:\n${"{{reviewLink}}"}\n\nVielen Dank für Ihre Unterstützung!\nIhr Team von ${safeBusiness}`;
  }

  // in_person
  if (tone === "short") {
    return `„Wenn Sie zufrieden waren, würden Sie uns eine kurze Google-Bewertung schreiben? Den Link finden Sie hier: {{reviewLink}}."`;
  }
  if (tone === "follow_up") {
    return `„Schön, dass Sie wieder da waren — falls Sie unsere letzte Bewertungs-Bitte verpasst haben: ein paar Sätze auf Google helfen uns sehr. Hier ist der Link: {{reviewLink}}."`;
  }
  // friendly
  return `„Vielen Dank für Ihren Besuch! Wenn Sie zufrieden waren, würden Sie kurz eine Google-Bewertung für ${safeBusiness} hinterlassen? Den direkten Link bekommen Sie auch per WhatsApp: {{reviewLink}}."`;
}

/** Sucht im Preset eine Vorlage, die exakt zu (Channel, Tone) passt. */
function findPresetTemplate(
  templates: readonly ReviewRequestTemplate[],
  channel: ReviewRequestChannel,
  tone: Tone,
): ReviewRequestTemplate | null {
  return (
    templates.find((t) => t.channel === channel && t.tone === tone) ?? null
  );
}

/**
 * Reihenfolge: angefragte Tone zuerst, dann die übrigen in
 * kanonischer Reihenfolge. Garantiert deterministische Ausgabe.
 */
function orderTones(requested: Tone): readonly Tone[] {
  const canonical: readonly Tone[] = ["short", "friendly", "follow_up"];
  return [requested, ...canonical.filter((t) => t !== requested)];
}

export async function mockGenerateReviewRequest(
  input: ReviewRequestInput,
): Promise<ReviewRequestOutput> {
  const parsed = ReviewRequestInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateReviewRequest: ${parsed.error.message}`,
    );
  }
  const { context, channel, tone, customerName, reviewLink } = parsed.data;

  const preset = getPresetOrFallback(context.industryKey);
  const businessName = context.businessName;

  const tonesInOrder = orderTones(tone);
  const variants = tonesInOrder.map((t) => {
    const presetMatch = findPresetTemplate(
      preset.reviewRequestTemplates,
      channel,
      t,
    );
    const rawBody = presetMatch
      ? presetMatch.body
      : synthesizeBody(channel, t, businessName);
    const body = clamp(
      substitute(rawBody, customerName, reviewLink, businessName),
      1000,
    );
    return { channel, tone: t, body };
  });

  return ReviewRequestOutputSchema.parse({ variants });
}
