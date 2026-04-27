"use client";

import { Eye, MapPin, Phone, Star } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { ThemeProvider } from "@/components/theme";
import { getThemeOrFallback } from "@/core/themes";
import { hexToRgbTriplet } from "@/core/themes/theme-resolver";
import type { BusinessProfile } from "@/core/validation/business-profile.schema";
import type { Theme } from "@/types/theme";
import type { CSSProperties } from "react";

/**
 * Strenge Validierung für Hex-Farben (gleiches Muster wie
 * `ColorHexSchema`). Wir müssen das hier inline prüfen, weil die
 * Live-Vorschau auf jeden Tastendruck reagiert — der Form-Wert
 * durchläuft also kein Zod-Schema, bevor er ins Theme wandert.
 */
const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
function isValidHex(input: string | undefined | null): input is string {
  return typeof input === "string" && HEX_PATTERN.test(input);
}

/**
 * Live-Vorschau: zeigt Hero + zwei Kontakt-Buttons mit den aktuellen
 * Form-Werten. Reagiert auf jede Änderung von Name, Tagline,
 * Theme oder Farb-Override.
 */
export function BusinessEditPreview() {
  const { control } = useFormContext<BusinessProfile>();

  const watched = useWatch({
    control,
    // Komplettes Profil – akzeptabel, der Preview ist client-side leichtgewichtig.
  });

  const profile = watched as Partial<BusinessProfile>;
  const baseTheme = getThemeOrFallback(profile.themeKey);
  const themeWithOverrides = applyColorOverrides(baseTheme, profile);

  const safeName = (profile.name ?? "").trim() || "Mein Betrieb";
  const safeTagline =
    ((profile.tagline ?? "").trim() || "Tagline erscheint hier.").replace(
      /\{\{city\}\}/g,
      profile.address?.city ?? "Ihrer Stadt",
    );

  const phone = profile.contact?.phone;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft">
      <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-ink-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-ink-500" aria-hidden />
          <p className="text-sm font-semibold text-ink-900">Live-Vorschau</p>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-wide text-ink-500">
          {profile.themeKey ?? "clean_light"}
        </p>
      </header>

      <ThemeProvider theme={themeWithOverrides} as="div" className="p-6">
        <span
          className="inline-flex items-center gap-1.5 rounded-theme-button border px-2.5 py-1 text-xs font-medium"
          style={{
            borderColor: "rgb(var(--theme-border))",
            backgroundColor: "rgb(var(--theme-muted))",
            color: "rgb(var(--theme-muted-fg))",
          }}
        >
          <Star className="h-3 w-3" aria-hidden />
          Vorschau
        </span>

        <h3 className="lp-theme-heading mt-3 text-2xl">{safeName}</h3>
        <p className="mt-1 text-sm" style={{ color: "rgb(var(--theme-muted-fg))" }}>
          {safeTagline}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-theme-button px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: "rgb(var(--theme-primary))",
              color: "rgb(var(--theme-primary-fg))",
            }}
          >
            Termin anfragen
          </span>
          {phone ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-theme-button border px-4 py-2 text-sm font-medium"
              style={{
                borderColor: "rgb(var(--theme-border))",
                color: "rgb(var(--theme-foreground))",
              }}
            >
              <Phone className="h-4 w-4" aria-hidden />
              Anrufen
            </span>
          ) : null}
        </div>

        <div
          className="mt-5 flex items-center gap-2 text-xs"
          style={{ color: "rgb(var(--theme-muted-fg))" }}
        >
          <MapPin className="h-3 w-3" aria-hidden />
          {(profile.address?.street ?? "Straße").trim() || "Straße"} ·{" "}
          {(profile.address?.postalCode ?? "PLZ").trim() || "PLZ"}{" "}
          {(profile.address?.city ?? "Stadt").trim() || "Stadt"}
        </div>
      </ThemeProvider>

      <p className="border-t border-ink-200 bg-white px-5 py-3 text-[11px] text-ink-500">
        Die echte Public Site liegt unter <code>/site/&lt;slug&gt;/</code> –
        diese Vorschau zeigt nur die Hero-Sektion mit Ihren Live-Werten.
      </p>
    </div>
  );
}

/**
 * Wendet (optionale) Farb-Override aus dem Profil auf das Theme an.
 *
 * Die Vorschau reagiert live auf Form-Eingaben. Während der Nutzer
 * eine Farbe tippt (`#`, `#1`, `#1f`, …), durchlaufen die Zwischen-
 * werte **kein** Zod-Schema. Würden wir sie ungeprüft an
 * `themeToCssVars` reichen, würde `hexToRgbTriplet` werfen und die
 * Vorschau crasht beim nächsten Rerender mit „Application error".
 *
 * Lösung: Override nur übernehmen, wenn die Eingabe ein vollständig
 * gültiges Hex-Format hat. Sonst bleibt die Basis-Farbe stehen — die
 * Vorschau sieht dann eben „eine Tippstelle lang" unverändert aus,
 * statt komplett zu sterben.
 */
function applyColorOverrides(
  base: Theme,
  profile: Partial<BusinessProfile>,
): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: isValidHex(profile.primaryColor)
        ? profile.primaryColor
        : base.colors.primary,
      secondary: isValidHex(profile.secondaryColor)
        ? profile.secondaryColor
        : base.colors.secondary,
      accent: isValidHex(profile.accentColor)
        ? profile.accentColor
        : base.colors.accent,
    },
  };
}

// Re-export für Tests / Storybook später.
export const __TEST_HELPERS__ = { applyColorOverrides, hexToRgbTriplet };

// CSSProperties-Re-Export, damit der Tree-Shaker zufrieden ist
// (wir nutzen ihn implizit über style-Props).
export type _PreviewStyle = CSSProperties;
