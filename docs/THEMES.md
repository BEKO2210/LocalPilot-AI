# Themes – LocalPilot AI

Designs sind in LocalPilot AI **Konfiguration**, nicht hartkodiertes CSS.
Pro Betrieb wird ein `Theme` ausgewählt, der `<ThemeProvider>` setzt die
zugehörigen CSS-Variablen auf einem Wrapper, und alle theme-fähigen
Komponenten greifen darauf zu – ohne Client-JavaScript, ohne React Context,
voll kompatibel mit Static Export.

## Live-Galerie

Alle aktuellen Themes sind unter `/themes` zu sehen:

- Lokal: `http://localhost:3000/themes`
- Pages: `https://beko2210.github.io/LocalPilot-AI/themes/`

Die Galerie rendert pro Theme eine kleine Public-Site-Vorschau (Hero-Section
mit Buttons, Bewertungs-Badge, Service-Card) – komplett serverseitig, kein
JavaScript nötig.

## 10 hinterlegte Themes

| Schlüssel             | Label              | Empfohlen für                                                |
| --------------------- | ------------------ | ------------------------------------------------------------ |
| `clean_light`         | Clean Light        | Allrounder – fast alle Branchen, Default                     |
| `premium_dark`        | Premium Dark       | Barber, Foto, Premium-Boutique                               |
| `warm_local`          | Warm Local         | Café, Restaurant, lokaler Shop, familiäre Studios            |
| `medical_clean`       | Medical Clean      | Reinigung, Praxis-nahe Dienste (ohne Heilversprechen)        |
| `beauty_luxury`       | Beauty Luxury      | Kosmetik, Nails, Hair, Boutique                              |
| `automotive_strong`   | Automotive Strong  | Werkstatt, Tuning-Affine, Handwerk mit kantiger Optik        |
| `craftsman_solid`     | Craftsman Solid    | Handwerk, Maler, Elektrik, Garten                            |
| `creative_studio`     | Creative Studio    | Foto, Design, kreative Dienste                               |
| `fitness_energy`      | Fitness Energy     | Personal Trainer, Coaching                                   |
| `education_calm`      | Education Calm     | Fahrschule, Nachhilfe, Bildung                               |

`clean_light` ist das Default. `getThemeOrFallback(undefined)` und Lookups mit
unbekanntem Key liefern es zurück – die Public Site ist nie kaputt.

## Was ein Theme steuert

Aus `ThemeSchema` (`src/core/validation/theme.schema.ts`):

| Feld                     | Wirkung                                                 |
| ------------------------ | ------------------------------------------------------- |
| `colors.*` (10 Farben)   | Primary/Secondary/Accent/Background/Foreground/Muted/Border + Foregrounds. |
| `typography.*`           | Heading- und Body-Schrift, Basis-Größe, Weights, Letter-Spacing. |
| `radius`                 | Globaler Eck-Radius (`none`/`sm`/`md`/`lg`/`xl`/`2xl`). |
| `shadow`                 | Schatten-Stärke (`none`/`subtle`/`soft`/`elevated`).    |
| `sectionStyle`           | Innenabstand für Sektionen (`compact`/`comfortable`/`spacious`). |
| `buttonStyle`            | Form von Buttons (`square`/`rounded`/`pill`).           |
| `cardStyle`              | Form von Cards (`flat`/`outlined`/`soft`/`elevated`).   |
| `suitableForIndustries`  | Welche Branchen passen?                                 |

## Architektur

```
src/core/themes/
  themes/<key>.ts        # Ein Datensatz pro Theme, Zod-validiert beim Laden
  registry.ts            # Lookup, Validierung, Helpers, UnknownThemeError
  theme-resolver.ts      # Theme → CSS-Variablen (Hex → RGB-Triplet, Tokens)
  index.ts               # Barrel

src/components/theme/
  theme-provider.tsx     # Wrapper, der die CSS-Vars per inline style setzt
  theme-preview-card.tsx # Beispiel-Mini-Site für die /themes-Galerie
  index.ts

src/app/themes/page.tsx  # Statische Galerie aller Themes
```

## Programmatischer Zugriff

```ts
import {
  getTheme,
  getThemeOrFallback,
  getAllThemes,
  getThemesForIndustry,
  themeToCssVars,
  hexToRgbTriplet,
  DEFAULT_THEME,
  UnknownThemeError,
} from "@/core/themes";

// Hartes Lookup, wirft bei unbekanntem Key
const theme = getTheme("beauty_luxury");

// Sicheres Lookup mit Fallback (clean_light)
const safeTheme = getThemeOrFallback(business.themeKey);

// Welche Themes passen zu einer Branche?
const photographerThemes = getThemesForIndustry("photographer");

// CSS-Vars selbst erzeugen (z. B. für custom Wrapper)
const styleVars = themeToCssVars(theme);

// Primitiv: Hex → RGB-Triplet für Tailwind-`<alpha-value>`-Syntax
hexToRgbTriplet("#1f47d6"); // "31 71 214"
```

## CSS-Variablen, die der Resolver setzt

Beim Wrap durch `<ThemeProvider>` werden auf dem Wrapper-Element gesetzt:

