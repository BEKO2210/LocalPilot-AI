/**
 * Live-Implementierung für `generateWebsiteCopy` über die
 * Gemini-Generate-Content-API mit **Structured Output** (
 * `responseMimeType: "application/json"` + `responseJsonSchema`).
 *
 * Gemini-spezifische Designentscheidungen (Recherche zu
 * Code-Session 26):
 *   - **Structured Output via JSON Schema**: Gemini hat seit
 *     v1.x ein natives `responseJsonSchema`-Feld. Wir definieren
 *     ein JSON-Schema, das exakt unserem `WebsiteCopyOutputSchema`
 *     entspricht, und reichen es als Constraint mit. Das Ergebnis
 *     kommt als JSON-String in `response.text`, den wir parsen
 *     und durch Zod validieren.
 *   - **Property-Reihenfolge im Prompt = Reihenfolge im Schema**:
 *     wenn Beschreibungen oder Beispiele im Prompt eine andere
 *     Reihenfolge haben als das Schema, kann das Modell halluzinieren.
 *     Unser System-Prompt nennt die Felder in der gleichen Reihenfolge
 *     wie das Schema.
 *   - **Kein Caching in dieser Iteration**: Gemini-Caching geht über
 *     die separate `caches.create(...)`-API und lohnt sich erst ab
 *     größeren Volumen. Kommt in einer späteren Session als eigener
 *     Tracker.
 *   - **Fallback-Verhalten** im Prompt: wenn der Input unsinnig ist,
 *     soll das Modell defensive Default-Texte produzieren statt zu
 *     halluzinieren.
 *
 * Fehlerpfade gehen über `mapGeminiError`:
 *   401/403 → no_api_key
 *   429 → rate_limited
 *   5xx → provider_unavailable
 *   400 → invalid_input
 *   sonst → unknown
 */

import {
  WebsiteCopyInputSchema,
  WebsiteCopyOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type { WebsiteCopyInput, WebsiteCopyOutput } from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";
import {
  buildGeminiClient,
  getGeminiModel,
  mapGeminiError,
} from "./_client";

const SYSTEM_PROMPT = `Du bist ein erfahrener deutscher Texter für lokale
Dienstleistungsbetriebe. Du schreibst klar, konkret und ohne Marketing-
Floskeln. Keine Superlative wie „beste", „#1" oder „einzigartig". Stattdessen:
konkrete Vorteile, transparente Preise, echte Erfahrungswerte.

Du erhältst einen branchenspezifischen Kontext (Branche, Stadt, Tonalität,
Alleinstellungsmerkmale) und einen Variant-Hinweis ("hero", "about",
"services_intro" oder "benefits_intro"). Liefere strikt JSON mit drei
Feldern in dieser Reihenfolge:

  1. "heroTitle"     — prägnante Überschrift, ≤ 160 Zeichen.
  2. "heroSubtitle"  — ergänzender Satz, ≤ 280 Zeichen.
  3. "aboutText"     — mehrzeiliger Beschreibungstext, ≤ 1200 Zeichen.

Regeln:
  1. Sprache ist deutsch. Tonalität entspricht dem mitgegebenen Wert.
  2. Wenn eine Stadt genannt ist, baue sie behutsam ein (nicht in jedem Satz).
  3. Wenn USPs (Alleinstellungsmerkmale) vorhanden sind, würdige sie im
     aboutText — gerne als Aufzählung mit "·" als Bullet.
  4. Wenn der Input unvollständig oder unsinnig ist, liefere defensive
     Standardtexte, die jeder lokale Betrieb verwenden könnte. Nicht
     halluzinieren.
  5. Antworte ausschließlich mit dem JSON-Objekt, kein Markdown, kein
     Fließtext drum herum.`;

/**
 * JSON Schema für Structured Output. Property-Reihenfolge entspricht
 * exakt der Reihenfolge im System-Prompt — wichtig laut Gemini-2026-
 * Best-Practices, sonst kann das Modell die Felder verwechseln.
 */
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    heroTitle: {
      type: "string",
      description: "Prägnante Überschrift, ≤ 160 Zeichen.",
    },
    heroSubtitle: {
      type: "string",
      description: "Ergänzender Satz, ≤ 280 Zeichen.",
    },
    aboutText: {
      type: "string",
      description: "Mehrzeiliger Beschreibungstext, ≤ 1200 Zeichen.",
    },
  },
  required: ["heroTitle", "heroSubtitle", "aboutText"],
  propertyOrdering: ["heroTitle", "heroSubtitle", "aboutText"],
};

function buildUserPrompt(input: WebsiteCopyInput): string {
  const preset = getPresetOrFallback(input.context.industryKey);
  const lines: string[] = [
    `Branchen-Label: ${preset.label}`,
    `Branche-Beschreibung: ${preset.description}`,
    `Zielgruppe (Default): ${preset.targetAudience.join(", ")}`,
    `Betriebsname: ${input.context.businessName}`,
    `Stadt: ${input.context.city ?? "(nicht angegeben)"}`,
    `Tonalität: ${
      input.context.toneOfVoice.length > 0
        ? input.context.toneOfVoice.join(", ")
        : "(neutral, freundlich, sachlich)"
    }`,
    `USPs: ${
      input.context.uniqueSellingPoints.length > 0
        ? input.context.uniqueSellingPoints.join(" | ")
        : "(keine angegeben)"
    }`,
    `Default-Hero-Titel der Branche: ${preset.defaultHeroTitle}`,
    `Default-Hero-Untertitel der Branche: ${preset.defaultHeroSubtitle}`,
    `Variant: ${input.variant}`,
  ];
  if (input.hint) {
    lines.push(`Spezifischer Hinweis: ${input.hint}`);
  }
  return lines.join("\n");
}

export async function geminiGenerateWebsiteCopy(
  input: WebsiteCopyInput,
): Promise<WebsiteCopyOutput> {
  const parsed = WebsiteCopyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateWebsiteCopy (Gemini): ${parsed.error.message}`,
    );
  }

  let client;
  try {
    client = buildGeminiClient();
  } catch (err) {
    throw mapGeminiError(err);
  }

  const model = getGeminiModel();
  const userPrompt = buildUserPrompt(parsed.data);

  try {
    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    const rawText = response.text;
    if (!rawText || rawText.trim().length === 0) {
      throw new AIProviderError(
        "empty_response",
        "Gemini lieferte keinen Text-Content zurück.",
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      throw new AIProviderError(
        "empty_response",
        `Gemini-Antwort ist kein gültiges JSON: ${rawText.slice(0, 200)}…`,
      );
    }

    return WebsiteCopyOutputSchema.parse(parsedJson);
  } catch (err) {
    throw mapGeminiError(err);
  }
}
