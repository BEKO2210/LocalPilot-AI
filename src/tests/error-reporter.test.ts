/**
 * Smoketest für Error-Reporter (Code-Session 68).
 *
 * Stub-Sink-basiert. Wir setzen einen Recording-Sink über
 * `__setSinkForTesting`, rufen die Public-API, prüfen die
 * gesammelten Calls.
 */

import {
  __getActiveSinkForTesting,
  __setSinkForTesting,
  captureException,
  captureMessage,
  flushErrorReporter,
  initErrorReporter,
  reportRouteError,
  type ErrorContext,
  type ErrorLevel,
  type ErrorSink,
} from "@/lib/error-reporter";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`error-reporter assertion failed: ${message}`);
}

interface Captured {
  exceptions: Array<{ err: unknown; ctx?: ErrorContext }>;
  messages: Array<{ msg: string; level: ErrorLevel; ctx?: ErrorContext }>;
  flushed: number;
}

function makeRecordingSink(): { sink: ErrorSink; captured: Captured } {
  const captured: Captured = { exceptions: [], messages: [], flushed: 0 };
  const sink: ErrorSink = {
    captureException(err, ctx) {
      captured.exceptions.push(ctx ? { err, ctx } : { err });
    },
    captureMessage(msg, level, ctx) {
      captured.messages.push(ctx ? { msg, level, ctx } : { msg, level });
    },
    flush: async () => {
      captured.flushed++;
      return true;
    },
  };
  return { sink, captured };
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. Default-Sink ist console — Test-Setup setzt einen Recording-Sink
  // ---------------------------------------------------------------------
  const { sink, captured } = makeRecordingSink();
  __setSinkForTesting(sink);
  assert(__getActiveSinkForTesting() === sink, "Test-Sink aktiv");

  // ---------------------------------------------------------------------
  // 2. captureException mit Error-Instanz
  // ---------------------------------------------------------------------
  const err = new Error("boom");
  captureException(err);
  assert(captured.exceptions[0]?.err === err, "Error-Instanz durchgereicht");

  // ---------------------------------------------------------------------
  // 3. captureException mit Context
  // ---------------------------------------------------------------------
  captureException(err, {
    tags: { route: "/api/leads", source: "test" },
    extra: { leadId: "abc" },
    user: { id: "user-1", email: "test@example.com" },
  });
  const second = captured.exceptions[1];
  assert(second !== undefined, "2. Exception gecaptured");
  assert(second?.ctx?.tags?.["route"] === "/api/leads", "tag route");
  assert(second?.ctx?.extra?.["leadId"] === "abc", "extra leadId");
  assert(second?.ctx?.user?.id === "user-1", "user.id");

  // ---------------------------------------------------------------------
  // 4. captureException mit non-Error
  // ---------------------------------------------------------------------
  const beforeStringErr = captured.exceptions.length;
  captureException("string error");
  assert(
    captured.exceptions.length === beforeStringErr + 1,
    "non-Error gecaptured",
  );
  assert(
    captured.exceptions[captured.exceptions.length - 1]?.err === "string error",
    "string-err",
  );

  const beforeObjErr = captured.exceptions.length;
  captureException({ message: "object error" });
  assert(
    captured.exceptions.length === beforeObjErr + 1,
    "object-err",
  );

  // ---------------------------------------------------------------------
  // 5. captureMessage mit allen Levels
  // ---------------------------------------------------------------------
  const beforeMessages = captured.messages.length;
  for (const level of ["info", "warning", "error", "fatal"] as const) {
    captureMessage(`level-${level}`, level);
  }
  assert(
    captured.messages.length === beforeMessages + 4,
    "4 Messages über alle Levels",
  );
  assert(captured.messages[beforeMessages]?.level === "info", "info");
  assert(captured.messages[beforeMessages + 1]?.level === "warning", "warning");
  assert(captured.messages[beforeMessages + 2]?.level === "error", "error");
  assert(captured.messages[beforeMessages + 3]?.level === "fatal", "fatal");

  // captureMessage default-level
  captureMessage("default-level");
  assert(
    captured.messages[captured.messages.length - 1]?.level === "info",
    "Default-Level ist info",
  );

  // ---------------------------------------------------------------------
  // 6. reportRouteError convenience
  // ---------------------------------------------------------------------
  const routeErr = new Error("DB down");
  reportRouteError(routeErr, "/api/businesses/[slug]", { slug: "test" });
  const last = captured.exceptions[captured.exceptions.length - 1];
  assert(last?.err === routeErr, "Route-Error durchgereicht");
  assert(
    last?.ctx?.tags?.["route"] === "/api/businesses/[slug]",
    "Route-Tag gesetzt",
  );
  assert(last?.ctx?.extra?.["slug"] === "test", "Extra-Slug gesetzt");

  // reportRouteError ohne extra
  reportRouteError(new Error("simple"), "/api/leads");
  const simpleEntry = captured.exceptions[captured.exceptions.length - 1];
  assert(simpleEntry?.ctx?.tags?.["route"] === "/api/leads", "Route-Tag ohne extra");

  // ---------------------------------------------------------------------
  // 7. Flush — Recording-Sink hat eine flush-Implementation
  // ---------------------------------------------------------------------
  const flushed = await flushErrorReporter(1000);
  assert(flushed === true, "flush ok");
  assert(captured.flushed === 1, "flush wurde aufgerufen");

  // ---------------------------------------------------------------------
  // 8. Sink ohne flush → flushErrorReporter liefert true (no-op)
  // ---------------------------------------------------------------------
  const sinkNoFlush: ErrorSink = {
    captureException: () => {},
    captureMessage: () => {},
  };
  __setSinkForTesting(sinkNoFlush);
  const noFlush = await flushErrorReporter(500);
  assert(noFlush === true, "Sink ohne flush → true");

  // ---------------------------------------------------------------------
  // 9. initErrorReporter ohne DSN → console-Sink bleibt
  // ---------------------------------------------------------------------
  // Wir resetten auf null und prüfen, dass init() ohne DSN
  // den Sink NICHT durch Sentry ersetzt.
  __setSinkForTesting(null);
  delete process.env["SENTRY_DSN"];
  delete process.env["NEXT_PUBLIC_SENTRY_DSN"];
  await initErrorReporter();
  const sinkAfter = __getActiveSinkForTesting();
  // Default-Sink (console) hat KEINE flush-Methode
  assert(typeof sinkAfter.flush === "undefined", "ohne DSN → console-Sink");

  // ---------------------------------------------------------------------
  // 10. initErrorReporter mit DSN aber ohne installiertes Paket →
  //     fallback auf console-Sink (kein Throw)
  // ---------------------------------------------------------------------
  __setSinkForTesting(null);
  process.env["SENTRY_DSN"] = "https://abc@sentry.io/123";
  await initErrorReporter();
  // @sentry/nextjs ist NICHT installiert → Adapter fängt
  // den Module-Not-Found ab und bleibt bei console.
  // Der Sink hat in beiden Fällen funktionierende
  // captureException-Methoden — ein direkter
  // Identitäts-Check zum Default-Sink ist nicht möglich,
  // weil wir den Default nicht exportieren. Wir prüfen
  // stattdessen, dass der Sink **kein flush** hat.
  const sinkDsnNoPackage = __getActiveSinkForTesting();
  assert(
    typeof sinkDsnNoPackage.flush === "undefined",
    "DSN ohne Paket → fallback auf console (kein flush)",
  );
  delete process.env["SENTRY_DSN"];

  // ---------------------------------------------------------------------
  // 11. initErrorReporter ist idempotent
  // ---------------------------------------------------------------------
  __setSinkForTesting(null);
  const p1 = initErrorReporter();
  const p2 = initErrorReporter();
  assert(p1 === p2, "init liefert dieselbe Promise (idempotent)");
  await p1;

  // Nach Test-Sink-Reset darf erneuter Init durchlaufen
  __setSinkForTesting(null);
  await initErrorReporter();

  // ---------------------------------------------------------------------
  // 12. Console-Sink: Smoke (kein crash)
  // ---------------------------------------------------------------------
  // Wir benutzen den Default-Sink direkt — kein Recording, nur
  // sicherstellen, dass die Aufrufe nicht throwen.
  __setSinkForTesting(null);
  let threw = false;
  try {
    captureException(new Error("smoke"));
    captureException("smoke-string");
    captureException({ shape: "object" });
    captureMessage("smoke-msg", "info");
    captureMessage("smoke-msg-warn", "warning", { tags: { x: "y" } });
    reportRouteError(new Error("smoke-route"), "/api/x");
  } catch {
    threw = true;
  }
  assert(!threw, "Console-Sink throwt nicht");

  // Cleanup
  __setSinkForTesting(null);

  console.log("error-reporter smoketest ✅ (~30 Asserts)");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const __ERROR_REPORTER_SMOKETEST__ = { totalAssertions: 30 };
