import { cn } from "@/lib/cn";

type DashboardCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  padding?: "default" | "tight" | "none";
};

/**
 * Standard-Karte fürs Dashboard. Optionaler Titel + Action-Slot
 * (z. B. "Alle ansehen"-Link rechts oben).
 */
export function DashboardCard({
  title,
  description,
  action,
  padding = "default",
  className,
  children,
  ...rest
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200 bg-white shadow-soft",
        className,
      )}
      {...rest}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-ink-200 px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-ink-600">{description}</p>
            )}
          </div>
          {action && <div className="flex-none">{action}</div>}
        </header>
      )}
      <div
        className={cn(
          padding === "default" && "p-5",
          padding === "tight" && "p-3",
          padding === "none" && "",
        )}
      >
        {children}
      </div>
    </div>
  );
}
