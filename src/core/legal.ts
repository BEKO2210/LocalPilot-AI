/**
 * Zentrale Konstanten und Helper für DSGVO/Legal-Pflichten
 * (Code-Session 32).
 *
 * **Versionierung der Datenschutzerklärung**: jede Einwilligung wird
 * gegen eine bestimmte Policy-Version gestempelt. Wenn sich der Inhalt
 * der Datenschutzerklärung ändert, **muss** `PRIVACY_POLICY_VERSION`
 * erhöht werden — bestehende Leads behalten ihren Zeitstempel und
 * ihre alte Versionsnummer (Audit-Trail nach DSGVO Art. 7 Abs. 1:
 * der Verantwortliche muss nachweisen können, gegen welchen Stand
 * eingewilligt wurde).
 *
 * **Speicherdauer**: 12 Monate ist eine gängige Frist für
 * Geschäftsanbahnungs-Leads, sofern keine Auftragsbeziehung
 * zustande kommt. Wenn der Auftraggeber einen anderen Wert braucht
 * (z. B. Steuer-relevante Aufbewahrung), muss `LEAD_RETENTION_MONTHS`
 * angepasst und die `/datenschutz`-Seite parallel aktualisiert werden.
 */

/**
 * Aktuelle Version der Datenschutzerklärung. Format: `vX-YYYY-MM`.
 * Erhöhen, wenn sich der Inhalt unter `/site/<slug>/datenschutz`
 * inhaltlich ändert.
 */
export const PRIVACY_POLICY_VERSION = "v1-2026-04";

/** Wie lange Lead-Daten bei uns liegen, bevor sie gelöscht werden. */
export const LEAD_RETENTION_MONTHS = 12;

/**
 * Liefert ein Consent-Stempel-Objekt für einen neuen Lead.
 * `givenAt` ist immer „jetzt" zum Zeitpunkt des Submits.
 */
export function buildConsent(now: Date = new Date()): {
  readonly givenAt: string;
  readonly policyVersion: string;
} {
  return {
    givenAt: now.toISOString(),
    policyVersion: PRIVACY_POLICY_VERSION,
  };
}

// ---------------------------------------------------------------------------
// Plattform-Betreiber-Daten (Code-Session 36)
//
// `OwnerInfo` beschreibt den Betreiber der LocalPilot-AI-Plattform selbst
// (NICHT die Demo-Betriebe in `/site/<slug>`). Wird auf `/impressum` und
// `/datenschutz` angezeigt.
//
// Persönliche Daten dürfen NICHT als Default-Werte ins Repo. Sie werden
// ausschließlich aus ENV-Variablen gelesen — leak-sicher per Konstruktion.
// Solange die ENVs leer sind, läuft die Plattform im „Demo-Mode": die
// Seiten zeigen einen sichtbaren Hinweis, dass das Impressum noch nicht
// produktiv konfiguriert ist.
// ---------------------------------------------------------------------------

export interface OwnerInfo {
  /** Vor- und Nachname / Firmenname des Anbieters. */
  readonly name: string;
  /** Straße + Hausnummer. */
  readonly street: string;
  /** Postleitzahl. */
  readonly postalCode: string;
  /** Stadt. */
  readonly city: string;
  /** Land (deutsche Schreibweise). Default „Deutschland". */
  readonly country: string;
  /** Pflicht: E-Mail (DDG/§5 TMG verlangt eine elektronische Kontaktmöglichkeit). */
  readonly email: string;
  /** Optional: Telefon (zweite Kontaktmöglichkeit). */
  readonly phone?: string;
  /** Optional: USt-IdNr. nach § 27a UStG. */
  readonly taxId?: string;
  /**
   * `true`, wenn alle Pflichtfelder gesetzt sind und das Impressum
   * produktiv ausgespielt werden darf. `false` schaltet einen
   * sichtbaren „Demo-Mode"-Hinweis frei.
   */
  readonly configured: boolean;
}

const DEMO_OWNER: OwnerInfo = {
  name: "(Anbieter noch nicht konfiguriert)",
  street: "(Adresse fehlt)",
  postalCode: "00000",
  city: "(Stadt fehlt)",
  country: "Deutschland",
  email: "noreply@example.invalid",
  configured: false,
};

/** Reine Convenience für UIs, die den Plattform-Namen brauchen. */
export const PLATFORM_NAME = "LocalPilot AI";

function readTrimmed(
  env: Readonly<Record<string, string | undefined>>,
  key: string,
): string | undefined {
  const v = env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

/**
 * Liest die Plattform-Betreiber-Daten aus den ENV-Variablen.
 * Pflicht für `configured=true`: NAME, STREET, POSTAL_CODE, CITY,
 * EMAIL. Fehlt eines, fällt das Ergebnis auf `DEMO_OWNER` zurück.
 *
 * Erwartete ENV-Variablen:
 *   LP_OWNER_NAME         — voller Name oder Firmenname (Pflicht)
 *   LP_OWNER_STREET       — Straße + Hausnummer (Pflicht)
 *   LP_OWNER_POSTAL_CODE  — PLZ (Pflicht)
 *   LP_OWNER_CITY         — Stadt (Pflicht)
 *   LP_OWNER_EMAIL        — Kontakt-E-Mail (Pflicht)
 *   LP_OWNER_COUNTRY      — Land (Default „Deutschland")
 *   LP_OWNER_PHONE        — Telefon (optional)
 *   LP_OWNER_TAX_ID       — USt-IdNr. (optional)
 */
export function getOwnerInfo(
  env: Readonly<Record<string, string | undefined>> = process.env,
): OwnerInfo {
  const name = readTrimmed(env, "LP_OWNER_NAME");
  const street = readTrimmed(env, "LP_OWNER_STREET");
  const postalCode = readTrimmed(env, "LP_OWNER_POSTAL_CODE");
  const city = readTrimmed(env, "LP_OWNER_CITY");
  const email = readTrimmed(env, "LP_OWNER_EMAIL");
  const country = readTrimmed(env, "LP_OWNER_COUNTRY") ?? "Deutschland";
  const phone = readTrimmed(env, "LP_OWNER_PHONE");
  const taxId = readTrimmed(env, "LP_OWNER_TAX_ID");

  if (!name || !street || !postalCode || !city || !email) {
    return DEMO_OWNER;
  }

  return {
    name,
    street,
    postalCode,
    city,
    country,
    email,
    ...(phone ? { phone } : {}),
    ...(taxId ? { taxId } : {}),
    configured: true,
  };
}
