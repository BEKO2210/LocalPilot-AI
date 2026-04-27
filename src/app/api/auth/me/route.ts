/**
 * GET /api/auth/me (Code-Session 33)
 *
 * Gibt zurück, ob der aktuelle Request authentifiziert ist und
 * über welchen Pfad (cookie / bearer). UI nutzt das beim Mount,
 * um zwischen „Login-Card" und „normales Playground-UI" zu
 * entscheiden.
 *
 * **Bewusst keine Sensible-Daten**: kein Token-Wert, kein Secret —
 * nur das `principal`-Label und der `via`-Pfad.
 */

import { NextResponse } from "next/server";
import { checkAuth } from "@/core/ai/auth/check";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json(
      {
        authenticated: false,
        reason: auth.message,
      },
      { status: auth.status, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      authenticated: true,
      principal: auth.principal,
      via: auth.via,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
