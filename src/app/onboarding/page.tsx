import Link from "next/link";
import { OnboardingForm } from "./onboarding-form";

/**
 * Onboarding-Seite (Code-Session 45).
 *
 * Server Component, statisch prerenderable. Auth-Check und
 * Service-Role-Check passieren server-seitig in der API-Route
 * (`/api/onboarding`). Hier rendern wir nur den Form-Wrapper.
 *
 * Static-Pages-Vorschau: Form ist sichtbar, aber `POST /api/onboarding`
 * ist 404 → Form zeigt einen freundlichen „Demo-Mode"-Hinweis.
 */

export const metadata = {
  title: "Betrieb anlegen – LocalPilot AI",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return (
    <main id="main-content" className="lp-container max-w-2xl py-12">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
        Schnellstart
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">
        Lege deinen Betrieb an
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        In unter zwei Minuten bist du eingerichtet. Adresse, Kontakt,
        Logo und Leistungen kannst du danach in Ruhe ergänzen.
      </p>

      <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <OnboardingForm />
      </div>

      <div className="mt-6 space-y-2 text-sm text-ink-600">
        <p>
          Schon einen Account?{" "}
          <Link
            href="/account"
            className="font-medium underline underline-offset-2"
          >
            → Zu deinem Account
          </Link>
        </p>
        <p>
          Noch nicht eingeloggt?{" "}
          <Link
            href="/login"
            className="font-medium underline underline-offset-2"
          >
            → Login öffnen
          </Link>
        </p>
      </div>
    </main>
  );
}
