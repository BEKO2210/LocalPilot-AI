import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  FeatureComparisonMatrix,
  LimitsTable,
  PricingGrid,
} from "@/components/pricing";

export const metadata: Metadata = {
  title: "Pakete & Preise",
  description:
    "Bronze, Silber, Gold im Vergleich – Funktionen, Limits, monatliche und einmalige Kosten. Alle Pakete mit Klartext-Beschreibung der enthaltenen Capabilities.",
  alternates: { canonical: "/pricing/" },
};

const PRICING_FAQS = [
  {
    q: "Wie lange ist die Mindestlaufzeit?",
    a: "Wir empfehlen 12 Monate, damit sich Setup und Onboarding auszahlen. Die genaue Laufzeit wird im Vertrag festgehalten – kürzere Modelle sind auf Anfrage möglich.",
  },
  {
    q: "Kann ich später upgraden oder downgraden?",
    a: "Ja. Ein Upgrade ist jederzeit zum nächsten Monat möglich; ein Downgrade zum Ende der vereinbarten Laufzeit. Funktionen werden über Feature-Locks sichtbar gesperrt, statt grundlos zu verschwinden.",
  },
  {
    q: "Sind alle Preise inkl. MwSt.?",
    a: "Nein. Alle ausgewiesenen Beträge verstehen sich zzgl. MwSt. Auf der Rechnung ist die MwSt. separat ausgewiesen.",
  },
  {
    q: "Was passiert, wenn ich kündige?",
    a: "Wir geben Ihnen einen Export Ihrer Inhalte (Texte, Bilder, Anfragen) und schalten die öffentliche Site planmäßig ab. Es bleibt nichts auf Vertrags-Servern hängen.",
  },
  {
    q: "Brauche ich KI, um das Produkt zu nutzen?",
    a: "Nein. KI ist eine Hilfe, kein Zwang. Sie können alle Texte selbst pflegen. Im Bronze-Paket ist KI bewusst nicht enthalten – Sie zahlen also nicht für Funktionen, die Sie nicht wollen.",
  },
  {
    q: "Was ist mit Platin?",
    a: "Platin ist die Stufe für Automationen, CRM- und WhatsApp-Anbindung. Aktuell auf Anfrage – sobald die Funktionsmenge final ist, finden Sie Platin in dieser Tabelle.",
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        {/* Hero */}
        <Section bg="muted">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="lp-eyebrow">Pakete & Preise</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                Drei Pakete, klar geschnitten.
              </h1>
              <p className="mt-4 text-lg text-ink-600">
                Bronze für die schnelle digitale Präsenz, Silber für echte
                Arbeitserleichterung, Gold für ein vollständiges lokales
                Marketing-System. Sie wachsen mit jedem Schritt mit.
              </p>
            </div>

            <div className="mt-12">
              <PricingGrid ctaHref="#kontakt-pricing" />
            </div>

            <p className="mt-8 text-center text-xs text-ink-500">
              Alle Preise zzgl. MwSt. Mindestlaufzeit nach Vereinbarung.
              Platin (Automationen, CRM, WhatsApp) auf Anfrage.
            </p>
          </Container>
        </Section>

        {/* Limits */}
        <Section>
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="lp-eyebrow">Limits</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Wie viel ist enthalten?
              </h2>
              <p className="mt-4 text-ink-600">
                Limits sind so gewählt, dass kleine Betriebe in Bronze gut
                arbeiten können – und größere Betriebe in Gold nicht ständig an
                Grenzen stoßen.
              </p>
            </div>

            <div className="mt-10 rounded-2xl border border-ink-200 bg-white p-2 shadow-soft">
              <LimitsTable />
            </div>
          </Container>
        </Section>

        {/* Feature-Vergleichsmatrix */}
        <Section bg="muted">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="lp-eyebrow">Funktionen</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Was kann welches Paket?
              </h2>
              <p className="mt-4 text-ink-600">
                Vollständige Übersicht aller Capabilities. Wer ein Häkchen sieht,
                kann die Funktion ohne weiteres Zubuchen nutzen.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
              <FeatureComparisonMatrix />
            </div>
          </Container>
        </Section>

        {/* Pricing-FAQ */}
        <Section>
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="lp-eyebrow">FAQ</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Häufige Fragen zu den Paketen
              </h2>
            </div>
            <div className="mx-auto mt-10 max-w-3xl divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white">
              {PRICING_FAQS.map((item) => (
                <details key={item.q} className="group p-6">
                  <summary className="flex cursor-pointer items-start justify-between gap-4 text-left text-base font-medium text-ink-900">
                    {item.q}
                    <span
                      aria-hidden
                      className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-ink-200 text-ink-600 transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section id="kontakt-pricing" bg="brand">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
                Beratung
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Unsicher, welches Paket passt?
              </h2>
              <p className="mt-4 max-w-xl text-white/80">
                In einem 20-minütigen Gespräch klären wir Branche, Ziele und
                vorhandene Tools. Sie bekommen eine ehrliche Empfehlung – auch,
                wenn das nicht das größte Paket ist.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="mailto:hello@localpilot.ai" size="lg" variant="secondary">
                  Beratung per E-Mail
                </LinkButton>
                <LinkButton href="/demo" size="lg" variant="outline" className="bg-white text-ink-900">
                  Demo-Sites ansehen
                </LinkButton>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-medium uppercase tracking-wide text-white/70">
                In 4 Schritten startklar
              </p>
              <ol className="mt-4 space-y-4 text-sm text-white/90">
                <li className="flex gap-3">
                  <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-ink-900 font-semibold">
                    1
                  </span>
                  <span>Branche, Paket und Theme festlegen.</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-ink-900 font-semibold">
                    2
                  </span>
                  <span>Leistungen, Adresse, Bilder einsetzen oder von uns importieren lassen.</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-ink-900 font-semibold">
                    3
                  </span>
                  <span>Vorschau prüfen, KI-Texte verfeinern, Bewertungslink einbinden.</span>
                </li>
                <li className="flex gap-3">
                  <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-ink-900 font-semibold">
                    4
                  </span>
                  <span>Veröffentlichen – und wir bleiben für Updates erreichbar.</span>
                </li>
              </ol>
              <p className="mt-5 text-xs text-white/60">
                Kein verbindlicher Vertrag im Erstgespräch.
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
