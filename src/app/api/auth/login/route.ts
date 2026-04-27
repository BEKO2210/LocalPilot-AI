/**
 * POST /api/auth/login (Code-Session 33)
 *
 * Body: `{ password: string }`
 *
 * Validiert das Passwort gegen `LP_AI_PASSWORD` (Default:
 * `LP_AI_API_KEY`). Bei Erfolg wird ein HS256-Session-JWT in einem
 * HttpOnly-Cookie gesetzt. Cookie ist 7 Tage gültig (Sliding-Window-
 * Empfehlung aus der 2026-Recherche).
 *
 * **Static-Export**: über `pageExtensions: ["tsx","jsx"]` in
 * `next.config.mjs` ausgeschlossen (siehe Code-Session 28).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthConfig, SESSION_COOKIE_NAME } from "@/core/ai/auth/check";
import { buildSessionToken } from "@/core/ai/auth/session";
import { enforceCsrf } from "@/lib/csrf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LoginSchema = z.object({
  password: z.string().min(1).max(512),
});

const SESSION_TTL_SECONDS = 7 * 24 * 3600;

export async function POST(req: Request): Promise<Response> {
  const csrfFail = enforceCsrf(req);
  if (csrfFail) return csrfFail;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_input", message: "Body ist kein gültiges JSON." },
      { status: 400 },
    );
  }
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.message },
      { status: 400 },
    );
  }

  const cfg = getAuthConfig();
  if (!cfg.configured || cfg.password.length === 0) {
    return NextResponse.json(
      {
        error: "service_not_configured",
        message:
          "Login ist nicht aktiviert. Setze LP_AI_PASSWORD (oder LP_AI_API_KEY) und LP_AI_SESSION_SECRET in der Server-ENV.",
      },
      { status: 503 },
    );
  }

  if (parsed.data.password !== cfg.password) {
    // Kein Detail-Hinweis (z. B. „User existiert", „Passwort falsch") —
    // wir geben einheitlich 401, um Brute-Force-Hilfe zu vermeiden.
    return NextResponse.json(
      { error: "invalid_credentials", message: "Ungültige Zugangsdaten." },
      { status: 401 },
    );
  }

  const token = buildSessionToken(cfg.sessionSecret, {
    ttlSeconds: SESSION_TTL_SECONDS,
  });

  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") {
    cookieParts.push("Secure");
  }

  const response = NextResponse.json({
    ok: true,
    principal: "admin",
    expiresInSeconds: SESSION_TTL_SECONDS,
  });
  response.headers.set("Set-Cookie", cookieParts.join("; "));
  return response;
}
