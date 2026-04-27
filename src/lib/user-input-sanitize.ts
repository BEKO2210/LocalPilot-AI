/**
 * User-Input-Sanitize-Helper (Code-Session 67).
 *
 * Defense-in-Depth gegen XSS auf der Schreibstelle. React's
 * `{text}`-Rendering escaped beim Lesen automatisch — aber:
 *   - Wenn ein zukünftiger Markdown-Renderer User-Input via
 *     `dangerouslySetInnerHTML` rendert, ist Stored-XSS möglich.
 *   - Logs / Analytics / Excel-Exports umgehen das React-Escaping.
 *   - Email-Templates (Bewertungs-Anfragen) rendern User-Input
 *     ggf. als HTML.
 *
 * Strategie: alle Owner-/Lead-Eingaben werden vor dem DB-Insert
 * gestripped. Wir nutzen den existierenden `sanitizeText` aus
 * `core/ai/sanitize.ts` (HTML-Stripper + Entity-Decoder + Control-
 * Char-Cleanup) und wrappen ihn mit:
 *   - Length-Limit (DoS-Schutz, default 50_000 chars)
 *   - Whitespace-Normalisierung (Single-Line vs. Multi-Line)
 *
 * **Pure**: keine Side-Effects, deterministisch, vollständig
 * testbar ohne DOM oder Server-Context.
 */

import { sanitizeText } from "@/core/ai/sanitize";

export const SANITIZE_DEFAULTS = {
  /** Max-Länge nach Sanitize (DoS-Schutz). 50KB → ~25 Buchseiten. */
  maxLength: 50_000,
  /**
   * Single-Line-Trim: alle Whitespace-Sequenzen (inkl. \n, \t)
   * werden zu einem einzelnen Space kollabiert, dann getrimmt.
   * Default für Tagline, Title, Name etc.
   */
  singleLine: false,
} as const;

export interface SanitizeOptions {
  readonly maxLength?: number;
  readonly singleLine?: boolean;
}

/**
 * Hauptfunktion. Pipeline:
 *   1. Non-string → "".
 *   2. `sanitizeText` (HTML-Strip + Entity-Decode + Control-
 *      Char-Cleanup).
 *   3. Whitespace-Normalisierung (single-line oder multi-line).
 *   4. Length-Cap.
 *
 * Bei `singleLine: false` (Default für Multi-Line):
 *   - Einzelne Zeilenumbrüche bleiben erhalten.
 *   - Mehr als 2 aufeinanderfolgende Newlines werden zu 2
 *     gekürzt (verhindert Spam-„riesige Lücke"-Tricks).
 *   - Trailing-/Leading-Whitespace pro Zeile getrimmt.
 *   - Trailing-/Leading-Newlines getrimmt.
 *
 * Bei `singleLine: true`:
 *   - Alle Whitespace-Sequenzen → ein Space.
 *   - Komplett getrimmt.
 */
export function sanitizeUserText(
  input: unknown,
  options: SanitizeOptions = {},
): string {
  const maxLength = options.maxLength ?? SANITIZE_DEFAULTS.maxLength;
  const singleLine = options.singleLine ?? SANITIZE_DEFAULTS.singleLine;

  let s = sanitizeText(input);

  if (singleLine) {
    s = s.replace(/\s+/g, " ").trim();
  } else {
    // Pro Zeile trimmen, dann Mehrfach-Newlines kürzen, dann
    // Block-Trim. `\r\n`/`\r` zu `\n` normalisieren.
    s = s
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line.replace(/[ \t]+$/g, "").replace(/^[ \t]+/g, ""))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (s.length > maxLength) {
    s = s.slice(0, maxLength);
  }

  return s;
}

/** Convenience: Single-Line-Default (Tagline, Title, Name). */
export function sanitizeUserSingleLine(
  input: unknown,
  maxLength?: number,
): string {
  return sanitizeUserText(input, { singleLine: true, ...(maxLength !== undefined ? { maxLength } : {}) });
}

/** Convenience: Multi-Line (Beschreibung, About, Long-Description). */
export function sanitizeUserMultiLine(
  input: unknown,
  maxLength?: number,
): string {
  return sanitizeUserText(input, { singleLine: false, ...(maxLength !== undefined ? { maxLength } : {}) });
}

/**
 * Domain-spezifischer Sanitizer für ein BusinessProfile-Objekt.
 * Stringfelder werden je nach erwartetem Format als Single-Line
 * oder Multi-Line behandelt.
 *
 * Bewusst tolerant gegenüber unbekannten Feldern — neue Felder
 * sollen nicht implizit unsanitized landen, also re-mappen wir
 * **nur** die bekannten Pfade.
 */
export interface SanitizableBusinessProfile {
  readonly name?: unknown;
  readonly tagline?: unknown;
  readonly description?: unknown;
  readonly contact?: {
    readonly phone?: unknown;
    readonly whatsapp?: unknown;
    readonly email?: unknown;
    readonly website?: unknown;
    readonly googleMapsUrl?: unknown;
    readonly googleReviewUrl?: unknown;
  };
  readonly address?: {
    readonly street?: unknown;
    readonly postalCode?: unknown;
    readonly city?: unknown;
    readonly country?: unknown;
  };
  readonly [key: string]: unknown;
}

