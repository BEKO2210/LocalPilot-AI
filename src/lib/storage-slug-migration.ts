/**
 * Slug-Wechsel-Storage-Migration (Code-Session 60).
 *
 * Konsolidiert die zwei separaten Move-Blöcke aus den Sessions
 * 57 (Logo/Cover) und 59 (Service-Bilder), die in
 * `settings/route.ts` redundant nebeneinander standen, in einen
 * einzigen, vollständig stub-bar testbaren Helper.
 *
 * Aufgaben des Helpers:
 *   1. Logo + Cover des Betriebs vom alten Slug-Prefix auf den
 *      neuen moven (`<old-slug>/{logo,cover}.<ext>` →
 *      `<new-slug>/{logo,cover}.<ext>`) und die zugehörigen
 *      DB-Spalten in *einem* UPDATE einspielen.
 *   2. Service-Bilder pro Row moven
 *      (`<old-slug>/services/<id>.<ext>` →
 *      `<new-slug>/services/<id>.<ext>`) und die DB-Spalten
 *      `services.image_url` einzeln per UPDATE aktualisieren.
 *
 * Move-Failure ist graceful: betroffene URL wird auf `null`
 * gesetzt (kein 404-Bild auf der Public-Site), Counts werden
 * zurückgemeldet. DB-Fehler werden geloggt, blockieren aber
 * nicht — der Slug-Wechsel selbst ist bereits committed.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildPublicUrl,
  extractStoragePath,
  moveStoragePath,
  rewritePathPrefix,
} from "@/lib/storage-cleanup";

export interface MoveCounts {
  readonly moved: number;
  readonly failed: number;
}

export interface SlugMigrationResult {
  readonly logoCover: MoveCounts;
  readonly services: MoveCounts;
}

/**
 * Eingabe-Daten für die Migration. `business.id` brauchen wir
 * für den Service-Lookup, `business.logo_url` /
 * `business.cover_image_url` für die zwei Logo/Cover-Felder.
 */
export interface MigrationInput {
  readonly oldSlug: string;
  readonly newSlug: string;
  readonly bucket: string;
  readonly business: {
    readonly id: string;
    readonly logo_url: string | null;
    readonly cover_image_url: string | null;
  };
}

/**
 * Logger-Interface — Default ist `console.warn`, der Test
 * stubt einen Sammler-Logger ein.
 */
export type WarnLogger = (...args: unknown[]) => void;

export interface MigrationDeps {
  /** Server-Auth-Client (RLS) — für Reads + DB-UPDATEs. */
  readonly supabase: SupabaseClient;
  /**
   * Service-Role-Client — für Storage-Ops. Kann `null` sein,
   * wenn `SUPABASE_SERVICE_ROLE_KEY` fehlt; dann werden alle
   * Moves als `failed` zurückgemeldet, aber der Aufruf
   * blockiert nicht.
   */
  readonly adminClient: SupabaseClient | null;
  /** Optional. Default: `console.warn`. */
  readonly warn?: WarnLogger;
}

/**
 * Einzelne Move-Operation auf einer URL: extrahiert Pfad,
 * baut neuen Pfad, moved und liefert die neue Public-URL —
 * oder `null` bei Fehler / nicht-passender URL.
 */
async function moveOneUrl(
  deps: MigrationDeps,
  bucket: string,
  oldSlug: string,
  newSlug: string,
  currentUrl: string | null,
  warnPrefix: string,
): Promise<{ moved: boolean; newUrl: string | null; skipped: boolean }> {
  if (!currentUrl) return { moved: false, newUrl: null, skipped: true };

  const oldPath = extractStoragePath(currentUrl, bucket);
  if (!oldPath) {
    // Externe URL (Custom-CDN, Unsplash, …) — Owner hat sie
    // bewusst gesetzt, wir lassen sie in Ruhe.
    return { moved: false, newUrl: null, skipped: true };
  }
  const newPath = rewritePathPrefix(oldPath, oldSlug, newSlug);
  if (!newPath) {
    // Pfad-Konvention passt nicht zum erwarteten Slug-Prefix
    // (theoretisch unmöglich, defensive).
    return { moved: false, newUrl: null, skipped: true };
  }

  const moveRes = await moveStoragePath(
    deps.adminClient,
    bucket,
    oldPath,
    newPath,
  );
  if (moveRes.ok) {
    return {
      moved: true,
      newUrl: buildPublicUrl(deps.adminClient, bucket, newPath),
      skipped: false,
    };
  }
  (deps.warn ?? console.warn)(
    `${warnPrefix} ${oldPath}→${newPath} fehlgeschlagen:`,
    moveRes.reason,
  );
  return { moved: false, newUrl: null, skipped: false };
}

