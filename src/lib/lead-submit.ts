/**
 * Pure-Logic-Helper für den Lead-Form-Submit (Code-Session 44).
 *
 * Verbindet drei Pfade in einer testbaren Funktion:
 *   1. Server-Insert via `POST /api/leads` (sobald das Backend
 *      konfiguriert ist).
 *   2. Sicherheits-Schreibung in den lokalen Mock-Store, damit
 *      das Demo-Dashboard weiterhin Daten zeigt.
 *   3. Sinnvolles Fallback-Verhalten, wenn der Server fehlt
 *      (Static-Pages-Build → 404), 4xx/5xx wirft, oder der
 *      Browser offline ist.
 *
 * Der Aufrufer bekommt `SubmitResult` zurück und entscheidet, was
 * er der UI zeigt — die Funktion selbst rendert nichts.
 *
 * Form ruft das immer mit `appendLocal` aus
 * `src/lib/mock-store/leads-overrides.ts` (sync, browser-only).
 */

import type { Lead } from "@/types/lead";

export type SubmitResult =
  | {
      readonly kind: "server";
      /** ID, die der Server vergeben hat (Supabase-UUID o. ä.). */
      readonly serverLeadId: string;
      /** Hat localStorage zusätzlich gespeichert? */
      readonly localBackup: boolean;
    }
  | {
      readonly kind: "local-only";
      /** Warum kein Server-Insert? Kommt z. B. bei Static-Build. */
      readonly reason: string;
    }
  | {
      readonly kind: "local-fallback";
      /** Server hat 4xx/5xx geworfen — Lead liegt nur lokal. */
      readonly reason: string;
      readonly serverStatus?: number;
    }
  | {
      readonly kind: "fail";
      /** Weder Server noch localStorage haben funktioniert. */
      readonly reason: string;
    };

export interface SubmitDeps {
  /** Synchroner localStorage-Schreibpfad. Liefert `false` bei Schreibfehler. */
  readonly appendLocal: (lead: Lead) => boolean;
  /** Override für Tests. Default: globales `fetch`. */
  readonly fetchImpl?: typeof fetch;
  /** Nur-lokal-Modus erzwingen (Tests / explizites Opt-Out). */
  readonly skipServer?: boolean;
}

/** Body, der an `/api/leads` gesendet wird. */
export interface ServerSubmitInput {
  readonly businessId: string;
  readonly source?: string;
  readonly name: string;
  readonly phone?: string;
  readonly email?: string;
  readonly message?: string;
  readonly requestedServiceId?: string;
  readonly preferredDate?: string;
  readonly preferredTime?: string;
  readonly extraFields?: Readonly<Record<string, string | number | boolean>>;
  readonly consent: { readonly givenAt: string; readonly policyVersion: string };
}

interface ServerErrorBody {
  readonly error?: string;
  readonly message?: string;
  readonly leadId?: string;
}

/**
 * Schickt den Lead an den Server und schreibt parallel in
 * localStorage. Reihenfolge: erst localStorage (sync, garantiert)
 * dann fetch — der User soll selbst bei Server-Ausfall ein „läuft"
 * sehen.
 */
export async function submitLead(
  serverInput: ServerSubmitInput,
  localBackupLead: Lead,
  deps: SubmitDeps,
): Promise<SubmitResult> {
  // 1) Lokal als Sicherheitsnetz schreiben — sync, kein Roundtrip.
  const localOk = deps.appendLocal(localBackupLead);

  // 2) Server-Pfad (optional).
  if (deps.skipServer) {
    return localOk
      ? { kind: "local-only", reason: "skipServer aktiv" }
      : { kind: "fail", reason: "localStorage hat versagt" };
  }

  const fetchImpl = deps.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(serverInput),
    });
  } catch (err) {
    // Fetch warf — typischerweise Netzwerk-Fehler oder Static-Build
    // ohne Route. localStorage hat (hoffentlich) als Backup schon
    // gegriffen.
    const msg = err instanceof Error ? err.message : "Netzwerk-Fehler";
    return localOk
      ? { kind: "local-fallback", reason: msg }
      : { kind: "fail", reason: msg };
  }

  if (response.ok) {
    let body: ServerErrorBody | null = null;
    try {
      body = (await response.json()) as ServerErrorBody;
    } catch {
      /* Server hat nicht-JSON geliefert — ID dann eben unbekannt. */
    }
    return {
      kind: "server",
      serverLeadId: body?.leadId ?? "(unbekannt)",
      localBackup: localOk,
    };
  }

  if (response.status === 404) {
    // Sehr typisch im Static-Build oder wenn die Route ENV-bedingt
    // nicht gemountet ist. Kein Drama, kein User-Hinweis nötig.
    return localOk
      ? { kind: "local-only", reason: "API-Route /api/leads nicht verfügbar (Static-Build)" }
      : { kind: "fail", reason: "API fehlt + localStorage versagt" };
  }

  // Anderer Server-Fehler — Body lesen für sinnvolle Meldung
  let body: ServerErrorBody | null = null;
  try {
    body = (await response.json()) as ServerErrorBody;
  } catch {
    /* ignore */
  }
  const reason =
    body?.message ?? `Server-Antwort ${response.status}`;
  return localOk
    ? { kind: "local-fallback", reason, serverStatus: response.status }
    : { kind: "fail", reason };
}

/** Gibt den User-sichtbaren Hinweis-Text zu einem Result zurück. */
export function userHintForResult(result: SubmitResult): string | null {
  switch (result.kind) {
    case "server":
      // Nichts zu sagen — alles glatt.
      return null;
    case "local-only":
      // Static-Build / API nicht da → silent. Kein Hinweis.
      return null;
    case "local-fallback":
      return "Wir haben Ihre Anfrage gespeichert, der Versand an den Betrieb läuft sobald wir wieder online sind.";
    case "fail":
      return "Speichern war nicht möglich. Bitte versuchen Sie es nochmal oder rufen Sie direkt an.";
  }
}
