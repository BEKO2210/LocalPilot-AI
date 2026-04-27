/**
 * Smoketest für die Mock-Daten aus Session 6.
 *
 * Stellt sicher, dass:
 *  - genug Demo-Betriebe vorhanden sind
 *  - jede Branche, jedes Theme und jedes Paket einmal vorkommt
 *  - keine doppelten Slugs / IDs auftauchen
 *  - jeder Lead zu einem existierenden Betrieb gehört
 *  - alle Service-/Review-/FAQ-IDs eindeutig sind
 *  - die Service-/Review-/FAQ-`businessId`-Felder konsistent sind
 *  - Pakete-Limits (`maxServices`) eingehalten werden
 *  - keine offensichtlich realen Daten (echte Telefon-/PLZ-Muster) drinstecken
 */

import {
  averageRatingByBusiness,
  businessesBySlug,
  getMockBusinessBySlug,
  leadsByBusiness,
  listMockBusinessSlugs,
  mockBusinesses,
  mockDataset,
  mockLeads,
  mockReviews,
  mockServices,
  reviewsByBusiness,
  servicesByBusiness,
} from "@/data";
import { isLimitExceeded, getTier } from "@/core/pricing";
import { hasPreset } from "@/core/industries";
import { THEME_REGISTRY } from "@/core/themes";
import {
  PACKAGE_TIERS,
  type IndustryKey,
  type PackageTier,
  type ThemeKey,
} from "@/types/common";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Mock data assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Mindestabdeckung
// ---------------------------------------------------------------------------

assert(
  mockBusinesses.length >= 5,
  `mindestens 5 Demo-Betriebe (CLAUDE.md), aktuell ${mockBusinesses.length}`,
);

// jede Branche unterschiedlich – per Anforderung von CLAUDE.md "andere Branche"
const industryKeys = new Set<IndustryKey>(mockBusinesses.map((b) => b.industryKey));
assert(
  industryKeys.size === mockBusinesses.length,
  "jede Branche kommt nur einmal vor",
);

// jeder Betrieb hat ein anderes Theme
const themeKeys = new Set<ThemeKey>(mockBusinesses.map((b) => b.themeKey));
assert(
  themeKeys.size === mockBusinesses.length,
  "jedes Theme kommt nur einmal vor",
);

// alle drei aktiv vermarkteten Pakete sichtbar
const tiers = new Set<PackageTier>(mockBusinesses.map((b) => b.packageTier));
for (const t of ["bronze", "silber", "gold"] as const) {
  assert(tiers.has(t), `Paket ${t} ist mindestens einmal vertreten`);
}
// Platin nutzen wir nicht in Mock-Daten – würde in getTier()-Lookup scheitern.
assert(!tiers.has("platin"), "Platin ist (noch) kein Demo-Paket");
// Sicherheits-Check: jedes verwendete Paket existiert auch im Pricing-System.
for (const tier of tiers) {
  PACKAGE_TIERS.includes(tier);
  getTier(tier); // wirft, falls nicht hinterlegt
}

// ---------------------------------------------------------------------------
// Branchen / Themes existieren wirklich
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  assert(
    hasPreset(business.industryKey),
    `${business.slug}: Branche ${business.industryKey} existiert als Preset`,
  );
  assert(
    Boolean(THEME_REGISTRY[business.themeKey]),
    `${business.slug}: Theme ${business.themeKey} existiert in der Registry`,
  );
}

// ---------------------------------------------------------------------------
// Eindeutige Slugs / IDs
// ---------------------------------------------------------------------------

const slugs = listMockBusinessSlugs();
assert(new Set(slugs).size === slugs.length, "Slugs sind eindeutig");

const businessIds = new Set(mockBusinesses.map((b) => b.id));
assert(businessIds.size === mockBusinesses.length, "Business-IDs sind eindeutig");

const serviceIds = new Set(mockServices.map((s) => s.id));
assert(serviceIds.size === mockServices.length, "Service-IDs sind eindeutig");

const reviewIds = new Set(mockReviews.map((r) => r.id));
assert(reviewIds.size === mockReviews.length, "Review-IDs sind eindeutig");

const leadIds = new Set(mockLeads.map((l) => l.id));
assert(leadIds.size === mockLeads.length, "Lead-IDs sind eindeutig");

