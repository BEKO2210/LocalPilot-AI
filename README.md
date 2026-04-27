# LocalPilot AI

**Universelles KI-Website-, Lead- und Automationssystem für lokale Betriebe.**

LocalPilot AI ist ein White-Label-fähiges Micro-SaaS-Produkt: ein Core-System,
viele Branchen-Presets, mehrere Themes und drei Paketstufen (Bronze, Silber, Gold).
Es richtet sich an kleine und mittlere lokale Betriebe – vom Friseur über die
Autowerkstatt bis zur Reinigungsfirma – und ist im Kern bewusst branchenneutral.

> Sprache: Deutsch zuerst, später mehrsprachig.
> Zielmarkt: kleine bis mittlere lokale Betriebe in DACH.

---

## Was kann das System (Zielbild)

- Moderne, mobil starke Website pro Betrieb (`/site/[slug]`)
- Dashboard für Inhalte, Leistungen, Leads, Bewertungen, Social Media
- KI-Texte mit austauschbarem Provider (Mock, OpenAI, Anthropic, Gemini)
- Bewertungs-Booster (WhatsApp/SMS/E-Mail-Vorlagen)
- Social-Media-Generator (Instagram, Facebook, Google Business)
- Lead-Verwaltung mit branchenspezifischen Formularfeldern
- Bronze/Silber/Gold-Pakete als echte Produktlogik (Feature-Locks im UI)
- Branchen-Presets (Friseur, Werkstatt, Reinigung, Kosmetik, Handwerk, Fahrschule, Fitness, Foto, Restaurant, Shop, …)

Aktueller Stand: **Session 11** – Services-Editor mit `useFieldArray`, Sortierung, Paket-Limit-Indikator, „Aus Preset übernehmen"-Import, Inline-Bestätigung beim Entfernen und localStorage-Mock-Store unter `/dashboard/[slug]/services`.
Weitere Funktionen folgen in den Sessions 12–22 (siehe `Claude.md` und `docs/RUN_LOG.md`).

---

## Tech-Stack

