/**
 * Wandelt einen Theme-Datensatz in CSS Custom Properties um, die als
 * inline `style` auf einem Wrapper gerendert werden können.
 *
 * Pattern (Stand 2026):
 *   <div style={themeToCssVars(theme)}>...</div>
 *
 * Die so gesetzten Variablen kaskadieren auf alle Kinder, funktionieren in
 * Server Components ohne React Context und sind statisch-export-tauglich
 * (GitHub Pages).
 *
 * Tailwind liest die Variablen über
 *   bg-theme-primary → rgb(var(--theme-primary) / <alpha-value>)
 * (siehe `tailwind.config.ts`).
 */

import type { CSSProperties } from "react";
import type { Theme } from "@/types/theme";

// ---------------------------------------------------------------------------
// Hex → RGB-Triplet ("31 71 214")
// ---------------------------------------------------------------------------

function expandShortHex(hex: string): string {
  // "#abc" → "aabbcc"
  return hex
    .replace(/^#/, "")
    .split("")
    .map((c) => c + c)
    .join("");
}

/**
 * Konvertiert "#1f47d6" → "31 71 214" für die Tailwind-`<alpha-value>`-Syntax
 * `rgb(var(--theme-primary) / <alpha-value>)`.
 */
export function hexToRgbTriplet(hex: string): string {
  const cleaned = hex.replace(/^#/, "");
  const full = cleaned.length === 3 ? expandShortHex(hex) : cleaned;
  if (full.length !== 6) {
    throw new Error(`hexToRgbTriplet: ungültige Hex-Farbe "${hex}"`);
  }
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) {
    throw new Error(`hexToRgbTriplet: ungültige Hex-Farbe "${hex}"`);
  }
  return `${r} ${g} ${b}`;
}

// ---------------------------------------------------------------------------
// Mapping Theme-Felder → CSS-Variablennamen
// ---------------------------------------------------------------------------

const RADIUS_TO_CSS: Record<Theme["radius"], string> = {
  none: "0",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
};

const SHADOW_TO_CSS: Record<Theme["shadow"], string> = {
  none: "none",
  subtle:
    "0 1px 2px 0 rgb(15 19 32 / 0.04), 0 4px 12px -8px rgb(15 19 32 / 0.08)",
  soft:
    "0 1px 2px 0 rgb(15 19 32 / 0.04), 0 8px 24px -12px rgb(15 19 32 / 0.10)",
  elevated:
    "0 2px 4px 0 rgb(15 19 32 / 0.06), 0 16px 32px -16px rgb(15 19 32 / 0.18)",
};

const SECTION_PADDING: Record<Theme["sectionStyle"], string> = {
  compact: "3rem",
  comfortable: "4.5rem",
  spacious: "6rem",
};

const BUTTON_RADIUS: Record<Theme["buttonStyle"], string> = {
  square: "0.25rem",
  rounded: "0.875rem",
  pill: "9999px",
};

const CARD_RADIUS: Record<Theme["cardStyle"], string> = {
  flat: "0.25rem",
  outlined: "0.5rem",
  soft: "1rem",
  elevated: "1.25rem",
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

/**
 * Ergebnis-Typ: Record mit CSS-Custom-Property-Keys (`--theme-primary`),
 * passend für `style={...}`. React akzeptiert den Typ über
 * `CSSProperties & Record<string, string>`.
 */
export type ThemeCssVars = CSSProperties & Record<`--${string}`, string>;

/**
 * Erzeugt die CSS-Variablen für ein Theme – farbe-, typografie-, radius-,
 * schatten- und layoutbezogen.
 */
export function themeToCssVars(theme: Theme): ThemeCssVars {
  const c = theme.colors;
  const t = theme.typography;

  return {
    // -------- Farben (RGB-Triplets für `<alpha-value>`-Modulation) --------
    "--theme-primary": hexToRgbTriplet(c.primary),
    "--theme-primary-fg": hexToRgbTriplet(c.primaryForeground),
    "--theme-secondary": hexToRgbTriplet(c.secondary),
    "--theme-secondary-fg": hexToRgbTriplet(c.secondaryForeground),
    "--theme-accent": hexToRgbTriplet(c.accent),
    "--theme-background": hexToRgbTriplet(c.background),
    "--theme-foreground": hexToRgbTriplet(c.foreground),
    "--theme-muted": hexToRgbTriplet(c.muted),
    "--theme-muted-fg": hexToRgbTriplet(c.mutedForeground),
    "--theme-border": hexToRgbTriplet(c.border),

    // -------- Typografie --------
    "--theme-font-heading": t.headingFontFamily,
    "--theme-font-body": t.bodyFontFamily,
    "--theme-font-base-size": t.baseFontSize,
    "--theme-weight-heading": String(t.headingWeight),
    "--theme-weight-body": String(t.bodyWeight),
    "--theme-letter-spacing":
      t.letterSpacing === "tight"
        ? "-0.01em"
        : t.letterSpacing === "wide"
          ? "0.04em"
          : "0",

    // -------- Layout-Tokens --------
    "--theme-radius": RADIUS_TO_CSS[theme.radius],
    "--theme-button-radius": BUTTON_RADIUS[theme.buttonStyle],
    "--theme-card-radius": CARD_RADIUS[theme.cardStyle],
    "--theme-shadow": SHADOW_TO_CSS[theme.shadow],
    "--theme-section-padding": SECTION_PADDING[theme.sectionStyle],

    // -------- Klartext-Tokens (für Debug / data-Attribute) --------
    "--theme-key": theme.key,
  };
}
