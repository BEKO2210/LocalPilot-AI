/**
 * POST /api/businesses/[slug]/image (Code-Session 51)
 *
 * Multipart-Upload für Logo/Hero-Bild eines Betriebs.
 * Pfad:
 *   1. `getCurrentUser()` → 401 wenn nicht eingeloggt.
 *   2. Owner-Check via authenticated Server-Client + Read-Try
 *      auf `businesses` (RLS lässt nur Eigene durch). Trifft 0
 *      Zeilen → 403 (analog zu PATCH-Pfad aus Session 50).
 *   3. Mime-/Size-/Kind-Validierung server-seitig (Authoritative).
 *   4. Service-Role-Client schreibt nach `business-images`-Bucket
 *      mit `upsert: true`. Service-Role bypasst RLS auf
 *      `storage.objects` — der Owner-Check oben übernimmt die
 *      Authorization.
 *   5. Public-URL aus dem Upload zurück + Pfad.
 *
 * Static-Build: über `pageExtensions: ["tsx","jsx"]` aus dem
 * Pages-Build ausgeschlossen.
 *
 * Hinweis: Ich aktualisiere hier bewusst NICHT die
 * `businesses.logo_url`/`cover_image_url`-Spalte — der User
 * speichert das Form anschließend regulär per PATCH (Session 50).
 * So bleibt die Upload-Route fokussiert (Storage only) und der
 * User behält die Kontrolle, ob das neue Bild übernommen werden
 * soll.
 */

import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  getCurrentUser,
} from "@/core/database/supabase-server";
import { getServiceRoleClient } from "@/core/database/supabase-service";
import { buildStoragePath, type ImageKind } from "@/lib/business-image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "business-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIMES = ["image/png", "image/jpeg", "image/webp"];

interface RouteContext {
  readonly params: Promise<{ slug: string }>;
}

export async function POST(
  req: Request,
  ctx: RouteContext,
): Promise<Response> {
  // 1) Auth
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

  // 2) Owner-Check via authenticated Read (RLS Migration 0007)
  const authClient = await createServerSupabaseClient();
  if (!authClient) {
    return NextResponse.json(
      { error: "supabase_not_configured", message: "Datenbank-Backend nicht aktiv." },
      { status: 503 },
    );
  }
  const { data: ownedBusiness } = await authClient
    .from("businesses")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle<{ id: string; slug: string }>();
  if (!ownedBusiness) {
    return NextResponse.json(
      {
        error: "forbidden",
        message:
          "Du bist nicht Owner dieses Betriebs (oder der Slug existiert nicht).",
      },
      { status: 403 },
    );
  }

  // 3) Multipart parsen + validieren
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "invalid_form", message: "Multipart-Body konnte nicht gelesen werden." },
      { status: 400 },
    );
  }

  const rawKind = String(formData.get("kind") ?? "").trim();
  if (rawKind !== "logo" && rawKind !== "cover") {
    return NextResponse.json(
      {
        error: "invalid_kind",
        message: "Feld 'kind' muss 'logo' oder 'cover' sein.",
      },
      { status: 400 },
    );
  }
  const kind: ImageKind = rawKind;

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return NextResponse.json(
      { error: "missing_file", message: "Feld 'file' fehlt oder ist keine Datei." },
      { status: 400 },
    );
  }
  if (fileEntry.size === 0) {
    return NextResponse.json(
      { error: "empty_file", message: "Die Datei ist leer." },
      { status: 400 },
    );
  }
  if (fileEntry.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: "file_too_large",
        message: `Datei ist zu groß. Maximum sind 5 MB.`,
      },
      { status: 400 },
    );
  }
  if (!ALLOWED_MIMES.includes(fileEntry.type)) {
    return NextResponse.json(
      {
        error: "invalid_mime",
        message:
          "Nur PNG, JPEG oder WebP. SVG ist aus Sicherheitsgründen nicht erlaubt.",
      },
      { status: 400 },
    );
  }

  // 4) Service-Role-Upload
  const adminClient = getServiceRoleClient();
  if (!adminClient) {
    return NextResponse.json(
      {
        error: "service_role_missing",
        message:
          "Storage-Upload nicht möglich. SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt.",
      },
      { status: 503 },
    );
  }

  const path = buildStoragePath(slug, kind, fileEntry.type);
  const { error: uploadErr } = await adminClient.storage
    .from(BUCKET)
    .upload(path, fileEntry, {
      cacheControl: "3600",
      contentType: fileEntry.type,
      upsert: true,
    });
  if (uploadErr) {
    return NextResponse.json(
      {
        error: "upload_failed",
        message: uploadErr.message ?? "Upload zur Storage fehlgeschlagen.",
      },
      { status: 500 },
    );
  }

  const { data: urlData } = adminClient.storage
    .from(BUCKET)
    .getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  return NextResponse.json(
    { ok: true, publicUrl, path, businessId: ownedBusiness.id },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
