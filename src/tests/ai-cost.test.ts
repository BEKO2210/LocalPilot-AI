/**
 * Smoketest für Cost-Pipeline (Code-Session 29).
 *
 * Verifiziert die Pricing-Heuristik (4 Zeichen ≈ 1 Token) und den
 * In-Memory-Daily-Budget-Tracker. Kein Netzwerk, kein API-Call —
 * pure Logik.
 */

import {
  estimateCost,
  estimateTokens,
  formatCostUsd,
  getModelPrice,
} from "@/core/ai/cost/pricing";
import {
  __resetBudgetState__,
  chargeBudget,
  getDailyCapUsd,
  previewBudget,
} from "@/core/ai/cost/budget";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`ai-cost assertion failed: ${message}`);
}

// -----------------------------------------------------------------------
// 1. estimateTokens
// -----------------------------------------------------------------------
assert(estimateTokens("") === 0, "leerer String → 0 Tokens");
assert(estimateTokens("abcd") === 1, "4 Zeichen → 1 Token");
assert(estimateTokens("abcde") === 2, "5 Zeichen → 2 Tokens (Math.ceil)");
assert(estimateTokens("a".repeat(400)) === 100, "400 Zeichen → 100 Tokens");

// -----------------------------------------------------------------------
// 2. getModelPrice — Default-Fallback
// -----------------------------------------------------------------------
const mockPrice = getModelPrice("mock", "default");
assert(mockPrice.inputPerMillion === 0, "mock kostet 0 USD input");
assert(mockPrice.outputPerMillion === 0, "mock kostet 0 USD output");

const oaiMini = getModelPrice("openai", "gpt-4o-mini");
assert(oaiMini.inputPerMillion === 0.15, "gpt-4o-mini input 0.15");
assert(oaiMini.outputPerMillion === 0.6, "gpt-4o-mini output 0.60");

const unknownOai = getModelPrice("openai", "gpt-99-future");
assert(
  unknownOai.inputPerMillion > 0,
  "unbekanntes openai-Modell fällt auf default mit > 0",
);

const sonnet = getModelPrice("anthropic", "claude-sonnet-4-5");
assert(sonnet.inputPerMillion === 3.0, "sonnet-4-5 input 3.00");

const flash = getModelPrice("gemini", "gemini-2.0-flash");
assert(flash.inputPerMillion === 0.1, "gemini-2.0-flash input 0.10");

// -----------------------------------------------------------------------
// 3. estimateCost
// -----------------------------------------------------------------------
const mockEst = estimateCost(
  "mock",
  "default",
  "x".repeat(400),
  "y".repeat(800),
);
assert(mockEst.inputTokensEst === 100, "mock 100 in-Tokens");
assert(mockEst.outputTokensEst === 200, "mock 200 out-Tokens");
assert(mockEst.costUsd === 0, "mock cost 0 USD");

// gpt-4o-mini: 100 in × 0.15/M + 200 out × 0.6/M = 0.000015 + 0.00012 = 0.000135
const oaiEst = estimateCost(
  "openai",
  "gpt-4o-mini",
  "x".repeat(400),
  "y".repeat(800),
);
assert(
  Math.abs(oaiEst.costUsd - 0.000135) < 0.0000005,
  `gpt-4o-mini Cost ~ 0.000135 USD (got ${oaiEst.costUsd})`,
);

// claude-sonnet-4-5: 100 in × 3/M + 200 out × 15/M = 0.0003 + 0.003 = 0.0033
const anthEst = estimateCost(
  "anthropic",
  "claude-sonnet-4-5",
  "x".repeat(400),
  "y".repeat(800),
);
assert(
  Math.abs(anthEst.costUsd - 0.0033) < 0.0000005,
  `claude-sonnet Cost ~ 0.0033 USD (got ${anthEst.costUsd})`,
);

// -----------------------------------------------------------------------
// 4. formatCostUsd
// -----------------------------------------------------------------------
assert(formatCostUsd(0) === "$0.00", "0 → $0.00");
assert(formatCostUsd(0.00001) === "<$0.0001", "Mikro-Cost → <$0.0001");
assert(formatCostUsd(0.005) === "$0.0050", "0.005 → $0.0050");
assert(formatCostUsd(1.5) === "$1.50", "1.50 → $1.50");

// -----------------------------------------------------------------------
// 5. Budget-Tracker
// -----------------------------------------------------------------------
__resetBudgetState__();

// Default Cap (ENV nicht gesetzt) → 1.00 USD
const defaultEnv: Readonly<Record<string, string | undefined>> = {};
assert(
  getDailyCapUsd(defaultEnv) === 1.0,
  "Default-Cap ohne ENV ist 1.00 USD",
);
assert(
  getDailyCapUsd({ LP_AI_DAILY_CAP_USD: "5.50" }) === 5.5,
  "ENV LP_AI_DAILY_CAP_USD wird übernommen",
);
assert(
  getDailyCapUsd({ LP_AI_DAILY_CAP_USD: "abc" }) === 1.0,
  "kaputte ENV → Fallback auf Default",
);

// Preview ohne Charge ändert State nicht.
const p1 = previewBudget(0.5);
assert(!p1.exceeded, "0.5 USD < 1.00 USD Cap, nicht exceeded");
const p2 = previewBudget(0.5);
assert(
  p1.spentUsd === p2.spentUsd && p2.spentUsd === 0,
  "preview ändert spentUsd nicht",
);

// Charge addiert.
const c1 = chargeBudget(0.4);
assert(Math.abs(c1.spentUsd - 0.4) < 1e-9, "nach charge(0.4) → 0.40");
const c2 = chargeBudget(0.4);
assert(Math.abs(c2.spentUsd - 0.8) < 1e-9, "nach charge(0.4) erneut → 0.80");
assert(!c2.exceeded, "0.80 < 1.00 Cap → nicht exceeded");

// preview mit weiteren 0.5 würde Cap reißen.
const p3 = previewBudget(0.5);
assert(p3.exceeded, "0.80 + 0.50 = 1.30 > 1.00 Cap → exceeded");

// charge weiter — kein Cap-Block in chargeBudget selbst.
const c3 = chargeBudget(0.5);
assert(c3.exceeded, "nach charge(0.5) auf 0.80 → 1.30, exceeded");

// Reset & Re-Test
__resetBudgetState__();
const after = previewBudget(0.1);
assert(after.spentUsd === 0, "nach Reset → spentUsd = 0");

// -----------------------------------------------------------------------
// 6. Bucket-Isolation
// -----------------------------------------------------------------------
__resetBudgetState__();
chargeBudget(0.3, "biz-a");
chargeBudget(0.7, "biz-b");
const a = previewBudget(0, "biz-a");
const b = previewBudget(0, "biz-b");
assert(
  Math.abs(a.spentUsd - 0.3) < 1e-9,
  "Bucket biz-a hat 0.30 USD verbraucht",
);
assert(
  Math.abs(b.spentUsd - 0.7) < 1e-9,
  "Bucket biz-b hat 0.70 USD verbraucht (isoliert)",
);

console.log("ai-cost smoketest ✅ (24 Asserts)");
export const __AI_COST_SMOKETEST__ = { totalAssertions: 24 };
