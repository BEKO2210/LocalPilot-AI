/**
 * Smoketest für storage-cleanup-Helper (Code-Session 56).
 *
 * Pure-Function-Test für URL-Parsing + Stub-Tests für den
 * Storage-Remove-Wrapper.
 */

import {
  buildPublicUrl,
  collectStoragePaths,
  extractStoragePath,
  listAllPathsByPrefix,
  moveStoragePath,
  removeAllByPrefix,
  removeStoragePaths,
  rewritePathPrefix,
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

  // -------------------------------------------------------------------
  // 15. rewritePathPrefix: Standard-Fall
  // -------------------------------------------------------------------
  assert(
    rewritePathPrefix("studio-haarlinie/logo.png", "studio-haarlinie", "studio-haarlinie-2") ===
      "studio-haarlinie-2/logo.png",
    "Top-Level-Slug ersetzt",
  );

  // Subfolder bleibt erhalten
  assert(
    rewritePathPrefix(
      "studio-haarlinie/services/x.png",
      "studio-haarlinie",
      "neuer-slug",
    ) === "neuer-slug/services/x.png",
    "Subfolder bleibt nach Prefix-Rewrite",
  );

  // -------------------------------------------------------------------
  // 16. rewritePathPrefix: Kein Prefix-Match → null
  // -------------------------------------------------------------------
  assert(
    rewritePathPrefix(
      "studio-haarlinie-old/logo.png",
      "studio-haarlinie",
      "neuer-slug",
    ) === null,
    "Verwandter Slug ohne `/`-Boundary → null (Kollisions-Schutz)",
  );

  assert(
    rewritePathPrefix("other/logo.png", "studio", "neu") === null,
    "Falscher Top-Level-Folder → null",
  );

  // -------------------------------------------------------------------
  // 17. rewritePathPrefix: defensive Inputs
  // -------------------------------------------------------------------
  assert(rewritePathPrefix(null, "a", "b") === null, "null path → null");
  assert(rewritePathPrefix(undefined, "a", "b") === null, "undefined → null");
  assert(rewritePathPrefix("", "a", "b") === null, "leer → null");
  assert(rewritePathPrefix("a/x.png", "", "b") === null, "leerer oldPrefix → null");
  assert(rewritePathPrefix("a/x.png", "a", "") === null, "leerer newPrefix → null");

  // -------------------------------------------------------------------
  // 18. moveStoragePath: null-Client → graceful
  // -------------------------------------------------------------------
  const moveNoClient = await moveStoragePath(null, BUCKET, "old/x.png", "new/x.png");
  assert(moveNoClient.ok === false, "kein Client → ok=false");
  assert(moveNoClient.reason !== null, "Reason gesetzt");
  assert(moveNoClient.fromPath === "old/x.png", "fromPath durchgereicht");
  assert(moveNoClient.toPath === "new/x.png", "toPath durchgereicht");

  // -------------------------------------------------------------------
  // 19. moveStoragePath: Identische Pfade → no-op ok=true
  // -------------------------------------------------------------------
  const moveNoOp = await moveStoragePath(stubClient, BUCKET, "x/y.png", "x/y.png");
  assert(moveNoOp.ok === true, "identische Pfade → ok=true (no-op)");

  // -------------------------------------------------------------------
  // 20. moveStoragePath: Happy-Path
  // -------------------------------------------------------------------
  let moveCalledFrom: string | null = null;
  let moveCalledTo: string | null = null;
  const moveOkClient = {
    storage: {
      from: () => ({
        move: async (from: string, to: string) => {
          moveCalledFrom = from;
          moveCalledTo = to;
          return { data: null, error: null };
        },
      }),
    },
  } as unknown as SupabaseClient;
  const moveOk = await moveStoragePath(moveOkClient, BUCKET, "a/logo.png", "b/logo.png");
  assert(moveOk.ok === true, "Happy-Path ok=true");
  assert(moveCalledFrom === "a/logo.png", "from korrekt durchgereicht");
  assert(moveCalledTo === "b/logo.png", "to korrekt durchgereicht");

  // -------------------------------------------------------------------
  // 21. moveStoragePath: Storage-Error wird graceful gehandelt
  // -------------------------------------------------------------------
  const moveErrClient = {
    storage: {
      from: () => ({
        move: async () => ({ data: null, error: { message: "Resource not found" } }),
      }),
    },
  } as unknown as SupabaseClient;
  const moveErr = await moveStoragePath(moveErrClient, BUCKET, "a/x.png", "b/x.png");
  assert(moveErr.ok === false, "Error → ok=false");
  assert(moveErr.reason === "Resource not found", "Reason aus error.message");

  // -------------------------------------------------------------------
  // 22. moveStoragePath: Throw wird graceful gehandelt
  // -------------------------------------------------------------------
  const moveThrowClient = {
    storage: {
      from: () => ({
        move: async () => {
          throw new Error("Netzwerk weg");
        },
      }),
    },
  } as unknown as SupabaseClient;
  const moveThrow = await moveStoragePath(moveThrowClient, BUCKET, "a/x.png", "b/x.png");
  assert(moveThrow.ok === false, "Throw → ok=false");
  assert(moveThrow.reason === "Netzwerk weg", "Throw-Message als Reason");

  // -------------------------------------------------------------------
  // 23. buildPublicUrl
  // -------------------------------------------------------------------
  assert(buildPublicUrl(null, BUCKET, "a/x.png") === null, "null Client → null URL");
  assert(buildPublicUrl(stubClient, BUCKET, "") === null, "leerer Pfad → null URL");

  const urlClient = {
    storage: {
      from: () => ({
        getPublicUrl: (p: string) => ({
          data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/${BUCKET}/${p}` },
        }),
      }),
    },
  } as unknown as SupabaseClient;
  const built = buildPublicUrl(urlClient, BUCKET, "neu/logo.png");
  assert(
    built === `https://example.supabase.co/storage/v1/object/public/${BUCKET}/neu/logo.png`,
    "Public-URL korrekt zusammengebaut",
  );

  // -------------------------------------------------------------------
  // 24. listAllPathsByPrefix: Stack-Walker
  // -------------------------------------------------------------------
  // Stub-Storage mit Tree:
  //   slug/logo.png  (Datei)
  //   slug/cover.jpg (Datei)
  //   slug/services/ (Folder)
  //   slug/services/uuid-1.png  (Datei)
  //   slug/services/uuid-2.png  (Datei)
  //   slug/services/sub/ (Folder)
  //   slug/services/sub/deep.png (Datei)
  type Item = { name: string; id: string | null };
  const tree: Record<string, readonly Item[]> = {
    slug: [
      { name: "logo.png", id: "f1" },
      { name: "cover.jpg", id: "f2" },
      { name: "services", id: null },
    ],
    "slug/services": [
      { name: "uuid-1.png", id: "f3" },
      { name: "uuid-2.png", id: "f4" },
      { name: "sub", id: null },
    ],
    "slug/services/sub": [{ name: "deep.png", id: "f5" }],
  };
  const treeClient = {
    storage: {
      from: () => ({
        list: async (
          prefix: string,
          opts: { limit: number; offset: number },
        ) => {
          const items = tree[prefix] ?? [];
          const slice = items.slice(opts.offset, opts.offset + opts.limit);
          return { data: slice, error: null };
        },
      }),
    },
  } as unknown as SupabaseClient;

  const allPaths = await listAllPathsByPrefix(treeClient, BUCKET, "slug");
  assert(allPaths.length === 5, "5 Files insgesamt");
  assert(allPaths.includes("slug/logo.png"), "logo enthalten");
  assert(allPaths.includes("slug/services/uuid-1.png"), "service-uuid-1 enthalten");
  assert(
    allPaths.includes("slug/services/sub/deep.png"),
    "tief verschachtelte Datei enthalten",
  );

  // Trailing-Slash im prefix wird gestrippt
  const trailing = await listAllPathsByPrefix(treeClient, BUCKET, "slug/");
  assert(trailing.length === 5, "Trailing-Slash normalisiert");

  // Empty-Prefix → []
  const noPrefix = await listAllPathsByPrefix(treeClient, BUCKET, "");
  assert(noPrefix.length === 0, "leerer Prefix → []");

  // Null-Client → []
  const listNoClient = await listAllPathsByPrefix(null, BUCKET, "slug");
  assert(listNoClient.length === 0, "null-Client → []");

  // -------------------------------------------------------------------
  // 25. removeAllByPrefix: list + remove integriert
  // -------------------------------------------------------------------
  const removed: string[] = [];
  const integratedClient = {
    storage: {
      from: () => ({
        list: async (
          prefix: string,
          opts: { limit: number; offset: number },
        ) => {
          const items = tree[prefix] ?? [];
          return {
            data: items.slice(opts.offset, opts.offset + opts.limit),
            error: null,
          };
        },
        remove: async (paths: readonly string[]) => {
          for (const p of paths) removed.push(p);
          return { data: null, error: null };
        },
      }),
    },
  } as unknown as SupabaseClient;
  const removeResult = await removeAllByPrefix(integratedClient, BUCKET, "slug");
  assert(removeResult.removed === 5, "5 entfernt");
  assert(removeResult.failed === 0, "0 failed");
  assert(removed.length === 5, "remove() bekam 5 Pfade");

  // Null-Client
  const nullRemove = await removeAllByPrefix(null, BUCKET, "slug");
  assert(nullRemove.failed === 0, "null-Client → 0 failed (nichts zu tun)");
  assert(
    nullRemove.reason !== null && nullRemove.reason.includes("Service-Role"),
    "null-Client → Reason gesetzt",
  );

  // Empty-Tree
  const emptyClient = {
    storage: {
      from: () => ({
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: null, error: null }),
      }),
    },
  } as unknown as SupabaseClient;
  const emptyRemove = await removeAllByPrefix(emptyClient, BUCKET, "no-such-slug");
  assert(emptyRemove.removed === 0, "leerer Tree → 0 removed");
  assert(emptyRemove.failed === 0, "leerer Tree → 0 failed");

  console.log("storage-cleanup smoketest ✅ (~70 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __STORAGE_CLEANUP_SMOKETEST__ = { totalAssertions: 70 };
