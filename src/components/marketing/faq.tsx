import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const QUESTIONS = [
  {
    q: "Ist das eine normale Website?",
    a: "Ja – für Ihre Kundinnen und Kunden ist es eine ganz normale Website. Im Hintergrund liegt ein flexibles System, mit dem sich Inhalte, Design und Kontaktwege einfach ändern lassen.",
  },
  {
    q: "Kann ich Inhalte selbst ändern?",
    a: "Ja. Über das Dashboard ändern Sie Texte, Leistungen, Öffnungszeiten und Bilder selbst. Bei Bedarf hilft die KI mit Textvorschlägen.",
  },
  {
    q: "Brauche ich technische Kenntnisse?",
    a: "Nein. Die Oberfläche ist bewusst einfach gehalten. Wir verwenden keine Entwicklerbegriffe und führen Sie Schritt für Schritt durch das Onboarding.",
  },
  {
    q: "Funktioniert das für meine Branche?",
    a: "Sehr wahrscheinlich. LocalPilot AI ist branchenneutral und bringt Vorlagen für Friseur, Werkstatt, Reinigung, Kosmetik, Handwerk, Fahrschule, Fitness, Foto und viele mehr mit. Neue Branchen lassen sich in unter 30 Minuten ergänzen.",
  },
  {
    q: "Gibt es monatliche Kosten?",
    a: "Ja – ab 49 € pro Monat. Die Einrichtungsgebühr deckt das Onboarding ab. Sie können jederzeit zwischen Bronze, Silber und Gold wechseln.",
  },
  {
    q: "Ist KI verpflichtend?",
    a: "Nein. Die KI ist eine Hilfe, kein Zwang. Sie können alle Texte selbst schreiben. Ohne API-Key läuft das System im Mock-Modus weiter – ideal für Demos.",
  },
];

export function MarketingFAQ() {
  return (
    <Section id="faq">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">FAQ</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Häufige Fragen
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group p-6">
              <summary className="flex cursor-pointer items-start justify-between gap-4 text-left text-base font-medium text-ink-900">
                {q}
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-ink-200 text-ink-600 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
