/**
 * Onboarding-Repository (Code-Session 45).
 *
 * Verkapselt den Henne-Ei-Pfad: ein neuer Betrieb hat noch keinen
 * Owner, also keinen Insert-Berechtigten unter den
 * Owner-RLS-Policies aus Migration 0007. Wir lösen das mit dem
 * Service-Role-Client (bypasst RLS) und legen Betrieb +
 * Owner-Eintrag in einer Sequenz an.
 *
 * **Atomarität**: Postgres macht hier keinen Multi-Tabellen-
 * Transaktions-Wrapper für uns aus dem JS-SDK. Wir gehen in zwei
 * Schritten vor und kompensieren manuell, wenn der zweite Schritt
 * fehlschlägt: dann den `businesses`-Insert wieder löschen, damit
 * keine waisen-Betriebe ohne Owner zurückbleiben.
 *
 * Nur über `createBusinessForUser` ansprechen — Direkt-Calls auf
 * den Service-Role-Client sollten in der App nicht passieren.
 */

import "server-only";

import { getServiceRoleClient } from "@/core/database/supabase-service";
import type { OnboardingValidInput } from "@/lib/onboarding-validate";

export type OnboardingErrorKind =
  | "not_configured"
  | "slug_taken"
  | "constraint"
  | "unknown";

export class OnboardingError extends Error {
  constructor(
    public readonly kind: OnboardingErrorKind,
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "OnboardingError";
  }
}

export interface OnboardingResult {
  readonly businessId: string;
  readonly slug: string;
}

/**
 * Legt einen neuen Betrieb für den gegebenen User an. Verlangt:
 *   - `SUPABASE_SERVICE_ROLE_KEY` ist konfiguriert.
 *   - `userId` ist eine echte `auth.users.id` (Caller verifiziert
 *     das über `getCurrentUser()`).
 *   - `input` wurde via `validateOnboarding(...)` geprüft.
 */
export async function createBusinessForUser(
  userId: string,
  input: OnboardingValidInput,
): Promise<OnboardingResult> {
  const client = getServiceRoleClient();
  if (!client) {
    throw new OnboardingError(
      "not_configured",
      "Service-Role-Client ist nicht verfügbar (SUPABASE_SERVICE_ROLE_KEY fehlt).",
    );
  }

  // Schritt 1: businesses-Zeile anlegen.
  const minimalAddress = {
    street: "(noch nicht gesetzt)",
    city: "(noch nicht gesetzt)",
    postalCode: "00000",
    country: "DE",
  };
  const { data: businessRow, error: businessErr } = await client
    .from("businesses")
    .insert({
      slug: input.slug,
      name: input.name,
      industry_key: input.industryKey,
      package_tier: input.packageTier,
      locale: "de",
      tagline: input.tagline,
      description: input.description,
      theme_key: input.themeKey,
      address: minimalAddress,
      contact: {},
      opening_hours: [],
      is_published: false,
    })
    .select("id, slug")
    .single<{ id: string; slug: string }>();

  if (businessErr || !businessRow) {
    if (businessErr?.code === "23505") {
      throw new OnboardingError(
        "slug_taken",
        "Slug ist bereits vergeben. Bitte einen anderen wählen.",
        businessErr,
      );
    }
    if (businessErr?.code?.startsWith("23")) {
      throw new OnboardingError(
        "constraint",
        businessErr.message ?? "Datensatz verletzt eine Prüfregel.",
        businessErr,
      );
    }
    throw new OnboardingError(
      "unknown",
      businessErr?.message ?? "Konnte den Betrieb nicht anlegen.",
      businessErr,
    );
  }

  // Schritt 2: business_owners-Eintrag.
  const { error: ownerErr } = await client.from("business_owners").insert({
    business_id: businessRow.id,
    user_id: userId,
    role: "owner",
  });

  if (ownerErr) {
    // Kompensation: businesses-Zeile wieder löschen, damit kein
    // Waise-Betrieb ohne Owner übrig bleibt. Best-effort —
    // schlägt das auch fehl, ist's nur ein dangling business
    // (manuell aufzuräumen, aber nicht kritisch).
    await client.from("businesses").delete().eq("id", businessRow.id);
    throw new OnboardingError(
      "unknown",
      ownerErr.message ?? "Konnte den Owner-Eintrag nicht anlegen.",
      ownerErr,
    );
  }

  return { businessId: businessRow.id, slug: businessRow.slug };
}
