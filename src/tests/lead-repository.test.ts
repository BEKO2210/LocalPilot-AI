/**
 * Smoketest für Lead-Repository (Code-Session 40).
 *
 * Drei Pfade:
 *   1. Mock-Repository: in-memory bucket, Roundtrip + Schema-Validierung.
 *   2. buildLeadFromInput: defaults, optional fields, validation errors.
 *   3. Supabase-Error-Mapping: Postgres SQLSTATE → LeadRepositoryError.kind.
 */

import {
  createMockLeadRepository,
  LeadRepositoryError,
  type NewLeadInput,
} from "@/core/database/repositories";
import {
  __TEST_ONLY_buildLeadFromInput__,
  __TEST_ONLY_mapSupabaseError__,
} from "@/core/database/repositories/lead";
import { PRIVACY_POLICY_VERSION } from "@/core/legal";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`lead-repository assertion failed: ${message}`);
}

const VALID_BUSINESS_ID = "11111111-1111-1111-1111-111111111111";
const VALID_CONSENT = {
  givenAt: "2026-04-27T12:00:00.000Z",
  policyVersion: PRIVACY_POLICY_VERSION,
};

const minimalInput: NewLeadInput = {
  businessId: VALID_BUSINESS_ID,
  name: "Anja Beispiel",
  email: "anja@example.com",
  consent: VALID_CONSENT,
};

