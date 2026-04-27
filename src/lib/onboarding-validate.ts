/**
 * Pure-Logic-Helper für die Onboarding-Validierung (Code-Session 45).
 *
 * Wird sowohl client-side im Form (Live-Feedback beim Tippen) als
 * auch server-side in der Route (Hard-Validation) benutzt. Bündelt
 * alle Pflicht-Checks an einer Stelle, damit Drift vermieden wird.
 *
 * Server fügt zusätzlich noch eine Postgres-Unique-Verletzung
 * (Slug schon vergeben) als Spätfehler hinzu — aber das ist
 * Race-bedingt und nicht client-seitig vorhersehbar.
 */

import {
  INDUSTRY_KEYS,
  PACKAGE_TIERS,
  THEME_KEYS,
  type IndustryKey,
  type PackageTier,
  type ThemeKey,
} from "@/types/common";

export interface OnboardingInput {
  readonly slug: string;
  readonly name: string;
  readonly industryKey: string;
  readonly themeKey: string;
  readonly packageTier: string;
  readonly tagline: string;
  readonly description: string;
}

/** Was die Onboarding-API als gültiger Input akzeptiert. */
export interface OnboardingValidInput {
  readonly slug: string;
  readonly name: string;
  readonly industryKey: IndustryKey;
  readonly themeKey: ThemeKey;
  readonly packageTier: PackageTier;
  readonly tagline: string;
  readonly description: string;
}

export type OnboardingFieldErrors = Partial<
  Record<keyof OnboardingInput, string>
>;

export type OnboardingValidationResult =
  | { readonly ok: true; readonly value: OnboardingValidInput }
  | { readonly ok: false; readonly errors: OnboardingFieldErrors };

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 40;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const TAGLINE_MIN_LENGTH = 2;
const TAGLINE_MAX_LENGTH = 160;
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 2000;

/** Heuristik: macht aus einem Namen einen vorschlagsfähigen Slug. */
export function suggestSlugFromName(name: string): string {
  // Digraph-Mapping (Müller → Mueller) muss VOR NFKD passieren —
  // sonst spaltet NFKD `ü` in `u` + Combining-Diaeresis, der
  // anschließende Diakritika-Strip macht aus dem Combining nichts,
  // und das Endergebnis wäre `muller` statt `mueller`.
  const digraphed = name
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
  // Restliche Diakritika strippen (café → cafe).
  const stripped = digraphed.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  return (
    stripped
      // Apostrophe und ähnliche Zeichen NICHT als Wortgrenze werten —
      // „Müller's" soll „muellers" werden, nicht „mueller-s".
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, SLUG_MAX_LENGTH)
  );
}

export function validateOnboarding(
  input: OnboardingInput,
): OnboardingValidationResult {
  const errors: OnboardingFieldErrors = {};

  // slug
  const slug = input.slug.trim().toLowerCase();
  if (slug.length === 0) {
    errors.slug = "Bitte einen Slug wählen (z. B. dein-betrieb).";
  } else if (slug.length < SLUG_MIN_LENGTH) {
    errors.slug = `Slug muss mindestens ${SLUG_MIN_LENGTH} Zeichen haben.`;
  } else if (slug.length > SLUG_MAX_LENGTH) {
    errors.slug = `Slug darf maximal ${SLUG_MAX_LENGTH} Zeichen lang sein.`;
  } else if (!SLUG_RE.test(slug)) {
    errors.slug =
      "Nur Kleinbuchstaben, Zahlen und Bindestriche. Muss mit Buchstabe/Zahl beginnen und enden.";
  }

  // name
  const name = input.name.trim();
  if (name.length < NAME_MIN_LENGTH) {
    errors.name = `Bitte den Betriebsnamen eingeben (mind. ${NAME_MIN_LENGTH} Zeichen).`;
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Name darf maximal ${NAME_MAX_LENGTH} Zeichen lang sein.`;
  }

  // industryKey
  const industryKey = input.industryKey.trim();
  if (industryKey.length === 0) {
    errors.industryKey = "Bitte eine Branche auswählen.";
  } else if (!(INDUSTRY_KEYS as readonly string[]).includes(industryKey)) {
    errors.industryKey = "Unbekannte Branche.";
  }

  // themeKey
  const themeKey = input.themeKey.trim();
  if (themeKey.length === 0) {
    errors.themeKey = "Bitte ein Theme auswählen.";
  } else if (!(THEME_KEYS as readonly string[]).includes(themeKey)) {
    errors.themeKey = "Unbekanntes Theme.";
  }

  // packageTier
  const packageTier = input.packageTier.trim();
  if (packageTier.length === 0) {
    errors.packageTier = "Bitte ein Paket wählen.";
  } else if (!(PACKAGE_TIERS as readonly string[]).includes(packageTier)) {
    errors.packageTier = "Unbekanntes Paket.";
  }

  // tagline
  const tagline = input.tagline.trim();
  if (tagline.length < TAGLINE_MIN_LENGTH) {
    errors.tagline = `Bitte einen kurzen Slogan eingeben (mind. ${TAGLINE_MIN_LENGTH} Zeichen).`;
  } else if (tagline.length > TAGLINE_MAX_LENGTH) {
    errors.tagline = `Slogan darf maximal ${TAGLINE_MAX_LENGTH} Zeichen lang sein.`;
  }

  // description
  const description = input.description.trim();
  if (description.length < DESCRIPTION_MIN_LENGTH) {
    errors.description = `Bitte eine kurze Beschreibung eingeben (mind. ${DESCRIPTION_MIN_LENGTH} Zeichen).`;
  } else if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Beschreibung darf maximal ${DESCRIPTION_MAX_LENGTH} Zeichen lang sein.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      slug,
      name,
      industryKey: industryKey as IndustryKey,
      themeKey: themeKey as ThemeKey,
      packageTier: packageTier as PackageTier,
      tagline,
      description,
    },
  };
}

/** Reservierte Slugs — wandern in einen späteren Migration-Check. */
export const RESERVED_SLUGS: readonly string[] = [
  "admin",
  "api",
  "dashboard",
  "demo",
  "login",
  "logout",
  "account",
  "onboarding",
  "site",
  "impressum",
  "datenschutz",
  "marketing",
  "pricing",
  "themes",
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.trim().toLowerCase());
}
