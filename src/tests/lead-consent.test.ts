/**
 * Smoketest für DSGVO-Consent-Block am Lead-Schema (Code-Session 32).
 *
 * Pure-Logic-Test: kein DOM, kein Form. Wir verifizieren das Schema-
 * Verhalten, den `buildConsent`-Helper und die Demo-Daten-Pipeline.
 */

import { LeadSchema, LeadConsentSchema } from "@/core/validation/lead.schema";
import {
  LEAD_RETENTION_MONTHS,
  PRIVACY_POLICY_VERSION,
  buildConsent,
} from "@/core/legal";
import { mockLeads } from "@/data";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`lead-consent assertion failed: ${message}`);
}

// -----------------------------------------------------------------------
// 1. PRIVACY_POLICY_VERSION ist eine sinnvolle Versions-Stamp-Form
// -----------------------------------------------------------------------
assert(
  /^v\d+-\d{4}-\d{2}$/.test(PRIVACY_POLICY_VERSION),
  `PRIVACY_POLICY_VERSION matched 'vX-YYYY-MM' (got '${PRIVACY_POLICY_VERSION}')`,
);
assert(
  LEAD_RETENTION_MONTHS >= 1 && LEAD_RETENTION_MONTHS <= 120,
  "LEAD_RETENTION_MONTHS sinnvoll zwischen 1 und 120",
);

// -----------------------------------------------------------------------
// 2. buildConsent liefert ISO-Date + aktuelle Policy-Version
// -----------------------------------------------------------------------
const fixedDate = new Date("2026-04-27T10:30:00.000Z");
const stamp = buildConsent(fixedDate);
assert(
  stamp.givenAt === "2026-04-27T10:30:00.000Z",
  "buildConsent.givenAt = ISO-String der Eingabe",
);
assert(
  stamp.policyVersion === PRIVACY_POLICY_VERSION,
  "buildConsent.policyVersion = aktuelle Version",
);

// Default-Aufruf nutzt aktuelle Zeit
const now = buildConsent();
const nowMs = new Date(now.givenAt).getTime();
assert(
  Math.abs(nowMs - Date.now()) < 5000,
  "buildConsent() ohne Argument → ISO der aktuellen Zeit (±5s Toleranz)",
);

// -----------------------------------------------------------------------
// 3. LeadConsentSchema validiert
// -----------------------------------------------------------------------
const validConsent = LeadConsentSchema.safeParse(stamp);
assert(validConsent.success, "valider Stamp wird akzeptiert");

const noVersion = LeadConsentSchema.safeParse({
  givenAt: "2026-04-27T10:30:00.000Z",
});
assert(!noVersion.success, "fehlende policyVersion wird abgelehnt");

const noDate = LeadConsentSchema.safeParse({ policyVersion: "v1-2026-04" });
assert(!noDate.success, "fehlendes givenAt wird abgelehnt");

const emptyVersion = LeadConsentSchema.safeParse({
  givenAt: "2026-04-27T10:30:00.000Z",
  policyVersion: "",
});
assert(!emptyVersion.success, "leere policyVersion wird abgelehnt");

// -----------------------------------------------------------------------
// 4. LeadSchema lehnt Lead OHNE Consent ab
// -----------------------------------------------------------------------
const leadWithoutConsent = LeadSchema.safeParse({
  id: "lead_test_1",
  businessId: "biz_test_1",
  source: "website_form",
  name: "Max Test",
  phone: "+49 30 1234567",
  message: "Hallo",
  extraFields: {},
  status: "new",
  notes: "",
  createdAt: "2026-04-27T10:00:00.000Z",
  updatedAt: "2026-04-27T10:00:00.000Z",
  // consent fehlt absichtlich
});
assert(
  !leadWithoutConsent.success,
  "Lead OHNE consent → Schema lehnt ab",
);

const leadWithConsent = LeadSchema.safeParse({
  id: "lead_test_1",
  businessId: "biz_test_1",
  source: "website_form",
  name: "Max Test",
  phone: "+49 30 1234567",
  message: "Hallo",
  extraFields: {},
  status: "new",
  notes: "",
  consent: stamp,
  createdAt: "2026-04-27T10:00:00.000Z",
  updatedAt: "2026-04-27T10:00:00.000Z",
});
assert(
  leadWithConsent.success,
  "Lead MIT consent → Schema akzeptiert",
);

// -----------------------------------------------------------------------
// 5. Alle 25 Demo-Leads haben consent (über die lead()-Factory backfilled)
// -----------------------------------------------------------------------
assert(mockLeads.length > 0, "mockLeads nicht leer");
for (const l of mockLeads) {
  assert(
    typeof l.consent?.givenAt === "string" && l.consent.givenAt.length > 0,
    `Demo-Lead ${l.id}: consent.givenAt gesetzt`,
  );
  assert(
    typeof l.consent?.policyVersion === "string" &&
      l.consent.policyVersion.length > 0,
    `Demo-Lead ${l.id}: consent.policyVersion gesetzt`,
  );
}

console.log(
  `lead-consent smoketest ✅ (${10 + mockLeads.length * 2} Asserts inkl. ${mockLeads.length} Demo-Leads × 2)`,
);
export const __LEAD_CONSENT_SMOKETEST__ = {
  fixedAsserts: 10,
  demoLeadsChecked: mockLeads.length,
};
