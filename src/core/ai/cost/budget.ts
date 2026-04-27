/**
 * In-Memory-Daily-Budget-Tracker (Code-Session 29).
 *
 * Pro Bucket-Key (z. B. `default`, später `business:<slug>`) summieren
 * wir die geschätzten Kosten des aktuellen Tages. Beim Tageswechsel
 * setzt sich der Wert automatisch zurück.
 *
 * **Limit dieser Implementierung**:
 *   - In-Memory: Server-Restart setzt zurück, Multi-Instance-Deploys
 *     teilen den State nicht. Für MVP/Vercel-Hobby-Tier okay; später
 *     Redis/Upstash.
 *   - Datum nach UTC, nicht nach Lokalzeit. Reicht für Cap-Logik
 *     (Reset einmal pro 24 h, gut genug).
 *   - Cap aus ENV: `LP_AI_DAILY_CAP_USD` (Default 1.00).
 *
 * Folge-Items (Track B) — siehe `PROGRAM_PLAN.md`:
 *   - Persistenter Store (Redis/Upstash) für Multi-Instance-Deploys.
 *   - Per-Betrieb-Cap (Bucket = `business:<slug>`).
 *   - Monthly-Cap zusätzlich zum Daily-Cap.
 *   - Cost-Bucket-Logging zu einem Audit-Log (für Auftraggeber-Reports).
 */

const DEFAULT_CAP_USD = 1.0;
const DEFAULT_BUCKET = "default";

interface BucketState {
  /** ISO-Datum (UTC) `YYYY-MM-DD`. */
  date: string;
  spentUsd: number;
}

const buckets = new Map<string, BucketState>();

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Liest den Cap aus `LP_AI_DAILY_CAP_USD` ENV. */
export function getDailyCapUsd(
  env: Readonly<Record<string, string | undefined>> = process.env,
): number {
  const raw = env["LP_AI_DAILY_CAP_USD"]?.trim();
  if (!raw) return DEFAULT_CAP_USD;
  const parsed = parseFloat(raw);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return DEFAULT_CAP_USD;
}

export interface BudgetCheckResult {
  /** Hat der Aufruf das Limit verletzt? */
  readonly exceeded: boolean;
  /** Bisher heute ausgegeben (in USD). */
  readonly spentUsd: number;
  /** Tages-Cap (in USD). */
  readonly capUsd: number;
  /** Verbleibend (capUsd - spentUsd). */
  readonly remainingUsd: number;
  /** Bucket-Key (für Logs). */
  readonly bucket: string;
}

/**
 * Prüft, ob der nächste Aufruf den Cap reißen würde, und bucht ihn
 * **nicht**. Vor dem eigentlichen Provider-Call benutzen.
 */
export function previewBudget(
  costUsd: number,
  bucket = DEFAULT_BUCKET,
  capUsd = getDailyCapUsd(),
): BudgetCheckResult {
  const today = todayUtc();
  const state = buckets.get(bucket);
  const currentSpent =
    state && state.date === today ? state.spentUsd : 0;
  const wouldBe = currentSpent + costUsd;
  return {
    exceeded: wouldBe > capUsd,
    spentUsd: currentSpent,
    capUsd,
    remainingUsd: Math.max(0, capUsd - currentSpent),
    bucket,
  };
}

/**
 * Bucht einen Aufruf nachträglich. Nach dem erfolgreichen Provider-
 * Call. Kein Cap-Check hier — das passiert in `previewBudget`.
 */
export function chargeBudget(
  costUsd: number,
  bucket = DEFAULT_BUCKET,
): BudgetCheckResult {
  const today = todayUtc();
  const state = buckets.get(bucket);
  const newSpent =
    state && state.date === today ? state.spentUsd + costUsd : costUsd;
  buckets.set(bucket, { date: today, spentUsd: newSpent });
  const capUsd = getDailyCapUsd();
  return {
    exceeded: newSpent > capUsd,
    spentUsd: newSpent,
    capUsd,
    remainingUsd: Math.max(0, capUsd - newSpent),
    bucket,
  };
}

/** Nur für Tests: setzt den ganzen Tracker zurück. */
export function __resetBudgetState__(): void {
  buckets.clear();
}
