/**
 * Stub-Provider-Builder für die Phase, in der ein Provider noch nicht
 * scharf ist. Jede Methode wirft `AIProviderError("provider_unavailable")`
 * mit einer sprechenden Nachricht – damit aufrufende UI-Komponenten den
 * Fehler später freundlich anzeigen können.
 *
 * Aktuell (Code-Session 13) sind alle vier Provider Stubs. Sie werden
 * Methode für Methode in den folgenden Code-Sessions scharf gemacht:
 * - Session 14+: Mock-Provider mit hochwertigen Beispieltexten.
 * - Session 21+: OpenAI scharf (mit Caching).
 * - Session 23+: Anthropic scharf.
 * - Später: Gemini.
 */

import { AIProviderError, type AIProvider } from "@/types/ai";
import type { AIProviderKey } from "@/types/common";

export function buildStubProvider(
  key: AIProviderKey,
  message: string,
): AIProvider {
  function fail(): never {
    throw new AIProviderError("provider_unavailable", message);
  }

  return {
    key,
    generateWebsiteCopy: async () => fail(),
    improveServiceDescription: async () => fail(),
    generateFaqs: async () => fail(),
    generateReviewRequest: async () => fail(),
    generateSocialPost: async () => fail(),
    generateCustomerReply: async () => fail(),
    generateOfferCampaign: async () => fail(),
  };
}
