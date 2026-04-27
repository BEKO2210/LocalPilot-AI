/**
 * Smoketest für Settings-Helper (Code-Session 52).
 *
 * Pure-Function-Test: Validierung + Fetch-Wrapper.
 */

import {
  submitSettingsUpdate,
  userMessageForResult,
  validateSettingsInput,
} from "@/lib/business-settings";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`business-settings assertion failed: ${message}`);
}

const CURRENT = "studio-haarlinie";

async function main() {
  // ---------------------------------------------------------------------
  // 1. Validation: leerer Input → ok mit leerem value (noop)
  // ---------------------------------------------------------------------
  const empty = validateSettingsInput({}, { currentSlug: CURRENT });
  assert(empty.ok === true, "leerer Input ok");
  if (empty.ok) {
    assert(Object.keys(empty.value).length === 0, "leerer value → noop");
  }

  // ---------------------------------------------------------------------
  // 2. Validation: nur isPublished → durchgereicht
  // ---------------------------------------------------------------------
  const pub = validateSettingsInput(
    { isPublished: true },
    { currentSlug: CURRENT },
  );
  assert(pub.ok === true, "isPublished-only ok");
  if (pub.ok) {
    assert(pub.value.isPublished === true, "isPublished durchgereicht");
    assert(pub.value.newSlug === undefined, "kein newSlug");
  }

  // ---------------------------------------------------------------------
  // 3. Validation: newSlug = currentSlug → wird normalisiert (kein UPDATE)
  // ---------------------------------------------------------------------
  const sameSlug = validateSettingsInput(
    { newSlug: CURRENT },
    { currentSlug: CURRENT },
  );
  assert(sameSlug.ok === true, "Slug unverändert ist ok");
  if (sameSlug.ok) {
    assert(
      sameSlug.value.newSlug === undefined,
      "gleicher Slug → wird aus Output gestrichen (kein UPDATE)",
    );
  }

  // ---------------------------------------------------------------------
  // 4. Validation: Slug-Format-Fehler
  // ---------------------------------------------------------------------
  const tooShort = validateSettingsInput(
    { newSlug: "ab" },
    { currentSlug: CURRENT },
  );
  assert(!tooShort.ok && "newSlug" in tooShort.errors, "kurzer Slug → error");

  const startsDash = validateSettingsInput(
    { newSlug: "-foo" },
    { currentSlug: CURRENT },
  );
  assert(
    !startsDash.ok && "newSlug" in startsDash.errors,
    "Bindestrich-Anfang → error",
  );

  const upperOk = validateSettingsInput(
    { newSlug: "STUDIO" },
    { currentSlug: CURRENT },
  );
  assert(upperOk.ok === true, "Großbuchstaben werden lowercased");
  if (upperOk.ok) {
    assert(upperOk.value.newSlug === "studio", "lowercase normalisiert");
  }

  const reserved = validateSettingsInput(
    { newSlug: "admin" },
    { currentSlug: CURRENT },
  );
  assert(
    !reserved.ok && "newSlug" in reserved.errors,
    "Reserved-Slug 'admin' → error",
  );

  const dashboard = validateSettingsInput(
    { newSlug: "dashboard" },
    { currentSlug: CURRENT },
  );
  assert(
    !dashboard.ok && "newSlug" in dashboard.errors,
    "Reserved 'dashboard' → error",
  );

  // ---------------------------------------------------------------------
  // 5. Validation: Locale
  // ---------------------------------------------------------------------
  const validLocale = validateSettingsInput(
    { locale: "en" },
    { currentSlug: CURRENT },
  );
  assert(validLocale.ok === true, "valider Locale ok");

  const badLocale = validateSettingsInput(
    { locale: "fr" as "de" },
    { currentSlug: CURRENT },
  );
  assert(
    !badLocale.ok && "locale" in badLocale.errors,
    "Locale 'fr' → error",
  );

  // ---------------------------------------------------------------------
  // 6. Submit: noop bei leerem Diff (kein fetch)
  // ---------------------------------------------------------------------
  let fetchCalled = false;
  const sentinelFetch: typeof fetch = async () => {
    fetchCalled = true;
    return new Response("{}", { status: 200 });
  };
  const noop = await submitSettingsUpdate(CURRENT, {}, {
    fetchImpl: sentinelFetch,
  });
  assert(noop.kind === "noop", "leerer Input → noop");
  assert(!fetchCalled, "fetch NICHT gerufen bei noop");
  assert(
    userMessageForResult(noop)?.includes("Keine") === true,
    "noop-Hinweis sagt 'Keine Änderungen'",
  );

  // ---------------------------------------------------------------------
  // 7. Submit: 200 → server, slug nicht geändert
  // ---------------------------------------------------------------------
  let capturedBody: unknown = null;
  const fetch200: typeof fetch = async (_input, init) => {
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
    return new Response(
      JSON.stringify({ ok: true, slug: CURRENT, slugChanged: false }),
      { status: 200 },
    );
  };
  const r200 = await submitSettingsUpdate(
    CURRENT,
    { isPublished: true },
    { fetchImpl: fetch200 },
  );
  assert(r200.kind === "server", "200 → server");
  if (r200.kind === "server") {
    assert(r200.slug === CURRENT, "Slug bleibt");
    assert(r200.slugChanged === false, "slugChanged=false");
  }
  assert(
    capturedBody !== null &&
      typeof capturedBody === "object" &&
      "isPublished" in (capturedBody as object),
    "Body enthält isPublished",
  );
  assert(
    !("newSlug" in (capturedBody as object)),
    "Body enthält KEIN newSlug (war ja gleich)",
  );

  // ---------------------------------------------------------------------
  // 8. Submit: Slug-Wechsel → server mit slugChanged=true
  // ---------------------------------------------------------------------
  const fetchSlugChange: typeof fetch = async () =>
    new Response(
      JSON.stringify({ ok: true, slug: "neuer-slug", slugChanged: true }),
      { status: 200 },
    );
  const rChange = await submitSettingsUpdate(
    CURRENT,
    { newSlug: "neuer-slug" },
    { fetchImpl: fetchSlugChange },
  );
  assert(rChange.kind === "server", "Slug-Wechsel → server");
  if (rChange.kind === "server") {
    assert(rChange.slug === "neuer-slug", "neuer Slug zurück");
    assert(rChange.slugChanged === true, "slugChanged=true");
  }
  const msg = userMessageForResult(rChange);
  assert(
    typeof msg === "string" && msg.includes("neuer-slug"),
    "Hinweis nennt neuen Slug",
  );

  // ---------------------------------------------------------------------
  // 9. Submit: 409 (slug taken)
  // ---------------------------------------------------------------------
  const fetch409: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "slug_taken" }), { status: 409 });
  const r409 = await submitSettingsUpdate(
    CURRENT,
    { newSlug: "studio-haarlinie-2" },
    { fetchImpl: fetch409 },
  );
  assert(r409.kind === "slug_taken", "409 → slug_taken");
  const m409 = userMessageForResult(r409);
  assert(
    typeof m409 === "string" && m409.toLowerCase().includes("vergeben"),
    "Hinweis nennt 'vergeben'",
  );

  // ---------------------------------------------------------------------
  // 10. Submit: 401 / 403
  // ---------------------------------------------------------------------
  const fetch401: typeof fetch = async () =>
    new Response("", { status: 401 });
  const r401 = await submitSettingsUpdate(
    CURRENT,
    { isPublished: true },
    { fetchImpl: fetch401 },
  );
  assert(r401.kind === "not-authed", "401 → not-authed");

  const fetch403: typeof fetch = async () =>
    new Response("", { status: 403 });
  const r403 = await submitSettingsUpdate(
    CURRENT,
    { isPublished: true },
    { fetchImpl: fetch403 },
  );
  assert(r403.kind === "forbidden", "403 → forbidden");

  // ---------------------------------------------------------------------
  // 11. Submit: 400 mit fieldErrors
  // ---------------------------------------------------------------------
  const fetch400: typeof fetch = async () =>
    new Response(
      JSON.stringify({ error: "validation", fieldErrors: { newSlug: "Server-Slug-Hinweis" } }),
      { status: 400 },
    );
  const r400 = await submitSettingsUpdate(
    CURRENT,
    { newSlug: "neuer-slug" },
    { fetchImpl: fetch400 },
  );
  assert(r400.kind === "validation", "400 → validation");
  if (r400.kind === "validation") {
    assert(
      (r400.fieldErrors as Record<string, string>).newSlug ===
        "Server-Slug-Hinweis",
      "Server-fieldErrors durchgereicht",
    );
  }

  // ---------------------------------------------------------------------
  // 12. Submit: fetch wirft → fail
  // ---------------------------------------------------------------------
  const fetchThrows: typeof fetch = async () => {
    throw new Error("Failed to fetch");
  };
  const rThrow = await submitSettingsUpdate(
    CURRENT,
    { isPublished: true },
    { fetchImpl: fetchThrows },
  );
  assert(rThrow.kind === "fail", "throw → fail");
  if (rThrow.kind === "fail") {
    assert(rThrow.reason === "Failed to fetch", "reason = Error-Message");
  }

  // ---------------------------------------------------------------------
  // 13. Client-side Validation gewinnt vor fetch
  // ---------------------------------------------------------------------
  let preFetchCalled = false;
  const preFetchSentinel: typeof fetch = async () => {
    preFetchCalled = true;
    return new Response("", { status: 200 });
  };
  const rPre = await submitSettingsUpdate(
    CURRENT,
    { newSlug: "ab" }, // zu kurz
    { fetchImpl: preFetchSentinel },
  );
  assert(rPre.kind === "validation", "client-validation → validation");
  assert(!preFetchCalled, "fetch wurde NICHT bei client-validation-fail gerufen");

  console.log("business-settings smoketest ✅ (~30 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __BUSINESS_SETTINGS_SMOKETEST__ = { totalAssertions: 30 };
