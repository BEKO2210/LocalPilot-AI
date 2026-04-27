/**
 * Smoketest für den Business-Editor (Session 10).
 *
 * Prüft:
 *  - `BusinessProfileSchema` akzeptiert alle 6 Demo-Profile,
 *  - `profileFromBusiness` produziert ein Schema-konformes Profil,
 *  - `mergeBusinessWithProfile` macht das Original nicht kaputt,
 *  - die Schema-Regeln (Pflichtfelder, Hex-Format) greifen mit
 *    sprechenden Fehlermeldungen.
 */

import {
  BusinessProfileSchema,
  type BusinessProfile,
} from "@/core/validation/business-profile.schema";
import { BusinessSchema } from "@/core/validation/business.schema";
import { mockBusinesses } from "@/data";
import {
  mergeBusinessWithProfile,
  profileFromBusiness,
} from "@/lib/mock-store/business-profile";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Business-edit assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Alle Demo-Profile sind gültige BusinessProfiles
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  const profile = profileFromBusiness(business);
  const result = BusinessProfileSchema.safeParse(profile);
  assert(
    result.success,
    `${business.slug}: profileFromBusiness liefert valides Profil` +
      (result.success ? "" : ` – Fehler: ${result.error.message}`),
  );
}

// ---------------------------------------------------------------------------
// 2. Merge: Profil überschreibt nur die editierbaren Felder, Rest bleibt
// ---------------------------------------------------------------------------

const sample = mockBusinesses[0];
assert(Boolean(sample), "mindestens ein Demo-Business für den Test vorhanden");

const baseBusiness = sample!;
const baseProfile = profileFromBusiness(baseBusiness);
const merged = mergeBusinessWithProfile(baseBusiness, baseProfile);
BusinessSchema.parse(merged);
assert(merged.id === baseBusiness.id, "Merge erhält die ID");
assert(merged.slug === baseBusiness.slug, "Merge erhält den Slug");
assert(merged.packageTier === baseBusiness.packageTier, "Merge erhält das Paket");
assert(
  merged.services.length === baseBusiness.services.length,
  "Merge erhält die Services unverändert",
);

// Profil-Änderung wirkt
const renamed: BusinessProfile = { ...baseProfile, name: "Test-Renamed" };
const mergedRenamed = mergeBusinessWithProfile(baseBusiness, renamed);
assert(mergedRenamed.name === "Test-Renamed", "Profil-Name überschreibt");
assert(mergedRenamed.id === baseBusiness.id, "ID bleibt nach Rename");

// ---------------------------------------------------------------------------
// 3. Schema-Regeln greifen
// ---------------------------------------------------------------------------

const tooShortName = BusinessProfileSchema.safeParse({
  ...baseProfile,
  name: "",
});
assert(!tooShortName.success, "leerer Name wird abgelehnt");
if (!tooShortName.success) {
  const issue = tooShortName.error.issues.find((i) => i.path[0] === "name");
  assert(Boolean(issue), "Fehler-Issue für 'name' vorhanden");
}

const badHex = BusinessProfileSchema.safeParse({
  ...baseProfile,
  primaryColor: "rot",
});
assert(!badHex.success, "ungültige Hex-Farbe wird abgelehnt");

const validWithEmptyOverrides = BusinessProfileSchema.safeParse({
  ...baseProfile,
  primaryColor: "",
  secondaryColor: "",
  accentColor: "",
  logoUrl: "",
  coverImageUrl: "",
});
assert(
  validWithEmptyOverrides.success,
  "leere optionale URL/Hex-Strings werden zu undefined transformiert und akzeptiert",
);

// ---------------------------------------------------------------------------
// 4. Kontakt-Pflichten sind nicht enger als das Business-Schema
// (Telefon ODER E-Mail wird beim BusinessSchema erst auf Lead-Ebene erzwungen –
// hier sind beide Felder optional, das passt.)
// ---------------------------------------------------------------------------

const contactlessProfile = BusinessProfileSchema.safeParse({
  ...baseProfile,
  contact: {},
});
assert(
  contactlessProfile.success,
  "leerer ContactDetails-Block ist erlaubt (Editor-Phase)",
);

export const __BUSINESS_EDIT_SMOKETEST__ = {
  validatedDemos: mockBusinesses.length,
};
