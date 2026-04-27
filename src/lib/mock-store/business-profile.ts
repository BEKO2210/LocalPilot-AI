/**
 * Hilfen, um aus einem Demo-`Business`-Datensatz das schmale
 * `BusinessProfile` zu extrahieren (für den Editor) und den
 * Demo-Datensatz mit dem Override zu mischen (für die Preview).
 */

import type { Business } from "@/types/business";
import type { BusinessProfile } from "@/core/validation/business-profile.schema";

/** Extrahiert die editierbaren Felder aus einem Business. */
export function profileFromBusiness(business: Business): BusinessProfile {
  return {
    name: business.name,
    industryKey: business.industryKey,
    locale: business.locale,
    tagline: business.tagline,
    description: business.description,
    logoUrl: business.logoUrl,
    coverImageUrl: business.coverImageUrl,
    address: business.address,
    contact: business.contact,
    openingHours: business.openingHours,
    themeKey: business.themeKey,
    primaryColor: business.primaryColor,
    secondaryColor: business.secondaryColor,
    accentColor: business.accentColor,
  };
}

/** Verschmilzt Demo-Business mit aktuellem Profil. Profil hat Vorrang. */
export function mergeBusinessWithProfile(
  base: Business,
  profile: BusinessProfile,
): Business {
  return {
    ...base,
    name: profile.name,
    industryKey: profile.industryKey,
    locale: profile.locale,
    tagline: profile.tagline,
    description: profile.description,
    logoUrl: profile.logoUrl,
    coverImageUrl: profile.coverImageUrl,
    address: profile.address,
    contact: profile.contact,
    openingHours: profile.openingHours,
    themeKey: profile.themeKey,
    primaryColor: profile.primaryColor,
    secondaryColor: profile.secondaryColor,
    accentColor: profile.accentColor,
  };
}
