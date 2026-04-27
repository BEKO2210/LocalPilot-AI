# Technical Notes – LocalPilot AI

Architektur-, Stack- und Konventionsentscheidungen. Wird pro Session ergänzt.

## Stack

- **Next.js 15** (App Router, React 19, Server Components default)
- **TypeScript** strict (`noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch` aktiv)
- **Tailwind CSS 3** (mit Custom Brand- und Ink-Paletten, Container, Schatten,
  Radius). Keine Theme-Bindung an eine Branche.
- **clsx + tailwind-merge** über `cn()` (`src/lib/cn.ts`).
- **Lucide Icons** für UI-Symbole.
- **ESLint** über `next lint` (Next + TypeScript Regelsatz).
- **Vercel** als Deployment-Ziel.

- **Zod 3** für Validierung. Schemas in `src/core/validation/`, Typen daraus
  via `z.infer` abgeleitet. Single Source of Truth für Datenmodelle.

Spätere Erweiterungen:

- **React Hook Form** für Formulare (Session 10+).
- **Supabase** für Auth, Datenhaltung, Storage (Session 19).
- Optional **Vitest** für Unit-Tests (`src/tests`).
- Optional **Recharts** für spätere Statistiken (Gold-Paket).

## Verzeichnisstruktur

```
src/
  app/            App Router (Layouts, Routen, route handlers)
  components/     UI-Bausteine (layout, marketing, ui, später dashboard, public-site, …)
  core/           Domänenlogik (pricing, industries, themes, ai, …)
  data/           Mock-Daten
  lib/            Utilities (cn, später supabase, storage, slugify, format)
  types/          TypeScript-Modelle
  tests/          Unit-Tests
docs/             Doku
```

Branchenspezifische Inhalte gehören **niemals** in `src/app` oder `src/components/marketing`,
sondern in `src/core/industries` als `IndustryPreset`.

## Konventionen

### Imports
- Alias `@/*` → `./src/*` (siehe `tsconfig.json`).
- Komponenten: `import { Foo } from "@/components/...";`
- Server Components default; Client Components werden mit `"use client"` markiert.

### Styling
- Tailwind first.
- Wiederkehrende Layout-Container über `Container` und `Section`.
- Custom-Klassen in `globals.css` nur, wenn sie wirklich wiederverwendet werden
  (`lp-container`, `lp-section`, `lp-eyebrow`, `lp-card`).
- Design-Tokens über Tailwind-Theme. Theme-System ab Session 5 ergänzt.

### Komponenten
- Eine Komponente pro Datei.
- Public APIs sind benannte Exports (`export function Foo`).
- Server Components, wo möglich. Interaktivität (z. B. Toggles) ab Session 9+ als Client.

### Sprache
- UI immer Deutsch. Keine Entwicklerbegriffe in der Oberfläche
  ("Anfragestatus" statt "Lead Status", "Text erstellen" statt "Generate Copy").
- Code-Identifier dürfen englisch sein (Konvention im JS-Ökosystem).

### KI-Texte
- Mock-Provider muss ohne API-Key brauchbare Beispieltexte liefern.
- Provider-Auswahl per `AI_PROVIDER` ENV (`mock` | `openai` | `anthropic` | `gemini`).
- Wenn Key fehlt → automatisch Fallback auf `mock`.
- Keine Heilversprechen, keine Rechtsberatung, keine Garantien.

### Branchen-Presets
- Jeder Preset enthält: Leistungen, CTAs, Hero-Texte, FAQ, Leadfelder, Tonalität, Reviews-Vorlagen, Social-Ideen, empfohlene Themes.
- Validierung durch Zod (ab Session 4).

## Routenplan (Zielzustand)

| Route                  | Zweck                                       | Geplant in |
| ---------------------- | ------------------------------------------- | ---------- |
| `/`                    | Marketing-Landingpage LocalPilot AI         | Session 1 ✅ |
| `/marketing`           | optionaler Alias / Subseiten               | Session 8  |
| `/demo`                | Übersicht aller Demo-Betriebe              | Session 6  |
| `/site/[slug]`         | öffentliche Betriebs-Website                | Session 7  |
| `/dashboard`           | Adminbereich (Übersicht)                    | Session 9  |
| `/dashboard/business`  | Betriebsdaten                              | Session 10 |
| `/dashboard/services`  | Leistungen                                  | Session 11 |
| `/dashboard/leads`     | Anfragen                                    | Session 12 |
| `/dashboard/ai`        | KI-Assistent                                | Session 13–17 |
| `/dashboard/reviews`   | Bewertungs-Booster                          | Session 16 |
| `/dashboard/social`    | Social-Media-Generator                      | Session 17 |
| `/dashboard/settings`  | Einstellungen, Slug, Veröffentlichung       | Session 18+ |
| `/api/leads`           | Lead-Erfassung                              | Session 12 |
| `/api/businesses`      | Business-CRUD                               | Session 19 |
| `/api/ai/generate`     | KI-Endpoint                                 | Session 13 |

