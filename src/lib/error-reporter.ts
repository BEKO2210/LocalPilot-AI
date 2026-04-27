/**
 * Error-Reporter (Code-Session 68).
 *
 * Adapter-Pattern für Production-Error-Tracking. Sentry-fähig,
 * aber **ohne** harte Dep auf `@sentry/nextjs`:
 *   - Default-Modus: console-Logger (Browser + Server) — 0 KB
 *     Bundle-Impact, funktioniert im Static-Export.
 *   - Sentry-Modus: aktiv, sobald (a) `SENTRY_DSN` /
 *     `NEXT_PUBLIC_SENTRY_DSN` ENV gesetzt ist UND (b) das
 *     Paket `@sentry/nextjs` im Build verfügbar ist. Lazy-Import
 *     via `await import(...)` mit try/catch — fehlt das Paket,
 *     fallen wir silent auf den Console-Modus zurück.
 *
 * Designentscheidung: kein direkter Import von Sentry. Damit
 * bleibt das Bundle 0 KB ohne Sentry, und wer Sentry will,
 * `npm i @sentry/nextjs` + ENV setzt — ohne Code-Änderung.
 *
 * **Pure**: alle Adapter-Operationen sind testbar via
 * Custom-Sink (`__setSinkForTesting`).
 */

export type ErrorLevel = "info" | "warning" | "error" | "fatal";

export interface ErrorContext {
  /** Strukturierte Tags (zB `{ route: "/api/leads" }`). */
  readonly tags?: Readonly<Record<string, string>>;
  /** Frei-Form-Extra-Daten (Body, IDs etc.). */
  readonly extra?: Readonly<Record<string, unknown>>;
  /** User-Identifikation, wenn bekannt. */
  readonly user?: {
    readonly id?: string;
    readonly email?: string;
  };
}

export interface ErrorSink {
  captureException(err: unknown, ctx?: ErrorContext): void;
  captureMessage(msg: string, level: ErrorLevel, ctx?: ErrorContext): void;
  /** Nur für Tests / spezielle Setups. */
  flush?(timeoutMs: number): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Default-Sink: console
// ---------------------------------------------------------------------------

const consoleSink: ErrorSink = {
  captureException(err, ctx) {
    const tags = ctx?.tags ? ` [${formatTags(ctx.tags)}]` : "";
    if (err instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(`[error-reporter]${tags}`, err.message, err.stack ?? "", ctx?.extra ?? "");
    } else {
      // eslint-disable-next-line no-console
      console.error(`[error-reporter]${tags}`, err, ctx?.extra ?? "");
    }
  },
  captureMessage(msg, level, ctx) {
    const tags = ctx?.tags ? ` [${formatTags(ctx.tags)}]` : "";
    const fn = level === "info" ? console.info : level === "warning" ? console.warn : console.error;
    // eslint-disable-next-line no-console
    fn(`[error-reporter:${level}]${tags}`, msg, ctx?.extra ?? "");
  },
};

function formatTags(tags: Readonly<Record<string, string>>): string {
  return Object.entries(tags)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
}

// ---------------------------------------------------------------------------
// Sink-Resolution mit Test-Override
// ---------------------------------------------------------------------------

let activeSink: ErrorSink = consoleSink;
let initPromise: Promise<void> | null = null;

/** Zugriff für Tests — setzt einen Custom-Sink, der alle Calls einsammelt. */
export function __setSinkForTesting(sink: ErrorSink | null): void {
  activeSink = sink ?? consoleSink;
  initPromise = null;
}

/**
 * Initialisiert den Reporter. Idempotent — mehrfache Aufrufe
 * liefern dieselbe Promise.
 *
 * Wenn `SENTRY_DSN` (Server) bzw. `NEXT_PUBLIC_SENTRY_DSN`
 * (Browser) gesetzt ist UND `@sentry/nextjs` im Build verfügbar
 * ist, wird Sentry aktiviert. Sonst: console-Sink bleibt aktiv.
 */
export function initErrorReporter(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const dsn = readDsnFromEnv();
    if (!dsn) {
      // Kein DSN gesetzt → console bleibt aktiv. Nicht laut
      // werden, das ist der Demo-/Static-Build-Default.
      return;
    }
    try {
      // Dynamic-import via Variable, damit Bundler den Pfad
      // nicht statisch auflöst — sonst würde der Static-Build
      // scheitern, wenn das Paket fehlt.
      const moduleName = "@sentry/nextjs";
      const sentry = (await import(/* webpackIgnore: true */ moduleName).catch(
        () => null,
      )) as null | {
        init: (opts: Record<string, unknown>) => void;
        captureException: (err: unknown, ctx?: unknown) => void;
        captureMessage: (msg: string, level?: unknown, ctx?: unknown) => void;
        flush?: (timeoutMs?: number) => Promise<boolean>;
      };
      if (!sentry) return; // Paket nicht installiert
      const tracesSampleRate = readSampleRate();
      sentry.init({
        dsn,
        tracesSampleRate,
        environment: process.env["NODE_ENV"] ?? "production",
      });
      activeSink = {
        captureException: (err, ctx) => sentry.captureException(err, ctx),
        captureMessage: (msg, level, ctx) =>
          sentry.captureMessage(msg, level, ctx),
        ...(sentry.flush ? { flush: sentry.flush.bind(sentry) } : {}),
      };
    } catch {
      // Sentry-Init schlägt fehl → console bleibt.
      // Kein Throw — der Reporter darf den Server-Start nie
      // blockieren.
    }
  })();
  return initPromise;
}

function readDsnFromEnv(): string | null {
  if (typeof process === "undefined" || !process.env) return null;
  const dsn =
    process.env["SENTRY_DSN"] ?? process.env["NEXT_PUBLIC_SENTRY_DSN"];
  if (!dsn || dsn.trim().length === 0) return null;
  return dsn.trim();
}

function readSampleRate(): number {
  const raw = process.env["SENTRY_TRACES_SAMPLE_RATE"];
  if (!raw) return 0.1; // konservativer Default
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 1) return 0.1;
  return n;
}

// ---------------------------------------------------------------------------
// Public-API
// ---------------------------------------------------------------------------

export function captureException(err: unknown, ctx?: ErrorContext): void {
  activeSink.captureException(err, ctx);
}

export function captureMessage(
  msg: string,
  level: ErrorLevel = "info",
  ctx?: ErrorContext,
): void {
  activeSink.captureMessage(msg, level, ctx);
}

/**
 * Flush für Serverless-Kontexte. Garantiert, dass alle Events
 * versendet sind, bevor die Function-Invocation beendet wird.
 * Default-Console-Sink hat keine Pending-Buffer → no-op.
 */
export async function flushErrorReporter(timeoutMs = 2_000): Promise<boolean> {
  if (activeSink.flush) {
    return activeSink.flush(timeoutMs);
  }
  return true;
}

/** Test-Helper: liefert den aktuellen Sink (nicht Public-API). */
export function __getActiveSinkForTesting(): ErrorSink {
  return activeSink;
}

/**
 * Convenience für API-Routes: protokolliert einen 5xx-Error
 * mit Route-Pfad als Tag.
 */
export function reportRouteError(
  err: unknown,
  routePath: string,
  extra?: Readonly<Record<string, unknown>>,
): void {
  captureException(err, {
    tags: { route: routePath },
    ...(extra ? { extra } : {}),
  });
}
