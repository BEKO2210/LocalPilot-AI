/**
 * Smoketest für Magic-Link-Auth-Infrastruktur (Code-Session 42).
 *
 * Wir testen die pure-Logik-Bestandteile, die ohne Next.js-Runtime
 * laufen:
 *   - readSupabaseEnv mit NEXT_PUBLIC_-Fallback-Kette
 *   - SAFE_PATH-Regex + EMAIL-Regex (re-built im Test, gleiche Form)
 *
 * Die Route-Handler selbst (Magic-Link, Callback) brauchen
 * `next/headers` und einen echten Supabase-Endpoint — die werden in
 * der nächsten Session bei der UI-Integration manuell durchgespielt.
 */

import {
  readSupabaseEnv,
  isSupabaseConfigured,
} from "@/core/database/client";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`auth-magic-link assertion failed: ${message}`);
}

const FAKE_URL = "https://test-project.supabase.co";
const FAKE_KEY = "anon-key-test-do-not-use";

// ---------------------------------------------------------------------------
// 1. ENV-Reader: NEXT_PUBLIC_ hat Vorrang vor SUPABASE_ (Fallback-Kette)
// ---------------------------------------------------------------------------
const empty = readSupabaseEnv({});
assert(empty.url === undefined, "leere ENV → undefined");
assert(!isSupabaseConfigured(empty), "leer → nicht konfiguriert");

const onlyLegacy = readSupabaseEnv({
  SUPABASE_URL: FAKE_URL,
  SUPABASE_ANON_KEY: FAKE_KEY,
});
assert(onlyLegacy.url === FAKE_URL, "Legacy-Vars werden gelesen");
assert(isSupabaseConfigured(onlyLegacy), "Legacy → konfiguriert");

const onlyPublic = readSupabaseEnv({
  NEXT_PUBLIC_SUPABASE_URL: FAKE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: FAKE_KEY,
});
assert(onlyPublic.url === FAKE_URL, "NEXT_PUBLIC_ allein reicht");
assert(isSupabaseConfigured(onlyPublic), "NEXT_PUBLIC_ → konfiguriert");

// NEXT_PUBLIC_ schlägt SUPABASE_ wenn beide gesetzt
const both = readSupabaseEnv({
  SUPABASE_URL: "https://legacy.supabase.co",
  SUPABASE_ANON_KEY: "legacy-key",
  NEXT_PUBLIC_SUPABASE_URL: FAKE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: FAKE_KEY,
});
assert(both.url === FAKE_URL, "NEXT_PUBLIC_ hat Vorrang vor Legacy");
assert(both.anonKey === FAKE_KEY, "NEXT_PUBLIC_ Key hat Vorrang");

// Whitespace-only NEXT_PUBLIC_ → fallback auf Legacy
const whitespacePublic = readSupabaseEnv({
  NEXT_PUBLIC_SUPABASE_URL: "   ",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "   ",
  SUPABASE_URL: FAKE_URL,
  SUPABASE_ANON_KEY: FAKE_KEY,
});
assert(
  whitespacePublic.url === FAKE_URL,
  "whitespace-only NEXT_PUBLIC_ → Fallback auf SUPABASE_",
);

// ---------------------------------------------------------------------------
// 2. Validation-Regexes (Re-Konstruktion identisch zur Route)
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_PATH_RE = /^\/[a-zA-Z0-9_\-/]*$/;

// E-Mail
assert(EMAIL_RE.test("anja@example.com"), "valide E-Mail akzeptiert");
assert(EMAIL_RE.test("a+b@example.co"), "Plus-Adressierung akzeptiert");
assert(!EMAIL_RE.test("not-an-email"), "ohne @ abgelehnt");
assert(!EMAIL_RE.test(" anja@example.com"), "Leerzeichen abgelehnt");
assert(!EMAIL_RE.test("anja@"), "ohne Domain abgelehnt");
assert(!EMAIL_RE.test("@example.com"), "ohne Local-Part abgelehnt");
assert(!EMAIL_RE.test(""), "leer abgelehnt");

// Safe-Path (gegen Open-Redirect)
assert(SAFE_PATH_RE.test("/dashboard"), "einfacher Pfad ok");
assert(SAFE_PATH_RE.test("/dashboard/studio-haarlinie/leads"), "verschachtelt ok");
assert(SAFE_PATH_RE.test("/"), "Root-Pfad ok");
assert(!SAFE_PATH_RE.test("//evil.com"), "Protocol-relative URL abgelehnt");
assert(!SAFE_PATH_RE.test("https://evil.com"), "absolute URL abgelehnt");
assert(!SAFE_PATH_RE.test("/dashboard?next=https://evil.com"), "Query-String abgelehnt");
assert(!SAFE_PATH_RE.test("dashboard"), "ohne führenden Slash abgelehnt");
assert(!SAFE_PATH_RE.test("/dashboard;evil"), "Semikolon abgelehnt");
assert(!SAFE_PATH_RE.test("/dashboard%2Fevil"), "URL-Encoded abgelehnt");

// ---------------------------------------------------------------------------
// 3. Privacy: env-dump enthält keine Geheimnisse aus Legacy-Vars
// ---------------------------------------------------------------------------
const dump = JSON.stringify(both);
assert(
  !dump.includes("legacy-key"),
  "Legacy-Key wird vom NEXT_PUBLIC_-Vorrang überschrieben — kein Leak",
);

console.log("auth-magic-link smoketest ✅ (~25 Asserts)");
export const __AUTH_MAGIC_LINK_SMOKETEST__ = { totalAssertions: 25 };
