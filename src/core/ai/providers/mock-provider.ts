import type { AIProvider } from "@/types/ai";
import { buildStubProvider } from "./_stub";
import { mockGenerateWebsiteCopy } from "./mock/website-copy";
import { mockImproveServiceDescription } from "./mock/service-description";
import { mockGenerateFaqs } from "./mock/faqs";

/**
 * Mock-Provider — wird Schritt für Schritt mit hochwertigen
 * Beispieltexten befüllt. Methoden, die noch nicht implementiert
 * sind, fallen auf den Stub zurück und werfen
 * AIProviderError("provider_unavailable").
 *
 * Status (Code-Session 16):
 *   ✓ generateWebsiteCopy
 *   ✓ improveServiceDescription
 *   ✓ generateFaqs
 *   · generateReviewRequest       – folgt
 *   · generateSocialPost          – folgt
 *   · generateCustomerReply       – folgt
 *   · generateOfferCampaign       – folgt
 */
const stub = buildStubProvider(
  "mock",
  "Diese Mock-Methode ist noch nicht implementiert. Sie wird in einer der folgenden Code-Sessions ergänzt.",
);

export const mockProvider: AIProvider = {
  ...stub,
  generateWebsiteCopy: mockGenerateWebsiteCopy,
  improveServiceDescription: mockImproveServiceDescription,
  generateFaqs: mockGenerateFaqs,
};
