import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

type Tier = {
  key: "bronze" | "silber" | "gold";
  label: string;
  setup: string;
  monthly: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
};

const TIERS: Tier[] = [
  {
    key: "bronze",
    label: "Bronze",
    setup: "499 € einmalig",
    monthly: "49 € / Monat",
    description: "Saubere digitale Präsenz für kleine Betriebe.",
    features: [
      "Eine öffentliche Website",
      "Branchen-Preset & Basis-Theme",
      "Bis zu 10 Leistungen",
      "Kontaktformular & Bewertungslink",
      "Öffnungszeiten & Maps-Link",
    ],
    ctaLabel: "Bronze anfragen",
  },
  {
    key: "silber",
    label: "Silber",
    setup: "999 € einmalig",
    monthly: "99 € / Monat",
    description: "Echte Arbeitserleichterung mit Dashboard und KI-Texten.",
    features: [
      "Alles aus Bronze",
      "Dashboard für Inhalte & Leads",
      "KI-Texte & Bewertungs-Booster",
      "Social-Media-Postgenerator",
      "Bis zu 30 Leistungen, mehrere Themes",
    ],
    highlighted: true,
    ctaLabel: "Silber anfragen",
  },
  {
    key: "gold",
    label: "Gold",
    setup: "1.999 € einmalig",
    monthly: "199 € / Monat",
    description: "Vollständiges lokales Marketing-System.",
    features: [
      "Alles aus Silber",
      "Mehrere Landingpage-Sektionen",
      "Kampagnen- & Angebots-Generator",
      "Premium-Themes & Mehrsprachigkeit",
      "Bis zu 100 Leistungen, Team-Bereich",
    ],
    ctaLabel: "Gold anfragen",
  },
];

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
            Drei Stufen, klar abgegrenzt. Sie starten klein und wachsen mit Funktionen,
            die Ihrem Betrieb spürbar Arbeit abnehmen.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={cn(
                "flex flex-col rounded-2xl border bg-white p-7 shadow-soft",
                tier.highlighted
                  ? "border-brand-600 ring-2 ring-brand-600/15"
                  : "border-ink-200",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-ink-900">{tier.label}</h3>
                {tier.highlighted ? (
                  <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white">
                    Beliebt
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-ink-600">{tier.description}</p>
              <div className="mt-5 space-y-1">
                <p className="text-2xl font-semibold text-ink-900">{tier.monthly}</p>
                <p className="text-sm text-ink-600">{tier.setup}</p>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-ink-700">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 flex-none text-brand-600"
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <LinkButton
                href="#kontakt"
                variant={tier.highlighted ? "primary" : "outline"}
                className="mt-7"
              >
                {tier.ctaLabel}
              </LinkButton>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-ink-500">
          Alle Preise zzgl. MwSt. Mindestlaufzeit nach Vereinbarung. Platin-Stufe für Automationen, CRM und WhatsApp ist optional verfügbar.
        </p>
      </Container>
    </Section>
  );
}
