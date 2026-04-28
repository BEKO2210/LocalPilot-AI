# Brand-Identity – LocalPilot AI

Visuelle Marke des Produkts. Mark + Wordmark + Brand-
Tokens. Eingeführt in Code-Session 81 (Phase 2).

> Stand 2026-04-28 · Phase 2.

---

## 1) Brand-Mark

Das Mark verbindet drei Bedeutungs-Schichten:

| Element | Bedeutung |
| --- | --- |
| Rounded-Square-Frame (`rect rx=14`) | „Local" – ein verankerter, lokaler Container |
| Chevron + Crossbar (`path` + `line`) | „Pilot" – Kompass-Needle, Direction, Navigation |
| Akzent-Dot top-right (`circle r=3.5`) | „AI" – Beacon / Guide-Star, breaks Symmetrie |

**Design-Entscheidungen** (2026-Trends):

- **Bold-minimal + geometrisch**: 4 Strichelemente, alle in
  `currentColor`, keine Gradients.
- **Adaptive**: `currentColor` macht das Mark theme-aware.
  Helle Surfaces nutzen `text-brand-700`, Dunkle bekämen
  `text-white`.
- **Skalierbar**: stroke-width 4 auf 64×64-Viewbox bleibt
  bei 16 px Favicon noch crisp und bei 512 px OG-Image
  weiterhin balanced. Stroke-Linecap/Linejoin `round`
  vermeidet pixelige Ecken bei kleinen Größen.
- **Kein JS-Runtime**: pure inline-SVG. Kein p5.js
  bundled (würde 1 MB+ Bundle-Bloat bedeuten — siehe
  `algorithmic-art`-Skill-Boundaries).

## 2) Wordmark

Typografie-Hint:

- „**Local**" – `font-medium`
- „**Pilot**" – `font-bold` (Kernverb der Marke)
- „**AI**" – `text-[0.7em] uppercase tracking-widest opacity-70`

Damit hebt sich der Pilot-Kern hervor, AI bleibt diskret im
Hintergrund — entspricht dem 2026-Pattern „custom typo
intervention via stroke-weight".

## 3) Brand-Tokens

Aktuelle Token-Quelle: `tailwind.config.ts` (Brand-Farben)
und `src/app/globals.css` (Theme-CSS-Variablen pro Public-
Site-Theme). Keine separate Brand-Token-Datei nötig — die
Marke ist ein dünner Layer über den Tailwind-Tokens.

### Primärfarbe

| Token | Hex (Default) | Verwendung |
| --- | --- | --- |
| `brand-600` | siehe `tailwind.config.ts` | Mark + Buttons (primary) |
| `brand-700` | dunkler | Wordmark + hover-states |
| `--theme-accent` (CSS-Var) | pro Public-Site-Theme | Mark auf Public-Site |

### Schriften

System-Fonts via Tailwind-Default (`font-sans`). Keine
eigenen Web-Fonts geladen — spart ~80 KB pro Page.

### Spacing

Lockup-Gap: `gap-2` (Mark + Wordmark). Mark-Sizes:
`sm: h-6 w-6`, `md: h-7 w-7`, `lg: h-9 w-9`.

## 4) API

```tsx
import {
  LocalPilotMark,     // nur das Mark (z. B. Footer-Akzent)
  LocalPilotWordmark, // nur das Wordmark (z. B. OG-Image)
  LocalPilotLockup,   // Mark + Wordmark als Link/Span
} from "@/components/brand";

// Standard: clickable Lockup im Header
<LocalPilotLockup className="text-brand-700" size="sm" />

// Footer-Akzent ohne Link
<LocalPilotMark className="h-5 w-5 text-brand-700" aria-hidden />

// Reines Wordmark (z. B. neben einer Headline)
<LocalPilotWordmark className="text-ink-900" />
```

**Defaults**:
- `LocalPilotMark` ist `role="img"` mit `aria-label="LocalPilot AI"`.
- `LocalPilotLockup` setzt `aria-label="LocalPilot AI – Startseite"`,
  rendert als `<Link href="/">` und bringt den `lp-focus-ring`-
  Tastatur-Fokus mit.
- `href={null}` deaktiviert den Link (z. B. für Static-OG-
  Images, wo keine Navigation passieren darf).

## 5) Wo das Mark erscheint

- ✅ **Marketing-Header** (`SiteHeader`): Lockup.
- ✅ **Marketing-Footer** (`SiteFooter`): nur Mark (kompakt).
- ⏳ **OG-Image** (Phase 2 Task): geplant für Session ≥83.
  Mark + Wordmark als 1200×630 PNG via Vercel-OG.
- ⏳ **Favicon**: Mark als `apple-touch-icon` + `icon`-PNG-
  Set. Geplant für Session ≥84.
- ⏳ **Email-Signaturen** (Templates): Phase 4.

## 6) Was NICHT das Mark ist

- ❌ Kein Animation, kein Hover-Effekt auf dem Mark
  selbst — Brand-Konstanz vor Spielerei.
- ❌ Kein Per-Theme-Mark (das Mark bleibt
  „LocalPilot AI"-spezifisch, auch auf Customer-
  Public-Sites). Der Public-Site-Header zeigt das
  KUNDEN-Logo, nicht unseres.
- ❌ Keine Outline-Variante mit Schatten oder 3D-Effekt
  — Bold-minimal-Konvention.

## 7) Quellen / Trends

- [2026 Logo Design Trends (ImagineArt)](https://www.imagine.art/blogs/logo-design-trends-2025) — Geometric Bold-Minimal als 2026-Standard.
- [SaaS Logo Inspiration (eBaqDesign)](https://www.ebaqdesign.com/blog/saas-logos) — Tech-SaaS bevorzugt Mark + Wordmark-Lockup.
- [System-based Brand Design (Shopify)](https://www.shopify.com/blog/logo-trends) — Adaptive Logos, scale-bar, theme-aware.
- [Tech Startup Logos (LogoCrafter)](https://www.logocrafter.app/blog/best-tech-startup-logos) — Compass/Navigation-Motive sind etabliert.

---

## Verwandte Dokumente

- [PROGRAM_PLAN.md](./PROGRAM_PLAN.md) — Phase 2 / Demo-Logo-Slot
- [THEMES.md](./THEMES.md) — Theme-Tokens für Public-Sites
  (orthogonal zur Brand-Identität)
- [TECHNICAL_NOTES.md](./TECHNICAL_NOTES.md) — Architektur-Layer
