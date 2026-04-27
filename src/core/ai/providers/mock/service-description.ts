/**
 * Mock-Implementierung für `improveServiceDescription` (Code-Session 15).
 *
 * Deterministisch, branchenneutral, ohne externen API-Call. Erzeugt
 * zwei Varianten der Beschreibung:
 *   - `shortDescription` (≤ 240 Zeichen, Google-Business-Profil-tauglich)
 *   - `longDescription`  (Service-Page-Block, gegliedert nach
 *                         „Was du bekommst → Wie wir arbeiten → Warum wir")
 *
 * Quellen-Strategie:
 *   1. Falls eine `currentDescription` mitkommt, nutzen wir sie als
 *      Ausgangspunkt für die Kurzversion (mit Politur).
 *   2. Andernfalls suchen wir im Branchen-Preset nach einem Service,
 *      dessen Titel zum Input passt, und nehmen dessen
 *      `shortDescription` als Saatzeile.
 *   3. Letzter Fallback: aus `serviceTitle` + `tone` + `businessName`
 *      eine generische, aber konkrete Zeile bauen.
 *
 * Längen-Steuerung über `targetLength`:
 *   - "short"  → nur 1 Absatz im Long-Text (≈ 1× Saat).
 *   - "medium" → 2 Absätze (Inhalt + Ablauf).
 *   - "long"   → 3 Absätze (Inhalt + Ablauf + Trust/USPs).
 *
 * Output wird defensiv durch `ServiceDescriptionOutputSchema` validiert.
 */

