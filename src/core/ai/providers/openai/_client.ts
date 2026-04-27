/**
 * Gemeinsamer OpenAI-Client + Error-Mapper für alle scharf
 * implementierten OpenAI-Methoden.
 *
 * Design-Entscheidungen (Recherche zu Code-Session 21):
 *   - SDK liest `OPENAI_API_KEY` selbst, wir prüfen aber vorher
 *     defensiv und werfen `AIProviderError("no_api_key")` mit
 *     sprechender Nachricht — sonst würde der SDK-Konstruktor
 *     selbst Fehler auf Sprach-/Stack-Ebene werfen.
 *   - `maxRetries: 2` lässt das SDK 429-Fehler automatisch mit
 *     exponential Backoff wiederholen (Default ohnehin 2).
 *   - Modell-Wahl: `gpt-4o-mini` als günstige, strukturierte-Output-
 *     fähige Default-Variante. `OPENAI_MODEL` darf das überschreiben,
 *     z. B. wenn der Auftraggeber später `gpt-4o` oder `gpt-4.5`
 *     aktiviert.
 *   - Fehler-Mapping orientiert sich an den SDK-`APIError`-Subklassen:
 *       401 → no_api_key
 *       429 → rate_limited (auch wenn das SDK schon retried hat)
 *       5xx → provider_unavailable
 *       sonst → unknown
 */

import OpenAI from "openai";
import { AIProviderError, type AIErrorCode } from "@/types/ai";

const DEFAULT_MODEL = "gpt-4o-mini";

interface OpenAIClientOptions {
  /** Override der ENV — gedacht für Tests oder Server-Routes. */
  readonly env?: Readonly<Record<string, string | undefined>>;
}

export function getOpenAIApiKey(opts: OpenAIClientOptions = {}): string {
  const env = opts.env ?? process.env;
  const raw = env["OPENAI_API_KEY"];
  const trimmed = raw?.trim() ?? "";
  if (trimmed.length === 0) {
    throw new AIProviderError(
      "no_api_key",
      "OPENAI_API_KEY ist nicht gesetzt. Bitte einen gültigen API-Key in .env.local hinterlegen oder AI_PROVIDER=mock setzen.",
    );
  }
  return trimmed;
}

export function getOpenAIModel(
  opts: OpenAIClientOptions = {},
): string {
  const env = opts.env ?? process.env;
  const raw = env["OPENAI_MODEL"]?.trim();
  return raw && raw.length > 0 ? raw : DEFAULT_MODEL;
}

export function buildOpenAIClient(
  opts: OpenAIClientOptions = {},
): OpenAI {
  return new OpenAI({
    apiKey: getOpenAIApiKey(opts),
    maxRetries: 2,
  });
}

/**
 * Mapped einen geworfenen Fehler des SDK auf einen `AIProviderError`.
 * Wenn der Fehler bereits ein `AIProviderError` ist, wird er
 * unverändert weitergeworfen.
 */
export function mapOpenAIError(err: unknown): AIProviderError {
  if (err instanceof AIProviderError) return err;

  if (err instanceof OpenAI.APIError) {
    const status = err.status ?? 0;
    let code: AIErrorCode;
    if (status === 401 || status === 403) {
      code = "no_api_key";
    } else if (status === 429) {
      code = "rate_limited";
    } else if (status >= 500 && status < 600) {
      code = "provider_unavailable";
    } else if (status === 400) {
      code = "invalid_input";
    } else {
      code = "unknown";
    }
    return new AIProviderError(
      code,
      `OpenAI ${status}: ${err.message}`,
    );
  }

  if (err instanceof Error) {
    return new AIProviderError("unknown", err.message);
  }
  return new AIProviderError("unknown", String(err));
}