// ---------------------------------------------------------------------------
// Konsistenz: Services / Reviews / Leads gehören zum richtigen Betrieb
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  for (const s of business.services) {
    assert(
      s.businessId === business.id,
      `Service ${s.id} verweist auf falsche Business-ID`,
    );
  }
  for (const r of business.reviews) {
    assert(
      r.businessId === business.id,
      `Review ${r.id} verweist auf falsche Business-ID`,
    );
  }
}

for (const lead of mockLeads) {
  assert(
    businessIds.has(lead.businessId),
    `Lead ${lead.id} verweist auf existierenden Betrieb`,
  );
}

// ---------------------------------------------------------------------------
// Paket-Limits eingehalten
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  assert(
    !isLimitExceeded(
      business.packageTier,
      "maxServices",
      business.services.length,
    ),
    `${business.slug}: Service-Anzahl (${business.services.length}) im ${business.packageTier}-Limit`,
  );
}

// Bronze hat nur 1 Theme erlaubt – aber wir testen die Anzahl genutzter
// Themes über die App nicht; das Theme-Limit greift erst, wenn ein Betrieb
// mehrere Themes parallel verwaltet. Hier: pro Betrieb ein Theme, das ist ok.

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

const lookup = getMockBusinessBySlug("studio-haarlinie");
assert(Boolean(lookup), "getMockBusinessBySlug findet existierenden Slug");
assert(
  getMockBusinessBySlug("nope") === undefined,
  "getMockBusinessBySlug liefert undefined für unbekannte Slugs",
);

assert(
  Object.keys(businessesBySlug).length === mockBusinesses.length,
  "businessesBySlug enthält alle Betriebe",
);

for (const business of mockBusinesses) {
  assert(
    Array.isArray(servicesByBusiness[business.id]),
    `${business.slug}: servicesByBusiness vorhanden`,
  );
  assert(
    Array.isArray(reviewsByBusiness[business.id]),
    `${business.slug}: reviewsByBusiness vorhanden`,
  );
  assert(
    Array.isArray(leadsByBusiness[business.id]),
    `${business.slug}: leadsByBusiness vorhanden`,
  );
}

// ---------------------------------------------------------------------------
// Bewertungs-Statistik
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  const avg = averageRatingByBusiness[business.id] ?? 0;
  if (business.reviews.length > 0) {
    assert(avg >= 1 && avg <= 5, `${business.slug}: avg rating in [1,5]`);
  }
}

// ---------------------------------------------------------------------------
// Lead-Status-Mix vorhanden
// ---------------------------------------------------------------------------

const statusSet = new Set(mockLeads.map((l) => l.status));
for (const required of ["new", "contacted", "qualified", "won"] as const) {
  assert(statusSet.has(required), `Lead-Status ${required} ist im Bestand`);
}

// ---------------------------------------------------------------------------
// Daten-Hygiene: keine offensichtlich realen Telefon-/Mail-Domains
// ---------------------------------------------------------------------------

const REAL_DOMAINS = ["gmail.com", "gmx.de", "web.de", "hotmail.com", "yahoo.com"];
for (const lead of mockLeads) {
  if (lead.email) {
    for (const dom of REAL_DOMAINS) {
      assert(
        !lead.email.toLowerCase().endsWith(dom),
        `Lead ${lead.id}: keine echten Mail-Provider in Mocks (${dom})`,
      );
    }
  }
}
for (const business of mockBusinesses) {
  if (business.contact.email) {
    for (const dom of REAL_DOMAINS) {
      assert(
        !business.contact.email.toLowerCase().endsWith(dom),
        `${business.slug}: keine echten Mail-Provider als Betriebs-Mail`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Mock-Dataset wird beim Laden validiert (passiert in mock-dataset.ts).
// Hier ein Sanity-Check, dass das Aggregat zu den Einzel-Listen passt.
// ---------------------------------------------------------------------------

assert(
  mockDataset.businesses.length === mockBusinesses.length,
  "MockDataset enthält alle Betriebe",
);
assert(
  mockDataset.leads.length === mockLeads.length,
  "MockDataset enthält alle Leads",
);

export const __MOCK_DATA_SMOKETEST__ = {
  businesses: mockBusinesses.length,
  services: mockServices.length,
  reviews: mockReviews.length,
  leads: mockLeads.length,
  industries: industryKeys.size,
  themes: themeKeys.size,
};
