/**
 * Lead-Retry-Queue (Code-Session 64).
 *
 * Wenn das Public-Site-Formular einen Lead lokal als
 * `local-fallback` ablegt (404 / 5xx / Netzwerk-Fehler), liegt
 * er bislang nur in `lp:leads-overrides:v1` und wird **nie**
 * gegen die DB geflushed. Diese Queue holt das nach: Items
 * werden mit Exponential-Backoff erneut versucht, bis sie
 * entweder erfolgreich an den Server gehen oder das
 * `maxAttempts`-Limit reißen (dann werden sie als `discarded`
 * markiert — ein Operator kann sie aus dem Mock-Store
 * manuell rüberziehen).
 *
 * Architektur:
 *   - Queue in `localStorage` unter `lp:lead-retry-queue:v2`.
 *   - Items: `{ id, payload, attempts, nextRetryAt, createdAt,
 *     discardedAt? }`.
 *   - Pure-Logic: Storage-IO ist über `Storage`-Interface
 *     gestubt-fähig (Tests benutzen einen Memory-Stub).
 *   - Keine Side-Effects ausserhalb der Storage-Schnittstelle —
 *     der Aufrufer entscheidet, **wann** flusched wird (mount,
 *     online-Event, Periodic-Timer).
 *
 * Backoff: `min(MAX_DELAY, BASE_DELAY * 2^attempts)` — startet
 * bei 5s, verdoppelt sich bis 5min, danach Plateau. Kein Jitter
 * — bei Single-Browser-Queue brauchen wir das nicht (kein
 * Thundering-Herd).
 */

import type { ServerSubmitInput } from "@/lib/lead-submit";

const STORAGE_KEY = "lp:lead-retry-queue:v2";

export const QUEUE_DEFAULTS = {
  /** Erstes Retry nach 5s. */
  baseDelayMs: 5_000,
  /** Maximaler Backoff: 5 min. */
  maxDelayMs: 5 * 60 * 1000,
  /** Nach so vielen Versuchen wird das Item discarded. */
  maxAttempts: 8,
  /** Verdopplung pro Attempt. */
  factor: 2,
} as const;

export interface RetryItem {
  /** Eindeutige Item-ID — clientside vergeben. */
  readonly id: string;
  /** Server-Payload identisch zu lead-submit `serverInput`. */
  readonly payload: ServerSubmitInput;
  /** Anzahl bisheriger Versuche (0 für frisch enqueued). */
  readonly attempts: number;
  /** ISO-Timestamp, ab dem das Item wieder fällig ist. */
  readonly nextRetryAt: string;
  /** ISO-Timestamp der ersten Enqueueing. */
  readonly createdAt: string;
  /** Wenn gesetzt: Item wurde nach `maxAttempts` aufgegeben. */
  readonly discardedAt?: string;
}

/** Minimal-Storage-Interface — `localStorage` erfüllt es. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function readQueue(storage: StorageLike | null): readonly RetryItem[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRetryItem);
  } catch {
    return [];
  }
}

function writeQueue(
  storage: StorageLike | null,
  items: readonly RetryItem[],
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage voll / Privacy-Modus → silently dropp. Form-Code
    // hat den Lead bereits in der Mock-Store-Backup-Schicht.
  }
}

function isRetryItem(value: unknown): value is RetryItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<RetryItem>;
  return (
    typeof v.id === "string" &&
    typeof v.attempts === "number" &&
    typeof v.nextRetryAt === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.payload === "object" &&
    v.payload !== null
  );
}

/**
 * Berechnet, wann das Item nach `attempts` Versuchen wieder
 * fällig sein soll. `now` als Parameter macht den Helper
 * deterministisch testbar.
 */
export function computeNextRetryAt(
  attempts: number,
  now: Date,
  config: typeof QUEUE_DEFAULTS = QUEUE_DEFAULTS,
): string {
  const safeAttempts = Math.max(0, Math.floor(attempts));
  const delayMs = Math.min(
    config.maxDelayMs,
    config.baseDelayMs * Math.pow(config.factor, safeAttempts),
  );
  return new Date(now.getTime() + delayMs).toISOString();
}