/**
 * Migration für Logo + Cover. Ein einziger DB-UPDATE am
 * Ende — falls überhaupt eine URL betroffen ist.
 */
async function migrateLogoCover(
  deps: MigrationDeps,
  input: MigrationInput,
): Promise<MoveCounts> {
  let moved = 0;
  let failed = 0;
  const urlPatch: Record<string, string | null> = {};

  const fields = [
    ["logo_url", input.business.logo_url],
    ["cover_image_url", input.business.cover_image_url],
  ] as const;

  for (const [field, currentUrl] of fields) {
    const r = await moveOneUrl(
      deps,
      input.bucket,
      input.oldSlug,
      input.newSlug,
      currentUrl,
      "[slug-migration:logo-cover]",
    );
    if (r.skipped) continue;
    if (r.moved) {
      urlPatch[field] = r.newUrl;
      moved++;
    } else {
      urlPatch[field] = null;
      failed++;
    }
  }

  if (Object.keys(urlPatch).length > 0) {
    const { error } = await deps.supabase
      .from("businesses")
      .update(urlPatch)
      .eq("slug", input.newSlug);
    if (error) {
      (deps.warn ?? console.warn)(
        "[slug-migration:logo-cover] URL-Patch fehlgeschlagen:",
        error.message,
      );
    }
  }

  return { moved, failed };
}

/**
 * Migration für Service-Bilder. SELECT alle Services mit
 * `image_url`, dann pro Row in `Promise.all` parallel:
 * Move + neue URL sammeln, anschließend pro Row ein
 * UPDATE (auch parallel).
 */
async function migrateServices(
  deps: MigrationDeps,
  input: MigrationInput,
): Promise<MoveCounts> {
  const { data: serviceRows, error: serviceErr } = await deps.supabase
    .from("services")
    .select("id, image_url")
    .eq("business_id", input.business.id)
    .not("image_url", "is", null);

  if (serviceErr) {
    (deps.warn ?? console.warn)(
      "[slug-migration:services] Lookup fehlgeschlagen:",
      serviceErr.message,
    );
    return { moved: 0, failed: 0 };
  }

  const rows = (serviceRows ?? []) as ReadonlyArray<{
    id: string;
    image_url: string | null;
  }>;
  if (rows.length === 0) return { moved: 0, failed: 0 };

  type Patch = { id: string; image_url: string | null };

  const results = await Promise.all(
    rows.map(async (row): Promise<Patch | null> => {
      const r = await moveOneUrl(
        deps,
        input.bucket,
        input.oldSlug,
        input.newSlug,
        row.image_url,
        "[slug-migration:services]",
      );
      if (r.skipped) return null;
      return { id: row.id, image_url: r.moved ? r.newUrl : null };
    }),
  );

  const patches = results.filter((p): p is Patch => p !== null);
  let moved = 0;
  let failed = 0;
  for (const p of patches) {
    if (p.image_url) moved++;
    else failed++;
  }

  await Promise.all(
    patches.map(async (p) => {
      const { error } = await deps.supabase
        .from("services")
        .update({ image_url: p.image_url })
        .eq("id", p.id);
      if (error) {
        (deps.warn ?? console.warn)(
          `[slug-migration:services] URL-Patch für ${p.id} fehlgeschlagen:`,
          error.message,
        );
      }
    }),
  );

  return { moved, failed };
}

/**
 * Top-Level-Migration: ruft Logo/Cover + Services parallel
 * auf. Beide Pfade sind unabhängig (sie touchieren nur
 * unterschiedliche Tabellen-Spalten und unterschiedliche
 * Storage-Pfade), daher ist `Promise.all` race-frei.
 */
export async function migrateBusinessImagesOnSlugChange(
  deps: MigrationDeps,
  input: MigrationInput,
): Promise<SlugMigrationResult> {
  if (input.oldSlug === input.newSlug) {
    return {
      logoCover: { moved: 0, failed: 0 },
      services: { moved: 0, failed: 0 },
    };
  }

  const [logoCover, services] = await Promise.all([
    migrateLogoCover(deps, input),
    migrateServices(deps, input),
  ]);

  return { logoCover, services };
}
