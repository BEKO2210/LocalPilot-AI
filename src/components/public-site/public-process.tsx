import { PublicSection } from "./public-section";
import type { PresetProcessStep } from "@/types/industry";

type PublicProcessProps = {
  steps: readonly PresetProcessStep[];
};

export function PublicProcess({ steps }: PublicProcessProps) {
  if (steps.length === 0) return null;

  const sorted = [...steps].sort((a, b) => a.step - b.step);

  return (
    <PublicSection
      id="ablauf"
      eyebrow="Ablauf"
      title="So läuft es ab."
      intro="Klar strukturiert, ohne Überraschungen."
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((step) => (
          <li
            key={step.step}
            className="rounded-theme-card border p-5"
            style={{
              borderColor: "rgb(var(--theme-border))",
              backgroundColor: "rgb(var(--theme-background))",
            }}
          >
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-theme-button text-sm font-bold"
              style={{
                backgroundColor: "rgb(var(--theme-primary))",
                color: "rgb(var(--theme-primary-fg))",
              }}
            >
              {step.step}
            </span>
            <h3 className="lp-theme-heading mt-4 text-lg">{step.title}</h3>
            <p
              className="mt-2 text-sm"
              style={{ color: "rgb(var(--theme-muted-fg))" }}
            >
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </PublicSection>
  );
}
