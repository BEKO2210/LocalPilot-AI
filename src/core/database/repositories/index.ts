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
import { leadsByBusiness } from "@/data";
import { getSupabaseClient } from "@/core/database/client";
import {
  createMockBusinessRepository,
  createSupabaseBusinessRepository,
  type BusinessRepository,
} from "./business";
import {
  createMockLeadRepository,
  createSupabaseLeadRepository,
  type LeadRepository,
} from "./lead";

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

// ---------------------------------------------------------------------------
// Lead-Repository-Resolver (Code-Session 40)
// ---------------------------------------------------------------------------

let cachedLeadRepo: LeadRepository | null = null;
let cachedLeadSource: DataSource | null = null;

/**
 * Liefert das passende `LeadRepository`. Symmetrisch zum
 * Business-Resolver: Soft-Fallback bei halb-konfigurierter ENV
 * (kein Crash, nur stderr-Hinweis).
 */
export function getLeadRepository(
  env: Readonly<Record<string, string | undefined>> = process.env,
): LeadRepository {
  const source = resolveDataSource(env);
  if (cachedLeadRepo && cachedLeadSource === source) return cachedLeadRepo;

  if (source === "supabase") {
    const client = getSupabaseClient(env);
    if (client) {
      cachedLeadRepo = createSupabaseLeadRepository(client);
      cachedLeadSource = "supabase";
      return cachedLeadRepo;
    }
    if (typeof process !== "undefined" && process.stderr) {
      process.stderr.write(
        "[lead-repo] LP_DATA_SOURCE=supabase, aber kein Client (ENV unvollständig) — fallback auf Mock.\n",
      );
    }
  }
  // Mock-Pfad: mit den vorhandenen Demo-Anfragen seeden, damit das
  // Dashboard im Static-/Mock-Modus die Demo-Leads pro Betrieb sieht.
  // Lead-Submissions zur Laufzeit (Public-Form) werden zusätzlich in
  // den Bucket geschrieben — innerhalb desselben Prozesses sichtbar,
  // bei Server-Restart aber wieder weg (Mock-Modus per Definition).
  cachedLeadRepo = createMockLeadRepository(leadsByBusiness);
  cachedLeadSource = "mock";
  return cachedLeadRepo;
}

export function __resetLeadRepoCache__(): void {
  cachedLeadRepo = null;
  cachedLeadSource = null;
}

export type { BusinessRepository } from "./business";
export type { LeadRepository, NewLeadInput } from "./lead";
export {
  createMockBusinessRepository,
  createSupabaseBusinessRepository,
} from "./business";
export {
  createMockLeadRepository,
  createSupabaseLeadRepository,
  LeadRepositoryError,
  type LeadRepositoryErrorKind,
} from "./lead";
