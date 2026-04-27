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
  "Veraltete Websites, die auf dem Handy schwer lesbar sind.",
  "Zu wenige Google-Bewertungen, weil niemand systematisch fragt.",
  "Kundenanfragen verteilt auf WhatsApp, Anrufe und Zettel.",
  "Keine Zeit für regelmäßige Social-Media-Posts und gute Texte.",
  "Unsicheres Auftreten gegenüber größeren Anbietern.",
];

const SOLUTIONS = [
  {
    icon: Users,
    title: "Eine Website, die zu Ihrem Betrieb passt",
    text: "Branchengerechte Inhalte, mobil stark und in unter einer Stunde startklar.",
  },
  {
    icon: PhoneCall,
    title: "Anfragen geordnet sammeln",
    text: "Dynamisches Kontaktformular pro Branche – Leads landen sortiert im Dashboard.",
  },
  {
    icon: Star,
    title: "Mehr und bessere Bewertungen",
    text: "Vorlagen für WhatsApp, SMS und E-Mail – KI passt den Text an Ihre Branche an.",
  },
  {
    icon: Megaphone,
    title: "Regelmäßig sichtbar bleiben",
    text: "Social-Media-Posts auf Knopfdruck – mit passenden Hashtags und Bildideen.",
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
              Das Problem
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Lokale Betriebe haben oft keine Zeit für Marketing.
            </h2>
            <p className="mt-4 text-ink-600">
              Sie machen großartige Arbeit. Aber online sieht man davon wenig.
              LocalPilot AI nimmt den digitalen Aufwand ab – damit Sie sich auf Ihre Kunden konzentrieren können.
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
              Die Lösung
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Ein digitales Betriebssystem für lokale Unternehmen.
            </h2>
            <p className="mt-4 text-ink-600">
              Website, Anfragen, Bewertungen und Social Media – an einer Stelle, an Ihre Branche angepasst und bedienbar ohne IT-Kenntnisse.
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
