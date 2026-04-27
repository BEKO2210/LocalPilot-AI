/**
 * Smoketest für Business-Delete-Submit-Helper (Code-Session 69).
 */

import {
  submitBusinessDelete,
  userMessageForResult,
} from "@/lib/business-delete";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`business-delete assertion failed: ${message}`);
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. 200-Server: filesRemoved + filesFailed
  // ---------------------------------------------------------------------
  let capturedUrl = "";
  let capturedMethod = "";
  const fetch200: typeof fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedMethod = init?.method ?? "";
    return new Response(
      JSON.stringify({ ok: true, slug: "test", filesRemoved: 5, filesFailed: 0 }),
      { status: 200 },
    );
  };
  const r200 = await submitBusinessDelete("test", { fetchImpl: fetch200 });
  assert(r200.kind === "server", "200 → server");
  if (r200.kind === "server") {
    assert(r200.slug === "test", "slug durchgereicht");
    assert(r200.filesRemoved === 5, "filesRemoved");
    assert(r200.filesFailed === 0, "filesFailed");
  }
  assert(capturedUrl === "/api/businesses/test", "URL korrekt");
  assert(capturedMethod === "DELETE", "Method=DELETE");

  // ---------------------------------------------------------------------
  // 2. URL-Encoding
  // ---------------------------------------------------------------------
  let urlForSpecial = "";
  const fetchUrl: typeof fetch = async (input) => {
    urlForSpecial = String(input);
    return new Response(JSON.stringify({ ok: true, slug: "x" }), { status: 200 });
  };
  await submitBusinessDelete("studio haarlinie", { fetchImpl: fetchUrl });
  assert(
    urlForSpecial === "/api/businesses/studio%20haarlinie",
    `URL-Encoding (war: ${urlForSpecial})`,
  );

  // ---------------------------------------------------------------------
  // 3. 401 → not-authed
  // ---------------------------------------------------------------------
  const fetch401: typeof fetch = async () =>
    new Response(JSON.stringify({ message: "Login fehlt" }), { status: 401 });
  const r401 = await submitBusinessDelete("x", { fetchImpl: fetch401 });
  assert(r401.kind === "not-authed", "401 → not-authed");
  if (r401.kind === "not-authed") {
    assert(r401.message === "Login fehlt", "Server-Message durchgereicht");
  }

  // 401 ohne Body → Default-Message
  const fetch401Empty: typeof fetch = async () => new Response("", { status: 401 });
  const r401Empty = await submitBusinessDelete("x", { fetchImpl: fetch401Empty });
  assert(r401Empty.kind === "not-authed", "401 ohne Body");
  if (r401Empty.kind === "not-authed") {
    assert(r401Empty.message.length > 0, "Default-Message");
  }

  // ---------------------------------------------------------------------
  // 4. 403 → forbidden
  // ---------------------------------------------------------------------
  const fetch403: typeof fetch = async () =>
    new Response(JSON.stringify({ message: "kein Zugriff" }), { status: 403 });
  const r403 = await submitBusinessDelete("x", { fetchImpl: fetch403 });
  assert(r403.kind === "forbidden", "403 → forbidden");
  if (r403.kind === "forbidden") {
    assert(r403.message === "kein Zugriff", "Forbidden-Message");
  }

  // ---------------------------------------------------------------------
  // 5. 5xx → fail
  // ---------------------------------------------------------------------
  const fetch500: typeof fetch = async () =>
    new Response(JSON.stringify({ message: "DB down" }), { status: 500 });
  const r500 = await submitBusinessDelete("x", { fetchImpl: fetch500 });
  assert(r500.kind === "fail", "500 → fail");
  if (r500.kind === "fail") {
    assert(r500.status === 500, "Status durchgereicht");
    assert(r500.reason === "DB down", "Reason");
  }

  // ---------------------------------------------------------------------
  // 6. Throw → fail mit Status 0
  // ---------------------------------------------------------------------
  const fetchThrows: typeof fetch = async () => {
    throw new Error("Netzwerk weg");
  };
  const rThrow = await submitBusinessDelete("x", { fetchImpl: fetchThrows });
  assert(rThrow.kind === "fail", "throw → fail");
  if (rThrow.kind === "fail") {
    assert(rThrow.status === 0, "Status=0 bei throw");
    assert(rThrow.reason === "Netzwerk weg", "Throw-Message");
  }

  // ---------------------------------------------------------------------
  // 7. userMessageForResult
  // ---------------------------------------------------------------------
  const okMsg = userMessageForResult({
    kind: "server",
    slug: "x",
    filesRemoved: 5,
    filesFailed: 0,
  });
  assert(
    okMsg !== null && okMsg.includes("5 Dateien"),
    "server-msg nennt Counts",
  );

  const partialMsg = userMessageForResult({
    kind: "server",
    slug: "x",
    filesRemoved: 3,
    filesFailed: 2,
  });
  assert(
    partialMsg !== null && partialMsg.includes("nicht aufgeräumt"),
    "Partial-Failure-Message",
  );

  const failMsg = userMessageForResult({
    kind: "fail",
    status: 500,
    reason: "boom",
  });
  assert(
    failMsg !== null && failMsg.includes("500") && failMsg.includes("boom"),
    "fail-Message",
  );

  // ---------------------------------------------------------------------
  // 8. Credentials = same-origin
  // ---------------------------------------------------------------------
  let capturedInit: RequestInit | undefined;
  const credFetch: typeof fetch = async (_input, init) => {
    capturedInit = init;
    return new Response(JSON.stringify({ ok: true, slug: "x" }), { status: 200 });
  };
  await submitBusinessDelete("x", { fetchImpl: credFetch });
  assert(
    capturedInit?.credentials === "same-origin",
    "credentials=same-origin",
  );

  console.log("business-delete smoketest ✅ (~25 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __BUSINESS_DELETE_SMOKETEST__ = { totalAssertions: 25 };
