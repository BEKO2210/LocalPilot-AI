/**
 * Wiederverwendbare Bausteine für IndustryPresets.
 *
 * Branchenneutral – diese Helfer enthalten KEINE branchen-spezifischen Texte.
 * Sie liefern nur Standardfelder (Name, Telefon, E-Mail, Nachricht), CTAs und
 * Compliance-Fragmente, die in fast jedem Preset vorkommen.
 *
 * So bleibt jede konkrete Preset-Datei kurz und lesbar, während die
 * Pflichtfelder (`name`, `phone`, `message`) konsistent bleiben.
 */

import type { LeadFormField } from "@/types/lead";
import type {
  ComplianceNote,
  PresetCta,
} from "@/types/industry";

// ---------------------------------------------------------------------------
// Lead-Form-Bausteine
// ---------------------------------------------------------------------------

export const NAME_FIELD: LeadFormField = {
  key: "name",
  label: "Name",
  type: "text",
  required: true,
  placeholder: "Vor- und Nachname",
};

export const PHONE_FIELD: LeadFormField = {
  key: "phone",
  label: "Telefon",
  type: "phone",
  required: true,
  placeholder: "Für schnelle Rückrufe",
};

export const EMAIL_FIELD: LeadFormField = {
  key: "email",
  label: "E-Mail",
  type: "email",
  required: false,
  placeholder: "Optional",
};

export const MESSAGE_FIELD: LeadFormField = {
  key: "message",
  label: "Nachricht",
  type: "textarea",
  required: false,
  placeholder: "Worum geht es?",
};

export const PREFERRED_DATE_FIELD: LeadFormField = {
  key: "preferredDate",
  label: "Wunschtermin",
  type: "date",
  required: false,
  helperText: "Wir bestätigen den Termin nach Verfügbarkeit.",
};

// ---------------------------------------------------------------------------
// CTAs (mehrfach verwendet)
// ---------------------------------------------------------------------------

export const CTA_APPOINTMENT_PRIMARY: PresetCta = {
  key: "appointment",
  label: "Termin anfragen",
  intent: "appointment",
  primary: true,
};

export const CTA_CALL: PresetCta = {
  key: "call",
  label: "Jetzt anrufen",
  intent: "call",
  primary: false,
};

export const CTA_WHATSAPP: PresetCta = {
  key: "whatsapp",
  label: "WhatsApp schreiben",
  intent: "whatsapp",
  primary: false,
};

export const CTA_QUOTE: PresetCta = {
  key: "quote",
  label: "Angebot anfordern",
  intent: "form",
  primary: true,
};

export const CTA_CALLBACK: PresetCta = {
  key: "callback",
  label: "Rückruf anfordern",
  intent: "form",
  primary: false,
};

// ---------------------------------------------------------------------------
// Häufig verwendete Compliance-Hinweise
// ---------------------------------------------------------------------------

export const COMPLIANCE_NO_MEDICAL_PROMISE: ComplianceNote = {
  topic: "medical",
  note:
    "Keine Heilversprechen. Keine medizinischen Garantien. Nur neutrale " +
    "Beschreibung der Dienstleistung.",
};

export const COMPLIANCE_NO_LEGAL_ADVICE: ComplianceNote = {
  topic: "legal",
  note:
    "Keine Rechtsberatung in Texten oder Antworten. Impressum und Datenschutz " +
    "sind als Platzhalter gekennzeichnet und müssen vom Betrieb geprüft werden.",
};

export const COMPLIANCE_NO_FINANCE_GUARANTEE: ComplianceNote = {
  topic: "finance",
  note:
    "Keine verbindliche Beratung, keine Rendite- oder Kostengarantien. " +
    "Preise auf Anfrage und nach Aufnahme der Anforderungen.",
};

export const COMPLIANCE_NO_AGE_RESTRICTED_PROMISE: ComplianceNote = {
  topic: "general",
  note:
    "Keine Aussagen, die ein bestimmtes Alter, Aussehen oder Ergebnis " +
    "garantieren – Texte bleiben sachlich und realistisch.",
};
