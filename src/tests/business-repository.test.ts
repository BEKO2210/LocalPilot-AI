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
import { __TEST_ONLY_rowToBusiness__ } from "@/core/database/repositories/business";
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
  // 4b. Row→Business-Mapping inkl. PostgREST-Embeds (Session 38)
  // ---------------------------------------------------------------------
  const fakeRow = {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "demo-shop",
    name: "Demo Shop",
    industry_key: "local_shop",
    package_tier: "silber",
    locale: "de",
    tagline: "Schöne Sachen lokal",
    description: "Wir verkaufen schöne Sachen aus der Region — kommen Sie vorbei und stöbern Sie.",
    logo_url: null,
    cover_image_url: null,
    theme_key: "warm_local",
    primary_color: null,
    secondary_color: null,
    accent_color: null,
    address: {
      street: "Musterstr. 1",
      city: "Musterstadt",
      postalCode: "12345",
      country: "DE",
    },
    contact: {},
    opening_hours: [],
    is_published: true,
    created_at: "2026-01-01T10:00:00.000Z",
    updated_at: "2026-04-27T10:00:00.000Z",
    services: [
      {
        id: "22222222-2222-2222-2222-222222222222",
        business_id: "11111111-1111-1111-1111-111111111111",
        category: null,
        title: "Beratung vor Ort",
        short_description: "Persönliche Beratung im Laden.",
        long_description: "",
        price_label: null,
        duration_label: null,
        image_url: null,
        icon: null,
        tags: ["beratung"],
        is_featured: false,
        is_active: true,
        sort_order: 2,
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        business_id: "11111111-1111-1111-1111-111111111111",
        category: null,
        title: "Online-Shop",
        short_description: "Versand in DE/AT/CH.",
        long_description: "",
        price_label: null,
        duration_label: null,
        image_url: null,
        icon: null,
        tags: [],
        is_featured: true,
        is_active: true,
        sort_order: 1,
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        business_id: "11111111-1111-1111-1111-111111111111",
        category: null,
        title: "Inaktiv",
        short_description: "Sollte ausgefiltert werden.",
        long_description: "",
        price_label: null,
        duration_label: null,
        image_url: null,
        icon: null,
        tags: [],
        is_featured: false,
        is_active: false,
        sort_order: 99,
      },
    ],
    reviews: [
      {
        id: "55555555-5555-5555-5555-555555555555",
        business_id: "11111111-1111-1111-1111-111111111111",
        author_name: "Anja",
        rating: 5,
        text: "Top!",
        source: "google",
        is_published: true,
        created_at: "2026-03-01T10:00:00.000Z",
      },
      {
        id: "66666666-6666-6666-6666-666666666666",
        business_id: "11111111-1111-1111-1111-111111111111",
        author_name: "Geheim",
        rating: 1,
        text: "Sollte nicht erscheinen",
        source: "internal",
        is_published: false,
        created_at: "2026-03-02T10:00:00.000Z",
      },
    ],
  };

  const mapped = __TEST_ONLY_rowToBusiness__(fakeRow);
  assert(mapped.slug === "demo-shop", "Stammdaten kommen durch");
  assert(mapped.services.length === 2, "inaktive Services werden gefiltert");
  assert(
    mapped.services[0]!.title === "Online-Shop",
    "Services nach sort_order — Online-Shop (1) vor Beratung (2)",
  );
  assert(mapped.services[1]!.title === "Beratung vor Ort", "zweiter Eintrag korrekt");
  assert(mapped.services[0]!.tags.length === 0, "leeres tags-Array bleibt leer");
  assert(mapped.reviews.length === 1, "unveröffentlichte Reviews werden gefiltert");
  assert(mapped.reviews[0]!.authorName === "Anja", "Roundtrip Review-Mapping");
  assert(mapped.reviews[0]!.rating === 5, "Rating durchgereicht");

  // Edge-Case: row ohne services/reviews (z. B. wenn RLS alles blockt)
  const minimalRow = { ...fakeRow, services: undefined, reviews: undefined };
  const minimalMapped = __TEST_ONLY_rowToBusiness__(minimalRow);
  assert(minimalMapped.services.length === 0, "fehlende services → []");
  assert(minimalMapped.reviews.length === 0, "fehlende reviews → []");

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

  console.log("business-repository smoketest ✅ (~40 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __BUSINESS_REPOSITORY_SMOKETEST__ = { totalAssertions: 30 };
