import { PublicSection } from "./public-section";
import type { FAQ } from "@/types/faq";

type PublicFaqProps = {
  faqs: readonly FAQ[];
};

export function PublicFaq({ faqs }: PublicFaqProps) {
  const list = [...faqs]
    .filter((f) => f.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (list.length === 0) return null;

  return (
    <PublicSection
      id="faq"
      eyebrow="FAQ"
      title="Häufige Fragen"
    >
      <div
        className="mx-auto max-w-3xl divide-y rounded-theme-card border"
        style={{
          borderColor: "rgb(var(--theme-border))",
          backgroundColor: "rgb(var(--theme-background))",
        }}
      >
        {list.map((faq) => (
          <details key={faq.id} className="group p-6">
            <summary
              className="flex cursor-pointer items-start justify-between gap-4 text-left text-base font-medium"
              style={{ color: "rgb(var(--theme-foreground))" }}
            >
              {faq.question}
              <span
                aria-hidden
                className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border text-sm transition group-open:rotate-45"
                style={{
                  borderColor: "rgb(var(--theme-border))",
                  color: "rgb(var(--theme-muted-fg))",
                }}
              >
                +
              </span>
            </summary>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "rgb(var(--theme-muted-fg))" }}
            >
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </PublicSection>
  );
}
