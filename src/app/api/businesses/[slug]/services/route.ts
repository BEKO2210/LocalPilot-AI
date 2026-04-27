/**
 * PUT /api/businesses/[slug]/services (Code-Session 55)
 *
 * Bulk-Update der Services-Liste eines Betriebs.
 *
 * Pfad:
 *   1. `getCurrentUser()` → 401.
 *   2. Business-Lookup via Server-Auth-Client (RLS) → 403 wenn 0
 *      Zeilen.
 *   3. Body-Validierung: `services` als Array von DB-Row-Form
 *      (snake_case). Wir validieren jeden Eintrag client-seitig
 *      (light) + per `ServiceSchema` (camelCase nach Re-Map) für
 *      die strikte Form.
 *   4. Diff:
 *      - existingIds = SELECT id FROM services WHERE business_id = X
 *      - clientIdsWithUuid = body.services.filter(has-id).map(id)
 *      - toDelete = existingIds - clientIdsWithUuid
 *      - toUpsert = body.services (alle, ID kann fehlen)
 *   5. **Drei Statements** (nicht atomar — supabase-js v2 hat
 *      keine Transaktionen):
 *      a) UPSERT mit `onConflict: "id"` — UPDATE existing,
 *         INSERT neue (Server vergibt UUID via gen_random_uuid).
 *      b) DELETE WHERE id IN (toDelete). Lead.requested_service_id
 *         wird via Migration-0005-Cascade auf `null` gesetzt
 *         (Lead-Daten bleiben erhalten, nur die Service-Referenz
 *         fällt weg).
 *
 * **Sicherheit**: Server-Auth-Client (NICHT Service-Role). RLS aus
 * Migration 0007 prüft `is_business_owner(business_id)` für
 * INSERT/UPDATE/DELETE auf `services` automatisch.
 */

import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  getCurrentUser,
} from "@/core/database/supabase-server";
import { getServiceRoleClient } from "@/core/database/supabase-service";
import { ServiceSchema } from "@/core/validation/service.schema";
import { looksLikeDbUuid } from "@/lib/services-update";
import {
  collectStoragePaths,
  removeStoragePaths,
} from "@/lib/storage-cleanup";
import { enforceCsrf } from "@/lib/csrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_BUCKET = "business-images";

interface RouteContext {
  readonly params: Promise<{ slug: string }>;
}

interface IncomingRow {
  readonly id?: unknown;
  readonly business_id?: unknown;
  readonly category?: unknown;
  readonly title?: unknown;
  readonly short_description?: unknown;
  readonly long_description?: unknown;
  readonly price_label?: unknown;
  readonly duration_label?: unknown;
  readonly image_url?: unknown;
  readonly icon?: unknown;
  readonly tags?: unknown;
  readonly is_featured?: unknown;
  readonly is_active?: unknown;
  readonly sort_order?: unknown;
}

