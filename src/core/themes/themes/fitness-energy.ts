import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const fitnessEnergyTheme: Theme = ThemeSchema.parse({
  key: "fitness_energy",
  label: "Fitness Energy",
  description:
    "Vital, motivierend, mit Grünton und warmem Akzent. Für Trainer, Studios, Coaches.",
  colors: {
    primary: "#1bb068",
    primaryForeground: "#ffffff",
    secondary: "#0a1f15",
    secondaryForeground: "#ffffff",
    accent: "#f3754f",
    background: "#ffffff",
    foreground: "#0a1f15",
    muted: "#eef7f0",
    mutedForeground: "#56705f",
    border: "#cfe1d4",
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
