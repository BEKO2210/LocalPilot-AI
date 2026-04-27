import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getOwnerInfo, PLATFORM_NAME } from "@/core/legal";

/**
 * Plattform-Impressum für LocalPilot AI selbst (Code-Session 36).
 *
 * Pflicht-Angaben nach § 5 DDG (ehemals § 5 TMG, abgelöst zum
 * 14.05.2024) + § 18 MStV. Demo-Betriebe haben ihr eigenes Impressum
 * unter `/site/<slug>/impressum` — das hier gehört dem Plattform-
 * Betreiber.
 *
 * Werte kommen aus `LP_OWNER_*`-ENV-Variablen. Solange die nicht in
 * Vercel/lokal gesetzt sind, zeigt die Seite einen Demo-Mode-Hinweis
 * mit dem Setup-Pfad. Persönliche Stammdaten landen NIE im Repo.
 */
export default function PlatformImpressumPage() {
  const owner = getOwnerInfo();
  return (
    <main className="lp-container max-w-3xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
        Impressum
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) und § 18 MStV.
      </p>

      {!owner.configured ? <DemoNotice /> : null}

      <Section title={`Anbieter und Verantwortlicher (${PLATFORM_NAME})`}>
        <p>
          {owner.name}
          <br />
          {owner.street}
          <br />
          {owner.postalCode} {owner.city}
          <br />
          {owner.country}
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          E-Mail:{" "}
          <a
            href={`mailto:${owner.email}`}
            className="font-medium underline underline-offset-2"
          >
            {owner.email}
          </a>
        </p>
        {owner.phone ? <p className="mt-1">Telefon: {owner.phone}</p> : null}
      </Section>

      {owner.taxId ? (
        <Section title="Umsatzsteuer-Identifikationsnummer">
          <p>USt-IdNr. nach § 27a UStG: {owner.taxId}</p>
        </Section>
      ) : null}

      <Section title="Verantwortlich für den Inhalt">
        <p>
          {owner.name}, {owner.postalCode} {owner.city}.
          <br />
          Inhaltlich Verantwortliche:r nach § 18 Abs. 2 MStV identisch
          mit dem Anbieter oben.
        </p>
      </Section>

      <Section title="Haftungsausschluss">
        <p>
          Die Inhalte dieser Webseite werden mit größter Sorgfalt
          erstellt. Für Richtigkeit, Vollständigkeit und Aktualität wird
          jedoch keine Gewähr übernommen. Externe Links wurden zum
          Zeitpunkt der Verlinkung auf rechtswidrige Inhalte überprüft;
          für die Inhalte verlinkter externer Seiten ist ausschließlich
          deren Betreiber verantwortlich.
        </p>
      </Section>

      <Section title="Online-Streitbeilegung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            className="font-medium underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>
          . Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </Section>

      <p className="mt-8 text-sm">
        <Link
          href="/datenschutz"
          className="font-medium underline underline-offset-2"
        >
          → Datenschutzerklärung
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
        <p className="font-semibold">Demo-Modus — Impressum ist nicht produktiv</p>
        <p className="mt-1 text-amber-800">
          Die Pflicht-Felder (Name, Anschrift, Kontakt) werden über die
          ENV-Variablen <code className="font-mono">LP_OWNER_NAME</code>,
          {" "}
          <code className="font-mono">LP_OWNER_STREET</code>,
          {" "}
          <code className="font-mono">LP_OWNER_POSTAL_CODE</code>,
          {" "}
          <code className="font-mono">LP_OWNER_CITY</code> und
          {" "}
          <code className="font-mono">LP_OWNER_EMAIL</code> in
          Vercel/lokal gesetzt. Solange diese leer sind, zeigt die Seite
          Platzhalter — vor Veröffentlichung produktiv konfigurieren.
          Vorlage in <code className="font-mono">.env.production.example</code>.
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
  title: "Impressum",
  robots: { index: true, follow: true },
};
