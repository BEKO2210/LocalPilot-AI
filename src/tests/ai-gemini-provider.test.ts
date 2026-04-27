/**
 * Smoketest für den Gemini-Provider — `generateWebsiteCopy`
 * (Code-Session 26).
 *
 * Zwei Modi (analog zu OpenAI/Anthropic-Smoketests):
 *
 *   1. **Strukturell** (immer ausgeführt, kein Netzwerk):
 *      - `geminiProvider` ist ein gültiges `AIProvider`.
 *      - Ohne `GEMINI_API_KEY` wirft `generateWebsiteCopy`
 *        `AIProviderError("no_api_key")` **vor** Netzwerk-Call.
 *      - Ungültiges Input wirft `invalid_input` (Schema vor Key).
 *      - Resolver mit `AI_PROVIDER=gemini` + Key liefert den
 *        Gemini-Provider zurück (kein Mock-Fallback).
 *      - Die übrigen 6 Methoden werfen weiterhin `provider_unavailable`.
 *
 *   2. **Live** (nur mit `GEMINI_API_KEY` und
 *      `LP_TEST_GEMINI_LIVE=1`):
 *      - Echter API-Call mit Hairdresser-Hero-Input.
 *      - Output muss `WebsiteCopyOutputSchema` erfüllen.
 */

import { geminiProvider } from "@/core/ai/providers/gemini-provider";
import { getAIProvider } from "@/core/ai";
import { AIProviderError } from "@/types/ai";
import type { AIBusinessContext, WebsiteCopyInput } from "@/types/ai";
import { WebsiteCopyOutputSchema } from "@/core/validation/ai.schema";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Gemini-provider assertion failed: ${message}`);
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
  assert(geminiProvider.key === "gemini", "geminiProvider.key === 'gemini'");

  // 1b. Alle 7 AIProvider-Methoden sind Funktionen.
  const allMethods =
    typeof geminiProvider.generateWebsiteCopy === "function" &&
    typeof geminiProvider.improveServiceDescription === "function" &&
    typeof geminiProvider.generateFaqs === "function" &&
    typeof geminiProvider.generateCustomerReply === "function" &&
    typeof geminiProvider.generateReviewRequest === "function" &&
    typeof geminiProvider.generateSocialPost === "function" &&
    typeof geminiProvider.generateOfferCampaign === "function";
  assert(allMethods, "alle 7 Gemini-Provider-Methoden sind Funktionen");

  // 1c. Ohne API-Key wirft generateWebsiteCopy 'no_api_key'.
  const savedKey = process.env["GEMINI_API_KEY"];
  delete process.env["GEMINI_API_KEY"];
  try {
    await expectThrowsWithCode(
      "no key → generateWebsiteCopy",
      () => geminiProvider.generateWebsiteCopy(heroInput),
      "no_api_key",
    );
  } finally {
    if (savedKey !== undefined) process.env["GEMINI_API_KEY"] = savedKey;
  }

  // 1d. Ungültiges Input → 'invalid_input' (Schema-Check vor Key-Check).
  await expectThrowsWithCode(
    "invalid input → generateWebsiteCopy",
    () =>
      geminiProvider.generateWebsiteCopy({
        // @ts-expect-error — bewusst ungültig: businessName fehlt.
        context: { industryKey: "hairdresser", packageTier: "silber" },
        variant: "hero",
      }),
    "invalid_input",
  );

  // 1e. Resolver mit AI_PROVIDER=gemini + Key → gemini.
  const resolved = getAIProvider({
    env: {
      AI_PROVIDER: "gemini",
      GEMINI_API_KEY: "ya29-fake-only-resolver",
    },
  });
  assert(
    resolved.key === "gemini",
    "Resolver routet auf gemini mit Key",
  );

  // 1f. Übrige 6 Methoden werfen weiterhin 'provider_unavailable'.
  await expectThrowsWithCode(
    "improveServiceDescription stub",
    () =>
      geminiProvider.improveServiceDescription({
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
      geminiProvider.generateFaqs({
        context: baseContext,
        topics: [],
        count: 3,
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateCustomerReply stub",
    () =>
      geminiProvider.generateCustomerReply({
        context: baseContext,
        customerMessage: "Wann haben Sie geöffnet?",
        tone: "friendly",
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateReviewRequest stub",
    () =>
      geminiProvider.generateReviewRequest({
        context: baseContext,
        channel: "whatsapp",
        tone: "friendly",
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateSocialPost stub",
    () =>
      geminiProvider.generateSocialPost({
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
      geminiProvider.generateOfferCampaign({
        context: baseContext,
        offerTitle: "Frühlingsaktion",
        details: "",
      }),
    "provider_unavailable",
  );

  // -----------------------------------------------------------------------
  // Modus 2 — Live (nur mit gesetztem Key + opt-in Flag).
  // -----------------------------------------------------------------------

  const liveOptIn = process.env["LP_TEST_GEMINI_LIVE"] === "1";
  const hasKey = (process.env["GEMINI_API_KEY"] ?? "").trim().length > 0;

  if (liveOptIn && hasKey) {
    const out = await geminiProvider.generateWebsiteCopy(heroInput);
    const validated = WebsiteCopyOutputSchema.parse(out);
    assert(
      validated.heroTitle.length > 0 &&
        validated.heroSubtitle.length > 0 &&
        validated.aboutText.length > 0,
      "Live-Gemini-Call: alle drei Felder befüllt",
    );
    console.log("✓ Live-Gemini-Call (generateWebsiteCopy) erfolgreich.");
  }
}

void run();

export const __AI_GEMINI_PROVIDER_SMOKETEST__ = {
  structuralAssertions: 12,
  liveOptInVar: "LP_TEST_GEMINI_LIVE",
};
