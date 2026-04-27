/**
 * Pure-Logic-Helper für Services-Bulk-Update (Code-Session 55).
 *
 * Service-Liste ist Array-form: Owner editiert, fügt hinzu, löscht.
 * Beim Speichern wird die *gesamte aktuelle Liste* an den Server
 * geschickt. Server berechnet Diff:
 *
 *   - IDs in Client-Liste, die in DB existieren  →  UPDATE
 *   - IDs in DB, die NICHT in Client-Liste sind  →  DELETE
 *     (Lead-`requested_service_id` wird via Cascade `set null` —
 *     die Lead-Daten bleiben, nur die Service-Referenz fällt weg).
 *   - Services ohne DB-UUID in Client-Liste  →  INSERT mit neuer
 *     `gen_random_uuid()`.
 *
 * **Mock-IDs vs DB-UUIDs**: Demo-Daten und neu hinzugefügte
 * Services haben Pseudo-IDs (`svc-<slug>-<random>`). Postgres
 * würde solche ID-Werte als ungültiges UUID ablehnen. Wir
 * erkennen via `looksLikeDbUuid` und behandeln Pseudo-IDs als
 * INSERT-Kandidaten. Dadurch ist Re-Import aus Demo-Daten
 * idempotent.
 */

import type { Service } from "@/types/service";

/**
 * UUID v1-5 Pattern. Strict genug, um Pseudo-IDs zuverlässig
 * abzulehnen, locker genug für alle echten UUID-Varianten.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function looksLikeDbUuid(id: string): boolean {
  return UUID_RE.test(id);
}

/** Splittet Services in `update`-fähige (DB-UUID) und `insert`-Kandidaten. */
export function splitServices(services: readonly Service[]): {
  readonly toUpdate: readonly Service[];
  readonly toInsert: readonly Service[];
} {
  const toUpdate: Service[] = [];
  const toInsert: Service[] = [];
  for (const s of services) {
    if (looksLikeDbUuid(s.id)) {
      toUpdate.push(s);
    } else {
      toInsert.push(s);
    }
  }
  return { toUpdate, toInsert };
}

// ---------------------------------------------------------------------------
// camelCase → snake_case Mapping (für Wire-Format)
// ---------------------------------------------------------------------------

export interface ServiceWireRow {
  /** Optional: nur bei UPDATE-Kandidaten gesetzt. */
  readonly id?: string | undefined;
  readonly business_id: string;
  readonly category: string | null;
  readonly title: string;
  readonly short_description: string;
  readonly long_description: string;
  readonly price_label: string | null;
  readonly duration_label: string | null;
  readonly image_url: string | null;
  readonly icon: string | null;
  readonly tags: readonly string[];
  readonly is_featured: boolean;
  readonly is_active: boolean;
  readonly sort_order: number;
}

export function serviceToWireRow(
  service: Service,
  businessId: string,
  options: { readonly keepId: boolean },
): ServiceWireRow {
  return {
    ...(options.keepId ? { id: service.id } : {}),
    business_id: businessId,
    category: service.category ?? null,
    title: service.title,
    short_description: service.shortDescription,
    long_description: service.longDescription,
    price_label: service.priceLabel ?? null,
    duration_label: service.durationLabel ?? null,
    image_url: service.imageUrl ?? null,
    icon: service.icon ?? null,
    tags: service.tags,
    is_featured: service.isFeatured,
    is_active: service.isActive,
    sort_order: service.sortOrder,
  };
}

// ---------------------------------------------------------------------------
// Submit-Result + Fetch-Wrapper
// ---------------------------------------------------------------------------

export interface ServicesUpdatePayload {
  readonly services: readonly ServiceWireRow[];
}

