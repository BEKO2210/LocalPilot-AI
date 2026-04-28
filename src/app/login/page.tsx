import Link from "next/link";
import { LoginForm } from "./login-form";
import { LoginErrorBanner } from "./error-banner";

/**
 * Login-Page (Code-Session 43).
 *
 * Server Component, **statisch prerenderable**. Die eigentliche
 * Magic-Link-Submission läuft im Client Component `<LoginForm>`.
 * Error-Param-Lesen aus `?error=...` läuft auch client-seitig
 * (`<LoginErrorBanner>`), damit kein `await searchParams` den
 * Static-Export bricht.
 */

export const metadata = {
  title: "Login – LocalPilot AI",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main id="main-content" className="lp-container max-w-md py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
        Anmelden
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        Wir schicken dir einen einmal nutzbaren Login-Link per E-Mail.
        Kein Passwort nötig.
      </p>

      <LoginErrorBanner />

      <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
        <LoginForm redirectTo="/account" />
      </div>

      <div className="mt-8 space-y-2 text-sm text-ink-600">
        <p>
          Nur in einer Vorschau ohne Backend?{" "}
          <Link
            href="/demo"
            className="font-medium underline underline-offset-2"
          >
            → Zur Demo
          </Link>
        </p>
        <p>
          <Link
            href="/datenschutz"
            className="underline underline-offset-2 hover:text-ink-800"
          >
            Datenschutz
          </Link>
          {" · "}
          <Link
            href="/impressum"
            className="underline underline-offset-2 hover:text-ink-800"
          >
            Impressum
          </Link>
        </p>
      </div>
    </main>
  );
}
