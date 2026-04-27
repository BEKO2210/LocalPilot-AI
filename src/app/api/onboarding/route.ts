/**
 * POST /api/onboarding (Code-Session 45)
 *
 * Onboarding-Endpoint. Voraussetzungen:
 *   - User ist via `@supabase/ssr` eingeloggt (`getCurrentUser`).
 *   - `SUPABASE_SERVICE_ROLE_KEY` ist server-seitig verfügbar.
 *   - Eingabe ist `OnboardingInput`-Shape und passiert
 *     `validateOnboarding`.
 *
 * Antwortet mit `{ ok: true, slug }` bei Erfolg, sonst mit einem
 * `OnboardingError.kind` als `error` und passendem HTTP-Status.
 *
 * Static-Build: über `pageExtensions: ["tsx","jsx"]` aus dem
 * Pages-Build ausgeschlossen. Auf der Static-Vorschau gibt es
 * keine Onboarding-Funktionalität — die `/onboarding`-Page zeigt
 * dann eine Demo-Mode-Karte.
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/core/database/supabase-server";
import {
  createBusinessForUser,
  OnboardingError,
} from "@/core/database/repositories/onboarding";
import {
  isReservedSlug,
  validateOnboarding,
} from "@/lib/onboarding-validate";
import { enforceCsrf } from "@/lib/csrf";
import {
  sanitizeUserMultiLine,
  sanitizeUserSingleLine,
} from "@/lib/user-input-sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusForKind(kind: OnboardingError["kind"]): number {
  switch (kind) {
    case "not_configured":
      return 503;
    case "slug_taken":
      return 409;
    case "constraint":
      return 422;
    default:
      return 500;
  }
}

export async function POST(req: Request): Promise<Response> {
  const csrfFail = enforceCsrf(req);
  if (csrfFail) return csrfFail;

  // 1) Auth-Gate
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Bitte zuerst einloggen." },
      { status: 401 },
    );
  }

  // 2) Body parsen
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request-Body ist kein gültiges JSON." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "invalid_payload", message: "Body muss ein Objekt sein." },
      { status: 400 },
    );
  }
  const b = body as Record<string, unknown>;

  // 3) Pure-Validation. String-Felder werden vor der
  // Validation durch den User-Input-Sanitizer geschickt
  // (XSS-Defense-in-Depth, Code-Session 67) — name/tagline
  // single-line, description multi-line. Slug, industryKey,
  // themeKey, packageTier sind enum-artig und werden vom
  // Validator strikt geprüft, daher kein Sanitize-Risiko.
  const validation = validateOnboarding({
    slug: typeof b["slug"] === "string" ? b["slug"] : "",
    name: sanitizeUserSingleLine(b["name"], 200),
    industryKey: typeof b["industryKey"] === "string" ? b["industryKey"] : "",
    themeKey: typeof b["themeKey"] === "string" ? b["themeKey"] : "",
    packageTier: typeof b["packageTier"] === "string" ? b["packageTier"] : "",
    tagline: sanitizeUserSingleLine(b["tagline"], 240),
    description: sanitizeUserMultiLine(b["description"], 5_000),
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: "validation", fieldErrors: validation.errors },
      { status: 400 },
    );
  }

  // Reservierter-Slug-Check (zusätzlich zur DB-Unique-Violation).
  if (isReservedSlug(validation.value.slug)) {
    return NextResponse.json(
      {
        error: "validation",
        fieldErrors: {
          slug: "Dieser Slug ist reserviert (System-Pfad). Bitte einen anderen wählen.",
        },
      },
      { status: 400 },
    );
  }

  // 4) Dual-Insert
  try {
    const result = await createBusinessForUser(user.id, validation.value);
    return NextResponse.json(
      { ok: true, slug: result.slug, businessId: result.businessId },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    if (err instanceof OnboardingError) {
      return NextResponse.json(
        { error: err.kind, message: err.message },
        { status: statusForKind(err.kind) },
      );
    }
    return NextResponse.json(
      { error: "unknown", message: "Unerwarteter Fehler beim Onboarding." },
      { status: 500 },
    );
  }
}
