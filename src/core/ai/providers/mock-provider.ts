import type { AIProvider } from "@/types/ai";
import { buildStubProvider } from "./_stub";
import { mockGenerateWebsiteCopy } from "./mock/website-copy";
import { mockImproveServiceDescription } from "./mock/service-description";
import { mockGenerateFaqs } from "./mock/faqs";
import { mockGenerateCustomerReply } from "./mock/customer-reply";
import { mockGenerateReviewRequest } from "./mock/review-request";
import { mockGenerateSocialPost } from "./mock/social-post";
import { mockGenerateOfferCampaign } from "./mock/offer-campaign";

/**
 * Mock-Provider — alle 7 Methoden des `AIProvider`-Interfaces sind
 * deterministisch belegt. `buildStubProvider` läuft nur noch als
 * defensiver Default mit, falls das Interface irgendwann erweitert
 * werden sollte.
 *
 * Status (Code-Session 20 — Mock-Phase abgeschlossen):
 *   ✓ generateWebsiteCopy
 *   ✓ improveServiceDescription
 *   ✓ generateFaqs
 *   ✓ generateCustomerReply
 *   ✓ generateReviewRequest
 *   ✓ generateSocialPost
 *   ✓ generateOfferCampaign
 */
const stub = buildStubProvider(
  "mock",
  "Diese Mock-Methode ist noch nicht implementiert. Sollte ein neues AIProvider-Interface-Feld auftauchen, wirft sie defensiv provider_unavailable.",
);

export const mockProvider: AIProvider = {
  ...stub,
  generateWebsiteCopy: mockGenerateWebsiteCopy,
  improveServiceDescription: mockImproveServiceDescription,
  generateFaqs: mockGenerateFaqs,
  generateCustomerReply: mockGenerateCustomerReply,
  generateReviewRequest: mockGenerateReviewRequest,
  generateSocialPost: mockGenerateSocialPost,
  generateOfferCampaign: mockGenerateOfferCampaign,
};
