/**
 * Helfer für Kontakt-Deeplinks (`tel:`, `mailto:`, WhatsApp).
 *
 * Behandelt internationale Telefonnummern (führende Länder-Vorwahl `+49 …`),
 * entfernt Leerzeichen / Bindestriche / Klammern und produziert
 * standardkonforme Links, die auf jedem Smartphone funktionieren.
 */

/** Reduziert eine Telefonnummer auf E.164-Form ohne führendes `+`. */
function normalizePhone(phone: string): string {
  // Erlaubt sind nur Ziffern und ein optionales führendes "+".
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^0-9]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/** `tel:`-Link für native Wähl-Aktion am Smartphone. */
export function telLink(phone: string): string {
  return `tel:${normalizePhone(phone)}`;
}

/** WhatsApp Click-to-Chat-Link – braucht Ziffern OHNE `+` und ohne Leerzeichen. */
export function whatsappLink(phone: string, message?: string): string {
  const digits = normalizePhone(phone).replace(/^\+/, "");
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** `mailto:`-Link mit optionalem Subject. */
export function mailtoLink(email: string, subject?: string): string {
  const base = `mailto:${email.trim()}`;
  if (!subject) return base;
  return `${base}?subject=${encodeURIComponent(subject)}`;
}

/** Hübsch formatierte Telefonnummer fürs Anzeigen ("+49 30 9000 1240"). */
export function formatPhoneDisplay(phone: string): string {
  return phone.trim();
}
