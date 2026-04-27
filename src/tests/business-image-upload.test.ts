/**
 * Smoketest für Business-Image-Upload-Helper (Code-Session 51).
 *
 * Pure-Function-Test: kein echter Storage. Wir prüfen
 * Validierung (Mime, Größe, leere Datei), Pfad-Bau, alle 5
 * Submit-Result-Pfade.
 *
 * Polyfill: das tsx-CJS-Setup hat kein nativeses `File`, wir
 * setzen einen Test-Stub mit `name`, `size`, `type`.
 */

import {
  buildStoragePath,
  extensionForMime,
  submitImageUpload,
  userMessageForResult,
  validateImageFile,
} from "@/lib/business-image-upload";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`business-image-upload assertion failed: ${message}`);
}

/** Minimal-File-Stub für die Tests — nur die Felder, die der Helper liest. */
function makeFile(opts: {
  name?: string;
  size: number;
  type: string;
}): File {
  // Wir umgehen den File-Konstruktor (tsx-cjs hat ihn nicht
  // immer). Object-Literal mit den zugegriffenen Feldern reicht.
  return {
    name: opts.name ?? "image.png",
    size: opts.size,
    type: opts.type,
    lastModified: 0,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(opts.size)),
    slice: () => new Blob(),
    stream: () => new ReadableStream(),
    text: () => Promise.resolve(""),
    webkitRelativePath: "",
  } as unknown as File;
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. validateImageFile: erfolgreiche und gescheiterte Pfade
  // ---------------------------------------------------------------------
  const okPng = validateImageFile(
    makeFile({ size: 100_000, type: "image/png" }),
  );
  assert(okPng.ok === true, "kleines PNG ok");

  const okJpg = validateImageFile(
    makeFile({ size: 500_000, type: "image/jpeg" }),
  );
  assert(okJpg.ok === true, "JPEG ok");

  const okWebp = validateImageFile(
    makeFile({ size: 1_000_000, type: "image/webp" }),
  );
  assert(okWebp.ok === true, "WebP ok");

  const empty = validateImageFile(makeFile({ size: 0, type: "image/png" }));
  assert(empty.ok === false, "leere Datei abgelehnt");
  if (!empty.ok) {
    assert(empty.message.includes("leer"), "Hinweis nennt leere Datei");
  }

  const tooBig = validateImageFile(
    makeFile({ size: 6 * 1024 * 1024, type: "image/png" }),
  );
  assert(tooBig.ok === false, "6 MB > 5 MB Limit → abgelehnt");
  if (!tooBig.ok) {
    assert(tooBig.message.includes("zu groß"), "Hinweis nennt Größe");
    assert(tooBig.message.includes("5 MB"), "Hinweis nennt Limit");
  }

  const svg = validateImageFile(
    makeFile({ size: 1000, type: "image/svg+xml" }),
  );
  assert(svg.ok === false, "SVG → abgelehnt (XSS-Risiko)");
  if (!svg.ok) {
    assert(svg.message.includes("SVG"), "Hinweis nennt SVG explizit");
  }

  const gif = validateImageFile(
    makeFile({ size: 1000, type: "image/gif" }),
  );
  assert(gif.ok === false, "GIF nicht in Whitelist");

  const pdf = validateImageFile(
    makeFile({ size: 1000, type: "application/pdf" }),
  );
  assert(pdf.ok === false, "PDF nicht in Whitelist");

  // ---------------------------------------------------------------------
  // 2. extensionForMime
  // ---------------------------------------------------------------------
  assert(extensionForMime("image/png") === "png", "png → png");
  assert(extensionForMime("image/jpeg") === "jpg", "jpeg → jpg");
  assert(extensionForMime("image/webp") === "webp", "webp → webp");
  assert(extensionForMime("application/octet-stream") === "bin", "Fallback → bin");

  // ---------------------------------------------------------------------
  // 3. buildStoragePath: Slug-basiert + Kind-basiert
  // ---------------------------------------------------------------------
  const logoPath = buildStoragePath("studio-haarlinie", "logo", "image/png");
  assert(logoPath === "studio-haarlinie/logo.png", "Logo-Pfad");

  const coverPath = buildStoragePath(
    "auto-mueller",
    "cover",
    "image/jpeg",
  );
  assert(coverPath === "auto-mueller/cover.jpg", "Cover-Pfad mit jpg");

  const webpPath = buildStoragePath("xyz", "logo", "image/webp");
  assert(webpPath === "xyz/logo.webp", "WebP-Pfad");

  // Service-Pfad mit serviceId (Code-Session 58)
  const servicePath = buildStoragePath(
    "studio-haarlinie",
    "service",
    "image/png",
    { serviceId: "22222222-2222-4222-8222-222222222222" },
  );
  assert(
    servicePath ===
      "studio-haarlinie/services/22222222-2222-4222-8222-222222222222.png",
    "Service-Pfad mit serviceId",
  );

  // Service-Kind ohne serviceId → Throw
  let threw = false;
  try {
    buildStoragePath("xyz", "service", "image/png");
  } catch {
    threw = true;
  }
  assert(threw, "service ohne serviceId → Throw");

  // ---------------------------------------------------------------------
  // 4. Submit: 200 → server
  // ---------------------------------------------------------------------
  const validFile = makeFile({ size: 100_000, type: "image/png" });
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedFormDataKeys: string[] = [];
  const fetch200: typeof fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedMethod = init?.method ?? "";
    if (init?.body instanceof FormData) {
      capturedFormDataKeys = Array.from(init.body.keys());
    }
    return new Response(
      JSON.stringify({
        ok: true,
        publicUrl: "https://test.supabase.co/storage/v1/object/public/business-images/studio-haarlinie/logo.png",
        path: "studio-haarlinie/logo.png",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  const r200 = await submitImageUpload(
    "studio-haarlinie",
    "logo",
    validFile,
    { fetchImpl: fetch200 },
  );
  assert(r200.kind === "server", "200 → server");
  if (r200.kind === "server") {
    assert(
      r200.publicUrl.includes("storage/v1/object/public"),
      "publicUrl durchgereicht",
    );
    assert(
      r200.path === "studio-haarlinie/logo.png",
      "path durchgereicht",
    );
  }
  assert(
    capturedUrl.includes("/api/businesses/studio-haarlinie/image"),
    `URL korrekt: ${capturedUrl}`,
  );
  assert(capturedMethod === "POST", "POST-Methode");
  assert(
    capturedFormDataKeys.includes("kind") && capturedFormDataKeys.includes("file"),
    "FormData hat kind + file",
  );

  // ---------------------------------------------------------------------
  // 5. 200 ohne publicUrl → fail
  // ---------------------------------------------------------------------
  const fetch200NoUrl: typeof fetch = async () =>
    new Response(JSON.stringify({ ok: true }), { status: 200 });
  const rNoUrl = await submitImageUpload(
    "x",
    "logo",
    validFile,
    { fetchImpl: fetch200NoUrl },
  );
  assert(rNoUrl.kind === "fail", "200 ohne URL → fail");

  // ---------------------------------------------------------------------
  // 6. 401 → not-authed
  // ---------------------------------------------------------------------
  const fetch401: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  const r401 = await submitImageUpload("x", "logo", validFile, {
    fetchImpl: fetch401,
  });
  assert(r401.kind === "not-authed", "401 → not-authed");
  assert(
    userMessageForResult(r401).includes("einloggen"),
    "Hinweis sagt 'einloggen'",
  );

  // ---------------------------------------------------------------------
  // 7. 403 → forbidden
  // ---------------------------------------------------------------------
  const fetch403: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  const r403 = await submitImageUpload("x", "logo", validFile, {
    fetchImpl: fetch403,
  });
  assert(r403.kind === "forbidden", "403 → forbidden");

  // ---------------------------------------------------------------------
  // 8. 400 mit Server-Message → validation
  // ---------------------------------------------------------------------
  const fetch400: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        error: "validation",
        message: "Datei ist zu groß auf dem Server.",
      }),
      { status: 400 },
    );
  const r400 = await submitImageUpload("x", "logo", validFile, {
    fetchImpl: fetch400,
  });
  assert(r400.kind === "validation", "400 → validation");
  if (r400.kind === "validation") {
    assert(r400.message.includes("zu groß"), "Server-Message durchgereicht");
  }

  // ---------------------------------------------------------------------
  // 9. 500 → fail
  // ---------------------------------------------------------------------
  const fetch500: typeof fetch = async () =>
    new Response(
      JSON.stringify({ error: "unknown", message: "Storage-API down" }),
      { status: 500 },
    );
  const r500 = await submitImageUpload("x", "logo", validFile, {
    fetchImpl: fetch500,
  });
  assert(r500.kind === "fail", "500 → fail");

  // ---------------------------------------------------------------------
  // 10. fetch wirft → fail
  // ---------------------------------------------------------------------
  const fetchThrows: typeof fetch = async () => {
    throw new Error("Failed to fetch");
  };
  const rThrow = await submitImageUpload("x", "logo", validFile, {
    fetchImpl: fetchThrows,
  });
  assert(rThrow.kind === "fail", "throw → fail");
  if (rThrow.kind === "fail") {
    assert(rThrow.reason === "Failed to fetch", "reason = Error-Message");
  }

  // ---------------------------------------------------------------------
  // 11. Pre-Validation: ungültige Datei → kein Server-Roundtrip
  // ---------------------------------------------------------------------
  let serverHit = false;
  const sentinelFetch: typeof fetch = async () => {
    serverHit = true;
    return new Response("{}", { status: 200 });
  };
  const tooLargeFile = makeFile({ size: 10_000_000, type: "image/png" });
  const rPre = await submitImageUpload("x", "logo", tooLargeFile, {
    fetchImpl: sentinelFetch,
  });
  assert(rPre.kind === "validation", "client-pre-validation → validation");
  assert(!serverHit, "fetch wurde NICHT gerufen bei Client-Validation-Fail");

  // SVG-Pre-Check
  const svgFile = makeFile({ size: 1000, type: "image/svg+xml" });
  const rSvg = await submitImageUpload("x", "logo", svgFile, {
    fetchImpl: sentinelFetch,
  });
  assert(rSvg.kind === "validation", "SVG → client-validation-fail");

  // ---------------------------------------------------------------------
  // 12. Privacy: kein Slug-/Path-Leak in Error-Pfaden (defensive)
  // ---------------------------------------------------------------------
  const dump = JSON.stringify(rThrow);
  assert(!dump.includes("supabase.co"), "kein zufälliger URL-Leak im fail-Pfad");

  // ---------------------------------------------------------------------
  // 13. Service-Kind: serviceId fehlt → client-validation
  // ---------------------------------------------------------------------
  let svcServerHit = false;
  const svcSentinel: typeof fetch = async () => {
    svcServerHit = true;
    return new Response("{}", { status: 200 });
  };
  const rNoServiceId = await submitImageUpload(
    "x",
    "service",
    validFile,
    { fetchImpl: svcSentinel },
  );
  assert(
    rNoServiceId.kind === "validation",
    "service ohne serviceId → client-validation",
  );
  assert(!svcServerHit, "kein fetch ohne serviceId");

  // ---------------------------------------------------------------------
  // 14. Service-Kind: serviceId wird ins FormData gepackt
  // ---------------------------------------------------------------------
  let svcFormDataKeys: string[] = [];
  let svcServiceIdValue: FormDataEntryValue | null = null;
  const svcFetch: typeof fetch = async (_input, init) => {
    if (init?.body instanceof FormData) {
      svcFormDataKeys = Array.from(init.body.keys());
      svcServiceIdValue = init.body.get("serviceId");
    }
    return new Response(
      JSON.stringify({
        ok: true,
        publicUrl: "https://test/storage/v1/object/public/business-images/x/services/uuid.png",
        path: "x/services/uuid.png",
      }),
      { status: 200 },
    );
  };
  const rWithSvc = await submitImageUpload(
    "x",
    "service",
    validFile,
    { fetchImpl: svcFetch },
    { serviceId: "22222222-2222-4222-8222-222222222222" },
  );
  assert(rWithSvc.kind === "server", "service mit serviceId → server");
  assert(
    svcFormDataKeys.includes("serviceId"),
    "FormData enthält serviceId-Feld",
  );
  assert(
    svcServiceIdValue === "22222222-2222-4222-8222-222222222222",
    "serviceId-Wert korrekt durchgereicht",
  );

  console.log("business-image-upload smoketest ✅ (~40 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __BUSINESS_IMAGE_UPLOAD_SMOKETEST__ = { totalAssertions: 40 };
