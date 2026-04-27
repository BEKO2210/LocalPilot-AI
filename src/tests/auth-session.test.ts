/**
 * Smoketest für Cookie/JWT-Auth (Code-Session 33).
 *
 * Pure-Logic-Tests: kein HTTP-Server. Verifiziert HS256-JWT-Helper
 * (sign/verify mit Edge-Cases) und `checkAuth`-Routing über
 * Cookie-Header und Bearer-Header.
 */

import {
  buildSessionToken,
  signSessionToken,
  verifySessionToken,
} from "@/core/ai/auth/session";
import { SESSION_COOKIE_NAME, checkAuth, getAuthConfig } from "@/core/ai/auth/check";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`auth-session assertion failed: ${message}`);
}

const SECRET = "test-secret-must-be-at-least-32-chars-long-1234";

// -----------------------------------------------------------------------
// 1. signSessionToken erzeugt 3 Base64URL-Teile
// -----------------------------------------------------------------------
const now = 1_700_000_000;
const token = signSessionToken(
  { sub: "admin", iat: now, exp: now + 3600 },
  SECRET,
);
const parts = token.split(".");
assert(parts.length === 3, "JWT besteht aus 3 Teilen");
for (const part of parts) {
  assert(/^[A-Za-z0-9_-]+$/.test(part), `Teil ist Base64URL: '${part}'`);
}

// -----------------------------------------------------------------------
// 2. verifySessionToken: gültiges Token → Payload
// -----------------------------------------------------------------------
const payload = verifySessionToken(token, SECRET, now + 100);
assert(payload !== null, "gültiges Token → Payload");
assert(payload?.sub === "admin", "sub aus Payload");
assert(payload?.exp === now + 3600, "exp aus Payload");

// -----------------------------------------------------------------------
// 3. Falsches Secret → null
// -----------------------------------------------------------------------
assert(
  verifySessionToken(token, "different-secret-1234567890123456", now + 100) ===
    null,
  "falsches Secret → null",
);

// -----------------------------------------------------------------------
// 4. Manipuliertes Token → null
// -----------------------------------------------------------------------
const manipulated = parts[0] + "." + parts[1] + "." + parts[2]?.slice(0, -2) + "AA";
assert(
  verifySessionToken(manipulated, SECRET, now + 100) === null,
  "Tampered signature → null",
);

const wrongHeader = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0." + parts[1] + "." + parts[2];
assert(
  verifySessionToken(wrongHeader, SECRET, now + 100) === null,
  "Header alg=none → null (Header-Strict-Compare)",
);

// -----------------------------------------------------------------------
// 5. Abgelaufenes Token → null
// -----------------------------------------------------------------------
const expired = signSessionToken(
  { sub: "admin", iat: now, exp: now + 60 },
  SECRET,
);
assert(
  verifySessionToken(expired, SECRET, now + 120) === null,
  "Token nach exp → null",
);
assert(
  verifySessionToken(expired, SECRET, now + 30) !== null,
  "Token vor exp → Payload",
);

// -----------------------------------------------------------------------
// 6. Garbage-Inputs → null (kein Crash)
// -----------------------------------------------------------------------
assert(verifySessionToken("", SECRET, now) === null, "leerer Token → null");
assert(verifySessionToken("foo.bar", SECRET, now) === null, "2-Teiler → null");
assert(
  verifySessionToken("a.b.c", SECRET, now) === null,
  "Garbage Base64 → null",
);
assert(verifySessionToken(token, "", now) === null, "leeres Secret → null");

// -----------------------------------------------------------------------
// 7. signSessionToken wirft bei leerem Secret
// -----------------------------------------------------------------------
let threw = false;
try {
  signSessionToken({ sub: "admin", iat: now, exp: now + 60 }, "");
} catch {
  threw = true;
}
assert(threw, "leeres Secret → wirft");

