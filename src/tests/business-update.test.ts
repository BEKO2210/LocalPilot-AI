/**
 * Smoketest für Business-Update-Helper (Code-Session 50).
 *
 * Pure-Function-Test: kein Browser, kein Server. Wir injizieren
 * `fetchImpl` und prüfen alle 7 Result-Pfade.
 */

import {
  profileToBusinessRow,
  submitBusinessUpdate,
  userMessageForResult,
  type BusinessUpdateResult,
} from "@/lib/business-update";
import { BusinessProfileSchema } from "@/core/validation/business-profile.schema";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`business-update assertion failed: ${message}`);
}

const VALID_PROFILE = BusinessProfileSchema.parse({
  name: "Studio Haarlinie",
  industryKey: "hairdresser",
  locale: "de",
  tagline: "Friseur in Musterstadt",
  description:
    "Wir sind ein moderner Friseursalon in Musterstadt — Termine flexibel, Beratung persönlich.",
  address: {
    street: "Lindenallee 14",
    city: "Musterstadt",
    postalCode: "12345",
    country: "DE",
  },
  contact: { phone: "+49 30 9000 1234" },
  openingHours: [],
  themeKey: "beauty_luxury",
});

async function main() {
  // ---------------------------------------------------------------------
  // 1. profileToBusinessRow: camelCase → snake_case + null-fallback
  // ---------------------------------------------------------------------
  const row = profileToBusinessRow(VALID_PROFILE);
  assert(row.name === "Studio Haarlinie", "Name durchgereicht");
  assert(row.industry_key === "hairdresser", "industry_key snake_case");
  assert(row.theme_key === "beauty_luxury", "theme_key snake_case");
  assert(row.opening_hours.length === 0, "opening_hours leer als []");
  assert(row.logo_url === null, "fehlende logoUrl → null (nicht undefined)");
  assert(row.cover_image_url === null, "fehlende coverImageUrl → null");
  assert(row.primary_color === null, "fehlende primaryColor → null");

  const withColors = profileToBusinessRow({
    ...VALID_PROFILE,
    primaryColor: "#1f47d6",
    secondaryColor: "#0f1320",
  });
  assert(withColors.primary_color === "#1f47d6", "primaryColor durchgereicht");
  assert(withColors.secondary_color === "#0f1320", "secondaryColor durchgereicht");
  assert(withColors.accent_color === null, "accentColor weiterhin null");

  // ---------------------------------------------------------------------
  // 2. Submit: 200 → server
  // ---------------------------------------------------------------------
  const fetch200: typeof fetch = async (input, init) => {
    const url = String(input);
    assert(
      url.startsWith("/api/businesses/") && url.endsWith("/studio-haarlinie"),
      `URL korrekt zusammengesetzt, war: ${url}`,
    );
    assert(init?.method === "PATCH", "Methode = PATCH");
    return new Response(
      JSON.stringify({ ok: true, slug: "studio-haarlinie" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  const r200 = await submitBusinessUpdate(
    "studio-haarlinie",
    VALID_PROFILE,
    { fetchImpl: fetch200 },
  );
  assert(r200.kind === "server", "200 → server-Result");
  assert(
    (r200 as Extract<BusinessUpdateResult, { kind: "server" }>).slug ===
      "studio-haarlinie",
    "Slug durchgereicht",
  );
  assert(userMessageForResult(r200) === null, "server → silent (Form zeigt eigenes 'Gespeichert')");

  // ---------------------------------------------------------------------
  // 3. 200 ohne JSON → server, Slug aus Input-Fallback
  // ---------------------------------------------------------------------
  const fetch200NoBody: typeof fetch = async () =>
    new Response("not-json", { status: 200 });
  const r200nb = await submitBusinessUpdate("xyz", VALID_PROFILE, {
    fetchImpl: fetch200NoBody,
  });
  assert(r200nb.kind === "server", "200 ohne Body → server");
  assert(
    (r200nb as Extract<BusinessUpdateResult, { kind: "server" }>).slug === "xyz",
    "Fallback auf Input-Slug",
  );

  // ---------------------------------------------------------------------
  // 4. 404 (Static-Build) → local-fallback
  // ---------------------------------------------------------------------
  const fetch404: typeof fetch = async () => new Response("", { status: 404 });
  const r404 = await submitBusinessUpdate("x", VALID_PROFILE, {
    fetchImpl: fetch404,
  });
  assert(r404.kind === "local-fallback", "404 → local-fallback");
  assert(
    (r404 as Extract<BusinessUpdateResult, { kind: "local-fallback" }>)
      .reason.toLowerCase()
      .includes("static"),
    "Reason nennt Static-Build",
  );
  assert(
    userMessageForResult(r404) === null,
    "local-fallback → silent (Form zeigt 'Demo-Modus'-Banner schon",
  );

  // ---------------------------------------------------------------------
  // 5. 401 → not-authed
  // ---------------------------------------------------------------------
  const fetch401: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  const r401 = await submitBusinessUpdate("x", VALID_PROFILE, {
    fetchImpl: fetch401,
  });
  assert(r401.kind === "not-authed", "401 → not-authed");
  const m401 = userMessageForResult(r401);
  assert(typeof m401 === "string" && m401.includes("einloggen"), "Hinweis nennt Login");

  // ---------------------------------------------------------------------
  // 6. 403 → forbidden
  // ---------------------------------------------------------------------
  const fetch403: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  const r403 = await submitBusinessUpdate("x", VALID_PROFILE, {
    fetchImpl: fetch403,
  });
  assert(r403.kind === "forbidden", "403 → forbidden");
  const m403 = userMessageForResult(r403);
  assert(
    typeof m403 === "string" && m403.toLowerCase().includes("nicht berechtigt"),
    "Hinweis nennt fehlende Berechtigung",
  );

  // ---------------------------------------------------------------------
  // 7. 400 mit fieldErrors → validation
  // ---------------------------------------------------------------------
  const fetch400: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        error: "validation",
        fieldErrors: { name: "Name zu kurz" },
      }),
      { status: 400 },
    );
  const r400 = await submitBusinessUpdate("x", VALID_PROFILE, {
    fetchImpl: fetch400,
  });
  assert(r400.kind === "validation", "400 mit fieldErrors → validation");
  const fe = (r400 as Extract<BusinessUpdateResult, { kind: "validation" }>)
    .fieldErrors;
  assert(fe.name === "Name zu kurz", "fieldErrors durchgereicht");

  // ---------------------------------------------------------------------
  // 8. 5xx → fail
  // ---------------------------------------------------------------------
  const fetch500: typeof fetch = async () =>
    new Response(
      JSON.stringify({ error: "unknown", message: "DB ist down" }),
      { status: 500 },
    );
  const r500 = await submitBusinessUpdate("x", VALID_PROFILE, {
    fetchImpl: fetch500,
  });
  assert(r500.kind === "fail", "500 → fail");
  assert(
    (r500 as Extract<BusinessUpdateResult, { kind: "fail" }>).reason ===
      "DB ist down",
    "Body-Message wird Reason",
  );
  const m500 = userMessageForResult(r500);
  assert(
    typeof m500 === "string" && m500.includes("DB ist down"),
    "User-Text enthält Reason",
  );

  // ---------------------------------------------------------------------
  // 9. fetch wirft (offline) → local-fallback
  // ---------------------------------------------------------------------
  const fetchThrows: typeof fetch = async () => {
    throw new Error("Failed to fetch");
  };
  const rThrow = await submitBusinessUpdate("x", VALID_PROFILE, {
    fetchImpl: fetchThrows,
  });
  assert(rThrow.kind === "local-fallback", "throw → local-fallback");
  assert(
    (rThrow as Extract<BusinessUpdateResult, { kind: "local-fallback" }>)
      .reason === "Failed to fetch",
    "reason = Error-Message",
  );

  // ---------------------------------------------------------------------
  // 10. Body-Capture: PATCH-Body enthält profileToBusinessRow-Output
  // ---------------------------------------------------------------------
  let capturedBody: unknown = null;
  const captureFetch: typeof fetch = async (_input, init) => {
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
    return new Response(JSON.stringify({ ok: true, slug: "x" }), {
      status: 200,
    });
  };
  await submitBusinessUpdate("x", VALID_PROFILE, { fetchImpl: captureFetch });
  assert(typeof capturedBody === "object" && capturedBody !== null, "Body gesendet");
  const sent = capturedBody as Record<string, unknown>;
  assert(sent.name === VALID_PROFILE.name, "name im Body");
  assert(sent.industry_key === "hairdresser", "snake_case industry_key");
  assert(sent.theme_key === "beauty_luxury", "snake_case theme_key");
  assert("logo_url" in sent, "logo_url-Key vorhanden (auch wenn null)");
  assert(sent.logo_url === null, "logo_url ist null bei fehlendem Wert");

  // ---------------------------------------------------------------------
  // 11. URL-Encoding: Slug mit Sonderzeichen wird sauber escaped
  // ---------------------------------------------------------------------
  let capturedUrl = "";
  const captureUrlFetch: typeof fetch = async (input) => {
    capturedUrl = String(input);
    return new Response("{}", { status: 200 });
  };
  await submitBusinessUpdate("möbel-müller", VALID_PROFILE, {
    fetchImpl: captureUrlFetch,
  });
  // encodeURIComponent ist konventionell; Slugs werden ohnehin
  // ASCII-gehalten (siehe onboarding-validate), aber die Funktion
  // bleibt robust.
  assert(
    capturedUrl.includes("/api/businesses/") &&
      !capturedUrl.includes("/api/businesses/möbel"),
    `URL wird URL-encoded (war: ${capturedUrl})`,
  );

  console.log("business-update smoketest ✅ (~30 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __BUSINESS_UPDATE_SMOKETEST__ = { totalAssertions: 30 };
