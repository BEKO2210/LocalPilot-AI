/**
 * Lead-Repository (Code-Session 40).
 *
 * Server-/Edge-tauglicher Schreibe-Pfad für Public-Form-Submits.
 * Anders als bei `BusinessRepository` ist Lead **write-only für anon**:
 *   - `create()` ist der einzige Pfad, der ohne Auth läuft.
 *   - `listForBusiness()` braucht einen authenticated-Client (kommt
 *     in Session 41+, wenn Owner-Auth steht). Vorerst werfen die
 *     Implementierungen ein klares „nicht unterstützt"-Error.
 *
 * **Wichtig zur RLS-Falle**: PostgREST macht nach `insert(...)` einen
 * impliziten SELECT, um die geschriebene Zeile zurückzugeben. Unter
 * unserer asymmetrischen RLS (anon darf nicht lesen, Migration 0005)
 * scheitert dieser SELECT mit `42501 row-level security violation`,
 * obwohl der INSERT erfolgreich war. Workaround: ID + Timestamps
 * **client-side** generieren, INSERT ohne `.select()`-Chain ausführen.
 * Wir geben dann das Lead-Objekt zurück, das wir selbst gebaut haben —
 * inhaltsidentisch zur DB-Zeile.
 *
 * Browser-side `localStorage`-Schreibpfad
 * (`src/lib/mock-store/leads-overrides.ts`) bleibt unverändert. Das
 * `LeadRepository` ist der Server/SSR-Pfad — beide leben parallel.
 */

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/types/lead";
import {
  LeadSchema,
  type LeadConsent,
} from "@/core/validation/lead.schema";
import type { LeadSource } from "@/types/common";

export interface NewLeadInput {
  readonly businessId: string;
  readonly source?: LeadSource;
  readonly name: string;
  readonly phone?: string;
  readonly email?: string;
  readonly message?: string;
  readonly requestedServiceId?: string;
  readonly preferredDate?: string;
  readonly preferredTime?: string;
  readonly extraFields?: Readonly<
    Record<string, string | number | boolean>
  >;
  readonly consent: LeadConsent;
}

/**
 * Strukturierter Fehler aus dem Lead-Pfad. Wird vom Aufrufer
 * (API-Route oder Form-Action) gemappt auf User-freundliche
 * Texte wie „Pflichtfeld fehlt" / „Bitte versuche es später noch mal".
 */
export type LeadRepositoryErrorKind =
  | "validation"
  | "rls"
  | "constraint"
  | "network"
  | "unknown";

export class LeadRepositoryError extends Error {
  constructor(
    public readonly kind: LeadRepositoryErrorKind,
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "LeadRepositoryError";
  }
}

export interface LeadRepository {
  readonly source: "mock" | "supabase";
  /** Erstellt einen Lead. Wirft `LeadRepositoryError`. */
  create(input: NewLeadInput): Promise<Lead>;
}

// ---------------------------------------------------------------------------
// Pure Helper: Input → Lead-Schema
// ---------------------------------------------------------------------------

function buildLeadFromInput(
  input: NewLeadInput,
  now: Date = new Date(),
): Lead {
  const isoNow = now.toISOString();
  const draft = {
    id: randomUUID(),
    businessId: input.businessId,
    source: input.source ?? "website_form",
    name: input.name,
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.email ? { email: input.email } : {}),
    message: input.message ?? "",
    ...(input.requestedServiceId
      ? { requestedServiceId: input.requestedServiceId }
      : {}),
    ...(input.preferredDate ? { preferredDate: input.preferredDate } : {}),
    ...(input.preferredTime ? { preferredTime: input.preferredTime } : {}),
    extraFields: input.extraFields ?? {},
    status: "new",
    notes: "",
    consent: input.consent,
    createdAt: isoNow,
    updatedAt: isoNow,
  };
  try {
    return LeadSchema.parse(draft);
  } catch (err) {
    throw new LeadRepositoryError(
      "validation",
      err instanceof Error ? err.message : "Lead-Validierung fehlgeschlagen",
      err,
    );
  }
}

// ---------------------------------------------------------------------------
// Mock-Implementierung (in-memory, prozess-lokal)
// ---------------------------------------------------------------------------

