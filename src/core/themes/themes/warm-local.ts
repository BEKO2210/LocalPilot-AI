import { ThemeSchema } from "@/core/validation/theme.schema";
import type { Theme } from "@/types/theme";

export const warmLocalTheme: Theme = ThemeSchema.parse({
  key: "warm_local",
  label: "Warm Local",
  description:
    "Warme Erdtöne, familiäre Note. Für Cafés, Restaurants, lokale Shops und persönliche Studios.",
  colors: {
    primary: "#b04438",
    primaryForeground: "#ffffff",
    secondary: "#4a3326",
    secondaryForeground: "#fdf8f3",
    accent: "#d8704f",
    background: "#fdf8f3",
    foreground: "#2b1f15",
    muted: "#f3e8db",
    mutedForeground: "#76634c",
    border: "#9b8b77",
  },
  typography: {
    headingFontFamily: "'Lora', Inter, serif",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui",
    baseFontSize: "17px",
    headingWeight: 600,
    bodyWeight: 400,
    letterSpacing: "normal",
  },
  radius: "2xl",
  shadow: "subtle",
  sectionStyle: "comfortable",
  buttonStyle: "rounded",
  cardStyle: "soft",
  suitableForIndustries: [
    "restaurant",
    "cafe",
    "local_shop",
    "hairdresser",
    "photographer",
    "painter",
  ],
});