export type ServicesUpdateResult =
  | {
      readonly kind: "server";
      readonly inserted: number;
      readonly updated: number;
      readonly deleted: number;
    }
  | { readonly kind: "not-authed" }
  | { readonly kind: "forbidden" }
  | {
      readonly kind: "validation";
      readonly fieldErrors: Readonly<Record<string, string>>;
    }
  | { readonly kind: "local-fallback"; readonly reason: string }
  | { readonly kind: "fail"; readonly reason: string };

export interface SubmitDeps {
  readonly fetchImpl?: typeof fetch;
}

interface ApiSuccessBody {
  readonly ok?: boolean;
  readonly inserted?: number;
  readonly updated?: number;
  readonly deleted?: number;
}
interface ApiErrorBody {
  readonly error?: string;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

/**
 * Bereitet die Wire-Payload aus einer Service-Liste auf:
 * UPDATE-Kandidaten behalten ihre DB-UUID, INSERT-Kandidaten
 * werden ohne `id` geschickt — Server generiert dann eine.
 */
export function buildServicesPayload(
  services: readonly Service[],
  businessId: string,
): ServicesUpdatePayload {
  const { toUpdate, toInsert } = splitServices(services);
  return {
    services: [
      ...toUpdate.map((s) => serviceToWireRow(s, businessId, { keepId: true })),
      ...toInsert.map((s) => serviceToWireRow(s, businessId, { keepId: false })),
    ],
  };
}

export async function submitServicesUpdate(
  slug: string,
  services: readonly Service[],
  businessId: string,
  deps: SubmitDeps = {},
): Promise<ServicesUpdateResult> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const payload = buildServicesPayload(services, businessId);

  let response: Response;
  try {
    response = await fetchImpl(
      `/api/businesses/${encodeURIComponent(slug)}/services`,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
  } catch (err) {
    return {
      kind: "local-fallback",
      reason: err instanceof Error ? err.message : "Netzwerk-Fehler",
    };
  }

  if (response.ok) {
    let body: ApiSuccessBody | null = null;
    try {
      body = (await response.json()) as ApiSuccessBody;
    } catch {
      /* ignore */
    }
    return {
      kind: "server",
      inserted: body?.inserted ?? 0,
      updated: body?.updated ?? 0,
      deleted: body?.deleted ?? 0,
    };
  }

  if (response.status === 404) {
    return {
      kind: "local-fallback",
      reason: "API-Route /api/businesses/<slug>/services nicht verfügbar (Static-Build)",
    };
  }
  if (response.status === 401) return { kind: "not-authed" };
  if (response.status === 403) return { kind: "forbidden" };

  let errBody: ApiErrorBody | null = null;
  try {
    errBody = (await response.json()) as ApiErrorBody;
  } catch {
    /* ignore */
  }
  if (response.status === 400 && errBody?.fieldErrors) {
    return {
      kind: "validation",
      fieldErrors: errBody.fieldErrors,
    };
  }
  return {
    kind: "fail",
    reason: errBody?.message ?? `Server-Antwort ${response.status}`,
  };
}

/** User-sichtbarer Hinweis pro Result. */
export function userMessageForResult(
  result: ServicesUpdateResult,
): string | null {
  switch (result.kind) {
    case "server": {
      const parts: string[] = [];
      if (result.inserted > 0) parts.push(`${result.inserted} neu`);
      if (result.updated > 0) parts.push(`${result.updated} aktualisiert`);
      if (result.deleted > 0) parts.push(`${result.deleted} entfernt`);
      return parts.length > 0
        ? `Gespeichert: ${parts.join(", ")}.`
        : "Keine Änderungen.";
    }
    case "not-authed":
      return "Bitte zuerst einloggen.";
    case "forbidden":
      return "Du bist nicht berechtigt, Leistungen für diesen Betrieb zu ändern.";
    case "validation":
      return "Bitte prüfe die markierten Felder.";
    case "local-fallback":
      // Static-Build / offline → Form-Code zeigt ein Demo-Banner.
      return null;
    case "fail":
      return `Speichern fehlgeschlagen: ${result.reason}`;
  }
}
