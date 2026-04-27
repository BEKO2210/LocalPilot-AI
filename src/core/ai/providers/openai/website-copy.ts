/**
 * Live-Implementierung für `generateWebsiteCopy` über die OpenAI
 * Chat-Completions-API mit **Structured Outputs** (`response_format`
 * via `zodResponseFormat`).
 *
 * Design-Prinzipien (Recherche zu Code-Session 21):
 *   - **Prompt-Caching-Optimierung**: statischer Anteil zuerst
 *     (System-Prompt mit Stilrichtlinien + Branchen-Kontext),
 *     variabler Anteil zuletzt (konkretes Variant + Hinweis).
 *     Gemeinsame Prefixe ≥ 1024 Tokens werden vom Server automatisch
 *     gecacht (90 % Input-Token-Rabatt, bis zu 80 % weniger Latenz).
 *   - **`prompt_cache_key`**: pro Branche+Variante eindeutig, damit
 *     OpenAI mehrere Requests auf den gleichen Cache routen kann.
 *   - **Strict-JSON-Schema** via Zod: das SDK erzwingt das gewünschte
 *     Output-Schema und verhindert Halluzinationen.
 *   - **Fallback-Verhalten** im Prompt definiert: wenn der Input
 *     unsinnig ist, soll das Modell defensive Default-Texte
 *     produzieren statt zu halluzinieren.
 *
 * Fehlerpfade (alle gehen über `mapOpenAIError`):
 *   - Input-Schema-Fehler → `invalid_input`
 *   - Fehlender Key (Vor-Check) → `no_api_key`
 *   - 401/403 vom SDK → `no_api_key`
 *   - 429 vom SDK → `rate_limited`
 *   - 5xx vom SDK → `provider_unavailable`
 *   - Empty/parse-Fehler → `empty_response`
 */

import {
  WebsiteCopyInputSchema,
  WebsiteCopyOutputSchema,
} from "@/core/validation/ai.schema";
import { AIProviderError } from "@/types/ai";
import type { WebsiteCopyInput, WebsiteCopyOutput } from "@/types/ai";
import { getPresetOrFallback } from "@/core/industries";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  buildOpenAIClient,
  getOpenAIModel,
  mapOpenAIError,
} from "./_client";

/**
 * Statischer System-Prompt — beim Wiederholen hilfst du dem
 * Server-Caching, weil der Prefix identisch bleibt. Variable Teile
 * (Branchen-Kontext, Variant) hängen wir als zweite User-Nachricht
 * an, damit der System-Prompt selbst stabil ist.
 */
const SYSTEM_PROMPT = `Du bist ein erfahrener deutscher Texter für lokale Dienstleistungsbetriebe.
Du schreibst klar, konkret und ohne Marketing-Floskeln. Keine Superlative wie
„beste", „#1" oder „einzigartig". Stattdessen: konkrete Vorteile, transparente
Preise, echte Erfahrungswerte.

Du erhältst einen branchenspezifischen Kontext (Branche, Stadt, Tonalität,
Alleinstellungsmerkmale) und einen Variant-Hinweis ("hero", "about",
"services_intro" oder "benefits_intro"). Deine Aufgabe ist es, drei Felder
zu liefern:

  - "heroTitle":     prägnante Überschrift, ≤ 160 Zeichen.
  - "heroSubtitle":  ergänzender Satz, ≤ 280 Zeichen.
  - "aboutText":     mehrzeiliger Beschreibungstext, ≤ 1200 Zeichen.

Regeln:
  1. Sprache ist deutsch. Tonalität entspricht dem mitgegebenen Wert.
  2. Wenn eine Stadt genannt ist, baue sie behutsam ein (nicht in jedem Satz).
  3. Wenn USPs (Alleinstellungsmerkmale) vorhanden sind, würdige sie im
     aboutText — gerne als Aufzählung mit "·" als Bullet.
  4. Wenn der Input unvollständig oder unsinnig ist, liefere defensive
     Standardtexte, die jeder lokale Betrieb verwenden könnte. Nicht
     halluzinieren.
  5. Halte dich strikt an das vorgegebene JSON-Schema.`;

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

/**
 * Stabiler Cache-Key pro (Branche, Variant) — nicht pro Betrieb,
 * damit zwei Friseur-Salons in unterschiedlichen Städten mit
 * gleicher Variante den gleichen Cache-Hit teilen können.
 */
function buildCacheKey(input: WebsiteCopyInput): string {
  return `lp:website-copy:${input.context.industryKey}:${input.variant}`;
}

export async function openaiGenerateWebsiteCopy(
  input: WebsiteCopyInput,
): Promise<WebsiteCopyOutput> {
  const parsed = WebsiteCopyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateWebsiteCopy (OpenAI): ${parsed.error.message}`,
    );
  }

  let client;
  try {
    client = buildOpenAIClient();
  } catch (err) {
    throw mapOpenAIError(err);
  }

  const model = getOpenAIModel();
  const userPrompt = buildUserPrompt(parsed.data);
  const cacheKey = buildCacheKey(parsed.data);

  try {
    const completion = await client.chat.completions.parse({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(
        WebsiteCopyOutputSchema,
        "website_copy",
      ),
      // OpenAI-spezifische Caching-Hilfe; das SDK reicht es als
      // `prompt_cache_key` an die API weiter, falls unterstützt.
      // (Wenn das Modell den Parameter nicht kennt, wird er ignoriert.)
      ...({ prompt_cache_key: cacheKey } as Record<string, unknown>),
    });

    const message = completion.choices[0]?.message;
    if (!message) {
      throw new AIProviderError(
        "empty_response",
        "OpenAI lieferte keine Antwort zurück.",
      );
    }
    if (message.refusal) {
      throw new AIProviderError(
        "empty_response",
        `OpenAI hat die Anfrage abgelehnt: ${message.refusal}`,
      );
    }
    if (!message.parsed) {
      throw new AIProviderError(
        "empty_response",
        "OpenAI-Antwort enthielt kein parsed-Feld trotz strict-Schema.",
      );
    }

    // Doppelte Sicherheit — auch wenn `zodResponseFormat` schon parst,
    // lassen wir noch einmal validieren, bevor wir zurückgeben.
    return WebsiteCopyOutputSchema.parse(message.parsed);
  } catch (err) {
    throw mapOpenAIError(err);
  }
}
