/**
 * Vollständiges Mock-Dataset – wird beim Module-Load gegen `MockDatasetSchema`
 * validiert. Damit ist sichergestellt, dass jeder einzelne Demo-Betrieb und
 * jeder Lead semantisch zueinander passen, bevor irgendetwas gerendert wird.
 */

import type { LeadsByBusiness, MockDataset } from "./mock-types";
import { validateMockDataset } from "./mock-types";
import { mockBusinesses } from "./mock-businesses";
import { mockLeads } from "./mock-leads";
import { MOCK_NOW } from "./mock-helpers";

export const mockDataset: MockDataset = validateMockDataset({
  generatedAt: MOCK_NOW,
  businesses: mockBusinesses,
  leads: mockLeads,
});

/** Leads gruppiert nach businessId. */
export const leadsByBusiness: LeadsByBusiness = Object.freeze(
  mockBusinesses.reduce<Record<string, readonly typeof mockLeads[number][]>>(
    (acc, business) => {
      acc[business.id] = mockLeads.filter((l) => l.businessId === business.id);
      return acc;
    },
    {},
  ),
);

// Konsistenz-Check: jeder Lead muss zu einem existierenden Betrieb gehören.
{
  const businessIds = new Set(mockBusinesses.map((b) => b.id));
  for (const lead of mockLeads) {
    if (!businessIds.has(lead.businessId)) {
      throw new Error(
        `mock-dataset: Lead ${lead.id} verweist auf unbekannten Betrieb ${lead.businessId}`,
      );
    }
  }
}