import {
  ServiceDescriptionInputSchema,
  ServiceDescriptionOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type {
  ServiceDescriptionInput,
  ServiceDescriptionOutput,
} from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";
import type { PresetService, PresetProcessStep } from "@/types/industry";

const FALLBACK_CITY = "Ihrer Stadt";

function substituteCity(text: string, city: string | undefined): string {
  return text.replace(/\{\{city\}\}/g, city ?? FALLBACK_CITY);
}

function joinTone(tones: readonly string[]): string {
  if (tones.length === 0) return "freundlich und sachlich";
  if (tones.length === 1) return tones[0]!;
  if (tones.length === 2) return `${tones[0]} und ${tones[1]}`;
  return `${tones.slice(0, -1).join(", ")} und ${tones[tones.length - 1]}`;
}

/** Schneidet auf maxLen, bevorzugt eine Wortgrenze. */
function clamp(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

/** Stellt sicher, dass der Text mit Großbuchstaben beginnt und mit Satzzeichen endet. */
function polish(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return trimmed;
  const head = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const last = head.charAt(head.length - 1);
  return ".!?…".includes(last) ? head : `${head}.`;
}

/**
 * Sucht im Preset einen Service, dessen Titel den Input ungefähr trifft.
 * Vergleich case-insensitiv, sowohl exakt als auch als Substring beider
 * Richtungen, damit „Damenhaarschnitt" und „Haarschnitt für Damen" matchen.
 */
function findMatchingService(
  services: readonly PresetService[],
  serviceTitle: string,
): PresetService | null {
  const needle = serviceTitle.trim().toLowerCase();
  if (needle.length === 0) return null;
  const exact = services.find((s) => s.title.trim().toLowerCase() === needle);
  if (exact) return exact;
  const partial = services.find((s) => {
    const t = s.title.trim().toLowerCase();
    return t.includes(needle) || needle.includes(t);
  });
  return partial ?? null;
}

/**
 * Baut den Ablauf-Absatz aus den Preset-Process-Steps. Falls keine
 * vorhanden, fallen wir auf eine generische 3-Schritt-Formulierung zurück.
 */
function buildProcessParagraph(
  steps: readonly PresetProcessStep[],
  serviceTitle: string,
): string {
  if (steps.length === 0) {
    return `So läuft es ab: Anfrage, kurze Abstimmung zu ${serviceTitle}, dann saubere Umsetzung mit klarer Preisangabe vorab.`;
  }
  const sorted = [...steps].sort((a, b) => a.step - b.step).slice(0, 3);
  const sentences = sorted.map((s) => `${s.step}. ${polish(s.text)}`);
  return `So läuft es ab:\n${sentences.join("\n")}`;
}

/**
 * Baut den Trust-/USP-Absatz. Nutzt die übergebenen USPs des Betriebs;
 * fehlen sie, kommt eine konkrete (nicht superlative) Default-Zeile.
 */
function buildTrustParagraph(
  usps: readonly string[],
  businessName: string,
  city: string | undefined,
): string {
  const cityFragment = city ? ` in ${city}` : "";
  if (usps.length === 0) {
    return `Was Sie von ${businessName}${cityFragment} erwarten dürfen: nachvollziehbare Termine, ehrliche Beratung und ein sauberes Ergebnis – ohne Marketing-Floskeln.`;
  }
  const lead = `Das macht ${businessName}${cityFragment} aus:`;
  const bullets = usps
    .slice(0, 3)
    .map((u) => `· ${u}`)
    .join("\n");
  return `${lead}\n${bullets}`;
}

export async function mockImproveServiceDescription(
  input: ServiceDescriptionInput,
): Promise<ServiceDescriptionOutput> {
  const parsed = ServiceDescriptionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für improveServiceDescription: ${parsed.error.message}`,
    );
  }
  const { context, serviceTitle, currentDescription, targetLength } =
    parsed.data;

  const preset = getPresetOrFallback(context.industryKey);
  const city = context.city;
  const businessName = context.businessName;
  const tone = joinTone(context.toneOfVoice);

  // ---------------------------------------------------------------------
  // 1. Saatzeile für die Kurzbeschreibung wählen.
  // ---------------------------------------------------------------------
  const matchedService = findMatchingService(preset.defaultServices, serviceTitle);
  const trimmedCurrent = currentDescription.trim();

  let seedSentence: string;
  if (trimmedCurrent.length >= 10) {
    // Bestehender Text wird weiterverwendet, aber poliert.
    seedSentence = polish(trimmedCurrent);
  } else if (matchedService && matchedService.shortDescription.trim().length > 0) {
    seedSentence = polish(matchedService.shortDescription);
  } else {
    seedSentence = polish(
      `${serviceTitle} bei ${businessName} – ${tone}, klar beschrieben.`,
    );
  }

  // Kurzbeschreibung ergänzen wir um optionalen Standort-Hinweis,
  // damit Google-Business-Profile-Style erfüllt ist (lokal verankert,
  // konkret statt Superlativ).
  const cityLine = city ? ` Wir sind in ${city} für Sie da.` : "";
  const shortDescriptionRaw = substituteCity(`${seedSentence}${cityLine}`, city);
  const shortDescription = clamp(shortDescriptionRaw, 240);

  // ---------------------------------------------------------------------
  // 2. Langbeschreibung gestaffelt nach targetLength bauen.
  // ---------------------------------------------------------------------
  const priceFragment = matchedService?.defaultPriceLabel
    ? ` Richtpreis: ${matchedService.defaultPriceLabel}.`
    : "";
  const durationFragment = matchedService?.defaultDurationLabel
    ? ` Zeitbedarf: ${matchedService.defaultDurationLabel}.`
    : "";

  const contentParagraph = polish(
    `${seedSentence.replace(/\.$/, "")}${priceFragment}${durationFragment}`,
  );

  const processParagraph = buildProcessParagraph(
    preset.defaultProcessSteps,
    serviceTitle,
  );

  const trustParagraph = buildTrustParagraph(
    context.uniqueSellingPoints,
    businessName,
    city,
  );

  let longParagraphs: string[];
  switch (targetLength) {
    case "short":
      longParagraphs = [contentParagraph];
      break;
    case "long":
      longParagraphs = [contentParagraph, processParagraph, trustParagraph];
      break;
    case "medium":
    default:
      longParagraphs = [contentParagraph, processParagraph];
      break;
  }

  const longDescriptionRaw = substituteCity(
    longParagraphs.join("\n\n"),
    city,
  );
  const longDescription = clamp(longDescriptionRaw, 2000);

  const result = {
    shortDescription,
    longDescription,
  };

  // Validierung als letztes Sicherheitsnetz.
  return ServiceDescriptionOutputSchema.parse(result);
}