/**
 * Legt einen neuen Lead-Submit-Versuch in die Queue. Erstes
 * Retry liegt nach `baseDelayMs` in der Zukunft — der Aufrufer
 * (Form) hat den ersten Versuch ja gerade selbst gemacht und
 * abgelehnt bekommen.
 */
export function enqueue(
  storage: StorageLike | null,
  payload: ServerSubmitInput,
  options: {
    readonly id: string;
    readonly now: Date;
  },
): RetryItem {
  const item: RetryItem = {
    id: options.id,
    payload,
    attempts: 0,
    createdAt: options.now.toISOString(),
    nextRetryAt: computeNextRetryAt(0, options.now),
  };
  const current = readQueue(storage);
  // Idempotenz: bei gleicher ID den alten Eintrag ersetzen statt
  // duplizieren.
  const next = [...current.filter((i) => i.id !== item.id), item];
  writeQueue(storage, next);
  return item;
}

/**
 * Liefert nur Items, die jetzt fällig sind (nicht discarded,
 * nextRetryAt <= now). Sortiert nach `createdAt` aufsteigend
 * (FIFO — ältester Lead zuerst).
 */
export function getDueItems(
  storage: StorageLike | null,
  now: Date,
): readonly RetryItem[] {
  const all = readQueue(storage);
  return all
    .filter(
      (i) =>
        !i.discardedAt && new Date(i.nextRetryAt).getTime() <= now.getTime(),
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Markiert ein Item nach einem Retry-Versuch als erfolgreich
 * (Item wird entfernt) oder als gescheitert (attempts++, neuer
 * Backoff). Bei `maxAttempts` wird `discardedAt` gesetzt — das
 * Item bleibt in der Queue für eine spätere Operator-Inspektion,
 * wird aber von `getDueItems` nicht mehr geliefert.
 */
export function markRetried(
  storage: StorageLike | null,
  id: string,
  options: {
    readonly success: boolean;
    readonly now: Date;
    readonly config?: typeof QUEUE_DEFAULTS;
  },
): RetryItem | null {
  const config = options.config ?? QUEUE_DEFAULTS;
  const all = readQueue(storage);
  const target = all.find((i) => i.id === id);
  if (!target) return null;

  if (options.success) {
    const next = all.filter((i) => i.id !== id);
    writeQueue(storage, next);
    return null;
  }

  const newAttempts = target.attempts + 1;
  const updated: RetryItem =
    newAttempts >= config.maxAttempts
      ? {
          ...target,
          attempts: newAttempts,
          nextRetryAt: target.nextRetryAt,
          discardedAt: options.now.toISOString(),
        }
      : {
          ...target,
          attempts: newAttempts,
          nextRetryAt: computeNextRetryAt(newAttempts, options.now, config),
        };
  const next = all.map((i) => (i.id === id ? updated : i));
  writeQueue(storage, next);
  return updated;
}

export interface QueueStats {
  readonly total: number;
  /** Items, die jetzt sofort versuchbar wären. */
  readonly dueNow: number;
  /** Items, die bereits aufgegeben wurden. */
  readonly discarded: number;
  /** Frühestes nextRetryAt aus den nicht-discarded Items, oder null. */
  readonly nextRetryAt: string | null;
}

export function getQueueStats(
  storage: StorageLike | null,
  now: Date,
): QueueStats {
  const all = readQueue(storage);
  const active = all.filter((i) => !i.discardedAt);
  const dueNow = active.filter(
    (i) => new Date(i.nextRetryAt).getTime() <= now.getTime(),
  ).length;
  const discarded = all.length - active.length;
  const earliest = active.reduce<string | null>((acc, i) => {
    if (!acc) return i.nextRetryAt;
    return i.nextRetryAt < acc ? i.nextRetryAt : acc;
  }, null);
  return {
    total: active.length,
    dueNow,
    discarded,
    nextRetryAt: earliest,
  };
}

/** Komplette Queue löschen — z. B. für Operator-Reset. */
export function clearQueue(storage: StorageLike | null): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Test-Helper: liefert den Storage-Key, damit Tests direkt prüfen können. */
export function getQueueStorageKey(): string {
  return STORAGE_KEY;
}
