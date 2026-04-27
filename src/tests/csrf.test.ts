/**
 * Smoketest für CSRF-Helper (Code-Session 66).
 *
 * Stub-Request-basiert: wir bauen `Request`-Instanzen mit
 * Headers und prüfen `verifyCsrfOrigin` für alle Pfade.
 */

import {
  enforceCsrf,
  parseAllowedOrigins,
  verifyCsrfOrigin,
} from "@/lib/csrf";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`csrf assertion failed: ${message}`);
}

function buildReq(opts: {
  method?: string;
  origin?: string;
  referer?: string;
  host?: string;
  forwardedHost?: string;
  forwardedProto?: string;
  authorization?: string;
}): Request {
  const headers = new Headers();
  if (opts.origin !== undefined) headers.set("origin", opts.origin);
  if (opts.referer !== undefined) headers.set("referer", opts.referer);
  if (opts.host !== undefined) headers.set("host", opts.host);
  if (opts.forwardedHost !== undefined)
    headers.set("x-forwarded-host", opts.forwardedHost);
  if (opts.forwardedProto !== undefined)
    headers.set("x-forwarded-proto", opts.forwardedProto);
  if (opts.authorization !== undefined)
    headers.set("authorization", opts.authorization);
  return new Request("https://example.test/api/x", {
    method: opts.method ?? "POST",
    headers,
  });
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. parseAllowedOrigins
  // ---------------------------------------------------------------------
  assert(parseAllowedOrigins(undefined).length === 0, "undefined → []");
  assert(parseAllowedOrigins("").length === 0, "empty → []");
  assert(parseAllowedOrigins("   ").length === 0, "whitespace → []");

  const single = parseAllowedOrigins("https://app.example.com");
  assert(single.length === 1 && single[0] === "https://app.example.com", "1 Origin");

  // Trailing-Slash wird normalisiert
  const trailing = parseAllowedOrigins("https://app.example.com/");
  assert(
    trailing[0] === "https://app.example.com",
    "Trailing-Slash normalisiert",
  );

  // Mehrere mit Whitespace
  const many = parseAllowedOrigins("https://a.com, https://b.com,https://c.com");
  assert(many.length === 3, "3 Origins");
  assert(many.includes("https://a.com"), "a drin");
  assert(many.includes("https://b.com"), "b drin");
  assert(many.includes("https://c.com"), "c drin");

  // Malformed wird durchgelassen (defensiv)
  const malformed = parseAllowedOrigins("not-a-url");
  assert(malformed[0] === "not-a-url", "malformed unverändert");

  // ---------------------------------------------------------------------
  // 2. GET/HEAD/OPTIONS → immer ok
  // ---------------------------------------------------------------------
  for (const method of ["GET", "HEAD", "OPTIONS", "get", "head", "options"]) {
    const r = verifyCsrfOrigin(buildReq({ method }));
    assert(r.ok === true, `${method} → ok`);
  }

  // ---------------------------------------------------------------------
  // 3. Bearer-Token bypasst CSRF-Check
  // ---------------------------------------------------------------------
  const bearer = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      authorization: "Bearer abc123",
      // KEIN Origin oder Host gesetzt — würde sonst fehlschlagen
    }),
  );
  assert(bearer.ok === true, "Bearer → ok ohne Origin");

  // case-insensitive
  const bearerLower = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      authorization: "bearer abc123",
    }),
  );
  assert(bearerLower.ok === true, "lowercase bearer → ok");

  // ---------------------------------------------------------------------
  // 4. Same-Origin: Origin matched Host
  // ---------------------------------------------------------------------
  const sameOrigin = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      origin: "https://app.example.com",
      host: "app.example.com",
    }),
  );
  assert(sameOrigin.ok === true, "Same-Origin → ok");

  // ---------------------------------------------------------------------
  // 5. Cross-Origin ohne Allow-List → fail
  // ---------------------------------------------------------------------
  const crossOrigin = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      origin: "https://evil.example",
      host: "app.example.com",
    }),
  );
  assert(crossOrigin.ok === false, "Cross-Origin → fail");
  if (!crossOrigin.ok) {
    assert(
      crossOrigin.reason.includes("evil.example"),
      "Reason nennt fremde Origin",
    );
  }

  // ---------------------------------------------------------------------
  // 6. Cross-Origin in Allow-List → ok
  // ---------------------------------------------------------------------
  const allowedCustomDomain = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      origin: "https://custom.kunde.de",
      host: "app.example.com",
    }),
    { allowedOrigins: ["https://custom.kunde.de"] },
  );
  assert(allowedCustomDomain.ok === true, "Allow-List-Origin → ok");

  // ---------------------------------------------------------------------
  // 7. Origin fehlt, Referer da → Referer wird genutzt
  // ---------------------------------------------------------------------
  const referer = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      referer: "https://app.example.com/some/page",
      host: "app.example.com",
    }),
  );
  assert(referer.ok === true, "Referer-Fallback → ok bei Same-Origin");

  // Cross-Origin via Referer
  const refererCross = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      referer: "https://evil.example/exploit",
      host: "app.example.com",
    }),
  );
  assert(refererCross.ok === false, "Cross-Referer → fail");
  if (!refererCross.ok) {
    assert(refererCross.reason.includes("referer"), "Reason erwähnt referer");
  }

  // Malformed Referer → keine Origin
  const malformedReferer = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      referer: "not-a-url",
      host: "app.example.com",
    }),
  );
  assert(malformedReferer.ok === false, "malformed Referer → fail");

  // ---------------------------------------------------------------------
  // 8. Origin "null" wird wie fehlender Origin behandelt
  // ---------------------------------------------------------------------
  // (Browser senden "null" bei sandboxed iframes / file://)
  const nullOrigin = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      origin: "null",
      host: "app.example.com",
    }),
  );
  assert(nullOrigin.ok === false, "Origin=null → fail");

  // ---------------------------------------------------------------------
  // 9. Weder Origin noch Referer → fail (kein silent allow)
  // ---------------------------------------------------------------------
  const noOrigin = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      host: "app.example.com",
    }),
  );
  assert(noOrigin.ok === false, "kein Origin/Referer → fail");
  if (!noOrigin.ok) {
    assert(
      noOrigin.reason.includes("Origin") || noOrigin.reason.includes("Referer"),
      "Reason erklärt fehlende Header",
    );
  }

  // Mit allowEmptyOrigin → ok (Tests / spezielle Cases)
  const noOriginAllowed = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      host: "app.example.com",
    }),
    { allowEmptyOrigin: true },
  );
  assert(noOriginAllowed.ok === true, "allowEmptyOrigin → ok");

  // ---------------------------------------------------------------------
  // 10. X-Forwarded-Host (Reverse-Proxy)
  // ---------------------------------------------------------------------
  const fwd = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      origin: "https://public.example.com",
      host: "internal-pod.cluster.local",
      forwardedHost: "public.example.com",
    }),
  );
  assert(fwd.ok === true, "X-Forwarded-Host wird respektiert");

  // X-Forwarded-Proto wird respektiert
  const fwdHttp = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      origin: "http://app.example.com",
      host: "app.example.com",
      forwardedProto: "http",
    }),
  );
  assert(fwdHttp.ok === true, "X-Forwarded-Proto=http → ok");

  // ---------------------------------------------------------------------
  // 11. Localhost-Heuristik (kein x-forwarded-proto → http)
  // ---------------------------------------------------------------------
  const localhost = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      origin: "http://localhost:3000",
      host: "localhost:3000",
    }),
  );
  assert(localhost.ok === true, "localhost:3000 same-origin → ok");

  const localIp = verifyCsrfOrigin(
    buildReq({
      method: "POST",
      origin: "http://127.0.0.1:3000",
      host: "127.0.0.1:3000",
    }),
  );
  assert(localIp.ok === true, "127.0.0.1 → ok");

  // ---------------------------------------------------------------------
  // 12. enforceCsrf → 403-Response (indirekter csrfErrorResponse-Test)
  // ---------------------------------------------------------------------
  // Cross-Origin-Request → enforceCsrf liefert eine 403-Response
  // mit der gleichen Shape wie der frühere csrfErrorResponse-Export
  // (der ist seit Session 70 internal).
  const resp = enforceCsrf(
    buildReq({
      method: "POST",
      origin: "https://evil.example",
      host: "app.example.com",
    }),
  );
  assert(resp !== null, "enforceCsrf bei Cross-Origin → Response");
  assert(resp!.status === 403, "enforceCsrf → 403");
  assert(
    resp!.headers.get("content-type") === "application/json",
    "JSON-Response",
  );
  const body = (await resp!.json()) as {
    error?: string;
    message?: string;
    detail?: string;
  };
  assert(body.error === "csrf_blocked", "error=csrf_blocked");
  assert(typeof body.message === "string", "message ist string");
  assert(typeof body.detail === "string", "detail vorhanden");

  // Same-Origin → enforceCsrf liefert null
  const okResp = enforceCsrf(
    buildReq({
      method: "POST",
      origin: "https://app.example.com",
      host: "app.example.com",
    }),
  );
  assert(okResp === null, "enforceCsrf bei Same-Origin → null");

  // ---------------------------------------------------------------------
  // 13. PUT/PATCH/DELETE werden auch geprüft
  // ---------------------------------------------------------------------
  for (const method of ["PUT", "PATCH", "DELETE"]) {
    const r = verifyCsrfOrigin(
      buildReq({
        method,
        origin: "https://evil.example",
        host: "app.example.com",
      }),
    );
    assert(r.ok === false, `${method} cross-origin → fail`);
  }

  console.log("csrf smoketest ✅ (~36 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __CSRF_SMOKETEST__ = { totalAssertions: 36 };
