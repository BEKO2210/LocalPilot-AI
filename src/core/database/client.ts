/**
 * Supabase-Client (Code-Session 35).
 *
 * ENV-gegated: ohne `SUPABASE_URL` + `SUPABASE_ANON_KEY` liefert
 * `getSupabaseClient` schlicht `null` zurück — die App läuft weiter
 * im Mock-/Local-Storage-Modus. Genauso wie die AI-Provider darf
 * der Datenbank-Layer **niemals** crashen, nur weil ENV fehlt.
 *
 * Wir verwenden `@supabase/supabase-js` direkt (REST + PostgREST).
 * Server-side Auth via `@supabase/ssr` (Cookie-basiert) folgt in
 * einer späteren Session, sobald wir Multi-Tenant-Auth einführen.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseEnv {
  readonly url?: string | undefined;
  readonly anonKey?: string | undefined;
}

export function readSupabaseEnv(
  env: Readonly<Record<string, string | undefined>> = process.env,
): SupabaseEnv {
  const url = env["SUPABASE_URL"]?.trim();
  const anonKey = env["SUPABASE_ANON_KEY"]?.trim();
  return {
    ...(url ? { url } : {}),
    ...(anonKey ? { anonKey } : {}),
  };
}

export function isSupabaseConfigured(env: SupabaseEnv): boolean {
  return Boolean(env.url && env.anonKey);
}

let cached: SupabaseClient | null = null;
let cachedKey: string | null = null;

export function getSupabaseClient(
  env: Readonly<Record<string, string | undefined>> = process.env,
): SupabaseClient | null {
  const sb = readSupabaseEnv(env);
  if (!isSupabaseConfigured(sb)) {
    cached = null;
    cachedKey = null;
    return null;
  }
  const key = `${sb.url}::${sb.anonKey}`;
  if (cached && cachedKey === key) return cached;
  cached = createClient(sb.url!, sb.anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  cachedKey = key;
  return cached;
}

/** Test-Helper: Cache leeren, damit Smoketests deterministisch bleiben. */
export function __resetSupabaseClientCache__(): void {
  cached = null;
  cachedKey = null;
}
