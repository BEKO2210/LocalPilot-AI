import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMockBusinessBySlug,
  listMockBusinessSlugs,
} from "@/data";
import { LEAD_RETENTION_MONTHS, PRIVACY_POLICY_VERSION } from "@/core/legal";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return listMockBusinessSlugs().map((slug) => ({ slug }));
}

/**
 * Datenschutzerklärung pro Demo-Betrieb (Code-Session 32).
 *
 * **Wichtig**: Das ist ein **MVP-Stub** mit Standard-Sektionen — gut
 * genug, damit der Lead-Form-Link auf etwas Sinnvolles zeigt und
 * der Stand DSGVO-Mindestanforderungen reflektiert.
 *
 * Vor echter Produktiv-Nutzung muss der Auftraggeber den Text mit
 * einem Datenschutzbeauftragten / Rechtsanwalt abstimmen — die hier
 * gezeigten Texte sind kein Rechtsrat. Das steht auch unten als
 * Hinweis auf der Seite selbst.
 *
 * Versionierung: bei inhaltlicher Änderung
 * `PRIVACY_POLICY_VERSION` in `src/core/legal.ts` erhöhen — bestehende
 * Leads behalten ihren Stempel und damit ihren Audit-Trail.
 */
export default async function DatenschutzPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getMockBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <main className="lp-container max-w-3xl py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
        Stand: {PRIVACY_POLICY_VERSION}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">
        Datenschutzerklärung
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        Diese Erklärung gilt für die Nutzung der Website von{" "}
        <strong>{business.name}</strong> sowie für alle über das
        Anfrage-Formular übermittelten personenbezogenen Daten.
      </p>

      <Section title="1. Verantwortlicher">
        <p>
          Verantwortlich im Sinne der DSGVO und sonstiger nationaler
          Datenschutzgesetze ist:
        </p>
        <p className="mt-2">
          {business.name}
          <br />
          {business.address.street}
          <br />
          {business.address.postalCode} {business.address.city}
          <br />
          {business.address.country}
        </p>
        {business.contact.email ? (
          <p className="mt-2">
            E-Mail:{" "}
            <a
              href={`mailto:${business.contact.email}`}
              className="font-medium underline underline-offset-2"
            >
              {business.contact.email}
            </a>
          </p>
        ) : null}
        {business.contact.phone ? (
          <p className="mt-1">Telefon: {business.contact.phone}</p>
        ) : null}
      </Section>

      <Section title="2. Welche Daten erheben wir, wenn Sie das Anfrage-Formular nutzen?">
        <p>
          Beim Absenden des Formulars verarbeiten wir die von Ihnen
          eingegebenen Pflicht- und freiwilligen Felder, typischerweise:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Name (Pflicht)</li>
          <li>Telefonnummer und/oder E-Mail-Adresse (eines davon Pflicht)</li>
          <li>Optional: Wunschtermin, gewünschte Leistung, Nachricht</li>
          <li>Branchenspezifische Angaben (z. B. Fahrzeug-Modell bei der Werkstatt)</li>
          <li>
            Zeitstempel und Version der Datenschutzerklärung, gegen die
            Sie eingewilligt haben
          </li>
        </ul>
      </Section>

      <Section title="3. Zweck und Rechtsgrundlage">
        <p>
          Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage und zur
          Anbahnung einer möglichen Geschäftsbeziehung.
        </p>
        <p className="mt-2">
          <strong>Rechtsgrundlage</strong>: Art. 6 Abs. 1 lit. a DSGVO
          (Einwilligung), die Sie über die Checkbox im Formular aktiv
          erteilen. Sie können diese Einwilligung jederzeit für die Zukunft
          widerrufen — am einfachsten per E-Mail an den oben genannten
          Verantwortlichen.
        </p>
      </Section>

      <Section title="4. Speicherdauer">
        <p>
          Wir speichern Ihre Daten so lange, wie es zur Bearbeitung Ihrer
          Anfrage notwendig ist. Wenn keine Geschäftsbeziehung zustande
          kommt, löschen wir die Daten spätestens nach{" "}
          <strong>{LEAD_RETENTION_MONTHS} Monaten</strong>.
        </p>
        <p className="mt-2">
          Soweit gesetzliche Aufbewahrungspflichten (z. B. handels- oder
          steuerrechtlich) länger sind, gelten diese.
        </p>
      </Section>

      <Section title="5. Empfänger der Daten">
        <p>
          Ihre Daten werden ausschließlich beim Verantwortlichen
          gespeichert und für die Bearbeitung Ihrer Anfrage genutzt.
          Eine Weitergabe an Dritte findet nicht statt, sofern keine
          gesetzliche Pflicht besteht.
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

      <Section title="7. Cookies und vergleichbare Mechanismen">
        <p>
          In dieser Demo-Version werden Anfrage-Daten ausschließlich im
          Browser-Storage (`localStorage`) Ihres Geräts gespeichert und
          nicht an einen Server übertragen. Mit dem Abschluss der
          Beta-Phase wird diese Erklärung um die produktiven
          Speichermechanismen ergänzt.
        </p>
      </Section>

      <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <strong>Hinweis</strong>: Diese Datenschutzerklärung ist eine
        MVP-Vorlage. Vor produktivem Einsatz muss sie vom Verantwortlichen
        mit einem Datenschutzbeauftragten / Rechtsanwalt abgestimmt werden.
      </p>

      <p className="mt-6 text-sm">
        <Link
          href={`/site/${business.slug}`}
          className="font-medium underline underline-offset-2"
        >
          ← Zurück zur Startseite von {business.name}
        </Link>
      </p>
    </main>
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
