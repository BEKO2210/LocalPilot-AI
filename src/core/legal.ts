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
