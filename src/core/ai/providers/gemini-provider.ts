import type { AIProvider } from "@/types/ai";
import { buildStubProvider } from "./_stub";
import { geminiGenerateWebsiteCopy } from "./gemini/website-copy";

/**
 * Gemini-Provider — wird Schritt für Schritt mit Live-Implementationen
 * gefüllt. Methoden, die noch nicht scharf sind, fallen auf den Stub
 * zurück und werfen `AIProviderError("provider_unavailable")`.
 *
 * Status (Code-Session 26 — erste Live-Methode):
 *   ✓ generateWebsiteCopy        (Generate-Content mit responseJsonSchema)
 *   · improveServiceDescription   – folgt
 *   · generateFaqs                – folgt
 *   · generateCustomerReply       – folgt
 *   · generateReviewRequest       – folgt
 *   · generateSocialPost          – folgt
 *   · generateOfferCampaign       – folgt
 *
 * Hinweis: Wenn `GEMINI_API_KEY` fehlt, fällt der Resolver
 * (`getAIProvider`) automatisch auf den Mock-Provider zurück. Wer
 * `geminiProvider` direkt importiert und ohne Key aufruft, bekommt
 * `AIProviderError("no_api_key")`.
 */
const stub = buildStubProvider(
  "gemini",
  "Diese Gemini-Methode ist noch nicht scharf gemacht. Sie wird in einer der folgenden Code-Sessions ergänzt.",
);

export const geminiProvider: AIProvider = {
  ...stub,
  generateWebsiteCopy: geminiGenerateWebsiteCopy,
};
