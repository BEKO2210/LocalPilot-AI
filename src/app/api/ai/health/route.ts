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
import { checkAuth } from "@/core/ai/auth/check";
import { checkDatabaseHealth } from "@/core/database/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json(
      { error: "unauthorized", message: auth.message },
      { status: auth.status },
    );
  }
  const [snapshot, database] = await Promise.all([
    Promise.resolve(getHealthSnapshot()),
    checkDatabaseHealth(),
  ]);
  return NextResponse.json(
    { ...snapshot, database },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
