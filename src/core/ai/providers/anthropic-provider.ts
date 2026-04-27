import type { AIProvider } from "@/types/ai";
import { buildStubProvider } from "./_stub";
import { anthropicGenerateWebsiteCopy } from "./anthropic/website-copy";
import { anthropicImproveServiceDescription } from "./anthropic/service-description";

/**
 * Anthropic-Provider — wird Schritt für Schritt mit Live-Implementationen
 * gefüllt. Methoden, die noch nicht scharf sind, fallen auf den Stub
 * zurück und werfen `AIProviderError("provider_unavailable")`.
 *
 * Status (Code-Session 25 — zweite Live-Methode):
 *   ✓ generateWebsiteCopy        (Messages-API mit Tool Use)
 *   ✓ improveServiceDescription  (Messages-API mit Tool Use)
 *   · generateFaqs                – folgt
 *   · generateCustomerReply       – folgt
 *   · generateReviewRequest       – folgt
 *   · generateSocialPost          – folgt
 *   · generateOfferCampaign       – folgt
 *
 * Hinweis: Wenn `ANTHROPIC_API_KEY` fehlt, fällt der Resolver
 * (`getAIProvider`) automatisch auf den Mock-Provider zurück. Wer
 * `anthropicProvider` direkt importiert und ohne Key aufruft, bekommt
 * `AIProviderError("no_api_key")`.
 */
const stub = buildStubProvider(
  "anthropic",
  "Diese Anthropic-Methode ist noch nicht scharf gemacht. Sie wird in einer der folgenden Code-Sessions ergänzt.",
);

export const anthropicProvider: AIProvider = {
  ...stub,
  generateWebsiteCopy: anthropicGenerateWebsiteCopy,
  improveServiceDescription: anthropicImproveServiceDescription,
};
