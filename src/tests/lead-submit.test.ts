/**
 * Smoketest für submitLead-Helper (Code-Session 44).
 *
 * Pure-Function-Test: kein Browser, kein Next.js-Runtime. Wir
 * injizieren `fetchImpl` und `appendLocal`, prüfen alle 4
 * SubmitResult-Pfade plus die Hinweis-Texte.
 */

import {
  submitLead,
  userHintForResult,
  type ServerSubmitInput,
  type SubmitResult,
} from "@/lib/lead-submit";
import type { Lead } from "@/types/lead";
import { LeadSchema } from "@/core/validation/lead.schema";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`lead-submit assertion failed: ${message}`);
}

const FAKE_LEAD = LeadSchema.parse({
  id: "lead-demo-12345678",
  businessId: "11111111-1111-1111-1111-111111111111",
  source: "website_form",
  name: "Anja Beispiel",
  email: "anja@example.com",
  message: "Bitte um Termin",
  extraFields: {},
  status: "new",
  notes: "",
  consent: { givenAt: "2026-04-27T12:00:00.000Z", policyVersion: "v1-2026-04" },
  createdAt: "2026-04-27T12:00:00.000Z",
  updatedAt: "2026-04-27T12:00:00.000Z",
}) as Lead;

const FAKE_SERVER_INPUT: ServerSubmitInput = {
  businessId: FAKE_LEAD.businessId,
  name: FAKE_LEAD.name,
  email: FAKE_LEAD.email,
  message: FAKE_LEAD.message,
  consent: FAKE_LEAD.consent,
};

