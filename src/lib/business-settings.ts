/**
 * Pure-Logic-Helper für Settings-Updates (Code-Session 52).
 *
 * Settings sind die *Pflicht-Operationen* für Live-Betrieb, die
 * NICHT zum normalen Stammdaten-Editor (Session 50) gehören:
 *   - Slug ändern (URL-Schlüssel)
 *   - Veröffentlichungsstatus toggeln (`is_published`)
 *   - Sprache wechseln
 *
 * Der Slug ist ein Spezialfall, weil die URL davon abhängt — bei
 * erfolgreichem Wechsel muss das UI auf den neuen Slug
 * redirecten, sonst ist der User in einem 404 gelandet.
 *
 * Symmetrisch zum `business-update.ts`-Helper aus Session 50.
 */

import {
  isReservedSlug,
  type OnboardingFieldErrors,
} from "@/lib/onboarding-validate";

export type Locale = "de" | "en";

export interface SettingsInput {
  /** Aktueller Slug (URL-Schlüssel). Bei Änderung: `newSlug` setzen. */
  readonly newSlug?: string;
  readonly isPublished?: boolean;
  readonly locale?: Locale;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const SLUG_MIN = 3;
const SLUG_MAX = 40;

export type SettingsValidationResult =
  | { readonly ok: true; readonly value: SettingsInput }
  | { readonly ok: false; readonly errors: Partial<Record<keyof SettingsInput, string>> };

export function validateSettingsInput(
  input: SettingsInput,
  options: { readonly currentSlug: string },
): SettingsValidationResult {
  const errors: Partial<Record<keyof SettingsInput, string>> = {};

  // Slug nur prüfen, wenn er sich tatsächlich ändert.
  if (input.newSlug !== undefined) {
    const slug = input.newSlug.trim().toLowerCase();
    if (slug.length === 0) {
      errors.newSlug = "Bitte einen Slug eingeben.";
    } else if (slug === options.currentSlug) {
      // No-op: Slug unverändert. Wir nehmen `newSlug` aus dem
      // Output, damit der Server keinen unnötigen UPDATE versucht.
    } else if (slug.length < SLUG_MIN) {
      errors.newSlug = `Slug muss mindestens ${SLUG_MIN} Zeichen haben.`;
    } else if (slug.length > SLUG_MAX) {
      errors.newSlug = `Slug darf maximal ${SLUG_MAX} Zeichen haben.`;
    } else if (!SLUG_RE.test(slug)) {
      errors.newSlug =
        "Nur Kleinbuchstaben, Zahlen und Bindestriche. Muss mit Buchstabe/Zahl beginnen und enden.";
    } else if (isReservedSlug(slug)) {
      errors.newSlug = "Dieser Slug ist reserviert.";
    }
  }

  if (input.locale !== undefined && input.locale !== "de" && input.locale !== "en") {
    errors.locale = "Sprache muss 'de' oder 'en' sein.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Output normalisieren: Slug-Aktualisierung nur weiterleiten,
  // wenn er sich wirklich geändert hat.
  const value: SettingsInput = {
    ...(input.newSlug !== undefined &&
    input.newSlug.trim().toLowerCase() !== options.currentSlug
      ? { newSlug: input.newSlug.trim().toLowerCase() }
      : {}),
    ...(typeof input.isPublished === "boolean"
      ? { isPublished: input.isPublished }
      : {}),
    ...(input.locale !== undefined ? { locale: input.locale } : {}),
  };
  return { ok: true, value };
}

// ---------------------------------------------------------------------------
// Submit-Result + Fetch-Wrapper
// ---------------------------------------------------------------------------

export type SettingsUpdateResult =
  | { readonly kind: "noop" }
  | {
      readonly kind: "server";
      /** Slug, unter dem der Betrieb jetzt erreichbar ist (= neuer Slug, falls gewechselt). */
      readonly slug: string;
      /** `true`, wenn der Slug in dieser Anfrage geändert wurde. */
      readonly slugChanged: boolean;
    }
  | { readonly kind: "not-authed" }
  | { readonly kind: "forbidden" }
  | {
      readonly kind: "validation";
      readonly fieldErrors: OnboardingFieldErrors;
    }
  | { readonly kind: "slug_taken" }
  | { readonly kind: "fail"; readonly reason: string };

export interface SubmitDeps {
  readonly fetchImpl?: typeof fetch;
}

interface ApiSuccessBody {
  readonly ok?: boolean;
  readonly slug?: string;
  readonly slugChanged?: boolean;
}
interface ApiErrorBody {
  readonly error?: string;
  readonly message?: string;
  readonly fieldErrors?: OnboardingFieldErrors;
}

export async function submitSettingsUpdate(
  currentSlug: string,
  input: SettingsInput,
  deps: SubmitDeps = {},
): Promise<SettingsUpdateResult> {
  const validation = validateSettingsInput(input, { currentSlug });
  if (!validation.ok) {
    return {
      kind: "validation",
      fieldErrors: validation.errors as OnboardingFieldErrors,
    };
  }

  // No-op-Optimierung: wenn alle Werte gleich geblieben sind.
  if (Object.keys(validation.value).length === 0) {
    return { kind: "noop" };
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(
      `/api/businesses/${encodeURIComponent(currentSlug)}/settings`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validation.value),
      },
    );
  } catch (err) {
    return {
      kind: "fail",
      reason: err instanceof Error ? err.message : "Netzwerk-Fehler",
    };
  }

  if (response.ok) {
    let body: ApiSuccessBody | null = null;
    try {
      body = (await response.json()) as ApiSuccessBody;
    } catch {
      /* ignore */
    }
    return {
      kind: "server",
      slug: body?.slug ?? currentSlug,
      slugChanged: Boolean(body?.slugChanged),
    };
  }

  if (response.status === 401) return { kind: "not-authed" };
  if (response.status === 403) return { kind: "forbidden" };
  if (response.status === 409) return { kind: "slug_taken" };

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

/** User-Hinweis pro Result. */
export function userMessageForResult(
  result: SettingsUpdateResult,
): string | null {
  switch (result.kind) {
    case "noop":
      return "Keine Änderungen zum Speichern.";
    case "server":
      return result.slugChanged
        ? `Gespeichert. Neuer Slug: ${result.slug}.`
        : "Einstellungen gespeichert.";
    case "not-authed":
      return "Bitte zuerst einloggen.";
    case "forbidden":
      return "Du bist nicht berechtigt, diese Einstellungen zu ändern.";
    case "slug_taken":
      return "Dieser Slug ist bereits vergeben. Bitte einen anderen wählen.";
    case "validation":
      return "Bitte prüfe die markierten Felder.";
    case "fail":
      return `Speichern fehlgeschlagen: ${result.reason}`;
  }
}