async function main() {
  // ---------------------------------------------------------------------
  // 1. buildLeadFromInput: Defaults + optionale Felder
  // ---------------------------------------------------------------------
  const minimalLead = __TEST_ONLY_buildLeadFromInput__(minimalInput);
  assert(typeof minimalLead.id === "string" && minimalLead.id.length === 36, "UUID v4 36 Zeichen");
  assert(minimalLead.businessId === VALID_BUSINESS_ID, "businessId durchgereicht");
  assert(minimalLead.source === "website_form", "Default source = website_form");
  assert(minimalLead.message === "", "Default message = ''");
  assert(minimalLead.status === "new", "Default status = new");
  assert(minimalLead.notes === "", "Default notes = ''");
  assert(minimalLead.consent.policyVersion === PRIVACY_POLICY_VERSION, "Consent durchgereicht");
  assert(minimalLead.email === "anja@example.com", "email durchgereicht");
  assert(minimalLead.phone === undefined, "phone NICHT gesetzt → undefined");
  assert(typeof minimalLead.createdAt === "string", "createdAt ISO-String");
  assert(minimalLead.createdAt === minimalLead.updatedAt, "create-time: createdAt = updatedAt");

  const fullInput: NewLeadInput = {
    businessId: VALID_BUSINESS_ID,
    source: "phone",
    name: "Bert Beispiel",
    phone: "+49 1234 5678",
    email: "bert@example.com",
    message: "Bitte um Rückruf",
    requestedServiceId: "22222222-2222-2222-2222-222222222222",
    preferredDate: "2026-05-10",
    preferredTime: "10:00",
    extraFields: { fahrzeug: "VW Golf", baujahr: 2020 },
    consent: VALID_CONSENT,
  };
  const fullLead = __TEST_ONLY_buildLeadFromInput__(fullInput);
  assert(fullLead.source === "phone", "source-Override durchgereicht");
  assert(fullLead.message === "Bitte um Rückruf", "message durchgereicht");
  assert(fullLead.preferredDate === "2026-05-10", "preferredDate durchgereicht");
  assert(fullLead.extraFields.fahrzeug === "VW Golf", "extraFields durchgereicht");
  assert(fullLead.extraFields.baujahr === 2020, "extraFields-numbers durchgereicht");

  // Validation-Fehler: weder phone noch email
  let caught: unknown = null;
  try {
    __TEST_ONLY_buildLeadFromInput__({
      businessId: VALID_BUSINESS_ID,
      name: "Carmen",
      consent: VALID_CONSENT,
    } as NewLeadInput);
  } catch (err) {
    caught = err;
  }
  assert(caught instanceof LeadRepositoryError, "validation-Error wird geworfen");
  assert(
    (caught as LeadRepositoryError).kind === "validation",
    "kind = validation",
  );

  // Validation-Fehler: zu kurzer Name
  let caughtShortName: unknown = null;
  try {
    __TEST_ONLY_buildLeadFromInput__({
      businessId: VALID_BUSINESS_ID,
      name: "X",
      email: "x@example.com",
      consent: VALID_CONSENT,
    });
  } catch (err) {
    caughtShortName = err;
  }
  assert(
    caughtShortName instanceof LeadRepositoryError,
    "kurzer Name → validation-Error",
  );

  // ---------------------------------------------------------------------
  // 2. Mock-Repository: in-memory roundtrip
  // ---------------------------------------------------------------------
  const mock = createMockLeadRepository();
  assert(mock.source === "mock", "Mock-Repo source-Tag");

  const a = await mock.create(minimalInput);
  const b = await mock.create({ ...minimalInput, name: "Bert", phone: "+49 1234 9999" });
  assert(a.id !== b.id, "verschiedene IDs für verschiedene Leads");
  assert(a.businessId === b.businessId, "selber Business");

  // Mock-Validation-Pfad: Fehler propagiert wie buildLeadFromInput
  let mockErr: unknown = null;
  try {
    await mock.create({
      businessId: VALID_BUSINESS_ID,
      name: "Anja",
      consent: VALID_CONSENT,
      // weder phone noch email
    });
  } catch (err) {
    mockErr = err;
  }
  assert(
    mockErr instanceof LeadRepositoryError && (mockErr as LeadRepositoryError).kind === "validation",
    "Mock.create wirft validation-Error sauber durch",
  );

  // ---------------------------------------------------------------------
  // 3. Supabase-Error-Mapping: SQLSTATE → kind
  // ---------------------------------------------------------------------
  const rls = __TEST_ONLY_mapSupabaseError__({ code: "42501", message: "RLS" });
  assert(rls.kind === "rls", "42501 → rls");
  assert(rls.message.toLowerCase().includes("berechtigung"), "RLS-Hinweis verständlich");

  const notNull = __TEST_ONLY_mapSupabaseError__({ code: "23502", message: "x" });
  assert(notNull.kind === "constraint", "23502 → constraint");
  assert(notNull.message.includes("NOT NULL"), "constraint-message nennt NOT NULL");

  const checkV = __TEST_ONLY_mapSupabaseError__({ code: "23514", message: "x" });
  assert(checkV.kind === "constraint", "23514 → constraint");
  assert(checkV.message.toLowerCase().includes("prüfregel"), "constraint-message nennt Prüfregel");

  const fk = __TEST_ONLY_mapSupabaseError__({ code: "23503", message: "x" });
  assert(fk.kind === "constraint", "23503 → constraint (FK)");

  const unique = __TEST_ONLY_mapSupabaseError__({ code: "23505", message: "x" });
  assert(unique.kind === "constraint", "23505 → constraint (UNIQUE)");

  const pgrstRls = __TEST_ONLY_mapSupabaseError__({ code: "PGRST301", message: "no rows" });
  assert(pgrstRls.kind === "rls", "PGRST301 → rls");

  const unknown = __TEST_ONLY_mapSupabaseError__({ code: "42P01", message: "table missing" });
  assert(unknown.kind === "unknown", "unbekannter Code → unknown");
  assert(unknown.message === "table missing", "originale Message bleibt sichtbar");

  // ---------------------------------------------------------------------
  // 4. Privacy-Smoketest: keine Consent-Werte, kein Name leakt im
  //    Error-Cause beim Mapping
  // ---------------------------------------------------------------------
  // (Die Mapper-Funktion bekommt nur das Postgres-Error-Objekt; ein
  // Lead-Input darf da gar nicht reinfließen. Dieser Test ist mehr
  // Regression-Belt als echte Privacy.)
  const dump = JSON.stringify(rls);
  assert(!dump.includes("anja@example.com"), "kein Lead-Email-Leak ins Error-Dump");
  assert(!dump.includes(PRIVACY_POLICY_VERSION), "kein Policy-Version-Leak");

  console.log("lead-repository smoketest ✅ (~30 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __LEAD_REPOSITORY_SMOKETEST__ = { totalAssertions: 30 };
