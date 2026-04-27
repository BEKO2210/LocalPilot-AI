/**
 * Smoketest für den OpenAI-Provider — `generateWebsiteCopy`
 * (Code-Session 21).
 *
 * Zwei Modi:
 *
 *   1. **Strukturell** (immer ausgeführt): prüft den Code-Pfad ohne
 *      Netzwerk-Call.
 *      - `openaiProvider` ist ein gültiges `AIProvider`.
 *      - Ohne `OPENAI_API_KEY` wirft `generateWebsiteCopy`
 *        `AIProviderError("no_api_key")`, **bevor** ein Netzwerk-
 *        Call rausgeht.
 *      - Ungültiges Input wirft `invalid_input` (vor dem Key-Check
 *        ist die Schema-Validierung).
 *      - Resolver mit `AI_PROVIDER=openai` + Key liefert den
 *        OpenAI-Provider zurück (kein Fallback auf Mock).
 *      - Die übrigen 6 Methoden werfen weiterhin `provider_unavailable`.
 *
 *   2. **Live** (nur wenn `OPENAI_API_KEY` und
 *      `LP_TEST_OPENAI_LIVE=1` gesetzt sind):
 *      - Echte API wird genau einmal aufgerufen mit einem minimalen
 *        Hairdresser-Hero-Input.
 *      - Output muss `WebsiteCopyOutputSchema` erfüllen.
 *
 * Damit ist der CI-Pfad ohne Key sauber grün, und der Auftraggeber
 * kann mit Key zusätzlich live verifizieren.
 */

import { openaiProvider } from "@/core/ai/providers/openai-provider";
import { getAIProvider } from "@/core/ai";
import { AIProviderError } from "@/types/ai";
import type { AIBusinessContext, WebsiteCopyInput } from "@/types/ai";
import {
  ServiceDescriptionOutputSchema,
  WebsiteCopyOutputSchema,
} from "@/core/validation/ai.schema";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`OpenAI-provider assertion failed: ${message}`);
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
  assert(openaiProvider.key === "openai", "openaiProvider.key === 'openai'");

  // 1b. Alle 7 AIProvider-Methoden sind Funktionen.
  const allMethods =
    typeof openaiProvider.generateWebsiteCopy === "function" &&
    typeof openaiProvider.improveServiceDescription === "function" &&
    typeof openaiProvider.generateFaqs === "function" &&
    typeof openaiProvider.generateCustomerReply === "function" &&
    typeof openaiProvider.generateReviewRequest === "function" &&
    typeof openaiProvider.generateSocialPost === "function" &&
    typeof openaiProvider.generateOfferCampaign === "function";
  assert(allMethods, "alle 7 OpenAI-Provider-Methoden sind Funktionen");

  // 1c. Ohne API-Key werfen die scharfen Methoden 'no_api_key'.
  const savedKey = process.env["OPENAI_API_KEY"];
  delete process.env["OPENAI_API_KEY"];
  try {
    await expectThrowsWithCode(
      "no key → generateWebsiteCopy",
      () => openaiProvider.generateWebsiteCopy(heroInput),
      "no_api_key",
    );
    await expectThrowsWithCode(
      "no key → improveServiceDescription",
      () =>
        openaiProvider.improveServiceDescription({
          context: baseContext,
          serviceTitle: "Damenhaarschnitt",
          currentDescription: "",
          targetLength: "medium",
        }),
      "no_api_key",
    );
  } finally {
    if (savedKey !== undefined) process.env["OPENAI_API_KEY"] = savedKey;
  }

  // 1d. Ungültiges Input → 'invalid_input' (vor dem Key-Check, weil
  //     wir das Schema zuerst prüfen).
  await expectThrowsWithCode(
    "invalid input → generateWebsiteCopy",
    () =>
      openaiProvider.generateWebsiteCopy({
        // @ts-expect-error — bewusst ungültig: businessName fehlt.
        context: { industryKey: "hairdresser", packageTier: "silber" },
        variant: "hero",
      }),
    "invalid_input",
  );
  await expectThrowsWithCode(
    "invalid input → improveServiceDescription",
    () =>
      openaiProvider.improveServiceDescription({
        context: baseContext,
        serviceTitle: "X", // zu kurz, Schema verlangt min(2)
        currentDescription: "",
        targetLength: "medium",
      }),
    "invalid_input",
  );

  // 1e. Resolver mit AI_PROVIDER=openai + Key → openai (nicht Mock).
  const resolved = getAIProvider({
    env: { AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-fake-only-resolver" },
  });
  assert(resolved.key === "openai", "Resolver routet auf openai mit Key");

  // 1f. Übrige 5 Methoden werfen weiterhin 'provider_unavailable'.
  //     (improveServiceDescription ist mit Code-Session 22 scharf.)
  await expectThrowsWithCode(
    "generateFaqs stub",
    () =>
      openaiProvider.generateFaqs({
        context: baseContext,
        topics: [],
        count: 3,
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateCustomerReply stub",
    () =>
      openaiProvider.generateCustomerReply({
        context: baseContext,
        customerMessage: "Wann haben Sie geöffnet?",
        tone: "friendly",
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateReviewRequest stub",
    () =>
      openaiProvider.generateReviewRequest({
        context: baseContext,
        channel: "whatsapp",
        tone: "friendly",
      }),
    "provider_unavailable",
  );
  await expectThrowsWithCode(
    "generateSocialPost stub",
    () =>
      openaiProvider.generateSocialPost({
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
      openaiProvider.generateOfferCampaign({
        context: baseContext,
        offerTitle: "Frühlingsaktion",
        details: "",
      }),
    "provider_unavailable",
  );

  // -----------------------------------------------------------------------
  // Modus 2 — Live (nur mit gesetztem Key + opt-in Flag).
  // -----------------------------------------------------------------------

  const liveOptIn = process.env["LP_TEST_OPENAI_LIVE"] === "1";
  const hasKey = (process.env["OPENAI_API_KEY"] ?? "").trim().length > 0;

  if (liveOptIn && hasKey) {
    const out = await openaiProvider.generateWebsiteCopy(heroInput);
    const validated = WebsiteCopyOutputSchema.parse(out);
    assert(
      validated.heroTitle.length > 0 &&
        validated.heroSubtitle.length > 0 &&
        validated.aboutText.length > 0,
      "Live-Call generateWebsiteCopy: alle drei Felder befüllt",
    );
    console.log("✓ Live-OpenAI-Call (generateWebsiteCopy) erfolgreich.");

    const sd = await openaiProvider.improveServiceDescription({
      context: baseContext,
      serviceTitle: "Damenhaarschnitt mit Tiefenpflege",
      currentDescription:
        "Wäsche, Schnitt, Föhn-Finish — Termine auch samstags möglich.",
      targetLength: "long",
    });
    const sdValidated = ServiceDescriptionOutputSchema.parse(sd);
    assert(
      sdValidated.shortDescription.length > 0 &&
        sdValidated.longDescription.length > 0,
      "Live-Call improveServiceDescription: beide Felder befüllt",
    );
    console.log(
      "✓ Live-OpenAI-Call (improveServiceDescription) erfolgreich.",
    );
  }
}

void run();

export const __AI_OPENAI_PROVIDER_SMOKETEST__ = {
  structuralAssertions: 14,
  liveOptInVar: "LP_TEST_OPENAI_LIVE",
  // Live-Call läuft nur mit `LP_TEST_OPENAI_LIVE=1` UND `OPENAI_API_KEY`.
};
