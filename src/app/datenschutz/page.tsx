import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  LEAD_RETENTION_MONTHS,
  PLATFORM_NAME,
  PRIVACY_POLICY_VERSION,
  getOwnerInfo,
} from "@/core/legal";

/**
 * Plattform-Datenschutzerklärung für LocalPilot AI selbst
 * (Code-Session 36).
 *
 * Demo-Betriebe haben unter `/site/<slug>/datenschutz` ihre eigene
 * Datenschutzerklärung — diese hier ist für die Plattform.
 *
 * Verantwortliche Stelle (Art. 4 Nr. 7 DSGVO) kommt aus
 * `LP_OWNER_*`-ENV. Solange die ENVs leer sind, läuft die Seite im
 * Demo-Modus mit Platzhaltern + sichtbarem Hinweis.
 */
export default function PlatformDatenschutzPage() {
  const owner = getOwnerInfo();
  return (
    <main className="lp-container max-w-3xl py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
        Stand: {PRIVACY_POLICY_VERSION}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">
        Datenschutzerklärung
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        Diese Erklärung gilt für die Nutzung der Plattform{" "}
        <strong>{PLATFORM_NAME}</strong> sowie für die über das
        Kontakt-Formular dieser Seite übermittelten personenbezogenen
        Daten.
      </p>

      {!owner.configured ? <DemoNotice /> : null}

      <Section title="1. Verantwortlicher">
        <p>
          Verantwortlich im Sinne der DSGVO und sonstiger nationaler
          Datenschutzgesetze ist:
        </p>
        <p className="mt-2">
          {owner.name}
          <br />
          {owner.street}
          <br />
          {owner.postalCode} {owner.city}
          <br />
          {owner.country}
        </p>
        <p className="mt-2">
          E-Mail:{" "}
          <a
            href={`mailto:${owner.email}`}
            className="font-medium underline underline-offset-2"
          >
            {owner.email}
          </a>
          {owner.phone ? (
            <>
              <br />
              Telefon: {owner.phone}
            </>
          ) : null}
        </p>
      </Section>

      <Section title="2. Welche Daten erheben wir?">
        <p>
          Beim Besuch der Plattform werden vom Hosting-Anbieter
          (Vercel) Server-Logs verarbeitet (IP-Adresse, User-Agent,
          aufgerufene URL, Referrer, Zeitstempel). Diese Logs dienen
          ausschließlich dem Betrieb und der Sicherheit der Plattform
          und werden nach kurzer Zeit gelöscht.
        </p>
        <p className="mt-2">
          Wenn Sie das Kontakt-Formular nutzen, verarbeiten wir die von
          Ihnen eingegebenen Daten (z. B. Name, E-Mail, Nachricht)
          ausschließlich zur Bearbeitung Ihrer Anfrage.
        </p>
      </Section>

      <Section title="3. Zweck und Rechtsgrundlage">
        <p>
          <strong>Server-Logs</strong>: Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse am sicheren Betrieb).
        </p>
        <p className="mt-2">
          <strong>Kontakt-Formular</strong>: Art. 6 Abs. 1 lit. a DSGVO
          (Einwilligung) und/oder Art. 6 Abs. 1 lit. b DSGVO
          (vorvertragliche Maßnahmen).
        </p>
      </Section>

      <Section title="4. Speicherdauer">
        <p>
          Anfragedaten löschen wir spätestens nach{" "}
          <strong>{LEAD_RETENTION_MONTHS} Monaten</strong>, wenn keine
          Geschäftsbeziehung zustande kommt. Soweit gesetzliche
          Aufbewahrungspflichten (handels- oder steuerrechtlich)
          greifen, gelten diese.
        </p>
      </Section>

      <Section title="5. Empfänger der Daten">
        <p>
          Ihre Daten werden ausschließlich beim oben genannten
          Verantwortlichen gespeichert. Eine Weitergabe an Dritte
          findet nur statt, soweit eine gesetzliche Pflicht besteht
          oder dies zur Vertragserfüllung erforderlich ist
          (z. B. Hosting-Dienstleister: Vercel Inc., 440 N Barranca
          Ave #4133, Covina, CA 91723, USA — Auftragsverarbeitungs-
          Vertrag inklusive Standardvertragsklauseln liegt vor).
        </p>
      </Section>

      <Section title="6. Ihre Rechte als betroffene Person">
        <p>Sie haben jederzeit das Recht auf:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Auskunft (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>
            Widerruf einer erteilten Einwilligung mit Wirkung für die
            Zukunft (Art. 7 Abs. 3 DSGVO)
          </li>
          <li>
            Beschwerde bei einer Datenschutz-Aufsichtsbehörde
            (Art. 77 DSGVO)
          </li>
        </ul>
      </Section>

      <Section title="7. Cookies">
        <p>
          Die Plattform setzt keine Tracking- oder Werbe-Cookies. Beim
          Login ins Dashboard wird ein technisch notwendiges
          HttpOnly-Session-Cookie gesetzt (rein funktional, keine
          Einwilligung erforderlich).
        </p>
      </Section>

      <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <strong>Hinweis</strong>: Diese Datenschutzerklärung ist eine
        MVP-Vorlage. Vor produktivem Einsatz muss sie vom
        Verantwortlichen mit einem Datenschutzbeauftragten /
        Rechtsanwalt abgestimmt werden — die hier gezeigten Texte sind
        kein Rechtsrat.
      </p>

      <p className="mt-6 text-sm">
        <Link
          href="/impressum"
          className="font-medium underline underline-offset-2"
        >
          → Impressum
        </Link>
      </p>
      <p className="mt-2 text-sm">
        <Link
          href="/"
          className="font-medium underline underline-offset-2"
        >
          ← Zurück zur Startseite
        </Link>
      </p>
    </main>
  );
}

function DemoNotice() {
  return (
    <div
      role="status"
      className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
      <div>
        <p className="font-semibold">
          Demo-Modus — Verantwortliche Stelle nicht konfiguriert
        </p>
        <p className="mt-1 text-amber-800">
          Die Verantwortlichen-Daten kommen aus den{" "}
          <code className="font-mono">LP_OWNER_*</code>-ENV-Variablen
          und stehen aktuell auf Platzhaltern. Vor produktiver Nutzung
          in Vercel/lokal setzen — Vorlage in
          {" "}
          <code className="font-mono">.env.production.example</code>.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <div className="mt-2 text-sm text-ink-700">{children}</div>
    </section>
  );
}

export const metadata = {
  title: "Datenschutzerklärung",
  robots: { index: true, follow: true },
};
