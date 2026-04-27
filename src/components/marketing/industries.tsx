import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  Scissors,
  Wrench,
  SprayCan,
  Sparkles,
  Hammer,
  Car,
  GraduationCap,
  Dumbbell,
  Camera,
  Utensils,
  Store,
  Stethoscope,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type Industry = {
  label: string;
  hint: string;
  icon: LucideIcon;
  /** Optional: Slug eines passenden Demo-Betriebs. */
  demoSlug?: string;
};

const INDUSTRIES: Industry[] = [
  {
    label: "Friseur & Barber",
    hint: "Termine, Preise, Style",
    icon: Scissors,
    demoSlug: "studio-haarlinie",
  },
  {
    label: "Autowerkstatt",
    hint: "Inspektion, Reparatur, TÜV",
    icon: Car,
    demoSlug: "autoservice-mueller",
  },
  {
    label: "Reinigungsfirma",
    hint: "Büro, Treppenhaus, Glas",
    icon: SprayCan,
    demoSlug: "glanzwerk-reinigung",
  },
  {
    label: "Kosmetik & Nails",
    hint: "Behandlungen, Beratung",
    icon: Sparkles,
    demoSlug: "beauty-atelier",
  },
  {
    label: "Handwerk",
    hint: "Maler, Elektrik, Sanitär",
    icon: Hammer,
    demoSlug: "meisterbau-schneider",
  },
  {
    label: "Werkstattservices",
    hint: "Diagnose, Service, Räder",
    icon: Wrench,
  },
  {
    label: "Fahrschule / Nachhilfe",
    hint: "Kurse, Termine, Kontakt",
    icon: GraduationCap,
    demoSlug: "fahrschule-stadtmitte",
  },
  { label: "Fitness & Coaching", hint: "Pakete, Termine, Inhalte", icon: Dumbbell },
  { label: "Fotografie", hint: "Pakete, Anfrage, Galerie", icon: Camera },
  { label: "Gastronomie & Café", hint: "Speisekarte, Reservierung", icon: Utensils },
  { label: "Lokale Shops", hint: "Sortiment, Lage, Anfrage", icon: Store },
  { label: "Praxisnahe Dienste", hint: "Neutrale Beschreibung", icon: Stethoscope },
];

export function IndustriesGrid() {
  return (
    <Section id="branchen" bg="muted">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="lp-eyebrow">Branchen</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Vorlagen für viele lokale Betriebe.
          </h2>
          <p className="mt-4 text-ink-600">
            LocalPilot AI ist branchenneutral. Jede Branche bekommt ein eigenes Preset:
            passende Texte, Leistungen, Formularfelder und Tonalität. Karten mit
            Pfeil führen direkt zu einer Live-Demo.
          </p>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map(({ label, hint, icon: Icon, demoSlug }) => {
            const className =
              "flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-4 transition-shadow";
            const inner = (
              <>
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-ink-900 text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{label}</p>
                  <p className="text-xs text-ink-600">{hint}</p>
                </div>
                {demoSlug ? (
                  <ArrowRight
                    className="h-4 w-4 text-brand-600 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                ) : null}
              </>
            );

            return demoSlug ? (
              <Link
                key={label}
                href={`/site/${demoSlug}`}
                className={`group ${className} hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600`}
              >
                {inner}
              </Link>
            ) : (
              <div key={label} className={className}>
                {inner}
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-ink-500">
          Über 20 weitere Branchen sind über die Preset-Architektur ergänzbar.
        </p>
      </Container>
    </Section>
  );
}
