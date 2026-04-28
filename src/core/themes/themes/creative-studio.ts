import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const creativeStudioTheme: Theme = ThemeSchema.parse({
  key: "creative_studio",
  label: "Creative Studio",
  description:
    "Bold und modern, mit kräftigem Akzent. Für Foto, Design, kreative Dienste.",
  colors: {
    primary: "#8d4ae6",
    primaryForeground: "#ffffff",
    secondary: "#0d0d12",
    secondaryForeground: "#fafafa",
    accent: "#d869a8",
    background: "#fafafa",
    foreground: "#0d0d12",
    muted: "#ececef",
    mutedForeground: "#5a5a66",
    border: "#909096",
  },
  typography: {
    headingFontFamily: "'Space Grotesk', Inter, ui-sans-serif, system-ui",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui",
    baseFontSize: "16px",
    headingWeight: 700,
    bodyWeight: 400,
    letterSpacing: "tight",
  },
  radius: "2xl",
  shadow: "elevated",
  sectionStyle: "spacious",
  buttonStyle: "pill",
  cardStyle: "elevated",
  suitableForIndustries: ["photographer", "restaurant"],
});
