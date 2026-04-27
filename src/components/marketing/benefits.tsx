import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Clock, ShieldCheck, Sparkles, Smartphone, Wand2, TrendingUp } from "lucide-react";

const ITEMS = [
  {
    icon: Clock,
    title: "Schnell startklar",
    text: "Branchen-Preset auswählen, Daten eintragen, fertig. Erste Version in unter einer Stunde.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    text: "Über 80 % Ihrer Kundinnen und Kunden öffnen die Seite am Handy – dafür ist alles optimiert.",
  },
  {
    icon: Wand2,
    title: "KI-Texte ohne Risiko",
    text: "Mock-Modus für Demos, echte Provider optional. Keine Heilversprechen, keine Buzzwords.",
  },
  {
    icon: TrendingUp,
    title: "Mehr Anfragen",
    text: "Klare Calls-to-Action und ein dynamisches Lead-Formular pro Branche.",
  },
  {
    icon: ShieldCheck,
    title: "Seriös & wartbar",
    text: "Sauberer Code, klare Architektur, dokumentiert. Keine Demo-Optik, kein Vendor-Lock.",
  },
  {
    icon: Sparkles,
    title: "Wächst mit dem Betrieb",
    text: "Bronze startet klein, Silber bringt KI-Tools, Gold liefert ein vollständiges Marketing-System.",
  },
];

export function Benefits() {
  return (
    <Section id="vorteile" bg="muted">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">Vorteile</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Warum LocalPilot AI?
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="lp-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
              <p className="mt-2 text-sm text-ink-600">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
