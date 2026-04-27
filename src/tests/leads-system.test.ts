/**
 * Smoketest für das Lead-System (Session 12).
 *
 * Prüft:
 *  - alle Demo-Leads sind valide,
 *  - branchen-spezifische Lead-Felder existieren in jedem Preset,
 *  - der Mock-Store ist SSR-sicher (kein `window` → no-op),
 *  - `countByStatus` zählt korrekt und ist exhaustive,
 *  - `getEffectiveLeads` mergt sinnvoll,
 *  - Antwort-Vorlagen ersetzen Platzhalter wie erwartet.
 */

import { LeadSchema } from "@/core/validation/lead.schema";
import { mockBusinesses, mockLeads } from "@/data";
import { getPresetOrFallback } from "@/core/industries";
import {
  appendLead,
  clearStoredLeads,
  countByStatus,
  generateLeadId,
  getEffectiveLeads,
  getStoredLeads,
  hasStoredLeads,
  updateStoredLead,
} from "@/lib/mock-store/leads-overrides";
import {
  REPLY_TEMPLATES,
  fillTemplate,
} from "@/components/dashboard/leads-view";
import type { Lead } from "@/types/lead";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Lead-system assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Alle Demo-Leads passen ins Schema
// ---------------------------------------------------------------------------

assert(mockLeads.length >= 20, "≥ 20 Demo-Leads vorhanden");
for (const lead of mockLeads) {
  const result = LeadSchema.safeParse(lead);
  assert(
    result.success,
    `Lead ${lead.id} ist valide` +
      (result.success ? "" : ` – Fehler: ${result.error.message}`),
  );
}

// ---------------------------------------------------------------------------
// 2. Jedes Industry-Preset hat ein name- und ein phone-Feld
// ---------------------------------------------------------------------------

for (const business of mockBusinesses) {
  const preset = getPresetOrFallback(business.industryKey);
  const keys = preset.leadFormFields.map((f) => f.key);
  assert(keys.includes("name"), `${preset.label}: name-Feld vorhanden`);
  assert(keys.includes("phone"), `${preset.label}: phone-Feld vorhanden`);
  assert(
    preset.leadFormFields.length >= 2,
    `${preset.label}: ≥ 2 Lead-Felder`,
  );
}

// ---------------------------------------------------------------------------
// 3. Mock-Store ist SSR-sicher
// ---------------------------------------------------------------------------

assert(getStoredLeads("studio-haarlinie").length === 0, "ohne Browser leer");
assert(!hasStoredLeads("studio-haarlinie"), "ohne Browser kein Override");

const probeLead: Lead = LeadSchema.parse({
  id: generateLeadId("studio-haarlinie"),
  businessId: "biz-studio-haarlinie",
  source: "website_form",
  name: "Test User",
  phone: "+49 30 1234567",
  message: "Probe",
  status: "new",
  notes: "",
  createdAt: "2026-04-27T10:00:00Z",
  updatedAt: "2026-04-27T10:00:00Z",
});

assert(
  appendLead("studio-haarlinie", probeLead) === false,
  "appendLead ohne Browser ist no-op",
);
assert(
  updateStoredLead("studio-haarlinie", probeLead.id, { status: "won" }) === false,
  "updateStoredLead ohne Browser ist no-op",
);

clearStoredLeads("studio-haarlinie"); // darf nicht werfen

// ---------------------------------------------------------------------------
// 4. countByStatus ist exhaustive und stimmt mit Demo-Daten
// ---------------------------------------------------------------------------

const counts = countByStatus(mockLeads);
const sumAllStatuses =
  counts.new +
  counts.contacted +
  counts.qualified +
  counts.won +
  counts.lost +
  counts.archived;
assert(
  sumAllStatuses === mockLeads.length,
  "countByStatus deckt jeden Lead-Status ab",
);
assert(counts.new >= 1, "mindestens ein 'new'-Lead in den Mocks");
assert(counts.won >= 1, "mindestens ein 'won'-Lead in den Mocks");

// ---------------------------------------------------------------------------
// 5. getEffectiveLeads ohne Override = Identität (sortiert)
// ---------------------------------------------------------------------------

const businessSlug = mockBusinesses[0]!.slug;
const businessLeads = mockLeads.filter(
  (l) => l.businessId === mockBusinesses[0]!.id,
);
const effective = getEffectiveLeads(businessSlug, businessLeads);
assert(
  effective.length === businessLeads.length,
  "getEffectiveLeads behält alle Demo-Leads",
);

// Sortiert: createdAt absteigend
for (let i = 1; i < effective.length; i++) {
  const prev = effective[i - 1]!;
  const curr = effective[i]!;
  assert(prev.createdAt >= curr.createdAt, "sortiert nach createdAt absteigend");
}

// ---------------------------------------------------------------------------
// 6. Antwort-Vorlagen mit Platzhalter
// ---------------------------------------------------------------------------

assert(REPLY_TEMPLATES.length >= 3, "mindestens 3 Antwort-Vorlagen");
for (const tpl of REPLY_TEMPLATES) {
  assert(
    tpl.body.includes("{{name}}"),
    `Vorlage ${tpl.key} enthält {{name}}-Platzhalter`,
  );
  assert(
    tpl.body.includes("{{betrieb}}"),
    `Vorlage ${tpl.key} enthält {{betrieb}}-Platzhalter`,
  );
}

const sampleLead = mockLeads[0]!;
const sampleBusiness = mockBusinesses.find(
  (b) => b.id === sampleLead.businessId,
)!;
const filled = fillTemplate(REPLY_TEMPLATES[0]!.body, {
  lead: sampleLead,
  businessName: sampleBusiness.name,
});
assert(filled.includes(sampleLead.name), "Vorlage enthält den Lead-Namen");
assert(filled.includes(sampleBusiness.name), "Vorlage enthält den Betriebsnamen");
assert(!filled.includes("{{name}}"), "alle Platzhalter wurden ersetzt");
assert(!filled.includes("{{betrieb}}"), "alle Platzhalter wurden ersetzt");

export const __LEADS_SYSTEM_SMOKETEST__ = {
  mockLeadCount: mockLeads.length,
  templateCount: REPLY_TEMPLATES.length,
};
