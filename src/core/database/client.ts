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

/**
 * Liest die Supabase-ENV mit Fallback-Kette:
 *   `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL`
 *   `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `SUPABASE_ANON_KEY`
 *
 * `NEXT_PUBLIC_*` ist auf dem Browser sichtbar (Next.js inlined die
 * Werte in Client-Bundles). Der anon-Key ist by-design öffentlich,
 * deshalb ist das ok — die echte Sicherheit kommt über RLS.
 *
 * Server-Code akzeptiert beide Varianten, damit alte Setups weiter
 * funktionieren.
 */
function pickFirst(
  env: Readonly<Record<string, string | undefined>>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const v = env[key]?.trim();
    if (v && v.length > 0) return v;
  }
  return undefined;
}

export function readSupabaseEnv(
  env: Readonly<Record<string, string | undefined>> = process.env,
): SupabaseEnv {
  const url = pickFirst(env, ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]);
  const anonKey = pickFirst(env, [
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  ]);
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
