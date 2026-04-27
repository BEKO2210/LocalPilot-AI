/**
 * Next.js-Middleware: Session-Refresh für Supabase-Auth (Code-Session 42).
 *
 * Server Components dürfen keine Cookies setzen. Damit der
 * Auth-Token vor Ablauf auto-refresht wird, läuft hier auf jedem
 * Request ein Lese-Check via `auth.getUser()`. Falls der Token
 * abgelaufen, aber refreshable ist, schreibt `@supabase/ssr` den
 * neuen Token automatisch in die Response-Cookies.
 *
 * Wenn die Supabase-ENV nicht konfiguriert ist, ist die Middleware
 * ein No-Op — die Plattform läuft ohne Auth weiter (Mock-Modus).
 *
 * Matcher schließt statische Assets und Bild-Pfade aus, weil deren
 * Auth-Status irrelevant ist und sonst pro Asset ein Auth-Roundtrip
 * fällig wäre.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url =
    process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
  const anonKey =
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ??
    process.env["SUPABASE_ANON_KEY"];

  // ENV nicht konfiguriert → Middleware ist No-Op.
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Validiert Token + refresht, falls nötig.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip static assets, images, and the Next.js internals.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
