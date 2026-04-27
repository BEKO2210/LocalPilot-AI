/**
 * Smoketest für die Public-Site-Helper aus Session 7.
 *
 * Compile-/Runtime-Smoketest für die Kontakt-Link-Helfer und für die
 * Konsistenz zwischen `generateStaticParams`-Quelle (Slug-Liste) und den
 * Mock-Businesses.
 */

import {
  formatPhoneDisplay,
  mailtoLink,
  telLink,
  whatsappLink,
} from "@/lib/contact-links";
import {
  getMockBusinessBySlug,
  listMockBusinessSlugs,
  mockBusinesses,
} from "@/data";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Public-site assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Kontakt-Link-Helfer
// ---------------------------------------------------------------------------

assert(
  telLink("+49 30 9000 1240") === "tel:+493090001240",
  "tel: normalisiert Leerzeichen und behält +",
);
assert(telLink("030 9000 1240") === "tel:03090001240", "tel: ohne Plus");
assert(
  telLink("(030) 9000-1240") === "tel:03090001240",
  "tel: entfernt Klammern/Bindestriche",
);

assert(
  whatsappLink("+49 30 9000 1240") === "https://wa.me/493090001240",
  "wa.me ohne Plus, ohne Spaces",
);
assert(
  whatsappLink("+49 30 9000 1240", "Hallo Welt").includes("text=Hallo%20Welt"),
  "WhatsApp encodiert Subject",
);

assert(mailtoLink("kontakt@example.org") === "mailto:kontakt@example.org", "mailto basic");
assert(
  mailtoLink("kontakt@example.org", "Anfrage Termin").includes("subject=Anfrage%20Termin"),
  "mailto encodiert Subject",
);

assert(
  formatPhoneDisplay("  +49 30 9000 1240  ") === "+49 30 9000 1240",
  "formatPhoneDisplay trimmt nur",
);

// ---------------------------------------------------------------------------
// Konsistenz: jeder Slug ist auflösbar, generateStaticParams-Liste vollständig
// ---------------------------------------------------------------------------

const slugs = listMockBusinessSlugs();
assert(slugs.length === mockBusinesses.length, "alle Mock-Businesses haben einen Slug");
for (const slug of slugs) {
  const business = getMockBusinessBySlug(slug);
  assert(Boolean(business), `Slug ${slug} ist auflösbar`);
}

// ---------------------------------------------------------------------------
// Pro Betrieb: Pflicht-Kontaktangaben für CTA-Bar
// (Telefon ODER WhatsApp muss vorhanden sein, sonst kann die Mobile-CTA nichts.)
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  const hasPhone = Boolean(business.contact.phone);
  const hasWhatsapp = Boolean(business.contact.whatsapp);
  assert(
    hasPhone || hasWhatsapp,
    `${business.slug}: braucht Telefon ODER WhatsApp für die Mobile-CTA-Bar`,
  );
}

export const __PUBLIC_SITE_SMOKETEST__ = {
  slugCount: slugs.length,
};
