import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";

const STEPS = [
  {
    n: "1",
    title: "Login per Magic-Link",
    text: "E-Mail eingeben, einmal-Link klicken — fertig. Kein Passwort, kein Drittanbieter-Tracking.",
  },
  {
    n: "2",
    title: "Branche & Paket wählen",
    text: "20 Branchen-Presets bringen Texte, Felder und Tonalität mit. Bronze für klein, Silber für laufend, Gold für groß.",
  },
  {
    n: "3",
    title: "Inhalte einsetzen oder per KI generieren",
    text: "Leistungen, Adresse, Logo, Hero-Bild eintragen. Beschreibungen, FAQs und Posts erzeugt der KI-Assistent auf Knopfdruck.",
  },
  {
    n: "4",
    title: "Veröffentlichen unter Ihrem Slug",
    text: `Theme aus 10 Vorlagen wählen, Slug einstellen, Schalter auf „veröffentlicht". Live unter /site/ihr-slug.`,
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
          <LinkButton href="/login" size="lg">
            Jetzt anmelden
          </LinkButton>
          <LinkButton href="/pricing" size="lg" variant="outline">
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
