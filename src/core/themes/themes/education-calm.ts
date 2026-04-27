import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const educationCalmTheme: Theme = ThemeSchema.parse({
  key: "education_calm",
  label: "Education Calm",
  description:
    "Ruhig und freundlich, mit klarer Lesbarkeit. Für Fahrschule, Nachhilfe, Bildungsanbieter.",
  colors: {
    primary: "#4f6cd1",
    primaryForeground: "#ffffff",
    secondary: "#2c3950",
    secondaryForeground: "#ffffff",
    accent: "#ffba66",
    background: "#f8fafc",
    foreground: "#1c2638",
    muted: "#eef2f7",
    mutedForeground: "#5a6478",
    border: "#cfd6e2",
  },
  typography: {
    headingFontFamily: "Inter, ui-sans-serif, system-ui",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui",
    baseFontSize: "16px",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
  },
  radius: "lg",
  shadow: "subtle",
  sectionStyle: "comfortable",
  buttonStyle: "rounded",
  cardStyle: "outlined",
  suitableForIndustries: ["driving_school", "tutoring"],
});
