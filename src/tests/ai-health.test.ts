/**
 * Smoketest für Health-Snapshot (Code-Session 30).
 *
 * Pure-Function-Test ohne HTTP-Roundtrip. Wir mocken nur die ENV
 * und prüfen, dass `getHealthSnapshot` korrekt rapportiert, ob
 * Provider-Keys gesetzt sind, ohne den Key-Wert preiszugeben.
 */

import { getHealthSnapshot } from "@/core/ai/health";
import { __resetBudgetState__, chargeBudget } from "@/core/ai/cost/budget";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`ai-health assertion failed: ${message}`);
}

// -----------------------------------------------------------------------
// 1. Komplett leere ENV → Mock available, andere nicht
// -----------------------------------------------------------------------
__resetBudgetState__();
const empty = getHealthSnapshot({});
assert(
  empty.providers.mock.available && empty.providers.mock.keyPresent,
  "mock ist immer available, ohne Key-Bedingung",
);
assert(
  !empty.providers.openai.available,
  "openai nicht available ohne OPENAI_API_KEY",
);
assert(
  !empty.providers.openai.keyPresent,
  "openai keyPresent=false ohne ENV",
);
assert(
  empty.providers.openai.reason !== undefined,
  "openai liefert reason wenn nicht available",
);
assert(
  !empty.providers.anthropic.available && !empty.providers.gemini.available,
  "anthropic + gemini ohne Key beide unavailable",
);

// -----------------------------------------------------------------------
// 2. apiAuth.enabled spiegelt LP_AI_API_KEY
// -----------------------------------------------------------------------
assert(
  !empty.apiAuth.enabled,
  "ohne LP_AI_API_KEY ist apiAuth deaktiviert",
);
const withApiKey = getHealthSnapshot({ LP_AI_API_KEY: "sk-secret" });
assert(
  withApiKey.apiAuth.enabled,
  "mit LP_AI_API_KEY ist apiAuth aktiviert",
);

// -----------------------------------------------------------------------
// 3. Privacy: Key-Wert taucht nirgends im Snapshot auf
// -----------------------------------------------------------------------
const sensitive = getHealthSnapshot({
  LP_AI_API_KEY: "sk-very-secret-token-xyz",
  OPENAI_API_KEY: "sk-openai-secret-abcdef",
});
const dump = JSON.stringify(sensitive);
assert(
  !dump.includes("sk-very-secret-token-xyz"),
  "LP_AI_API_KEY-Wert nicht im Snapshot",
);
assert(
  !dump.includes("sk-openai-secret-abcdef"),
  "OPENAI_API_KEY-Wert nicht im Snapshot",
);
assert(
  sensitive.providers.openai.keyPresent,
  "openai keyPresent=true bei Key-ENV",
);
assert(
  sensitive.providers.openai.available,
  "openai available bei Key-ENV",
);

// -----------------------------------------------------------------------
// 4. Modell-Override aus ENV
// -----------------------------------------------------------------------
const customModel = getHealthSnapshot({
  OPENAI_API_KEY: "sk-x",
  OPENAI_MODEL: "gpt-4o",
});
assert(
  customModel.providers.openai.model === "gpt-4o",
  "OPENAI_MODEL-ENV überschreibt Default",
);
const defaultModel = getHealthSnapshot({ OPENAI_API_KEY: "sk-x" });
assert(
  defaultModel.providers.openai.model === "gpt-4o-mini",
  "ohne OPENAI_MODEL → Default gpt-4o-mini",
);

// -----------------------------------------------------------------------
// 5. Budget-Block reflektiert chargeBudget-State
// -----------------------------------------------------------------------
__resetBudgetState__();
const before = getHealthSnapshot({});
assert(
  before.budget.spentUsd === 0,
  "vor charge: spentUsd = 0",
);
chargeBudget(0.25);
const after = getHealthSnapshot({});
assert(
  Math.abs(after.budget.spentUsd - 0.25) < 1e-9,
  "nach charge(0.25) → spentUsd = 0.25",
);
assert(
  after.budget.percentUsed === 25,
  "percentUsed = 25 bei 0.25/1.00 Cap",
);

// -----------------------------------------------------------------------
// 6. Budget-Cap-Override aus ENV greift
// -----------------------------------------------------------------------
__resetBudgetState__();
chargeBudget(2.5);
const bigCap = getHealthSnapshot({ LP_AI_DAILY_CAP_USD: "10" });
assert(
  bigCap.budget.capUsd === 10,
  "LP_AI_DAILY_CAP_USD=10 → capUsd 10",
);
assert(
  bigCap.budget.percentUsed === 25,
  "percentUsed = 25 bei 2.50/10.00",
);

// -----------------------------------------------------------------------
// 7. resetAtUtc liegt in der Zukunft (nächste UTC-Mitternacht)
// -----------------------------------------------------------------------
__resetBudgetState__();
const snap = getHealthSnapshot({});
const reset = new Date(snap.budget.resetAtUtc);
assert(
  reset.getTime() > Date.now(),
  "resetAtUtc liegt in der Zukunft",
);
assert(
  reset.getUTCHours() === 0 && reset.getUTCMinutes() === 0,
  "resetAtUtc ist UTC-Mitternacht",
);

console.log("ai-health smoketest ✅ (18 Asserts)");
export const __AI_HEALTH_SMOKETEST__ = { totalAssertions: 18 };