- **Next.js 15** mit App Router
- **TypeScript** im strict-Mode (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- **Tailwind CSS** für das Styling
- **Lucide Icons**
- **Zod 3** für Datenvalidierung – Schemas in `src/core/validation/`, Typen via
  `z.infer` daraus abgeleitet (Single Source of Truth, kein Drift möglich)
- Spätere Erweiterung: Supabase (Auth, DB, Storage), React Hook Form, AI-Provider-Adapter
- Deployment-Ziel: **Vercel**

---

## Lokale Einrichtung

Voraussetzungen:

- Node.js **20.x oder 22.x**
- npm 10+

```bash
# Repo geklont? Dann:
npm install
cp .env.example .env.local   # Werte können erstmal leer bleiben
npm run dev
```

Der Dev-Server läuft anschließend unter [http://localhost:3000](http://localhost:3000).

### Wichtige Skripte

| Befehl                | Zweck                                                          |
| --------------------- | -------------------------------------------------------------- |
| `npm run dev`         | Lokaler Dev-Server (Hot Reload).                               |
| `npm run build`       | Production-Build (mit SSR, für Vercel-Deploys).                |
| `npm run build:static`| Static-Export-Build nach `out/` (für GitHub Pages).            |
| `npm run start`       | Production-Build starten.                                      |
| `npm run lint`        | ESLint (Next.js + TypeScript Regeln).                          |
| `npm run typecheck`   | TypeScript-Typenprüfung ohne Emit.                             |

### Ohne API-Key starten

LocalPilot AI ist **mock-first**: Ohne API-Key läuft das System automatisch im
Mock-Modus. KI-Provider (OpenAI, Anthropic, Gemini) sind über `AI_PROVIDER` in
`.env.local` umschaltbar (siehe `.env.example`). Der eigentliche Provider-Code
folgt ab Session 13.

---

## Projektstruktur

```
src/
  app/                 Next.js App Router (Layouts, Routen)
    page.tsx           Marketing-Landingpage
    layout.tsx         Root-Layout (Metadata, globale Styles)
    globals.css        Tailwind + Basis-Styles
    marketing/         spätere Marketing-Unterseiten
    demo/              Demo-Betriebe (Session 6+)
    dashboard/         Adminbereich (Session 9+)
    site/[slug]/       öffentliche Betriebs-Websites (Session 7+)
    api/               Route Handler (Session 12+)
  components/
    layout/            Header, Footer, Navigation
    marketing/         Sektionen der Landingpage
    ui/                wiederverwendbare Primitive (Button, Container, Section)
    public-site/       13 Sektionskomponenten der Public Sites (Session 7 ✅)
    pricing/           PricingCard, PricingGrid, FeatureLock (Session 3 ✅)
    theme/             ThemeProvider, ThemePreviewCard (Session 5 ✅)
    dashboard/         Dashboard-Bausteine (Session 9+)
    forms/, industry/, ai/, leads/, reviews/, social/  → folgen
  core/
    validation/        Zod-Schemas (Session 2 ✅) – Single Source of Truth
    pricing/           PricingTier-Konfiguration + Helper (Session 3 ✅)
    industries/        13 Branchen-Presets + Registry (Session 4 ✅)
    themes/            10 Themes + Resolver + Registry (Session 5 ✅)
    ai/                Provider-Implementierungen, Prompts (Session 13+)
    leads/, reviews/, social/, utils/  → folgen
  data/
    mock-types.ts      Plan der Mock-Datenstruktur (Session 2 ✅)
    mock-helpers.ts    Slug-/ID-/Datums-Helper (Session 6 ✅)
    businesses/        6 Demo-Betriebe (Session 6 ✅)
    mock-{businesses,services,reviews,leads,dataset}.ts (Session 6 ✅)
  lib/                 cn(), Supabase-Client, Storage-Helper
  types/               TypeScript-Modelle (Session 2 ✅) – per z.infer aus Schemas
  tests/               Unit-Tests / Schema-Smoketest (Session 2 ✅, Vitest folgt)
docs/
  PRODUCT_STRATEGY.md
  TECHNICAL_NOTES.md
  RUN_LOG.md
  (INDUSTRY_PRESETS.md, PRICING.md, DEPLOYMENT.md, SALES.md, … folgen)
```

Branchenspezifisches gehört **nie** in den Core, sondern in Presets / Konfigurationen / Templates.

---

## Branchenneutralität (Grundprinzip)

LocalPilot AI darf nie auf eine Branche hartcodiert sein:

- Inhalte, Felder, CTAs und Tonalität kommen aus `IndustryPreset`-Konfigurationen.
- Designs kommen aus dem Theme-System.
- Pakete steuern verfügbare Funktionen.
- Eine neue Branche muss in unter 30 Minuten ergänzbar sein.

---

## Pakete (Bronze · Silber · Gold)

Die Pakete sind **Produktlogik**, kein reiner Marketing-Text. Im Code werden
sie ab Session 3 als `PricingTier`-Konfiguration mit Feature-Limits eingebaut.

| Paket    | Setup     | Monatlich | Zielgruppe                                     |
| -------- | --------- | --------- | ---------------------------------------------- |
| Bronze   | 499 €     | 49 €      | Kleinbetrieb, schnelle digitale Präsenz        |
| Silber   | 999 €     | 99 €      | KI-Texte, Dashboard, Lead- & Bewertungssystem  |
| Gold     | 1.999 €   | 199 €     | Vollständiges lokales Marketing-System         |
| Platin*  | ab 2.999 €| 299–599 € | Automationen, CRM, WhatsApp – optional, später |

\* Platin ist optional und wird später ergänzt.

Details: [`docs/PRICING.md`](./docs/PRICING.md).

Programmatischer Zugriff auf das Pricing-System:

```ts
import { hasFeature, isFeatureLocked, getTierLimits, formatPrice } from "@/core/pricing";

hasFeature(business.packageTier, "ai_website_text");        // boolean
isFeatureLocked(business.packageTier, "ai_campaign_generator"); // boolean
getTierLimits(business.packageTier).maxServices;             // number
formatPrice(499);                                            // "499 €"
```

Im UI wickeln `<PricingGrid>`, `<FeatureLock>` und `<UpgradeHint>` aus
`@/components/pricing` die Marketing- und Dashboard-Darstellung ab.

---

## Live-Preview / Deployment

Bei jedem Push auf `main` oder `claude/**` deployt der Workflow
`.github/workflows/deploy.yml` die Seite automatisch nach **GitHub Pages**:

```
https://beko2210.github.io/LocalPilot-AI/
```

Einmaliger Setup-Schritt im GitHub-Repo: **Settings → Pages → Source → GitHub Actions**.
Vollständige Anleitung inkl. Vercel-Pfad: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Dokumentation

- [`Claude.md`](./Claude.md) – Master-Briefing (Single Source of Truth)
- [`docs/PRODUCT_STRATEGY.md`](./docs/PRODUCT_STRATEGY.md) – Vision, Zielgruppen, Pakete, Akzeptanz
- [`docs/TECHNICAL_NOTES.md`](./docs/TECHNICAL_NOTES.md) – Architektur, Konventionen, Stack
- [`docs/PRICING.md`](./docs/PRICING.md) – Pricing-System, Feature-Locks, Helper-API
- [`docs/INDUSTRY_PRESETS.md`](./docs/INDUSTRY_PRESETS.md) – Branchen-Presets, Registry, Compliance
- [`docs/THEMES.md`](./docs/THEMES.md) – Theme-System, CSS-Variablen, Tailwind-Integration
- [`docs/MOCK_DATA.md`](./docs/MOCK_DATA.md) – Demo-Betriebe, Aggregation, Daten-Hygiene
- [`docs/PUBLIC_SITE.md`](./docs/PUBLIC_SITE.md) – Public Site Generator, Sektionen, SEO
- [`docs/MARKETING.md`](./docs/MARKETING.md) – Marketing-Funnel, /pricing-Aufbau, Konversionspfad
- [`docs/DASHBOARD.md`](./docs/DASHBOARD.md) – Dashboard-Routen, Sidebar/Mobile-Nav, Sub-Page-Vorschau
- [`docs/BUSINESS_EDITOR.md`](./docs/BUSINESS_EDITOR.md) – Business-Editor, RHF + Zod, Mock-Store, Live-Preview
- [`docs/SERVICES_EDITOR.md`](./docs/SERVICES_EDITOR.md) – Services-Editor, useFieldArray, Sortierung, Paket-Limits
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) – GitHub Pages und Vercel
- [`docs/RUN_LOG.md`](./docs/RUN_LOG.md) – Was wurde in welcher Session gebaut?
- [`CHANGELOG.md`](./CHANGELOG.md) – Versionshistorie

---

## Status (nach Session 3)

- ✅ Projekt läuft mit `npm run dev` lokal
- ✅ Marketing-Startseite mit Hero, Problem, Lösung, Branchen, Pakete, Vorteile, FAQ, Kontakt-CTA
- ✅ Branchenneutrales Layout, Mobile First, deutsche Sprache
- ✅ Ordnerstruktur und Doku vorbereitet
- ✅ Datenmodelle (Business, Service, Lead, Review, FAQ, IndustryPreset, Theme,
  PricingTier, AI) als Zod-Schemas + per `z.infer` abgeleitete TS-Typen
- ✅ Zentrales `common.ts` mit allen branchenneutralen String-Literal-Keys
- ✅ Schema-Smoketest in `src/tests/schema-validation.test.ts` (verhindert Drift)
- ✅ **Pricing-System** Bronze/Silber/Gold als Code-Konfiguration mit
  Feature-Locks (`<FeatureLock>`, `<UpgradeHint>`) und Helpers
  (`hasFeature`, `requiredTierFor`, `isLimitExceeded`, `formatPrice`)
- ✅ Marketing-Pricing-Sektion ist jetzt config-driven
- ✅ **13 Branchen-Presets** + Registry (`getPreset`, `getPresetOrFallback`,
  `listPresetKeys`, `listMissingPresetKeys`) + Fallback-Preset
- ✅ **10 Themes** mit CSS-Variablen-Resolver, `<ThemeProvider>` (server-component-tauglich)
  und Live-Galerie unter `/themes`
- ✅ **6 Demo-Betriebe** vollständig validiert, alle drei Pakete + 6 Themes,
  Live-Übersicht unter `/demo`
- ✅ **Public Site Generator** unter `/site/[slug]` mit 13 themed Sektionen,
  Mobile-CTA-Bar, business-spezifischer SEO und 6 statisch prerenderten Slugs
- ✅ **Marketing-Funnel** auf der Startseite (11-Schritt-Funnel), eigene
  `/pricing`-Seite mit Feature-Vergleichsmatrix und Limits-Tabelle,
  Live-Demo-Showcase, Beispiel-Stimmen, ROI-Sektion
- ✅ **Dashboard-Grundstruktur** unter `/dashboard/[slug]` mit Sidebar +
  Mobile-Nav, Übersicht und 7 Sub-Routen
- ✅ **Business-Editor** unter `/dashboard/[slug]/business` mit
  React-Hook-Form + Zod, 6 Sektionen, Live-Themed-Preview,
  localStorage-Mock-Store
- ✅ **Services-Editor** unter `/dashboard/[slug]/services` mit
  `useFieldArray`, Sortier-Pfeilen, Paket-Limit-Indikator,
  „Aus Preset übernehmen", Inline-Bestätigung beim Entfernen
- ✅ **GitHub-Pages-Deployment** über Workflow `.github/workflows/deploy.yml`
  mit konditionellem Static-Export
- ⏳ Lead-System, KI – folgen in Sessions 12 bis 22
