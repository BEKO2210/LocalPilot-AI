import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const automotiveStrongTheme: Theme = ThemeSchema.parse({
  key: "automotive_strong",
  label: "Automotive Strong",
  description:
    "Bold, technisch, kontrastreich. Für Werkstätten, Fahrzeugdienste und Tuning-affine Betriebe.",
  colors: {
    primary: "#d4392a",
    primaryForeground: "#ffffff",
    secondary: "#1a1d22",
    secondaryForeground: "#f4f4f6",
    accent: "#b88000",
    background: "#f4f4f6",
    foreground: "#1a1d22",
    muted: "#e6e7eb",
    mutedForeground: "#5d6068",
    border: "#8b8d94",
  },
  typography: {
    headingFontFamily: "'Barlow', Inter, ui-sans-serif, system-ui",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui",
    baseFontSize: "16px",
    headingWeight: 700,
    bodyWeight: 400,
    letterSpacing: "tight",
  },
  radius: "md",
  shadow: "elevated",
  sectionStyle: "compact",
  buttonStyle: "square",
  cardStyle: "outlined",
  suitableForIndustries: [
    "auto_workshop",
    "barbershop",
    "craftsman_general",
    "electrician",
  ],
});
