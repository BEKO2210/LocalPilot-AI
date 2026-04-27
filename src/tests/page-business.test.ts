/**
 * Smoketest für den Page-Business-Loader (Code-Session 47).
 *
 * Wir testen den Mock-Pfad mit injiziertem Repository — der
 * Supabase-Pfad wird über den Repository-Smoketest gedeckt
 * (`business-repository.test.ts`). Hier prüfen wir die
 * Page-Konvention:
 *   - vorhandener Slug → Business kommt zurück
 *   - unbekannter Slug → `notFound()` wird geworfen
 *   - listSlugParams → Array of `{ slug }`
 *
 * `notFound()` aus `next/navigation` wirft bei der ersten
 * Page-Render-Stufe. Im Test rufen wir es ohne React-Runtime
 * auf — Next.js wirft dann eine spezielle Exception, die wir
 * via `try/catch` fangen.
 */

import {
  createMockBusinessRepository,
  type BusinessRepository,
} from "@/core/database/repositories";
import { mockBusinesses } from "@/data/mock-businesses";
import {
  listBusinessSlugsForPages,
  listSlugParams,
  loadBusinessOrNotFound,
} from "@/lib/page-business";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`page-business assertion failed: ${message}`);
}

const VALID_SLUG = mockBusinesses[0]!.slug;

async function main() {
  const repo: BusinessRepository = createMockBusinessRepository({
    businesses: mockBusinesses,
  });

  // ---------------------------------------------------------------------
  // 1. Vorhandener Slug → Business
  // ---------------------------------------------------------------------
  const business = await loadBusinessOrNotFound(VALID_SLUG, repo);
  assert(business.slug === VALID_SLUG, "Business mit Slug zurück");
  assert(typeof business.name === "string" && business.name.length > 0, "Name vorhanden");

  // ---------------------------------------------------------------------
  // 2. Unbekannter Slug → notFound() wirft
  // ---------------------------------------------------------------------
  let caught: unknown = null;
  try {
    await loadBusinessOrNotFound("does-not-exist-zzz", repo);
  } catch (err) {
    caught = err;
  }
  assert(caught !== null, "notFound() hat geworfen");
  // Next.js' notFound() wirft eine Error-Subclass mit `digest`
  // beginnend mit `NEXT_NOT_FOUND` (Konvention).
  const digest =
    caught && typeof caught === "object" && "digest" in caught
      ? String((caught as { digest?: unknown }).digest)
      : "";
  assert(
    digest.includes("NEXT_NOT_FOUND") || digest.includes("NEXT_HTTP_ERROR"),
    `Wurf ist Next.js-NotFound (digest=${digest || "(none)"})`,
  );

  // ---------------------------------------------------------------------
  // 3. listBusinessSlugsForPages → vollständige Slug-Liste
  // ---------------------------------------------------------------------
  const slugs = await listBusinessSlugsForPages(repo);
  assert(
    slugs.length === mockBusinesses.length,
    "alle Mock-Slugs werden geliefert",
  );
  assert(slugs.includes(VALID_SLUG), "Slug aus Mock ist drin");
  assert(
    slugs.every((s) => typeof s === "string" && s.length > 0),
    "alle Slugs sind nicht-leere Strings",
  );

  // ---------------------------------------------------------------------
  // 4. listSlugParams → Array of `{ slug }` für generateStaticParams
  // ---------------------------------------------------------------------
  // Achtung: listSlugParams nimmt aktuell keinen Repo-Override (nutzt
  // den globalen Resolver, der ohne ENV auf Mock fällt). Wir checken
  // nur, dass die Form stimmt und alles strings sind.
  const params = await listSlugParams();
  assert(Array.isArray(params), "Array");
  assert(params.length > 0, "mindestens ein Eintrag");
  assert(
    params.every(
      (p) =>
        typeof p === "object" &&
        p !== null &&
        typeof p.slug === "string" &&
        p.slug.length > 0,
    ),
    "alle Einträge haben .slug-String",
  );

  // ---------------------------------------------------------------------
  // 5. Privacy: kein versehentlicher Mock-Daten-Leak via String-Match
  // (Defense-in-Depth — falls jemand mal die Pure-Schicht erweitert
  //  und versehentlich Konsens-Daten oder Lead-Daten anhängt)
  // ---------------------------------------------------------------------
  const businessJson = JSON.stringify(business);
  // Es wäre absurd, aber wir wollen nicht, dass z. B. Service-Role-
  // Keys hier landen. Einfach prüfen, dass keine bekannten ENV-Namen
  // vorkommen.
  assert(
    !businessJson.includes("SUPABASE_SERVICE_ROLE_KEY"),
    "kein Service-Key-Leak im Business-Output",
  );
  assert(
    !businessJson.includes("LP_AI_API_KEY"),
    "kein API-Key-Leak im Business-Output",
  );

  console.log("page-business smoketest ✅ (~10 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __PAGE_BUSINESS_SMOKETEST__ = { totalAssertions: 10 };
