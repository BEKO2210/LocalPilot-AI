import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { ArrowRight, Eye, Sparkles } from "lucide-react";

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-b from-brand-50 to-white">
      <Container className="relative py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="lp-eyebrow">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Universell für lokale Betriebe
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Moderne Websites und KI-Automation für lokale Betriebe.
          </h1>
          <p className="mt-6 text-lg text-ink-600 sm:text-xl">
            LocalPilot AI hilft kleinen Unternehmen, online professionell aufzutreten,
            Anfragen zu sammeln, Bewertungen zu verbessern und regelmäßig Inhalte zu erstellen
            – ganz ohne technisches Wissen.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/demo" size="lg">
              <Eye className="h-4 w-4" aria-hidden />
              Live-Demos ansehen
            </LinkButton>
            <LinkButton href="/pricing" variant="outline" size="lg">
              Pakete vergleichen
              <ArrowRight className="h-4 w-4" aria-hidden />
            </LinkButton>
          </div>
          <p className="mt-5 text-sm text-ink-500">
            Bronze · Silber · Gold – passend zu Ihrer Größe und Branche.
          </p>
        </div>
      </Container>
    </section>
  );
}
