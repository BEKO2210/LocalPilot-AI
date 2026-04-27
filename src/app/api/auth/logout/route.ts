/**
 * POST /api/auth/logout (Code-Session 33)
 *
 * Löscht das Session-Cookie. Idempotent — auch ohne aktive Session
 * liefert 200, damit der Client einfach „feuern und vergessen" kann.
 */

import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/core/ai/auth/check";
import { enforceCsrf } from "@/lib/csrf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const csrfFail = enforceCsrf(req);
  if (csrfFail) return csrfFail;

  const response = NextResponse.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
  return response;
}
