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
  /**
   * Was wurde gepingt? `"rest-root"` ist der Lebenszeichen-Check
   * (immer aktiv). `"businesses-table"` ist der schärfere Check
   * gegen die echte Tabelle (ab Code-Session 37, RLS muss erlauben).
   */
  readonly probe?: "rest-root" | "businesses-table";
}

const DEFAULT_TIMEOUT_MS = 2000;
const DEGRADED_THRESHOLD_MS = 1500;

export interface CheckDatabaseHealthOptions {
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
  /**
   * Welche Sonde wird benutzt? Default `"rest-root"` — pingt nur die
   * REST-Root-URL (tabellenunabhängig, schnell, RLS-frei). Mit
   * `"businesses-table"` wird ein zero-row-`select` gegen die
   * `businesses`-Tabelle gefahren — testet auch PostgREST + RLS.
   */
  readonly probe?: "rest-root" | "businesses-table";
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
  const probe = options.probe ?? "rest-root";

  // PostgREST liefert auf eine `select`-Anfrage gegen die Tabelle
  // mit `Range: 0-0` ein einzelnes Row-Fenster, ohne dass die
  // Tabelle leer sein dürfte — selbst eine leere Tabelle gibt 200.
  // Das ist deutlich aussagekräftiger als der REST-Root-Ping, weil
  // es PostgREST + RLS-Policy mit-prüft.
  const url =
    probe === "businesses-table"
      ? `${sb.url}/rest/v1/businesses?select=id&limit=1`
      : `${sb.url}/rest/v1/`;
  const headers: Record<string, string> = {
    apikey: sb.anonKey!,
    accept: "application/json",
  };
  if (probe === "businesses-table") {
    // Range-Header zwingt PostgREST, einen Zähler zu liefern, falls
    // die Policy es zulässt. Schadet nicht, falls nicht.
    headers["range"] = "0-0";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const res = await fetchImpl(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    const latencyMs = Date.now() - startedAt;

    // 5xx → degraded. 4xx ist OK (Server lebt; 401 = RLS, 404 = Tabelle
    // existiert noch nicht — beides Konfig, kein Server-Problem).
    if (res.status >= 500) {
      return {
        status: "degraded",
        configured: true,
        latencyMs,
        probe,
        reason: `HTTP ${res.status}`,
      };
    }
    // Bei `businesses-table`: 404 ist ein Setup-Hinweis (Migration nicht
    // gelaufen) — wir markieren es als `degraded` mit klarer Meldung,
    // damit der Auftraggeber im UI sieht, dass die Tabelle fehlt.
    if (probe === "businesses-table" && res.status === 404) {
      return {
        status: "degraded",
        configured: true,
        latencyMs,
        probe,
        reason: "Tabelle 'businesses' fehlt — Migration noch nicht gelaufen",
      };
    }
    if (latencyMs > DEGRADED_THRESHOLD_MS) {
      return {
        status: "degraded",
        configured: true,
        latencyMs,
        probe,
        reason: `Antwort > ${DEGRADED_THRESHOLD_MS} ms`,
      };
    }
    return {
      status: "ok",
      configured: true,
      latencyMs,
      probe,
    };
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      status: aborted ? "offline" : "degraded",
      configured: true,
      latencyMs,
      probe,
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
