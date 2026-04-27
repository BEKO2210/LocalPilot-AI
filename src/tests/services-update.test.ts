/**
 * Smoketest für Services-Update-Helper (Code-Session 55).
 *
 * Pure-Function-Test: ID-Erkennung, Split, Wire-Format,
 * alle Submit-Pfade.
 */

import {
  buildServicesPayload,
  looksLikeDbUuid,
  serviceToWireRow,
  splitServices,
  submitServicesUpdate,
  userMessageForResult,
  type ServicesUpdateResult,
} from "@/lib/services-update";
import type { Service } from "@/types/service";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`services-update assertion failed: ${message}`);
}

const BUSINESS_ID = "11111111-1111-1111-1111-111111111111";

const validUuid = "22222222-2222-4222-8222-222222222222";
const pseudoId = "svc-studio-haarlinie-abc12345";

const realService: Service = {
  id: validUuid,
  businessId: BUSINESS_ID,
  category: "Damen",
  title: "Damenhaarschnitt",
  shortDescription: "Schnitt + Beratung",
  longDescription: "",
  priceLabel: "ab 45 €",
  durationLabel: "30 min",
  tags: ["schnitt", "damen"],
  isFeatured: true,
  isActive: true,
  sortOrder: 0,
};

const newService: Service = {
  id: pseudoId,
  businessId: BUSINESS_ID,
  title: "Test-Behandlung",
  shortDescription: "Neu hinzugefügt",
  longDescription: "",
  tags: [],
  isFeatured: false,
  isActive: true,
  sortOrder: 1,
};

