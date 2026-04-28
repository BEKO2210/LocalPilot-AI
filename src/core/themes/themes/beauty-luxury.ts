import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const beautyLuxuryTheme: Theme = ThemeSchema.parse({
  key: "beauty_luxury",
  label: "Beauty Luxury",
  description:
    "Soft, sophisticated, mit gedämpftem Rosé. Für Beauty, Nails, Hair und Boutique-Studios.",
  colors: {
    primary: "#a85673",
    primaryForeground: "#ffffff",
    secondary: "#2a1b21",
    secondaryForeground: "#fff9fa",
    accent: "#b97e91",
    background: "#fff9fa",
    foreground: "#2a1b21",
    muted: "#faecf0",
    mutedForeground: "#7a5a64",
    border: "#a48a92",
  },
  typography: {
    headingFontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui",
    baseFontSize: "16px",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "tight",
  },
  radius: "2xl",
  shadow: "soft",
  sectionStyle: "spacious",
  buttonStyle: "pill",
  cardStyle: "soft",
  suitableForIndustries: [
    "cosmetic_studio",
    "nail_studio",
    "hairdresser",
    "photographer",
  ],
});
