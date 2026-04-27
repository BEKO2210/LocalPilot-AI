import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  ArrowUpRight,
  Clock,
  PhoneCall,
  Star,
  Sparkles,
} from "lucide-react";

const ITEMS = [
  {
    icon: PhoneCall,
    headline: "Mehr Anfragen, sortierter Posteingang",
    text:
      "Direkte Buttons für Anrufen, WhatsApp und E-Mail – plus ein Anfrageformular, das pro Branche die richtigen Felder zeigt.",
    proofLabel: "Konvertierungsstärke",
    proof: "1-Tap-Kontakt auf Mobile",
  },
  {
    icon: Star,
    headline: "Mehr und bessere Bewertungen",
    text:
      "Vorgefertigte WhatsApp-, SMS- und E-Mail-Vorlagen mit Platzhaltern für Kunde und Bewertungslink.",
    proofLabel: "Eingebaut",
    proof: "Bewertungs-Booster ab Bronze",
  },
  {
    icon: Clock,
    headline: "Stunden pro Woche zurückgewonnen",
    text:
      "Texte für Website, Antworten und Social Posts auf Knopfdruck. Sie geben den Kontext, die KI macht den Entwurf.",
    proofLabel: "Pakete mit KI",
    proof: "Silber & Gold",
  },
  {
    icon: Sparkles,
    headline: "Auftritt, der zur Branche passt",
    text:
      "Branchen-Presets liefern passende Worte, Themes geben das Design vor – ohne dass jemand am Code drehen muss.",
    proofLabel: "Vorlagen",
    proof: "13 Branchen, 10 Themes",
  },
];

export function ValueRoi() {
  return (
    <Section id="nutzen" bg="muted">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">Was bringt das?</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Konkrete Vorteile für Ihren Betrieb.
          </h2>
          <p className="mt-4 text-ink-600">
            Wir bauen kein Spielzeug. Jede Funktion hat einen geschäftlichen
            Grund – mehr Anfragen, weniger Tipparbeit, sichtbarer Auftritt.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ITEMS.map(({ icon: Icon, headline, text, proofLabel, proof }) => (
            <article key={headline} className="lp-card flex h-full flex-col">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-lg font-semibold text-ink-900">
                  {headline}
                </h3>
              </div>
              <p className="mt-3 text-sm text-ink-600">{text}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-wide text-ink-500">
                {proofLabel}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                <span className="font-semibold text-ink-700">{proof}</span>
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
