/**
 * Theme-Registry – zentraler Lookup für alle hinterlegten Designs.
 *
 * Verwendung:
 *   import { getTheme, getThemeOrFallback } from "@/core/themes";
 *   const theme = getThemeOrFallback(business.themeKey);
 *
 * Vertragsregeln:
 *   1. `getTheme(key)` wirft, wenn das Theme nicht hinterlegt ist.
 *   2. `getThemeOrFallback(key)` liefert immer ein Theme – im Zweifel
 *      `clean_light` als sichere Standardvorlage.
 *   3. Beim Laden wird geprüft: Map-Key === theme.key (verhindert
 *      vertauschte Imports).
 */

import { THEME_KEYS, type IndustryKey, type ThemeKey } from "@/types/common";
import type { Theme } from "@/types/theme";

import { cleanLightTheme } from "./themes/clean-light";
import { premiumDarkTheme } from "./themes/premium-dark";
import { warmLocalTheme } from "./themes/warm-local";
import { medicalCleanTheme } from "./themes/medical-clean";
import { beautyLuxuryTheme } from "./themes/beauty-luxury";
import { automotiveStrongTheme } from "./themes/automotive-strong";
import { craftsmanSolidTheme } from "./themes/craftsman-solid";
import { creativeStudioTheme } from "./themes/creative-studio";
import { fitnessEnergyTheme } from "./themes/fitness-energy";
import { educationCalmTheme } from "./themes/education-calm";

// ---------------------------------------------------------------------------
// Registrierung
// ---------------------------------------------------------------------------

/** Default-Theme. Wird vom Layout im :root verwendet. */
export const DEFAULT_THEME: Theme = cleanLightTheme;

/**
 * Lookup-Map. Alle Themes werden hier registriert; Reihenfolge entspricht
 * der Anzeige-Reihenfolge in der Theme-Galerie.
 */
export const THEME_REGISTRY: Readonly<Record<ThemeKey, Theme>> = {
  clean_light: cleanLightTheme,
  premium_dark: premiumDarkTheme,
  warm_local: warmLocalTheme,
  medical_clean: medicalCleanTheme,
  beauty_luxury: beautyLuxuryTheme,
  automotive_strong: automotiveStrongTheme,
  craftsman_solid: craftsmanSolidTheme,
  creative_studio: creativeStudioTheme,
  fitness_energy: fitnessEnergyTheme,
  education_calm: educationCalmTheme,
};

// ---------------------------------------------------------------------------
// Konsistenz-Check beim Module-Load
// ---------------------------------------------------------------------------

for (const [registryKey, theme] of Object.entries(THEME_REGISTRY)) {
  if (theme.key !== registryKey) {
    throw new Error(
      `Theme registry mismatch: registry key "${registryKey}" but theme.key="${theme.key}".`,
    );
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class UnknownThemeError extends Error {
  readonly key: ThemeKey;
  constructor(key: ThemeKey) {
    super(
      `Theme "${key}" ist nicht registriert. Verfügbar: ${listThemeKeys().join(", ")}.`,
    );
    this.name = "UnknownThemeError";
    this.key = key;
  }
}

/** Liefert ein Theme oder wirft, falls nicht hinterlegt. */
export function getTheme(key: ThemeKey): Theme {
  const found = THEME_REGISTRY[key];
  if (!found) throw new UnknownThemeError(key);
  return found;
}

/** Liefert ein Theme oder das Default (`clean_light`). */
export function getThemeOrFallback(key: ThemeKey | undefined): Theme {
  if (!key) return DEFAULT_THEME;
  return THEME_REGISTRY[key] ?? DEFAULT_THEME;
}

/** Liefert alle Themes in Registrierungs-Reihenfolge. */
export function getAllThemes(): readonly Theme[] {
  return THEME_KEYS.map((key) => THEME_REGISTRY[key]);
}

/** Schlüssel aller Themes. */
export function listThemeKeys(): readonly ThemeKey[] {
  return THEME_KEYS;
}

/**
 * Themes, die für eine bestimmte Branche empfohlen sind.
 * Liest die `suitableForIndustries`-Liste jedes Themes.
 *
 * In Session 4 hinterlegt jedes Preset zusätzlich `recommendedThemes`.
 * Diese Funktion bietet die umgekehrte Richtung: vom Theme-Datensatz aus.
 */
export function getThemesForIndustry(
  industryKey: IndustryKey,
): readonly Theme[] {
  return getAllThemes().filter((t) =>
    t.suitableForIndustries.includes(industryKey),
  );
}
