import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";

const STEPS = [
  {
    n: "1",
    title: "Branche & Paket wählen",
    text: "13 Branchen-Presets bringen Texte, Felder und Tonalität mit. Bronze für klein, Silber für laufend, Gold für groß.",
  },
  {
    n: "2",
    title: "Inhalte einsetzen oder übernehmen lassen",
    text: "Leistungen, Adresse, Bilder eintragen. Auf Wunsch importieren wir aus Ihrer alten Seite oder erzeugen einen ersten Entwurf per KI.",
  },
  {
    n: "3",
    title: "Theme wählen, Vorschau prüfen",
    text: "10 Themes – von Clean Light bis Premium Dark. Vorschau läuft live unter /site/ihr-slug.",
  },
  {
    n: "4",
    title: "Veröffentlichen & weiter pflegen",
    text: "Mit einem Klick live. Inhalte ändern Sie selbst, bei Bedarf greifen wir helfend ein.",
  },
];

export function OnboardingPromise() {
  return (
    <Section id="onboarding">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">Onboarding</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            In 4 Schritten startklar.
          </h2>
          <p className="mt-4 text-ink-600">
            {`Wir versprechen kein „in 5 Minuten online". Aber: in 60 Minuten haben Sie eine präsentierbare Seite. In 1–2 Wochen ist sie produktionsreif.`}
          </p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.n} className="lp-card flex h-full flex-col">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">
                {step.n}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-ink-600">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <LinkButton href="/pricing" size="lg">
            Pakete vergleichen
          </LinkButton>
          <LinkButton href="/demo" size="lg" variant="outline">
            Demo-Sites ansehen
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
