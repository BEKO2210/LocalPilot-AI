/**
 * POST /api/auth/magic-link (Code-Session 42)
 *
 * Sendet einen Magic-Link an die angegebene E-Mail. Der Link führt
 * den User zurück nach `/api/auth/callback?code=...`, wo die Session
 * gegen das Cookie eingetauscht wird.
 *
 * Body: `{ email: string, redirectTo?: string }`. `redirectTo` ist
 * der Pfad, auf den nach erfolgreichem Login weitergeleitet wird —
 * Default `/dashboard`.
 *
 * **Sicherheit**: redirectTo wird **nur als Pfad** akzeptiert
 * (`/^\/[a-zA-Z0-9_\-/]*$/`), damit der Magic-Link kein offener
 * Open-Redirect wird.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/core/database/supabase-server";
import { enforceCsrf } from "@/lib/csrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAFE_PATH_RE = /^\/[a-zA-Z0-9_\-/]*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request): Promise<Response> {
  const csrfFail = enforceCsrf(req);
  if (csrfFail) return csrfFail;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request-Body ist kein gültiges JSON." },
      { status: 400 },
    );
  }

  const email =
    typeof body === "object" && body && "email" in body
      ? String((body as { email: unknown }).email).trim()
      : "";
  const redirectToInput =
    typeof body === "object" && body && "redirectTo" in body
      ? String((body as { redirectTo: unknown }).redirectTo).trim()
      : "/dashboard";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "invalid_email", message: "Bitte gib eine gültige E-Mail-Adresse ein." },
      { status: 400 },
    );
  }
  const redirectTo = SAFE_PATH_RE.test(redirectToInput)
    ? redirectToInput
    : "/dashboard";

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error: "supabase_not_configured",
        message:
          "Auth-Backend nicht konfiguriert. NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in der Server-ENV setzen.",
      },
      { status: 503 },
    );
  }

  const origin = new URL(req.url).origin;
  const emailRedirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      // shouldCreateUser default = true → erster Login legt
      // Auth-User automatisch an. Multi-Tenant-Bindung
      // (business_owners) wird in einer Folge-Session gepflegt.
    },
  });

  if (error) {
    return NextResponse.json(
      { error: "send_failed", message: error.message },
      { status: 500 },
    );
  }

  // Bewusste Aussage: NICHT verraten, ob die E-Mail existiert
  // (User-Enumeration-Schutz). Im Erfolgsfall sieht der Aufrufer
  // immer dasselbe.
  return NextResponse.json(
    {
      ok: true,
      message:
        "Wenn die E-Mail-Adresse bei uns registriert ist oder neu registriert wird, schicken wir einen Login-Link.",
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
