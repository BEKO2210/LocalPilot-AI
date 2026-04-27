/**
 * Server-Side Supabase-Client (Code-Session 42).
 *
 * Liest und schreibt Supabase-Auth-Cookies via Next.js `cookies()`-API.
 * Wird in Server Components, Server Actions und Route Handlers benutzt.
 *
 * **Wichtig**: Server Components dürfen Cookies **lesen**, aber nicht
 * **schreiben**. Der Set-Pfad ist deshalb in einem try/catch — Lese-
 * Pfade aus Server Components bleiben funktional, wenn `setAll` mit
 * einem stillen Fail durchrutscht. Schreib-Operationen (Login,
 * Callback, Logout) müssen aus Route Handlers oder Server Actions
 * kommen, die Cookies setzen dürfen.
 *
 * Auth-Status: **immer** über `auth.getUser()` validieren — nicht
 * `getSession()`. `getSession()` liest nur aus den Cookies, die
 * spoof-bar sind. `getUser()` validiert das Token gegen Supabase.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, readSupabaseEnv } from "./client";

/**
 * Erstellt einen Supabase-Client, der Cookies aus dem aktuellen
 * Request liest/schreibt. `null`, wenn ENV nicht konfiguriert ist —
 * der Aufrufer muss damit umgehen (z. B. eine 503 zurückgeben).
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  const env = readSupabaseEnv();
  if (!isSupabaseConfigured(env)) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url!, env.anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // Server Components dürfen keine Cookies setzen — der Set-
          // Pfad wird hier still ignoriert. Schreib-Operationen
          // müssen aus Route Handlers oder Server Actions kommen.
        }
      },
    },
  });
}

/**
 * Liefert den eingeloggten User oder `null`. Validiert das Token
 * gegen Supabase (nicht nur Cookie-Lese-Pfad).
 */
export async function getCurrentUser(): Promise<{
  readonly id: string;
  readonly email: string | null;
} | null> {
  const client = await createServerSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? null,
  };
}
