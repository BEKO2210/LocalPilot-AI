import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Clock, ShieldCheck, Sparkles, Smartphone, Wand2, TrendingUp } from "lucide-react";

const ITEMS = [
  {
    icon: Clock,
    title: "7 Tage bis live",
    text: "Tag 0 Briefing, Tag 7 Übergabe. Keine wochenlangen Schleifen, keine offenen Enden.",
  },
  {
    icon: Smartphone,
    title: "Mobile zuerst",
    text: "Über 80 % Ihrer Kunden öffnen die Seite am Handy. Touch-Targets, Schriften, Lesbarkeit — alles dafür gemacht.",
  },
  {
    icon: Wand2,
    title: "KI-Texte, wenn Sie sie wollen",
    text: "Service-Beschreibungen, FAQ, Social-Media-Posts auf Knopfdruck. Sie können auch alles selbst schreiben — die KI ist optional.",
  },
  {
    icon: TrendingUp,
    title: "Anfragen statt verlorener Anrufe",
    text: "DSGVO-konformes Formular pro Branche. Anfragen landen sortiert in Ihrer Inbox, nicht im Tresen-Zettelchaos.",
  },
  {
    icon: ShieldCheck,
    title: "DSGVO-konform & wartbar",
    text: "Impressum, Datenschutz, Lead-Consent — alles am Stand 2026. Daten-Export auf Knopfdruck (Art. 20 DSGVO).",
  },
  {
    icon: Sparkles,
    title: "Wächst mit Ihrem Betrieb",
    text: "Bronze startet klein (Website + Anfragen), Silber bringt KI + Dashboard, Gold liefert das volle Marketing-System mit Social.",
  },
];

export function Benefits() {
  return (
    <Section id="vorteile" bg="muted">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">Vorteile</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Was Sie davon haben
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
