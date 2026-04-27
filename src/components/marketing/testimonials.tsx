import { Quote, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  rating: 4 | 5;
};

/**
 * Beispiel-Stimmen aus der Demo-Welt.
 * Klar als fiktiv markiert (siehe Footnote der Sektion).
 *
 * Wir nutzen die gleichen Demo-Inhaberinnen, die auch in den Public Sites
 * sichtbar sind, damit das Marketing in sich konsistent wirkt.
 */
const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "Endlich eine Lösung, die nicht aussieht, als hätte ich sie selbst zusammengeklickt. Die Kundinnen schreiben tatsächlich öfter über das Formular.",
    author: "Lena H.",
    role: "Inhaberin, Studio Haarlinie",
    rating: 5,
  },
  {
    quote:
      "Wir haben innerhalb von zwei Wochen die Bewertungen verdoppelt – allein durch die WhatsApp-Vorlagen, die wir nach jedem Termin verschicken.",
    author: "Stefan M.",
    role: "Kfz-Meister, AutoService Müller",
    rating: 5,
  },
  {
    quote:
      "Der Onboarding-Aufwand war minimal. Branche, Paket, Theme – fertig. Texte konnte ich danach selbst verfeinern.",
    author: "Sophie L.",
    role: "Inhaberin, Beauty Atelier",
    rating: 5,
  },
  {
    quote:
      "Endlich ein Auftritt, der zu unserem Betrieb passt – ohne dass wir fünf Tools jonglieren. Eine Anlaufstelle, ein Preis.",
    author: "Petra W.",
    role: "Fahrlehrerin, Fahrschule Stadtmitte",
    rating: 5,
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "text-amber-400" : "text-ink-200"}`}
          fill={i < rating ? "currentColor" : "transparent"}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <Section id="stimmen">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">Stimmen</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Was Beta-Pilot:innen sagen würden.
          </h2>
          <p className="mt-4 text-ink-600">
            Die folgenden Aussagen sind Beispiele aus unseren Demo-Personas.
            Sobald echte Pilot-Kund:innen live sind, ersetzen wir sie hier mit
            ihrer Erlaubnis.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {TESTIMONIALS.map((testimonial) => (
            <article key={testimonial.author} className="lp-card flex h-full flex-col">
              <Quote className="h-5 w-5 text-brand-400" aria-hidden />
              <p className="mt-3 text-base text-ink-800">
                {`„${testimonial.quote}"`}
              </p>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-200/70 pt-4">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-ink-600">{testimonial.role}</p>
                </div>
                <StarRow rating={testimonial.rating} />
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          Beispiel-Stimmen aus der Demo-Welt – keine echten Kund:innen.
          Wir kennzeichnen, sobald wir echte Zitate veröffentlichen dürfen.
        </p>
      </Container>
    </Section>
  );
}
