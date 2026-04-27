/**
 * Live-Implementierung für `improveServiceDescription` über die
 * Anthropic Messages-API mit **Tool Use** als Strukturierungs-Vehikel.
 *
 * Gleiches Muster wie `anthropic/website-copy.ts`:
 *   - Pseudo-Tool `emit_service_description` mit `input_schema`,
 *     dessen Properties dem `ServiceDescriptionOutputSchema`
 *     entsprechen.
 *   - `tool_choice: { type: "tool", name: TOOL_NAME }` zwingt das
 *     Modell, das Tool aufzurufen.
 *   - `cache_control: { type: "ephemeral" }` auf System-Prompt
 *     **und** Tool-Definition (5 min TTL, ≥ 1024 Tokens, ~90 %
 *     Token-Rabatt bei Hit).
 *   - Doppelte Validierung über `ServiceDescriptionOutputSchema.parse`.
 *
 * System-Prompt ist inhaltlich kompatibel mit dem OpenAI-Pendant
 * (gleiche Stilrichtlinien, gleiche Längen-Logik pro `targetLength`,
 * gleiche `currentDescription`-Polish-Anweisung), damit ein
 * Provider-Wechsel keinen Tonalitäts-Bruch erzeugt.
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
import {
  buildAnthropicClient,
  getAnthropicModel,
  mapAnthropicError,
} from "./_client";

const TOOL_NAME = "emit_service_description";

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

Du antwortest **ausschließlich** über das bereitgestellte Tool
emit_service_description. Liefere zwei Felder:

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
  5. Antworte ausschließlich über das Tool. Kein Free-Text.`;

const TOOL_INPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    shortDescription: {
      type: "string",
      description:
        "Kurzversion (≤ 240 Zeichen, lokal verankert, ohne Superlative).",
    },
    longDescription: {
      type: "string",
      description:
        "Langversion (≤ 2000 Zeichen). 1, 2 oder 3 Absätze je nach Ziel-Länge.",
    },
  },
  required: ["shortDescription", "longDescription"],
};

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

export async function anthropicImproveServiceDescription(
  input: ServiceDescriptionInput,
): Promise<ServiceDescriptionOutput> {
  const parsed = ServiceDescriptionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für improveServiceDescription (Anthropic): ${parsed.error.message}`,
    );
  }

  let client;
  try {
    client = buildAnthropicClient();
  } catch (err) {
    throw mapAnthropicError(err);
  }

  const model = getAnthropicModel();
  const userPrompt = buildUserPrompt(parsed.data);

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        {
          name: TOOL_NAME,
          description:
            "Liefert die strukturierte Service-Beschreibung (shortDescription, longDescription).",
          input_schema: TOOL_INPUT_SCHEMA,
          cache_control: { type: "ephemeral" },
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolUse = response.content.find(
      (block) => block.type === "tool_use" && block.name === TOOL_NAME,
    );
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new AIProviderError(
        "empty_response",
        "Anthropic-Antwort enthielt keinen erwarteten tool_use-Block.",
      );
    }

    return ServiceDescriptionOutputSchema.parse(toolUse.input);
  } catch (err) {
    throw mapAnthropicError(err);
  }
}