## Datenmodell-Architektur (ab Session 2)

- **`src/types/common.ts`** ist das einzige Modul, das die String-Literal-Keys
  als `as const`-Tupel definiert (`PACKAGE_TIERS`, `INDUSTRY_KEYS`, `THEME_KEYS`,
  `FEATURE_KEYS`, `LEAD_STATUSES`, …). Daraus werden die Typen
  (`PackageTier = (typeof PACKAGE_TIERS)[number]` usw.) abgeleitet. Wer einen
  neuen Wert ergänzen will, ergänzt ihn nur hier – Schemas und Typen ziehen
  automatisch nach.
- **`src/core/validation/*.schema.ts`** sind die Zod-Schemas und damit die
  Single Source of Truth für die Objektformen (Business, Service, Lead, …).
- **`src/types/*.ts`** re-exportieren die per `z.infer` abgeleiteten Typen.
  Konsumenten importieren bevorzugt aus `@/types`. Drift zwischen Schema und
  Typ ist konstruktionsbedingt nicht möglich.
- **`src/data/mock-types.ts`** definiert das `MockDataset`-Aggregat plus
  `validateMockDataset()`. Die echten Mock-Inhalte folgen in Session 6.
- **`src/tests/schema-validation.test.ts`** parst jedes Schema einmal mit
  realistischen Beispieldaten. Schlägt zur Compile-Zeit (`tsc --noEmit`) und
  zur Laufzeit (`zod.parse`) fehl, falls etwas nicht zusammenpasst.

Konvention für Neuanlagen:

1. Erst Konstanten-Tupel in `types/common.ts` ergänzen, falls neue Keys nötig.
2. Schema in `core/validation/*.schema.ts` schreiben, Typ via `z.infer`.
3. Schlanken Re-Export in `types/<domain>.ts`.
4. Smoketest-Beispiel in `tests/schema-validation.test.ts` ergänzen.

## Pricing-System (ab Session 3)

- **`src/core/pricing/pricing-tiers.ts`** definiert `BRONZE_TIER`,
  `SILBER_TIER`, `GOLD_TIER` als typsichere Datensätze. Vererbung Bronze ⊂
  Silber ⊂ Gold ist explizit modelliert (`SILBER_FEATURES =
  [...BRONZE_FEATURES, ...SILBER_ONLY_FEATURES]`).
- Jeder Datensatz wird beim Module-Load durch `PricingTierSchema.parse(...)`
  geprüft. Falsche FeatureKeys, fehlende Limits oder ungültige Preise
  brechen sofort den Build – Fail-Fast.
- **`feature-helpers.ts`** liefert reine Funktionen (`hasFeature`,
  `isFeatureLocked`, `requiredTierFor`, `getTierLimits`, `isLimitExceeded`,
  `compareTiers`, `isAtLeastTier`, `nextHigherTier`, `formatPrice`,
  `formatLimit`). Keine Seiteneffekte → Server- und Client-Components-tauglich.
- **`feature-labels.ts`** erzwingt über `Record<FeatureKey, FeatureLabel>`,
  dass jede Capability ein deutsches Klartext-Label hat. Ein neuer
  `FeatureKey` ohne Label scheitert sofort am Typecheck.
- **`<PricingGrid>`, `<PricingCard>`, `<FeatureLock>`, `<UpgradeHint>`** in
  `src/components/pricing/` – generisch, sowohl in Marketing als auch im
  späteren Dashboard nutzbar.
- Konvention: Marketingtexte je Stufe gehören in `marketingHighlights`
  (string-Array), die technische Capability-Liste bleibt in `features`
  (`FeatureKey[]`). Damit driften Verkaufstext und Logik nicht.

Konvention für ein neues Feature:

