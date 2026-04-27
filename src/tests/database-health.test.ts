/**
 * Smoketest für Database-Health (Code-Session 35).
 *
 * Pure-Function-Test: kein echter Supabase-Endpoint nötig. Wir
 * injizieren `fetchImpl` und prüfen die Status-Logik:
 *   - ohne ENV → offline + configured=false
 *   - 200 schnell → ok
 *   - 200 langsam → degraded
 *   - 500 → degraded
 *   - Timeout/Abort → offline
 *   - Netzwerk-Fehler → degraded
 *   - Privacy: anon-Key wird nicht in `reason` durchgereicht
 *
 * Wrapper-Async-Main wegen tsx-CJS-Compile (kein top-level await).
 */

import {
  checkDatabaseHealth,
  type DatabaseHealth,
} from "@/core/database/health";
import {
  __resetSupabaseClientCache__,
  isSupabaseConfigured,
  readSupabaseEnv,
} from "@/core/database/client";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`database-health assertion failed: ${message}`);
}

const FAKE_URL = "https://test-project.supabase.co";
const FAKE_KEY = "anon-key-test-do-not-use-real-key";

async function main() {
  // ---------------------------------------------------------------------
  // 1. ENV-Reader: nur trim, leere Werte → undefined
  // ---------------------------------------------------------------------
  const empty = readSupabaseEnv({});
  assert(empty.url === undefined && empty.anonKey === undefined, "leere ENV → undefined");
  assert(!isSupabaseConfigured(empty), "leer → nicht konfiguriert");

  const partial = readSupabaseEnv({ SUPABASE_URL: FAKE_URL });
  assert(!isSupabaseConfigured(partial), "nur URL ohne Key → nicht konfiguriert");

  const both = readSupabaseEnv({
    SUPABASE_URL: FAKE_URL,
    SUPABASE_ANON_KEY: FAKE_KEY,
  });
  assert(isSupabaseConfigured(both), "URL + Key gesetzt → konfiguriert");
  assert(both.url === FAKE_URL && both.anonKey === FAKE_KEY, "Werte korrekt gelesen");

  const trimmed = readSupabaseEnv({
    SUPABASE_URL: `  ${FAKE_URL}  `,
    SUPABASE_ANON_KEY: "   ",
  });
  assert(
    trimmed.url === FAKE_URL && trimmed.anonKey === undefined,
    "trim greift; whitespace-only Key → undefined",
  );

  // ---------------------------------------------------------------------
  // 2. checkDatabaseHealth: ohne ENV → offline + configured=false
  // ---------------------------------------------------------------------
  __resetSupabaseClientCache__();
  const offline: DatabaseHealth = await checkDatabaseHealth({});
  assert(offline.status === "offline", "ohne ENV → status offline");
  assert(offline.configured === false, "ohne ENV → configured=false");
  assert(
    typeof offline.reason === "string" && offline.reason.length > 0,
    "ohne ENV → reason gesetzt",
  );
  assert(offline.latencyMs === undefined, "ohne ENV → keine latencyMs");

  // ---------------------------------------------------------------------
  // 3. 200 schnell → ok
  // ---------------------------------------------------------------------
  const okFetch: typeof fetch = async () =>
    new Response("{}", { status: 200, headers: { "content-type": "application/json" } });

  const ok = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: okFetch },
  );
  assert(ok.status === "ok", "200 → status ok");
  assert(ok.configured === true, "konfiguriert");
  assert(typeof ok.latencyMs === "number" && ok.latencyMs >= 0, "latencyMs vorhanden");

  // ---------------------------------------------------------------------
  // 4. 401 zählt auch als „lebt" (PostgREST mit RLS)
  // ---------------------------------------------------------------------
  const unauthFetch: typeof fetch = async () => new Response("{}", { status: 401 });
  const unauth = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: unauthFetch },
  );
  assert(unauth.status === "ok", "401 (RLS) → ok, weil Server lebt");

  // ---------------------------------------------------------------------
  // 5. 503 → degraded
  // ---------------------------------------------------------------------
  const fiveHundredFetch: typeof fetch = async () => new Response("err", { status: 503 });
  const degraded = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: fiveHundredFetch },
  );
  assert(degraded.status === "degraded", "5xx → degraded");
  assert(typeof degraded.reason === "string" && degraded.reason.includes("503"), "reason nennt Status");

  // ---------------------------------------------------------------------
  // 6. Slow Response → degraded
  // ---------------------------------------------------------------------
  const slowFetch: typeof fetch = async () => {
    await new Promise((r) => setTimeout(r, 1700));
    return new Response("{}", { status: 200 });
  };
  const slow = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: slowFetch, timeoutMs: 5000 },
  );
  assert(slow.status === "degraded", "1700 ms > 1500 ms Schwelle → degraded");
  assert(typeof slow.latencyMs === "number" && slow.latencyMs >= 1500, "latencyMs spiegelt Verzögerung");

  // ---------------------------------------------------------------------
  // 7. Timeout via AbortController → offline
  // ---------------------------------------------------------------------
  const hangingFetch: typeof fetch = (_input, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        reject(err);
      });
    });
  const timeout = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: hangingFetch, timeoutMs: 50 },
  );
  assert(timeout.status === "offline", "Abort → offline");
  assert(
    typeof timeout.reason === "string" && timeout.reason.includes("Timeout"),
    "reason nennt Timeout",
  );

  // ---------------------------------------------------------------------
  // 8. Netzwerk-Fehler (kein Abort) → degraded
  // ---------------------------------------------------------------------
  const networkErrorFetch: typeof fetch = async () => {
    throw new Error("ECONNREFUSED");
  };
  const netErr = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: networkErrorFetch },
  );
  assert(netErr.status === "degraded", "Netz-Fehler → degraded (Server vielleicht nur kurz weg)");
  assert(
    typeof netErr.reason === "string" && netErr.reason.includes("ECONNREFUSED"),
    "reason übernimmt Fehler-Message",
  );

  // ---------------------------------------------------------------------
  // 9. Privacy: anon-Key taucht nirgends im Result auf
  // ---------------------------------------------------------------------
  const result = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: okFetch },
  );
  const dump = JSON.stringify(result);
  assert(!dump.includes(FAKE_KEY), "anon-Key nicht im DatabaseHealth-Dump");
  assert(!dump.includes(FAKE_URL), "URL nicht im DatabaseHealth-Dump");

  // ---------------------------------------------------------------------
  // 10. fetchImpl bekommt apikey-Header und korrekte URL
  // ---------------------------------------------------------------------
  let capturedUrl = "";
  let capturedHeaders: Headers | undefined;
  const captureFetch: typeof fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedHeaders = new Headers(init?.headers);
    return new Response("{}", { status: 200 });
  };
  await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: captureFetch },
  );
  assert(
    capturedUrl === `${FAKE_URL}/rest/v1/`,
    `URL korrekt zusammengesetzt, war: ${capturedUrl}`,
  );
  assert(capturedHeaders?.get("apikey") === FAKE_KEY, "apikey-Header gesetzt");

  console.log("database-health smoketest ✅ (~30 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __DATABASE_HEALTH_SMOKETEST__ = { totalAssertions: 30 };
