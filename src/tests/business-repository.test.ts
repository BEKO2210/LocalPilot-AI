/**
 * Smoketest für Business-Repository (Code-Session 37).
 *
 * Drei Pfade:
 *   1. Mock-Repository: liest direkt aus injizierter Business-Liste.
 *   2. Resolver: ENV-gesteuerter Switch Mock ↔ Supabase + Soft-Fallback.
 *   3. businesses-table-Probe in checkDatabaseHealth: 404 → degraded
 *      mit klarer „Migration fehlt"-Meldung.
 */

import {
  __resetBusinessRepoCache__,
  createMockBusinessRepository,
  getBusinessRepository,
  resolveDataSource,
} from "@/core/database/repositories";
import { mockBusinesses } from "@/data/mock-businesses";
import { checkDatabaseHealth } from "@/core/database/health";
import { __resetSupabaseClientCache__ } from "@/core/database/client";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`business-repository assertion failed: ${message}`);
}

const FAKE_URL = "https://test-project.supabase.co";
const FAKE_KEY = "anon-key-test-do-not-use-real-key";

async function main() {
  // ---------------------------------------------------------------------
  // 1. Mock-Repository: Roundtrip
  // ---------------------------------------------------------------------
  const mock = createMockBusinessRepository({ businesses: mockBusinesses });
  assert(mock.source === "mock", "Mock-Repo source-Tag");
  const slugs = await mock.listSlugs();
  assert(slugs.length === mockBusinesses.length, "listSlugs trifft Mock-Anzahl");
  assert(
    slugs.every((s) => typeof s === "string" && s.length > 0),
    "alle Slugs sind nicht-leere Strings",
  );

  const first = await mock.findBySlug(mockBusinesses[0]!.slug);
  assert(first !== null, "findBySlug findet ersten Mock-Betrieb");
  assert(first!.slug === mockBusinesses[0]!.slug, "richtiger Betrieb zurück");

  const missing = await mock.findBySlug("does-not-exist-yz");
  assert(missing === null, "findBySlug → null bei unbekanntem Slug");

  const all = await mock.listAll();
  assert(all.length === mockBusinesses.length, "listAll vollständig");

  // ---------------------------------------------------------------------
  // 2. resolveDataSource: ENV-Steuerung
  // ---------------------------------------------------------------------
  assert(resolveDataSource({}) === "mock", "leere ENV → mock");
  assert(
    resolveDataSource({ LP_DATA_SOURCE: "mock" }) === "mock",
    "explizit mock → mock",
  );
  assert(
    resolveDataSource({ LP_DATA_SOURCE: "supabase" }) === "supabase",
    "supabase-ENV → supabase",
  );
  assert(
    resolveDataSource({ LP_DATA_SOURCE: "  SUPABASE  " }) === "supabase",
    "trim + case-insensitive",
  );
  assert(
    resolveDataSource({ LP_DATA_SOURCE: "garbage" }) === "mock",
    "unbekannter Wert → fallback mock",
  );

  // ---------------------------------------------------------------------
  // 3. getBusinessRepository: Cache-Verhalten + Soft-Fallback
  // ---------------------------------------------------------------------
  __resetBusinessRepoCache__();
  __resetSupabaseClientCache__();
  const repoMock = getBusinessRepository({});
  assert(repoMock.source === "mock", "Default ohne ENV → mock-Repo");

  __resetBusinessRepoCache__();
  __resetSupabaseClientCache__();
  // LP_DATA_SOURCE=supabase, aber keine SUPABASE_URL → Soft-Fallback auf mock
  // (Soft-Fallback schreibt nach stderr; im Test schweigend zulässig.)
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  let stderrCaptured = "";
  process.stderr.write = ((chunk: string) => {
    stderrCaptured += chunk;
    return true;
  }) as typeof process.stderr.write;
  try {
    const repoFallback = getBusinessRepository({ LP_DATA_SOURCE: "supabase" });
    assert(
      repoFallback.source === "mock",
      "supabase + leere ENV → fallback auf mock",
    );
    assert(
      stderrCaptured.includes("LP_DATA_SOURCE=supabase"),
      "Fallback loggt Hinweis nach stderr",
    );
  } finally {
    process.stderr.write = origStderrWrite;
  }

  __resetBusinessRepoCache__();
  __resetSupabaseClientCache__();
  // Voll konfiguriert: Repo geht auf supabase
  const repoSb = getBusinessRepository({
    LP_DATA_SOURCE: "supabase",
    SUPABASE_URL: FAKE_URL,
    SUPABASE_ANON_KEY: FAKE_KEY,
  });
  assert(
    repoSb.source === "supabase",
    "vollkonfigurierte ENV → supabase-Repo",
  );
  __resetBusinessRepoCache__();
  __resetSupabaseClientCache__();

  // ---------------------------------------------------------------------
  // 4. checkDatabaseHealth: businesses-table-Probe + 404 → degraded
  // ---------------------------------------------------------------------
  let captured = "";
  const fetch404: typeof fetch = async (input) => {
    captured = String(input);
    return new Response("not found", { status: 404 });
  };
  const result404 = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: fetch404, probe: "businesses-table" },
  );
  assert(
    captured.includes("/rest/v1/businesses"),
    `URL geht auf businesses, war: ${captured}`,
  );
  assert(
    captured.includes("select=id"),
    "select=id Param gesetzt",
  );
  assert(
    captured.includes("limit=1"),
    "limit=1 Param gesetzt",
  );
  assert(
    result404.status === "degraded",
    "404 auf Tabelle → degraded (Migration fehlt)",
  );
  assert(
    typeof result404.reason === "string" && result404.reason.includes("Migration"),
    "reason erklärt fehlende Migration",
  );
  assert(
    result404.probe === "businesses-table",
    "probe-Tag im Result",
  );

  // 200 → ok mit korrektem probe-Tag
  const fetch200: typeof fetch = async () =>
    new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
  const result200 = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: fetch200, probe: "businesses-table" },
  );
  assert(result200.status === "ok", "200 → ok");
  assert(result200.probe === "businesses-table", "probe-Tag im Result");

  // 401 (RLS) → ok (Server lebt, Policy erlaubt es nicht)
  const fetch401: typeof fetch = async () => new Response("denied", { status: 401 });
  const result401 = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: fetch401, probe: "businesses-table" },
  );
  assert(result401.status === "ok", "401 (RLS) → ok");

  // ---------------------------------------------------------------------
  // 5. Default-probe bleibt rest-root, falls nichts angegeben
  // ---------------------------------------------------------------------
  let defaultUrl = "";
  const fetchCapture: typeof fetch = async (input) => {
    defaultUrl = String(input);
    return new Response("{}", { status: 200 });
  };
  const defaultResult = await checkDatabaseHealth(
    { SUPABASE_URL: FAKE_URL, SUPABASE_ANON_KEY: FAKE_KEY },
    { fetchImpl: fetchCapture },
  );
  assert(
    defaultUrl === `${FAKE_URL}/rest/v1/`,
    `Default-Probe hits rest-root, war: ${defaultUrl}`,
  );
  assert(defaultResult.probe === "rest-root", "Default probe-Tag = rest-root");

  console.log("business-repository smoketest ✅ (~30 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __BUSINESS_REPOSITORY_SMOKETEST__ = { totalAssertions: 30 };
