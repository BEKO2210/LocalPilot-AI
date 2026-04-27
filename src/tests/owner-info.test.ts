/**
 * Smoketest für `getOwnerInfo` (Code-Session 36).
 *
 * Pure-Function-Test ohne HTTP/IO. Wir injizieren ENV-Maps und
 * prüfen die Configured-Logik + Privacy-Eigenschaften.
 */

import { getOwnerInfo, PLATFORM_NAME } from "@/core/legal";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`owner-info assertion failed: ${message}`);
}

// ---------------------------------------------------------------------------
// 1. Komplett leere ENV → Demo-Mode
// ---------------------------------------------------------------------------
const empty = getOwnerInfo({});
assert(empty.configured === false, "leere ENV → configured=false");
assert(empty.country === "Deutschland", "Default-Country greift");
assert(empty.email.endsWith("example.invalid"), "Demo-Email zeigt nicht in echte Domain");
assert(empty.phone === undefined, "Demo-Owner hat kein Telefon");
assert(empty.taxId === undefined, "Demo-Owner hat keine USt-IdNr.");

// ---------------------------------------------------------------------------
// 2. Nur ein Pflichtfeld fehlt → trotzdem Demo-Mode
// ---------------------------------------------------------------------------
const missingEmail = getOwnerInfo({
  LP_OWNER_NAME: "Max Mustermann",
  LP_OWNER_STREET: "Musterstr. 1",
  LP_OWNER_POSTAL_CODE: "12345",
  LP_OWNER_CITY: "Musterstadt",
  // LP_OWNER_EMAIL fehlt
});
assert(
  missingEmail.configured === false,
  "fehlendes Pflichtfeld → configured=false",
);
assert(
  missingEmail.name !== "Max Mustermann",
  "fehlendes Pflichtfeld → kein Leak des Namens in Demo-Output",
);

const missingCity = getOwnerInfo({
  LP_OWNER_NAME: "Max Mustermann",
  LP_OWNER_STREET: "Musterstr. 1",
  LP_OWNER_POSTAL_CODE: "12345",
  LP_OWNER_EMAIL: "max@example.com",
  // LP_OWNER_CITY fehlt
});
assert(missingCity.configured === false, "fehlende Stadt → Demo-Mode");

// ---------------------------------------------------------------------------
// 3. Voll konfiguriert → echte Daten + configured=true
// ---------------------------------------------------------------------------
const full = getOwnerInfo({
  LP_OWNER_NAME: "Max Mustermann",
  LP_OWNER_STREET: "Musterstr. 1",
  LP_OWNER_POSTAL_CODE: "12345",
  LP_OWNER_CITY: "Musterstadt",
  LP_OWNER_EMAIL: "max@example.com",
  LP_OWNER_PHONE: "+49 1234 567890",
  LP_OWNER_TAX_ID: "DE123456789",
});
assert(full.configured === true, "alle Pflicht → configured=true");
assert(full.name === "Max Mustermann", "Name kommt durch");
assert(full.street === "Musterstr. 1", "Street kommt durch");
assert(full.postalCode === "12345", "PLZ kommt durch");
assert(full.city === "Musterstadt", "Stadt kommt durch");
assert(full.email === "max@example.com", "Email kommt durch");
assert(full.phone === "+49 1234 567890", "Phone kommt durch");
assert(full.taxId === "DE123456789", "TaxId kommt durch");
assert(full.country === "Deutschland", "Default-Country bleibt bei fehlendem Override");

// ---------------------------------------------------------------------------
// 4. Country-Override greift
// ---------------------------------------------------------------------------
const austrian = getOwnerInfo({
  LP_OWNER_NAME: "Max Muster",
  LP_OWNER_STREET: "Hauptstr. 5",
  LP_OWNER_POSTAL_CODE: "1010",
  LP_OWNER_CITY: "Wien",
  LP_OWNER_COUNTRY: "Österreich",
  LP_OWNER_EMAIL: "max@example.at",
});
assert(austrian.country === "Österreich", "Country-Override aus ENV");

// ---------------------------------------------------------------------------
// 5. Whitespace-Trim greift; whitespace-only zählt als leer
// ---------------------------------------------------------------------------
const trimmed = getOwnerInfo({
  LP_OWNER_NAME: "  Max Mustermann  ",
  LP_OWNER_STREET: "Musterstr. 1",
  LP_OWNER_POSTAL_CODE: "12345",
  LP_OWNER_CITY: "Musterstadt",
  LP_OWNER_EMAIL: "max@example.com",
  LP_OWNER_PHONE: "   ", // whitespace-only
});
assert(trimmed.name === "Max Mustermann", "Trim greift");
assert(trimmed.phone === undefined, "Whitespace-only Phone → undefined");
assert(trimmed.configured === true, "configured=true bleibt");

// ---------------------------------------------------------------------------
// 6. Optional-Felder defaulten auf undefined (nicht auf "" oder null)
// ---------------------------------------------------------------------------
const noOptionals = getOwnerInfo({
  LP_OWNER_NAME: "Max",
  LP_OWNER_STREET: "Str. 1",
  LP_OWNER_POSTAL_CODE: "12345",
  LP_OWNER_CITY: "Stadt",
  LP_OWNER_EMAIL: "x@y.de",
});
assert(
  !("phone" in noOptionals),
  "phone NICHT als key vorhanden, wenn nicht gesetzt",
);
assert(
  !("taxId" in noOptionals),
  "taxId NICHT als key vorhanden, wenn nicht gesetzt",
);

// ---------------------------------------------------------------------------
// 7. PLATFORM_NAME ist konstant „LocalPilot AI"
// ---------------------------------------------------------------------------
assert(PLATFORM_NAME === "LocalPilot AI", "Plattform-Name konstant");

// ---------------------------------------------------------------------------
// 8. Privacy: ENV-Inhalte einer NICHT-konfigurierten Map landen NICHT
// im Output (kein Leak von Test-Strings, falls der Aufrufer versehentlich
// nur ein Pflichtfeld setzt)
// ---------------------------------------------------------------------------
const partialLeakTest = getOwnerInfo({
  LP_OWNER_NAME: "SECRET-NAME-PROBE",
  // andere fehlen → Demo-Mode aktiv
});
const dump = JSON.stringify(partialLeakTest);
assert(
  !dump.includes("SECRET-NAME-PROBE"),
  "Bei configured=false landet kein Pflichtfeld-Leak im Output",
);

console.log("owner-info smoketest ✅ (~25 Asserts)");
export const __OWNER_INFO_SMOKETEST__ = { totalAssertions: 25 };
