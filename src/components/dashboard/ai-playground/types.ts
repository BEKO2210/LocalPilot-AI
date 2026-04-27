/**
 * Shared types für den KI-Assistent-Playground (Code-Session 27).
 *
 * Designprinzip: ein konfig-gesteuerter Player, der alle 7 Mock-
 * Methoden generisch ausspielen kann, statt 7 hand-geschriebene
 * Formular-Komponenten zu pflegen. Ergebnisse sind über eine
 * Discriminated Union typsicher.
 */

import type {
  CustomerReplyOutput,
  FaqGenerationOutput,
  OfferCampaignOutput,
  ReviewRequestOutput,
  ServiceDescriptionOutput,
  SocialPostOutput,
  WebsiteCopyOutput,
} from "@/types/ai";

/** Welche Capability wird aktuell angespielt? */
export type PlaygroundMethodId =
  | "website-copy"
  | "service-description"
  | "faqs"
  | "customer-reply"
  | "review-request"
  | "social-post"
  | "offer-campaign";

/**
 * Optionale Cost-Info, die nur bei API-Route-Aufrufen verfügbar ist.
 * Mock-Direktaufrufe im Browser haben kein Cost (= immer 0 USD).
 */
export interface PlaygroundCostInfo {
  readonly provider: string;
  readonly model: string;
  readonly inputTokensEst: number;
  readonly outputTokensEst: number;
  readonly costUsd: number;
  readonly costFormatted: string;
  readonly budget: {
    readonly spentUsd: number;
    readonly capUsd: number;
    readonly remainingUsd: number;
  };
}

/**
 * Discriminated Union der 7 Output-Typen — erlaubt typsicheres
 * Rendering im `<ResultPanel>` über `switch (result.method)`.
 *
 * `cost` ist optional: bei direktem Mock-Aufruf im Browser nicht
 * vorhanden, bei API-Route-Aufruf gefüllt.
 */
export type GenerationResult =
  | { method: "website-copy"; output: WebsiteCopyOutput; cost?: PlaygroundCostInfo }
  | { method: "service-description"; output: ServiceDescriptionOutput; cost?: PlaygroundCostInfo }
  | { method: "faqs"; output: FaqGenerationOutput; cost?: PlaygroundCostInfo }
  | { method: "customer-reply"; output: CustomerReplyOutput; cost?: PlaygroundCostInfo }
  | { method: "review-request"; output: ReviewRequestOutput; cost?: PlaygroundCostInfo }
  | { method: "social-post"; output: SocialPostOutput; cost?: PlaygroundCostInfo }
  | { method: "offer-campaign"; output: OfferCampaignOutput; cost?: PlaygroundCostInfo };

/**
 * Beschreibt ein einzelnes Form-Feld in einer Methoden-Config.
 * Bewusst schmal — keine bedingte Sichtbarkeit, keine geschachtelten
 * Felder. Reicht für die 7 Capabilities.
 */
export type PlaygroundField =
  | {
      readonly kind: "text";
      readonly name: string;
      readonly label: string;
      readonly placeholder?: string;
      readonly hint?: string;
      readonly required?: boolean;
    }
  | {
      readonly kind: "textarea";
      readonly name: string;
      readonly label: string;
      readonly placeholder?: string;
      readonly hint?: string;
      readonly rows?: number;
      readonly required?: boolean;
    }
  | {
      readonly kind: "select";
      readonly name: string;
      readonly label: string;
      readonly hint?: string;
      readonly options: readonly { readonly value: string; readonly label: string }[];
      readonly required?: boolean;
    }
  | {
      readonly kind: "number";
      readonly name: string;
      readonly label: string;
      readonly hint?: string;
      readonly min: number;
      readonly max: number;
      readonly step?: number;
      readonly required?: boolean;
    }
  | {
      readonly kind: "switch";
      readonly name: string;
      readonly label: string;
      readonly hint?: string;
    };

/**
 * Form-Werte sind ein offenes Record. Die Felder pro Methode legt
 * `methodConfigs` fest; das tatsächliche Mapping in den Mock-Provider-
 * Aufruf passiert dort über `buildInput`.
 */
export type PlaygroundFormValues = Readonly<
  Record<string, string | number | boolean | undefined>
>;