1. Schlüssel in `FEATURE_KEYS` (`src/types/common.ts`) ergänzen.
2. Klartext-Label in `FEATURE_LABELS` (`src/core/pricing/feature-labels.ts`).
3. Capability einer Stufe in `pricing-tiers.ts` zuordnen.
4. Optional: Test-Assertion in `src/tests/pricing-helpers.test.ts`.

## Branchen-Presets (ab Session 4)

- **`src/core/industries/presets/<key>.ts`** – pro Branche genau eine Datei
  mit dem konkreten `IndustryPreset`-Datensatz, validiert beim
  Module-Load via `IndustryPresetSchema.parse(...)`.
- **`preset-helpers.ts`** liefert wiederverwendbare Lead-Felder, CTAs und
  Compliance-Hinweise. Branchen-spezifische Felder leben direkt im Preset.
- **`fallback-preset.ts`** spiegelt einen branchenneutralen Datensatz auf
  einen beliebigen `IndustryKey` – verhindert leere Seiten bei unbekannter
  Branche.
- **`registry.ts`** ist die einzige öffentliche API: `getPreset`,
  `getPresetOrFallback`, `getAllPresets`, `listPresetKeys`,
  `listMissingPresetKeys`, `hasPreset`, `getPresetsForTheme`,
  `UnknownIndustryError`. Beim Module-Load wird zusätzlich geprüft, dass
  jeder Map-Key zum `preset.key` passt – verhindert vertauschte Imports.
- **`src/tests/industry-presets.test.ts`** verifiziert: ≥10 Presets,
  Schema-Validierung, Lead-Pflichtfelder, Bewertungs-Platzhalter,
  Compliance-Hinweise für medizin-/pflegenahe Branchen.

Konvention für ein neues Preset:

1. `INDUSTRY_KEYS` in `src/types/common.ts` ggf. erweitern.
2. Preset-Datei unter `src/core/industries/presets/` erstellen.
3. In `PRESET_REGISTRY` (`registry.ts`) eintragen.
4. Smoketest und `docs/INDUSTRY_PRESETS.md` aktualisieren.

## Deployment (ab Session 3.1 / 4)

- `next.config.mjs` schaltet `output: "export"`, `trailingSlash`, `basePath`
  und `assetPrefix` konditioniert über `STATIC_EXPORT=true` ein.
  `npm run dev` und `npm run build` ohne diese Variable bleiben voll
  SSR-fähig – API-Routen, Server Actions etc. bleiben für Vercel möglich.
- `.github/workflows/deploy.yml` triggert auf `main` und `claude/**`,
  setzt `NEXT_PUBLIC_BASE_PATH=/<repo-name>`, schreibt eine `.nojekyll`
  und deployt mit `actions/deploy-pages@v4`.
- `npm run build:static` für lokale Verifikation.

## Stand nach Session 4

- App Router läuft, `/` rendert Marketing-Landingpage.
- Strict TS aktiv, ESLint vorhanden, Build-Pipeline läuft sauber
  (Static und SSR).
- Tailwind & Brand-Tokens stehen.
- Datenmodelle vollständig, Pricing-System produktiv.
- **13 Branchen-Presets** registriert und validiert.
- **GitHub-Pages-Deployment** automatisiert; lokal über `build:static`.
- Build-Verifikation: `npm run typecheck`, `npm run lint`, `npm run build`,
  `npm run build:static`.

## Offene technische Punkte

- Theme-Registry als konkrete Daten + Resolver (Session 5).
- Mock-Inhalte für Demo-Betriebe (Session 6).
- Public Site Generator unter `/site/[slug]` (Session 7) – wird
  `generateStaticParams` aus den Mock-Daten nutzen, damit Static Export
  weiter funktioniert.
- Dashboard (Session 9+) – sobald Interaktivität nötig, prüfen ob als
  Client-SPA innerhalb des Static Exports ausreichend.
- AI-Provider-Adapter (Session 13). Interface steht.
- Repository-Layer / Mock vs. Supabase (Session 19).
- Vitest-Setup (Session 20). Bis dahin tragen `tsc --noEmit` plus die
  `src/tests/*-helpers.test.ts`-Smoketests die Sicherheit.
- Image-Hosting/-Optimierung (Session 7+).
- Sobald API-Routen oder Server Actions kommen: Vercel als
  Production-Target ergänzen, GitHub Pages bleibt als Showcase.
