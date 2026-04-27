/**
 * Client-seitiger Mock-Store für Services-Editierungen (Session 11).
 *
 * Pro Slug wird ein Service-Array in localStorage abgelegt. Beim
 * nächsten Page-Load überschreibt der Override die Demo-Liste in der
 * Editor-UI. Public Site und Übersicht bleiben weiterhin auf den
 * Demo-Mock-Daten – Supabase folgt in Session 19, dann zieht eine
 * Repository-Schicht beide Seiten zusammen.
 */

import { z } from "zod";
import { ServiceSchema } from "@/core/validation/service.schema";
import type { Service } from "@/types/service";

const STORAGE_PREFIX = "lp:services-override:";
const STORAGE_VERSION = "v1";

const ServicesOverrideSchema = z.array(ServiceSchema);

function key(slug: string): string {
  return `${STORAGE_PREFIX}${STORAGE_VERSION}:${slug}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Liest die persistierte Service-Liste eines Slugs.
 * Validiert defensiv – ungültige Datensätze werden verworfen.
 */
export function getServicesOverride(slug: string): Service[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const result = ServicesOverrideSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Persistiert eine validierte Service-Liste. */
export function setServicesOverride(
  slug: string,
  services: readonly Service[],
): boolean {
  if (!isBrowser()) return false;
  try {
    const validated = ServicesOverrideSchema.parse(services);
    window.localStorage.setItem(key(slug), JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

/** Entfernt die Service-Override (Reset auf Demo-Defaults). */
export function clearServicesOverride(slug: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key(slug));
  } catch {
    // ignore
  }
}

export function hasServicesOverride(slug: string): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(key(slug)) !== null;
}

/**
 * Liefert die effektiven Services: Override wenn vorhanden, sonst
 * die Demo-Services aus dem Business-Aggregat. Auf dem Server (kein
 * Window) immer die Demo-Services.
 */
export function getEffectiveServices(
  slug: string,
  fallback: readonly Service[],
): readonly Service[] {
  const override = getServicesOverride(slug);
  return override ?? fallback;
}
