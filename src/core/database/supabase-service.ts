/**
 * Service-Role-Supabase-Client (Code-Session 45).
 *
 * Bypasst RLS — wird nur für Onboarding-Pfade gebraucht, wo das
 * Henne-Ei-Problem aus Migration 0007 zuschlägt: ein neuer Betrieb
 * hat noch keinen Owner, also keinen Insert-Berechtigten. Der
 * Service-Role-Client umgeht diese Lücke.
 *
 * **Sicherheitswichtig**:
 * - `SUPABASE_SERVICE_ROLE_KEY` darf NIEMALS in Client-Bundles
 *   landen. Diese Datei wird **ausschließlich** in Server-Routen,
 *   Server Components oder Server Actions importiert. ESLint/TS
 *   schützen das nicht — Disziplin der Entwickler ist Pflicht.
 * - `auth.persistSession`/`autoRefreshToken`/`detectSessionInUrl`
 *   sind alle aus, damit der Service-Role-Client keinen Session-
 *   State führt (er IST schon "alle Rechte").
 * - Wenn die ENV nicht konfiguriert ist, liefert der Helper `null`.
 *   Aufrufer geben dann eine 503 zurück, statt zu crashen.
 */

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, readSupabaseEnv } from "./client";

let cached: SupabaseClient | null = null;
let cachedKey: string | null = null;

export function getServiceRoleClient(
  env: Readonly<Record<string, string | undefined>> = process.env,
): SupabaseClient | null {
  const sb = readSupabaseEnv(env);
  const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"]?.trim();
  if (!isSupabaseConfigured(sb) || !serviceKey || serviceKey.length === 0) {
    cached = null;
    cachedKey = null;
    return null;
  }
  const cacheKey = `${sb.url}::${serviceKey}`;
  if (cached && cachedKey === cacheKey) return cached;
  cached = createClient(sb.url!, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  cachedKey = cacheKey;
  return cached;
}

/** Test-Helper: Cache leeren. */
export function __resetServiceRoleClientCache__(): void {
  cached = null;
  cachedKey = null;
}

/** Pure-Helper für Aufrufer, die nur die Konfig-Prüfung brauchen. */
export function isServiceRoleConfigured(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const sb = readSupabaseEnv(env);
  const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"]?.trim();
  return isSupabaseConfigured(sb) && Boolean(serviceKey && serviceKey.length > 0);
}
