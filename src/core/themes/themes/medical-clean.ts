import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const medicalCleanTheme: Theme = ThemeSchema.parse({
  key: "medical_clean",
  label: "Medical Clean",
  description:
    "Ruhige Türkis-Töne, sehr klar und sachlich. Für Praxis-nahe Dienste, Reinigung und Wellness ohne Heilversprechen.",
  colors: {
    primary: "#2a8a9a",
    primaryForeground: "#ffffff",
    secondary: "#1f4456",
    secondaryForeground: "#ffffff",
    accent: "#4ec0d4",
    background: "#ffffff",
    foreground: "#1c2a32",
    muted: "#eef5f7",
    mutedForeground: "#5b7682",
    border: "#cfdde2",
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
