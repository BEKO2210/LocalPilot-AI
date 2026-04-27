import { Tag } from "lucide-react";
import { PublicSection } from "./public-section";
import type { Service } from "@/types/service";

type PublicServicesProps = {
  services: readonly Service[];
};

export function PublicServices({ services }: PublicServicesProps) {
  // Nur aktive Leistungen, sortiert nach `sortOrder`.
  const list = [...services]
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (list.length === 0) return null;

  return (
    <PublicSection
      id="leistungen"
      eyebrow="Leistungen"
      title={`${list.length} Leistungen im Angebot.`}
      intro="Klar beschrieben, mit Preis-Hinweis. Falls etwas Besonderes nötig ist – einfach anfragen."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((service) => (
          <article
            key={service.id}
            className="flex flex-col rounded-theme-card border p-5 shadow-theme transition-shadow hover:shadow-md"
            style={{
              borderColor: "rgb(var(--theme-border))",
              backgroundColor: "rgb(var(--theme-background))",
              color: "rgb(var(--theme-foreground))",
            }}
          >
            {service.category && (
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "rgb(var(--theme-accent))" }}
              >
                {service.category}
              </p>
            )}
            <h3 className="lp-theme-heading mt-1 text-lg">{service.title}</h3>
            {service.shortDescription && (
              <p
                className="mt-2 text-sm"
                style={{ color: "rgb(var(--theme-muted-fg))" }}
              >
                {service.shortDescription}
              </p>
            )}

            <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
              <div>
                {service.priceLabel && (
                  <p className="text-base font-semibold">{service.priceLabel}</p>
                )}
                {service.durationLabel && (
                  <p
                    className="text-xs"
                    style={{ color: "rgb(var(--theme-muted-fg))" }}
                  >
                    {service.durationLabel}
                  </p>
                )}
              </div>
              {service.isFeatured && (
                <span
                  className="inline-flex items-center gap-1 rounded-theme-button px-2 py-1 text-[10px] font-medium uppercase tracking-wide"
                  style={{
                    backgroundColor: "rgb(var(--theme-accent) / 0.15)",
                    color: "rgb(var(--theme-accent))",
                  }}
                >
                  <Tag className="h-3 w-3" aria-hidden />
                  Beliebt
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </PublicSection>
  );
}
