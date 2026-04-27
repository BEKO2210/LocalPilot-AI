import { Check } from "lucide-react";
import { PublicSection } from "./public-section";
import type { PresetBenefit } from "@/types/industry";

type PublicBenefitsProps = {
  benefits: readonly PresetBenefit[];
  title?: string;
};

export function PublicBenefits({
  benefits,
  title = "Warum dieser Betrieb?",
}: PublicBenefitsProps) {
  if (benefits.length === 0) return null;

  return (
    <PublicSection id="vorteile" eyebrow="Vorteile" title={title} surface="muted">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="rounded-theme-card border p-5"
            style={{
              borderColor: "rgb(var(--theme-border))",
              backgroundColor: "rgb(var(--theme-background))",
            }}
          >
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-theme-button"
              style={{
                backgroundColor: "rgb(var(--theme-accent) / 0.18)",
                color: "rgb(var(--theme-accent))",
              }}
            >
              <Check className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="lp-theme-heading mt-4 text-lg">{benefit.title}</h3>
            <p
              className="mt-2 text-sm"
              style={{ color: "rgb(var(--theme-muted-fg))" }}
            >
              {benefit.text}
            </p>
          </article>
        ))}
      </div>
    </PublicSection>
  );
}
