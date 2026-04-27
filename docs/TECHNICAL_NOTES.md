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

## Theme-System (ab Session 5)

- **`src/core/themes/themes/<key>.ts`** – ein Datensatz pro Theme,
  Zod-validiert beim Module-Load. 10 Themes ausgeliefert
  (`clean_light` als Default).
- **`theme-resolver.ts`** wandelt Themes in CSS-Variablen für inline
  `style`. Hex → RGB-Triplet (`"31 71 214"`) für Tailwind-`<alpha-value>`-
  Syntax.
- **`registry.ts`**: `THEME_REGISTRY`, `DEFAULT_THEME`, `getTheme`,
  `getThemeOrFallback`, `getAllThemes`, `getThemesForIndustry`,
  `UnknownThemeError`. Konsistenz-Check beim Laden.
- **`<ThemeProvider>`** ist Server-Component-tauglich – kein Context, kein
  useEffect, kein Client-JS. Pattern (Stand 2026): inline `style` mit
  Custom Properties, kaskadiert auf alle Kinder.
- **Tailwind-Integration**: `theme.*`-Color-Set, `borderRadius.theme*`,
  `boxShadow.theme`, `fontFamily.theme-heading|body`. Alle nutzen die
  CSS-Vars und sind opazitäts-tauglich (`bg-theme-primary/50`).
- **`globals.css`** setzt Default-Theme im `:root`, sodass Seiten ohne
  expliziten Provider die Theme-Klassen trotzdem nutzen können (fallen auf
  `clean_light`-Werte zurück).
- **Static-Export-Kompatibilität** ist gewahrt – `/themes` rendert
  serverseitig, kein Client-JS für die Galerie nötig.
- **Smoketest** in `src/tests/themes.test.ts`.

Konvention für ein neues Theme:

1. `THEME_KEYS` in `src/types/common.ts` ergänzen.
2. Theme-Datei in `src/core/themes/themes/` anlegen, Zod-Validierung läuft
   automatisch beim Import.
3. In `THEME_REGISTRY` (`registry.ts`) eintragen.
4. Smoketest und `docs/THEMES.md` aktualisieren.

## Mock-Daten (ab Session 6)

- Architektur „fat aggregate": pro Demo-Betrieb eine Datei unter
  `src/data/businesses/<slug>.ts`, validiert beim Module-Load via
  `BusinessSchema.parse(...)`.
- `mock-helpers.ts`: stabile ID-Generatoren (`makeBusinessId`,
  `makeServiceId`, …), `MOCK_NOW`-Konstante (reproduzierbare Builds),
  `daysAgo()`, `buildOpeningHours()` (kompakte Schreibweise).
- `mock-businesses.ts` aggregiert + Slug-Index + Konsistenz-Check.
- `mock-services.ts`/`mock-reviews.ts` ziehen flache Listen aus den
  Aggregaten (keine Duplizierung).
- `mock-leads.ts` enthält 25 Leads, jeder validiert.
- `mock-dataset.ts` validiert das gesamte `MockDataset` und prüft
  Lead → existierender Betrieb.
- `/demo`-Page importiert `@/data` – Validierung läuft beim Build, nicht
  erst zur Laufzeit.
- Smoketest `src/tests/mock-data.test.ts` mit 30+ Assertions
  (Diversität, eindeutige IDs, Paket-Limits, Status-Mix, Daten-Hygiene).

Konvention für einen neuen Demo-Betrieb:

1. `src/data/businesses/<slug>.ts` mit `BusinessSchema.parse(...)` umrahmen.
2. Import + Eintrag in `mock-businesses.ts`.
3. Optional: 3–5 Leads in `mock-leads.ts`.
4. `npm run typecheck` / `npm run build` führen die Validierung automatisch aus.

## Public Site (ab Session 7)

- Route `/site/[slug]` mit `generateStaticParams(listMockBusinessSlugs())` –
  Build:static prerendered alle 6 Slugs als HTML.
- `generateMetadata` pro Business: Title, Description, OG, Canonical –
  alles aus dem Datensatz, keine Branchen-Hardcodierung.
- `<ThemeProvider>` wrappt jede Public Site → CSS-Variablen kaskadieren
  durch alle Sektionen (`bg-theme-primary`, `rounded-theme-button`,
  `shadow-theme`).
- 13 Sektionskomponenten unter `src/components/public-site/`:
  Hero, Services, Benefits, Process, Reviews, FAQ, Team, Contact,
  OpeningHours, Location + Header, Footer, MobileCtaBar +
  `<PublicSection>` Wrapper.
- Section-Reihenfolge aus `preset.recommendedSections` (defensiv:
  Contact / Öffnungszeiten / Standort kommen immer ans Ende).
