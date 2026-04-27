/**
 * HS256-JWT-Signing/Verify ohne externe Dependency (Code-Session 33).
 *
 * Wir nutzen ausschließlich Node `crypto.createHmac` und Base64URL-
 * Encoding aus `Buffer` — kein `jose`, kein `jsonwebtoken`. Reicht
 * für unseren Anwendungsfall (kurzlebige Sessions, ein bekannter
 * Audience, kein JWE/RS256).
 *
 * Sicherheits-Eckdaten (Recherche zu Code-Session 33):
 *   - HS256 ist robust, solange das Secret ≥ 256 bit ist.
 *     Praktisch: ein zufälliges 32-Zeichen-ASCII-Secret reicht.
 *   - `crypto.timingSafeEqual` für die Signatur-Prüfung — kein
 *     leakable String-Compare.
 *   - Sliding-Window: jeder Check kann optional ein neues Token mit
 *     verschobenem `exp` ausstellen (Caller-Verantwortung).
 *
 * **Runtime**: nur Node-Runtime (route.ts setzt
 * `runtime: "nodejs"`). Kein Edge-Runtime, weil `node:crypto`
 * dort eingeschränkt ist. Wenn wir später auf Edge migrieren,
 * tauschen wir die Implementierung gegen `Web Crypto SubtleCrypto`
 * mit `HMAC` aus.
 */

import crypto from "node:crypto";

export interface SessionPayload {
  /** Subject — wer ist das? */
  readonly sub: string;
  /** Issued At — Sekunden seit Epoch. */
  readonly iat: number;
  /** Expires At — Sekunden seit Epoch. */
  readonly exp: number;
}

const HEADER_JSON = JSON.stringify({ alg: "HS256", typ: "JWT" });

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecodeToBuffer(input: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]*$/.test(input)) return null;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  try {
    return Buffer.from(padded + "=".repeat(padLen), "base64");
  } catch {
    return null;
  }
}

const HEADER_B64 = base64UrlEncode(HEADER_JSON);

/**
 * Signiert einen Payload mit HS256. Liefert ein kompaktes JWT
 * (`header.payload.signature`).
 */
export function signSessionToken(
  payload: SessionPayload,
  secret: string,
): string {
  if (!secret || secret.length === 0) {
    throw new Error("signSessionToken: secret darf nicht leer sein.");
  }
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${HEADER_B64}.${payloadB64}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest();
  return `${signingInput}.${base64UrlEncode(sig)}`;
}

/**
 * Verifiziert ein Token: Signatur korrekt + Header passt zur erwarteten
 * Form + Token noch nicht abgelaufen. Liefert den Payload bei Erfolg,
 * `null` bei Fehlschlag (kein Detail-Log, um Timing-Side-Channels zu
 * vermeiden).
 *
 * `nowSeconds`-Parameter ermöglicht testbares Verhalten ohne
 * `Date.now`-Mocking.
 */
export function verifySessionToken(
  token: string,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): SessionPayload | null {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  // Header muss exakt unserem festen Header entsprechen — wir
  // unterstützen nur HS256 + JWT.
  if (headerB64 !== HEADER_B64) return null;

  // Signatur-Verifikation per timing-safe-compare.
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest();
  const givenSig = base64UrlDecodeToBuffer(sigB64);
  if (!givenSig || givenSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(givenSig, expectedSig)) return null;

  // Payload parsen + Felder validieren.
  const payloadBuf = base64UrlDecodeToBuffer(payloadB64);
  if (!payloadBuf) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadBuf.toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as SessionPayload).sub !== "string" ||
    typeof (parsed as SessionPayload).iat !== "number" ||
    typeof (parsed as SessionPayload).exp !== "number"
  ) {
    return null;
  }
  const payload = parsed as SessionPayload;
  if (payload.exp <= nowSeconds) return null;
  return payload;
}

/**
 * Bequemer Helper: erzeugt ein Token mit Default-TTL (7 Tage,
 * Sliding-Window-Empfehlung aus der Recherche).
 */
export function buildSessionToken(
  secret: string,
  options: { sub?: string; ttlSeconds?: number; nowSeconds?: number } = {},
): string {
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const ttl = options.ttlSeconds ?? 7 * 24 * 3600;
  return signSessionToken(
    { sub: options.sub ?? "admin", iat: now, exp: now + ttl },
    secret,
  );
}
