/**
 * Pure-Logic-Helper für Business-Stammdaten-Updates (Code-Session 50).
 *
 * Drei Verantwortlichkeiten, alle isoliert testbar:
 *   1. `profileToBusinessRow` — mapt das React-Hook-Form-Profil
 *      (`BusinessProfile`, camelCase) auf die DB-Row (snake_case).
 *      Ohne diese Mapping-Schicht würde der Form-Code direkt
 *      Spaltennamen kennen müssen — drift-anfällig.
 *   2. `submitBusinessUpdate` — fetch-Wrapper mit klarem Result-
 *      Mapping (server / not-authed / forbidden / not-found /
 *      validation / local-fallback / fail). Form muss nicht selbst
 *      HTTP-Codes interpretieren.
 *   3. `userMessageForResult` — User-sichtbarer Text pro Result-
 *      Variante; `null` wenn nichts kommuniziert werden muss
 *      (silent success).
 *
 * Pattern ist symmetrisch zum `lead-submit.ts` aus Session 44:
 * Server-tolerant — bei 404 / Static-Build fällt das Form auf
 * localStorage zurück, statt zu blockieren.
 */

import type { BusinessProfile } from "@/core/validation/business-profile.schema";

export interface BusinessRow {
  readonly name: string;
  readonly industry_key: string;
  readonly locale: string;
  readonly tagline: string;
  readonly description: string;
  readonly logo_url: string | null;
  readonly cover_image_url: string | null;
  readonly address: BusinessProfile["address"];
  readonly contact: BusinessProfile["contact"];
  readonly opening_hours: BusinessProfile["openingHours"];
  readonly theme_key: string;
  readonly primary_color: string | null;
  readonly secondary_color: string | null;
  readonly accent_color: string | null;
}

/**
 * Mapt das camelCase-Profile-Form auf die snake_case-DB-Row.
 * Optionale Felder werden zu `null` (nicht `undefined`), damit
 * Postgres sie deterministisch persistiert (sonst überschreibt
 * `undefined` nichts).
 */
export function profileToBusinessRow(profile: BusinessProfile): BusinessRow {
  return {
    name: profile.name,
    industry_key: profile.industryKey,
    locale: profile.locale,
    tagline: profile.tagline,
    description: profile.description,
    logo_url: profile.logoUrl ?? null,
    cover_image_url: profile.coverImageUrl ?? null,
    address: profile.address,
    contact: profile.contact,
    opening_hours: profile.openingHours,
    theme_key: profile.themeKey,
    primary_color: profile.primaryColor ?? null,
    secondary_color: profile.secondaryColor ?? null,
    accent_color: profile.accentColor ?? null,
  };
}

// ---------------------------------------------------------------------------
// Submit-Result + Fetch-Wrapper
// ---------------------------------------------------------------------------

export type BusinessUpdateResult =
  | { readonly kind: "server"; readonly slug: string }
  | { readonly kind: "not-authed" }
  | { readonly kind: "forbidden" }
  | {
      readonly kind: "validation";
      readonly fieldErrors: Readonly<Record<string, string>>;
    }
  | { readonly kind: "local-fallback"; readonly reason: string }
  | { readonly kind: "fail"; readonly reason: string };

export interface SubmitDeps {
  readonly fetchImpl?: typeof fetch;
}

interface ApiSuccessBody {
  readonly ok?: boolean;
  readonly slug?: string;
}
interface ApiErrorBody {
  readonly error?: string;
  readonly message?: string;
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

export async function submitBusinessUpdate(
  slug: string,
  profile: BusinessProfile,
  deps: SubmitDeps = {},
): Promise<BusinessUpdateResult> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const body = profileToBusinessRow(profile);

  let response: Response;
  try {
    response = await fetchImpl(`/api/businesses/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      kind: "local-fallback",
      reason: err instanceof Error ? err.message : "Netzwerk-Fehler",
    };
  }

  if (response.ok) {
    let okBody: ApiSuccessBody | null = null;
    try {
      okBody = (await response.json()) as ApiSuccessBody;
    } catch {
      /* ignore — wir haben den Slug aus dem Input */
    }
    return { kind: "server", slug: okBody?.slug ?? slug };
  }

  if (response.status === 404) {
    // Static-Build oder API-Route nicht gemountet — Form fällt
    // transparent auf den localStorage-Pfad zurück.
    return {
      kind: "local-fallback",
      reason: "API-Route /api/businesses/<slug> nicht verfügbar (Static-Build)",
    };
  }

  if (response.status === 401) return { kind: "not-authed" };
  if (response.status === 403) return { kind: "forbidden" };

  let errBody: ApiErrorBody | null = null;
  try {
    errBody = (await response.json()) as ApiErrorBody;
  } catch {
    /* ignore */
  }

  if (response.status === 400 && errBody?.fieldErrors) {
    return {
      kind: "validation",
      fieldErrors: errBody.fieldErrors,
    };
  }

  return {
    kind: "fail",
    reason: errBody?.message ?? `Server-Antwort ${response.status}`,
  };
}

/** User-sichtbarer Hinweis pro Result-Variante. */
export function userMessageForResult(
  result: BusinessUpdateResult,
): string | null {
  switch (result.kind) {
    case "server":
      // Sichtbares „Gespeichert" handhabt das Form selbst — hier kein
      // zusätzlicher Hinweis nötig.
      return null;
    case "not-authed":
      return "Bitte zuerst einloggen.";
    case "forbidden":
      return "Du bist nicht berechtigt, diesen Betrieb zu bearbeiten.";
    case "validation":
      return "Bitte prüfe die markierten Felder.";
    case "local-fallback":
      // Static-Build oder offline → wir haben lokal gespeichert.
      // Form zeigt zusätzlich „Demo-Modus"-Banner; hier kein Doppel-Text.
      return null;
    case "fail":
      return `Speichern fehlgeschlagen: ${result.reason}`;
  }
}
