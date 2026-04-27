/**
 * Live-Implementierung für `improveServiceDescription` über die
 * OpenAI Chat-Completions-API mit Structured Outputs.
 *
 * Design-Prinzipien (Recherche zu Code-Session 22):
 *   - Role-Prompting („Du bist ein deutscher Texter für lokale
 *     Dienstleistungsbetriebe …") schärft Tonalität ohne explizite
 *     Beispiele.
 *   - Output-Struktur strict (Zod → JSON-Schema): kurze + lange
 *     Beschreibung, beide deutsch, beide ohne Marketing-Floskeln.
 *   - Lokale Verankerung: Stadt + Branchen-Label fließen ein, weil
 *     250-Wort-Beschreibungen (laut 2026-Local-SEO-Recherche) den
 *     Service + Service-Area sichtbar nennen sollen.
 *   - Fallback-Verhalten im Prompt: bei sinnlosem Input keine
 *     Halluzination, sondern defensive Standard-Texte.
 *
 * Caching:
 *   - Statischer System-Prompt (rund 1.500 Tokens) wird automatisch
 *     gecacht, sobald er ≥ 1024 Tokens hat.
 *   - `prompt_cache_key` = `lp:service-desc:${industryKey}:${targetLength}`
 *     bündelt Calls über alle Betriebe einer Branche mit gleicher
 *     Längenstufe.
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
import { zodResponseFormat } from "openai/helpers/zod";
import {
  buildOpenAIClient,
  getOpenAIModel,
  mapOpenAIError,
} from "./_client";

const SYSTEM_PROMPT = `Du bist ein erfahrener deutscher Texter für lokale
Dienstleistungsbetriebe. Du schreibst Service-Seiten klar, konkret und ohne
Marketing-Floskeln. Keine Superlative wie „beste", „#1" oder „einzigartig".
Stattdessen: konkrete Vorteile, transparente Preise, echte Erfahrungswerte.

Du erhältst:
  - einen branchenspezifischen Kontext (Branche, Stadt, Tonalität, USPs),
  - einen Service-Titel,
  - optional eine bestehende Beschreibung, die als Saatzeile dient,
  - eine Ziel-Länge ("short", "medium", "long"), die den longDescription-
    Aufbau steuert.

Liefere zwei Felder:

  - "shortDescription"  ≤ 240 Zeichen — Google-Business-Profil-tauglich,
    lokal verankert. Eine bis zwei Sätze, konkret, ohne Superlative.
  - "longDescription"   ≤ 2000 Zeichen — service-page-tauglich. Aufbau:
      "short"  → 1 Absatz (Saatzeile + optionaler Preis-/Dauer-Hinweis).
      "medium" → 2 Absätze (Inhalt + Ablauf in 3 Schritten).
      "long"   → 3 Absätze (Inhalt + Ablauf + Trust-Block aus USPs).

Regeln:
  1. Sprache ist deutsch.
  2. Wenn eine bestehende Beschreibung vorliegt, nimm sie als Saat und
     poliere sie (statt komplett neu zu schreiben).
  3. Wenn USPs vorhanden sind, würdige sie im Trust-Block (long-Variante)
     als Aufzählung mit "·" als Bullet.
  4. Wenn der Input unvollständig oder unsinnig ist, liefere defensive
     Standardtexte, die jeder Betrieb dieser Branche nutzen könnte —
     nicht halluzinieren.
  5. Halte dich strikt an das vorgegebene JSON-Schema.`;

function buildUserPrompt(input: ServiceDescriptionInput): string {
  const preset = getPresetOrFallback(input.context.industryKey);
  const lines: string[] = [
    `Branchen-Label: ${preset.label}`,
    `Branche-Beschreibung: ${preset.description}`,
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
    `Service-Titel: ${input.serviceTitle}`,
    `Ziel-Länge: ${input.targetLength}`,
  ];
  if (input.currentDescription.trim().length > 0) {
    lines.push(
      `Bestehende Beschreibung (als Saat polieren, nicht komplett neu schreiben):\n${input.currentDescription.trim()}`,
    );
  }
  return lines.join("\n");
}

/**
 * Cache-Key teilt sich über alle Betriebe einer Branche mit
 * gleicher Längen-Stufe — nicht pro Service-Titel, weil zwei Salons
 * mit unterschiedlichen Service-Titeln den gleichen System-Prompt
 * verwenden.
 */
function buildCacheKey(input: ServiceDescriptionInput): string {
  return `lp:service-desc:${input.context.industryKey}:${input.targetLength}`;
}

export async function openaiImproveServiceDescription(
  input: ServiceDescriptionInput,
): Promise<ServiceDescriptionOutput> {
  const parsed = ServiceDescriptionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für improveServiceDescription (OpenAI): ${parsed.error.message}`,
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
        ServiceDescriptionOutputSchema,
        "service_description",
      ),
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

    return ServiceDescriptionOutputSchema.parse(message.parsed);
  } catch (err) {
    throw mapOpenAIError(err);
  }
}
