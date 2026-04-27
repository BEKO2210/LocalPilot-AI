/**
 * Client-seitiger Mock-Store für Betriebs-Editierungen.
 *
 * Solange wir kein Backend haben (Supabase folgt in Session 19),
 * nutzen wir den Browser-LocalStorage. Pro Slug wird ein
 * `BusinessProfile` gespeichert, der bei der nächsten Page-Load das
 * Demo-Original überschreibt.
 *
 * Server-Code rührt diese Datei nicht an – sie ist auf Client-only
 * ausgelegt und wirft nicht, wenn `window` fehlt.
 */

import {
  BusinessProfileSchema,
  type BusinessProfile,
} from "@/core/validation/business-profile.schema";

const STORAGE_PREFIX = "lp:business-override:";
const STORAGE_VERSION = "v1";

function key(slug: string): string {
  return `${STORAGE_PREFIX}${STORAGE_VERSION}:${slug}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Liest die persistierte Profil-Variante des Slugs.
 * Validiert den gespeicherten Stand defensiv – ungültige Daten werden
 * verworfen, um keine kaputte UI zu erzeugen.
 */
export function getOverride(slug: string): BusinessProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const result = BusinessProfileSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/**
 * Persistiert ein vollständiges, validiertes Profil.
 * Wirft nicht, sondern liefert ein Boolean (für UI-Feedback).
 */
export function setOverride(slug: string, profile: BusinessProfile): boolean {
  if (!isBrowser()) return false;
  try {
    const validated = BusinessProfileSchema.parse(profile);
    window.localStorage.setItem(key(slug), JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

/** Entfernt die Profil-Variante (Reset auf Demo-Defaults). */
export function clearOverride(slug: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key(slug));
  } catch {
    // ignore
  }
}

/** Prüft, ob für den Slug eine lokale Anpassung existiert. */
export function hasOverride(slug: string): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(key(slug)) !== null;
}
