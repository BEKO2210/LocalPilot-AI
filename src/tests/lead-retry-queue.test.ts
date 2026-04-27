/**
 * Smoketest für Lead-Retry-Queue (Code-Session 64).
 *
 * Memory-Storage-Stub für vollständig deterministische Tests.
 * Decken alle Lifecycle-Phasen ab: enqueue, getDueItems,
 * markRetried-success, markRetried-fail mit Backoff, Discard
 * nach maxAttempts, Stats-Counts, defensive Inputs.
 */

import {
  QUEUE_DEFAULTS,
  clearQueue,
  computeNextRetryAt,
  enqueue,
  getDueItems,
  getQueueStats,
  getQueueStorageKey,
  markRetried,
  readQueue,
  type StorageLike,
} from "@/lib/lead-retry-queue";
import type { ServerSubmitInput } from "@/lib/lead-submit";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`lead-retry-queue assertion failed: ${message}`);
}

function memoryStorage(): StorageLike & { snapshot(): Record<string, string> } {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
    snapshot: () => Object.fromEntries(map),
  };
}

const samplePayload: ServerSubmitInput = {
  businessId: "11111111-1111-4111-8111-111111111111",
  name: "Anja Test",
  email: "anja@example.com",
  message: "Bitte um Rückruf",
  consent: { givenAt: "2026-04-27T12:00:00Z", policyVersion: "v1" },
};

