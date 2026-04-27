import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type FormSectionProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Visuelle Gruppierung mehrerer Felder im Formular.
 * Eyebrow + Titel + optionale Beschreibung links, Inhalte rechts (md+).
 */
export function FormSection({
  icon: Icon,
  title,
  description,
  className,
  children,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-ink-200 bg-white p-6 shadow-soft md:grid md:grid-cols-3 md:gap-8",
        className,
      )}
    >
      <header className="md:col-span-1">
        <div className="flex items-center gap-2 text-ink-900">
          {Icon ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          ) : null}
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        {description && (
          <p className="mt-2 max-w-xs text-sm text-ink-600">{description}</p>
        )}
      </header>
      <div className="mt-5 space-y-4 md:col-span-2 md:mt-0">{children}</div>
    </section>
  );
}