/**
 * Erzeugt ein Mock-Repository. Hält Leads in einem internen Bucket
 * pro Prozess — gut für Tests und SSR-Pfade. Browser-`localStorage`
 * läuft separat in `src/lib/mock-store/leads-overrides.ts`.
 */
export function createMockLeadRepository(): LeadRepository {
  const bucket = new Map<string, Lead[]>();
  return {
    source: "mock",
    create(input: NewLeadInput) {
      const lead = buildLeadFromInput(input);
      const list = bucket.get(lead.businessId) ?? [];
      list.push(lead);
      bucket.set(lead.businessId, list);
      return Promise.resolve(lead);
    },
  };
}

// ---------------------------------------------------------------------------
// Supabase-Implementierung
// ---------------------------------------------------------------------------

interface PostgrestErrorLike {
  readonly code?: string;
  readonly message?: string;
  readonly details?: string | null;
  readonly hint?: string | null;
}

function mapSupabaseError(err: PostgrestErrorLike): LeadRepositoryError {
  const code = err.code ?? "";
  const msg = err.message ?? "Datenbank-Fehler";
  // PostgREST-spezifische Codes (nicht-numerisch) priorisieren.
  if (code === "PGRST116" || code === "PGRST301") {
    return new LeadRepositoryError("rls", `RLS-Verletzung: ${msg}`, err);
  }
  // Postgres SQLSTATE-Codes
  switch (code) {
    case "42501":
      return new LeadRepositoryError(
        "rls",
        "Berechtigung fehlt (Row-Level-Security blockt). Prüfe, ob der Betrieb veröffentlicht ist und Consent gesetzt ist.",
        err,
      );
    case "23502":
      return new LeadRepositoryError(
        "constraint",
        "Pflichtfeld fehlt (NOT NULL).",
        err,
      );
    case "23514":
      return new LeadRepositoryError(
        "constraint",
        "Wert verletzt eine Prüfregel (z. B. fehlender Consent-Stempel oder ungültiger Status).",
        err,
      );
    case "23503":
      return new LeadRepositoryError(
        "constraint",
        "Verknüpfter Datensatz existiert nicht (z. B. Betrieb oder Service).",
        err,
      );
    case "23505":
      return new LeadRepositoryError(
        "constraint",
        "Datensatz existiert bereits (UNIQUE-Verletzung).",
        err,
      );
    default:
      return new LeadRepositoryError("unknown", msg, err);
  }
}

interface LeadInsertRow {
  readonly id: string;
  readonly business_id: string;
  readonly source: string;
  readonly name: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly message: string;
  readonly requested_service_id: string | null;
  readonly preferred_date: string | null;
  readonly preferred_time: string | null;
  readonly extra_fields: Readonly<Record<string, string | number | boolean>>;
  readonly status: string;
  readonly notes: string;
  readonly consent: LeadConsent;
  readonly created_at: string;
  readonly updated_at: string;
}

function leadToRow(lead: Lead): LeadInsertRow {
  return {
    id: lead.id,
    business_id: lead.businessId,
    source: lead.source,
    name: lead.name,
    phone: lead.phone ?? null,
    email: lead.email ?? null,
    message: lead.message,
    requested_service_id: lead.requestedServiceId ?? null,
    preferred_date: lead.preferredDate ?? null,
    preferred_time: lead.preferredTime ?? null,
    extra_fields: lead.extraFields,
    status: lead.status,
    notes: lead.notes,
    consent: lead.consent,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

export function createSupabaseLeadRepository(
  client: SupabaseClient,
): LeadRepository {
  return {
    source: "supabase",
    async create(input: NewLeadInput) {
      const lead = buildLeadFromInput(input);
      const row = leadToRow(lead);

      // KEIN .select() — siehe RLS-Falle im Modul-Header.
      const { error } = await client.from("leads").insert(row);
      if (error) throw mapSupabaseError(error as PostgrestErrorLike);
      return lead;
    },
  };
}

// Test-Helper
export const __TEST_ONLY_buildLeadFromInput__ = buildLeadFromInput;
export const __TEST_ONLY_mapSupabaseError__ = mapSupabaseError;
