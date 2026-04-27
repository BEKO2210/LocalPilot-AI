/**
 * Smoketest für AI-Client-Helper (Code-Session 61).
 *
 * Stub-fetch-basiert. Prüft alle Result-Kinds + Header-/Body-
 * Forwarding.
 */

import {
  callAIGenerate,
  userMessageForResult,
  AI_TOKEN_STORAGE_KEY,
  type AIGenerateResult,
} from "@/lib/ai-client";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`ai-client assertion failed: ${message}`);
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. Storage-Key-Konsistenz mit AIPlayground (Session 28)
  // ---------------------------------------------------------------------
  assert(
    AI_TOKEN_STORAGE_KEY === "lp:ai-api-token:v1",
    "Storage-Key matched AIPlayground",
  );

  // ---------------------------------------------------------------------
  // 2. 200-Server-Path: output + cost
  // ---------------------------------------------------------------------
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedHeaders: Record<string, string> = {};
  let capturedBody: unknown = null;
  const fetch200: typeof fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedMethod = init?.method ?? "";
    capturedHeaders = (init?.headers as Record<string, string>) ?? {};
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
    return new Response(
      JSON.stringify({
        output: { variants: [{ channel: "whatsapp", body: "hi" }] },
        cost: { usd: 0.001 },
      }),
      { status: 200 },
    );
  };
  const r200 = await callAIGenerate(
    {
      method: "generateReviewRequest",
      providerKey: "openai",
      input: { context: { businessName: "Test" }, channel: "whatsapp", tone: "friendly" },
      apiToken: "secret-token",
    },
    { fetchImpl: fetch200 },
  );
  assert(r200.kind === "server", "200 → server");
  if (r200.kind === "server") {
    assert(r200.output !== undefined, "output durchgereicht");
    assert(r200.cost !== undefined, "cost durchgereicht");
  }
  assert(capturedUrl === "/api/ai/generate", "URL korrekt");
  assert(capturedMethod === "POST", "Method POST");
  assert(
    capturedHeaders["content-type"] === "application/json",
    "Content-Type gesetzt",
  );
  assert(
    capturedHeaders.authorization === "Bearer secret-token",
    "Bearer-Header korrekt",
  );
  const sent = capturedBody as {
    method: string;
    providerKey: string;
    input: unknown;
  };
  assert(sent.method === "generateReviewRequest", "Method-Name im Body");
  assert(sent.providerKey === "openai", "ProviderKey im Body");
  assert(sent.input !== undefined, "Input im Body");

  // ---------------------------------------------------------------------
  // 3. Kein Token → kein Authorization-Header (Cookie-Session-Pfad)
  // ---------------------------------------------------------------------
  let noTokenHeaders: Record<string, string> = {};
  const fetchNoToken: typeof fetch = async (_input, init) => {
    noTokenHeaders = (init?.headers as Record<string, string>) ?? {};
    return new Response(
      JSON.stringify({ output: {} }),
      { status: 200 },
    );
  };
  await callAIGenerate(
    {
      method: "generateReviewRequest",
      providerKey: "mock",
      input: {},
    },
    { fetchImpl: fetchNoToken },
  );
  assert(
    !("authorization" in noTokenHeaders),
    "kein Token → kein Authorization-Header",
  );

  // Whitespace-Token wird wie leer behandelt
  let wsHeaders: Record<string, string> = {};
  const fetchWs: typeof fetch = async (_input, init) => {
    wsHeaders = (init?.headers as Record<string, string>) ?? {};
    return new Response(JSON.stringify({}), { status: 200 });
  };
  await callAIGenerate(
    {
      method: "generateReviewRequest",
      providerKey: "openai",
      input: {},
      apiToken: "   ",
    },
    { fetchImpl: fetchWs },
  );
  assert(!("authorization" in wsHeaders), "Whitespace-Token → kein Header");

  // ---------------------------------------------------------------------
  // 4. 404 → static-build
  // ---------------------------------------------------------------------
  const fetch404: typeof fetch = async () => new Response("", { status: 404 });
  const r404 = await callAIGenerate(
    {
      method: "generateReviewRequest",
      providerKey: "openai",
      input: {},
    },
    { fetchImpl: fetch404 },
  );
  assert(r404.kind === "static-build", "404 → static-build");

  // ---------------------------------------------------------------------
  // 5. 401 / 403
  // ---------------------------------------------------------------------
  const fetch401: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "unauth", message: "Login fehlt" }), {
      status: 401,
    });
  const r401 = await callAIGenerate(
    { method: "generateReviewRequest", providerKey: "openai", input: {} },
    { fetchImpl: fetch401 },
  );
  assert(r401.kind === "not-authed", "401 → not-authed");
  if (r401.kind === "not-authed") {
    assert(r401.message === "Login fehlt", "Server-message durchgereicht");
  }

  const fetch401Empty: typeof fetch = async () => new Response("", { status: 401 });
  const r401Empty = await callAIGenerate(
    { method: "generateReviewRequest", providerKey: "openai", input: {} },
    { fetchImpl: fetch401Empty },
  );
  assert(r401Empty.kind === "not-authed", "401 ohne Body → not-authed");
  if (r401Empty.kind === "not-authed") {
    assert(r401Empty.message.length > 0, "Default-Message gesetzt");
  }

  const fetch403: typeof fetch = async () =>
    new Response(JSON.stringify({ message: "kein Zugriff" }), { status: 403 });
  const r403 = await callAIGenerate(
    { method: "generateReviewRequest", providerKey: "openai", input: {} },
    { fetchImpl: fetch403 },
  );
  assert(r403.kind === "forbidden", "403 → forbidden");
  if (r403.kind === "forbidden") {
    assert(r403.message === "kein Zugriff", "Server-message gesetzt");
  }

  // ---------------------------------------------------------------------
  // 6. 429 mit Cost-Body → rate-limit
  // ---------------------------------------------------------------------
  const resetIso = "2026-04-28T00:00:00Z";
  const fetch429: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        error: "rate_limit",
        message: "Tages-Budget erschöpft.",
        cost: { capUsd: 1.0, spentUsd: 1.05, resetAtUtc: resetIso },
      }),
      { status: 429 },
    );
  const r429 = await callAIGenerate(
    { method: "generateReviewRequest", providerKey: "openai", input: {} },
    { fetchImpl: fetch429 },
  );
  assert(r429.kind === "rate-limit", "429 → rate-limit");
  if (r429.kind === "rate-limit") {
    assert(r429.limit.capUsd === 1.0, "capUsd parsed");
    assert(r429.limit.spentUsd === 1.05, "spentUsd parsed");
    assert(r429.limit.resetAtUtc === resetIso, "resetAtUtc parsed");
    assert(r429.limit.message === "Tages-Budget erschöpft.", "message parsed");
  }

  // 429 ohne cost-Body → fail (defensive)
  const fetch429NoCost: typeof fetch = async () =>
    new Response(JSON.stringify({ error: "rate_limit" }), { status: 429 });
  const r429NoCost = await callAIGenerate(
    { method: "generateReviewRequest", providerKey: "openai", input: {} },
    { fetchImpl: fetch429NoCost },
  );
  assert(r429NoCost.kind === "fail", "429 ohne cost → fail");

  // ---------------------------------------------------------------------
  // 7. 5xx → fail
  // ---------------------------------------------------------------------
  const fetch500: typeof fetch = async () =>
    new Response(
      JSON.stringify({ error: "unknown", message: "DB down" }),
      { status: 500 },
    );
  const r500 = await callAIGenerate(
    { method: "generateReviewRequest", providerKey: "openai", input: {} },
    { fetchImpl: fetch500 },
  );
  assert(r500.kind === "fail", "500 → fail");
  if (r500.kind === "fail") {
    assert(r500.status === 500, "Status durchgereicht");
    assert(r500.reason === "DB down", "Body-Message als Reason");
  }

  // ---------------------------------------------------------------------
  // 8. Throw → fail (Status 0)
  // ---------------------------------------------------------------------
  const fetchThrows: typeof fetch = async () => {
    throw new Error("Netzwerk-Abriss");
  };
  const rThrow = await callAIGenerate(
    { method: "generateReviewRequest", providerKey: "openai", input: {} },
    { fetchImpl: fetchThrows },
  );
  assert(rThrow.kind === "fail", "throw → fail");
  if (rThrow.kind === "fail") {
    assert(rThrow.status === 0, "throw → status 0");
    assert(rThrow.reason === "Netzwerk-Abriss", "Throw-Message als Reason");
  }

  // ---------------------------------------------------------------------
  // 9. userMessageForResult: alle Kinds
  // ---------------------------------------------------------------------
  assert(
    userMessageForResult({ kind: "server", output: {} }) === null,
    "server → null (UI rendert Output)",
  );
  assert(
    userMessageForResult({
      kind: "not-authed",
      message: "test",
    }) === "test",
    "not-authed → message",
  );
  assert(
    userMessageForResult({ kind: "forbidden", message: "x" }) === "x",
    "forbidden → message",
  );
  assert(
    userMessageForResult({
      kind: "static-build",
    })?.includes("Mock") === true,
    "static-build → Hinweis erwähnt Mock",
  );
  const rateMsg = userMessageForResult({
    kind: "rate-limit",
    limit: {
      capUsd: 1.0,
      spentUsd: 0.5,
      resetAtUtc: resetIso,
      message: "Budget alle.",
    },
  });
  assert(
    rateMsg !== null && rateMsg.includes("0.50") && rateMsg.includes("1.00"),
    "rate-limit → enthält Counts",
  );
  const failMsg = userMessageForResult({
    kind: "fail",
    status: 500,
    reason: "boom",
  });
  assert(
    failMsg !== null && failMsg.includes("500") && failMsg.includes("boom"),
    "fail → Status + Reason",
  );

  console.log("ai-client smoketest ✅ (~38 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __AI_CLIENT_SMOKETEST__ = { totalAssertions: 38 };
export type __FORCE_USE = AIGenerateResult; // eslint-import-warmup
