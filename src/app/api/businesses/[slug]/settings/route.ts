/**
 * PATCH /api/businesses/[slug]/settings (Code-Session 52)
 *
 * Owner-scoped Settings-Update (Slug, Veröffentlichungsstatus,
 * Sprache).
 *
 * Pfad:
 *   1. `getCurrentUser()` → 401 wenn nicht eingeloggt.
 *   2. Light-Validation auf Body-Shape.
 *   3. Server-Auth-Client + UPDATE auf `businesses` mit
 *      `.eq("slug", slug)`. Migration-0007-Policy „Allow owner
 *      to update own business" greift automatisch — fremde Slugs
 *      treffen 0 Zeilen → 403.
 *   4. Postgres-23505 (Slug-Unique-Verletzung) → 409 mit klarer
 *      Meldung.
 *   5. Antwort enthält den (ggf. neuen) Slug + `slugChanged`-Flag,
 *      damit das UI auf die neue URL redirecten kann.
 *
 * Sicherheits-Hinweis: wir verwenden den Server-Auth-Client (NICHT
 * Service-Role). RLS macht die Authorization. Slug-Wechsel ist
 * atomar — Postgres rollt zurück, wenn die Unique-Constraint trifft.
 */

import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  getCurrentUser,
} from "@/core/database/supabase-server";
import { isReservedSlug } from "@/lib/onboarding-validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ slug: string }>;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

interface Body {
  readonly newSlug?: unknown;
  readonly isPublished?: unknown;
  readonly locale?: unknown;
}

export async function PATCH(
  req: Request,
  ctx: RouteContext,
): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Bitte zuerst einloggen." },
      { status: 401 },
    );
  }

  const { slug } = await ctx.params;
  if (!slug) {
    return NextResponse.json(
      { error: "invalid_slug", message: "Slug fehlt im Pfad." },
      { status: 400 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body ist kein gültiges JSON." },
      { status: 400 },
    );
  }

  const fieldErrors: Record<string, string> = {};
  const patch: Record<string, string | boolean> = {};

  // newSlug
  if (typeof body.newSlug === "string") {
    const candidate = body.newSlug.trim().toLowerCase();
    if (candidate.length > 0 && candidate !== slug) {
      if (candidate.length < 3 || candidate.length > 40) {
        fieldErrors.newSlug = "Slug muss 3–40 Zeichen lang sein.";
      } else if (!SLUG_RE.test(candidate)) {
        fieldErrors.newSlug =
          "Nur Kleinbuchstaben, Zahlen und Bindestriche. Muss mit Buchstabe/Zahl beginnen und enden.";
      } else if (isReservedSlug(candidate)) {
        fieldErrors.newSlug = "Dieser Slug ist reserviert.";
      } else {
        patch["slug"] = candidate;
      }
    }
  }

  // isPublished
  if (typeof body.isPublished === "boolean") {
    patch["is_published"] = body.isPublished;
  } else if (body.isPublished !== undefined) {
    fieldErrors.isPublished = "isPublished muss boolean sein.";
  }

  // locale
  if (body.locale !== undefined) {
    if (body.locale === "de" || body.locale === "en") {
      patch["locale"] = body.locale;
    } else {
      fieldErrors.locale = "Sprache muss 'de' oder 'en' sein.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "validation", fieldErrors },
      { status: 400 },
    );
  }

  if (Object.keys(patch).length === 0) {
    // Nichts zu tun — wir antworten 200 mit slugChanged=false,
    // damit das UI das genauso wie ein normales Speichern
    // behandeln kann.
    return NextResponse.json(
      { ok: true, slug, slugChanged: false },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "supabase_not_configured", message: "Datenbank-Backend nicht aktiv." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("businesses")
    .update(patch)
    .eq("slug", slug)
    .select("id, slug")
    .maybeSingle<{ id: string; slug: string }>();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "slug_taken",
          message: "Dieser Slug ist bereits vergeben. Bitte einen anderen wählen.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "unknown", message: error.message ?? "Datenbank-Fehler." },
      { status: 500 },
    );
  }

  if (!data) {
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
    {
      ok: true,
      slug: data.slug,
      slugChanged: data.slug !== slug,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
