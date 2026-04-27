/**
 * Smoketest für Login-UI-Status-Mapping (Code-Session 43).
 *
 * Pure-Function-Test des Status-Helpers. Form-/Browser-Interaktion
 * wird nicht hier abgedeckt (kein DOM); aber jede Status-Message,
 * die im UI sichtbar wird, kommt durch eine dieser Funktionen.
 */

import {
  IDLE_STATUS,
  SENDING_STATUS,
  SUCCESS_STATUS,
  looksLikeEmail,
  statusFromApiResponse,
  statusFromNetworkError,
} from "@/lib/auth-status";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`auth-status assertion failed: ${message}`);
}

// ---------------------------------------------------------------------------
// 1. Konstanten haben sauberen Initialzustand
// ---------------------------------------------------------------------------
assert(IDLE_STATUS.kind === "idle", "IDLE_STATUS.kind = idle");
assert(IDLE_STATUS.message === "", "IDLE hat keine Message");
assert(SENDING_STATUS.kind === "sending", "SENDING_STATUS.kind = sending");
assert(SUCCESS_STATUS.kind === "sent", "SUCCESS_STATUS.kind = sent");
assert(
  typeof SUCCESS_STATUS.hint === "string" && SUCCESS_STATUS.hint.length > 0,
  "SUCCESS hat hint mit Posteingang-Hinweis",
);
assert(
  SUCCESS_STATUS.hint!.toLowerCase().includes("posteingang"),
  "Hint nennt Posteingang",
);

// ---------------------------------------------------------------------------
// 2. statusFromApiResponse: 503 supabase_not_configured → unconfigured
// ---------------------------------------------------------------------------
const unconfigured = statusFromApiResponse(503, {
  error: "supabase_not_configured",
  message: "x",
});
assert(unconfigured.kind === "unconfigured", "503 special → unconfigured-kind");
assert(
  unconfigured.message.toLowerCase().includes("nicht aktiv"),
  "User-Message statt technischer 503",
);
assert(
  typeof unconfigured.hint === "string" && unconfigured.hint.includes("/demo"),
  "Hint linkt auf /demo",
);

// 503 ohne supabase-Code → fällt auf generic 5xx
const generic503 = statusFromApiResponse(503, { error: "other" });
assert(generic503.kind === "error", "generic 503 → error");
assert(
  generic503.message.toLowerCase().includes("serverfehler"),
  "5xx zeigt Serverfehler-Text",
);

// ---------------------------------------------------------------------------
// 3. statusFromApiResponse: 400 invalid_email
// ---------------------------------------------------------------------------
const invalidEmail = statusFromApiResponse(400, {
  error: "invalid_email",
  message: "Bitte gib eine gültige E-Mail-Adresse ein.",
});
assert(invalidEmail.kind === "error", "400 → error");
assert(
  invalidEmail.message.includes("E-Mail"),
  "API-Message wird durchgereicht",
);

// 400 ohne expliziten Code aber mit Body-Message
const generic400 = statusFromApiResponse(400, { message: "Bad request body" });
assert(generic400.message === "Bad request body", "Body-Message gewinnt");

// 400 ganz ohne Body
const empty400 = statusFromApiResponse(400, null);
assert(empty400.kind === "error", "400 ohne Body → error");
assert(empty400.message.length > 0, "fallback-Text vorhanden");

// ---------------------------------------------------------------------------
// 4. statusFromApiResponse: 5xx (nicht 503-Spezialfall)
// ---------------------------------------------------------------------------
const fiveHundred = statusFromApiResponse(500, null);
assert(fiveHundred.kind === "error", "500 → error");
assert(
  fiveHundred.hint!.toLowerCase().includes("minute"),
  "Hint sagt 'in einer Minute nochmal'",
);

const badGateway = statusFromApiResponse(502, null);
assert(badGateway.kind === "error", "502 → error");

// ---------------------------------------------------------------------------
// 5. statusFromApiResponse: andere Codes (z. B. 401)
// ---------------------------------------------------------------------------
const unauthorized = statusFromApiResponse(401, { message: "Token fehlt" });
assert(unauthorized.kind === "error", "401 → error");
assert(unauthorized.message === "Token fehlt", "401 Body-Message durchgereicht");

const teapot = statusFromApiResponse(418, null);
assert(teapot.kind === "error", "exotischer Code → error");
assert(
  teapot.message.includes("HTTP 418"),
  "Fallback nennt den HTTP-Status",
);

// ---------------------------------------------------------------------------
// 6. statusFromNetworkError
// ---------------------------------------------------------------------------
const fetchFail = statusFromNetworkError(new Error("Failed to fetch"));
assert(fetchFail.kind === "error", "Netzwerk-Error → error");
assert(
  fetchFail.message.toLowerCase().includes("nicht gesendet"),
  "freundlicher Text",
);
assert(
  typeof fetchFail.hint === "string" &&
    fetchFail.hint.includes("Failed to fetch"),
  "Detail im hint",
);

const noErrObj = statusFromNetworkError("plain string");
assert(noErrObj.kind === "error", "non-Error → trotzdem error");
assert(
  typeof noErrObj.hint === "string" && noErrObj.hint.includes("Static-Preview"),
  "Fallback-hint nennt Static-Preview",
);

// ---------------------------------------------------------------------------
// 7. looksLikeEmail
// ---------------------------------------------------------------------------
assert(looksLikeEmail("anja@example.com"), "valide Mail");
assert(looksLikeEmail("a@b.co"), "Minimal-valide Mail");
assert(looksLikeEmail("  anja@example.com  "), "trim greift");
assert(!looksLikeEmail(""), "leer abgelehnt");
assert(!looksLikeEmail("anja"), "ohne @ abgelehnt");
assert(!looksLikeEmail("anja@"), "ohne Domain abgelehnt");
assert(!looksLikeEmail("@example.com"), "ohne Local-Part abgelehnt");
assert(!looksLikeEmail("a b@c.de"), "Whitespace inline abgelehnt");
assert(!looksLikeEmail("a@b"), "ohne TLD-Punkt abgelehnt");

console.log("auth-status smoketest ✅ (~30 Asserts)");
export const __AUTH_STATUS_SMOKETEST__ = { totalAssertions: 30 };
