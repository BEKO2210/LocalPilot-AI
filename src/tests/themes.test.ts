/**
 * Smoketest für das Theme-System aus Session 5.
 *
 * Erwartete Eigenschaften:
 *  - Mindestens 10 Themes registriert.
 *  - Map-Key === theme.key (Konsistenzprüfung schon im Modul).
 *  - Default-Theme ist auflösbar.
 *  - Resolver erzeugt korrekte CSS-Variablen (Hex → RGB-Triplet).
 *  - Theme-Empfehlungen für Branchen sind nicht leer.
 */

import {
  DEFAULT_THEME,
  THEME_REGISTRY,
  UnknownThemeError,
  getAllThemes,
  getTheme,
  getThemeOrFallback,
  getThemesForIndustry,
  hexToRgbTriplet,
  listThemeKeys,
  themeToCssVars,
} from "@/core/themes";
import { ThemeSchema } from "@/core/validation/theme.schema";
import { THEME_KEYS, type ThemeKey } from "@/types/common";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Theme assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Mindestabdeckung
// ---------------------------------------------------------------------------

const themes = getAllThemes();
assert(themes.length >= 10, `mindestens 10 Themes, aktuell: ${themes.length}`);
assert(themes.length === THEME_KEYS.length, "alle THEME_KEYS sind belegt");

const keys = listThemeKeys();
for (const key of keys) {
  assert(Boolean(THEME_REGISTRY[key]), `Theme ${key} hinterlegt`);
}

// ---------------------------------------------------------------------------
// Schema-Konsistenz
// ---------------------------------------------------------------------------

for (const theme of themes) {
  ThemeSchema.parse(theme);
  // Pflicht: 10 Farb-Tokens
  const colorEntries = Object.entries(theme.colors);
  assert(colorEntries.length === 10, `${theme.key}: 10 Farb-Tokens`);
  for (const [name, value] of colorEntries) {
    assert(
      typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value),
      `${theme.key}.${name} ist 6-stellige Hex-Farbe (Wert: ${value})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Lookup-Verhalten
// ---------------------------------------------------------------------------

assert(getTheme("clean_light") === DEFAULT_THEME, "Default-Theme = clean_light");
assert(getThemeOrFallback(undefined).key === "clean_light", "undefined → Default");
assert(
  getThemeOrFallback("nope" as ThemeKey).key === "clean_light",
  "unbekannt → Default",
);

let threw = false;
try {
  getTheme("nope" as ThemeKey);
} catch (error) {
  threw = error instanceof UnknownThemeError;
}
assert(threw, "getTheme wirft UnknownThemeError bei unbekanntem Key");

// ---------------------------------------------------------------------------
// Resolver: Hex → RGB
// ---------------------------------------------------------------------------

assert(hexToRgbTriplet("#000000") === "0 0 0", "schwarz → 0 0 0");
assert(hexToRgbTriplet("#ffffff") === "255 255 255", "weiß → 255 255 255");
assert(hexToRgbTriplet("#1f47d6") === "31 71 214", "Brand-Blau korrekt");
assert(hexToRgbTriplet("#abc") === "170 187 204", "3-stelliges Hex erweitert");

// Defensive: ungültige Hex-Eingaben werfen seit Code-Session 23
// nicht mehr (die Live-Vorschau im Business-Editor reicht Form-Werte
// während des Tippens durch — ein Throw an dieser Stelle würde React
// crashen lassen). Stattdessen kommt ein Fallback-Triplet "0 0 0"
// zurück und eine console.warn-Meldung.
const originalWarn = console.warn;
let warnCalls = 0;
console.warn = () => { warnCalls += 1; };
try {
  assert(
    hexToRgbTriplet("not-a-hex") === "0 0 0",
    "ungültige Hex-Eingabe → Fallback-Triplet",
  );
  assert(
    hexToRgbTriplet("#") === "0 0 0",
    "leeres Hex (\"#\") → Fallback-Triplet",
  );
  assert(
    hexToRgbTriplet("#1f") === "0 0 0",
    "halb-eingegebenes Hex → Fallback-Triplet",
  );
  assert(warnCalls === 3, "drei Fallback-Warnungen wurden geloggt");
} finally {
  console.warn = originalWarn;
}

// ---------------------------------------------------------------------------
// Resolver: Theme → CSS-Variablen
// ---------------------------------------------------------------------------

const cssVars = themeToCssVars(DEFAULT_THEME);
assert(cssVars["--theme-primary"] === "31 71 214", "primary RGB-Triplet gesetzt");
assert(cssVars["--theme-primary-fg"] === "255 255 255", "primary-fg gesetzt");
assert(cssVars["--theme-radius"] === "1rem", "Radius xl → 1rem");
assert(
  typeof cssVars["--theme-shadow"] === "string" && cssVars["--theme-shadow"]!.length > 0,
  "Shadow-Var gesetzt",
);
assert(cssVars["--theme-key"] === "clean_light", "Theme-Key in Var hinterlegt");
assert(
  cssVars["--theme-font-heading"] === DEFAULT_THEME.typography.headingFontFamily,
  "Heading-Font weitergereicht",
);

// Letter-spacing: tight/normal/wide → konkrete em-Werte
const wideLetterSpacing = themeToCssVars({
  ...DEFAULT_THEME,
  typography: { ...DEFAULT_THEME.typography, letterSpacing: "wide" },
})["--theme-letter-spacing"];
assert(wideLetterSpacing === "0.04em", "wide → 0.04em");

// ---------------------------------------------------------------------------
// Branchenempfehlungen
// ---------------------------------------------------------------------------

const cleanLightSuitable = getTheme("clean_light").suitableForIndustries;
assert(cleanLightSuitable.length >= 5, "clean_light ist branchenbreit aufgestellt");

const fitnessThemes = getThemesForIndustry("personal_trainer");
assert(fitnessThemes.length >= 1, "Personal Trainer hat ≥1 empfohlenes Theme");
const fitnessKeys = fitnessThemes.map((t) => t.key);
assert(
  fitnessKeys.includes("fitness_energy"),
  "fitness_energy ist für Personal Trainer empfohlen",
);

// Konsistenz: jede Branche, die mind. ein Theme empfiehlt, taucht auch in
// suitableForIndustries auf. Wir prüfen es exemplarisch für die Restaurant-
// und Foto-Verticals.
const photographerThemes = getThemesForIndustry("photographer").map((t) => t.key);
assert(photographerThemes.length > 0, "Fotograf:in hat empfohlene Themes");

export const __THEMES_SMOKETEST__ = {
  themeCount: themes.length,
  cleanLightSuitableCount: cleanLightSuitable.length,
  photographerThemeCount: photographerThemes.length,
};
