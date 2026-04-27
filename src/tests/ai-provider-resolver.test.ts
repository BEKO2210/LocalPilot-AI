/**
 * Smoketest für den AI-Provider-Resolver (Code-Session 13).
 *
 * Validiert nur die Resolver-Logik – die Provider selbst sind
 * Stubs, die `AIProviderError("provider_unavailable")` werfen.
 * Konkrete Method-Tests folgen ab Code-Session 14, sobald der Mock
 * mit echten Beispieltexten gefüllt ist.
 */

import { AIProviderError } from "@/types/ai";
import {
  AI_PROVIDERS,
  describeActiveProvider,
  getAIProvider,
} from "@/core/ai";
import type { AIProvider } from "@/types/ai";
import type { AIProviderKey } from "@/types/common";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`AI-resolver assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Default ohne ENV → mock
// ---------------------------------------------------------------------------

assert(getAIProvider({ env: {} }).key === "mock", "leere ENV → mock");

// ---------------------------------------------------------------------------
// 2. Explizites AI_PROVIDER=mock → mock
// ---------------------------------------------------------------------------

assert(
  getAIProvider({ env: { AI_PROVIDER: "mock" } }).key === "mock",
  "AI_PROVIDER=mock → mock",
);

// ---------------------------------------------------------------------------
// 3. Ungültiger Wert → defensiver Fallback auf mock
// ---------------------------------------------------------------------------

assert(
  getAIProvider({ env: { AI_PROVIDER: "weird" } }).key === "mock",
  "ungültiger Wert → mock-Fallback",
);

// ---------------------------------------------------------------------------
// 4. AI_PROVIDER=openai ohne API-Key → mock
// ---------------------------------------------------------------------------

assert(
  getAIProvider({ env: { AI_PROVIDER: "openai" } }).key === "mock",
  "openai ohne Key → mock-Fallback",
);

// Leerer String zählt als „kein Key"
assert(
  getAIProvider({ env: { AI_PROVIDER: "openai", OPENAI_API_KEY: "   " } }).key ===
    "mock",
  "openai mit leerem Key → mock-Fallback",
);

// ---------------------------------------------------------------------------
// 5. AI_PROVIDER=openai mit Key → openai-Provider (aktuell Stub)
// ---------------------------------------------------------------------------

const withOpenaiKey = getAIProvider({
  env: { AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-fake" },
});
assert(withOpenaiKey.key === "openai", "openai mit Key → openai");

// ---------------------------------------------------------------------------
// 6. anthropic + gemini analog
// ---------------------------------------------------------------------------

assert(
  getAIProvider({ env: { AI_PROVIDER: "anthropic" } }).key === "mock",
  "anthropic ohne Key → mock",
);
assert(
  getAIProvider({
    env: { AI_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-ant-fake" },
  }).key === "anthropic",
  "anthropic mit Key → anthropic",
);
assert(
  getAIProvider({ env: { AI_PROVIDER: "gemini" } }).key === "mock",
  "gemini ohne Key → mock",
);
assert(
  getAIProvider({
    env: { AI_PROVIDER: "gemini", GEMINI_API_KEY: "ya29-fake" },
  }).key === "gemini",
  "gemini mit Key → gemini",
);

// ---------------------------------------------------------------------------
// 7. Override per Funktions-Argument schlägt ENV
// ---------------------------------------------------------------------------

assert(
  getAIProvider({
    providerKey: "anthropic",
    env: { AI_PROVIDER: "openai", ANTHROPIC_API_KEY: "fake" },
  }).key === "anthropic",
  "providerKey-Argument hat Vorrang vor ENV",
);

// ---------------------------------------------------------------------------
// 8. AIProviderError ist sauber konstruierbar
// ---------------------------------------------------------------------------

const err = new AIProviderError("provider_unavailable", "test");
assert(err.code === "provider_unavailable", "AIProviderError.code");
assert(err.name === "AIProviderError", "AIProviderError.name");
assert(err instanceof Error, "AIProviderError ist ein Error");
assert(err.message === "test", "AIProviderError.message");

// ---------------------------------------------------------------------------
// 9. AI_PROVIDERS-Lookup-Map: alle 4 Keys vorhanden, alle implementieren
//    `AIProvider`. Letzteres ist statisch durch den Type-Annotation erzwungen,
//    der untenstehende Cast macht das explizit lesbar.
// ---------------------------------------------------------------------------

const _typeCheck: Readonly<Record<AIProviderKey, AIProvider>> = AI_PROVIDERS;
void _typeCheck;
assert("mock" in AI_PROVIDERS, "AI_PROVIDERS hat mock-Eintrag");
assert("openai" in AI_PROVIDERS, "AI_PROVIDERS hat openai-Eintrag");
assert("anthropic" in AI_PROVIDERS, "AI_PROVIDERS hat anthropic-Eintrag");
assert("gemini" in AI_PROVIDERS, "AI_PROVIDERS hat gemini-Eintrag");

// ---------------------------------------------------------------------------
// 10. describeActiveProvider liefert sprechende Diagnose
// ---------------------------------------------------------------------------

const d1 = describeActiveProvider({ env: {} });
assert(
  d1.requested === "unset" && d1.active === "mock" && d1.reason === "fallback_unset",
  "describe: leere ENV → fallback_unset",
);

const d2 = describeActiveProvider({ env: { AI_PROVIDER: "weird" } });
assert(
  d2.requested === "invalid" && d2.reason === "fallback_invalid",
  "describe: ungültig → fallback_invalid",
);

const d3 = describeActiveProvider({ env: { AI_PROVIDER: "openai" } });
assert(
  d3.requested === "openai" &&
    d3.active === "mock" &&
    d3.reason === "fallback_no_key",
  "describe: openai ohne Key → fallback_no_key",
);

const d4 = describeActiveProvider({
  env: { AI_PROVIDER: "openai", OPENAI_API_KEY: "sk-fake" },
});
assert(
  d4.requested === "openai" && d4.active === "openai" && d4.reason === "explicit",
  "describe: openai mit Key → explicit",
);

const d5 = describeActiveProvider({ env: { AI_PROVIDER: "mock" } });
assert(
  d5.requested === "mock" && d5.active === "mock" && d5.reason === "explicit",
  "describe: mock explizit → explicit",
);

export const __AI_RESOLVER_SMOKETEST__ = {
  testCount: 22,
};
