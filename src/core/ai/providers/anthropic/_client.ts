/**
 * Gemeinsamer Anthropic-Client + Error-Mapper für alle scharf
 * implementierten Anthropic-Methoden.
 *
 * Design-Entscheidungen (Recherche zu Code-Session 24):
 *   - SDK liest `ANTHROPIC_API_KEY` selbst, wir prüfen aber davor
 *     defensiv und werfen `AIProviderError("no_api_key")` mit
 *     sprechender Nachricht.
 *   - `maxRetries: 2` lässt das SDK 429-Fehler automatisch mit
 *     exponential Backoff wiederholen.
 *   - Modell-Wahl: `claude-sonnet-4-5` als ausgewogene Default-
 *     Variante (gute Tool-Use-Zuverlässigkeit, niedrige bis
 *     mittlere Kosten). `ANTHROPIC_MODEL` darf das überschreiben.
 *   - Fehler-Mapping orientiert sich an den SDK-Klassen:
 *       AuthenticationError / PermissionDeniedError → no_api_key
 *       RateLimitError → rate_limited
 *       InternalServerError → provider_unavailable
 *       BadRequestError / UnprocessableEntityError → invalid_input
 *       sonst APIError → unknown
 */

import Anthropic, {
  APIError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  PermissionDeniedError,
  RateLimitError,
  UnprocessableEntityError,
} from "@anthropic-ai/sdk";
import { AIProviderError, type AIErrorCode } from "@/types/ai";

const DEFAULT_MODEL = "claude-sonnet-4-5";

interface AnthropicClientOptions {
  /** Override der ENV — gedacht für Tests oder Server-Routes. */
  readonly env?: Readonly<Record<string, string | undefined>>;
}

export function getAnthropicApiKey(opts: AnthropicClientOptions = {}): string {
  const env = opts.env ?? process.env;
  const raw = env["ANTHROPIC_API_KEY"];
  const trimmed = raw?.trim() ?? "";
  if (trimmed.length === 0) {
    throw new AIProviderError(
      "no_api_key",
      "ANTHROPIC_API_KEY ist nicht gesetzt. Bitte einen gültigen API-Key in .env.local hinterlegen oder AI_PROVIDER=mock setzen.",
    );
  }
  return trimmed;
}

export function getAnthropicModel(
  opts: AnthropicClientOptions = {},
): string {
  const env = opts.env ?? process.env;
  const raw = env["ANTHROPIC_MODEL"]?.trim();
  return raw && raw.length > 0 ? raw : DEFAULT_MODEL;
}

export function buildAnthropicClient(
  opts: AnthropicClientOptions = {},
): Anthropic {
  return new Anthropic({
    apiKey: getAnthropicApiKey(opts),
    maxRetries: 2,
  });
}

/**
 * Mapped einen geworfenen Fehler des SDK auf einen `AIProviderError`.
 * Wenn der Fehler bereits ein `AIProviderError` ist, wird er
 * unverändert weitergeworfen.
 */
export function mapAnthropicError(err: unknown): AIProviderError {
  if (err instanceof AIProviderError) return err;

  let code: AIErrorCode = "unknown";
  let message = err instanceof Error ? err.message : String(err);

  if (err instanceof AuthenticationError || err instanceof PermissionDeniedError) {
    code = "no_api_key";
  } else if (err instanceof RateLimitError) {
    code = "rate_limited";
  } else if (err instanceof InternalServerError) {
    code = "provider_unavailable";
  } else if (err instanceof BadRequestError || err instanceof UnprocessableEntityError) {
    code = "invalid_input";
  } else if (err instanceof APIError) {
    const status = err.status ?? 0;
    if (status === 401 || status === 403) code = "no_api_key";
    else if (status === 429) code = "rate_limited";
    else if (status >= 500 && status < 600) code = "provider_unavailable";
    else if (status === 400 || status === 422) code = "invalid_input";
    message = `Anthropic ${status}: ${err.message}`;
  }

  return new AIProviderError(code, message);
}