export function sanitizeBusinessProfileStrings<T extends SanitizableBusinessProfile>(
  profile: T,
): T {
  const out: Record<string, unknown> = { ...profile };
  if (profile.name !== undefined) {
    out["name"] = sanitizeUserSingleLine(profile.name, 200);
  }
  if (profile.tagline !== undefined) {
    out["tagline"] = sanitizeUserSingleLine(profile.tagline, 240);
  }
  if (profile.description !== undefined) {
    out["description"] = sanitizeUserMultiLine(profile.description, 5_000);
  }
  if (profile.contact && typeof profile.contact === "object") {
    const c = profile.contact;
    out["contact"] = {
      ...c,
      ...(c.phone !== undefined ? { phone: sanitizeUserSingleLine(c.phone, 50) } : {}),
      ...(c.whatsapp !== undefined ? { whatsapp: sanitizeUserSingleLine(c.whatsapp, 50) } : {}),
      ...(c.email !== undefined ? { email: sanitizeUserSingleLine(c.email, 254) } : {}),
      ...(c.website !== undefined ? { website: sanitizeUserSingleLine(c.website, 500) } : {}),
      ...(c.googleMapsUrl !== undefined ? { googleMapsUrl: sanitizeUserSingleLine(c.googleMapsUrl, 500) } : {}),
      ...(c.googleReviewUrl !== undefined ? { googleReviewUrl: sanitizeUserSingleLine(c.googleReviewUrl, 500) } : {}),
    };
  }
  if (profile.address && typeof profile.address === "object") {
    const a = profile.address;
    out["address"] = {
      ...a,
      ...(a.street !== undefined ? { street: sanitizeUserSingleLine(a.street, 200) } : {}),
      ...(a.postalCode !== undefined ? { postalCode: sanitizeUserSingleLine(a.postalCode, 20) } : {}),
      ...(a.city !== undefined ? { city: sanitizeUserSingleLine(a.city, 100) } : {}),
      ...(a.country !== undefined ? { country: sanitizeUserSingleLine(a.country, 2) } : {}),
    };
  }
  return out as T;
}

/** Domain-spezifischer Sanitizer für eine Service-Row. */
export interface SanitizableService {
  readonly title?: unknown;
  readonly shortDescription?: unknown;
  readonly longDescription?: unknown;
  readonly category?: unknown;
  readonly priceLabel?: unknown;
  readonly durationLabel?: unknown;
  readonly [key: string]: unknown;
}

export function sanitizeServiceStrings<T extends SanitizableService>(service: T): T {
  const out: Record<string, unknown> = { ...service };
  if (service.title !== undefined) {
    out["title"] = sanitizeUserSingleLine(service.title, 200);
  }
  if (service.shortDescription !== undefined) {
    out["shortDescription"] = sanitizeUserMultiLine(service.shortDescription, 500);
  }
  if (service.longDescription !== undefined) {
    out["longDescription"] = sanitizeUserMultiLine(service.longDescription, 5_000);
  }
  if (service.category !== undefined) {
    out["category"] = sanitizeUserSingleLine(service.category, 100);
  }
  if (service.priceLabel !== undefined) {
    out["priceLabel"] = sanitizeUserSingleLine(service.priceLabel, 100);
  }
  if (service.durationLabel !== undefined) {
    out["durationLabel"] = sanitizeUserSingleLine(service.durationLabel, 100);
  }
  return out as T;
}

/** Domain-spezifischer Sanitizer für ein Lead-Insert. */
export interface SanitizableLead {
  readonly name?: unknown;
  readonly phone?: unknown;
  readonly email?: unknown;
  readonly message?: unknown;
  readonly preferredDate?: unknown;
  readonly preferredTime?: unknown;
  readonly extraFields?: Readonly<Record<string, unknown>>;
  readonly [key: string]: unknown;
}

export function sanitizeLeadStrings<T extends SanitizableLead>(lead: T): T {
  const out: Record<string, unknown> = { ...lead };
  if (lead.name !== undefined) {
    out["name"] = sanitizeUserSingleLine(lead.name, 200);
  }
  if (lead.phone !== undefined) {
    out["phone"] = sanitizeUserSingleLine(lead.phone, 50);
  }
  if (lead.email !== undefined) {
    out["email"] = sanitizeUserSingleLine(lead.email, 254);
  }
  if (lead.message !== undefined) {
    out["message"] = sanitizeUserMultiLine(lead.message, 5_000);
  }
  if (lead.preferredDate !== undefined) {
    out["preferredDate"] = sanitizeUserSingleLine(lead.preferredDate, 50);
  }
  if (lead.preferredTime !== undefined) {
    out["preferredTime"] = sanitizeUserSingleLine(lead.preferredTime, 50);
  }
  if (lead.extraFields && typeof lead.extraFields === "object") {
    const sanitized: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(lead.extraFields)) {
      // Key selbst auch sanitizen — verhindert seltsame DB-Spalten-
      // Namen oder JSON-Key-Injection.
      const safeKey = sanitizeUserSingleLine(k, 100);
      if (safeKey.length === 0) continue;
      if (typeof v === "string") {
        sanitized[safeKey] = sanitizeUserSingleLine(v, 1_000);
      } else if (typeof v === "number" || typeof v === "boolean") {
        sanitized[safeKey] = v;
      }
    }
    out["extraFields"] = sanitized;
  }
  return out as T;
}
