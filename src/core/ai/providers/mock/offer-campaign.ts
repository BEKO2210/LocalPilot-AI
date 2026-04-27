/**
 * Mock-Implementierung für `generateOfferCampaign` (Code-Session 20).
 *
 * Schließt die Mock-Phase ab: alle 7 Methoden des `AIProvider`-
 * Interfaces sind nun deterministisch belegt.
 *
 * Output:
 *   - `headline` (≤ 120) — zugespitzt aus `offerTitle`, ohne
 *      Superlative, mit echtem Nutzen.
 *   - `subline`  (≤ 280) — konkretisiert die Headline und verankert
 *      sie lokal („… in {{city}}", falls vorhanden).
 *   - `bodyText` (≤ 2000) — 1–3 Absätze mit Inhalt + USP-Trust-Block
 *      + optionalem „Gültig bis …"-Hinweis, wenn `validUntil`
 *      mitkommt.
 *   - `cta`      (≤ 120) — zeit-orientiert, deutsch, knapp.
 *
 * Design-Prinzipien (aus 2026-Recherche zu Limited-Time-Offers):
 *   - Knappheit nur, wenn sie echt ist (`validUntil` wird, wenn
 *     vorhanden, klar genannt).
 *   - Kunden-Nutzen vor Druck: keine „letzte Chance!"-Floskeln
 *     ohne Substanz.
 *   - Klare Deadline, klare Bedingungen, klarer nächster Schritt.
 *
 * Output wird defensiv durch `OfferCampaignOutputSchema` validiert.
 */

import {
  OfferCampaignInputSchema,
  OfferCampaignOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type {
  OfferCampaignInput,
  OfferCampaignOutput,
} from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";

const FALLBACK_CITY = "Ihrer Stadt";

function clamp(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

function joinTone(tones: readonly string[]): string {
  if (tones.length === 0) return "freundlich und sachlich";
  if (tones.length === 1) return tones[0]!;
  if (tones.length === 2) return `${tones[0]} und ${tones[1]}`;
  return `${tones.slice(0, -1).join(", ")} und ${tones[tones.length - 1]}`;
}

/** Trust-Block aus den USPs des Betriebs; max. 3 Bullets. */
function uspBullets(usps: readonly string[]): string {
  if (usps.length === 0) return "";
  return usps.slice(0, 3).map((u) => `· ${u}`).join("\n");
}

/**
 * Baut einen sauberen Validitäts-Hinweis. `validUntil` ist im
 * Schema ein freier String (max. 40 Zeichen), kann also „31.05.2026",
 * „Ende Mai" oder „solange Vorrat reicht" sein. Wir geben den Wert
 * unverändert weiter und rahmen ihn nur.
 */
function validityLine(validUntil: string | undefined): string {
  if (!validUntil) return "";
  const trimmed = validUntil.trim();
  if (trimmed.length === 0) return "";
  return `Gültig bis ${trimmed}. Bitte einfach beim Termin oder bei der Anfrage darauf hinweisen.`;
}

/**
 * Erste Zeile, die den Inhalt aus `details` höflich übernimmt — falls
 * `details` leer ist, fällt sie auf einen branchen-neutralen Lückentext.
 */
function buildContentParagraph(
  offerTitle: string,
  details: string,
  industryLabel: string,
): string {
  const trimmed = details.trim();
  if (trimmed.length >= 10) {
    // Erste Zeile aus den Details; alles weitere bleibt im Body übrig.
    return trimmed;
  }
  return `Mit „${offerTitle}" bekommen Sie ein klar definiertes ${industryLabel}-Paket — fair bepreist, ohne Kleingedrucktes.`;
}

/**
 * Goal-frei: der CTA ist immer zeit-orientiert, betont aber den
 * Nutzen statt Druck. Mit `validUntil` wird die Deadline aktiv
 * angesprochen, ohne `validUntil` bleibt der CTA neutral-einladend.
 */
function buildCta(validUntil: string | undefined): string {
  return validUntil
    ? `Jetzt sichern — gültig bis ${validUntil.trim()}.`
    : `Jetzt unverbindlich anfragen.`;
}

export async function mockGenerateOfferCampaign(
  input: OfferCampaignInput,
): Promise<OfferCampaignOutput> {
  const parsed = OfferCampaignInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateOfferCampaign: ${parsed.error.message}`,
    );
  }
  const { context, offerTitle, details, validUntil } = parsed.data;

  const preset = getPresetOrFallback(context.industryKey);
  const businessName = context.businessName;
  const city = context.city ?? FALLBACK_CITY;
  const industryLabel = preset.label;
  const tone = joinTone(context.toneOfVoice);

  // ---------------------------------------------------------------------
  // Headline — zugespitzt aus dem Angebots-Titel.
  // ---------------------------------------------------------------------
  const headlineRaw = `${offerTitle} — bei ${businessName}`;
  const headline = clamp(headlineRaw, 120);

  // ---------------------------------------------------------------------
  // Subline — konkretisiert + verankert lokal, ohne Superlative.
  // ---------------------------------------------------------------------
  const subline = clamp(
    `Klar beschriebenes ${industryLabel}-Angebot in ${city}, ${tone} umgesetzt.`,
    280,
  );

  // ---------------------------------------------------------------------
  // Body — 1–3 Absätze: Inhalt + Trust + (optional) Gültigkeit.
  // ---------------------------------------------------------------------
  const contentParagraph = buildContentParagraph(
    offerTitle,
    details,
    industryLabel,
  );
  const trustBlock = uspBullets(context.uniqueSellingPoints);
  const trustParagraph =
    trustBlock.length > 0 ? `Was Sie bekommen:\n${trustBlock}` : "";
  const validity = validityLine(validUntil);

  const bodyParagraphs = [contentParagraph, trustParagraph, validity].filter(
    (p) => p.length > 0,
  );
  const bodyText = clamp(bodyParagraphs.join("\n\n"), 2000);

  // ---------------------------------------------------------------------
  // CTA — zeit-orientiert, ohne Druck.
  // ---------------------------------------------------------------------
  const cta = clamp(buildCta(validUntil), 120);

  return OfferCampaignOutputSchema.parse({
    headline,
    subline,
    bodyText,
    cta,
  });
}
