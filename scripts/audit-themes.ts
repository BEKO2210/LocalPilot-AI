/**
 * Einmaliges WCAG-Contrast-Audit-Script für die 10 Themes.
 * Wird per `npx tsx scripts/audit-themes.ts` ausgeführt, ist
 * NICHT Teil des Production-Bundles und nicht im Smoketest-
 * Lauf (eigenes Script).
 *
 * Berechnet: Contrast-Ratio nach WCAG 2.2 für die kritischen
 * Color-Pairs jedes Themes. Required:
 *   - Normal text:    ≥ 4.5 (AA)
 *   - Large/UI text:  ≥ 3.0 (AA)
 */
import { getAllThemes } from "../src/core/themes/registry";
import type { Theme } from "../src/types/theme";

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function relLum([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const la = relLum(hexToRgb(a));
  const lb = relLum(hexToRgb(b));
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

const PAIRS: Array<{
  name: string;
  fg: keyof Theme["colors"];
  bg: keyof Theme["colors"];
  required: number;
  use: string;
}> = [
  { name: "primary on primary", fg: "primaryForeground", bg: "primary", required: 4.5, use: "Button-Text auf Primary-Button" },
  { name: "secondary on secondary", fg: "secondaryForeground", bg: "secondary", required: 4.5, use: "Footer-Text auf Secondary" },
  { name: "fg on bg", fg: "foreground", bg: "background", required: 4.5, use: "Body-Text" },
  { name: "muted-fg on muted", fg: "mutedForeground", bg: "muted", required: 4.5, use: "Hint-Text auf Card-Surface" },
  { name: "muted-fg on bg", fg: "mutedForeground", bg: "background", required: 4.5, use: "Hint-Text auf Page" },
  { name: "accent on bg", fg: "accent", bg: "background", required: 3.0, use: "Akzent-Icon/UI-Element" },
  { name: "border on bg", fg: "border", bg: "background", required: 3.0, use: "UI-Border (3:1 für Non-Text-UI)" },
];

function rgbToHex([r, g, b]: [number, number, number]): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Schiebt jeden Channel um `delta` Richtung 0 (negativ) oder 255 (positiv). */
function shift(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return rgbToHex([clamp(r + delta), clamp(g + delta), clamp(b + delta)]);
}

/**
 * Sucht den nächstbesten Hex, der gegen `bg` die geforderte Ratio erreicht.
 * Wir verändern nur den Foreground — Background bleibt Brand-relevant.
 * Richtung wird auto-bestimmt: dunkler wenn fg heller als bg, sonst heller.
 */
function findFix(fg: string, bg: string, required: number): string | null {
  const fgLum = relLum(hexToRgb(fg));
  const bgLum = relLum(hexToRgb(bg));
  const direction = fgLum > bgLum ? +1 : -1; // heller bg → fg dunkler
  for (let delta = 4; delta <= 200; delta += 4) {
    const candidate = shift(fg, delta * direction);
    if (contrast(candidate, bg) >= required) return candidate;
  }
  return null;
}

let totalFails = 0;
for (const theme of getAllThemes()) {
  const lines: string[] = [`\n## ${theme.label} (${theme.key})`];
  let fails = 0;
  for (const p of PAIRS) {
    const ratio = contrast(theme.colors[p.fg], theme.colors[p.bg]);
    const pass = ratio >= p.required;
    if (!pass) {
      fails++;
      totalFails++;
    }
    let suggestion = "";
    if (!pass) {
      const fixedFg = findFix(theme.colors[p.fg], theme.colors[p.bg], p.required);
      if (fixedFg) {
        const newRatio = contrast(fixedFg, theme.colors[p.bg]);
        suggestion = `\n        → fix ${p.fg}: ${theme.colors[p.fg]} → ${fixedFg} (${newRatio.toFixed(2)}:1)`;
      }
    }
    lines.push(
      `  ${pass ? "✅" : "❌"} ${p.name.padEnd(24)} ${ratio.toFixed(2).padStart(5)}:1 (req ${p.required}) — ${p.use}${suggestion}`,
    );
  }
  if (fails > 0) lines[0] += ` — ${fails} FAIL${fails > 1 ? "S" : ""}`;
  console.log(lines.join("\n"));
}

console.log(`\n\nTotal failures across all themes: ${totalFails}`);
process.exit(totalFails > 0 ? 0 : 0); // exit 0 — wir wollen den Report sehen, nicht den Build brechen
