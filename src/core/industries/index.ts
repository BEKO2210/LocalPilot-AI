/**
 * Barrel für das Branchen-Preset-Modul.
 *
 * Verwendung:
 *   import { getPresetOrFallback, listPresetKeys } from "@/core/industries";
 */

export * from "./registry";
export { getFallbackPreset, FALLBACK_PRESET_BASE } from "./fallback-preset";
export * from "./preset-helpers";
