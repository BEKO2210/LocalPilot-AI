/**
 * Preset-Registry – zentrale Anlaufstelle für alle hinterlegten Branchen.
 *
 * Verwendung:
 *   import { getPreset, getPresetOrFallback } from "@/core/industries";
 *   const preset = getPresetOrFallback(business.industryKey);
 *
 * Drei Vertragsregeln:
 *   1. `getPreset(key)` wirft, wenn kein Preset für den Schlüssel existiert.
 *   2. `getPresetOrFallback(key)` liefert immer ein gültiges Preset –
 *      entweder den hinterlegten Datensatz oder das Fallback mit gespiegeltem Key.
 *   3. Die Registry validiert beim Laden: jedes Preset muss das Zod-Schema
 *      erfüllen UND der Map-Key muss zum `preset.key` passen.
 */

import { INDUSTRY_KEYS, type IndustryKey } from "@/types/common";
import type { IndustryPreset } from "@/types/industry";

import { hairdresserPreset } from "./presets/hairdresser";
import { barbershopPreset } from "./presets/barbershop";
import { autoWorkshopPreset } from "./presets/auto-workshop";
import { cleaningCompanyPreset } from "./presets/cleaning-company";
import { cosmeticStudioPreset } from "./presets/cosmetic-studio";
import { nailStudioPreset } from "./presets/nail-studio";
import { craftsmanGeneralPreset } from "./presets/craftsman-general";
import { electricianPreset } from "./presets/electrician";
import { painterPreset } from "./presets/painter";
import { drivingSchoolPreset } from "./presets/driving-school";
import { restaurantPreset } from "./presets/restaurant";
import { photographerPreset } from "./presets/photographer";
import { personalTrainerPreset } from "./presets/personal-trainer";
import { getFallbackPreset } from "./fallback-preset";

// ---------------------------------------------------------------------------
// Registrierte Presets
// ---------------------------------------------------------------------------

/**
 * Lookup-Map. Alle hinterlegten Presets werden hier registriert.
 * Das Hinzufügen einer neuen Branche ist genau eine Codezeile + ein Import.
 */
export const PRESET_REGISTRY: Readonly<
  Partial<Record<IndustryKey, IndustryPreset>>
> = {
  hairdresser: hairdresserPreset,
  barbershop: barbershopPreset,
  auto_workshop: autoWorkshopPreset,
  cleaning_company: cleaningCompanyPreset,
  cosmetic_studio: cosmeticStudioPreset,
  nail_studio: nailStudioPreset,
  craftsman_general: craftsmanGeneralPreset,
  electrician: electricianPreset,
  painter: painterPreset,
  driving_school: drivingSchoolPreset,
  restaurant: restaurantPreset,
  photographer: photographerPreset,
  personal_trainer: personalTrainerPreset,
};

// ---------------------------------------------------------------------------
// Konsistenz-Check beim Module-Load
// ---------------------------------------------------------------------------

/**
 * Stellt sicher, dass der Map-Key im `PRESET_REGISTRY` dem `preset.key`
 * entspricht. Verhindert Tippfehler wie `nail_studio: cosmeticStudioPreset`.
 *
 * Diese Schleife läuft beim ersten Import – falsch zugeordnete Presets
 * brechen also den Build, nicht erst die Produktion.
 */
for (const [registryKey, preset] of Object.entries(PRESET_REGISTRY)) {
  if (!preset) continue;
  if (preset.key !== registryKey) {
    throw new Error(
      `IndustryPreset registry mismatch: registry key "${registryKey}" but preset.key="${preset.key}".`,
    );
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class UnknownIndustryError extends Error {
  readonly key: IndustryKey;
  constructor(key: IndustryKey) {
    super(
      `Für die Branche "${key}" ist aktuell kein Preset hinterlegt. ` +
        `Hinterlegt sind: ${listPresetKeys().join(", ")}.`,
    );
    this.name = "UnknownIndustryError";
    this.key = key;
  }
}

/** Liefert ein Preset oder wirft, falls nicht hinterlegt. */
export function getPreset(key: IndustryKey): IndustryPreset {
  const found = PRESET_REGISTRY[key];
  if (!found) throw new UnknownIndustryError(key);
  return found;
}

/** Liefert ein Preset oder das Fallback-Preset mit gespiegeltem Key. */
export function getPresetOrFallback(key: IndustryKey): IndustryPreset {
  return PRESET_REGISTRY[key] ?? getFallbackPreset(key);
}

/** Liefert alle hinterlegten Presets in stabiler Reihenfolge (label asc). */
export function getAllPresets(): readonly IndustryPreset[] {
  return Object.values(PRESET_REGISTRY)
    .filter((p): p is IndustryPreset => Boolean(p))
    .sort((a, b) => a.label.localeCompare(b.label, "de"));
}

/** Liefert die Schlüssel aller hinterlegten Presets. */
export function listPresetKeys(): readonly IndustryKey[] {
  return Object.keys(PRESET_REGISTRY) as IndustryKey[];
}

/** Schlüssel, für die noch kein Preset hinterlegt ist. */
export function listMissingPresetKeys(): readonly IndustryKey[] {
  return INDUSTRY_KEYS.filter((key) => !PRESET_REGISTRY[key]);
}

/** True, wenn dieser Branchenschlüssel ein Preset hat (also kein Fallback). */
export function hasPreset(key: IndustryKey): boolean {
  return Boolean(PRESET_REGISTRY[key]);
}

/**
 * Filtert Presets, deren `recommendedThemes` einen bestimmten Theme-Key
 * enthalten. Wird in Session 5 vom Theme-Empfehlungs-UI genutzt.
 */
export function getPresetsForTheme(
  themeKey: IndustryPreset["recommendedThemes"][number],
): readonly IndustryPreset[] {
  return getAllPresets().filter((p) => p.recommendedThemes.includes(themeKey));
}
