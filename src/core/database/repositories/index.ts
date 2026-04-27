/**
 * Repository-Resolver (Code-Session 37).
 *
 * Wählt zur Laufzeit, ob die Mock- oder die Supabase-Implementierung
 * eines Repositories benutzt wird. Steuerung via ENV:
 *
 *   - `LP_DATA_SOURCE=supabase` + Supabase-Client erfolgreich erstellt
 *     → Supabase-Pfad.
 *   - sonst → Mock-Pfad (Default, damit alles ohne Backend läuft).
 *
 * Die explizite ENV-Variable verhindert, dass ein versehentlich
 * gesetztes `SUPABASE_URL` den Public-Site-Build sofort auf eine
 * leere Tabelle umlenkt — der Switch ist explizit.
 */

import { mockBusinesses } from "@/data/mock-businesses";
import { getSupabaseClient } from "@/core/database/client";
import {
  createMockBusinessRepository,
  createSupabaseBusinessRepository,
  type BusinessRepository,
} from "./business";

export type DataSource = "mock" | "supabase";

export function resolveDataSource(
  env: Readonly<Record<string, string | undefined>> = process.env,
): DataSource {
  const raw = env["LP_DATA_SOURCE"]?.trim().toLowerCase();
  return raw === "supabase" ? "supabase" : "mock";
}

let cachedRepo: BusinessRepository | null = null;
let cachedSource: DataSource | null = null;

/**
 * Liefert das passende `BusinessRepository`.
 *
 * **Fallback-Verhalten**: wenn `LP_DATA_SOURCE=supabase` gesetzt ist,
 * aber kein gültiger Supabase-Client erstellt werden kann (fehlende
 * `SUPABASE_URL` / `SUPABASE_ANON_KEY`), fällt der Resolver hart auf
 * Mock zurück und loggt einen Hinweis. Damit crasht weder Build noch
 * Public-Site, falls die ENV halb-konfiguriert ist.
 */
export function getBusinessRepository(
  env: Readonly<Record<string, string | undefined>> = process.env,
): BusinessRepository {
  const source = resolveDataSource(env);
  if (cachedRepo && cachedSource === source) return cachedRepo;

  if (source === "supabase") {
    const client = getSupabaseClient(env);
    if (client) {
      cachedRepo = createSupabaseBusinessRepository(client);
      cachedSource = "supabase";
      return cachedRepo;
    }
    // Soft-Fallback. Sichtbar im Server-Log, kein Crash.
    if (typeof process !== "undefined" && process.stderr) {
      process.stderr.write(
        "[business-repo] LP_DATA_SOURCE=supabase, aber kein Client (ENV unvollständig) — fallback auf Mock.\n",
      );
    }
  }
  cachedRepo = createMockBusinessRepository({ businesses: mockBusinesses });
  cachedSource = "mock";
  return cachedRepo;
}

/** Test-Helper: Resolver-Cache leeren. */
export function __resetBusinessRepoCache__(): void {
  cachedRepo = null;
  cachedSource = null;
}

export type { BusinessRepository } from "./business";
export {
  createMockBusinessRepository,
  createSupabaseBusinessRepository,
} from "./business";