// -----------------------------------------------------------------------
// 8. buildSessionToken-Convenience
// -----------------------------------------------------------------------
const built = buildSessionToken(SECRET, { sub: "owner", ttlSeconds: 60 });
const builtPayload = verifySessionToken(built, SECRET);
assert(builtPayload !== null, "buildSessionToken → verify ok");
assert(builtPayload?.sub === "owner", "sub-Override greift");

// -----------------------------------------------------------------------
// 9. getAuthConfig: Default-Auflösung
// -----------------------------------------------------------------------
const cfgEmpty = getAuthConfig({});
assert(!cfgEmpty.configured, "leere ENV → !configured");

const cfgKeyOnly = getAuthConfig({ LP_AI_API_KEY: "sk-bearer" });
assert(cfgKeyOnly.configured, "nur API_KEY → configured");
assert(cfgKeyOnly.password === "sk-bearer", "password fällt auf API_KEY");
assert(
  cfgKeyOnly.sessionSecret === "sk-bearer",
  "sessionSecret fällt auf API_KEY",
);

const cfgFull = getAuthConfig({
  LP_AI_API_KEY: "sk-bearer",
  LP_AI_PASSWORD: "owner-pass",
  LP_AI_SESSION_SECRET: "session-secret-32chars-1234567890",
});
assert(cfgFull.password === "owner-pass", "explizite ENV-Werte greifen");
assert(
  cfgFull.sessionSecret === "session-secret-32chars-1234567890",
  "sessionSecret aus eigener ENV",
);

// -----------------------------------------------------------------------
// 10. checkAuth: Cookie-Pfad
// -----------------------------------------------------------------------
function makeReq(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { headers });
}

const env = {
  LP_AI_API_KEY: "bearer-key-value",
  LP_AI_SESSION_SECRET: SECRET,
};

const sessionToken = buildSessionToken(SECRET, {
  sub: "admin",
  ttlSeconds: 3600,
});
const cookieReq = makeReq({
  cookie: `${SESSION_COOKIE_NAME}=${sessionToken}; other=foo`,
});
const cookieAuth = checkAuth(cookieReq, env);
assert(cookieAuth.ok, "Cookie-Auth mit gültigem Token → ok");
assert(
  cookieAuth.ok && cookieAuth.via === "cookie",
  "Cookie-Auth: via=cookie",
);

// Manipuliertes Cookie → fällt auf Bearer-Pfad zurück → ohne Bearer 401
const badCookieReq = makeReq({
  cookie: `${SESSION_COOKIE_NAME}=tampered.invalid.signature`,
});
const badCookieAuth = checkAuth(badCookieReq, env);
assert(!badCookieAuth.ok, "kaputtes Cookie ohne Bearer → 401");
assert(
  !badCookieAuth.ok && badCookieAuth.status === 401,
  "kaputtes Cookie → 401 nicht 503",
);

// -----------------------------------------------------------------------
// 11. checkAuth: Bearer-Pfad
// -----------------------------------------------------------------------
const bearerReq = makeReq({
  authorization: "Bearer bearer-key-value",
});
const bearerAuth = checkAuth(bearerReq, env);
assert(bearerAuth.ok, "Bearer-Auth mit korrektem Key → ok");
assert(
  bearerAuth.ok && bearerAuth.via === "bearer",
  "Bearer-Auth: via=bearer",
);

const wrongBearerReq = makeReq({ authorization: "Bearer wrong-key" });
assert(
  !checkAuth(wrongBearerReq, env).ok,
  "Bearer-Auth mit falschem Key → 401",
);

// -----------------------------------------------------------------------
// 12. checkAuth: ohne Konfiguration → 503
// -----------------------------------------------------------------------
const unconfigured = checkAuth(makeReq({}), {});
assert(!unconfigured.ok, "leere ENV → not ok");
assert(
  !unconfigured.ok && unconfigured.status === 503,
  "leere ENV → 503 (service not configured)",
);

console.log("auth-session smoketest ✅ (35 Asserts)");
export const __AUTH_SESSION_SMOKETEST__ = { totalAssertions: 35 };
