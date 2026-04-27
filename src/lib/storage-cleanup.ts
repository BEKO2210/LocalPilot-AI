/**
 * Storage-Cleanup-Helper (Code-Session 56).
 *
 * Wenn ein Service-Datensatz gelöscht wird (Bulk-DELETE über
 * `PUT /api/businesses/<slug>/services`), bleibt sein Bild im
 * Storage-Bucket als Waise zurück. Supabase hat **keinen**
 * native DELETE-Trigger auf `storage.objects` — die Cleanup-
 * Pflicht liegt bei der Application-Schicht.
 *
 * Dieser Helper kümmert sich um den **URL → Pfad**-Schritt
 * (pure Logic, vollständig testbar) und einen schlanken
 * Storage-Remove-Wrapper, der Errors **graceful** behandelt:
 * Cleanup-Fehler dürfen den fachlichen DB-DELETE nicht
 * blockieren — sonst bleibt der DB-Datensatz stehen, und der
 * User kann die Karte nicht mehr loswerden.
 *
 * Pattern ist später wiederverwendbar für:
 *   - Slug-Wechsel: alte `<old-slug>/logo.png` etc. löschen
 *   - Service-Image-Upload-UI (kommt in einer späteren Session)
 *   - Business-Löschung
 */
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Liest aus einer Public-URL den Bucket-relativen Pfad heraus.
 *
 * Erwartete Formen (offizielle Supabase-Storage-URLs):
 *   - `https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>`
 *   - `https://<ref>.supabase.co/storage/v1/render/image/public/<bucket>/<path>`
 *
 * Gibt `null` zurück, wenn die URL **nicht** zu unserem
 * Bucket gehört (Custom-CDN, externes Hosting, leerer String,
 * malformed URL). Im Cleanup-Pfad bedeutet das: „lass das
 * fremde Bild in Ruhe".
 */
