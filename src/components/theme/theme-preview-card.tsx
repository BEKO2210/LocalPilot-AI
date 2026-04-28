import { Calendar, Phone, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeProvider } from "./theme-provider";
import type { Theme } from "@/types/theme";

type ThemePreviewCardProps = {
  theme: Theme;
  className?: string;
};

/**
 * Statische Mini-Vorschau eines Public-Site-Heros mit dem gegebenen Theme.
 * Wird in der Theme-Galerie (`/themes`) pro Theme einmal gerendert –
 * vollständig server-rendered, ohne JavaScript.
 */
export function ThemePreviewCard({ theme, className }: ThemePreviewCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft",
        className,
      )}
    >
      {/* Theme-Header mit Metadaten – in der Marketing-Optik, damit die
          Galerie selbst konsistent bleibt. */}
      <header className="flex items-start justify-between gap-3 border-b border-ink-200 bg-ink-50 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Theme
          </p>
          <h3 className="mt-1 text-base font-semibold text-ink-900">
            {theme.label}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-ink-600">
            {theme.description}
          </p>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-mono text-ink-600">
          {theme.key}
        </span>
      </header>

      {/* Live-Vorschau – Theme wird per CSS-Variablen angewendet. */}
      <ThemeProvider theme={theme} as="div" className="p-6">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-theme-button border px-2.5 py-1 text-xs font-medium"
            style={{
              borderColor: "rgb(var(--theme-border))",
              backgroundColor: "rgb(var(--theme-muted))",
              color: "rgb(var(--theme-muted-fg))",
            }}
          >
            <Star className="h-3 w-3" aria-hidden />
            4,9 (132 Bewertungen)
          </span>
        </div>

        <h4 className="lp-theme-heading mt-3 text-2xl">
          Frischer Look. Klare Termine.
        </h4>
        <p className="mt-2 text-sm" style={{ color: "rgb(var(--theme-muted-fg))" }}>
          Beispieltext, wie ihn ein Betrieb mit diesem Design online nutzen würde.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="lp-focus-ring inline-flex items-center gap-1.5 rounded-theme-button px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "rgb(var(--theme-primary))",
              color: "rgb(var(--theme-primary-fg))",
            }}
          >
            <Calendar className="h-4 w-4" aria-hidden />
            Termin anfragen
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-theme-button border px-4 py-2 text-sm font-medium transition-colors"
            style={{
              borderColor: "rgb(var(--theme-border))",
              color: "rgb(var(--theme-foreground))",
              backgroundColor: "transparent",
            }}
          >
            <Phone className="h-4 w-4" aria-hidden />
            Anrufen
          </button>
        </div>

        {/* Beispiel-Card mit Theme-Card-Radius + Schatten */}
        <div
          className="mt-6 rounded-theme-card border p-4 shadow-theme"
          style={{
            borderColor: "rgb(var(--theme-border))",
            backgroundColor: "rgb(var(--theme-muted))",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "rgb(var(--theme-accent))" }}>
            Beispiel-Leistung
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: "rgb(var(--theme-foreground))" }}>
            Damenhaarschnitt
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "rgb(var(--theme-muted-fg))" }}>
            Schnitt inkl. Beratung – ab 39 €
          </p>
        </div>
      </ThemeProvider>

      {/* Tokens-Footer für Devs / Auswahl-UI */}
      <footer className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-ink-200 bg-white px-5 py-3 text-[11px] text-ink-600">
        <span>Radius: <code>{theme.radius}</code></span>
        <span>Shadow: <code>{theme.shadow}</code></span>
        <span>Section: <code>{theme.sectionStyle}</code></span>
        <span>Buttons: <code>{theme.buttonStyle}</code></span>
        <span>Cards: <code>{theme.cardStyle}</code></span>
        <span>Branchen: {theme.suitableForIndustries.length}</span>
      </footer>
    </article>
  );
}