```
--theme-primary, --theme-primary-fg
--theme-secondary, --theme-secondary-fg
--theme-accent
--theme-background, --theme-foreground
--theme-muted, --theme-muted-fg
--theme-border

--theme-font-heading, --theme-font-body
--theme-font-base-size
--theme-weight-heading, --theme-weight-body
--theme-letter-spacing

--theme-radius
--theme-button-radius
--theme-card-radius
--theme-shadow
--theme-section-padding

--theme-key   /* zur Inspektion in DevTools */
```

Die Default-Werte sind in `src/app/globals.css` im `:root`-Block hinterlegt
(identisch zu `clean_light`). So funktionieren auch Seiten ohne expliziten
ThemeProvider.

## Tailwind-Integration

`tailwind.config.ts` definiert das `theme.*`-Color-Set:

```ts
colors: {
  theme: {
    primary: "rgb(var(--theme-primary) / <alpha-value>)",
    "primary-fg": "rgb(var(--theme-primary-fg) / <alpha-value>)",
    secondary: "rgb(var(--theme-secondary) / <alpha-value>)",
    "secondary-fg": "rgb(var(--theme-secondary-fg) / <alpha-value>)",
    accent: "rgb(var(--theme-accent) / <alpha-value>)",
    background: "rgb(var(--theme-background) / <alpha-value>)",
    foreground: "rgb(var(--theme-foreground) / <alpha-value>)",
    muted: "rgb(var(--theme-muted) / <alpha-value>)",
    "muted-fg": "rgb(var(--theme-muted-fg) / <alpha-value>)",
    border: "rgb(var(--theme-border) / <alpha-value>)",
  },
},
borderRadius: {
  theme: "var(--theme-radius)",
  "theme-button": "var(--theme-button-radius)",
  "theme-card": "var(--theme-card-radius)",
},
boxShadow: {
  theme: "var(--theme-shadow)",
},
```

Damit kann jede Public-Site-Komponente ohne weiteres Setup mit Klassen wie
`bg-theme-primary`, `text-theme-foreground`, `rounded-theme-button`,
`shadow-theme` arbeiten – und Opazität geht über `bg-theme-primary/50`.

## Verwendung im Code

```tsx
import { getThemeOrFallback } from "@/core/themes";
import { ThemeProvider } from "@/components/theme";

export default function PublicSite({ business }: { business: Business }) {
  const theme = getThemeOrFallback(business.themeKey);
  return (
    <ThemeProvider theme={theme}>
      <Hero />
      <Services />
      {/* ... weitere theme-fähige Sektionen ... */}
    </ThemeProvider>
  );
}
```

In den Sektionen dann z. B.:

```tsx
<button className="bg-theme-primary text-theme-primary-fg rounded-theme-button px-5 py-2 shadow-theme">
  Termin anfragen
</button>
```

## Validierung & Konsistenz

Beim ersten Import von `@/core/themes`:

1. Jedes Theme wird via `ThemeSchema.parse(...)` validiert.
2. Die Registry prüft, dass jeder Map-Key zum `theme.key` passt –
   verhindert vertauschte Imports.
3. Smoketest in `src/tests/themes.test.ts` prüft semantische Regeln
   (10 Farb-Tokens, gültiges Hex, RGB-Triplet-Konvertierung,
   Branchenempfehlungen, Default-Verhalten).

## Neues Theme ergänzen (Schritt-für-Schritt)

1. **Schlüssel hinzufügen** – `THEME_KEYS` in `src/types/common.ts`
   um den neuen Key erweitern.
2. **Theme-Datei anlegen** – z. B. `src/core/themes/themes/coastal-fresh.ts`,
   als Vorlage `clean-light.ts` oder `warm-local.ts` nehmen.
3. **Registry erweitern** – Import + Eintrag in `THEME_REGISTRY` in
   `registry.ts`.
4. **Smoketest erweitern** – falls das Theme spezielle Eigenschaften hat,
   Assertion in `src/tests/themes.test.ts` ergänzen.
5. **Doku aktualisieren** – Zeile in der Tabelle oben.

Der Smoketest und der Konsistenz-Check beim Module-Load fangen die
häufigsten Fehler (vertauschte Keys, fehlende Pflichtfelder) sofort ab.

## Beziehung zu anderen Modulen

- **Industry-Presets** (Session 4) listen `recommendedThemes`. Aufrufer
  zeigen diese als Vorauswahl, das Theme ist aber unabhängig wählbar.
- **Public Site** (Session 7) wird `<ThemeProvider>` einsetzen und ihre
  Sektionen mit `bg-theme-*` / `rounded-theme-*` / `shadow-theme` rendern.
- **Dashboard** (Session 9+) wird einen Theme-Picker zeigen, der
  `getAllThemes()` durchläuft.
- **Pakete** (Session 3): `multiple_themes` (Silber) und `premium_themes`
  (Gold) gaten die Auswahl. Bronze nutzt das Default-Theme.

Marketing-Seiten (`/`, `/themes`) verwenden weiterhin die `brand-*`-Palette
und kein Theme – das ist Absicht: LocalPilot-AI selbst hat sein eigenes
Branding, die theme-Tokens sind für Kunden-Sites.