async function main() {
  // ---------------------------------------------------------------------
  // 1. server: 201 → kind=server, localBackup=true
  // ---------------------------------------------------------------------
  let appended: Lead | null = null;
  const append1: (l: Lead) => boolean = (l) => {
    appended = l;
    return true;
  };
  const fetch201: typeof fetch = async () =>
    new Response(
      JSON.stringify({ ok: true, leadId: "srv-uuid-abc", source: "supabase" }),
      { status: 201, headers: { "content-type": "application/json" } },
    );
  const r1 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: append1,
    fetchImpl: fetch201,
  });
  assert(r1.kind === "server", "201 → server-result");
  assert(
    (r1 as Extract<SubmitResult, { kind: "server" }>).serverLeadId ===
      "srv-uuid-abc",
    "Server-ID kommt durch",
  );
  assert(
    (r1 as Extract<SubmitResult, { kind: "server" }>).localBackup === true,
    "localBackup=true",
  );
  assert(appended !== null, "appendLocal wurde aufgerufen");
  assert(userHintForResult(r1) === null, "server → kein User-Hinweis");

  // ---------------------------------------------------------------------
  // 2. server 200 ok ohne Body → kind=server, leadId=unbekannt
  // ---------------------------------------------------------------------
  const fetch200NoBody: typeof fetch = async () =>
    new Response("not-json", { status: 200 });
  const r2 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => true,
    fetchImpl: fetch200NoBody,
  });
  assert(r2.kind === "server", "200 ok ohne JSON → server-result");
  assert(
    (r2 as Extract<SubmitResult, { kind: "server" }>).serverLeadId ===
      "(unbekannt)",
    "Server-ID Fallback bei nicht-JSON",
  );

  // ---------------------------------------------------------------------
  // 3. server 404 (Static-Build) → kind=local-only, kein Hinweis
  // ---------------------------------------------------------------------
  const fetch404: typeof fetch = async () => new Response("", { status: 404 });
  const r3 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => true,
    fetchImpl: fetch404,
  });
  assert(r3.kind === "local-only", "404 → local-only");
  assert(
    (r3 as Extract<SubmitResult, { kind: "local-only" }>).reason
      .toLowerCase()
      .includes("static"),
    "Reason nennt static-build",
  );
  assert(userHintForResult(r3) === null, "local-only → kein Hinweis (silent)");

  // ---------------------------------------------------------------------
  // 4. server 5xx → kind=local-fallback (mit Hinweis)
  // ---------------------------------------------------------------------
  const fetch500: typeof fetch = async () =>
    new Response(
      JSON.stringify({ error: "unknown", message: "Datenbank-Fehler" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  const r4 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => true,
    fetchImpl: fetch500,
  });
  assert(r4.kind === "local-fallback", "500 → local-fallback");
  assert(
    (r4 as Extract<SubmitResult, { kind: "local-fallback" }>)
      .serverStatus === 500,
    "serverStatus durchgereicht",
  );
  assert(
    (r4 as Extract<SubmitResult, { kind: "local-fallback" }>)
      .reason === "Datenbank-Fehler",
    "Body-Message wird Reason",
  );
  const hint4 = userHintForResult(r4);
  assert(
    typeof hint4 === "string" && hint4.includes("gespeichert"),
    "local-fallback Hinweis nennt 'gespeichert'",
  );

  // ---------------------------------------------------------------------
  // 5. server 403 (RLS) → kind=local-fallback mit klarer Meldung
  // ---------------------------------------------------------------------
  const fetch403: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        error: "rls",
        message: "Berechtigung fehlt — Betrieb nicht published.",
      }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  const r5 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => true,
    fetchImpl: fetch403,
  });
  assert(r5.kind === "local-fallback", "403 → local-fallback");
  assert(
    (r5 as Extract<SubmitResult, { kind: "local-fallback" }>)
      .reason.toLowerCase()
      .includes("berechtigung"),
    "RLS-Meldung kommt durch",
  );

  // ---------------------------------------------------------------------
  // 6. fetch wirft (offline) → kind=local-fallback mit Error-Message
  // ---------------------------------------------------------------------
  const fetchThrows: typeof fetch = async () => {
    throw new Error("Failed to fetch");
  };
  const r6 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => true,
    fetchImpl: fetchThrows,
  });
  assert(r6.kind === "local-fallback", "throw → local-fallback");
  assert(
    (r6 as Extract<SubmitResult, { kind: "local-fallback" }>).reason ===
      "Failed to fetch",
    "Reason = Error-Message",
  );

  // ---------------------------------------------------------------------
  // 7. server 5xx UND localStorage versagt → kind=fail
  // ---------------------------------------------------------------------
  const r7 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => false,
    fetchImpl: fetch500,
  });
  assert(r7.kind === "fail", "server-5xx + local-fail → kind=fail");
  const hint7 = userHintForResult(r7);
  assert(
    typeof hint7 === "string" && hint7.toLowerCase().includes("nicht möglich"),
    "fail-Hinweis nennt Misserfolg",
  );

  // ---------------------------------------------------------------------
  // 8. skipServer=true mit funktionierendem localStorage → local-only
  // ---------------------------------------------------------------------
  let fetched = false;
  const fetchSentinel: typeof fetch = async () => {
    fetched = true;
    return new Response("", { status: 200 });
  };
  const r8 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => true,
    fetchImpl: fetchSentinel,
    skipServer: true,
  });
  assert(r8.kind === "local-only", "skipServer → local-only");
  assert(!fetched, "fetch wurde NICHT aufgerufen bei skipServer");

  // ---------------------------------------------------------------------
  // 9. skipServer=true UND local versagt → kind=fail
  // ---------------------------------------------------------------------
  const r9 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => false,
    skipServer: true,
  });
  assert(r9.kind === "fail", "skipServer + local-fail → fail");

  // ---------------------------------------------------------------------
  // 10. server 201 + local versagt → kind=server, localBackup=false
  // ---------------------------------------------------------------------
  const r10 = await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => false,
    fetchImpl: fetch201,
  });
  assert(r10.kind === "server", "server-OK trotz local-fail bleibt server");
  assert(
    (r10 as Extract<SubmitResult, { kind: "server" }>).localBackup === false,
    "localBackup=false sichtbar",
  );

  // ---------------------------------------------------------------------
  // 11. fetch-Body wird tatsächlich der gesendete ServerSubmitInput
  // ---------------------------------------------------------------------
  let capturedBody: unknown = null;
  const captureFetch: typeof fetch = async (_input, init) => {
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
    return new Response(JSON.stringify({ ok: true, leadId: "id-x" }), {
      status: 201,
    });
  };
  await submitLead(FAKE_SERVER_INPUT, FAKE_LEAD, {
    appendLocal: () => true,
    fetchImpl: captureFetch,
  });
  assert(
    typeof capturedBody === "object" && capturedBody !== null,
    "Body wird gesendet",
  );
  const sent = capturedBody as ServerSubmitInput;
  assert(sent.businessId === FAKE_SERVER_INPUT.businessId, "businessId im Body");
  assert(sent.name === FAKE_SERVER_INPUT.name, "name im Body");
  assert(
    sent.consent.policyVersion === FAKE_SERVER_INPUT.consent.policyVersion,
    "consent.policyVersion im Body",
  );
  assert(
    sent.consent.givenAt === FAKE_SERVER_INPUT.consent.givenAt,
    "consent.givenAt im Body",
  );

  console.log("lead-submit smoketest ✅ (~30 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __LEAD_SUBMIT_SMOKETEST__ = { totalAssertions: 30 };
