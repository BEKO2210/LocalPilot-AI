/**
 * Browser-Side Supabase-Client (Code-Session 42).
 *
 * Liest aus `NEXT_PUBLIC_SUPABASE_*`-ENV (Build-time inlined). Auf
 * dem Server NIE benutzen — der Browser-Client schreibt Cookies via
 * `document.cookie`, was server-seitig nicht funktioniert.
 *
 * Für Login-/Logout-Calls aus Client Components.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Liefert einen Singleton-Browser-Client oder `null`, wenn die
 * `NEXT_PUBLIC_SUPABASE_*`-ENVs nicht gesetzt sind.
 */
export function getBrowserSupabaseClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  if (!url || !anonKey) return null;
  cached = createBrowserClient(url, anonKey);
  return cached;
}
