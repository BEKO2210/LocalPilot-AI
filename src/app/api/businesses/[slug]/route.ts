/**
 * PATCH /api/businesses/[slug] (Code-Session 50)
 *
 * Owner-scoped Update der Business-Stammdaten. Pfad:
 *   1. `getCurrentUser()` → 401 wenn nicht eingeloggt.
 *   2. Body-Validierung gegen `BusinessProfileSchema` →
 *      400 mit `fieldErrors`, wenn invalid.
 *   3. Server-Supabase-Client (mit User-Auth) führt das UPDATE aus.
 *      Die RLS-Policy „Allow owner to update own business" aus
 *      Migration 0007 prüft `is_business_owner(id)` automatisch
 *      und sortiert nicht-Owner aus. Trifft das UPDATE 0 Zeilen,
 *      antworten wir 403/404.
 *
 * **Sicherheits-Hinweis**: wir benutzen explizit den
 * server-Auth-Client (`createServerSupabaseClient()`), NICHT den
 * Service-Role-Client. Damit greift RLS — ein böswilliger User
 * kann nicht einfach eine fremde Slug-URL aufrufen, um den
 * fremden Betrieb zu ändern.
 *
 * Static-Build: über `pageExtensions: ["tsx","jsx"]` aus dem
 * Pages-Build ausgeschlossen.
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/core/database/supabase-server";
import { getCurrentUser } from "@/core/database/supabase-server";
import {
  BusinessProfileSchema,
  type BusinessProfile,
} from "@/core/validation/business-profile.schema";
import { profileToBusinessRow } from "@/lib/business-update";
import { enforceCsrf } from "@/lib/csrf";
import { sanitizeBusinessProfileStrings } from "@/lib/user-input-sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ slug: string }>;
}

export async function PATCH(
  req: Request,
  ctx: RouteContext,
): Promise<Response> {
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

  const { slug } = await ctx.params;
  if (!slug || slug.length === 0) {
    return NextResponse.json(
      { error: "invalid_slug", message: "Slug fehlt im Pfad." },
      { status: 400 },
    );
  }

  // 2) Body parsen + validieren
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request-Body ist kein gültiges JSON." },
      { status: 400 },
    );
  }

  // Wir akzeptieren das snake_case-DB-Format (vom Form-Helper geliefert)
  // und mappen es zurück auf das camelCase-Profil-Schema, das wir dann
  // strikt validieren. So bleibt die DB-Schicht entkoppelt vom
  // Validation-Schema.
  let profile: BusinessProfile;
  try {
    profile = parseSnakeRowAsProfile(body);
    // XSS-Defense-in-Depth (Code-Session 67): User-Input vor
    // dem DB-Insert von HTML-Tags + Control-Chars säubern.
    // Public-Site-Render via React-`{text}` ist primär durch
    // Auto-Escaping geschützt — sanitize hier ist Schutz gegen
    // spätere Markdown-/HTML-Renderer und gegen
    // Logs/Email-Templates.
    profile = sanitizeBusinessProfileStrings(profile);
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: "validation", fieldErrors: err.fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "validation", message: "Body kann nicht als Profile gelesen werden." },
      { status: 400 },
    );
  }

  // 3) Server-Auth-Client + UPDATE
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error: "supabase_not_configured",
        message: "Datenbank-Backend ist nicht aktiv.",
      },
      { status: 503 },
    );
  }

  const row = profileToBusinessRow(profile);
  const { data, error } = await supabase
    .from("businesses")
    .update(row)
    .eq("slug", slug)
    .select("id, slug")
    .maybeSingle<{ id: string; slug: string }>();

  if (error) {
    // Slug-Wechsel auf bestehenden Slug → unique-violation
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "constraint", message: "Slug bereits vergeben." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "unknown", message: error.message ?? "Datenbank-Fehler." },
      { status: 500 },
    );
  }

  if (!data) {
    // RLS hat das UPDATE auf 0 Zeilen reduziert (User kein Owner)
    // ODER der Slug existiert gar nicht. Wir können nicht sauber
    // unterscheiden, ohne RLS zu umgehen — geben einheitlich 403,
    // damit wir keine Existenz-Information leaken.
    return NextResponse.json(
      {
        error: "forbidden",
        message:
          "Du bist nicht Owner dieses Betriebs (oder der Slug existiert nicht).",
      },
      { status: 403 },
    );
  }

  return NextResponse.json(
    { ok: true, slug: data.slug },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

// ---------------------------------------------------------------------------
// Helper: Body-Mapping snake_case → camelCase und Validation
// ---------------------------------------------------------------------------

class ValidationError extends Error {
  constructor(public readonly fieldErrors: Record<string, string>) {
    super("validation");
    this.name = "ValidationError";
  }
}

interface IncomingRow {
  readonly name?: unknown;
  readonly industry_key?: unknown;
  readonly locale?: unknown;
  readonly tagline?: unknown;
  readonly description?: unknown;
  readonly logo_url?: unknown;
  readonly cover_image_url?: unknown;
  readonly address?: unknown;
  readonly contact?: unknown;
  readonly opening_hours?: unknown;
  readonly theme_key?: unknown;
  readonly primary_color?: unknown;
  readonly secondary_color?: unknown;
  readonly accent_color?: unknown;
}

function parseSnakeRowAsProfile(body: unknown): BusinessProfile {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError({ _root: "Body muss ein Objekt sein." });
  }
  const r = body as IncomingRow;

  const candidate = {
    name: r.name,
    industryKey: r.industry_key,
    locale: r.locale ?? "de",
    tagline: r.tagline,
    description: r.description,
    logoUrl: r.logo_url ?? undefined,
    coverImageUrl: r.cover_image_url ?? undefined,
    address: r.address,
    contact: r.contact,
    openingHours: r.opening_hours,
    themeKey: r.theme_key,
    primaryColor: r.primary_color ?? undefined,
    secondaryColor: r.secondary_color ?? undefined,
    accentColor: r.accent_color ?? undefined,
  };

  const result = BusinessProfileSchema.safeParse(candidate);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "_root";
      // erstes Issue pro Pfad gewinnt
      if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    throw new ValidationError(fieldErrors);
  }
  return result.data;
}