- Mobile-CTA-Bar (`fixed bottom-0`) blendet sich bei `md:` aus, drei
  Buttons (Anrufen / WhatsApp / Anfrage), filtert je nach
  Datenverfügbarkeit.
- `src/lib/contact-links.ts` mit E.164-Normalisierung für
  `tel:`/`wa.me`/`mailto:`.
- Anfrageformular ist aktuell **Vorschau** (Felder aus Preset, `disabled`).
  Echte Lead-Erfassung folgt in Session 12.
- 404-Seite unter `src/app/site/[slug]/not-found.tsx`.

Konvention für eine neue Sektion:

1. Komponente unter `src/components/public-site/<name>.tsx` mit
   `<PublicSection>` als Wrapper.
2. Im Barrel `index.ts` exportieren.
3. switch-Case in `src/app/site/[slug]/page.tsx` ergänzen.
4. ggf. `RECOMMENDED_SECTIONS` in `src/types/common.ts` erweitern.

## Marketing-Funnel (ab Session 8)

- **`/` als 11-Schritt-Funnel**: Hero → Problem/Lösung → ROI → Branchen
  (mit Demo-Links) → Demo-Showcase → Pakete-Teaser → Onboarding → Vorteile
  → Stimmen → FAQ → Schluss-CTA. Jede Sektion ist eine eigene Komponente
  unter `src/components/marketing/`.
- **`/pricing`** als eigene Tiefen-Seite mit `<PricingGrid>`,
  `<LimitsTable>`, `<FeatureComparisonMatrix>` (alle aus
  `@/components/pricing`). Tabellen lesen aus `FEATURE_KEYS`/
  `FEATURE_LABELS`/`hasFeature()` – keine Doppelpflege.
- Header-Nav vereinfacht: Lösung / Demos / Pakete / Designs / FAQ.
  Header-CTAs gehen zu `/demo` und `/pricing`.
- Demo-Daten werden im Marketing wiederverwendet:
  `<DemoShowcase>` rendert pro Mock-Business eine Themed-Vorschau,
  `<IndustriesGrid>` verlinkt vorhandene Demos.
- Compliance: Telefon `+49 30 9000 9999` als Demo-Nummer markiert,
  Testimonials klar als Beispiel-Stimmen aus der Demo-Welt ausgewiesen.

## Dashboard-Grundstruktur (ab Session 9)

- **Routen**: `/dashboard` (Demo-Picker) + `/dashboard/[slug]/{,
  business,services,leads,ai,reviews,social,settings}` – alle statisch
  prerendert via `generateStaticParams(listMockBusinessSlugs())`.
- **`<DashboardShell>`** umrahmt jede Seite mit Sticky-`<BusinessHeader>`,
  Sidebar (md+) und horizontalem Mobile-Nav-Strip. Reine Server
  Components, kein Client-JS – Demo-Switcher nutzt natives `<details>`.
- **`nav-config.ts`** als Single Source of Truth (`DASHBOARD_NAV` +
  `dashboardHref`) für Sidebar, Mobile-Nav, Quickactions.
- **Übersicht**: 5 Cards (`<PackageStatusCard>`, `<PreviewLinkCard>`,
  `<LeadsSummaryCard>`, `<QuickActionsCard>`, `<RecentLeadsList>`).
  Quick-Actions sind paketabhängig gegated via `hasFeature()`.
- **Stub-Routen** zeigen `<ComingSoonSection>` mit Roadmap-Bullets +
  Paket-Gating-Hinweis. Sidebar markiert sie mit „Vorschau"-Badge.
- **Privacy**: alle Dashboard-Routen tragen
  `robots: { index: false, follow: false }`.
- **Smoketest** in `src/tests/dashboard.test.ts` validiert Nav-Config
  und Slug-Konsistenz.

## Business-Editor (ab Session 10)

- **`BusinessProfileSchema`** (`src/core/validation/business-profile.schema.ts`)
  ist ein Subset von `BusinessSchema` mit den editierbaren Feldern (alle
  System- und Aggregat-Felder bleiben raus). Leere String-Werte für
  optionale Hex-/URL-Felder werden zu `undefined` transformiert –
  praktisch für RHF, das leere Inputs als `""` liefert.
- **Editor** unter `/dashboard/[slug]/business` nutzt React-Hook-Form +
  `zodResolver(BusinessProfileSchema)`. Page selbst ist Server
  Component, das Form ist `"use client"`.
- **Persistierung** über `src/lib/mock-store/business-overrides.ts`
  (localStorage, versionierter Schlüssel `lp:business-override:v1:<slug>`,
  defensive Validierung). Der Store lebt client-only, kein SSR-Problem.