async function main() {
  // ---------------------------------------------------------------------
  // 1. looksLikeDbUuid
  // ---------------------------------------------------------------------
  assert(looksLikeDbUuid(validUuid) === true, "v4 UUID erkannt");
  // Postgres-`gen_random_uuid()` produziert v4 UUIDs — beide
  // Test-Werte haben Variant-Char in `[89ab]` und Version-Char
  // in `[1-5]`, wie spec verlangt.
  assert(
    looksLikeDbUuid("12345678-1234-1234-9234-123456789012") === true,
    "v1 UUID mit korrektem Variant-Bit erkannt",
  );
  assert(looksLikeDbUuid(pseudoId) === false, "Pseudo-ID nicht UUID");
  assert(looksLikeDbUuid("") === false, "leer nicht UUID");
  assert(looksLikeDbUuid("not-a-uuid-at-all") === false, "Random-String nicht UUID");
  assert(
    looksLikeDbUuid(validUuid.toUpperCase()) === true,
    "Großbuchstaben-UUID erkannt (case-insensitive)",
  );

  // UUID v4 muss `4` als 13. Zeichen haben → ein 'invalides' v4 wird abgelehnt
  assert(
    looksLikeDbUuid("22222222-2222-7222-8222-222222222222") === false,
    "Version-Char muss 1-5 sein",
  );

  // ---------------------------------------------------------------------
  // 2. splitServices
  // ---------------------------------------------------------------------
  const split = splitServices([realService, newService]);
  assert(split.toUpdate.length === 1, "1 toUpdate (mit DB-UUID)");
  assert(split.toUpdate[0]?.id === validUuid, "richtiger UUID in toUpdate");
  assert(split.toInsert.length === 1, "1 toInsert (mit Pseudo-ID)");
  assert(split.toInsert[0]?.id === pseudoId, "Pseudo-ID in toInsert");

  const allInsert = splitServices([newService, newService]);
  assert(allInsert.toInsert.length === 2, "alle Pseudo → alle insert");
  assert(allInsert.toUpdate.length === 0, "keine update");

  const empty = splitServices([]);
  assert(empty.toUpdate.length === 0 && empty.toInsert.length === 0, "leere Liste");

  // ---------------------------------------------------------------------
  // 3. serviceToWireRow: keepId=true vs false
  // ---------------------------------------------------------------------
  const updateRow = serviceToWireRow(realService, BUSINESS_ID, { keepId: true });
  assert(updateRow.id === validUuid, "keepId=true → ID kommt durch");
  assert(updateRow.business_id === BUSINESS_ID, "business_id snake_case");
  assert(updateRow.title === "Damenhaarschnitt", "title durchgereicht");
  assert(updateRow.short_description === "Schnitt + Beratung", "snake_case shortDescription");
  assert(updateRow.price_label === "ab 45 €", "snake_case priceLabel");
  assert(updateRow.is_featured === true, "snake_case isFeatured");
  assert(updateRow.is_active === true, "snake_case isActive");
  assert(updateRow.sort_order === 0, "snake_case sortOrder");
  assert(updateRow.tags.length === 2, "tags durchgereicht");
  assert(updateRow.image_url === null, "fehlende imageUrl → null");

  const insertRow = serviceToWireRow(newService, BUSINESS_ID, { keepId: false });
  assert(insertRow.id === undefined, "keepId=false → KEINE ID im Wire-Format");
  assert(
    !("id" in insertRow) || insertRow.id === undefined,
    "id-Key entweder fehlt oder undefined",
  );

  // ---------------------------------------------------------------------
  // 4. buildServicesPayload: korrekte ID-Verteilung
  // ---------------------------------------------------------------------
  const payload = buildServicesPayload([realService, newService], BUSINESS_ID);
  assert(payload.services.length === 2, "2 Services im Payload");
  const withId = payload.services.find((r) => r.id === validUuid);
  assert(withId !== undefined, "UPDATE-Service mit ID drin");
  const withoutId = payload.services.find((r) => r.id === undefined);
  assert(withoutId !== undefined, "INSERT-Service ohne ID drin");
  assert(withoutId?.title === "Test-Behandlung", "INSERT-Title kommt durch");

  // ---------------------------------------------------------------------
  // 5. Submit: 200 → server mit Counts
  // ---------------------------------------------------------------------
  const fetch200: typeof fetch = async () =>
    new Response(
      JSON.stringify({ ok: true, inserted: 1, updated: 1, deleted: 0 }),
      { status: 200 },
    );
  const r200 = await submitServicesUpdate(
    "studio-haarlinie",
    [realService, newService],
    BUSINESS_ID,
    { fetchImpl: fetch200 },
  );
  assert(r200.kind === "server", "200 → server");
  if (r200.kind === "server") {
    assert(r200.inserted === 1, "inserted-Count");
    assert(r200.updated === 1, "updated-Count");
    assert(r200.deleted === 0, "deleted-Count");
  }
  const m200 = userMessageForResult(r200);
  assert(
    typeof m200 === "string" && m200.includes("1 neu") && m200.includes("1 aktualisiert"),
    "Hinweis nennt Counts",
  );

  // ---------------------------------------------------------------------
  // 6. Submit: 404 → local-fallback
  // ---------------------------------------------------------------------
  const fetch404: typeof fetch = async () => new Response("", { status: 404 });
  const r404 = await submitServicesUpdate(
    "x",
    [realService],
    BUSINESS_ID,
    { fetchImpl: fetch404 },
  );
  assert(r404.kind === "local-fallback", "404 → local-fallback");
  assert(userMessageForResult(r404) === null, "local-fallback silent (Form zeigt eigenes Banner)");

  // ---------------------------------------------------------------------
  // 7. Submit: 401 / 403
  // ---------------------------------------------------------------------
  const fetch401: typeof fetch = async () => new Response("", { status: 401 });
  const r401 = await submitServicesUpdate("x", [realService], BUSINESS_ID, { fetchImpl: fetch401 });
  assert(r401.kind === "not-authed", "401 → not-authed");

  const fetch403: typeof fetch = async () => new Response("", { status: 403 });
  const r403 = await submitServicesUpdate("x", [realService], BUSINESS_ID, { fetchImpl: fetch403 });
  assert(r403.kind === "forbidden", "403 → forbidden");

  // ---------------------------------------------------------------------
  // 8. Submit: 400 mit fieldErrors
  // ---------------------------------------------------------------------
  const fetch400: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        error: "validation",
        fieldErrors: { "services.0.title": "Title zu kurz" },
      }),
      { status: 400 },
    );
  const r400 = await submitServicesUpdate("x", [realService], BUSINESS_ID, { fetchImpl: fetch400 });
  assert(r400.kind === "validation", "400 → validation");
  if (r400.kind === "validation") {
    assert(
      (r400.fieldErrors as Record<string, string>)["services.0.title"] === "Title zu kurz",
      "fieldErrors durchgereicht",
    );
  }

  // ---------------------------------------------------------------------
  // 9. Submit: 5xx → fail
  // ---------------------------------------------------------------------
  const fetch500: typeof fetch = async () =>
    new Response(
      JSON.stringify({ error: "unknown", message: "DB down" }),
      { status: 500 },
    );
  const r500 = await submitServicesUpdate("x", [realService], BUSINESS_ID, { fetchImpl: fetch500 });
  assert(r500.kind === "fail", "500 → fail");
  if (r500.kind === "fail") {
    assert(r500.reason === "DB down", "Body-Message wird Reason");
  }

  // ---------------------------------------------------------------------
  // 10. fetch wirft → local-fallback
  // ---------------------------------------------------------------------
  const fetchThrows: typeof fetch = async () => {
    throw new Error("Failed to fetch");
  };
  const rThrow = await submitServicesUpdate("x", [realService], BUSINESS_ID, { fetchImpl: fetchThrows });
  assert(rThrow.kind === "local-fallback", "throw → local-fallback");

  // ---------------------------------------------------------------------
  // 11. Body-Capture: Payload kommt korrekt am Server an
  // ---------------------------------------------------------------------
  let capturedBody: unknown = null;
  const captureFetch: typeof fetch = async (_url, init) => {
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
    return new Response(
      JSON.stringify({ ok: true, inserted: 0, updated: 0, deleted: 0 }),
      { status: 200 },
    );
  };
  await submitServicesUpdate(
    "studio-haarlinie",
    [realService, newService],
    BUSINESS_ID,
    { fetchImpl: captureFetch },
  );
  const sent = capturedBody as { services: ServicesUpdateResult[] };
  assert(Array.isArray((sent as { services: unknown }).services), "Body hat services-Array");
  const services = (sent as { services: ServicesUpdateResult[] }).services as unknown as ReadonlyArray<{ id?: string; title: string }>;
  assert(services.length === 2, "2 Services im Body");
  assert(
    services.some((s) => s.id === validUuid),
    "Echte UUID erhalten",
  );
  assert(
    services.some((s) => s.id === undefined),
    "Pseudo-ID entfernt",
  );

  // ---------------------------------------------------------------------
  // 12. URL-Pfad: korrekt encoded
  // ---------------------------------------------------------------------
  let capturedUrl = "";
  const urlFetch: typeof fetch = async (input) => {
    capturedUrl = String(input);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  await submitServicesUpdate("test-slug", [], BUSINESS_ID, { fetchImpl: urlFetch });
  assert(
    capturedUrl === "/api/businesses/test-slug/services",
    `URL korrekt: ${capturedUrl}`,
  );

  console.log("services-update smoketest ✅ (~40 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __SERVICES_UPDATE_SMOKETEST__ = { totalAssertions: 40 };