export async function PUT(
  req: Request,
  ctx: RouteContext,
): Promise<Response> {
  const csrfFail = enforceCsrf(req);
  if (csrfFail) return csrfFail;

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body ist kein gültiges JSON." },
      { status: 400 },
    );
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray((body as { services?: unknown }).services)
  ) {
    return NextResponse.json(
      {
        error: "invalid_payload",
        message: "Body muss { services: [...] } sein.",
      },
      { status: 400 },
    );
  }

  const incoming = (body as { services: IncomingRow[] }).services;

  // 2) Business-Lookup mit RLS-Check
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "supabase_not_configured", message: "Datenbank-Backend nicht aktiv." },
      { status: 503 },
    );
  }
  const { data: ownedBusiness } = await supabase
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
  const businessId = ownedBusiness.id;

  // 3) Validierung: jede Row über ServiceSchema (camelCase nach Re-Map)
  const fieldErrors: Record<string, string> = {};
  const upsertRows: Array<Record<string, unknown>> = [];
  for (let i = 0; i < incoming.length; i++) {
    const r = incoming[i];
    if (!r) continue;
    // Re-Map snake → camel für ServiceSchema-Validierung
    const camelDraft = {
      id: typeof r.id === "string" && looksLikeDbUuid(r.id) ? r.id : crypto.randomUUID(),
      businessId,
      ...(typeof r.category === "string" ? { category: r.category } : {}),
      title: typeof r.title === "string" ? r.title : "",
      shortDescription: typeof r.short_description === "string" ? r.short_description : "",
      longDescription: typeof r.long_description === "string" ? r.long_description : "",
      ...(typeof r.price_label === "string" ? { priceLabel: r.price_label } : {}),
      ...(typeof r.duration_label === "string" ? { durationLabel: r.duration_label } : {}),
      ...(typeof r.image_url === "string" ? { imageUrl: r.image_url } : {}),
      ...(typeof r.icon === "string" ? { icon: r.icon } : {}),
      tags: Array.isArray(r.tags) ? (r.tags as unknown[]).filter((t): t is string => typeof t === "string") : [],
      isFeatured: r.is_featured === true,
      isActive: r.is_active === true,
      sortOrder: typeof r.sort_order === "number" ? r.sort_order : i,
    };
    const result = ServiceSchema.safeParse(camelDraft);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = `services.${i}.${issue.path.join(".") || "_root"}`;
        if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
      }
      continue;
    }
    // camelCase wieder auf snake_case fürs Wire/DB-Format
    upsertRows.push({
      id: result.data.id,
      business_id: businessId,
      category: result.data.category ?? null,
      title: result.data.title,
      short_description: result.data.shortDescription,
      long_description: result.data.longDescription,
      price_label: result.data.priceLabel ?? null,
      duration_label: result.data.durationLabel ?? null,
      image_url: result.data.imageUrl ?? null,
      icon: result.data.icon ?? null,
      tags: result.data.tags,
      is_featured: result.data.isFeatured,
      is_active: result.data.isActive,
      sort_order: result.data.sortOrder,
    });
  }
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "validation", fieldErrors },
      { status: 400 },
    );
  }

  // 4) Existing-Rows (id + image_url) für DELETE-Diff + Storage-Cleanup
  const { data: existing, error: existingErr } = await supabase
    .from("services")
    .select("id, image_url")
    .eq("business_id", businessId);
  if (existingErr) {
    return NextResponse.json(
      { error: "unknown", message: existingErr.message ?? "Existing-Lookup fehlgeschlagen." },
      { status: 500 },
    );
  }

  const existingRows = (existing ?? []) as ReadonlyArray<{
    id: string;
    image_url: string | null;
  }>;
  const existingIds = new Set(existingRows.map((r) => r.id));
  const incomingIds = new Set(upsertRows.map((r) => String(r["id"])));
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  // 5a) UPSERT (UPDATE existing + INSERT neue)
  let inserted = 0;
  let updated = 0;
  if (upsertRows.length > 0) {
    const { error: upsertErr } = await supabase
      .from("services")
      .upsert(upsertRows, { onConflict: "id" });
    if (upsertErr) {
      return NextResponse.json(
        { error: "unknown", message: upsertErr.message ?? "Upsert fehlgeschlagen." },
        { status: 500 },
      );
    }
    // Wir kennen exact-Counts nicht ohne separate SELECT. Schätzung:
    // alle eingehenden mit existierender ID = updated, andere = inserted.
    for (const row of upsertRows) {
      if (existingIds.has(String(row["id"]))) updated++;
      else inserted++;
    }
  }

  // 5b) DELETE waisen — Lead-FK-Cascade läuft via DB-Constraint.
  // Vor dem DB-DELETE den Storage-Cleanup für Service-Bilder
  // anstoßen: wenn ein Service ein `image_url` hat, das auf
  // unseren Bucket zeigt, das Storage-Object aufräumen. Best-
  // effort, Storage-Fehler blockieren den DB-DELETE NICHT —
  // sonst könnte ein temporärer Storage-Hänger den User aus
  // seiner UI aussperren.
  let deleted = 0;
  let imagesRemoved = 0;
  let imagesFailed = 0;
  if (toDelete.length > 0) {
    const toDeleteSet = new Set(toDelete);
    const orphanImageUrls = existingRows
      .filter((r) => toDeleteSet.has(r.id))
      .map((r) => r.image_url);
    const orphanPaths = collectStoragePaths(orphanImageUrls, IMAGE_BUCKET);
    if (orphanPaths.length > 0) {
      const adminClient = getServiceRoleClient();
      const removeRes = await removeStoragePaths(
        adminClient,
        IMAGE_BUCKET,
        orphanPaths,
      );
      imagesRemoved = removeRes.removed;
      imagesFailed = removeRes.failed;
      if (removeRes.reason) {
        // Nicht fatal. Logging-only — Operations-Team sieht es,
        // User kriegt weiter ein 200.
        console.warn(
          "[services-cleanup] Storage-Remove fehlgeschlagen:",
          removeRes.reason,
        );
      }
    }

    const { error: delErr } = await supabase
      .from("services")
      .delete()
      .in("id", toDelete);
    if (delErr) {
      return NextResponse.json(
        { error: "unknown", message: delErr.message ?? "Delete fehlgeschlagen." },
        { status: 500 },
      );
    }
    deleted = toDelete.length;
  }

  return NextResponse.json(
    {
      ok: true,
      inserted,
      updated,
      deleted,
      imagesRemoved,
      imagesFailed,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
