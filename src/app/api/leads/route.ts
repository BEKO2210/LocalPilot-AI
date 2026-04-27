/**
 * POST /api/leads (Code-Session 44)
 *
 * Server-Pfad fürs Public-Lead-Form. Nimmt das Form-Input-Shape
 * (`NewLeadInput`), validiert via `LeadRepository.create` (das
 * intern `LeadSchema.parse` ruft) und antwortet mit `{ ok, leadId }`.
 *
 * Static-Build: Diese Datei wird über `pageExtensions: ["tsx","jsx"]`
 * aus dem Pages-Build ausgeschlossen (siehe next.config.mjs). Das
 * Form fällt dann transparent auf seinen localStorage-Pfad zurück.
 *
 * RLS-Hinweis: Wenn `LP_DATA_SOURCE=supabase`, läuft der Insert
 * gegen die anon-INSERT-Policy aus Migration 0005. Die verlangt
 * Pflicht-Consent + veröffentlichten Betrieb. Verstöße werden als
 * `LeadRepositoryError.kind === "rls"` gemappt und der Aufrufer
 * bekommt 403 mit klarer Meldung.
 */

import { NextResponse } from "next/server";
import {
  getLeadRepository,
  LeadRepositoryError,
  type NewLeadInput,
} from "@/core/database/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Mappt eine Repository-Error-Kind auf einen sinnvollen HTTP-Status. */
function statusForKind(kind: LeadRepositoryError["kind"]): number {
  switch (kind) {
    case "validation":
      return 400;
    case "rls":
      return 403;
    case "constraint":
      return 422;
    case "network":
      return 502;
    default:
      return 500;
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request-Body ist kein gültiges JSON." },
      { status: 400 },
    );
  }

  // Body wird vom Repository validiert (LeadSchema.parse). Wir
  // peeken nur sehr leicht, um eine sinnvolle Fehlermeldung zu
  // liefern, falls ein Pflicht-Top-Level-Feld komplett fehlt.
  if (
    typeof body !== "object" ||
    body === null ||
    !("businessId" in body) ||
    !("name" in body) ||
    !("consent" in body)
  ) {
    return NextResponse.json(
      {
        error: "invalid_payload",
        message:
          "Felder businessId, name und consent sind Pflicht im Request-Body.",
      },
      { status: 400 },
    );
  }

  const repo = getLeadRepository();
  try {
    const lead = await repo.create(body as NewLeadInput);
    return NextResponse.json(
      {
        ok: true,
        leadId: lead.id,
        source: repo.source,
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err) {
    if (err instanceof LeadRepositoryError) {
      return NextResponse.json(
        { error: err.kind, message: err.message },
        { status: statusForKind(err.kind) },
      );
    }
    return NextResponse.json(
      { error: "unknown", message: "Unerwarteter Fehler beim Speichern." },
      { status: 500 },
    );
  }
}
