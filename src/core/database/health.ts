/**
 * Database-Health-Check (Code-Session 35).
 *
 * Pingt Supabase REST-Endpoint mit dem anon-Key und einem
 * AbortController-Timeout. Drei Status:
 *
 * - `offline`: ENV fehlt oder Endpoint antwortet nicht innerhalb des
 *   Timeouts — App läuft weiter im Mock-Modus.
 * - `degraded`: Antwort kommt, aber zu langsam (> 1.5 s) oder mit
 *   nicht-erfolgreichem Status. Dashboard zeigt Warnung.
 * - `ok`: Antwort < 1.5 s und HTTP 2xx/3xx (PostgREST liefert auf
 *   `/rest/v1/` typischerweise 200 mit OpenAPI-JSON oder 401 ohne
 *   Auth — beides reicht uns als Lebenszeichen).
 *
 * Wir benutzen bewusst **keinen** SDK-Call hier: ein Roh-`fetch` ist
 * leichtgewichtiger und tabellenunabhängig (keine
 * `from(...).select(...)`-Abhängigkeit auf eine echte Tabelle, die
 * vielleicht noch gar nicht existiert).
 */

import { isSupabaseConfigured, readSupabaseEnv } from "./client";

export type DatabaseStatus = "ok" | "degraded" | "offline";

export interface DatabaseHealth {
  readonly status: DatabaseStatus;
  /** Antwortzeit in Millisekunden, falls Request durchging. */
  readonly latencyMs?: number;
  /** Kurze Erklärung — sicher für UI-Anzeige (kein Key, keine URL). */
  readonly reason?: string;
  /** Ist `SUPABASE_URL` + `SUPABASE_ANON_KEY` gesetzt? */
  readonly configured: boolean;
}

const DEFAULT_TIMEOUT_MS = 2000;
const DEGRADED_THRESHOLD_MS = 1500;

export interface CheckDatabaseHealthOptions {
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
}

export async function checkDatabaseHealth(
  env: Readonly<Record<string, string | undefined>> = process.env,
  options: CheckDatabaseHealthOptions = {},
): Promise<DatabaseHealth> {
  const sb = readSupabaseEnv(env);
  if (!isSupabaseConfigured(sb)) {
    return {
      status: "offline",
      configured: false,
      reason: "SUPABASE_URL oder SUPABASE_ANON_KEY nicht gesetzt",
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const res = await fetchImpl(`${sb.url}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: sb.anonKey!,
        accept: "application/json",
      },
      signal: controller.signal,
    });
    const latencyMs = Date.now() - startedAt;

    // PostgREST liefert auf das Root-Resource je nach Konfiguration
    // 200 (OpenAPI-Schema), 401 (RLS) oder 404 — alles drei sind
    // valide Lebenszeichen, weil ein TCP-fähiger Server geantwortet
    // hat. Erst 5xx + Netzwerk-Error werten wir als degraded.
    if (res.status >= 500) {
      return {
        status: "degraded",
        configured: true,
        latencyMs,
        reason: `HTTP ${res.status}`,
      };
    }
    if (latencyMs > DEGRADED_THRESHOLD_MS) {
      return {
        status: "degraded",
        configured: true,
        latencyMs,
        reason: `Antwort > ${DEGRADED_THRESHOLD_MS} ms`,
      };
    }
    return {
      status: "ok",
      configured: true,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      status: aborted ? "offline" : "degraded",
      configured: true,
      latencyMs,
      reason: aborted
        ? `Timeout nach ${timeoutMs} ms`
        : err instanceof Error
          ? err.message
          : "Netzwerk-Fehler",
    };
  } finally {
    clearTimeout(timer);
  }
}
