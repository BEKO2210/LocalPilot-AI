"use client";

/**
 * Globale Error-Boundary (Code-Session 68).
 *
 * Next.js App-Router-Konvention: `app/global-error.tsx`
 * fängt Render-Fehler aus dem RootLayout ab. Hier ist der
 * einzige Ort, an dem wir den Fehler an unseren
 * `error-reporter` schicken — Sentry oder console.
 *
 * Das Markup bleibt **bewusst minimal**: ein Fehler im
 * RootLayout heißt, dass Tailwind / Theme / Layout-State
 * potenziell kaputt sind. Inline-Styles + Plain-HTML als
 * Letztanker.
 */

import { useEffect } from "react";
import {
  captureException,
  initErrorReporter,
} from "@/lib/error-reporter";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void initErrorReporter().then(() => {
      captureException(error, {
        tags: {
          source: "global-error-boundary",
          ...(error.digest ? { digest: error.digest } : {}),
        },
      });
    });
  }, [error]);

  return (
    <html lang="de">
      <body
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafaf9",
          color: "#1c1917",
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            padding: "32px",
            margin: "16px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e7e5e4",
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#dc2626",
              margin: "0 0 8px 0",
            }}
          >
            Unerwarteter Fehler
          </p>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 600,
              margin: "0 0 12px 0",
              color: "#1c1917",
            }}
          >
            Da ist etwas schiefgegangen.
          </h1>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.5,
              margin: "0 0 20px 0",
              color: "#57534e",
            }}
          >
            Die Seite konnte nicht angezeigt werden. Wir haben den
            Fehler protokolliert. Bitte versuchen Sie es erneut —
            falls das Problem bleibt, hilft ein Browser-Reload.
          </p>
          {error.digest ? (
            <p
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#a8a29e",
                margin: "0 0 16px 0",
              }}
            >
              Fehler-ID: {error.digest}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                appearance: "none",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#1c1917",
                color: "#ffffff",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Erneut versuchen
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- in global-error ist next/link ggf. nicht-funktional */}
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#44403c",
                backgroundColor: "#ffffff",
                border: "1px solid #d6d3d1",
                textDecoration: "none",
              }}
            >
              Zur Startseite
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
