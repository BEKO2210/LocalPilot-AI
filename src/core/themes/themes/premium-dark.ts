import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const premiumDarkTheme: Theme = ThemeSchema.parse({
  key: "premium_dark",
  label: "Premium Dark",
  description:
    "Dunkler Look mit warmem Goldakzent. Für Premium-Dienstleistung – Barber, Foto, Boutique.",
  colors: {
    primary: "#f5c542",
    primaryForeground: "#0a0a0a",
    secondary: "#1a1a1a",
    secondaryForeground: "#f5f5f5",
    accent: "#d4af37",
    background: "#0a0a0a",
    foreground: "#f5f5f5",
    muted: "#1c1c1c",
    mutedForeground: "#a0a0a0",
    border: "#2b2b2b",
  },
  typography: {
    headingFontFamily: "'Playfair Display', Inter, serif",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui",
    baseFontSize: "16px",
    headingWeight: 700,
    bodyWeight: 400,
    letterSpacing: "tight",
  },
  radius: "lg",
  shadow: "elevated",
  sectionStyle: "spacious",
  buttonStyle: "pill",
  cardStyle: "elevated",
  suitableForIndustries: ["barbershop", "photographer", "cosmetic_studio"],
});
