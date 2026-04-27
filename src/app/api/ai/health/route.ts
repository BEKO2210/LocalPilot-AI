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
import { resolveDataSource } from "@/core/database/repositories";

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
  // Wenn der Repo-Layer bereits auf Supabase umgeschwenkt ist, prüfen
  // wir auch die `businesses`-Tabelle (Migration + RLS-Policy). Sonst
  // bleibt es beim leichten REST-Root-Ping.
  const probe =
    resolveDataSource() === "supabase" ? "businesses-table" : "rest-root";
  const [snapshot, database] = await Promise.all([
    Promise.resolve(getHealthSnapshot()),
    checkDatabaseHealth(process.env, { probe }),
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
