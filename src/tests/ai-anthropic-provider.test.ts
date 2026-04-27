/**
 * Smoketest für den Anthropic-Provider — `generateWebsiteCopy`
 * (Code-Session 24).
 *
 * Zwei Modi (analog zum OpenAI-Smoketest):
 *
 *   1. **Strukturell** (immer ausgeführt, kein Netzwerk):
 *      - `anthropicProvider` ist ein gültiges `AIProvider`.
 *      - Ohne `ANTHROPIC_API_KEY` wirft `generateWebsiteCopy`
 *        `AIProviderError("no_api_key")` **vor** Netzwerk-Call.
 *      - Ungültiges Input wirft `invalid_input` (Schema vor Key).
 *      - Resolver mit `AI_PROVIDER=anthropic` + Key liefert den
 *        Anthropic-Provider zurück (kein Mock-Fallback).
 *      - Die übrigen 6 Methoden werfen weiterhin `provider_unavailable`.
 *
 *   2. **Live** (nur mit `ANTHROPIC_API_KEY` und
 *      `LP_TEST_ANTHROPIC_LIVE=1`):
 *      - Echter API-Call mit Hairdresser-Hero-Input.
 *      - Output muss `WebsiteCopyOutputSchema` erfüllen.
 */

import { anthropicProvider } from "@/core/ai/providers/anthropic-provider";
import { getAIProvider } from "@/core/ai";
import { AIProviderError } from "@/types/ai";
import type { AIBusinessContext, WebsiteCopyInput } from "@/types/ai";
import { WebsiteCopyOutputSchema } from "@/core/validation/ai.schema";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Anthropic-provider assertion failed: ${message}`);
  }
}

const baseContext: AIBusinessContext = {
  industryKey: "hairdresser",
  packageTier: "silber",
  language: "de",
  businessName: "Salon Sophia",
  city: "Bremen",
  toneOfVoice: ["freundlich", "modern"],
  uniqueSellingPoints: ["Termine auch samstags", "Faire Festpreise"],
};

const heroInput: WebsiteCopyInput = {
  context: baseContext,
  variant: "hero",
};

async function expectThrowsWithCode<T>(
  label: string,
  fn: () => Promise<T>,
  code: string,
): Promise<void> {
  let caught: unknown = null;
  try {
    await fn();
  } catch (err) {
    caught = err;
  }
  assert(
    caught instanceof AIProviderError,
    `${label}: expected AIProviderError, got ${
      caught instanceof Error ? caught.message : typeof caught
    }`,
  );
  assert(
    (caught as AIProviderError).code === code,
    `${label}: expected code='${code}', got '${
      (caught as AIProviderError).code
    }'`,
  );
}

async function run(): Promise<void> {
  // -----------------------------------------------------------------------
  // Modus 1 — Struktur (kein Netzwerk).
  // -----------------------------------------------------------------------

  // 1a. Provider hat den richtigen Key.
  assert(
    anthropicProvider.key === "anthropic",
    "anthropicProvider.key === 'anthropic'",
  );

  // 1b. Alle 7 AIProvider-Methoden sind Funktionen.
  const allMethods =
    typeof anthropicProvider.generateWebsiteCopy === "function" &&
    typeof anthropicProvider.improveServiceDescription === "function" &&
    typeof anthropicProvider.generateFaqs === "function" &&
    typeof anthropicProvider.generateCustomerReply === "function" &&
    typeof anthropicProvider.generateReviewRequest === "function" &&
    typeof anthropicProvider.generateSocialPost === "function" &&
    typeof anthropicProvider.generateOfferCampaign === "function";
  assert(allMethods, "alle 7 Anthropic-Provider-Methoden sind Funktionen");

  // 1c. Ohne API-Key wirft generateWebsiteCopy 'no_api_key'.
  const savedKey = process.env["ANTHROPIC_API_KEY"];
  delete process.env["ANTHROPIC_API_KEY"];
  try {
    await expectThrowsWithCode(
      "no key → generateWebsiteCopy",
      () => anthropicProvider.generateWebsiteCopy(heroInput),
      "no_api_key",
    );
  } finally {
    if (savedKey !== undefined) process.env["ANTHROPIC_API_KEY"] = savedKey;
  }

  // 1d. Ungültiges Input → 'invalid_input' (Schema-Check vor Key-Check).
  await expectThrowsWithCode(
    "invalid input → generateWebsiteCopy",
    () =>
      anthropicProvider.generateWebsiteCopy({
        // @ts-expect-error — bewusst ungültig: businessName fehlt.
        context: { industryKey: "hairdresser", packageTier: "silber" },
        variant: "hero",
      }),
    "invalid_input",
  );

  // 1e. Resolver mit AI_PROVIDER=anthropic + Key → anthropic.
  const resolved = getAIProvider({
    env: {
      AI_PROVIDER: "anthropic",
      ANTHROPIC_API_KEY: "sk-ant-fake-only-resolver",
    },
  });
  assert(
    resolved.key === "anthropic",
    "Resolver routet auf anthropic mit Key",
  );

  // 1f. Übrige 6 Methoden werfen weiterhin 'provider_unavailable'.
  await expectThrowsWithCode(
    "improveServiceDescription stub",
    () =>
      anthropicProvider.improveServiceDescription({
        context: baseContext,
        serviceTitle: "Damenhaarschnitt",
        currentDescription: "",
        targetLength: "medium",
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateFaqs stub",
    () =>
      anthropicProvider.generateFaqs({
        context: baseContext,
        topics: [],
        count: 3,
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateCustomerReply stub",
    () =>
      anthropicProvider.generateCustomerReply({
        context: baseContext,
        customerMessage: "Wann haben Sie geöffnet?",
        tone: "friendly",
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateReviewRequest stub",
    () =>
      anthropicProvider.generateReviewRequest({
        context: baseContext,
        channel: "whatsapp",
        tone: "friendly",
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateSocialPost stub",
    () =>
      anthropicProvider.generateSocialPost({
        context: baseContext,
        platform: "instagram",
        goal: "more_appointments",
        topic: "Damenhaarschnitt",
        length: "medium",
        includeHashtags: true,
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateOfferCampaign stub",
    () =>
      anthropicProvider.generateOfferCampaign({
        context: baseContext,
        offerTitle: "Frühlingsaktion",
        details: "",
      }),
    "provider_unavailable",
  );

  // -----------------------------------------------------------------------
  // Modus 2 — Live (nur mit gesetztem Key + opt-in Flag).
  // -----------------------------------------------------------------------

  const liveOptIn = process.env["LP_TEST_ANTHROPIC_LIVE"] === "1";
  const hasKey = (process.env["ANTHROPIC_API_KEY"] ?? "").trim().length > 0;

  if (liveOptIn && hasKey) {
    const out = await anthropicProvider.generateWebsiteCopy(heroInput);
    const validated = WebsiteCopyOutputSchema.parse(out);
    assert(
      validated.heroTitle.length > 0 &&
        validated.heroSubtitle.length > 0 &&
        validated.aboutText.length > 0,
      "Live-Anthropic-Call: alle drei Felder befüllt",
    );
    console.log("✓ Live-Anthropic-Call (generateWebsiteCopy) erfolgreich.");
  }
}

void run();

export const __AI_ANTHROPIC_PROVIDER_SMOKETEST__ = {
  structuralAssertions: 12,
  liveOptInVar: "LP_TEST_ANTHROPIC_LIVE",
};
