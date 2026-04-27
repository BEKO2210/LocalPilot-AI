"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Liest den `?error=...`-Param aus der URL und zeigt eine
 * passende Meldung. Client-only, damit `/login` static-export-
 * kompatibel bleibt (kein `await searchParams` im Server Component).
 *
 * Wird in `<Suspense>` gewickelt, weil `useSearchParams` sonst die
 * komplette Seite an client-side bouncen lassen würde.
 */
export function LoginErrorBanner() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  const message =
    error === "missing_code"
      ? "Der Login-Link ist unvollständig. Bitte fordere einen neuen an."
      : error === "auth_not_configured"
        ? "Auth-Backend ist gerade nicht aktiv (Demo-Mode)."
        : `Login fehlgeschlagen: ${decodeURIComponent(error)}`;
  return (
    <div
      role="alert"
      className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
    >
      {message}
    </div>
  );
}
