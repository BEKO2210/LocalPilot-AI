import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const QUESTIONS = [
  {
    q: "Für welche Branchen funktioniert das?",
    a: "Aktuell richten wir uns mit der Pilotwelle gezielt an Friseure / Barber, Auto-Werkstätten und Reinigungsfirmen. Das System kann technisch mehr Branchen, aber wir konzentrieren uns auf diese drei, damit jeder Pilotkunde die volle Aufmerksamkeit bekommt. Andere Branchen folgen, sobald wir pro Hero-Branche 3 echte Pilotkunden haben.",
  },
  {
    q: "Was ist in der Pilotwelle drin?",
    a: "3 Monate komplett kostenlos, Setup-Fee 50 % reduziert. Im Gegenzug erlauben Sie uns nach 30 Tagen Live-Betrieb eine schriftliche Case-Study (Vorher/Nachher, Anfragen-Zahl, Zitat). Sie können jederzeit zum Monatsende kündigen — kein Lock-in.",
  },
  {
    q: "Wie läuft das Onboarding ab?",
    a: "Sieben Tage. Tag 0 ist ein 30-Min-Briefing, danach bauen wir die Seite, Tag 5 zeigen wir Ihnen die Editoren, Tag 6–7 sind Domain, SSL, Impressum und Live-Schaltung. Tag 7 endet mit einem 45-Min-Übergabe-Termin.",
  },
  {
    q: "Kann ich Inhalte selbst ändern?",
    a: "Ja. Über das Dashboard ändern Sie Texte, Leistungen, Öffnungszeiten und Bilder selbst. Die KI-Tools schlagen Texte vor (Service-Beschreibungen, FAQ, Social-Media-Posts), Sie übernehmen oder schreiben selbst.",
  },
  {
    q: "Brauche ich technische Kenntnisse?",
    a: "Nein. Wir verwenden keine Entwicklerbegriffe und führen Sie Schritt für Schritt durch das Setup. Wer Email schreiben kann und Bilder vom Handy hochlädt, kann das System bedienen.",
  },
  {
    q: "Was kostet das nach den 3 Pilotmonaten?",
    a: "Bronze 49 €/Monat (Website + Anfrageformular), Silber 99 €/Monat (+ KI-Texte + Dashboard + Bewertungs-Booster), Gold 199 €/Monat (+ Social-Media-Generator + Domain + Premium-Themes). Setup-Fee einmalig 499–1.999 € — in der Pilotwelle 50 % reduziert. Monatlich kündbar.",
  },
  {
    q: "Was passiert mit meinen Daten, wenn ich kündige?",
    a: "DSGVO Art. 20: Sie bekommen alle Daten als Export (Texte, Bilder, Anfragen, Bewertungen). Die Site geht offline, Ihre Daten gehen mit. Kein Lock-in.",
  },
  {
    q: "Ist KI verpflichtend?",
    a: "Nein. Die KI-Tools sind eine Hilfe, kein Zwang. Sie können alle Texte selbst schreiben. Im Demo-Modus läuft das System mit deterministischen Beispieltexten weiter.",
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
              <summary className="lp-focus-ring flex cursor-pointer items-start justify-between gap-4 rounded-md text-left text-base font-medium text-ink-900">
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
