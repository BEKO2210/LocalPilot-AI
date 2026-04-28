import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-b from-brand-50 to-white">
      <Container className="relative py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="lp-eyebrow">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Für Friseur, Werkstatt und Reinigung
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            In 7 Tagen eine moderne Website mit Anfrageformular,
            Bewertungs-Booster und KI-Texten — ohne Technikstress.
          </h1>
          <p className="mt-6 text-lg text-ink-600 sm:text-xl">
            Wir bauen Ihrem Betrieb eine eigene Seite, die auf dem
            Handy gut aussieht, Anfragen sortiert und Bewertungen
            einsammelt. Sie pflegen Texte, Fotos und Leistungen
            später selbst — wir richten alles in einer Woche ein.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/#kontakt" size="lg">
              <Calendar className="h-4 w-4" aria-hidden />
              Pilot-Slot reservieren
            </LinkButton>
            <LinkButton href="/demo" variant="outline" size="lg">
              Live-Demos ansehen
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LinkButton>
          </div>
          <p className="mt-5 text-sm text-ink-500">
            Pilotwelle 2026: 3 Monate kostenlos, Setup-Fee 50 % reduziert.
            Kein Lock-in, monatliche Kündigung.
          </p>
        </div>
      </Container>
    </section>
  );
}
