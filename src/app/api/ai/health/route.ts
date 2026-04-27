/**
 * GET /api/ai/health (Code-Session 30)
 *
 * Liefert eine Momentaufnahme der KI-Schicht: welche Provider sind
 * scharf, welche brauchen noch einen API-Key, wie steht das
 * Tagesbudget? Auth-gated wie der POST-Endpunkt — nur authentifizierte
 * Aufrufer sehen den Status (sonst könnte ein Crawler sehen, welche
 * Keys wir haben).
 *
 * **Static-Export**: dieser Pfad wird im Static-Build über
 * `pageExtensions: ["tsx","jsx"]` ausgeschlossen (siehe next.config).
 */

import { NextResponse } from "next/server";
import { getHealthSnapshot } from "@/core/ai/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function checkAuth(req: Request): { ok: boolean; status: number; message?: string } {
  const expected = process.env["LP_AI_API_KEY"]?.trim();
  if (!expected || expected.length === 0) {
    return {
      ok: false,
      status: 503,
      message:
        "API ist nicht aktiviert. Setze LP_AI_API_KEY in der Server-ENV.",
    };
  }
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match || match[1]?.trim() !== expected) {
    return {
      ok: false,
      status: 401,
      message: "Ungültiger oder fehlender Bearer-Token.",
    };
  }
  return { ok: true, status: 200 };
}

export async function GET(req: Request): Promise<Response> {
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "unauthorized", message: auth.message },
      { status: auth.status },
    );
  }
  const snapshot = getHealthSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
