import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  AlertTriangle,
  CheckCircle2,
  Megaphone,
  PhoneCall,
  Star,
  Users,
} from "lucide-react";

const PROBLEMS = [
  "Die Website ist veraltet — auf dem Handy kaum lesbar.",
  "Anfragen verteilen sich auf WhatsApp, Anrufe und Zettel im Tresen.",
  "Bewertungen sammelt niemand systematisch — also bleibt es bei den drei alten von 2022.",
  "Texte für Instagram oder Facebook? Keine Zeit, keine Idee.",
  "Größere Wettbewerber wirken professioneller — weil sie online besser auftreten.",
];

const SOLUTIONS = [
  {
    icon: Users,
    title: "Eigene Seite in 7 Tagen",
    text: "Friseur, Werkstatt oder Reinigung — Ihre Branche, Ihre Texte, Ihr Logo. Nicht aus dem Baukasten.",
  },
  {
    icon: PhoneCall,
    title: "Anfragen sortiert in der Inbox",
    text: "Ein Formular, das zur Branche passt. Anfragen landen direkt bei Ihnen, mit DSGVO-Consent.",
  },
  {
    icon: Star,
    title: "Bewertungs-Booster mit 1 Klick",
    text: "Vorlagen für Google, WhatsApp und SMS. Sie schicken nur die Anfrage — den Text macht das System.",
  },
  {
    icon: Megaphone,
    title: "Social-Media-Texte aus der Maschine",
    text: "Instagram, Facebook, WhatsApp-Status. KI schreibt branchengerecht — Sie posten oder kopieren.",
  },
];

export function ProblemSolution() {
  return (
    <>
      <Section id="problem" bg="muted">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="lp-eyebrow">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              Kennen Sie das?
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Sie machen gute Arbeit. Online sieht man davon zu wenig.
            </h2>
            <p className="mt-4 text-ink-600">
              Wir hören das jeden Tag von Friseuren, Werkstätten und
              Reinigungsfirmen. Hier sind die fünf Punkte, die fast
              immer zuerst kommen:
            </p>
          </div>
          <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            {PROBLEMS.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 text-sm text-ink-700"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                  !
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section id="loesung">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="lp-eyebrow">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              So lösen wir das
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Vier konkrete Werkzeuge — alle in einem System.
            </h2>
            <p className="mt-4 text-ink-600">
              Keine 12 Tools, kein Lock-in, keine versteckten Kosten.
              Eine Seite, ein Dashboard — passt zur Branche, fertig
              eingerichtet in 7 Tagen.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="lp-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-ink-600">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
