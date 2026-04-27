import { z } from "zod";
import {
  ButtonStyleSchema,
  CardStyleSchema,
  ColorHexSchema,
  IndustryKeySchema,
  SectionStyleSchema,
  ThemeKeySchema,
  ThemeRadiusSchema,
  ThemeShadowSchema,
} from "./common.schema";

export const ThemeColorsSchema = z.object({
  primary: ColorHexSchema,
  primaryForeground: ColorHexSchema,
  secondary: ColorHexSchema,
  secondaryForeground: ColorHexSchema,
  accent: ColorHexSchema,
  background: ColorHexSchema,
  foreground: ColorHexSchema,
  muted: ColorHexSchema,
  mutedForeground: ColorHexSchema,
  border: ColorHexSchema,
});
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;

export const ThemeTypographySchema = z.object({
  headingFontFamily: z.string().min(1).max(120),
  bodyFontFamily: z.string().min(1).max(120),
  baseFontSize: z
    .string()
    .regex(/^\d{2}px$/, "Basis-Schriftgröße als 'NNpx' angeben"),
  headingWeight: z
    .number()
    .int()
    .min(300)
    .max(900),
  bodyWeight: z
    .number()
    .int()
    .min(300)
    .max(900),
  letterSpacing: z.enum(["tight", "normal", "wide"]),
});
export type ThemeTypography = z.infer<typeof ThemeTypographySchema>;

export const ThemeSchema = z.object({
  key: ThemeKeySchema,
  label: z.string().min(2).max(80),
  description: z.string().max(400).default(""),
  colors: ThemeColorsSchema,
  typography: ThemeTypographySchema,
  radius: ThemeRadiusSchema,
  shadow: ThemeShadowSchema,
  sectionStyle: SectionStyleSchema,
  buttonStyle: ButtonStyleSchema,
  cardStyle: CardStyleSchema,
  suitableForIndustries: z.array(IndustryKeySchema).default([]),
});
export type Theme = z.infer<typeof ThemeSchema>;