export function extractStoragePath(
  publicUrl: string | null | undefined,
  bucket: string,
): string | null {
  if (!publicUrl || typeof publicUrl !== "string") return null;
  if (!bucket) return null;

  let url: URL;
  try {
    url = new URL(publicUrl);
  } catch {
    return null;
  }

  // Beide Storage-URL-Varianten auf den /<bucket>/<path>-Anteil
  // normalisieren. `pathname` ohne Query/Fragment.
  const path = url.pathname;
  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/render/image/public/${bucket}/`,
  ];
  for (const marker of markers) {
    const idx = path.indexOf(marker);
    if (idx === -1) continue;
    const tail = path.slice(idx + marker.length);
    if (!tail) return null;
    return decodeURIComponent(tail);
  }
  return null;
}

/**
 * Sammelt distinct Storage-Pfade aus einer Liste URLs.
 *
 * - URLs, die nicht zum Bucket gehören, werden ausgelassen.
 * - Doppelte Pfade werden auf einen reduziert (ein File kann
 *   theoretisch von mehreren Services referenziert werden).
 */
export function collectStoragePaths(
  urls: readonly (string | null | undefined)[],
  bucket: string,
): readonly string[] {
  const seen = new Set<string>();
  for (const u of urls) {
    const p = extractStoragePath(u, bucket);
    if (p) seen.add(p);
  }
  return [...seen];
}

// ---------------------------------------------------------------------------
// Storage-Remove-Wrapper
// ---------------------------------------------------------------------------

export interface RemoveResult {
  readonly removed: number;
  readonly failed: number;
  readonly reason: string | null;
}

/**
 * Storage-Remove mit graceful Failure-Mode.
 *
 * Best-effort: Wenn der Storage-Call fehlschlägt (Service-Role
 * fehlt, Bucket weg, Netzwerk), wird das Result `failed`
 * zurückgemeldet — die aufrufende Route entscheidet dann, ob
 * sie das ignoriert oder loggt. **Kein Throw.**
 */
export async function removeStoragePaths(
  adminClient: SupabaseClient | null,
  bucket: string,
  paths: readonly string[],
): Promise<RemoveResult> {
  if (paths.length === 0) {
    return { removed: 0, failed: 0, reason: null };
  }
  if (!adminClient) {
    return {
      removed: 0,
      failed: paths.length,
      reason: "Service-Role-Client nicht verfügbar.",
    };
  }
  try {
    const { error } = await adminClient.storage
      .from(bucket)
      .remove([...paths]);
    if (error) {
      return {
        removed: 0,
        failed: paths.length,
        reason: error.message ?? "Storage-Remove fehlgeschlagen.",
      };
    }
    return { removed: paths.length, failed: 0, reason: null };
  } catch (err) {
    return {
      removed: 0,
      failed: paths.length,
      reason: err instanceof Error ? err.message : "Storage-Remove fehlgeschlagen.",
    };
  }
}

// ---------------------------------------------------------------------------
// Path-Rewrite + Move (Code-Session 57: Slug-Wechsel)
// ---------------------------------------------------------------------------

/**
 * Ersetzt nur den Top-Level-Folder-Prefix eines Pfades.
 *
 * Beispiele:
 *   `studio-haarlinie/logo.png`  + (`studio-haarlinie` →
 *   `studio-haarlinie-2`) → `studio-haarlinie-2/logo.png`
 *
 *   `studio-haarlinie/services/x.png` → `studio-haarlinie-2/services/x.png`
 *
 *   `studio-haarlinie-old/logo.png` mit `oldPrefix=studio-haarlinie`
 *   → null (kein exakter Prefix-Match — schützt vor Kollisionen
 *   bei verwandten Slugs).
 *
 * Empty / falscher Prefix → null.
 */
export function rewritePathPrefix(
  oldPath: string | null | undefined,
  oldPrefix: string,
  newPrefix: string,
): string | null {
  if (!oldPath || !oldPrefix || !newPrefix) return null;
  const expected = `${oldPrefix}/`;
  if (!oldPath.startsWith(expected)) return null;
  return `${newPrefix}/${oldPath.slice(expected.length)}`;
}

export interface MoveResult {
  readonly fromPath: string;
  readonly toPath: string;
  readonly ok: boolean;
  readonly reason: string | null;
}

/**
 * Storage-Move mit graceful Failure-Mode.
 *
 * Verwendet Supabase `storage.from(bucket).move(from, to)` — das
 * ist eine atomare Server-Operation: bei Erfolg ist die Datei
 * unter `to` verfügbar und unter `from` weg. Bei Fehler bleibt
 * der ursprüngliche Pfad unverändert.
 *
 * **Kein Throw** — die aufrufende Route entscheidet bei `ok=false`,
 * ob sie das DB-UPDATE trotzdem durchführt (z.B. URL auf null
 * setzen statt blockieren).
 */
export async function moveStoragePath(
  adminClient: SupabaseClient | null,
  bucket: string,
  fromPath: string,
  toPath: string,
): Promise<MoveResult> {
  if (!adminClient) {
    return {
      fromPath,
      toPath,
      ok: false,
      reason: "Service-Role-Client nicht verfügbar.",
    };
  }
  if (fromPath === toPath) {
    // Move auf identischen Pfad ist no-op und würde von Storage
    // mit „resource already exists" abgelehnt — also vorab
    // abfangen.
    return { fromPath, toPath, ok: true, reason: null };
  }
  try {
    const { error } = await adminClient.storage
      .from(bucket)
      .move(fromPath, toPath);
    if (error) {
      return {
        fromPath,
        toPath,
        ok: false,
        reason: error.message ?? "Storage-Move fehlgeschlagen.",
      };
    }
    return { fromPath, toPath, ok: true, reason: null };
  } catch (err) {
    return {
      fromPath,
      toPath,
      ok: false,
      reason: err instanceof Error ? err.message : "Storage-Move fehlgeschlagen.",
    };
  }
}

/**
 * Liefert die Public-URL für einen Storage-Pfad.
 *
 * Wrapper um `.storage.from(bucket).getPublicUrl(path)` —
 * existiert hier, damit die Route keinen direkten Storage-
 * API-Aufruf braucht. `null` wenn der Client fehlt (Tests /
 * Static-Build).
 */
export function buildPublicUrl(
  adminClient: SupabaseClient | null,
  bucket: string,
  path: string,
): string | null {
  if (!adminClient || !path) return null;
  const { data } = adminClient.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}
