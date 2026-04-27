/**
 * Live-Implementierung für `generateWebsiteCopy` über die Anthropic
 * Messages-API mit **Tool Use** als Strukturierungs-Vehikel.
 *
 * Anthropic-spezifische Designentscheidungen (Recherche zu
 * Code-Session 24):
 *   - **Tool Use** statt JSON-Format-Anweisung. Wir definieren ein
 *     pseudo-Tool `emit_website_copy` mit `input_schema`, dessen
 *     Properties exakt unserem `WebsiteCopyOutputSchema` entsprechen.
 *     Mit `tool_choice: { type: "tool", name: "emit_website_copy" }`
 *     zwingen wir das Modell, dieses Tool aufzurufen — der
 *     `tool_use`-Content-Block enthält dann das strukturierte
 *     Ergebnis.
 *   - **Prompt-Caching** via `cache_control: { type: "ephemeral" }`
 *     auf System-Prompt **und** Tool-Definition. Beide Blöcke sind
 *     für sich ≥ 1024 Tokens und werden 5 min gecacht. Bei einem
 *     Hit zahlen wir nur den variablen User-Teil zum vollen Preis.
 *   - **Doppelte Validierung** über `WebsiteCopyOutputSchema.parse`
 *     auf das Tool-Use-Input — auch wenn das Modell sich an unser
 *     Schema halten soll, ist Zod die letzte verbindliche Hürde.
 *
 * Fehlerpfade gehen über `mapAnthropicError`:
 *   AuthenticationError → no_api_key
 *   RateLimitError → rate_limited
 *   InternalServerError → provider_unavailable
 *   BadRequestError → invalid_input
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
  buildAnthropicClient,
  getAnthropicModel,
  mapAnthropicError,
} from "./_client";

const TOOL_NAME = "emit_website_copy";

/**
 * Statischer System-Prompt (≥ 1.024 Tokens, damit das ephemere
 * Caching greift). Identische Stilrichtlinien wie beim OpenAI-
 * Provider, damit ein späterer Provider-Wechsel keinen Tonalitäts-
 * Bruch erzeugt.
 */
const SYSTEM_PROMPT = `Du bist ein erfahrener deutscher Texter für lokale Dienstleistungsbetriebe.
Du schreibst klar, konkret und ohne Marketing-Floskeln. Keine Superlative wie
„beste", „#1" oder „einzigartig". Stattdessen: konkrete Vorteile, transparente
Preise, echte Erfahrungswerte.

Du erhältst einen branchenspezifischen Kontext (Branche, Stadt, Tonalität,
Alleinstellungsmerkmale) und einen Variant-Hinweis ("hero", "about",
"services_intro" oder "benefits_intro"). Du antwortest **ausschließlich**
über das bereitgestellte Tool emit_website_copy. Liefere drei Felder:

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
  5. Antworte ausschließlich über das Tool. Kein Free-Text.`;

const TOOL_INPUT_SCHEMA = {
  type: "object" as const,
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

export async function anthropicGenerateWebsiteCopy(
  input: WebsiteCopyInput,
): Promise<WebsiteCopyOutput> {
  const parsed = WebsiteCopyInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new AIProviderError(
      "invalid_input",
      `Ungültiges Input für generateWebsiteCopy (Anthropic): ${parsed.error.message}`,
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
      max_tokens: 1024,
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
            "Liefert die strukturierten Website-Texte (heroTitle, heroSubtitle, aboutText).",
          input_schema: TOOL_INPUT_SCHEMA,
          cache_control: { type: "ephemeral" },
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages: [{ role: "user", content: userPrompt }],
    });

    // Gesuchten tool_use-Content-Block finden.
    const toolUse = response.content.find(
      (block) => block.type === "tool_use" && block.name === TOOL_NAME,
    );
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new AIProviderError(
        "empty_response",
        "Anthropic-Antwort enthielt keinen erwarteten tool_use-Block.",
      );
    }

    // `toolUse.input` ist `unknown` aus SDK-Sicht — defensiv durch
    // Zod validieren, gleiche Pipeline wie beim Mock-Provider.
    return WebsiteCopyOutputSchema.parse(toolUse.input);
  } catch (err) {
    throw mapAnthropicError(err);
  }
}
