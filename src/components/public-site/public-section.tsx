import { cn } from "@/lib/cn";

type PublicSectionProps = React.HTMLAttributes<HTMLElement> & {
  id?: string;
  /** Fügt ein Eyebrow-Label über der Headline hinzu. */
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** Hintergrund-Variante – `surface` nutzt die Theme-Hintergrundfarbe,
   *  `muted` die `--theme-muted`-Fläche. */
  surface?: "default" | "muted";
  contained?: boolean;
};

/**
 * Theme-aware Sektion für die Public Site.
 * Padding kommt aus `--theme-section-padding`, Schrift aus den Theme-Vars.
 */
export function PublicSection({
  id,
  eyebrow,
  title,
  intro,
  surface = "default",
  contained = true,
  className,
  children,
  ...rest
}: PublicSectionProps) {
  return (
    <section
      id={id}
      className={cn("lp-theme-section", className)}
      style={
        surface === "muted"
          ? {
              backgroundColor: "rgb(var(--theme-muted))",
              color: "rgb(var(--theme-foreground))",
            }
          : undefined
      }
      {...rest}
    >
      <div className={cn(contained && "lp-container")}>
        {(eyebrow || title || intro) && (
          <header className="mx-auto max-w-2xl text-center">
            {eyebrow && (
              <span
                className="inline-flex items-center gap-1 rounded-theme-button border px-3 py-1 text-xs font-medium uppercase tracking-wide"
                style={{
                  borderColor: "rgb(var(--theme-border))",
                  backgroundColor: "rgb(var(--theme-background))",
                  color: "rgb(var(--theme-muted-fg))",
                }}
              >
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="lp-theme-heading mt-4 text-3xl tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {intro && (
              <p
                className="mt-4 text-base"
                style={{ color: "rgb(var(--theme-muted-fg))" }}
              >
                {intro}
              </p>
            )}
          </header>
        )}
        <div className={cn((eyebrow || title || intro) && "mt-12")}>
          {children}
        </div>
      </div>
    </section>
  );
}
