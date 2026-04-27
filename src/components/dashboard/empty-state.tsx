import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "compact";
  className?: string;
};

/**
 * Wiederverwendbarer Leer-Zustand für Dashboard-Bereiche, die noch keine
 * Daten haben (z. B. "Noch keine Anfragen") oder noch nicht ausgebaut sind.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/60 text-center",
        variant === "compact" ? "p-5" : "p-8",
        className,
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "inline-flex flex-none items-center justify-center rounded-full bg-white text-ink-400 shadow-soft",
            variant === "compact" ? "h-9 w-9" : "h-11 w-11",
          )}
        >
          <Icon className={cn(variant === "compact" ? "h-4 w-4" : "h-5 w-5")} aria-hidden />
        </span>
      ) : null}
      <p
        className={cn(
          "font-medium text-ink-800",
          variant === "compact" ? "mt-3 text-sm" : "mt-4 text-base",
        )}
      >
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-ink-500">{description}</p>
      )}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
