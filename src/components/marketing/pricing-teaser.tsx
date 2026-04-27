import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";
import { PricingGrid } from "@/components/pricing";

export function PricingTeaser() {
  return (
    <Section id="pakete">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">Pakete</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Bronze, Silber, Gold – passend zur Größe Ihres Betriebs.
          </h2>
          <p className="mt-4 text-ink-600">
            Drei Stufen, klar abgegrenzt. Sie starten klein und wachsen mit
            Funktionen, die Ihrem Betrieb spürbar Arbeit abnehmen.
          </p>
        </div>
        <div className="mt-12">
          <PricingGrid ctaHref="/pricing" />
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <LinkButton href="/pricing" variant="outline">
            Alle Funktionen vergleichen
            <ArrowRight className="h-4 w-4" aria-hidden />
          </LinkButton>
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          Alle Preise zzgl. MwSt. Mindestlaufzeit nach Vereinbarung. Platin-Stufe
          mit Automationen, CRM und WhatsApp ist auf Anfrage verfügbar.
        </p>
      </Container>
    </Section>
  );
}