async function main() {
  // ---------------------------------------------------------------------
  // 1. computeNextRetryAt: Exponential-Backoff
  // ---------------------------------------------------------------------
  const t0 = new Date("2026-04-27T12:00:00Z");
  const r0 = computeNextRetryAt(0, t0);
  assert(
    new Date(r0).getTime() === t0.getTime() + 5_000,
    "attempts=0 → +5s",
  );
  const r1 = computeNextRetryAt(1, t0);
  assert(
    new Date(r1).getTime() === t0.getTime() + 10_000,
    "attempts=1 → +10s",
  );
  const r3 = computeNextRetryAt(3, t0);
  assert(
    new Date(r3).getTime() === t0.getTime() + 40_000,
    "attempts=3 → +40s",
  );
  // Cap bei 5min
  const rBig = computeNextRetryAt(50, t0);
  assert(
    new Date(rBig).getTime() === t0.getTime() + 5 * 60 * 1000,
    "attempts=50 → cap auf 5min",
  );
  // Negative attempts → wie 0
  const rNeg = computeNextRetryAt(-3, t0);
  assert(
    new Date(rNeg).getTime() === t0.getTime() + 5_000,
    "negative attempts → wie 0",
  );

  // ---------------------------------------------------------------------
  // 2. enqueue + readQueue
  // ---------------------------------------------------------------------
  const s = memoryStorage();
  const item = enqueue(s, samplePayload, {
    id: "lead-1",
    now: t0,
  });
  assert(item.id === "lead-1", "ID durchgereicht");
  assert(item.attempts === 0, "frisch → attempts=0");
  assert(item.createdAt === t0.toISOString(), "createdAt = now");
  assert(
    new Date(item.nextRetryAt).getTime() === t0.getTime() + 5_000,
    "nextRetryAt = +5s",
  );
  const queue = readQueue(s);
  assert(queue.length === 1, "Queue hat 1 Item");

  // Storage-Key-Check
  const snap = s.snapshot();
  assert(getQueueStorageKey() in snap, "Storage-Key gesetzt");

  // ---------------------------------------------------------------------
  // 3. enqueue mit gleicher ID → ersetzt (Idempotenz)
  // ---------------------------------------------------------------------
  const t1 = new Date(t0.getTime() + 10_000);
  enqueue(s, samplePayload, { id: "lead-1", now: t1 });
  const after = readQueue(s);
  assert(after.length === 1, "gleiche ID dedupliziert");
  assert(
    after[0]?.createdAt === t1.toISOString(),
    "neuer createdAt überschreibt",
  );

  // ---------------------------------------------------------------------
  // 4. getDueItems: noch nicht fällig
  // ---------------------------------------------------------------------
  const due0 = getDueItems(s, t1);
  assert(
    due0.length === 0,
    "direkt nach enqueue → kein due (5s in der Zukunft)",
  );

  // 5s später → fällig
  const t2 = new Date(t1.getTime() + 5_000);
  const due1 = getDueItems(s, t2);
  assert(due1.length === 1, "nach 5s → fällig");

  // ---------------------------------------------------------------------
  // 5. markRetried-success: Item entfernt
  // ---------------------------------------------------------------------
  const removed = markRetried(s, "lead-1", { success: true, now: t2 });
  assert(removed === null, "success liefert null");
  assert(readQueue(s).length === 0, "Queue leer nach Success");

  // ---------------------------------------------------------------------
  // 6. markRetried-fail: attempts++, Backoff
  // ---------------------------------------------------------------------
  enqueue(s, samplePayload, { id: "lead-2", now: t2 });
  const after1 = markRetried(s, "lead-2", { success: false, now: t2 });
  assert(after1 !== null, "fail liefert das Item");
  assert(after1?.attempts === 1, "attempts=1 nach erstem Fail");
  assert(
    new Date(after1!.nextRetryAt).getTime() === t2.getTime() + 10_000,
    "nextRetryAt = +10s",
  );

  // Zweiter Fail → attempts=2, +20s
  const after2 = markRetried(s, "lead-2", { success: false, now: t2 });
  assert(after2?.attempts === 2, "attempts=2");
  assert(
    new Date(after2!.nextRetryAt).getTime() === t2.getTime() + 20_000,
    "nextRetryAt = +20s",
  );

  // ---------------------------------------------------------------------
  // 7. markRetried-fail bis maxAttempts → discarded
  // ---------------------------------------------------------------------
  // attempts=2 → 3,4,5,6,7,8 = 6 weitere Failures (insgesamt 8)
  let cur: ReturnType<typeof markRetried> = after2;
  for (let i = 0; i < 6; i++) {
    cur = markRetried(s, "lead-2", { success: false, now: t2 });
  }
  assert(cur?.attempts === 8, "attempts=8 nach maxAttempts");
  assert(cur?.discardedAt !== undefined, "discardedAt gesetzt");

  // discarded-Items werden nicht von getDueItems geliefert
  const t3 = new Date(t2.getTime() + 60_000_000);
  const dueAfter = getDueItems(s, t3);
  assert(
    dueAfter.length === 0,
    "discarded-Items nicht in getDueItems",
  );

  // Sind aber noch in readQueue (Operator kann inspect)
  const all = readQueue(s);
  assert(all.length === 1, "discarded bleibt in readQueue");

  // ---------------------------------------------------------------------
  // 8. markRetried mit nicht-existenter ID
  // ---------------------------------------------------------------------
  const noop = markRetried(s, "nicht-da", { success: true, now: t2 });
  assert(noop === null, "unbekannte ID → null");

  // ---------------------------------------------------------------------
  // 9. getQueueStats
  // ---------------------------------------------------------------------
  clearQueue(s);
  enqueue(s, samplePayload, { id: "a", now: t0 });
  enqueue(s, samplePayload, { id: "b", now: t1 });
  const tDue = new Date(t0.getTime() + 6_000);
  const stats1 = getQueueStats(s, tDue);
  assert(stats1.total === 2, "2 Items active");
  assert(stats1.dueNow === 1, "nur 1 due (a)");
  assert(stats1.discarded === 0, "noch nichts discarded");
  assert(stats1.nextRetryAt !== null, "nextRetryAt gesetzt");

  // a discarden
  for (let i = 0; i < 8; i++) {
    markRetried(s, "a", { success: false, now: t0 });
  }
  const stats2 = getQueueStats(s, tDue);
  assert(stats2.total === 1, "nur b active (a discarded)");
  assert(stats2.discarded === 1, "1 discarded");

  // ---------------------------------------------------------------------
  // 10. clearQueue
  // ---------------------------------------------------------------------
  clearQueue(s);
  assert(readQueue(s).length === 0, "clearQueue → leer");

  // ---------------------------------------------------------------------
  // 11. Defensive: null-Storage (SSR / Privacy-Modus)
  // ---------------------------------------------------------------------
  assert(readQueue(null).length === 0, "null-Storage → leer");
  const noopItem = enqueue(null, samplePayload, { id: "x", now: t0 });
  assert(
    noopItem.id === "x",
    "null-Storage: Item-Object zurückgegeben (UI-State)",
  );
  // … aber nichts wurde persistiert
  assert(readQueue(null).length === 0, "null-Storage: keine Persistenz");
  const noopRetry = markRetried(null, "x", { success: true, now: t0 });
  assert(noopRetry === null, "null-Storage markRetried → null");
  const noopStats = getQueueStats(null, t0);
  assert(
    noopStats.total === 0 && noopStats.dueNow === 0,
    "null-Storage Stats = 0",
  );

  // ---------------------------------------------------------------------
  // 12. Defensive: korrupter Storage-Inhalt
  // ---------------------------------------------------------------------
  const broken = memoryStorage();
  broken.setItem(getQueueStorageKey(), "not json");
  assert(readQueue(broken).length === 0, "JSON-Parse-Fehler → leer");

  broken.setItem(getQueueStorageKey(), JSON.stringify({ not: "array" }));
  assert(readQueue(broken).length === 0, "Non-Array → leer");

  broken.setItem(
    getQueueStorageKey(),
    JSON.stringify([
      { id: "ok", payload: {}, attempts: 0, nextRetryAt: "x", createdAt: "x" },
      { id: "bad" }, // missing fields
      "string",
    ]),
  );
  const filtered = readQueue(broken);
  assert(
    filtered.length === 1 && filtered[0]?.id === "ok",
    "korrupte Items werden gefiltert",
  );

  // ---------------------------------------------------------------------
  // 13. FIFO-Sortierung in getDueItems
  // ---------------------------------------------------------------------
  clearQueue(s);
  const tOlder = new Date("2026-04-27T11:00:00Z");
  const tNewer = new Date("2026-04-27T11:30:00Z");
  enqueue(s, samplePayload, { id: "newer", now: tNewer });
  enqueue(s, samplePayload, { id: "older", now: tOlder });
  const tFlush = new Date("2026-04-27T13:00:00Z");
  const dueSorted = getDueItems(s, tFlush);
  assert(dueSorted.length === 2, "2 due");
  assert(dueSorted[0]?.id === "older", "ältester zuerst (FIFO)");
  assert(dueSorted[1]?.id === "newer", "neuerer danach");

  // ---------------------------------------------------------------------
  // 14. Defaults-Sanity
  // ---------------------------------------------------------------------
  assert(QUEUE_DEFAULTS.baseDelayMs === 5_000, "Base-Delay = 5s");
  assert(QUEUE_DEFAULTS.maxDelayMs === 5 * 60 * 1000, "Max-Delay = 5min");
  assert(QUEUE_DEFAULTS.maxAttempts === 8, "MaxAttempts = 8");
  assert(QUEUE_DEFAULTS.factor === 2, "Factor = 2");

  console.log("lead-retry-queue smoketest ✅ (~50 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __LEAD_RETRY_QUEUE_SMOKETEST__ = { totalAssertions: 50 };
