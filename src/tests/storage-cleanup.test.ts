/**
 * Smoketest für storage-cleanup-Helper (Code-Session 56).
 *
 * Pure-Function-Test für URL-Parsing + Stub-Tests für den
 * Storage-Remove-Wrapper.
 */

import {
  collectStoragePaths,
  extractStoragePath,
  removeStoragePaths,
} from "@/lib/storage-cleanup";
import type { SupabaseClient } from "@supabase/supabase-js";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`storage-cleanup assertion failed: ${message}`);
}

const BUCKET = "business-images";
const PROJECT_REF = "abcdefghijklmnop";
const BASE = `https://${PROJECT_REF}.supabase.co`;

async function main() {
  // -------------------------------------------------------------------
  // 1. extractStoragePath: Standard public URL
  // -------------------------------------------------------------------
  const standard =
    `${BASE}/storage/v1/object/public/${BUCKET}/studio-haarlinie/logo.png`;
  assert(
    extractStoragePath(standard, BUCKET) === "studio-haarlinie/logo.png",
    "Standard-Public-URL → Pfad",
  );

  // -------------------------------------------------------------------
  // 2. extractStoragePath: Render-Image-Transform-URL
  // -------------------------------------------------------------------
  const render =
    `${BASE}/storage/v1/render/image/public/${BUCKET}/studio-haarlinie/cover.webp`;
  assert(
    extractStoragePath(render, BUCKET) === "studio-haarlinie/cover.webp",
    "Render-Image-URL → Pfad",
  );

  // -------------------------------------------------------------------
  // 3. extractStoragePath: URL mit Query-String
  // -------------------------------------------------------------------
  const withQuery =
    `${BASE}/storage/v1/object/public/${BUCKET}/x/y.png?width=200`;
  assert(
    extractStoragePath(withQuery, BUCKET) === "x/y.png",
    "Query-String wird abgeschnitten",
  );

  // -------------------------------------------------------------------
  // 4. extractStoragePath: URL-encodiertes Slug-Segment
  // -------------------------------------------------------------------
  const encoded =
    `${BASE}/storage/v1/object/public/${BUCKET}/m%C3%BCller-werkstatt/logo.jpg`;
  assert(
    extractStoragePath(encoded, BUCKET) === "müller-werkstatt/logo.jpg",
    "URL-Encoding wird decodiert",
  );

  // -------------------------------------------------------------------
  // 5. extractStoragePath: Falscher Bucket → null
  // -------------------------------------------------------------------
  const otherBucket =
    `${BASE}/storage/v1/object/public/other-bucket/foo.png`;
  assert(
    extractStoragePath(otherBucket, BUCKET) === null,
    "Falscher Bucket → null",
  );

  // -------------------------------------------------------------------
  // 6. extractStoragePath: Custom-CDN / externes Hosting → null
  // -------------------------------------------------------------------
  assert(
    extractStoragePath("https://cdn.example.com/foo.png", BUCKET) === null,
    "Custom-CDN-URL → null",
  );
  assert(
    extractStoragePath("https://images.unsplash.com/photo-1234", BUCKET) === null,
    "Unsplash-URL → null",
  );

  // -------------------------------------------------------------------
  // 7. extractStoragePath: Defensive Inputs
  // -------------------------------------------------------------------
  assert(extractStoragePath(null, BUCKET) === null, "null → null");
  assert(extractStoragePath(undefined, BUCKET) === null, "undefined → null");
  assert(extractStoragePath("", BUCKET) === null, "leer → null");
  assert(extractStoragePath("not-a-url", BUCKET) === null, "kein URL → null");
  assert(
    extractStoragePath(standard, "") === null,
    "leerer Bucket → null (kein versehentliches Match)",
  );

  // Pfad ohne Tail (URL endet auf bucket/) → null
  assert(
    extractStoragePath(
      `${BASE}/storage/v1/object/public/${BUCKET}/`,
      BUCKET,
    ) === null,
    "URL ohne Tail → null",
  );

  // -------------------------------------------------------------------
  // 8. collectStoragePaths: Mischung + Dedupe
  // -------------------------------------------------------------------
  const collected = collectStoragePaths(
    [
      `${BASE}/storage/v1/object/public/${BUCKET}/a/b.png`,
      `${BASE}/storage/v1/object/public/${BUCKET}/a/b.png`, // Duplikat
      "https://cdn.example.com/foo.png", // extern
      null,
      undefined,
      "",
      `${BASE}/storage/v1/object/public/${BUCKET}/c/d.webp`,
    ],
    BUCKET,
  );
  assert(collected.length === 2, "Dedupe + Skip externer URLs");
  assert(collected.includes("a/b.png"), "a/b.png drin");
  assert(collected.includes("c/d.webp"), "c/d.webp drin");

  // -------------------------------------------------------------------
  // 9. collectStoragePaths: leere Liste
  // -------------------------------------------------------------------
  assert(
    collectStoragePaths([], BUCKET).length === 0,
    "Leere Liste → leeres Array",
  );

  // -------------------------------------------------------------------
  // 10. removeStoragePaths: Empty-Path-Liste → no-op
  // -------------------------------------------------------------------
  const stubClient = {
    storage: {
      from: () => ({
        remove: async () => ({ data: null, error: null }),
      }),
    },
  } as unknown as SupabaseClient;
  const empty = await removeStoragePaths(stubClient, BUCKET, []);
  assert(empty.removed === 0 && empty.failed === 0, "leer = no-op");
  assert(empty.reason === null, "kein Reason");

  // -------------------------------------------------------------------
  // 11. removeStoragePaths: null-Client → graceful failed
  // -------------------------------------------------------------------
  const noClient = await removeStoragePaths(null, BUCKET, ["a/b.png"]);
  assert(noClient.removed === 0, "kein Client → 0 entfernt");
  assert(noClient.failed === 1, "kein Client → 1 failed");
  assert(
    noClient.reason !== null && noClient.reason.length > 0,
    "Reason gesetzt",
  );

  // -------------------------------------------------------------------
  // 12. removeStoragePaths: Happy-Path
  // -------------------------------------------------------------------
  let removeCalledWith: readonly string[] | null = null;
  let removeCalledBucket: string | null = null;
  const successClient = {
    storage: {
      from: (bucket: string) => {
        removeCalledBucket = bucket;
        return {
          remove: async (paths: readonly string[]) => {
            removeCalledWith = paths;
            return { data: null, error: null };
          },
        };
      },
    },
  } as unknown as SupabaseClient;
  const ok = await removeStoragePaths(successClient, BUCKET, [
    "a/b.png",
    "c/d.webp",
  ]);
  assert(ok.removed === 2, "2 entfernt");
  assert(ok.failed === 0, "0 failed");
  assert(removeCalledBucket === BUCKET, "richtiger Bucket");
  assert(
    Array.isArray(removeCalledWith) &&
      (removeCalledWith as string[]).length === 2,
    "Pfad-Array übergeben",
  );

  // -------------------------------------------------------------------
  // 13. removeStoragePaths: Storage-Error wird graceful gehandelt
  // -------------------------------------------------------------------
  const errClient = {
    storage: {
      from: () => ({
        remove: async () => ({
          data: null,
          error: { message: "Bucket weg" },
        }),
      }),
    },
  } as unknown as SupabaseClient;
  const failed = await removeStoragePaths(errClient, BUCKET, [
    "a/b.png",
  ]);
  assert(failed.removed === 0, "0 entfernt bei Error");
  assert(failed.failed === 1, "failed = paths.length");
  assert(failed.reason === "Bucket weg", "Reason aus Error");

  // -------------------------------------------------------------------
  // 14. removeStoragePaths: Throw wird graceful gehandelt
  // -------------------------------------------------------------------
  const throwClient = {
    storage: {
      from: () => ({
        remove: async () => {
          throw new Error("Netzwerk-Abriss");
        },
      }),
    },
  } as unknown as SupabaseClient;
  const thrown = await removeStoragePaths(throwClient, BUCKET, ["x.png"]);
  assert(thrown.removed === 0, "throw → 0 entfernt");
  assert(thrown.failed === 1, "throw → failed");
  assert(thrown.reason === "Netzwerk-Abriss", "Throw-Message als Reason");

  console.log("storage-cleanup smoketest ✅ (~30 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __STORAGE_CLEANUP_SMOKETEST__ = { totalAssertions: 30 };
