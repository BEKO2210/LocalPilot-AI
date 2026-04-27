/**
 * Smoketest für Slug-Migration-Helper (Code-Session 60).
 *
 * Stub-Client-basiert: simuliert sowohl den Server-Auth-Client
 * (Reads + Updates) als auch den Service-Role-Client
 * (Storage-Move + getPublicUrl). Sammelt alle Aufrufe in
 * Variablen für die Asserts.
 */

import { migrateBusinessImagesOnSlugChange } from "@/lib/storage-slug-migration";
import type { SupabaseClient } from "@supabase/supabase-js";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`storage-slug-migration assertion failed: ${message}`);
}

const BUCKET = "business-images";
const OLD_SLUG = "studio-haarlinie";
const NEW_SLUG = "haarlinie-2";
const BUSINESS_ID = "11111111-1111-4111-8111-111111111111";
const PUBLIC_BASE = "https://abc.supabase.co/storage/v1/object/public";

function urlFor(path: string): string {
  return `${PUBLIC_BASE}/${BUCKET}/${path}`;
}

interface CapturedMove {
  bucket: string;
  from: string;
  to: string;
}
interface CapturedDbUpdate {
  table: string;
  patch: Record<string, unknown>;
  filter: { col: string; val: unknown };
}

function makeStubs(opts: {
  serviceRows?: ReadonlyArray<{ id: string; image_url: string | null }>;
  serviceLookupError?: { message: string };
  servicesUpdateError?: boolean;
  businessesUpdateError?: boolean;
  moveResults?: Map<string, { error: { message: string } | null }>;
  adminClient?: SupabaseClient | null;
}) {
  const moves: CapturedMove[] = [];
  const dbUpdates: CapturedDbUpdate[] = [];
  const warnings: string[] = [];
  const moveResults = opts.moveResults ?? new Map();

  const adminClient =
    opts.adminClient !== undefined
      ? opts.adminClient
      : ({
          storage: {
            from: (bucket: string) => ({
              move: async (from: string, to: string) => {
                moves.push({ bucket, from, to });
                const r = moveResults.get(from);
                if (r?.error) return { data: null, error: r.error };
                return { data: null, error: null };
              },
              getPublicUrl: (p: string) => ({
                data: { publicUrl: `${PUBLIC_BASE}/${bucket}/${p}` },
              }),
            }),
          },
        } as unknown as SupabaseClient);

  const supabase = {
    from: (table: string) => {
      if (table === "services") {
        return {
          select: () => ({
            eq: () => ({
              not: () => {
                if (opts.serviceLookupError) {
                  return Promise.resolve({
                    data: null,
                    error: opts.serviceLookupError,
                  });
                }
                return Promise.resolve({
                  data: opts.serviceRows ?? [],
                  error: null,
                });
              },
            }),
          }),
          update: (patch: Record<string, unknown>) => ({
            eq: (col: string, val: unknown) => {
              dbUpdates.push({ table, patch, filter: { col, val } });
              if (opts.servicesUpdateError) {
                return Promise.resolve({
                  data: null,
                  error: { message: "Services-DB-Error" },
                });
              }
              return Promise.resolve({ data: null, error: null });
            },
          }),
        };
      }
      // businesses-Update
      return {
        update: (patch: Record<string, unknown>) => ({
          eq: (col: string, val: unknown) => {
            dbUpdates.push({ table, patch, filter: { col, val } });
            if (opts.businessesUpdateError) {
              return Promise.resolve({
                data: null,
                error: { message: "Businesses-DB-Error" },
              });
            }
            return Promise.resolve({ data: null, error: null });
          },
        }),
      };
    },
  } as unknown as SupabaseClient;

  return {
    deps: {
      supabase,
      adminClient,
      warn: (...args: unknown[]) => {
        warnings.push(args.map(String).join(" "));
      },
    },
    moves,
    dbUpdates,
    warnings,
  };
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. No-op: oldSlug === newSlug
  // ---------------------------------------------------------------------
  const noop = makeStubs({});
  const noopRes = await migrateBusinessImagesOnSlugChange(noop.deps, {
    oldSlug: OLD_SLUG,
    newSlug: OLD_SLUG, // gleich
    bucket: BUCKET,
    business: { id: BUSINESS_ID, logo_url: urlFor(`${OLD_SLUG}/logo.png`), cover_image_url: null },
  });
  assert(noopRes.logoCover.moved === 0, "no-op: 0 logo/cover moved");
  assert(noopRes.services.moved === 0, "no-op: 0 services moved");
  assert(noop.moves.length === 0, "no-op: keine Storage-Calls");
  assert(noop.dbUpdates.length === 0, "no-op: keine DB-Updates");

  // ---------------------------------------------------------------------
  // 2. Logo + Cover happy path, keine Services
  // ---------------------------------------------------------------------
  const happy = makeStubs({ serviceRows: [] });
  const happyRes = await migrateBusinessImagesOnSlugChange(happy.deps, {
    oldSlug: OLD_SLUG,
    newSlug: NEW_SLUG,
    bucket: BUCKET,
    business: {
      id: BUSINESS_ID,
      logo_url: urlFor(`${OLD_SLUG}/logo.png`),
      cover_image_url: urlFor(`${OLD_SLUG}/cover.jpg`),
    },
  });
  assert(happyRes.logoCover.moved === 2, "Happy: 2 Logo+Cover gemoved");
  assert(happyRes.logoCover.failed === 0, "Happy: 0 failed");
  assert(happyRes.services.moved === 0, "Keine Services");
  assert(happy.moves.length === 2, "2 Storage-Move-Calls");
  assert(
    happy.moves.some((m) => m.from === `${OLD_SLUG}/logo.png` && m.to === `${NEW_SLUG}/logo.png`),
    "Logo-Pfad wurde gemoved",
  );
  assert(
    happy.moves.some((m) => m.from === `${OLD_SLUG}/cover.jpg` && m.to === `${NEW_SLUG}/cover.jpg`),
    "Cover-Pfad wurde gemoved",
  );

  // Genau ein DB-Update auf businesses (Logo+Cover in einem Patch)
  const bizUpdates = happy.dbUpdates.filter((u) => u.table === "businesses");
  assert(bizUpdates.length === 1, "businesses: 1 UPDATE für Logo+Cover");
  assert(
    bizUpdates[0]!.patch["logo_url"] === urlFor(`${NEW_SLUG}/logo.png`),
    "logo_url im Patch korrekt",
  );
  assert(
    bizUpdates[0]!.patch["cover_image_url"] === urlFor(`${NEW_SLUG}/cover.jpg`),
    "cover_image_url im Patch korrekt",
  );
  assert(
    bizUpdates[0]!.filter.col === "slug" && bizUpdates[0]!.filter.val === NEW_SLUG,
    "Filter auf neuem Slug",
  );

  // ---------------------------------------------------------------------
  // 3. Externe URL wird in Ruhe gelassen
  // ---------------------------------------------------------------------
  const ext = makeStubs({ serviceRows: [] });
  await migrateBusinessImagesOnSlugChange(ext.deps, {
    oldSlug: OLD_SLUG,
    newSlug: NEW_SLUG,
    bucket: BUCKET,
    business: {
      id: BUSINESS_ID,
      logo_url: "https://images.unsplash.com/photo-x.jpg",
      cover_image_url: null,
    },
  });
  assert(ext.moves.length === 0, "externe URL → keine Move-Calls");
  assert(
    ext.dbUpdates.filter((u) => u.table === "businesses").length === 0,
    "externe URL → keine businesses-UPDATE",
  );

  // ---------------------------------------------------------------------
  // 4. Move-Failure: URL wird auf null gesetzt
  // ---------------------------------------------------------------------
  const failPath = `${OLD_SLUG}/logo.png`;
  const errMap = new Map([[failPath, { error: { message: "Source not found" } }]]);
  const movefail = makeStubs({ serviceRows: [], moveResults: errMap });
  const failRes = await migrateBusinessImagesOnSlugChange(movefail.deps, {
    oldSlug: OLD_SLUG,
    newSlug: NEW_SLUG,
    bucket: BUCKET,
    business: {
      id: BUSINESS_ID,
      logo_url: urlFor(failPath),
      cover_image_url: null,
    },
  });
  assert(failRes.logoCover.moved === 0, "0 moved bei Failure");
  assert(failRes.logoCover.failed === 1, "1 failed");
  const failBizUpdates = movefail.dbUpdates.filter((u) => u.table === "businesses");
  assert(failBizUpdates.length === 1, "DB-UPDATE läuft trotzdem (URL=null)");
  assert(
    failBizUpdates[0]!.patch["logo_url"] === null,
    "logo_url=null nach Move-Failure",
  );
  assert(
    movefail.warnings.some((w) => w.includes("logo-cover") && w.includes("Source not found")),
    "Warning für Move-Failure geloggt",
  );

  // ---------------------------------------------------------------------
  // 5. Service-Bilder: alle 3 happy
  // ---------------------------------------------------------------------
  const svcRows = [
    { id: "aaa11111-1111-4111-8111-111111111111", image_url: urlFor(`${OLD_SLUG}/services/aaa11111-1111-4111-8111-111111111111.png`) },
    { id: "bbb22222-2222-4222-8222-222222222222", image_url: urlFor(`${OLD_SLUG}/services/bbb22222-2222-4222-8222-222222222222.jpg`) },
    { id: "ccc33333-3333-4333-8333-333333333333", image_url: urlFor(`${OLD_SLUG}/services/ccc33333-3333-4333-8333-333333333333.webp`) },
  ];
  const svc = makeStubs({ serviceRows: svcRows });
  const svcRes = await migrateBusinessImagesOnSlugChange(svc.deps, {
    oldSlug: OLD_SLUG,
    newSlug: NEW_SLUG,
    bucket: BUCKET,
    business: { id: BUSINESS_ID, logo_url: null, cover_image_url: null },
  });
  assert(svcRes.services.moved === 3, "3 Service-Bilder gemoved");
  assert(svcRes.services.failed === 0, "0 service failed");
  assert(svc.moves.length === 3, "3 Storage-Moves");

  // 3 separate UPDATEs auf services (eines pro Row)
  const svcDbUpdates = svc.dbUpdates.filter((u) => u.table === "services");
  assert(svcDbUpdates.length === 3, "3 services-UPDATEs (pro Row)");
  for (const row of svcRows) {
    const u = svcDbUpdates.find((x) => x.filter.val === row.id);
    assert(u !== undefined, `UPDATE für service ${row.id}`);
    assert(
      typeof u!.patch["image_url"] === "string" &&
        (u!.patch["image_url"] as string).includes(NEW_SLUG),
      "neue image_url enthält neuen Slug",
    );
  }

  // ---------------------------------------------------------------------
  // 6. Service-Bilder: einer failed → URL=null, andere ok
  // ---------------------------------------------------------------------
  const failedSvcPath = `${OLD_SLUG}/services/bbb22222-2222-4222-8222-222222222222.jpg`;
  const svcErrMap = new Map([[failedSvcPath, { error: { message: "Quota exceeded" } }]]);
  const svcMixed = makeStubs({ serviceRows: svcRows, moveResults: svcErrMap });
  const svcMixedRes = await migrateBusinessImagesOnSlugChange(svcMixed.deps, {
    oldSlug: OLD_SLUG,
    newSlug: NEW_SLUG,
    bucket: BUCKET,
    business: { id: BUSINESS_ID, logo_url: null, cover_image_url: null },
  });
  assert(svcMixedRes.services.moved === 2, "2 Service-Bilder ok");
  assert(svcMixedRes.services.failed === 1, "1 Service-Bild failed");

  const failedUpdate = svcMixed.dbUpdates.find(
    (u) => u.table === "services" && u.filter.val === "bbb22222-2222-4222-8222-222222222222",
  );
  assert(failedUpdate !== undefined, "UPDATE für failed-row");
  assert(
    failedUpdate!.patch["image_url"] === null,
    "image_url=null bei Move-Failure",
  );

  // ---------------------------------------------------------------------
  // 7. Service-Lookup-Error wird graceful behandelt
  // ---------------------------------------------------------------------
  const lookupFail = makeStubs({
    serviceLookupError: { message: "RLS-Block" },
  });
  const lookupRes = await migrateBusinessImagesOnSlugChange(lookupFail.deps, {
    oldSlug: OLD_SLUG,
    newSlug: NEW_SLUG,
    bucket: BUCKET,
    business: { id: BUSINESS_ID, logo_url: null, cover_image_url: null },
  });
  assert(lookupRes.services.moved === 0 && lookupRes.services.failed === 0, "Lookup-Error → 0/0");
  assert(
    lookupFail.warnings.some((w) => w.includes("Lookup")),
    "Lookup-Warning geloggt",
  );

  // ---------------------------------------------------------------------
  // 8. Null adminClient: alle Moves failed (graceful)
  // ---------------------------------------------------------------------
  const noAdmin = makeStubs({
    adminClient: null,
    serviceRows: [
      { id: "aaa11111-1111-4111-8111-111111111111", image_url: urlFor(`${OLD_SLUG}/services/aaa11111-1111-4111-8111-111111111111.png`) },
    ],
  });
  const noAdminRes = await migrateBusinessImagesOnSlugChange(noAdmin.deps, {
    oldSlug: OLD_SLUG,
    newSlug: NEW_SLUG,
    bucket: BUCKET,
    business: {
      id: BUSINESS_ID,
      logo_url: urlFor(`${OLD_SLUG}/logo.png`),
      cover_image_url: null,
    },
  });
  assert(noAdminRes.logoCover.failed === 1, "kein Admin-Client → logo failed");
  assert(noAdminRes.services.failed === 1, "kein Admin-Client → service failed");

  // ---------------------------------------------------------------------
  // 9. DB-Update-Error wird geloggt, ergebnis-Counts unverändert
  // ---------------------------------------------------------------------
  const dbFail = makeStubs({ serviceRows: [], businessesUpdateError: true });
  const dbFailRes = await migrateBusinessImagesOnSlugChange(dbFail.deps, {
    oldSlug: OLD_SLUG,
    newSlug: NEW_SLUG,
    bucket: BUCKET,
    business: {
      id: BUSINESS_ID,
      logo_url: urlFor(`${OLD_SLUG}/logo.png`),
      cover_image_url: null,
    },
  });
  assert(dbFailRes.logoCover.moved === 1, "Move ist erfolgreich");
  assert(
    dbFail.warnings.some((w) => w.includes("URL-Patch") && w.includes("Businesses-DB-Error")),
    "DB-Warning geloggt",
  );

  console.log("storage-slug-migration smoketest ✅ (~38 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __STORAGE_SLUG_MIGRATION_SMOKETEST__ = { totalAssertions: 38 };
