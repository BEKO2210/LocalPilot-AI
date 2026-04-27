/**
 * Smoketest für den Services-Editor (Session 11).
 *
 * Prüft:
 *  - alle Demo-Service-Listen sind gegen `ServicesFormSchema` valide,
 *  - Reihenfolge wird durch `sortOrder` deterministisch sortierbar,
 *  - Bronze-Limit (10) ist im Pricing-System richtig hinterlegt und greift,
 *  - der Mock-Store wirft auch ohne `window` nicht (SSR-tauglich),
 *  - jeder Demo-Service hat eine eindeutige ID und gehört zum richtigen
 *    Business.
 */

import { z } from "zod";
import { ServiceSchema } from "@/core/validation/service.schema";
import { mockBusinesses } from "@/data";
import {
  clearServicesOverride,
  getEffectiveServices,
  getServicesOverride,
  setServicesOverride,
} from "@/lib/mock-store/services-overrides";
import { getTierLimits, isLimitExceeded } from "@/core/pricing";

const ServicesFormSchema = z.object({
  services: z.array(ServiceSchema),
});

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Services-edit assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Alle Demo-Service-Listen sind formularvalide
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  const result = ServicesFormSchema.safeParse({ services: business.services });
  assert(
    result.success,
    `${business.slug}: Service-Liste passt ins Formular-Schema` +
      (result.success ? "" : ` – Fehler: ${result.error.message}`),
  );
}

// ---------------------------------------------------------------------------
// 2. sortOrder ist eindeutig und konsekutiv-sortierbar pro Business
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  const orders = new Set<number>();
  for (const s of business.services) {
    assert(
      Number.isInteger(s.sortOrder) && s.sortOrder >= 0,
      `${business.slug}/${s.id}: sortOrder ist eine nicht-negative Ganzzahl`,
    );
    orders.add(s.sortOrder);
  }
  assert(
    orders.size === business.services.length,
    `${business.slug}: sortOrder-Werte sind eindeutig`,
  );

  // Sortiert ergibt die Liste eine stabile Reihenfolge
  const sorted = [...business.services].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  for (let i = 0; i < sorted.length; i++) {
    assert(
      sorted[i]!.businessId === business.id,
      `${business.slug}: Service ${sorted[i]!.id} verweist auf richtige Business-ID`,
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Eindeutige IDs über alle Services
// ---------------------------------------------------------------------------

const allIds = new Set<string>();
for (const b of mockBusinesses) {
  for (const s of b.services) {
    assert(!allIds.has(s.id), `Service-ID ${s.id} ist projektweit eindeutig`);
    allIds.add(s.id);
  }
}

// ---------------------------------------------------------------------------
// 4. Paket-Limit-Logik
// ---------------------------------------------------------------------------

assert(getTierLimits("bronze").maxServices === 10, "Bronze-Limit = 10");
assert(getTierLimits("silber").maxServices === 30, "Silber-Limit = 30");
assert(getTierLimits("gold").maxServices === 100, "Gold-Limit = 100");

// 11 Services sprengen Bronze, 30 sind Silber-Grenzwert
assert(isLimitExceeded("bronze", "maxServices", 11), "11 > Bronze");
assert(!isLimitExceeded("bronze", "maxServices", 10), "10 = Bronze ok");
assert(!isLimitExceeded("silber", "maxServices", 30), "30 = Silber ok");
assert(isLimitExceeded("silber", "maxServices", 31), "31 > Silber");

// ---------------------------------------------------------------------------
// 5. Mock-Store ist SSR-sicher und liefert sinnvolle Defaults
// ---------------------------------------------------------------------------

// Ohne `window` muss alles ruhig durchlaufen.
assert(
  getServicesOverride("studio-haarlinie") === null,
  "ohne Browser kein Override",
);
assert(
  setServicesOverride("studio-haarlinie", []) === false,
  "Set ohne Browser ist no-op",
);
clearServicesOverride("studio-haarlinie"); // darf nicht werfen

const fallbackBusiness = mockBusinesses[0]!;
const effective = getEffectiveServices(fallbackBusiness.slug, fallbackBusiness.services);
assert(
  effective === fallbackBusiness.services,
  "Ohne Override = Original-Liste (Identität)",
);

export const __SERVICES_EDIT_SMOKETEST__ = {
  totalServices: allIds.size,
};
