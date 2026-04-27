/**
 * Gemeinsamer Gemini-Client + Error-Mapper für alle scharf
 * implementierten Gemini-Methoden.
 *
 * Design-Entscheidungen (Recherche zu Code-Session 26):
 *   - SDK liest `GEMINI_API_KEY` selbst, wir prüfen aber davor
 *     defensiv und werfen `AIProviderError("no_api_key")`.
 *   - `@google/genai` (≥ 1.x) als SDK — der modernere Pfad. Das
 *     ältere `@google/generative-ai` ist deprecated.
 *   - **Kein** ephemeres Caching wie bei Anthropic. Gemini hat
 *     stattdessen eine separate Context-Caching-API (`caches.create(...)`),
 *     die sich erst ab größeren Volumen lohnt. Erstes Setup ohne
 *     Caching, das kommt in einer späteren Session.
 *   - Modell-Wahl: `gemini-2.0-flash` als günstige Default-Variante
 *     mit Structured-Output-Support. `GEMINI_MODEL` darf das
 *     überschreiben.
 *   - Fehler-Mapping über die SDK-Klassen
 *     (`AuthenticationError`, `BadRequestError`, etc.).
 */

import {
  GoogleGenAI,
  ApiError,
} from "@google/genai";
import { AIProviderError, type AIErrorCode } from "@/types/ai";

const DEFAULT_MODEL = "gemini-2.0-flash";

interface GeminiClientOptions {
  /** Override der ENV — gedacht für Tests oder Server-Routes. */
  readonly env?: Readonly<Record<string, string | undefined>>;
}

export function getGeminiApiKey(opts: GeminiClientOptions = {}): string {
  const env = opts.env ?? process.env;
  const raw = env["GEMINI_API_KEY"];
  const trimmed = raw?.trim() ?? "";
  if (trimmed.length === 0) {
    throw new AIProviderError(
      "no_api_key",
      "GEMINI_API_KEY ist nicht gesetzt. Bitte einen gültigen API-Key in .env.local hinterlegen oder AI_PROVIDER=mock setzen.",
    );
  }
  return trimmed;
}

export function getGeminiModel(opts: GeminiClientOptions = {}): string {
  const env = opts.env ?? process.env;
  const raw = env["GEMINI_MODEL"]?.trim();
  return raw && raw.length > 0 ? raw : DEFAULT_MODEL;
}

export function buildGeminiClient(
  opts: GeminiClientOptions = {},
): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: getGeminiApiKey(opts),
  });
}

/**
 * Mapped einen geworfenen Fehler des SDK auf einen `AIProviderError`.
 * Wenn der Fehler bereits ein `AIProviderError` ist, wird er
 * unverändert weitergeworfen.
 *
 * Gemini-SDK exposiert eine `ApiError`-Klasse mit `.status` und
 * `.message` — wir mappen über den HTTP-Statuscode, nicht über
 * Subklassen-`instanceof`-Checks (die wären nicht stabil über
 * SDK-Versionen).
 */
export function mapGeminiError(err: unknown): AIProviderError {
  if (err instanceof AIProviderError) return err;

  if (err instanceof ApiError) {
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
    return new AIProviderError(code, `Gemini ${status}: ${err.message}`);
  }

  if (err instanceof Error) {
    return new AIProviderError("unknown", err.message);
  }
  return new AIProviderError("unknown", String(err));
}
