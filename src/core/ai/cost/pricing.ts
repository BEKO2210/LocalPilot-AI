/**
 * Pricing-Tabelle + Cost-Estimator für die KI-Schicht (Code-Session 29).
 *
 * Token-Heuristik: ~4 Zeichen pro Token (Standard-Annahme für English/
 * Deutsch). Bewusst kein `tiktoken` o. ä. — der Aufwand wäre höher als
 * der Genauigkeitsgewinn für reine Cost-Indikation, und es würde eine
 * weitere Dependency einziehen.
 *
 * Preise (Stand 2026-04):
 *   - openai/gpt-4o-mini       $0.15 / $0.60 per Mio Tokens (Input/Output)
 *   - openai/gpt-4o            $2.50 / $10.00
 *   - anthropic/claude-sonnet-4-5  $3.00 / $15.00
 *   - gemini-2.0-flash         $0.10 / $0.40
 *   - mock                     $0    / $0
 *
 * Quellen siehe `docs/RESEARCH_INDEX.md` Track A (AI-Provider —
 * Token-Pricing).
 *
 * **Wichtig**: Heuristik unterschätzt eher. Echte Tokenizer liefern
 * 5–15 % höhere Counts. Für Budget-Caps bewusst konservativ rechnen
 * (Cap × 0.85 als Safety-Margin in `budget.ts`).
 */

import type { AIProviderKey } from "@/types/common";

export interface ModelPrice {
  /** USD per million input tokens. */
  readonly inputPerMillion: number;
  /** USD per million output tokens. */
  readonly outputPerMillion: number;
}

const ZERO: ModelPrice = { inputPerMillion: 0, outputPerMillion: 0 };

/**
 * Pricing-Tabelle pro Provider × Model. `default` greift, wenn das
 * Modell nicht in der Tabelle steht — verhindert NaN-Crashes bei
 * neuen Modellen, die wir noch nicht kennen.
 */
const PRICING: Record<AIProviderKey, Record<string, ModelPrice>> = {
  mock: {
    default: ZERO,
  },
  openai: {
    "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
    "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
    "gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
    default: { inputPerMillion: 1.0, outputPerMillion: 5.0 },
  },
  anthropic: {
    "claude-sonnet-4-5": { inputPerMillion: 3.0, outputPerMillion: 15.0 },
    "claude-3-5-sonnet-20241022": {
      inputPerMillion: 3.0,
      outputPerMillion: 15.0,
    },
    "claude-haiku-4-5-20251001": {
      inputPerMillion: 1.0,
      outputPerMillion: 5.0,
    },
    default: { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  },
  gemini: {
    "gemini-2.0-flash": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
    "gemini-2.5-flash": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
    "gemini-2.5-pro": { inputPerMillion: 1.25, outputPerMillion: 10.0 },
    default: { inputPerMillion: 0.5, outputPerMillion: 2.0 },
  },
};

/** Token-Heuristik: ~4 Zeichen pro Token. Konservativ. */
export function estimateTokens(text: string): number {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / 4);
}

export function getModelPrice(
  provider: AIProviderKey,
  model: string,
): ModelPrice {
  const providerTable = PRICING[provider];
  return providerTable[model] ?? providerTable["default"] ?? ZERO;
}

export interface CostEstimate {
  readonly provider: AIProviderKey;
  readonly model: string;
  readonly inputTokensEst: number;
  readonly outputTokensEst: number;
  readonly costUsd: number;
}

/**
 * Schätzt die Kosten für einen Aufruf. `inputText` ist eine
 * String-Repräsentation des Prompt-Inputs (typisch JSON-Stringify
 * des `input`-Objekts), `outputText` analog vom Output.
 */
export function estimateCost(
  provider: AIProviderKey,
  model: string,
  inputText: string,
  outputText: string,
): CostEstimate {
  const price = getModelPrice(provider, model);
  const inputTokensEst = estimateTokens(inputText);
  const outputTokensEst = estimateTokens(outputText);
  const costUsd =
    (inputTokensEst / 1_000_000) * price.inputPerMillion +
    (outputTokensEst / 1_000_000) * price.outputPerMillion;
  return {
    provider,
    model,
    inputTokensEst,
    outputTokensEst,
    costUsd: Math.round(costUsd * 1_000_000) / 1_000_000, // 6 Dezimalstellen
  };
}

/** Formatiert einen Cost-Estimate für die Anzeige im Dashboard. */
export function formatCostUsd(usd: number): string {
  if (usd === 0) return "$0.00";
  if (usd < 0.0001) return `<$0.0001`;
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}
