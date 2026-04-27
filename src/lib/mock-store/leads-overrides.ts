/**
 * Client-seitiger Mock-Store für Anfragen (Leads) – Session 12.
 *
 * Public-Site-Formular schreibt neue Leads über `appendLead()` in den
 * Browser-Storage; Dashboard liest alle Leads (Demo-Mocks ⊕ persistierte
 * Einträge) zusammen, kann Status, Notizen und sonstige Felder per
 * `updateLead()` ändern.
 *
 * Persistiert wird ausschließlich client-seitig (kein Backend bis
 * Session 19). Damit funktioniert das Lead-System auch auf GitHub Pages,
 * solange dieselbe Browser-Sitzung sowohl die Public Site als auch das
 * Dashboard öffnet.
 */

import { z } from "zod";
import { LeadSchema } from "@/core/validation/lead.schema";
import type { Lead } from "@/types/lead";
import type { LeadStatus } from "@/types/common";

const STORAGE_PREFIX = "lp:leads-override:";
const STORAGE_VERSION = "v1";

const LeadsOverrideSchema = z.array(LeadSchema);

function key(slug: string): string {
  return `${STORAGE_PREFIX}${STORAGE_VERSION}:${slug}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStored(slug: string): Lead[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    const result = LeadsOverrideSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function writeStored(slug: string, leads: readonly Lead[]): boolean {
  if (!isBrowser()) return false;
  try {
    const validated = LeadsOverrideSchema.parse(leads);
    window.localStorage.setItem(key(slug), JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Liefert die persistierte Lead-Liste eines Slugs (oder leer). */
export function getStoredLeads(slug: string): Lead[] {
  return readStored(slug);
}

/** Hat dieser Slug Leads im Browser-Storage? */
export function hasStoredLeads(slug: string): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(key(slug)) !== null;
}

/** Entfernt alle persistierten Leads (nicht aber die Demo-Mocks). */
export function clearStoredLeads(slug: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key(slug));
  } catch {
    // ignore
  }
}

/**
 * Erzeugt einen Lead-ID (camelCase Suffix für lokale Eindeutigkeit).
 * Format: `lead-<slug>-<random>`.
 */
export function generateLeadId(slug: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `lead-${slug}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `lead-${slug}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Hängt einen neuen Lead an den Browser-Storage. Validiert defensiv;
 * bei Erfolg `true`, bei Schema-Fehler `false`.
 */
export function appendLead(slug: string, lead: Lead): boolean {
  const parsed = LeadSchema.safeParse(lead);
  if (!parsed.success) return false;
  const current = readStored(slug);
  const next = [parsed.data, ...current];
  return writeStored(slug, next);
}

type LeadPatch = Partial<
  Pick<
    Lead,
    "status" | "notes" | "name" | "phone" | "email" | "message"
  >
>;

/**
 * Aktualisiert einen Lead anhand seiner ID (nur Browser-Storage).
 * Demo-Mock-Leads bleiben unverändert – nutze stattdessen einen
 * Override-Eintrag, falls du Demo-Werte überschreiben willst.
 */
export function updateStoredLead(
  slug: string,
  leadId: string,
  patch: LeadPatch,
): boolean {
  const current = readStored(slug);
  const idx = current.findIndex((l) => l.id === leadId);
  if (idx < 0) return false;
  const target = current[idx];
  if (!target) return false;
  const updated: Lead = {
    ...target,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const validated = LeadSchema.safeParse(updated);
  if (!validated.success) return false;
  const next = [...current];
  next[idx] = validated.data;
  return writeStored(slug, next);
}

/**
 * Verschmelzt Demo-Mock-Leads mit persistierten Einträgen.
 * Persistierte Einträge mit der gleichen ID überschreiben Mock-Einträge,
 * um Lokal-Edits konsistent zu halten. Ergebnis ist nach `createdAt`
 * absteigend sortiert.
 */
export function getEffectiveLeads(
  slug: string,
  fallback: readonly Lead[],
): Lead[] {
  const stored = readStored(slug);
  const byId = new Map<string, Lead>();
  for (const lead of fallback) byId.set(lead.id, lead);
  for (const lead of stored) byId.set(lead.id, lead);
  return [...byId.values()].sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1,
  );
}

/** Helfer für das Dashboard-Übersicht: Counts pro Status. */
export function countByStatus(leads: readonly Lead[]): Record<LeadStatus, number> {
  const counts: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    won: 0,
    lost: 0,
    archived: 0,
  };
  for (const lead of leads) counts[lead.status] += 1;
  return counts;
}