- **Live-Preview** (`<BusinessEditPreview>`) nutzt `useWatch` und
  `<ThemeProvider>` aus Session 5. Hex-Color-Overrides werden auf das
  gewählte Basis-Theme angewendet, bevor es in den Provider geht.
- **Form-Primitive** in `src/components/forms/` als Basis für die
  kommenden Dashboard-Editoren (Services, Settings).
- **Smoketest** `src/tests/business-edit.test.ts` validiert Profil-
  Extraktion, Merge, Schema-Regeln.

## Services-Editor (ab Session 11)

- **`/dashboard/[slug]/services`** mit RHF + zod + `useFieldArray`.
  Bronze (`service_management` nicht enthalten) bekommt weiterhin
  `<ComingSoonSection>` plus Public-Site-Hinweis – Silber/Gold den
  vollen Editor.
- **`<ServicesEditForm>`** verwaltet Append/Remove/Swap, Validierung
  und Save/Discard. Beim Save normalisiert `normalizeOrder()` die
  `sortOrder`-Werte auf 0..n-1.
- **`<ServiceCard>`** als kollabierbare `<details>`-Karte. Karten mit
  Validierungsfehlern öffnen sich automatisch. Inline-Bestätigung
  beim Entfernen.
- **`<ServicesSummary>`** zeigt Limit-Auslastung mit Fortschrittsbar
  und warnt bei „Limit erreicht" / „Über Limit"; das Speichern ist im
  Over-Limit-Zustand explizit blockiert.
- **`getServicesOverride` / `setServicesOverride` / …** in
  `src/lib/mock-store/services-overrides.ts` – versionierter
  localStorage-Key, defensive Schema-Validierung, SSR-sicher.

## Stand nach Session 11

- App Router läuft, `/`, `/pricing`, `/themes`, `/demo` rendern statisch.
  Plus `/site/<6 slugs>`, `/dashboard` (Picker) und alle Dashboard-
  Sektionen pro Slug. **Drei produktive Editor-/Übersicht-Pages**:
  Übersicht, `business`, `services`. Bundle der Services-Page:
  ~5 KB First-Load JS plus geteilter RHF-Chunk.
- Strict TS aktiv, ESLint vorhanden, Build-Pipeline läuft sauber.
- Tailwind & Brand-Tokens stehen, Theme-Tokens als CSS-Variablen verfügbar.
- Datenmodelle vollständig, Pricing-System produktiv.
- 13 Branchen-Presets, 10 Themes registriert und validiert.
- 6 Demo-Betriebe vollständig validiert; jeder hat Public Site +
  Dashboard + zwei Editoren mit individuellem Theme.
- React-Hook-Form + Zod-Resolver + `useFieldArray` als Pattern für
  kommende Editoren etabliert.
- GitHub-Pages-Deployment automatisiert; lokal über `build:static`.
- `<LinkButton>` ist basePath-aware (interne Pfade via `next/link`).
- Build-Verifikation: `npm run typecheck`, `npm run lint`, `npm run build`,
  `npm run build:static`.

## Offene technische Punkte

- Restliche Dashboard-Sub-Routen ausbauen (`leads` Session 12, `ai`
  Sessions 13–15, `reviews` Session 16, `social` Session 17,
  `settings` Session 18).
- Lead-System (Session 12) – ersetzt die Formular-Vorschau in
  `<PublicContact>` und die Demo-Telefonnummer im `<CtaContact>` durch
  eine echte Erfassung (Server Action / API).
- AI-Provider-Adapter (Session 13). Interface steht.
- Repository-Layer / Mock vs. Supabase (Session 19) – Mock-Layer ist
  bereits so gekapselt (`getMockBusinessBySlug`, `getOverride` usw.),
  dass ein späterer Tausch gegen Supabase ohne UI-Änderungen möglich
  bleibt.
- Vitest-Setup (Session 20). Bis dahin tragen `tsc --noEmit` plus die
  `src/tests/*.test.ts`-Smoketests die Sicherheit.
- Image-Hosting/-Optimierung – `logoUrl`/`coverImageUrl` jetzt im
  Editor pflegbar, aber nicht gerendert. Sobald sie kommen, via
  `next/image` mit `unoptimized: true` für Static Export.
- Color-Picker als nativer `<input type="color">` (statt Hex-Text).
- Analytics/Tracking für Marketing-Funnel und Dashboard (Session 19+).
- Sobald API-Routen oder Server Actions kommen: Vercel als
  Production-Target ergänzen, GitHub Pages bleibt als Showcase.
