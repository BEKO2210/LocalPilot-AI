import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const medicalCleanTheme: Theme = ThemeSchema.parse({
  key: "medical_clean",
  label: "Medical Clean",
  description:
    "Ruhige Türkis-Töne, sehr klar und sachlich. Für Praxis-nahe Dienste, Reinigung und Wellness ohne Heilversprechen.",
  colors: {
    primary: "#1f6c79",
    primaryForeground: "#ffffff",
    secondary: "#1f4456",
    secondaryForeground: "#ffffff",
    accent: "#2ea0b4",
    background: "#ffffff",
    foreground: "#1c2a32",
    muted: "#eef5f7",
    mutedForeground: "#57727e",
    border: "#87959a",
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
  suitableForIndustries: ["cleaning_company", "wellness_practice"],
});
