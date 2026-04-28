import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";

const STEPS = [
  {
    n: "Tag 0",
    title: "30-Min-Briefing",
    text: "Wir hören zu: Was macht Ihren Betrieb aus, welche Leistungen, welche Bilder. Sie sammeln Texte und Fotos.",
  },
  {
    n: "Tag 1–4",
    title: "Wir bauen Ihre Seite",
    text: "Branche, Theme, Inhalte, Anfrageformular, Bewertungs-Booster, Social-Texte — alles passend zu Ihrem Betrieb.",
  },
  {
    n: "Tag 5",
    title: "Owner-Training",
    text: "30-Min-Video-Call: alle Editoren durchgeklickt. Ein Service ändern, ein Bild tauschen, eine FAQ ergänzen — gemeinsam.",
  },
  {
    n: "Tag 6–7",
    title: "Domain, SSL, Live + Übergabe",
    text: "Ihre eigene Domain, DSGVO-Texte, Impressum geprüft, Site live geschaltet. 45-Min-Übergabe-Termin mit Walkthrough.",
  },
];

export function OnboardingPromise() {
  return (
    <Section id="onboarding">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">7-Tage-Onboarding</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tag 0 bis Tag 7 — feste Schritte, klare Übergabe.
          </h2>
          <p className="mt-4 text-ink-600">
            {`Kein „in 5 Minuten online" und keine Wochenendschicht
            am Baukasten. Eine Woche fokussierte Arbeit, am Ende
            geben wir die Seite an Sie zurück.`}
          </p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.n} className="lp-card flex h-full flex-col">
              <span className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-bold text-white">
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
          <LinkButton href="/#kontakt" size="lg">
            Pilot-Slot reservieren
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
