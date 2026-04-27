import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";

export function CtaContact() {
  return (
    <Section id="kontakt" bg="brand">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
            Kontakt
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Sehen Sie LocalPilot AI live für Ihren Betrieb.
          </h2>
          <p className="mt-4 max-w-xl text-white/80">
            In einem kurzen Gespräch zeigen wir Ihnen eine Demo-Website passend zu Ihrer Branche
            und besprechen, welches Paket sinnvoll ist. Unverbindlich, in deutscher Sprache.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="mailto:hello@localpilot.ai" size="lg" variant="secondary">
              Beratung per E-Mail
            </LinkButton>
            <LinkButton href="#pakete" size="lg" variant="outline" className="bg-white text-ink-900">
              Pakete ansehen
            </LinkButton>
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-wide text-white/70">
            Onboarding in 4 Schritten
          </p>
          <ol className="mt-4 space-y-4 text-sm text-white/90">
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-ink-900 font-semibold">1</span>
              <span>Branche und Paket auswählen, Kontaktdaten eintragen.</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-ink-900 font-semibold">2</span>
              <span>Leistungen importieren oder per KI-Vorschlag generieren.</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-ink-900 font-semibold">3</span>
              <span>Theme wählen, Logo und Bilder einsetzen.</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-ink-900 font-semibold">4</span>
              <span>Vorschau prüfen, Bewertungslink einfügen, veröffentlichen.</span>
            </li>
          </ol>
          <p className="mt-5 text-xs text-white/60">
            Kontaktformular und Lead-System folgen in einer der nächsten Sessions.
          </p>
        </div>
      </Container>
    </Section>
  );
}
