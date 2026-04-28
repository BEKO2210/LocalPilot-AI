import Link from "next/link";
import {
  listSlugParams,
  loadBusinessOrNotFound,
} from "@/lib/page-business";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export async function generateStaticParams(): Promise<Params[]> {
  return listSlugParams();
}

/**
 * Impressum pro Demo-Betrieb (Code-Session 32).
 *
 * **Wichtig**: MVP-Stub mit Standard-Sektionen nach § 5 TMG / § 18 MStV.
 * Vor produktiver Nutzung muss der Auftraggeber den Inhalt mit dem
 * Verantwortlichen abstimmen. Insbesondere fehlen aktuell:
 *   - USt-IdNr. nach § 27a UStG (falls vorhanden)
 *   - Aufsichtsbehörde (bei zulassungspflichtigen Berufen)
 *   - Berufshaftpflicht-Angaben (bei freien Berufen)
 *   - Online-Streitbeilegung-Verweis (Art. 14 ODR-Verordnung)
 *
 * Diese Felder sind nicht im aktuellen `Business`-Schema enthalten —
 * Folge-Item für Meilenstein 4 (Settings-Editor mit Legal-Sektion).
 */
export default async function ImpressumPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await loadBusinessOrNotFound(slug);

  return (
    <main id="main-content" className="lp-container max-w-3xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
        Impressum
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        Angaben gemäß § 5 TMG / § 18 MStV.
      </p>

      <Section title="Anbieter und Verantwortlicher">
        <p>
          {business.name}
          <br />
          {business.address.street}
          <br />
          {business.address.postalCode} {business.address.city}
          <br />
          {business.address.country}
        </p>
      </Section>

      <Section title="Kontakt">
        {business.contact.phone ? (
          <p>Telefon: {business.contact.phone}</p>
        ) : null}
        {business.contact.email ? (
          <p className="mt-1">
            E-Mail:{" "}
            <a
              href={`mailto:${business.contact.email}`}
              className="font-medium underline underline-offset-2"
            >
              {business.contact.email}
            </a>
          </p>
        ) : null}
        {business.contact.website ? (
          <p className="mt-1">
            Website:{" "}
            <a
              href={business.contact.website}
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {business.contact.website}
            </a>
          </p>
        ) : null}
      </Section>

      <Section title="Verantwortlich für den Inhalt">
        <p>
          {business.name},{" "}
          {business.address.postalCode} {business.address.city}.
        </p>
        <p className="mt-2">
          Inhaltlich Verantwortliche:r nach § 18 Abs. 2 MStV identisch
          mit dem Anbieter oben, sofern keine abweichende Person genannt.
        </p>
      </Section>

      <Section title="Haftungsausschluss">
        <p>
          Die Inhalte dieser Webseite werden mit größter Sorgfalt erstellt.
          Für Richtigkeit, Vollständigkeit und Aktualität der Inhalte
          übernimmt {business.name} jedoch keine Gewähr. Externe Links
          werden zum Zeitpunkt der Verlinkung auf rechtswidrige Inhalte
          überprüft. Für Inhalte verlinkter externer Seiten ist
          ausschließlich deren Betreiber verantwortlich.
        </p>
      </Section>

      <Section title="Online-Streitbeilegung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-
          Streitbeilegung bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            className="font-medium underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>
          . Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </Section>

      <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <strong>Hinweis</strong>: MVP-Vorlage. USt-IdNr., Aufsichtsbehörde
        und Berufshaftpflicht-Angaben fehlen aktuell — gehören vor
        produktivem Einsatz ergänzt (siehe Settings-Editor in
        Meilenstein 4).
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
  title: "Impressum",
  robots: { index: true, follow: true },
};
