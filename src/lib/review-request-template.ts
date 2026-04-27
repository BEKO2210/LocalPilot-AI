/**
 * Pure-Logic-Helper für Bewertungs-Anfragen (Code-Session 53).
 *
 * Drei isoliert testbare Verantwortlichkeiten:
 *
 *   1. `substitutePlaceholders` — ersetzt `{{customerName}}`,
 *      `{{reviewLink}}` und `{{businessName}}` deterministisch.
 *      Wird sowohl im Form (Live-Vorschau) als auch beim Versand
 *      benutzt. Fehlende Werte werden zu klar erkennbaren
 *      Platzhaltern (`Liebe:r Kund:in`), nicht zu leeren Strings —
 *      so sieht der User sofort, was noch zu füllen ist.
 *   2. `cleanPhoneForChannel` — strippt Leerzeichen, Bindestriche
 *      und führendes `+`/`00` für `tel:`-/`wa.me`-URLs. Whatsapp
 *      und SMS akzeptieren nur Ziffern.
 *   3. `buildChannelSendUrl` — baut `mailto:`, `sms:`, `https://wa.me/…`-
 *      URLs für die vier Kanäle. `in_person` hat keine URL —
 *      die Komponente zeigt dann nur den Copy-Button.
 *
 * Alle Funktionen sind reine Strings — kein Browser-API, kein
 * React, keine Side-Effects.
 */

import type { ReviewRequestChannel } from "@/types/common";

export interface TemplateVars {
  /** Kundenname; leer/whitespace fällt auf Default. */
  readonly customerName?: string | undefined;
  /** Bewertungs-Link (Google, Trustpilot, intern). */
  readonly reviewLink?: string | undefined;
  /** Betriebsname — wird typischerweise aus `business.name` befüllt. */
  readonly businessName?: string | undefined;
}

const CUSTOMER_FALLBACK = "Liebe:r Kund:in";
const LINK_FALLBACK = "(Bewertungslink hier einfügen)";
const BUSINESS_FALLBACK = "(Ihr Betrieb)";

export function substitutePlaceholders(
  template: string,
  vars: TemplateVars,
): string {
  const customer = (vars.customerName ?? "").trim();
  const link = (vars.reviewLink ?? "").trim();
  const business = (vars.businessName ?? "").trim();
  return template
    .replace(/\{\{\s*customerName\s*\}\}/g, customer || CUSTOMER_FALLBACK)
    .replace(/\{\{\s*reviewLink\s*\}\}/g, link || LINK_FALLBACK)
    .replace(/\{\{\s*businessName\s*\}\}/g, business || BUSINESS_FALLBACK);
}

/**
 * Bereitet eine Telefonnummer für `tel:`/`sms:`/`wa.me`-URLs auf.
 * - Strippt Leerzeichen, Bindestriche, Klammern.
 * - Strippt führendes `+` oder `00` (für `wa.me/<digits>`).
 * - Liefert `null`, wenn am Ende keine Ziffer mehr übrig bleibt.
 */
export function cleanPhoneForChannel(input: string): string | null {
  const stripped = input
    .replace(/[\s\-()/]/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "");
  if (!/^\d{4,}$/.test(stripped)) return null;
  return stripped;
}

export interface BuildChannelUrlInput {
  readonly channel: ReviewRequestChannel;
  readonly body: string;
  /** Telefon (für sms/whatsapp) ODER E-Mail (für email). */
  readonly recipient?: string | undefined;
  /** Optional: E-Mail-Subject. Default: „Ihre Erfahrung mit uns?" */
  readonly subject?: string | undefined;
}

export interface BuildChannelUrlResult {
  /**
   * URL für den Send-Button. `null`, wenn der Kanal keinen Direkt-
   * Send unterstützt (`in_person`) oder Pflicht-Werte fehlen
   * (z. B. SMS ohne sinnvolle Telefonnummer).
   */
  readonly url: string | null;
  /** Hinweis-Text fürs UI. `null`, wenn alles gut ist. */
  readonly hint?: string | null;
}

const DEFAULT_SUBJECT = "Ihre Erfahrung mit uns?";

export function buildChannelSendUrl(
  input: BuildChannelUrlInput,
): BuildChannelUrlResult {
  switch (input.channel) {
    case "in_person":
      return {
        url: null,
        hint: "Persönliches Gespräch — kein Direkt-Send. Text kopieren und mündlich erzählen.",
      };

    case "email": {
      const recipient = (input.recipient ?? "").trim();
      const params = new URLSearchParams();
      params.set("subject", input.subject ?? DEFAULT_SUBJECT);
      params.set("body", input.body);
      const target = recipient ? encodeURIComponent(recipient) : "";
      const url = `mailto:${target}?${params.toString()}`;
      return {
        url,
        ...(recipient
          ? {}
          : {
              hint: "Keine E-Mail-Adresse angegeben — Empfänger im Mail-Client einsetzen.",
            }),
      };
    }

    case "sms": {
      const phone = cleanPhoneForChannel(input.recipient ?? "");
      if (!phone) {
        return {
          url: null,
          hint: "Telefonnummer fehlt oder ist ungültig — bitte ohne Sonderzeichen eintragen (z. B. +49 30 1234 5678).",
        };
      }
      const params = new URLSearchParams();
      params.set("body", input.body);
      const url = `sms:${phone}?${params.toString()}`;
      return { url };
    }

    case "whatsapp": {
      const phone = cleanPhoneForChannel(input.recipient ?? "");
      if (!phone) {
        return {
          url: null,
          hint: "WhatsApp-Nummer fehlt oder ist ungültig.",
        };
      }
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(input.body)}`;
      return { url };
    }
  }
}

// ---------------------------------------------------------------------------
// UI-Labels (deutsch)
// ---------------------------------------------------------------------------

const CHANNEL_LABELS: Record<ReviewRequestChannel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "E-Mail",
  in_person: "Persönlich",
};

export function channelLabel(channel: ReviewRequestChannel): string {
  return CHANNEL_LABELS[channel];
}

const TONE_LABELS: Record<"short" | "friendly" | "follow_up", string> = {
  short: "Kurz",
  friendly: "Freundlich",
  follow_up: "Follow-Up",
};

export function toneLabel(tone: "short" | "friendly" | "follow_up"): string {
  return TONE_LABELS[tone];
}
