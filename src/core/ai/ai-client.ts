/**
 * AI-Client – Provider-Resolver mit ENV-Gate und Mock-Fallback.
 *
 * Aufrufer holen sich einen Provider über `getAIProvider()`. Welche
 * konkrete Implementierung zurückkommt, hängt von der Umgebung ab:
 *
 *   AI_PROVIDER       Verhalten
 *   ────────────      ─────────────────────────────────────────────
 *   nicht gesetzt     → Mock-Provider
 *   "mock"            → Mock-Provider
 *   "openai"          → OpenAI-Provider, falls OPENAI_API_KEY gesetzt
 *                        → sonst Mock-Provider (sicherer Fallback)
 *   "anthropic"       → Anthropic-Provider, falls ANTHROPIC_API_KEY
 *                        → sonst Mock-Provider
 *   "gemini"          → Gemini-Provider, falls GEMINI_API_KEY
 *                        → sonst Mock-Provider
 *   sonstiger Wert    → Mock-Provider (defensiver Fallback)
 *
 * Tests / API-Routes können `env` und `providerKey` explizit injizieren,
 * damit kein Zugriff auf `process.env` nötig ist.
 *
 * Bewusst minimal: keine Implementierungs-Logik, kein Caching, kein
 * Cost-Tracking. Das alles kommt schrittweise in Code-Sessions 14+.
 */

import type { AIProvider } from "@/types/ai";
import { AI_PROVIDER_KEYS, type AIProviderKey } from "@/types/common";
import { mockProvider } from "./providers/mock-provider";
import { openaiProvider } from "./providers/openai-provider";
import { anthropicProvider } from "./providers/anthropic-provider";
import { geminiProvider } from "./providers/gemini-provider";

/** Statische Lookup-Map. Reihenfolge entspricht `AI_PROVIDER_KEYS`. */
const PROVIDERS: Readonly<Record<AIProviderKey, AIProvider>> = {
  mock: mockProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
};

/**
 * Welche ENV-Variable hält den API-Key für den jeweiligen Provider?
 * `null` = kein Key nötig (Mock).
 */
const KEY_ENV_VAR: Readonly<Record<AIProviderKey, string | null>> = {
  mock: null,
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
};

const VALID_KEYS = new Set<AIProviderKey>(AI_PROVIDER_KEYS);

function isProviderKey(value: unknown): value is AIProviderKey {
  return typeof value === "string" && VALID_KEYS.has(value as AIProviderKey);
}

export type ResolveProviderOptions = {
  /** Override für Tests / API-Routes. Default: `process.env.AI_PROVIDER`. */
  providerKey?: string;
  /** Override für Tests. Default: `process.env`. */
  env?: Readonly<Record<string, string | undefined>>;
};

function readEnv(
  override?: Readonly<Record<string, string | undefined>>,
): Readonly<Record<string, string | undefined>> {
  if (override) return override;
  if (typeof process !== "undefined" && process.env) return process.env;
  return {};
}

/**
 * Liefert den passenden AI-Provider gemäß ENV-Konfiguration. Fällt
 * defensiv auf den Mock-Provider zurück, sobald irgendeine Bedingung
 * nicht erfüllt ist (kein Key, ungültiger Wert, …). Wirft NIE.
 */
export function getAIProvider(opts?: ResolveProviderOptions): AIProvider {
  const env = readEnv(opts?.env);
  const requested = opts?.providerKey ?? env.AI_PROVIDER;
  const targetKey: AIProviderKey = isProviderKey(requested) ? requested : "mock";

  const requiredEnv = KEY_ENV_VAR[targetKey];
  if (requiredEnv) {
    const value = env[requiredEnv];
    if (!value || value.trim().length === 0) {
      return PROVIDERS.mock;
    }
  }

  return PROVIDERS[targetKey];
}

/**
 * Welcher Provider würde zurückgegeben? Praktisch für Diagnose-Anzeige
 * im späteren Dashboard ohne tatsächlich einen Provider-Aufruf zu wagen.
 */
export function describeActiveProvider(opts?: ResolveProviderOptions): {
  requested: AIProviderKey | "unset" | "invalid";
  active: AIProviderKey;
  reason: "explicit" | "fallback_no_key" | "fallback_unset" | "fallback_invalid";
} {
  const env = readEnv(opts?.env);
  const raw = opts?.providerKey ?? env.AI_PROVIDER;

  if (raw === undefined) {
    return { requested: "unset", active: "mock", reason: "fallback_unset" };
  }
  if (!isProviderKey(raw)) {
    return { requested: "invalid", active: "mock", reason: "fallback_invalid" };
  }

  const requiredEnv = KEY_ENV_VAR[raw];
  if (requiredEnv && (!env[requiredEnv] || env[requiredEnv]!.trim().length === 0)) {
    return { requested: raw, active: "mock", reason: "fallback_no_key" };
  }

  return { requested: raw, active: raw, reason: "explicit" };
}

/** Read-only Map aller registrierten Provider (für Tests / Debug). */
export const AI_PROVIDERS: Readonly<Record<AIProviderKey, AIProvider>> = PROVIDERS;
