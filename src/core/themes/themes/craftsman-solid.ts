import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const craftsmanSolidTheme: Theme = ThemeSchema.parse({
  key: "craftsman_solid",
  label: "Craftsman Solid",
  description:
    "Verlässlich, bodenständig, mit warmem Senfton. Für Handwerk, Bau, Maler und Elektrik.",
  colors: {
    primary: "#275a8c",
    primaryForeground: "#ffffff",
    secondary: "#44382c",
    secondaryForeground: "#faf7f2",
    accent: "#bc8226",
    background: "#faf7f2",
    foreground: "#2b231b",
    muted: "#f0eadc",
    mutedForeground: "#6b5e4a",
    border: "#988d76",
  },
  typography: {
    headingFontFamily: "Inter, ui-sans-serif, system-ui",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui",
    baseFontSize: "16px",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
  },
  radius: "md",
  shadow: "subtle",
  sectionStyle: "comfortable",
  buttonStyle: "square",
  cardStyle: "outlined",
  suitableForIndustries: [
    "craftsman_general",
    "electrician",
    "painter",
    "cleaning_company",
    "garden_landscaping",
  ],
});
