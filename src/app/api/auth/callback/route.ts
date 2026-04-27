/**
 * GET /api/auth/callback (Code-Session 42)
 *
 * Magic-Link-Callback. Der User klickt auf den Link in seiner Mail,
 * Supabase leitet hierher mit `?code=...&next=/dashboard`. Wir
 * tauschen den Code gegen eine Session-Cookie, dann redirect zum
 * `next`-Pfad.
 *
 * **Sicherheit**: `next` wird mit derselben SAFE_PATH-Regex wie
 * im Magic-Link-Endpunkt geprüft, damit der Callback kein
 * Open-Redirect wird.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/core/database/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAFE_PATH_RE = /^\/[a-zA-Z0-9_\-/]*$/;

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/dashboard";
  const next = SAFE_PATH_RE.test(nextRaw) ? nextRaw : "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=missing_code`, url.origin),
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(
      new URL(`/login?error=auth_not_configured`, url.origin),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message)}`,
        url.origin,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
