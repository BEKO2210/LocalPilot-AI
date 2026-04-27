/**
 * Mock-Implementation für `generateWebsiteCopy` (Code-Session 14).
 *
 * Deterministisch, branchenneutral, ohne externen API-Call. Liefert
 * brauchbare Beispieltexte, die sich am `IndustryPreset` orientieren
 * und drei Felder befüllen: `heroTitle`, `heroSubtitle`, `aboutText`.
 *
 * Variant-Logik:
 *   - "hero"           → Hero-Texte direkt aus dem Preset, About-Text
 *                         aus Tonalität + USPs.
 *   - "about"          → Hero-Felder fokussieren auf den Betriebsnamen,
 *                         About-Text wird ausführlicher (Mission, Team).
 *   - "services_intro" → Hero-Felder kündigen die Leistungen an,
 *                         About-Text betont „klar, fair, branchen-üblich".
 *   - "benefits_intro" → Hero-Felder rahmen drei Argumente,
 *                         About-Text formuliert die drei Nutzen.
 *
 * Tonalität (`context.toneOfVoice`) und USPs (`uniqueSellingPoints`)
 * fließen sichtbar in den About-Text ein. `{{city}}` wird ersetzt.
 *
 * Output wird defensiv durch `WebsiteCopyOutputSchema` validiert –
 * verhindert, dass eine Mock-Antwort später strenge Schema-Checks an
 * anderer Stelle bricht.
 */

import {
  WebsiteCopyInputSchema,
  WebsiteCopyOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type { WebsiteCopyInput, WebsiteCopyOutput } from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";

const FALLBACK_CITY = "Ihrer Stadt";

function substituteCity(text: string, city: string | undefined): string {
  return text.replace(/\{\{city\}\}/g, city ?? FALLBACK_CITY);
}

/**
 * Verbindet Tonalitäts-Stichworte zu einem natürlichen Satzfragment.
 *   ["freundlich"]                       → "freundlich"
 *   ["freundlich", "modern"]             → "freundlich und modern"
 *   ["freundlich", "modern", "ruhig"]    → "freundlich, modern und ruhig"
 */
function joinTone(tones: readonly string[]): string {
  if (tones.length === 0) return "freundlich und sachlich";
  if (tones.length === 1) return tones[0]!;
  if (tones.length === 2) return `${tones[0]} und ${tones[1]}`;
  return `${tones.slice(0, -1).join(", ")} und ${tones[tones.length - 1]}`;
}

/** USPs als Bullet-Block; max. 3, damit der About-Text knackig bleibt. */
function uspBullets(usps: readonly string[]): string {
  if (usps.length === 0) return "";
  return usps.slice(0, 3).map((u) => `· ${u}`).join("\n");
}

/** Fasst eine Zielgruppen-Liste in 1–3 Stichworten zusammen. */
function compactAudience(list: readonly string[]): string {
  if (list.length === 0) return "lokale Kund:innen";
  return list.slice(0, 3).join(", ");
}

/** Trimmt einen String auf maxLen Zeichen, an Wortgrenze wenn möglich. */
function clamp(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

export async function mockGenerateWebsiteCopy(
  input: WebsiteCopyInput,
): Promise<WebsiteCopyOutput> {
  const parsedInput = WebsiteCopyInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateWebsiteCopy: ${parsedInput.error.message}`,
    );
  }
  const { context, variant, hint } = parsedInput.data;

  const preset = getPresetOrFallback(context.industryKey);
  const city = context.city;
  const businessName = context.businessName;
  const tone = joinTone(context.toneOfVoice);
  const audience = compactAudience(preset.targetAudience);
  const usps = uspBullets(context.uniqueSellingPoints);

  // Branchen-Hero-Texte aus dem Preset (Default für variant "hero").
  let heroTitle = substituteCity(preset.defaultHeroTitle, city);
  let heroSubtitle = substituteCity(preset.defaultHeroSubtitle, city);

  switch (variant) {
    case "hero":
      // Übernehme die Preset-Defaults unverändert.
      break;
    case "about":
      heroTitle = `Über ${businessName}`;
      heroSubtitle = substituteCity(preset.defaultTagline, city);
      break;
    case "services_intro":
      heroTitle = `Leistungen bei ${businessName}`;
      heroSubtitle = substituteCity(
        `${preset.label} – klar beschrieben, fair bepreist.`,
        city,
      );
      break;
    case "benefits_intro":
      heroTitle = `Warum ${businessName}?`;
      heroSubtitle = "Drei Gründe, die unsere Kund:innen immer wieder nennen.";
      break;
  }

  // About-Text: Tonalität → Branche → Standort → USPs → optionaler Hinweis.
  const cityLine = city
    ? `Wir sind in ${city} verwurzelt und kennen die Wege kurz.`
    : "Wir sind regional verwurzelt und kennen die Wege kurz.";

  let aboutText: string;
  if (variant === "about") {
    aboutText = [
      `${businessName} steht für ${tone} ${preset.label.toLowerCase()}-Arbeit für ${audience}.`,
      cityLine,
      "Unser Anspruch: nachvollziehbare Termine, ehrliche Beratung, sauberes Ergebnis.",
      usps ? `\nWas uns ausmacht:\n${usps}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  } else if (variant === "benefits_intro") {
    aboutText = [
      `${businessName} setzt auf drei Versprechen für ${audience}:`,
      "1. Erreichbarkeit ohne Hotline-Schleifen.",
      "2. Klare Preise und ehrliche Aussagen.",
      `3. ${tone.charAt(0).toUpperCase() + tone.slice(1)}e Arbeit, die hält.`,
    ].join("\n");
  } else if (variant === "services_intro") {
    aboutText = [
      `${preset.label} ohne Marketing-Floskeln: bei ${businessName} bekommen Sie nur, was Sie wirklich brauchen.`,
      cityLine,
    ].join("\n");
  } else {
    // hero
    aboutText = [
      `${businessName} steht für ${tone} ${preset.label.toLowerCase()}-Arbeit für ${audience}.`,
      cityLine,
      usps ? `\nWas uns ausmacht:\n${usps}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (hint) {
    aboutText = `${aboutText}\n\nIhre Vorgabe: ${hint}`.trim();
  }

  // Defensive Längen-Begrenzung gegenüber Schema-Limits.
  const result = {
    heroTitle: clamp(heroTitle, 160),
    heroSubtitle: clamp(heroSubtitle, 280),
    aboutText: clamp(aboutText, 1200),
  };

  // Validierung als letztes Sicherheitsnetz.
  return WebsiteCopyOutputSchema.parse(result);
}
