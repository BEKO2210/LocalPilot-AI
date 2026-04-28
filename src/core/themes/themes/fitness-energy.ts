import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const fitnessEnergyTheme: Theme = ThemeSchema.parse({
  key: "fitness_energy",
  label: "Fitness Energy",
  description:
    "Vital, motivierend, mit Grünton und warmem Akzent. Für Trainer, Studios, Coaches.",
  colors: {
    primary: "#077a3f",
    primaryForeground: "#ffffff",
    secondary: "#0a1f15",
    secondaryForeground: "#ffffff",
    accent: "#eb6d47",
    background: "#ffffff",
    foreground: "#0a1f15",
    muted: "#eef7f0",
    mutedForeground: "#56705f",
    border: "#87998c",
  },
  typography: {
    headingFontFamily: "'Manrope', Inter, ui-sans-serif, system-ui",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui",
    baseFontSize: "16px",
    headingWeight: 700,
    bodyWeight: 500,
    letterSpacing: "tight",
  },
  radius: "lg",
  shadow: "soft",
  sectionStyle: "comfortable",
  buttonStyle: "pill",
  cardStyle: "elevated",
  suitableForIndustries: ["personal_trainer"],
});
