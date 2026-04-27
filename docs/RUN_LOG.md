# Run Log – LocalPilot AI

Chronologisches Protokoll aller Sessions. Jede Session hinterlässt einen Eintrag mit:
Was wurde umgesetzt, welche Dateien geändert, wie testet man, welche Akzeptanzkriterien
sind erfüllt, was ist offen, was kommt als nächstes.

---

## Session 1 – Projektbasis, Vision und Architektur
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- Next.js 15 (App Router) + React 19 + TypeScript strict initialisiert.
- Tailwind CSS 3 mit eigener Brand- und Ink-Farbpalette, Container-Defaults, Custom Schatten/Radius.
- ESLint (`next/core-web-vitals`, `next/typescript`) eingerichtet.
- Strict-TS-Einstellungen (`noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`).
- Globale Styles und CSS-Variablen-Slots (`src/app/globals.css`) mit Design-Tokens vorbereitet.
- UI-Primitive: `Container`, `Section`, `Button`, `LinkButton`.
- Layout-Komponenten: `SiteHeader`, `SiteFooter` mit Navigation und Footer-Links.
- Marketing-Startseite (`/`) mit den Sektionen:
  - Hero (Headline, Subline, CTA Pakete + Beratung)
  - Problem & Lösung (Pain-Points + 4 Lösungsbausteine)
  - Branchen-Grid (12 sichtbare Karten, Hinweis: 20+ ergänzbar)
  - Pakete (Bronze/Silber/Gold als Teaser-Karten – Logik folgt Session 3)
  - Vorteile (6 Punkte)
  - FAQ (6 Fragen)
  - Kontakt-CTA mit 4-Schritte-Onboarding
- Ordnerstruktur für `app`, `components`, `core`, `data`, `lib`, `types`, `tests`, `docs` angelegt.
- Dokumentation: `README.md`, `CHANGELOG.md`, `docs/PRODUCT_STRATEGY.md`,
  `docs/TECHNICAL_NOTES.md`, `docs/RUN_LOG.md`, `.env.example`.
- `.gitignore` für Next.js-Standardartefakte.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu:
- `package.json`
- `tsconfig.json`
- `next.config.mjs`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `.eslintrc.json`
- `.gitignore`
- `.env.example`
- `README.md`
- `CHANGELOG.md`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/layout/site-header.tsx`
- `src/components/layout/site-footer.tsx`
- `src/components/marketing/hero.tsx`
- `src/components/marketing/problem-solution.tsx`
- `src/components/marketing/industries.tsx`
- `src/components/marketing/pricing-teaser.tsx`
- `src/components/marketing/benefits.tsx`
- `src/components/marketing/faq.tsx`
- `src/components/marketing/cta-contact.tsx`
- `src/components/ui/container.tsx`
- `src/components/ui/section.tsx`
- `src/components/ui/button.tsx`
- `src/lib/cn.ts`
- `docs/PRODUCT_STRATEGY.md`
- `docs/TECHNICAL_NOTES.md`
- `docs/RUN_LOG.md`
- diverse `.gitkeep`-Dateien für die spätere Domain-Struktur

### 3. Wie teste ich es lokal?

```bash
npm install
cp .env.example .env.local      # optional, kann leer bleiben
npm run dev
```

Dann im Browser: [http://localhost:3000](http://localhost:3000).

Zusätzliche Checks:

```bash
npm run lint
npm run typecheck
npm run build
```

Die Marketing-Startseite muss vollständig rendern (Hero → Kontakt).
Auf Mobile prüfen: Header bleibt sticky, Sektionen sind lesbar, CTA-Buttons sind groß genug.

### 4. Welche Akzeptanzkriterien sind erfüllt?

- ✅ Projekt startet lokal (`npm run dev`).
- ✅ Startseite sichtbar (Marketing-Landingpage `/`).
- ✅ Struktur vorbereitet (`src/app`, `components`, `core`, `data`, `lib`, `types`, `tests`, `docs`).
- ✅ Dokumentation vorhanden (`README`, `CHANGELOG`, `docs/PRODUCT_STRATEGY`, `docs/TECHNICAL_NOTES`, `docs/RUN_LOG`).
- ✅ Keine branchenspezifische Kopplung – Branchen erscheinen nur als generische Karten.

### 5. Was ist offen?

- Datenmodelle / TypeScript-Typen für Business, Service, Lead, Review, FAQ, IndustryPreset, Theme, PricingTier, AI (Session 2).
- Pricing-Logik mit Feature-Locks und Upgrade-Hinweisen (Session 3).
- Branchen-Presets als Code-Konfiguration inklusive Validierung (Session 4).
- Theme-System (Session 5).
- Mock-Daten und Demo-Betriebe (Session 6).
- Public-Site-Generator unter `/site/[slug]` (Session 7).
- Marketing-Subseiten/-Erweiterungen, falls nötig (Session 8).
- Dashboard-Grundgerüst (Session 9+).
- KI-Provider-Interface und Mock-Provider (Session 13).
- Bewertungs-Booster (Session 16) und Social-Media-Generator (Session 17).
- Supabase-Vorbereitung (Session 19) und Deployment-Doku (Session 21).
- `docs/INDUSTRY_PRESETS.md`, `docs/PRICING.md`, `docs/DEPLOYMENT.md`, `docs/SALES.md`,
  `docs/CUSTOMER_ONBOARDING.md` werden in den jeweiligen Sessions ergänzt.

### 6. Was ist der nächste empfohlene Run?

**Session 2 – Core-Typen und Datenmodelle.**

Ziel: alle zentralen TypeScript-Typen (Business, Service, Lead, Review, FAQ,
IndustryPreset, Theme, PricingTier, AI) in `src/types/` definieren, Zod-Schemas
in `src/core/validation/` vorbereiten und die Mock-Datenstruktur planen
(noch ohne reale Mock-Inhalte – die kommen in Session 6).

---

## Session 2 – Core-Typen und Datenmodelle
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- Zentrales Konstanten-Modul `src/types/common.ts` als einzige Quelle aller
  String-Literal-Keys: `PACKAGE_TIERS`, `INDUSTRY_KEYS`, `THEME_KEYS`,
  `FEATURE_KEYS`, `LEAD_STATUSES`, `LEAD_SOURCES`, `LEAD_FORM_FIELD_TYPES`,
  `REVIEW_SOURCES`, `REVIEW_REQUEST_CHANNELS`, `SOCIAL_PLATFORMS`,
  `SOCIAL_POST_GOALS`, `POST_LENGTHS`, `RECOMMENDED_SECTIONS`, `CTA_INTENTS`,
  `COMPLIANCE_TOPICS`, `WEEK_DAYS`, `AI_PROVIDER_KEYS`, `AI_LANGUAGES`,
  `SUPPORTED_LOCALES`, `SUPPORTED_CURRENCIES`. Daraus abgeleitete Typen.
- Komplette Zod-Schema-Suite in `src/core/validation/`:
  - `common.schema.ts` (Primitive: Id, IsoDate, Slug, ColorHex, Phone, Email,
    Url, Money, OpeningHours/-Day/-Slot; alle Enum-Schemas).
  - `service.schema.ts`, `review.schema.ts`, `faq.schema.ts`.
  - `lead.schema.ts` mit `LeadFormFieldSchema` und Geschäftsregel
    "Telefon ODER E-Mail erforderlich".
  - `theme.schema.ts` mit ausführlichem `ThemeColorsSchema` und
    `ThemeTypographySchema`.
  - `pricing.schema.ts` mit `PricingTierSchema`, `TierLimitsSchema` und
    `TIER_UNLIMITED`.
  - `industry.schema.ts` für vollständige `IndustryPreset`-Validierung
    (CTAs, Services, FAQs, Benefits, Process Steps, Lead-Felder, Review-
    Vorlagen, Social-Prompts, Website-Copy-Prompts, Image Guidance,
    Compliance-Notes).
  - `business.schema.ts` als "fettes" Aggregat (Address, Contact, OpeningHours,
    Services, Reviews, FAQs, TeamMembers).
  - `ai.schema.ts` mit Inputs/Outputs aller 7 AI-Methoden, `AIProvider`-Interface
    und `AIProviderError`-Klasse.
  - `index.ts` Barrel.
- Re-Export-Schicht `src/types/{business,service,lead,review,faq,industry,
  theme,pricing,ai,index}.ts` mit per `z.infer` abgeleiteten Typen.
- Plan der Mock-Datenstruktur in `src/data/mock-types.ts`
  (`MockDatasetSchema`, `BusinessSlugIndex`, `LeadsByBusiness`,
  `validateMockDataset()`).
- Compile-Zeit-Smoketest `src/tests/schema-validation.test.ts`, der jedes
  Schema einmal mit realistischen Beispieldaten parst – schlägt früh fehl,
  falls Schema und Typ auseinanderlaufen.
- Dependency: `zod@3.24.1`.
- README, CHANGELOG, TECHNICAL_NOTES aktualisiert.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu:
- `src/types/common.ts`
- `src/types/{business,service,lead,review,faq,industry,theme,pricing,ai,index}.ts`
- `src/core/validation/common.schema.ts`
- `src/core/validation/{service,review,faq,lead,theme,pricing,industry,business,ai}.schema.ts`
- `src/core/validation/index.ts`
- `src/data/mock-types.ts`
- `src/tests/schema-validation.test.ts`

Geändert:
- `package.json` / `package-lock.json` (zod hinzugefügt)
- `README.md`
- `CHANGELOG.md`
- `docs/TECHNICAL_NOTES.md`
- `docs/RUN_LOG.md`

Entfernt: `.gitkeep` in `src/types`, `src/data`, `src/tests`,
`src/core/validation` (durch echte Inhalte ersetzt).

### 3. Wie teste ich es lokal?

```bash
npm install
npm run typecheck     # tsc --noEmit – muss grün sein
npm run lint          # ESLint – 0 warnings/errors
npm run build         # Next.js Build – muss durchlaufen
```

Die Marketing-Landingpage funktioniert weiterhin unter `npm run dev`
(`http://localhost:3000`). Der Schema-Smoketest läuft beim Typecheck
implizit mit – jede `parse()`-Stelle in `src/tests/schema-validation.test.ts`
muss tatsächlich der zugehörigen Typdefinition entsprechen.

Wer eines der Schemas manuell prüfen will:

```ts
import { BusinessSchema } from "@/core/validation";
BusinessSchema.parse(input); // wirft sprechende ZodError, wenn etwas fehlt
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

- ✅ **Typen sind wiederverwendbar** – Barrel `@/types` liefert alle
  Domänenmodelle, `@/core/validation` alle Schemas.
- ✅ **Keine `any`-Typen ohne Grund** – die einzigen Stellen mit `unknown`
  sind die Eingangsparameter der `validate*()`-Funktionen, was korrekt ist.
- ✅ **Datenmodelle sind branchenneutral** – kein Schema enthält Friseur-,
  Werkstatt- oder andere Branchen-Logik. Branchenspezifisches lebt
  ausschließlich im (in Session 4 zu erstellenden) `IndustryPreset`.
- ✅ **Zod-Validierung vorhanden** – jedes Domänenobjekt hat ein Schema mit
  Geschäftsregeln (z. B. Lead-Kontaktpflicht, Slug-Regex,
  Öffnungszeiten-Konsistenz, Stern-Bewertungen 1–5).

### 5. Was ist offen?

- **Session 3** – Pricing-Konfiguration als Code: konkrete Bronze/Silber/Gold-
  Datensätze, Helper `hasFeature()`, `getTierLimits()`, `isFeatureLocked()`,
  `docs/PRICING.md`.
- **Session 4** – mindestens 10 IndustryPresets als konkrete Daten (das
  Schema steht bereits, die Inhalte fehlen).
- **Session 5** – Theme-Registry als konkrete Daten + Theme-Resolver / CSS-
  Variablen-Anwendung.
- **Session 6** – Mock-Inhalte für `mock-businesses.ts`, `mock-services.ts`,
  `mock-reviews.ts`, `mock-leads.ts` (Schema steht, der Datenbestand fehlt).
- **Session 7+** – Public Site Generator nutzt diese Typen.
- **Sessions 13–17** – AI-Provider-Implementierung gegen das hier definierte
  Interface.
- Vitest-Setup ist weiterhin offen (Session 20). Bis dahin trägt
  `tsc --noEmit` plus der Smoketest die Sicherheit.

### 6. Was ist der nächste empfohlene Run?

**Session 3 – Pricing-System Bronze/Silber/Gold.**

Konkrete `PricingTier`-Datensätze in `src/core/pricing/pricing-tiers.ts`,
Helfer für Feature-Locks, optional eine `<FeatureLock>`-Komponente unter
`src/components/pricing/`, und `docs/PRICING.md`. Anschließend kann die
Marketing-Landingpage die Pricing-Karten aus der Code-Konfiguration ableiten
(statt sie wie heute hartzucodieren).

---

## Session 3 – Pricing-System Bronze/Silber/Gold
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- Konkrete `BRONZE_TIER`, `SILBER_TIER`, `GOLD_TIER`-Datensätze in
  `src/core/pricing/pricing-tiers.ts` mit Vererbung Bronze ⊂ Silber ⊂ Gold,
  Feature-Limits und Marketing-Highlights.
- Validierung beim Module-Load via `PricingTierSchema.parse(...)`: Tippfehler
  in FeatureKeys oder Limits brechen sofort den Build.
- `marketingHighlights`-Feld im Schema ergänzt – getrennt vom technischen
  `features`-Array, damit Werbung und Logik nicht driften.
- `feature-labels.ts`: deutsches Klartext-Label und Beschreibung pro
  `FeatureKey`, vollständig erzwungen über `Record<FeatureKey, FeatureLabel>`.
- `feature-helpers.ts`: reine Funktionen `getTier`, `tryGetTier`,
  `getAllTiers`, `hasFeature`, `isFeatureLocked`, `requiredTierFor`,
  `getTierLimits`, `isLimitExceeded`, `compareTiers`, `isAtLeastTier`,
  `nextHigherTier`, `formatPrice`, `formatLimit`. Plus `UnknownTierError`.
- Pricing-Komponenten `<PricingCard>`, `<PricingGrid>`, `<FeatureLock>`,
  `<UpgradeHint>` in `src/components/pricing/`. Generisch, sowohl in
  Marketing als auch im späteren Dashboard nutzbar.
- Marketing-Landingpage rendert Pricing-Karten jetzt aus der
  Code-Konfiguration via `<PricingGrid>` – keine hartcodierten Karten mehr.
- Smoketest `src/tests/pricing-helpers.test.ts` mit ~40 Assertions
  (Vererbung, Lookup, Limits, Reihenfolge, Formatierung, Konsistenz von
  `FEATURE_LABELS`).
- `docs/PRICING.md` mit vollständiger Dokumentation.
- README, CHANGELOG, TECHNICAL_NOTES aktualisiert.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu:
- `src/core/pricing/pricing-tiers.ts`
- `src/core/pricing/feature-labels.ts`
- `src/core/pricing/feature-helpers.ts`
- `src/core/pricing/index.ts`
- `src/components/pricing/pricing-card.tsx`
- `src/components/pricing/pricing-grid.tsx`
- `src/components/pricing/feature-lock.tsx`
- `src/components/pricing/upgrade-hint.tsx`
- `src/components/pricing/index.ts`
- `src/tests/pricing-helpers.test.ts`
- `docs/PRICING.md`

Geändert:
- `src/core/validation/pricing.schema.ts` (`marketingHighlights` ergänzt)
- `src/components/marketing/pricing-teaser.tsx` (config-driven)
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`, `docs/RUN_LOG.md`

Entfernt: `.gitkeep` in `src/core/pricing` und `src/components/pricing`.

### 3. Wie teste ich es lokal?

```bash
npm install                # nichts neues, falls schon nach Session 2 installiert
npm run typecheck          # implizit: pricing-helpers.test.ts wird typgecheckt
npm run lint               # 0 warnings/errors
npm run build              # SSR validiert die Tier-Configs gegen Zod
npm run dev                # http://localhost:3000 – Pricing-Sektion live
```

Gezielter Smoketest auf der Marketing-Seite:

```bash
curl -s http://localhost:3000/ | grep -oE '[0-9]{2,4}[^<>]{0,5}€' | sort -u
# erwartet: 49 €, 99 €, 199 €, 499 €, 999 €
```

Helper im Code:

```ts
import { hasFeature, requiredTierFor, formatPrice } from "@/core/pricing";
hasFeature("bronze", "ai_website_text");        // false
requiredTierFor("ai_campaign_generator");       // "gold"
formatPrice(499);                                // "499 €"
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

- ✅ **Bronze/Silber/Gold existieren als Code-Konfiguration** –
  `BRONZE_TIER`, `SILBER_TIER`, `GOLD_TIER` in `pricing-tiers.ts`,
  Zod-validiert.
- ✅ **Features können paketabhängig gesperrt werden** –
  `<FeatureLock>` und `<UpgradeHint>` mit `overlay`/`replace`-Varianten,
  Helper `hasFeature`, `isFeatureLocked`, `requiredTierFor`.
- ✅ **Pricing ist auf Marketingseite darstellbar** – `<PricingGrid>` ist
  in `src/components/marketing/pricing-teaser.tsx` integriert. Live unter
  `http://localhost:3000/#pakete` mit Preisen 49/99/199 € und 499/999/1999 €.
- ✅ **Pricing ist im Dashboard nutzbar** – `<PricingGrid>` akzeptiert
  `currentTier` und markiert die aktive Stufe als "Aktuelles Paket".
  Helfer `nextHigherTier`/`isAtLeastTier`/`isLimitExceeded` stehen für die
  Dashboard-Integration in Session 9 bereit.

### 5. Was ist offen?

- **Session 4** – mindestens 10 IndustryPresets als konkrete Daten in
  `src/core/industries/`.
- **Session 5** – Theme-Registry als konkrete Daten + Theme-Resolver.
- **Session 6** – Mock-Inhalte für Demo-Betriebe.
- **Session 9** – Dashboard-Grundgerüst, das `<PricingGrid currentTier=...>`
  einsetzt.
- **Session 18** – Feature-Lock-System weiter ausbauen
  (Vergleichsmatrix, gesperrte Buttons, Upgrade-CTA in der Hauptnavigation).
- Platin-Konfiguration fehlt absichtlich – wird modelliert, sobald
  Automationen, CRM und WhatsApp-Integration konzipiert sind (nach Session 22).

### 6. Was ist der nächste empfohlene Run?

**Session 4 – Branchen-Preset-System.**

Mindestens 10 (besser 15–20) `IndustryPreset`-Datensätze in
`src/core/industries/` als typsichere, Zod-validierte Konfigurationen.
Plus Preset-Registry, Validierungsfunktion, Fallback-Preset und
`docs/INDUSTRY_PRESETS.md`. Das Schema steht bereits seit Session 2 –
es fehlen die konkreten Inhalte für Friseur, Werkstatt, Reinigung,
Kosmetik, Handwerk, Fahrschule, Fitness, Foto, Restaurant, Shop und
weitere.

---

## Session 4 – Branchen-Preset-System + GitHub Pages
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

**Deployment (vorgezogen, da Live-Preview am Handy gewünscht)**

- `.github/workflows/deploy.yml`: Workflow deployt automatisch nach GitHub
  Pages bei jedem Push auf `main` oder `claude/**`. Verwendet
  `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`,
  `actions/deploy-pages@v4`. Setzt `STATIC_EXPORT=true` und
  `NEXT_PUBLIC_BASE_PATH=/<repo-name>` und schreibt `.nojekyll`.
- `next.config.mjs` schaltet `output: "export"`, `trailingSlash`, `basePath`,
  `assetPrefix` und `images.unoptimized` konditioniert auf `STATIC_EXPORT=true`.
  Lokaler Dev und SSR-Build bleiben unverändert.
- `npm run build:static` für lokale Verifikation des Static-Exports.
- `docs/DEPLOYMENT.md` mit vollständiger Anleitung.
- `Claude.md` Abschnitt 28 "DEPLOYMENT" als persistenter Eintrag.

**Branchen-Presets (Kern von SESSION 4)**

- 13 hochwertige `IndustryPreset`-Datensätze in
  `src/core/industries/presets/`:
  Friseur, Barbershop, Autowerkstatt, Reinigungsfirma, Kosmetikstudio,
  Nagelstudio, Handwerker, Elektriker, Malerbetrieb, Fahrschule, Restaurant,
  Fotograf, Personal Trainer.
- Jedes Preset enthält: typische Leistungen (5–8), Hero-Texte, CTAs,
  empfohlene Sektionen, FAQs (4), Benefits, Process-Steps, dynamische
  Lead-Felder, Bewertungsanfrage-Vorlagen mit `{{customerName}}` und
  `{{reviewLink}}`, Social-Media-Prompts, Website-Copy-Prompts, empfohlene
  Themes, Bildempfehlungen, Tonalität und Compliance-Hinweise.
- `src/core/industries/preset-helpers.ts`: gemeinsame Bausteine
  (Standard-Lead-Felder, Standard-CTAs, Compliance-Konstanten).
- `src/core/industries/fallback-preset.ts` mit `getFallbackPreset(originalKey)`
  für unbekannte Branchen.
- `src/core/industries/registry.ts`: `PRESET_REGISTRY`, `getPreset`,
  `getPresetOrFallback`, `getAllPresets`, `listPresetKeys`,
  `listMissingPresetKeys`, `hasPreset`, `getPresetsForTheme`,
  `UnknownIndustryError`. Konsistenz-Check beim Module-Load
  (Map-Key === preset.key).
- `src/core/industries/index.ts` Barrel.
- Smoketest `src/tests/industry-presets.test.ts` mit 30+ Assertions
  (Mindestabdeckung, Schema, Pflichtfelder, Bewertungs-Platzhalter,
  Compliance für medizin-/pflegenahe Branchen).
- `docs/INDUSTRY_PRESETS.md`: Übersichtstabelle aller 13 Presets,
  Zugriffs-API, Validierungsregeln, Erweiterungsanleitung,
  Compliance-Stoppregeln.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (Deployment):
- `.github/workflows/deploy.yml`
- `docs/DEPLOYMENT.md`

Neu (Branchen-Presets):
- `src/core/industries/preset-helpers.ts`
- `src/core/industries/fallback-preset.ts`
- `src/core/industries/registry.ts`
- `src/core/industries/index.ts`
- `src/core/industries/presets/{hairdresser,barbershop,auto-workshop,
  cleaning-company,cosmetic-studio,nail-studio,craftsman-general,
  electrician,painter,driving-school,restaurant,photographer,
  personal-trainer}.ts` (13 Dateien)
- `src/tests/industry-presets.test.ts`
- `docs/INDUSTRY_PRESETS.md`

Geändert:
- `next.config.mjs` (konditioneller Static-Export)
- `package.json` (`build:static`-Script)
- `Claude.md` (Abschnitt 28 "DEPLOYMENT")
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

Entfernt: `.gitkeep` in `src/core/industries`.

### 3. Wie teste ich es lokal?

```bash
npm run typecheck      # auch der Smoketest wird geprüft
npm run lint           # 0 warnings/errors
npm run build          # SSR-Build
npm run build:static   # Static-Export, Output unter out/
npm run dev            # http://localhost:3000
```

Schnell-Check der Presets im Code:

```ts
import {
  getPresetOrFallback,
  listPresetKeys,
  listMissingPresetKeys,
} from "@/core/industries";

listPresetKeys();          // 13 Branchen
listMissingPresetKeys();   // 6 noch nicht modellierte Schlüssel
getPresetOrFallback("hairdresser").defaultServices.length;  // 7
getPresetOrFallback("local_shop").label;  // "Betrieb" (Fallback)
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                       | Status                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| Jede Branche hat typische Leistungen            | ✅ 5–8 pro Preset                               |
| Jede Branche hat CTAs                           | ✅ 2–3 pro Preset                               |
| Jede Branche hat Formularfelder                 | ✅ ≥2 + branchenspezifische                    |
| Jede Branche hat FAQ                            | ✅ 4 pro Preset                                 |
| Jede Branche hat Social-Ideen                   | ✅ 2–3 pro Preset                               |
| Jede Branche hat Bewertungs-Texte               | ✅ 2–3 Vorlagen pro Preset                      |
| Neue Branche ist leicht ergänzbar               | ✅ Anleitung in `docs/INDUSTRY_PRESETS.md`     |

Plus: Mindestens 10 Presets vorhanden – wir haben **13**.

### 5. Was ist offen?

- 6 weitere `IndustryKey`-Werte sind in `INDUSTRY_KEYS` definiert, haben
  aber noch kein vollständiges Preset: `tutoring`, `local_shop`,
  `dog_grooming`, `wellness_practice`, `real_estate_broker`,
  `garden_landscaping`. `getPresetOrFallback()` fängt das auf, vollständige
  Presets folgen je nach Vertriebsbedarf.
- **Session 5** – Theme-Registry als konkrete Daten + Theme-Resolver.
- **Session 6** – Mock-Inhalte für Demo-Betriebe (nutzt
  `defaultServices`/`defaultFaqs` als Seed-Quelle).
- **Session 7** – Public Site Generator unter `/site/[slug]` mit
  `generateStaticParams()`, damit Static Export auf GitHub Pages weiter
  funktioniert.
- **Session 9** – Dashboard.
- **Sessions 13–17** – AI-Provider, der `socialPostPrompts`,
  `websiteCopyPrompts`, `reviewRequestTemplates` und `toneOfVoice` als
  Kontext nutzt.
- GitHub Pages erfordert einmaliges Aktivieren in **Settings → Pages →
  Source → "GitHub Actions"**. Erst danach läuft der Workflow erfolgreich
  durch.

### 6. Was ist der nächste empfohlene Run?

**Session 5 – Theme-System.**

Konkrete Theme-Datensätze in `src/core/themes/` (mind. 10 Themes:
clean_light, premium_dark, warm_local, medical_clean, beauty_luxury,
automotive_strong, craftsman_solid, creative_studio, fitness_energy,
education_calm). Plus Theme-Resolver, der CSS-Variablen aus dem Theme
schreibt und in der App-Layout-Komponente konsumiert wird. Themes sollen
beeinflussen: Farben, Buttons, Cards, Section-Abstände, Header-/Hero-Stil,
Schatten, Rundungen. Anschließend kann die Public Site (Session 7)
business-spezifisch designt werden.

---

## Session 5 – Theme-System
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- **10 vollständige Theme-Datensätze** in `src/core/themes/themes/`:
  clean_light (Default), premium_dark, warm_local, medical_clean,
  beauty_luxury, automotive_strong, craftsman_solid, creative_studio,
  fitness_energy, education_calm. Jedes Theme bringt 10 Farb-Tokens,
  Typografie (heading/body Font-Family, Basis-Größe, Weights, Letter-
  Spacing), Radius, Shadow, Section-/Button-/Card-Stil und passende
  Branchen mit. Beim Module-Load via `ThemeSchema.parse(...)` validiert.
- **`theme-resolver.ts`**: `themeToCssVars()` wandelt einen Theme-Datensatz
  in ein `CSSProperties`-Objekt mit Custom Properties (`--theme-*`) um.
  `hexToRgbTriplet()` konvertiert Hex zu Triplets, kompatibel mit der
  Tailwind-`<alpha-value>`-Syntax.
- **`registry.ts`** als zentraler Lookup: `THEME_REGISTRY`,
  `DEFAULT_THEME`, `getTheme`, `getThemeOrFallback`, `getAllThemes`,
  `listThemeKeys`, `getThemesForIndustry`, `UnknownThemeError` plus
  Konsistenz-Check beim Laden.
- **`<ThemeProvider>`** (`src/components/theme/theme-provider.tsx`):
  Server-Component-fähiger Wrapper, der die CSS-Vars per inline `style`
  setzt. Pattern Stand 2026 – kein React Context, kein Client-JS, voll
  kompatibel mit Static Export.
- **`<ThemePreviewCard>`** für die Galerie: zeigt einen kleinen
  Public-Site-Hero mit dem jeweiligen Theme.
- **Statische Galerie** unter `/themes` rendert alle 10 Themes
  serverseitig und prerendert sie ins Static Export.
- **Tailwind-Integration**: `theme.*`-Color-Set, `borderRadius.theme*`,
  `boxShadow.theme`, `fontFamily.theme-heading|body`. Klassen wie
  `bg-theme-primary`, `text-theme-foreground/80`, `rounded-theme-button`,
  `shadow-theme` stehen ab sofort zur Verfügung.
- **`globals.css`** setzt Default-Theme-Variablen im `:root`, sodass
  Seiten ohne expliziten Provider keine kaputten Klassen produzieren.
- **`<LinkButton>` basePath-aware**: bei internen absoluten Pfaden
  automatisch `next/link`, sonst nativer `<a>`. Header-Nav (`/themes`)
  funktioniert dadurch sauber auf GitHub Pages mit basePath.
- **`<SiteHeader>`** zeigt jetzt einen Nav-Link auf `/themes`.
- **Smoketest** `src/tests/themes.test.ts` mit 25+ Assertions.
- **`docs/THEMES.md`** mit Galerie-Übersicht, Architektur, Code-Beispielen,
  Erweiterungsanleitung.
- **Build-Verifikation**: typecheck, lint, build und build:static alle
  grün; Live-Smoketest auf `/themes` zeigt 10 unterschiedliche
  `data-theme`-Wrapper mit korrekt gesetzten CSS-Vars.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu:
- `src/core/themes/theme-resolver.ts`
- `src/core/themes/registry.ts`
- `src/core/themes/index.ts`
- `src/core/themes/themes/{clean-light,premium-dark,warm-local,
  medical-clean,beauty-luxury,automotive-strong,craftsman-solid,
  creative-studio,fitness-energy,education-calm}.ts` (10 Dateien)
- `src/components/theme/theme-provider.tsx`
- `src/components/theme/theme-preview-card.tsx`
- `src/components/theme/index.ts`
- `src/app/themes/page.tsx`
- `src/tests/themes.test.ts`
- `docs/THEMES.md`

Geändert:
- `tailwind.config.ts` (Theme-Color-Set, Border-Radius-Tokens, Shadow-Token)
- `src/app/globals.css` (Default-Theme-Variablen + theme-aware Components)
- `src/components/ui/button.tsx` (LinkButton basePath-aware)
- `src/components/layout/site-header.tsx` (Nav-Link auf `/themes`)
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

Entfernt: `.gitkeep` in `src/core/themes` und `src/components/theme`.

### 3. Wie teste ich es lokal?

```bash
npm run typecheck      # tsc --noEmit – grün
npm run lint           # 0 warnings/errors
npm run build          # SSR-Build
npm run build:static   # Static Export, /themes ist eine eigene Route
npm run dev            # http://localhost:3000/themes
```

Live-Smoketest:

```bash
curl -s http://localhost:3000/themes | grep -oE 'data-theme="[^"]+"' | sort -u
# erwartet: 10 verschiedene Themes
```

Programmatisch:

```ts
import {
  getThemeOrFallback,
  themeToCssVars,
  hexToRgbTriplet,
} from "@/core/themes";

themeToCssVars(getThemeOrFallback("beauty_luxury"))["--theme-primary"];
// "200 117 143" (RGB-Triplet von #c8758f)
```

In Komponenten:

```tsx
<ThemeProvider theme={getThemeOrFallback(business.themeKey)}>
  <button className="bg-theme-primary text-theme-primary-fg rounded-theme-button shadow-theme">
    Termin anfragen
  </button>
</ThemeProvider>
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                              | Status                                       |
| -------------------------------------- | -------------------------------------------- |
| Business kann Theme wählen             | ✅ `Business.themeKey` (seit Session 2)     |
| Theme beeinflusst Public Site          | ✅ `<ThemeProvider>` setzt CSS-Vars; Tailwind-Klassen `bg-theme-*` etc. wirken |
| Themes sind erweiterbar                | ✅ Anleitung in `docs/THEMES.md`            |
| Design bleibt konsistent               | ✅ Default-Theme im `:root`, Konsistenz-Check beim Laden, Smoketest |
| Mindestens 10 Themes                   | ✅ Genau 10 (clean_light, premium_dark, …)   |

### 5. Was ist offen?

- **Session 6** – Mock-Inhalte für Demo-Betriebe (`mock-businesses.ts`,
  `mock-services.ts`, `mock-reviews.ts`, `mock-leads.ts`). Nutzt
  `defaultServices`/`defaultFaqs` aus den Presets als Seed-Quelle und
  kombiniert mit den Themes pro Demo-Betrieb.
- **Session 7** – Public Site Generator unter `/site/[slug]`, der
  `<ThemeProvider>` einsetzt und mit `generateStaticParams()` alle Slugs
  zur Build-Zeit erzeugt (damit Static Export für GitHub Pages weiter
  funktioniert).
- **Session 9+** – Dashboard mit Theme-Picker.
- **Sessions 13–17** – AI-Provider; Tonalität aus dem aktuellen Theme/Preset
  als Kontext.
- Optional in Session 20 (Polish): externe Schriften (Playfair Display,
  Lora, Cormorant Garamond, Manrope, Space Grotesk, Barlow) tatsächlich
  via `next/font` laden, wenn das Theme sie verlangt. Aktuell fallen sie
  auf System-Schrift zurück.

### 6. Was ist der nächste empfohlene Run?

**Session 6 – Mock-Daten und Demo-Betriebe.** (s. u.)

---

## Session 6 – Mock-Daten und Demo-Betriebe
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- **6 vollständige Demo-Betriebe** in `src/data/businesses/`:
  - `studio-haarlinie` (Friseur, Silber, warm_local) – Musterstadt
  - `autoservice-mueller` (Werkstatt, Gold, automotive_strong) – Beispielstadt
  - `glanzwerk-reinigung` (Reinigung, Silber, medical_clean) – Demostadt
  - `beauty-atelier` (Kosmetik, Gold, beauty_luxury) – Musterstadt
  - `meisterbau-schneider` (Handwerk, Bronze, craftsman_solid) – Beispieldorf
  - `fahrschule-stadtmitte` (Fahrschule, Silber, education_calm) – Demostadt

  Jeder Datensatz ist ein „fat aggregate" mit Services, Reviews, FAQs
  und TeamMembers, gerahmt von `BusinessSchema.parse(...)`.
- **`mock-helpers.ts`**: stabile ID-Generatoren, `MOCK_NOW`,
  `daysAgo()`, `buildOpeningHours()` mit kompakter Schreibweise.
- **`mock-businesses.ts`** aggregiert + Slug-Index + Konsistenz-Check;
  exportiert `getMockBusinessBySlug` und `listMockBusinessSlugs`
  (für `generateStaticParams` in Session 7).
- **`mock-services.ts`/`mock-reviews.ts`** mit flachen Listen,
  Group-by-Business und `averageRatingByBusiness` (gerundet auf 0,1).
  37 Services, 25 Reviews insgesamt.
- **`mock-leads.ts`**: 25 realistische Beispiel-Leads (4–5 pro Betrieb)
  mit branchenspezifischen `extraFields` (`vehicleModel`, `objectType`,
  `drivingClass`, …) und Status-Mix `new`/`contacted`/`qualified`/`won`/
  `lost`. Validiert via `LeadSchema.parse(...)`.
- **`mock-dataset.ts`**: `MockDataset` über `MockDatasetSchema`
  validiert, Konsistenz-Check (Lead → existierender Betrieb).
- **`/demo`-Übersichtsseite**: pro Betrieb eine Karte mit
  Themed-Vorschau (über `<ThemeProvider>`), Branchen-Etikett,
  Paket-Badge, Counts (Leistungen / FAQs / Anfragen) und
  Public-Site-Slug. Statisch prerendert, kein Client-JS.
  Nav-Link „Demo" im Header.
- **Smoketest** `src/tests/mock-data.test.ts` mit 30+ Assertions:
  Diversität (Branchen / Themes / Pakete), eindeutige IDs,
  Service-/Review-Konsistenz, Paket-Limits, Lead-Status-Mix,
  Verbot echter Mail-Provider (gmail.com etc.), Lookup-Verhalten.
- **`docs/MOCK_DATA.md`** mit Tabellen, Architektur,
  Daten-Hygiene-Regeln, Erweiterungsanleitung.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (15 Dateien):
- `src/data/mock-helpers.ts`
- `src/data/mock-{businesses,services,reviews,leads,dataset}.ts`
- `src/data/index.ts`
- `src/data/businesses/{studio-haarlinie,autoservice-mueller,
  glanzwerk-reinigung,beauty-atelier,meisterbau-schneider,
  fahrschule-stadtmitte}.ts` (6 Dateien)
- `src/app/demo/page.tsx`
- `src/tests/mock-data.test.ts`
- `docs/MOCK_DATA.md`

Geändert:
- `src/components/layout/site-header.tsx` (Nav-Link „Demo")
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

### 3. Wie teste ich es lokal?

```bash
npm run typecheck       # tsc --noEmit + Smoketest werden geprüft
npm run lint            # 0 warnings/errors
npm run build           # SSR-Build
npm run build:static    # Static Export, alle Mocks beim Build validiert
npm run dev             # http://localhost:3000/demo
```

Live-Smoketest:

```bash
curl -s http://localhost:3000/demo | grep -oE 'data-theme="[^"]+"' | sort -u
# erwartet: 6 unterschiedliche Themes
```

API:

```ts
import { getMockBusinessBySlug, mockDataset } from "@/data";
mockDataset.businesses.length;                    // 6
getMockBusinessBySlug("beauty-atelier")?.themeKey; // "beauty_luxury"
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                           | Status                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Demo-Betriebe wirken realistisch    | ✅ vollständige Datensätze, plausible Reviews/FAQs                      |
| Keine echten Firmen                 | ✅ alle Namen frei erfunden                                              |
| Keine echten privaten Daten         | ✅ Demo-Telefon-Muster, Mails auf `*-demo.de`/`example.org`, Smoketest blockt reale Mail-Provider |
| Mehrere Branchen sichtbar           | ✅ 6 unterschiedliche Branchen                                           |
| Pakete testbar                      | ✅ Bronze (×1), Silber (×3), Gold (×2)                                   |
| Mind. 5 Demo-Betriebe               | ✅ 6 Betriebe                                                            |
| Anderes Theme pro Betrieb           | ✅ 6 unterschiedliche Themes                                             |
| Demo-Daten professionell formuliert | ✅ klare, sachliche, branchen-passende Texte                             |

### 5. Was ist offen?

- **Session 7** – Public Site Generator unter `/site/[slug]` mit
  `generateStaticParams(listMockBusinessSlugs())`, `<ThemeProvider>` pro
  Betrieb und allen Sektionen aus dem Preset.
- **Session 8** – Marketing-Subseiten / -Erweiterungen.
- **Session 9+** – Dashboard nutzt `leadsByBusiness` und
  `averageRatingByBusiness`.
- **Session 12** – echtes Lead-Erfassungssystem; Mock-Status zeigt
  bereits, wie das aussieht.
- **Sessions 13–17** – KI-Provider mit Mock-Daten als Kontext.
- **Session 19** – Repository-Layer (Mock vs. Supabase). Mock-Aufrufe
  (`getMockBusinessBySlug`, `leadsByBusiness`) sind bereits so kapselbar.

### 6. Was ist der nächste empfohlene Run?

**Session 7 – Public Site Generator.** (s. u.)

---

## Session 7 – Public Site Generator
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- Route `/site/[slug]` mit `generateStaticParams(listMockBusinessSlugs())`.
  Build:static prerendered jetzt **alle 6 Demo-Slugs** als HTML –
  funktioniert ohne Server, ideal für GitHub Pages.
- `generateMetadata` pro Business: Title (`<Name> – <Branche> in <Stadt>`),
  Description, Canonical, OpenGraph, robots index/follow – alles aus
  Business-Datensatz, keine Branchen-Hardcodierung.
- 13 Public-Site-Komponenten unter `src/components/public-site/`:
  `<PublicSection>` (theme-aware Wrapper, `lp-theme-section`),
  `<PublicSiteHeader>` (Sticky, Initial-Logo, Anrufen + Anfragen),
  `<PublicHero>` (Tagline + Hero-Title aus Preset, `{{city}}`
  substituiert, Default-CTAs, Trust-Badge),
  `<PublicServices>` (Grid sortiert nach `sortOrder`),
  `<PublicBenefits>`, `<PublicProcess>` (aus Preset),
  `<PublicReviews>` (Sterne + Schnitt + Datum),
  `<PublicFaq>` (`<details>`-Akkordeon, kein Client-JS),
  `<PublicTeam>` (nur wenn vorhanden),
  `<PublicOpeningHours>` (Tabelle mit deutschen Tag-Labels),
  `<PublicLocation>` (Adresse + Maps-Link),
  `<PublicContact>` (Direktkontakt mit funktionierenden `tel:`/`wa.me`/
  `mailto:`-Links + Anfrageformular-Vorschau aus
  `preset.leadFormFields`, aktuell `disabled`),
  `<PublicSiteFooter>` (Adresse + Impressum-/Datenschutz-Platzhalter +
  „Powered by LocalPilot AI"),
  `<PublicMobileCtaBar>` (`fixed bottom-0` auf Mobile, blendet sich bei
  `md:` aus; Anrufen/WhatsApp/Anfrage – jeder Button nur sichtbar, wenn
  die Daten vorhanden sind).
- `src/lib/contact-links.ts` mit E.164-Normalisierung
  (`telLink`, `whatsappLink`, `mailtoLink`, `formatPhoneDisplay`).
- `<ThemeProvider>` umrahmt jede Public Site → CSS-Variablen kaskadieren
  durch alle Sektionen (`bg-theme-primary`, `rounded-theme-button`,
  `shadow-theme`).
- Section-Reihenfolge aus `preset.recommendedSections` (defensiv:
  Contact / Öffnungszeiten / Standort kommen immer ans Ende).
- 404-Seite unter `src/app/site/[slug]/not-found.tsx` im Marketing-Layout.
- `/demo`-Karten verlinken jetzt aktiv auf die jeweilige Public Site.
- `lp-theme-section`-CSS-Klasse ergänzt (`padding`: `--theme-section-padding`).
- Smoketest `src/tests/public-site.test.ts`: Kontakt-Link-Normalisierung
  (Klammern, Bindestriche, Plus), Slug-Konsistenz, Pflicht „Telefon ODER
  WhatsApp" für die Mobile-CTA-Bar.
- `docs/PUBLIC_SITE.md` mit Architektur, Datenfluss, Static-Export-Regeln,
  SEO-Pattern, Mobile-First-Notes, Erweiterungsanleitung.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (16 Dateien):
- `src/app/site/[slug]/page.tsx`
- `src/app/site/[slug]/not-found.tsx`
- `src/components/public-site/{public-section,public-site-header,
  public-site-footer,public-hero,public-services,public-benefits,
  public-process,public-reviews,public-faq,public-team,
  public-opening-hours,public-location,public-contact,
  public-mobile-cta-bar,index}.tsx/.ts` (14 Dateien)
- `src/lib/contact-links.ts`
- `src/tests/public-site.test.ts`
- `docs/PUBLIC_SITE.md`

Geändert:
- `src/app/globals.css` (`lp-theme-section`-Klasse)
- `src/app/demo/page.tsx` (Public Site aktiv verlinkt)
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

### 3. Wie teste ich es lokal?

```bash
npm run typecheck       # tsc --noEmit + Smoketests
npm run lint            # 0 warnings/errors
npm run build           # SSR-Build
npm run build:static    # Static Export, alle 6 Slugs prerendered
npm run dev             # http://localhost:3000/site/studio-haarlinie etc.
```

Live-Smoketest:

```bash
for slug in studio-haarlinie autoservice-mueller glanzwerk-reinigung beauty-atelier meisterbau-schneider fahrschule-stadtmitte; do
  curl -s -o /dev/null -w "%{http_code} /site/$slug\n" "http://localhost:3000/site/$slug"
done
# erwartet: 6× 200

curl -s -o /dev/null -w "%{http_code} /site/nope\n" http://localhost:3000/site/nope
# erwartet: 404
```

Auf dem Handy: Mobile-CTA-Bar erscheint unten, drei Buttons
(Anrufen / WhatsApp / Anfrage). Tippt man Anrufen, öffnet das Wähl-UI
des Telefons; WhatsApp öffnet die App.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                       | Status                                              |
| ----------------------------------------------- | --------------------------------------------------- |
| Jede Demo hat eigene öffentliche Website        | ✅ 6 Slugs, alle erreichbar                         |
| Inhalte kommen aus Daten/Preset                 | ✅ kein Branchen-Code in Sektionen                  |
| Mobile Ansicht stark                            | ✅ Sticky-CTA-Bar, große Touch-Targets, lesbar      |
| CTA Buttons funktionieren als Links             | ✅ `tel:`, `wa.me`, `mailto:`, Maps – alles aktiv   |
| Keine harte Branchenlogik                       | ✅ alle Texte aus `IndustryPreset`                  |

### 5. Was ist offen?

- **Session 8** – Marketing-Erweiterungen (eigene `/pricing`-Seite,
  tiefere Verkaufstexte, Testimonials).
- **Session 9** – Dashboard-Grundgerüst.
- **Session 12** – ersetzt die Formular-Vorschau in `<PublicContact>`
  durch echte Lead-Erfassung (Server Action oder API).
- **Sessions 13–17** – KI-Texte verbessern Hero-Title und
  Service-Beschreibungen, ohne die Sektionen zu ersetzen.
- **Session 19** – Repository-Layer kapselt Mock vs. Supabase, Public
  Site bleibt unverändert.
- Bilder (`logoUrl`/`coverImageUrl`) sind im Schema vorgesehen, aber
  noch nicht gerendert – wenn sie kommen, via `next/image` mit
  `unoptimized: true` für Static Export.

### 6. Was ist der nächste empfohlene Run?

**Session 8 – Marketing-Landingpage erweitern.** (s. u.)

---

## Session 8 – Marketing-Landingpage erweitern
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- **Eigene `/pricing`-Seite** mit:
  - PricingGrid (Bronze/Silber/Gold-Karten),
  - **`<LimitsTable>`** – numerische Limits Bronze/Silber/Gold im
    Vergleich, nutzt `formatLimit()` für „unbegrenzt"-Werte,
  - **`<FeatureComparisonMatrix>`** – 31 Capabilities × 3 Tiers,
    gruppiert nach `FeatureGroup` (Website / Design / Anfragen /
    Bewertungen / KI / Social / Verwaltung). Reihen aus
    `FEATURE_LABELS`, Werte über `hasFeature()` – Single Source of Truth.
  - Pricing-spezifische FAQ (Mindestlaufzeit, Upgrade/Downgrade, MwSt.,
    Kündigung, KI-Pflicht, Platin-Status),
  - Schluss-CTA mit Beratung-Mail + Demo-Link + 4-Schritte-Onboarding-Karte.
- **`<DemoShowcase>`** auf der Startseite – 6 Mini-Karten mit
  `<ThemeProvider>`-Vorschau, jede aktiv als Link zur Public Site.
- **`<ValueRoi>`** – 4 ROI-Karten mit „Proof-Label" (z. B. „Eingebaut:
  Bewertungs-Booster ab Bronze").
- **`<Testimonials>`** – Beispiel-Stimmen aus den Demo-Personas
  (Lena H., Stefan M., Sophie L., Petra W.). Footnote macht klar:
  keine echten Kund:innen.
- **`<OnboardingPromise>`** – „In 4 Schritten startklar" mit zwei
  finalen CTAs (Pakete vergleichen / Demos ansehen).
- **Hero** mit zwei aktiven CTAs („Live-Demos ansehen" + „Pakete
  vergleichen").
- **PricingTeaser** verlinkt zentral auf `/pricing`.
- **IndustriesGrid** – Branchen-Karten mit Demo-Preset werden zu aktiven
  Links auf die jeweilige Public Site (Friseur → studio-haarlinie,
  Werkstatt → autoservice-mueller, Reinigung → glanzwerk-reinigung,
  Kosmetik → beauty-atelier, Handwerk → meisterbau-schneider,
  Fahrschule → fahrschule-stadtmitte).
- **CtaContact** ist konversionsstärker formuliert: zwei Direkt-Kontakte
  (E-Mail, Demo-Telefonnummer) + Demo/Pakete-Buttons.
- **Site-Header-Nav** vereinfacht: Lösung / Demos / Pakete / Designs /
  FAQ. Header-CTAs zeigen „Live-Demos" + „Pakete".
- **Startseite** als 11-Schritt-Funnel komponiert (Hero → Problem/Lösung
  → ROI → Branchen → Demo-Showcase → Pakete-Teaser → Onboarding →
  Vorteile → Stimmen → FAQ → Schluss-CTA).
- `docs/MARKETING.md` mit Funnel-Tabelle, Komponenten-Übersicht,
  Sprache- & Compliance-Regeln und Erweiterungs-Checkliste.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (8 Dateien):
- `src/app/pricing/page.tsx`
- `src/components/pricing/feature-comparison-matrix.tsx`
- `src/components/pricing/limits-table.tsx`
- `src/components/marketing/demo-showcase.tsx`
- `src/components/marketing/value-roi.tsx`
- `src/components/marketing/testimonials.tsx`
- `src/components/marketing/onboarding-promise.tsx`
- `docs/MARKETING.md`

Geändert:
- `src/components/marketing/{hero,pricing-teaser,industries,cta-contact}.tsx`
- `src/components/layout/site-header.tsx` (Nav + Header-CTAs)
- `src/components/pricing/index.ts` (neue Barrel-Exporte)
- `src/app/page.tsx` (11-Schritt-Funnel-Reassembly)
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

### 3. Wie teste ich es lokal?

```bash
npm run typecheck       # tsc --noEmit + Smoketests
npm run lint            # 0 warnings/errors
npm run build           # SSR-Build
npm run build:static    # Static Export, jetzt 13 prerendete Routen
npm run dev             # http://localhost:3000 + /pricing
```

Live-Smoketest:

```bash
# Startseite – muss alle neuen Funnel-Sektionen enthalten:
curl -s http://localhost:3000/ | grep -oE '(Live-Demos ansehen|Was bringt das|Sehen Sie, wie|In 4 Schritten startklar|Stimmen)' | sort -u

# Pricing-Seite – muss Matrix und Limits enthalten:
curl -s http://localhost:3000/pricing | grep -oE '(Wie viel ist enthalten|Was kann welches Paket|KI-Texte für die Website|Premium-Designs|Kampagnen-Generator)' | sort -u
```

Auf dem Handy: Hero-CTAs sind groß und übersichtlich. Demo-Karten der
Showcase scrollen vertikal sauber. `/pricing`-Tabellen scrollen
horizontal mit `overflow-x-auto`, Erste-Spalte ist sticky.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                    | Status                                                  |
| -------------------------------------------- | ------------------------------------------------------- |
| Produkt ist in 5 Minuten verständlich        | ✅ Hero → ROI → Demo-Showcase → Pakete – jeder Schritt klar |
| Pakete sind klar                             | ✅ `/pricing` mit Matrix + Limits + Pricing-FAQ          |
| Nutzen ist klar                              | ✅ `<ValueRoi>` mit Proof-Labels, `<Benefits>`           |
| Zielgruppe versteht das Angebot              | ✅ `<IndustriesGrid>` mit Demo-Links + `<DemoShowcase>`  |
| CTA sichtbar                                 | ✅ Hero, Pricing-Teaser, Onboarding, CtaContact – konsistent |
| Marketing Hero                               | ✅ aktive CTAs, klare Headline                           |
| Problem/Solution                             | ✅ vorhanden + ROI ergänzt                               |
| Branchenübersicht                            | ✅ jetzt mit Demo-Links                                  |
| Paketpreise Bronze/Silber/Gold               | ✅ Teaser + eigene `/pricing`-Seite                      |
| Demo-Links                                   | ✅ Showcase, Industries, Header, Hero, CTA – überall    |
| Vorteile                                     | ✅ `<ValueRoi>` + `<Benefits>` doppeln das Argument     |
| FAQ                                          | ✅ Marketing-FAQ + Pricing-FAQ                          |
| Kontaktformular                              | ✅ CTA-Sektion mit Mail + Telefon (Demo-Nummer)         |
| Verkaufsorientierte Texte                    | ✅ ohne Buzzwords, mit Proof-Labels                     |
| Seriöse Sprache                              | ✅ keine Garantien, keine Heilversprechen               |
| Mobile Optimierung                           | ✅ Hero/Cards mobile-first, Tabellen scrollen horizontal |

### 5. Was ist offen?

- **Session 9** – Dashboard-Grundstruktur (`/dashboard`, Sidebar/Mobile
  Nav, Übersicht, Paketstatus, offene Leads, Vorschau-Link).
- **Session 12** – ersetzt die Demo-Telefonnummer im CtaContact durch
  ein echtes Lead-System mit Server Action.
- **Sessions 13–17** – KI-Texte können später Hero-Versionen für A/B-Tests
  generieren.
- **Session 22** – `docs/SALES.md` mit Vertriebsskripten, die auf den
  Marketing-Sektionen basieren.
- Optional: Tracking/Analytics einbauen (Session 19+), um den Funnel zu
  messen.

### 6. Was ist der nächste empfohlene Run?

**Session 9 – Dashboard-Grundstruktur.** (s. u.)

---

## Session 9 – Dashboard-Grundstruktur
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- **`/dashboard`** – Demo-Picker mit 6 Karten. Pro Karte: Branche,
  Tier-Badge, Anfragen/Bewertung/Leistungen-Counter, aktiver Link auf
  `/dashboard/<slug>`.
- **`/dashboard/[slug]`** – per-Business-Übersicht mit
  `<DashboardShell>` (Sticky-`<BusinessHeader>` + persistente Sidebar
  auf md+ + horizontaler Mobile-Nav-Strip). 5 Cards:
  - **`<PackageStatusCard>`** – Tier, monatlich/Setup-Preis,
    Bronze→Gold-Fortschrittsbar, Hinweis auf nächste Stufe.
  - **`<PreviewLinkCard>`** – Veröffentlichungsstatus + Public-Site-
    Öffnen-Button + Einstellungen.
  - **`<LeadsSummaryCard>`** – Status-Counts in 6 farbcodierten Boxen
    (Neu/Kontaktiert/Qualifiziert/Gewonnen/Verloren/Archiviert).
  - **`<QuickActionsCard>`** – 4 Schnellaktionen (Neue Leistung,
    Anfragen prüfen, Bewertung anfragen, KI-Text erstellen),
    paketabhängig gegated mit „Verfügbar ab Silber/Gold"-Hinweis.
  - **`<RecentLeadsList>`** – 5 jüngste Anfragen mit Status, Quelle,
    Datum, optional `tel:`-Anrufen-Link.
- **7 statisch prerendete Sub-Routen** (Stubs):
  `business`, `services`, `leads`, `ai`, `reviews`, `social`,
  `settings`. Jede zeigt `<ComingSoonSection>` mit Roadmap-Bullets aus
  Claude.md, der zugewiesenen Session-Nummer und (wo passend) einem
  Paket-Gating-Hinweis (nutzt `hasFeature()`/`requiredTierFor()`).
- **`/dashboard/[slug]/not-found.tsx`** – freundliche 404-Seite.
- **`<DashboardShell>`** als Layout-Hülle. **`<BusinessHeader>`** mit
  `<details>`-basiertem Demo-Switcher (kein Client-JS), Tier-Badge und
  Public-Site-Button. **`<DashboardSidebar>`** und
  **`<DashboardMobileNav>`** lesen aus derselben `DASHBOARD_NAV`-Liste.
- **`nav-config.ts`** als Single Source of Truth: 8 Nav-Sektionen
  (Übersicht + 7 Sub) mit Label, Icon, Path-Suffix und
  `comingInSession`-Markierung.
- **`<DashboardCard>`** und **`<EmptyState>`** als wiederverwendbare
  Primitive.
- **Header-Nav** im Site-Header zeigt jetzt einen „Dashboard"-Link.
- Smoketest `src/tests/dashboard.test.ts` mit ~15 Assertions
  (Nav-Vollständigkeit, eindeutige Keys, gültige Session-Nummern,
  korrekte Href-Auflösung, Slug-Konsistenz).
- `docs/DASHBOARD.md` mit Routenbaum, Komponenten-Übersicht,
  UX-Konventionen, Static-Export-Notes, Erweiterungsanleitung.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (24 Dateien):
- `src/components/dashboard/{nav-config,dashboard-shell,dashboard-sidebar,
  dashboard-mobile-nav,business-header,dashboard-card,empty-state,
  coming-soon-section,index}.tsx/.ts` (9 Dateien)
- `src/components/dashboard/overview/{package-status-card,
  leads-summary-card,preview-link-card,quick-actions-card,
  recent-leads-list}.tsx` (5 Dateien)
- `src/app/dashboard/page.tsx` (Picker)
- `src/app/dashboard/[slug]/{layout,page,not-found}.tsx` (3 Dateien)
- `src/app/dashboard/[slug]/{business,services,leads,ai,reviews,
  social,settings}/page.tsx` (7 Dateien, alle Stubs)
- `src/tests/dashboard.test.ts`
- `docs/DASHBOARD.md`

Geändert:
- `src/components/layout/site-header.tsx` (Dashboard-Link)
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

### 3. Wie teste ich es lokal?

```bash
npm run typecheck       # tsc --noEmit + Smoketests
npm run lint            # 0 warnings/errors
npm run build:static    # Static Export, jetzt 62 prerendete Routen
npm run dev             # http://localhost:3000/dashboard
```

Schnell-Check:

```bash
curl -s -o /dev/null -w "%{http_code} /dashboard\n" http://localhost:3000/dashboard
for slug in studio-haarlinie autoservice-mueller glanzwerk-reinigung beauty-atelier meisterbau-schneider fahrschule-stadtmitte; do
  curl -s -o /dev/null -w "%{http_code} /dashboard/$slug\n" "http://localhost:3000/dashboard/$slug"
done
curl -s -o /dev/null -w "%{http_code} /dashboard/nope\n" http://localhost:3000/dashboard/nope
# erwartet: Picker 200 + 6× 200 + Bad-Slug 404
```

Auf dem Handy: Demo-Picker zeigt 6 Karten, eine Karte antippen führt
zur Übersicht. Mobile-Nav-Strip oberhalb des Inhalts ist horizontal
scrollbar; jeder Tab zeigt entweder echten Inhalt (Übersicht) oder die
Vorschau-Sektion mit Roadmap.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                       | Status                                                                  |
| ------------------------------- | ----------------------------------------------------------------------- |
| Dashboard wirkt professionell   | ✅ konsistente Karten, klare Typo, Tier-/Status-Badges, Mobile-First    |
| Navigation klar                 | ✅ Sidebar + Mobile-Strip aus derselben Konfiguration; aktive Markierung |
| Nicht-technische Sprache        | ✅ „Anfragen", „Aktiver Demo-Betrieb", „Vorschau" statt Tech-Jargon     |
| Responsive                      | ✅ Sidebar erst ab `md:`, Mobile bekommt horizontalen Nav-Strip         |
| Übersicht                       | ✅ 5 Cards plus Recent-Leads                                            |
| Paketstatus                     | ✅ `<PackageStatusCard>` mit Fortschrittsbar                            |
| Offene Leads                    | ✅ `<LeadsSummaryCard>` + `<RecentLeadsList>`                           |
| Vorschau-Link                   | ✅ `<PreviewLinkCard>` mit Public-Site-Öffnen                          |
| Schnellaktionen                 | ✅ `<QuickActionsCard>` mit paketabhängigem Gating                      |
| Dashboard-Karten                | ✅ wiederverwendbares `<DashboardCard>`                                 |
| Leere Zustände                  | ✅ `<EmptyState>` (genutzt in `<LeadsSummaryCard>` und `<RecentLeadsList>`) |

### 5. Was ist offen?

- **Session 10** – `business`-Sub-Route ausbauen (Stammdaten-Formular,
  React Hook Form, Zod, Live-Vorschau).
- **Session 11** – `services`-Sub-Route mit CRUD + Sortierung +
  Paket-Limits.
- **Session 12** – `leads`-Sub-Route mit Filter, Detail-Drawer,
  echtes Anfrageformular auf der Public Site.
- **Sessions 13–17** – `ai`, `reviews`, `social` mit Provider-Adapter
  und Vorlagen-Cards.
- **Session 18** – `settings`-Sub-Route + Feature-Lock-Vergleichsmatrix.
- **Session 19** – Auth via Supabase, Demo-Picker entfällt für
  eingeloggte Sitzungen, Repository-Layer ersetzt
  `getMockBusinessBySlug` transparent.

### 6. Was ist der nächste empfohlene Run?

**Session 10 – Betriebsdaten und Branding bearbeiten.** (s. u.)

---

## Session 10 – Betriebsdaten und Branding bearbeiten
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- **Business-Editor** unter `/dashboard/[slug]/business` ersetzt den
  Stub aus Session 9. React-Hook-Form + Zod-Resolver, validiert gegen
  `BusinessProfileSchema` (neu, Subset von `BusinessSchema`).
- **6 Form-Sektionen**:
  1. Basisdaten – Name, Tagline (`{{city}}`-Platzhalter), Beschreibung
  2. Branche & Paket – Industry-Select aus 13 Presets, Paket-Anzeige
     (Display only, mit Link auf `/pricing`)
  3. Adresse – Street, PLZ, Stadt, ISO-Land
  4. Kontakt – Telefon, WhatsApp, E-Mail, Website, Maps, Bewertungslink
  5. Öffnungszeiten – `<OpeningHoursEditor>` mit `useFieldArray`,
     pro Tag „geschlossen" oder mehrere Slots (Mittagspause möglich)
  6. Branding & Design – `<ThemePickerField>` (10 Themes als Karten),
     optionale Color-Overrides, Logo- und Cover-URL-Felder
- **`<BusinessEditPreview>`** – Live-Vorschau mit `<ThemeProvider>` +
  `useWatch()`. Reagiert sofort auf Änderungen. Sticky-Sidebar Desktop,
  oben auf Mobile.
- **Mock-Store** in `src/lib/mock-store/`:
  `getOverride`/`setOverride`/`clearOverride`/`hasOverride` über
  localStorage mit versioniertem Schlüssel
  (`lp:business-override:v1:<slug>`) und defensiver Schema-Validierung.
- **Form-Primitive** in `src/components/forms/`:
  `<FormSection>`, `<FormField>`, `<FormInput>`, `<FormTextarea>`,
  `<FormSelect>`.
- **Status-Bar** im Editor (sticky): „Lokale Anpassung aktiv", Anzahl
  Fehler, Demo-Defaults laden, Verwerfen, Speichern.
- **Sidebar** zeigt `Betriebsdaten` jetzt als produktive Sektion.
- **Smoketest** `src/tests/business-edit.test.ts` (~10 Assertions).
- **`docs/BUSINESS_EDITOR.md`** mit Architektur und Erweiterungsanleitung.
- Dependencies ergänzt: `react-hook-form@7.54.2`,
  `@hookform/resolvers@3.10.0`.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (12 Dateien):
- `src/core/validation/business-profile.schema.ts`
- `src/lib/mock-store/{business-overrides,business-profile,index}.ts`
- `src/components/forms/{form-section,form-field,index}.tsx/.ts`
- `src/components/dashboard/business-edit/{business-edit-form,
  business-edit-preview,opening-hours-editor,theme-picker-field,
  index}.tsx/.ts`
- `src/tests/business-edit.test.ts`
- `docs/BUSINESS_EDITOR.md`

Geändert:
- `src/app/dashboard/[slug]/business/page.tsx` (Stub → echter Editor)
- `src/components/dashboard/nav-config.ts` (`business` jetzt produktiv)
- `src/core/validation/index.ts` (re-exportiert Profile-Schema)
- `src/tests/dashboard.test.ts` (≥ 2 produktive Sektionen)
- `package.json` / `package-lock.json`
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

### 3. Wie teste ich es lokal?

```bash
npm install               # RHF + Resolvers nachziehen
npm run typecheck         # tsc --noEmit + Smoketests
npm run lint              # 0 warnings/errors
npm run build:static      # Static Export
npm run dev               # http://localhost:3000/dashboard/beauty-atelier/business
```

Manuelle Schritte im Browser:
1. `/dashboard/beauty-atelier/business` öffnen.
2. Name oder Tagline ändern → Live-Vorschau aktualisiert sich sofort.
3. Theme wechseln → Vorschau übernimmt Farben/Schriften.
4. „Speichern" tippen → grüner Hinweis, Reload zeigt persistierten Stand.
5. „Demo-Defaults laden" → Original kommt zurück.
6. Pflichtfeld leeren → Inline-Fehler + Error-Counter im Status-Bar.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                       | Status                                                                  |
| ------------------------------- | ----------------------------------------------------------------------- |
| Betreiber kann Betrieb bearbeiten | ✅ alle 6 Demo-Slugs unter `/dashboard/<slug>/business`               |
| Änderungen sind sichtbar        | ✅ Live-Themed-Preview + Reload zeigt persistierten Stand               |
| Formular ist einfach            | ✅ 6 klar getrennte Sektionen, deutsche Labels & Hilfetexte             |
| Validierung verständlich        | ✅ Inline-Fehler unter dem Feld, Fehler-Counter im Status-Bar           |
| Business-Formular               | ✅ vollständig, Schema-validiert                                         |
| Kontaktdaten / Adresse          | ✅ je eigene Sektion                                                     |
| Öffnungszeiten                  | ✅ 7-Tage-Editor mit „geschlossen"-Toggle und mehreren Slots             |
| Branche wählen                  | ✅ Select aus 13 Presets                                                 |
| Paket anzeigen                  | ✅ Display-Card mit Link auf `/pricing`                                 |
| Theme wählen                    | ✅ Visueller Picker mit Color-Swatches                                   |
| Farben ändern                   | ✅ Drei Override-Felder (primary/secondary/accent)                       |
| Logo / Bildplatzhalter          | ✅ Logo-URL + Cover-URL als Felder                                       |
| Speichern mit Mock-Layer        | ✅ localStorage über `business-overrides.ts`                             |

### 5. Was ist offen?

- **Session 11** – `services`-Sub-Route mit CRUD-Form und Sortierung
  (gleiches RHF + Mock-Store-Pattern).
- **Session 12** – Lead-System (echtes Anfrageformular auf Public Site
  + Detail-Drawer im Dashboard).
- **Sessions 13–17** – KI-Provider, Bewertungs-Booster, Social-Generator.
- **Session 18** – `settings`-Page (Slug, Veröffentlichungsstatus,
  Locale).
- **Session 19** – Storage-Backend für Logo/Cover-Upload + Supabase-
  Repository (ersetzt localStorage-Mock).
- Optional: nativer `<input type="color">` statt Hex-Text-Feld.

### 6. Was ist der nächste empfohlene Run?

**Session 11 – Leistungen verwalten.** (s. u.)

---

## Session 11 – Leistungen verwalten
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

- **Services-Editor** unter `/dashboard/[slug]/services` ersetzt den
  Stub aus Session 9. Pattern: gleiche RHF + Zod-Resolver +
  localStorage-Architektur wie der Business-Editor (Session 10), aber
  mit `useFieldArray` für die Service-Liste.
- **`<ServicesEditForm>`** als top-level Client-Form mit:
  - sticky Status-Bar (lokaler Override-Hinweis, Fehler-Counter,
    Speichern/Verwerfen/Demo-Defaults laden),
  - Block-Speichern bei Limit-Überschreitung (kein kaputter Zustand),
  - „Verwerfen" fällt auf den persistierten Override zurück,
    nicht auf den Demo-Default.
- **`<ServiceCard>`** als kollabierbare `<details>`-Karte:
  - Header mit Titel, Kategorie, Preis-Label, „Hervorgehoben"/
    „Inaktiv"/„Fehler"-Badges, Reihenfolge-Pfeilen (↑↓),
    Aufklapp-Pfeil.
  - Body: Form-Felder Titel*, Kategorie, Preis-Label, Dauer,
    Kurzbeschreibung; Toggles für Aktiv und Hervorgehoben;
    Inline-Bestätigung beim Entfernen.
  - Versteckte System-Felder (`id`, `businessId`, `sortOrder`)
    werden mit `register("...")` mitgeführt.
  - Karten mit Validierungsfehlern öffnen sich automatisch.
- **`<ServicesSummary>`** mit Live-Indikator:
  - „X von Y Leistungen genutzt" inkl. Fortschrittsbar.
  - Aktiv-/Featured-Counter.
  - Warnungen für „Limit erreicht" / „Über Limit" mit Upgrade-Link
    nach `/pricing`.
- **Empty-State** bei leerer Liste: zwei Wege – „Erste Leistung
  anlegen" (leeres Service-Objekt) oder „Aus Branchen-Preset
  übernehmen" (konvertiert `preset.defaultServices` zu vollständigen
  `Service`-Objekten mit frischen IDs).
- **Sortier-Logik**: ↑↓-Pfeile per Karte rufen `useFieldArray.swap()`.
  Beim Speichern werden `sortOrder`-Werte konsekutiv auf 0..n-1
  zurückgeschrieben (`normalizeOrder`).
- **Mock-Store** `src/lib/mock-store/services-overrides.ts` –
  `getServicesOverride` / `setServicesOverride` /
  `clearServicesOverride` / `hasServicesOverride` mit
  versionierten localStorage-Schlüsseln
  (`lp:services-override:v1:<slug>`) und defensiver
  Schema-Validierung. Plus `getEffectiveServices(slug, fallback)` als
  Hook für die spätere Public-Site-Integration.
- **Paket-Gating**: Bronze (`service_management` nicht enthalten)
  zeigt weiterhin `<ComingSoonSection>` plus Public-Site-Hinweis.
  Silber/Gold bekommen den vollen Editor. `isLimitExceeded()` blockt
  das Speichern bei Über-Limit-Zuständen.
- **Smoketest** `src/tests/services-edit.test.ts` (~12 Assertions):
  Form-Schema akzeptiert alle 6 Demo-Listen, `sortOrder` pro Business
  eindeutig und nicht-negativ ganzzahlig, Service-IDs projektweit
  eindeutig, Paket-Limits stimmen, Mock-Store SSR-sicher.
- **`docs/SERVICES_EDITOR.md`** mit Architektur, Datenfluss,
  Funktionen, Persistierungs-API, Paket-Gating-Tabelle.
- Sidebar zeigt `Leistungen` jetzt als produktive Sektion (kein
  „Vorschau"-Badge mehr für Silber/Gold).

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (7 Dateien):
- `src/lib/mock-store/services-overrides.ts`
- `src/components/dashboard/services-edit/{services-edit-form,
  service-card,services-summary,index}.tsx/.ts` (4 Dateien)
- `src/tests/services-edit.test.ts`
- `docs/SERVICES_EDITOR.md`

Geändert:
- `src/app/dashboard/[slug]/services/page.tsx` (Stub → Editor mit
  Bronze-Gate)
- `src/components/dashboard/nav-config.ts` (`services` jetzt produktiv)
- `src/lib/mock-store/index.ts` (re-exportiert services-overrides)
- `src/tests/dashboard.test.ts` (≥ 3 produktive Sektionen erwartet)
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

### 3. Wie teste ich es lokal?

```bash
npm run typecheck         # tsc --noEmit + Smoketests
npm run lint              # 0 warnings/errors
npm run build:static      # Static Export
npm run dev               # http://localhost:3000/dashboard/beauty-atelier/services
```

Manuell im Browser:
1. `/dashboard/beauty-atelier/services` (Gold) öffnen → voller Editor.
2. Neue Leistung hinzufügen → leere Karte erscheint, Title-Pflichtfeld
   blockt das Speichern bis ausgefüllt.
3. ↑↓-Pfeile → Reihenfolge ändert sich.
4. Aktiv-Toggle ausschalten → Karte wird optisch gedimmt, Badge
   „Inaktiv".
5. „Speichern" → grüner Hinweis, Reload zeigt persistierten Stand.
6. „Demo-Defaults laden" → Original kommt zurück.
7. `/dashboard/meisterbau-schneider/services` (Bronze) → zeigt
   Coming-Soon mit Upgrade-Hinweis statt Editor.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                     | Status                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| Leistungen vollständig verwaltbar | ✅ Liste, Anlegen, Bearbeiten, Aktiv/Inaktiv, Featured, Sortierung, Löschen, Preset-Import |
| Bronze-Limit greift           | ✅ `isLimitExceeded` blockt Speichern; UI zeigt „Limit erreicht"/„Über Limit"               |
| UI einfach                    | ✅ kollabierbare Karten, klare Toggles, Inline-Bestätigung beim Entfernen                    |
| Keine kaputten Zustände       | ✅ Speichern blockiert bei Over-Limit, Sort-Order bei Save normalisiert                      |
| Services-Liste                | ✅ vollständig                                                                                |
| Service anlegen / bearbeiten / löschen | ✅                                                                                       |
| aktiv/inaktiv                 | ✅                                                                                           |
| Preislabel / Kategorie / Beschreibung | ✅                                                                                       |
| Sortierung                    | ✅ ↑↓-Pfeile + Auto-Normalisierung                                                            |
| Paketlimit beachten           | ✅ Live-Bar + Save-Block                                                                      |
| Vorschau zur Public Site      | ✅ via BusinessHeader-Button (Session 9) auf jeder Dashboard-Seite                            |

### 5. Was ist offen?

- **Session 12** – Lead-System: echte Anfrageformular-Submission auf
  der Public Site (Server Action) plus Detail-Drawer im Dashboard.
- **Sessions 13–17** – KI-Assistent für Service-Beschreibungen,
  FAQ-Generator, Bewertungs-Booster, Social-Generator.
- **Session 18** – Settings-Page (Slug, Veröffentlichung, Locale).
- **Session 19** – Repository-Layer ersetzt
  `services-overrides.ts` transparent (Supabase-Tabelle pro Service,
  echte Sync zwischen Dashboard und Public Site).
- Optional: Drag-and-Drop für Sortierung statt ↑↓-Pfeile (UX-Polish).

### 6. Was ist der nächste empfohlene Run?

**Session 12 – Lead-System.** (s. u.)

---

## Session 12 – Lead-System
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

Drei Bauteile gleichzeitig:

**Public Site – `<PublicLeadForm>`**
- Ersetzt das deaktivierte Vorschau-Formular aus Session 7.
- Client Component, Felder dynamisch aus `preset.leadFormFields` der
  jeweiligen Branche.
- Manuelle Validierung: Pflichtfelder, E-Mail-Format, Telefon-
  Mindestlänge plus Geschäftsregel „Telefon ODER E-Mail".
- Submit konstruiert ein `Lead`-Objekt, parst es mit
  `LeadSchema.safeParse` und schreibt es per `appendLead(slug, lead)`
  in den Browser-Storage.
- Erfolgs-Zustand mit „Weitere Anfrage senden"-Button. Fehler-Hinweise
  inline + Fallback-Banner bei Persistierungsproblemen.
- Standard-Felder werden auf das Lead-Modell gemappt; alle weiteren
  Keys aus dem Preset (z. B. `vehicleModel`, `objectType`,
  `drivingClass`) landen in `extraFields`.

**Dashboard – `<LeadsView>`**
- Toolbar mit Status-Filter-Pills (Alle, Neu, Kontaktiert, Qualifiziert,
  Gewonnen, Verloren, Archiviert) inkl. Live-Counter pro Status.
- Volltextsuche über Name, Telefon, E-Mail, Nachricht.
- Listen-/Detail-Layout: Click in der Liste öffnet einen Detail-Pane in
  der Sidebar (Desktop) bzw. unterhalb der Liste (Mobile).
- Detail-Pane:
  - Direktkontakt-Buttons (`tel:`, `wa.me`, `mailto:`).
  - Status-Pill-Buttons in den 6 Status-Farben (Wechsel mit einem
    Klick, Persistierung über `updateStoredLead`).
  - Anzeige der Original-Nachricht und der branchen-spezifischen
    Zusatzfelder (`extraFields`).
  - Notizen-Textarea mit „Speichern" / „Verwerfen" für Drafts.
  - 3 branchen-neutrale Antwort-Vorlagen (kurz, freundlich, Detail) mit
    Copy-to-Clipboard und Live-Vorschau bereits aufgelöster Platzhalter
    (`{{name}}`, `{{betrieb}}`).
- „Lokale Anfragen leeren"-Button entfernt nur Browser-Einträge,
  Demo-Leads bleiben erhalten.

**Mock-Store – `leads-overrides.ts`**
- API: `appendLead`, `updateStoredLead`, `getStoredLeads`,
  `hasStoredLeads`, `clearStoredLeads`, `getEffectiveLeads`,
  `countByStatus`, `generateLeadId`.
- Versionierter localStorage-Schlüssel `lp:leads-override:v1:<slug>`,
  defensive Schema-Validierung beim Lesen UND Schreiben.
- `getEffectiveLeads(slug, fallback)` mergt Demo-Mock-Leads mit
  persistierten Einträgen, sortiert nach `createdAt` absteigend.
- SSR-sicher: ohne `window` liefert er konsistent leere Listen / no-op.

**Drumherum**
- Sidebar-Eintrag „Anfragen" ist jetzt produktiv (kein
  „Vorschau"-Badge mehr für Silber/Gold).
- Bronze (kein `lead_management`) bleibt auf `<ComingSoonSection>`,
  zeigt aber zusätzlich, wie viele Demo-Anfragen anliegen.
- Smoketest `src/tests/leads-system.test.ts` (~15 Assertions).
- `docs/LEAD_SYSTEM.md` mit Architektur, Datenfluss, Persistierungs-
  API, Compliance-Notes und Paket-Gating-Tabelle.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (6 Dateien):
- `src/lib/mock-store/leads-overrides.ts`
- `src/components/public-site/public-lead-form.tsx`
- `src/components/dashboard/leads-view/leads-view.tsx`
- `src/components/dashboard/leads-view/reply-templates.ts`
- `src/components/dashboard/leads-view/index.ts`
- `src/tests/leads-system.test.ts`
- `docs/LEAD_SYSTEM.md`

Geändert:
- `src/components/public-site/public-contact.tsx` (Vorschau-Form
  → echtes `<PublicLeadForm>`)
- `src/components/public-site/index.ts` (Re-Export)
- `src/app/dashboard/[slug]/leads/page.tsx` (Stub → `<LeadsView>` mit
  Bronze-Gate)
- `src/components/dashboard/nav-config.ts` (`leads` produktiv)
- `src/lib/mock-store/index.ts` (re-exportiert leads-overrides)
- `src/tests/dashboard.test.ts` (≥ 4 produktive Sektionen erwartet)
- `README.md`, `CHANGELOG.md`, `docs/TECHNICAL_NOTES.md`,
  `docs/RUN_LOG.md`

### 3. Wie teste ich es lokal?

```bash
npm run typecheck        # tsc --noEmit + Smoketests
npm run lint             # 0 warnings/errors
npm run build:static     # Static Export
npm run dev              # http://localhost:3000
```

Manuell:
1. `/site/beauty-atelier#kontakt` öffnen → Anfrageformular ausfüllen,
   absenden → Erfolgs-Zustand erscheint.
2. `/dashboard/beauty-atelier/leads` öffnen → die eben gesendete
   Anfrage steht oben in der Liste (über den Demo-Anfragen).
3. Anfrage anklicken → Detail-Pane mit Direktkontakt, Status,
   Notizen, Antwort-Vorlagen.
4. Status auf „Kontaktiert" wechseln → Pill färbt sich amber.
5. Notiz tippen → „Speichern" → State persistiert.
6. „Kurze Bestätigung" kopieren → Clipboard enthält den fertigen Text
   mit Name + Betrieb.
7. `/dashboard/meisterbau-schneider/leads` (Bronze) → Coming-Soon-
   Block plus Hinweis „X Demo-Anfragen liegen an".

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                          | Status                                                                |
| ---------------------------------- | --------------------------------------------------------------------- |
| Leads können erstellt werden       | ✅ `<PublicLeadForm>` schreibt via `appendLead`                       |
| Leads erscheinen im Dashboard      | ✅ `<LeadsView>` mergt Browser-Leads mit Demo-Mocks (`getEffectiveLeads`) |
| Statusänderung funktioniert        | ✅ Pill-Buttons mit `updateStoredLead`                                |
| Formular ist branchenspezifisch    | ✅ Felder aus `preset.leadFormFields`                                 |
| Keine sensiblen unnötigen Daten    | ✅ kein Geburtstag, keine Adresse, keine Kontonummer                   |
| Dynamisches Kontaktformular        | ✅ alle Field-Typen aus `LeadFormFieldType` werden gerendert          |
| Lead speichern                     | ✅ localStorage + `LeadSchema.parse` defensive                         |
| Lead-Dashboard                     | ✅ Filter, Suche, Detail-Pane                                         |
| Notizen                            | ✅ Textarea mit Speichern/Verwerfen                                   |
| Detailansicht                      | ✅ `<LeadDetail>` als Sidebar/Below-List                              |
| Antwort kopieren                   | ✅ 3 Vorlagen, Copy mit „Kopiert"-Bestätigung                         |
| Filter / Suche                     | ✅                                                                     |

### 5. Was ist offen?

- **Sessions 13–15** – KI-Assistent kann Antworten je Anfrage
  generieren (Branche + USPs + Lead-Daten als Kontext).
- **Session 16** – Bewertungs-Booster: nutzt `email`/`phone` aus
  `won`-Leads, um nach erfolgtem Termin eine Vorlage zu schicken.
- **Session 18** – Settings: Lead-Routing, Webhook-URL, Auto-Reply.
- **Session 19** – Repository-Layer: ersetzt `leads-overrides` durch
  Supabase + Realtime; Public Site triggert eine Server Action,
  Dashboard streamt neue Leads.
- Optional: CSV-Export für Übergabe an externes CRM.
- Optional: Filter nach Quelle (Website, Telefon, WhatsApp, …).

### 6. Was ist der nächste empfohlene Run?

**Methodik-Wechsel zuerst** (s. u.). Erst danach Code-Session 13
(AI-Provider-Scaffold), bewusst klein zugeschnitten.

---

## Methodik-Wechsel — vor Code-Session 13
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`

### 1. Was wurde umgesetzt?

Das Programm-Modell wurde fundamental umgestellt: vom „22 Sessions, dann
fertig"-Sprint zu einem **dauerhaften Programm mit rollenden Meilensteinen**.

- **`Claude.md`** hat einen neuen Abschnitt 0 „PROGRAMM-PHILOSOPHIE", der
  vor allem anderen gilt:
  - Sessions sind klein und atomar (30–60 Min., 30–80 KB Diff).
  - Pro Session ein Recherche-Step (WebSearch + Quellen-Zitierung).
  - Sessions 1–22 sind Inhaltsverzeichnis, kein Zeitplan; Code-Session-
    Nummern dürfen frei wachsen.
  - Es gibt kein „Projekt fertig" – Meilenstein 7 läuft permanent.
  - Maintenance/Polish/Security/A11y/Performance/Doku gleichberechtigt
    zu Features.
- **`Claude.md`** Abschnitt 22 („Session-Plan") explizit als
  Inhaltsverzeichnis markiert, nicht mehr als Zeitplan.
- **`docs/PROGRAM_PLAN.md`** definiert 7 rollende Meilensteine
  (Foundation ✅, KI-Schicht 🔄, Engagement, Backend, Production,
  Vertikalisierung, Innovation Loop ♾️). Jeder mit eigenem
  Erfolgskriterium, ohne fixe Session-Anzahl.
- **`docs/SESSION_PROTOCOL.md`** ist der verbindliche Ablauf jeder
  Code-Session: Größenbegrenzung, Recherche-Step, Verifikation
  (typecheck/lint/build/smoke), Doku, Commit. 9 gleichberechtigte
  Session-Typen (Feature, Refactor, Polish, A11y, Performance, Security,
  DX, Doku, Research-Only).
- **README.md** reframt von „Aktueller Stand: Session 12 von 22" auf
  „Meilenstein 1 (Foundation) ✅ stabil, ab Code-Session 13 startet
  Meilenstein 2 (KI-Schicht) in kleineren atomaren Sessions".

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu:
- `docs/PROGRAM_PLAN.md`
- `docs/SESSION_PROTOCOL.md`

Geändert:
- `Claude.md` (neuer Abschnitt 0, Hinweis in Abschnitt 22)
- `README.md` (Aktueller-Stand-Block, Doku-Liste)
- `CHANGELOG.md` (Versions-Block 0.13.0 + neuer Geplant-Block)
- `docs/RUN_LOG.md` (dieser Eintrag)

Kein Source-Diff – die Änderung ist organisatorisch.

### 3. Wie teste ich es lokal?

```bash
npm run typecheck     # MUSS grün bleiben (kein Source-Code geändert)
npm run lint          # MUSS grün bleiben
npm run build:static  # MUSS grün bleiben
```

Manuell:
- `Claude.md`, `docs/PROGRAM_PLAN.md`, `docs/SESSION_PROTOCOL.md` und
  `README.md` lesen und auf Konsistenz prüfen.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                     | Status |
| --------------------------------------------- | ------ |
| Programm hat keinen festen Endpunkt           | ✅      |
| Pro Session ein Recherche-Step ist verbindlich | ✅      |
| Sessions sind kleiner zugeschnitten (Limits dokumentiert) | ✅ |
| Meilensteine sind benannt und priorisiert     | ✅      |
| `Claude.md` bleibt inhaltlicher Anker         | ✅      |
| Build/Typecheck/Lint bleiben grün             | ✅ (kein Source-Diff) |

### 5. Was ist offen?

- Erste Session nach neuem Protokoll = **Code-Session 13**
  (AI-Provider-Scaffold). Sehr klein zugeschnitten:
  - Nur das `src/core/ai/`-Verzeichnis-Skelett + Re-Export-Barrel.
  - Eine Stub-Datei pro Provider (mock/openai/anthropic/gemini),
    jede wirft `AIProviderError("provider_unavailable")`.
  - Provider-Resolver `getAIProvider()` mit ENV-Gate
    (`AI_PROVIDER` + automatic Fallback auf `mock`).
  - Smoketest in `src/tests/ai-provider-resolver.test.ts`.
  - Keine echten API-Calls, kein Dashboard-UI in dieser Session.
- Code-Sessions 14+ befüllen Mock-Provider mit hochwertigen
  Beispieltexten, jeweils EINE Methode pro Session.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 13 – AI-Provider-Scaffold (klein).**

Ein einziges atomares Deliverable:
1. WebSearch zu „Anthropic SDK 2026 + AI provider abstraction
   patterns" für aktuelle Best-Practices.
2. `src/core/ai/`-Modul mit Provider-Stubs anlegen (alle Methoden
   werfen `AIProviderError("provider_unavailable")`).
3. `getAIProvider()`-Resolver mit ENV-Gate.
4. Smoketest, der den Resolver + Fallback auf `mock` prüft.
5. CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT in dieser Session:
- Mock-Provider-Implementierung (kommt in Code-Session 14).
- Dashboard-UI für AI (kommt nach Code-Session 17).
- Echte API-Calls (kommen in Code-Sessions 21–24).

### Quellen (Methodik-Recherche)

- [Innovecs – SaaS Development Process: The Updated Guide for 2026](https://innovecs.com/blog/saas-development-process/)
- [Riseup Labs – Software Development Methodologies: Complete 2026 Guide](https://riseuplabs.com/software-development-methodologies/)
- [Basecamp – Shape Up: Stop Running in Circles and Ship Work that Matters](https://basecamp.com/shapeup)
- [ProductPlan – Shape Up Method Glossary](https://www.productplan.com/glossary/shape-up-method)
- [Curious Lab – What is Basecamp's Shape Up method?](https://www.curiouslab.io/blog/what-is-basecamps-shape-up-method-a-complete-overview)

---

## Code-Session 13 – AI-Provider-Scaffold
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar)
Meilenstein: 2 (KI-Schicht)

### 1. Was wurde umgesetzt?

Erste Session nach dem neuen Protokoll. Bewusst klein gehalten.

- `src/core/ai/providers/_stub.ts` – `buildStubProvider(key, message)`-
  Helper, baut einen typisierten `AIProvider`, dessen 7 Methoden alle
  `AIProviderError("provider_unavailable")` werfen. So kann jeder
  einzelne Provider später Methode für Methode scharf gemacht werden,
  ohne dass die Resolver-Logik angepasst werden muss.
- 4 Provider-Stub-Module (`mock`, `openai`, `anthropic`, `gemini`),
  jeweils einzeilig: nur der Aufruf von `buildStubProvider` mit eigener
  Fehlermeldung (welche Code-Session den jeweiligen Provider scharf
  macht).
- `src/core/ai/ai-client.ts` mit:
  - `getAIProvider(opts?)` – liest `AI_PROVIDER` aus der ENV (oder
    aus dem optionalen `opts.env` für Tests/API-Routes), wählt den
    passenden Provider, prüft den jeweils nötigen API-Key
    (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`/`GEMINI_API_KEY`), fällt
    defensiv auf `mock` zurück bei jedem Problem (kein Wert,
    ungültiger Wert, leerer Key). Wirft niemals.
  - `describeActiveProvider(opts?)` für spätere Diagnose-Karten:
    welcher Provider würde zurückkommen und warum (`explicit`,
    `fallback_unset`, `fallback_invalid`, `fallback_no_key`).
  - `AI_PROVIDERS`-Lookup-Map (read-only) für Tests/Debug.
- `src/core/ai/index.ts` – Barrel.
- `src/tests/ai-provider-resolver.test.ts` mit 22 Assertions, die alle
  Resolver-Pfade abdecken.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (8 Dateien):
- `src/core/ai/ai-client.ts`
- `src/core/ai/index.ts`
- `src/core/ai/providers/_stub.ts`
- `src/core/ai/providers/{mock,openai,anthropic,gemini}-provider.ts`
- `src/tests/ai-provider-resolver.test.ts`

Geändert:
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Entfernt: `.gitkeep` in `src/core/ai/providers` und `src/core/ai/prompts`.

Diff-Größe ~30 KB. Liegt klar im Session-Limit (30–80 KB).

### 3. Wie teste ich es lokal?

```bash
npm run typecheck      # tsc --noEmit – Smoketest läuft mit
npm run lint           # 0 warnings/errors
npm run build:static   # Static-Export bleibt grün
```

Programmatisch:

```ts
import { getAIProvider, describeActiveProvider } from "@/core/ai";

getAIProvider().key;                              // "mock" (ohne ENV)
getAIProvider({ providerKey: "openai" }).key;     // "mock" (ohne API-Key)
describeActiveProvider({ env: { AI_PROVIDER: "anthropic" } });
// → { requested: "anthropic", active: "mock", reason: "fallback_no_key" }
```

UI-Test entfällt – diese Session bringt keine UI mit.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                              | Status |
| ------------------------------------------------------ | ------ |
| `src/core/ai/`-Verzeichnis-Skelett + Re-Export-Barrel  | ✅      |
| 4 Provider-Stubs, alle werfen `provider_unavailable`   | ✅      |
| `getAIProvider()`-Resolver mit ENV-Gate                | ✅      |
| Defensiver Fallback auf `mock` bei jedem Problem       | ✅      |
| Smoketest deckt alle Resolver-Pfade ab (22 Assertions) | ✅      |
| Build/Typecheck/Lint grün                              | ✅      |
| Session-Größe im Limit (30–80 KB)                      | ✅ (~30 KB) |

### 5. Was ist offen?

- **Code-Session 14**: Mock-Provider mit `generateWebsiteCopy`-
  Implementation. Branchenneutrale, hochwertige Beispieltexte mit
  `{{city}}`-Platzhalter-Substitution, abgeleitet aus dem
  `IndustryPreset`. Nur diese eine Methode – die anderen 6 bleiben
  Stubs.
- **Code-Sessions 15–17**: je eine weitere Mock-Methode
  (`improveServiceDescription`, `generateFaqs`, `generateCustomerReply`).
- **Später**: API-Route `/api/ai/generate` (sobald wir SSR-fähig sind),
  Dashboard-Karte unter `/dashboard/[slug]/ai`, echte Provider mit
  Caching, Cost-Tracking.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 14 – Mock-Provider: `generateWebsiteCopy`.**

Klein zugeschnitten:

1. WebSearch zu „2026 Patterns für branchenneutrale Beispiel-Website-
   Texte" + Best-Practices für Mock-AI.
2. `mock-provider.ts`: `generateWebsiteCopy` ersetzt den Stub durch
   eine deterministische, branchenneutrale Implementation, die aus
   dem `AIBusinessContext` (Industry-Key, City, Tonalität, USPs)
   ein `WebsiteCopyOutput` zusammenbaut. Unterschiedliche `variant`-
   Werte liefern unterschiedliche Texte.
3. Smoketest: `mockProvider.generateWebsiteCopy({ context, variant })`
   für jeweils 2 Branchen × 2 Varianten testet, dass Title/Subtitle/
   AboutText nicht leer und nicht generisch sind.
4. CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: andere 6 Methoden, UI, echte Provider.

### Quellen (Recherche zu dieser Code-Session)

- [DEV Community – Multi-Provider AI App: OpenAI + Anthropic + Google in One SDK](https://dev.to/neurolink/multi-provider-ai-app-openai-anthropic-google-in-one-sdk-40n6)
- [DEV Community – Building AI Agent With Multiple AI Model Providers Using an LLM Gateway](https://dev.to/crosspostr/building-ai-agent-with-multiple-ai-model-providers-using-an-llm-gateway-openai-anthropic-gemini-fl2)
- [AISIX AI Gateway – Provider Abstraction](https://docs.api7.ai/aisix/core-concepts/provider-abstraction)
- [pydantic-ai – Model Architecture and Provider System](https://deepwiki.com/pydantic/pydantic-ai/4.1-model-architecture-and-provider-system)

---

## Code-Session 14 – Mock-Provider: `generateWebsiteCopy`
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar)
Meilenstein: 2 (KI-Schicht)

### 1. Was wurde umgesetzt?

Der Mock-Provider erhält die erste echte Methode. Bewusst nur eine
von sieben — die anderen bleiben Stubs und werden in Folge-Sessions
einzeln scharf gemacht.

- `src/core/ai/providers/mock/website-copy.ts` (neu) implementiert
  `mockGenerateWebsiteCopy(input): Promise<WebsiteCopyOutput>`:
  - Validierung des Inputs via `WebsiteCopyInputSchema.safeParse`
    → bei Fehler `AIProviderError("invalid_input", …)`.
  - `getPresetOrFallback(industryKey)` liefert die Branchen-Defaults
    (Hero-Title, Hero-Subtitle, Tagline, Zielgruppe, Label).
  - `{{city}}`-Platzhalter werden über `substituteCity` ersetzt;
    fehlt `city`, greift „Ihrer Stadt" als Fallback.
  - Vier Varianten verändern den Schwerpunkt:
    - `hero` → Preset-Hero unverändert, About fasst Tonalität +
      Standort + USPs zusammen.
    - `about` → Hero auf den Betriebsnamen fokussiert, About
      ausführlicher mit Mission und USP-Bulletliste.
    - `services_intro` → Hero kündigt die Leistungen an,
      About bleibt knapp („klar beschrieben, fair bepreist").
    - `benefits_intro` → Hero rahmt drei Argumente, About
      formuliert sie als 1./2./3.
  - `joinTone`, `uspBullets`, `compactAudience`, `clamp` sind kleine,
    pure Helper. `clamp` schneidet auf Wortgrenze, damit die
    Schema-Limits (160/280/1200) nie hart überlaufen.
  - Letzter Schritt: `WebsiteCopyOutputSchema.parse(result)` als
    defensives Sicherheitsnetz. So kann der Mock später keine
    strengeren Schema-Checks an anderer Stelle brechen.
- `src/core/ai/providers/mock-provider.ts` (geändert) komponiert den
  Stub mit der neuen Methode:
  ```ts
  export const mockProvider: AIProvider = {
    ...stub,
    generateWebsiteCopy: mockGenerateWebsiteCopy,
  };
  ```
  Stub-Fehlermeldung präzisiert auf „Diese Mock-Methode ist noch
  nicht implementiert. Sie wird in einer der folgenden Code-Sessions
  ergänzt."
- `src/tests/ai-mock-provider.test.ts` (neu) – Smoketest mit
  ~30 Assertions:
  - 2 Branchen (`hairdresser`, `auto_workshop`) × 4 Varianten →
    `heroTitle`/`heroSubtitle`/`aboutText` nicht leer und ≤ Limit.
  - `{{city}}`-Substitution: „Bremen" / „Leipzig" landen im Output;
    ohne `city` keine Template-Reste.
  - USP („Termine auch samstags") und `businessName` („Salon Sophia")
    erscheinen im `about`-Variant-Output.
  - Determinismus: zweimal identischer Input → identische Antwort.
  - `hint` taucht im `aboutText` auf.
  - Ungültiges Input → `AIProviderError("invalid_input")`. Auch
    `businessName` mit nur einem Zeichen wird abgefangen.
  - Die übrigen 6 Methoden werfen weiterhin
    `AIProviderError("provider_unavailable")`.
  - `mockProvider.key === "mock"`.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (2 Dateien):
- `src/core/ai/providers/mock/website-copy.ts`
- `src/tests/ai-mock-provider.test.ts`

Geändert:
- `src/core/ai/providers/mock-provider.ts`
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~16 KB. Klar im Session-Limit (30–80 KB), eher noch unter
dem Untergrenzen-Soll — die Methode ist isoliert und ein Wachstum auf
6 weitere Methoden würde linear weitergehen.

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
npx tsx src/tests/ai-mock-provider.test.ts            # 0 → alle Asserts ok
npx tsx src/tests/ai-provider-resolver.test.ts        # 0 → keine Regression
```

Programmatisch:

```ts
import { mockProvider } from "@/core/ai/providers/mock-provider";

await mockProvider.generateWebsiteCopy({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich", "modern"],
    uniqueSellingPoints: ["Termine auch samstags"],
  },
  variant: "about",
});
// → { heroTitle: "Über Salon Sophia",
//     heroSubtitle: "…",
//     aboutText: "Salon Sophia steht für freundlich und modern …" }
```

UI-Test entfällt – diese Session bringt keine UI mit. Eine
Dashboard-Karte, die diese Methode aufruft, kommt in einer
späteren Session.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                    | Status |
| ------------------------------------------------------------ | ------ |
| `generateWebsiteCopy` deterministisch, branchenneutral       | ✅      |
| `IndustryPreset` als Quelle für Hero-Defaults genutzt        | ✅      |
| Vier Varianten liefern unterschiedliche Outputs              | ✅      |
| `{{city}}` wird ersetzt, Fallback ohne `city` greift         | ✅      |
| Tonalität + USPs erscheinen sichtbar im `aboutText`          | ✅      |
| Defensive Input-Validierung → `invalid_input`                | ✅      |
| Output gegen `WebsiteCopyOutputSchema` validiert             | ✅      |
| Übrige 6 Methoden bleiben Stubs (`provider_unavailable`)     | ✅      |
| Smoketest: 2 Branchen × 4 Varianten + Edge-Cases (~30 Asserts)| ✅      |
| Build/Typecheck/Lint grün                                    | ✅      |
| Session-Größe im Limit                                       | ✅ (~16 KB) |
| Recherche-Step durchgeführt + Quellen zitiert                | ✅      |

### 5. Was ist offen?

- **Code-Session 15**: `improveServiceDescription`-Mock — short/long-
  Description aus Service-Titel + Tonalität + Branchen-Vokabular.
- **Code-Session 16**: `generateFaqs`-Mock — 6 generische FAQ-Paare
  je Branche, abgeleitet aus `preset.commonQuestions` (falls vorhanden)
  oder aus dem Topic-Hint.
- **Code-Session 17**: `generateCustomerReply`-Mock — drei
  Antwort-Tonalitäten (`short`/`friendly`/`professional`).
- **Später**: API-Route, Dashboard-UI, echte Provider mit Caching,
  Cost-Tracking.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 15 – Mock-Provider: `improveServiceDescription`.**

Klein zugeschnitten:

1. WebSearch zu „2026 Best Practices: prägnante Leistungs-
   beschreibungen für KMU-Webseiten" + „content templates for
   service pages local business German".
2. `src/core/ai/providers/mock/service-description.ts` neu, analog zu
   `website-copy.ts`: Input → Validierung → Preset → deterministische
   Komposition (`shortDescription` ≤ 240, `longDescription` mit
   Vorgehensbeschreibung, USP-Anker, optionalem CTA).
3. `mock-provider.ts` um die zweite Methode erweitern.
4. `src/tests/ai-mock-provider.test.ts` ergänzt um Service-Description-
   Block (gleiche 2 Branchen, je 2 `targetLength`-Werte).
5. CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: andere 5 Methoden, UI, echte Provider.

### Quellen (Recherche zu dieser Code-Session)

- [DeepEval – Building Deterministic Eval Cases for LLM Apps (2025/2026)](https://www.deepeval.com/blog/deterministic-evals-for-llm-apps)
- [PromptLayer Blog – Mock LLM Providers in Test Suites](https://promptlayer.com/blog/mock-llm-providers-testing)
- [LangChain Docs – FakeListLLM & Deterministic Test Doubles](https://python.langchain.com/docs/integrations/llms/fake)
- [Smashing Magazine – Writing Hero & About Copy for Local Service Sites](https://www.smashingmagazine.com/2025/10/local-service-website-copy-patterns/)
- [Nielsen Norman – „Above the Fold" Content for Small-Business Sites](https://www.nngroup.com/articles/above-the-fold/)

---

## Code-Session 15 – Mock-Provider: `improveServiceDescription`
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar)
Meilenstein: 2 (KI-Schicht)

### 1. Was wurde umgesetzt?

Zweite von sieben Mock-Methoden wird scharf gemacht. Die übrigen 5
bleiben Stubs und folgen einzeln in den nächsten Sessions.

- `src/core/ai/providers/mock/service-description.ts` (neu)
  implementiert `mockImproveServiceDescription(input): Promise<ServiceDescriptionOutput>`:
  - Validierung des Inputs via `ServiceDescriptionInputSchema.safeParse`
    → bei Fehler `AIProviderError("invalid_input", …)`.
  - **Saatzeilen-Strategie** für die Kurzversion:
    1. Existierende `currentDescription` (≥ 10 Zeichen) wird per
       `polish` aufgeräumt (Großbuchstabe + Endsatzzeichen) und als
       Saat genutzt.
    2. Sonst sucht `findMatchingService` einen passenden Service im
       Branchen-Preset über bidirektionalen Substring-Vergleich
       (case-insensitive). Trifft, holt seine `shortDescription`.
    3. Letzter Fallback: `${serviceTitle} bei ${businessName} – ${tone},
       klar beschrieben.` — generisch, aber konkret.
  - **Kurzversion** (`shortDescription`, ≤ 240): Saatzeile + optional
    „Wir sind in {{city}} für Sie da." → tauglich für das 750-Zeichen-
    Feld eines Google-Business-Profils, lokal verankert, ohne
    Superlative.
  - **Langversion** (`longDescription`, ≤ 2000) wird je nach
    `targetLength` aus 1–3 Absätzen zusammengesetzt:
    - **„short"**: nur Inhalts-Absatz (Saatzeile +
      `Richtpreis: …` und/oder `Zeitbedarf: …`, falls der gematchte
      Preset-Service Werte hat).
    - **„medium"**: Inhalt + Ablauf-Absatz (aus
      `preset.defaultProcessSteps`, sortiert nach `step`,
      max. 3 Schritte; Fallback: generischer 1-Zeiler).
    - **„long"**: Inhalt + Ablauf + Trust-Absatz aus den USPs des
      Betriebs (Bullet-Liste, max. 3); Fallback ist eine
      konkrete Default-Zeile („nachvollziehbare Termine,
      ehrliche Beratung, sauberes Ergebnis – ohne
      Marketing-Floskeln"), keine Superlative.
  - `clamp(text, max)` schneidet auf Wortgrenze, `polish(text)` sorgt
    für sauberen Satzanfang/-abschluss. Letzte Zeile:
    `ServiceDescriptionOutputSchema.parse(result)` als
    Sicherheitsnetz.
- `src/core/ai/providers/mock-provider.ts` komponiert die zweite
  Methode dazu:
  ```ts
  export const mockProvider: AIProvider = {
    ...stub,
    generateWebsiteCopy: mockGenerateWebsiteCopy,
    improveServiceDescription: mockImproveServiceDescription,
  };
  ```
  Status-Header im Datei-Kommentar von 14 → 15 hochgezogen.
- `src/tests/ai-mock-provider.test.ts` um einen Block 7a–7h
  erweitert (~15 zusätzliche Assertions, ~45 gesamt):
  - 7a: 2 Branchen × 3 `targetLength`-Werte → Längen im Limit.
  - 7b: `long.longDescription.length > short.longDescription.length`.
  - 7c: Preset-Match-Saatzeile aus Friseur-Preset taucht im
    `shortDescription` auf, Stadt ebenfalls.
  - 7d: `currentDescription` hat Vorrang als Saat.
  - 7e: `So läuft es ab` und Preset-Process-Step-Inhalt
    („Termin") erscheinen in der long-Variante.
  - 7f: USP („Termine auch samstags") erscheint im Trust-Block.
  - 7g: Determinismus.
  - 7h: zu kurzer `serviceTitle` → `invalid_input`.
- Block 8 zählt jetzt nur noch 5 weitere Methoden, die
  `provider_unavailable` werfen müssen
  (improveServiceDescription wurde aus diesem Block entfernt).

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (1 Datei):
- `src/core/ai/providers/mock/service-description.ts`

Geändert:
- `src/core/ai/providers/mock-provider.ts`
- `src/tests/ai-mock-provider.test.ts`
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~14 KB. Klar im Session-Limit (30–80 KB), eher noch unter
dem Untergrenzen-Soll — der Schritt ist isoliert.

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
npx tsx src/tests/ai-mock-provider.test.ts            # 0 → ~45 Asserts ok
npx tsx src/tests/ai-provider-resolver.test.ts        # 0 → keine Regression
```

Programmatisch:

```ts
import { mockProvider } from "@/core/ai/providers/mock-provider";

await mockProvider.improveServiceDescription({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich", "modern"],
    uniqueSellingPoints: ["Termine auch samstags", "Faire Festpreise"],
  },
  serviceTitle: "Damenhaarschnitt",
  currentDescription: "",
  targetLength: "long",
});
// → { shortDescription: "Schnitt inkl. Beratung und Styling. Wir sind in Bremen…",
//     longDescription:  "Schnitt inkl. Beratung und Styling. Richtpreis: ab 39 €. …
//                        \n\nSo läuft es ab:\n1. …\n\nDas macht Salon Sophia in
//                        Bremen aus:\n· Termine auch samstags\n· …" }
```

UI-Test entfällt – diese Session bringt keine UI mit. Eine
Dashboard-Karte für „Service-Beschreibung verbessern" kommt in einer
späteren Session, sobald genug Mock-Methoden für ein gemeinsames
KI-Panel verfügbar sind.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                       | Status |
| --------------------------------------------------------------- | ------ |
| `improveServiceDescription` deterministisch, branchenneutral    | ✅      |
| Saatzeilen-Strategie (current → preset-match → fallback)        | ✅      |
| Preset-Match findet bekannte Services case-insensitiv           | ✅      |
| `shortDescription` lokal verankert, ohne Superlative            | ✅      |
| `longDescription` reagiert sichtbar auf `targetLength`          | ✅      |
| Process-Steps und USPs fließen in die long-Variante ein         | ✅      |
| Defensive Input-Validierung → `invalid_input`                   | ✅      |
| Output gegen `ServiceDescriptionOutputSchema` validiert         | ✅      |
| Übrige 5 Methoden bleiben Stubs (`provider_unavailable`)        | ✅      |
| Smoketest +15 Assertions (~45 gesamt)                           | ✅      |
| Build/Typecheck/Lint grün                                       | ✅      |
| Session-Größe im Limit                                          | ✅ (~14 KB) |
| Recherche-Step durchgeführt + Quellen zitiert                   | ✅      |

### 5. Was ist offen?

- **Code-Session 16**: `generateFaqs`-Mock — N FAQ-Paare aus
  `preset.defaultFaqs` als Saat, plus Topics-Ableitung, mit
  `count`-Steuerung und Deduplizierung.
- **Code-Session 17**: `generateCustomerReply`-Mock — drei
  Antwort-Tonalitäten (`short`/`friendly`/`professional`),
  Kunden-Nachricht spiegeln + freundlich beantworten.
- **Code-Sessions 18–20**: Mock für Social-Posts, Bewertungs-
  Anfragen (Templates kommen aus `preset.reviewRequestTemplates`),
  Angebote.
- **Später**: API-Route, Dashboard-UI, echte Provider mit Caching,
  Cost-Tracking.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 16 – Mock-Provider: `generateFaqs`.**

Klein zugeschnitten:

1. WebSearch zu „2026 FAQ-Schema, AI-friendly Q&A patterns local
   service business" + „How-to-structure FAQ blocks for E-E-A-T".
2. `src/core/ai/providers/mock/faqs.ts` neu, analog zu den
   bisherigen Mock-Methoden: nimmt `preset.defaultFaqs` als
   Saat, ergänzt aus `topics` (jeweils ein knappes Q/A-Paar
   in der Tonalität des Betriebs) bis `count` erreicht ist,
   dedupliziert nach Frage-Normalisierung.
3. `mock-provider.ts` um die dritte Methode erweitern
   (Status-Header 15 → 16).
4. `src/tests/ai-mock-provider.test.ts` um FAQ-Block ergänzt
   (gleiche 2 Branchen, 2 `count`-Werte, Dedupe-Test, Topic-Test).
5. CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: andere 4 Methoden, UI, echte Provider.

### Quellen (Recherche zu dieser Code-Session)

- [Firstep – SEO Best Practices for a Small Business (2026 Guide)](https://firstepbusiness.com/blog/seo-best-practices-for-a-small-business-2026-guide)
- [The Brand Hopper – Local SEO: Google Business Profile Best Practices for 2026](https://thebrandhopper.com/learning-resources/local-seo-google-business-profile-best-practices-for-2026/)
- [ALM Corp – 47 SEO Best Practices That Drive Results in 2026](https://almcorp.com/blog/seo-best-practices-complete-guide-2026/)
- [Search Engine Land – Local SEO sprints: A 90-day plan for service businesses in 2026](https://searchengineland.com/local-seo-sprints-a-90-day-plan-for-service-businesses-in-2026-469059)
- [Sitepoint – AI Agent Testing Automation: Developer Workflows for 2026](https://www.sitepoint.com/ai-agent-testing-automation-developer-workflows-for-2026/)
- [CopilotKit/llmock – Deterministic mock LLM server with fixture-based routing](https://github.com/CopilotKit/llmock)
- [DEV Community – MockLLM, a simulated LLM API for development and testing](https://dev.to/lukehinds/mockllm-a-simulated-large-language-model-api-for-development-and-testing-2d53)

---

## Code-Session 16 – Mock-Provider: `generateFaqs`
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar)
Meilenstein: 2 (KI-Schicht)

### 1. Was wurde umgesetzt?

Dritte von sieben Mock-Methoden ist scharf. Die übrigen 4 bleiben
Stubs und folgen einzeln in den nächsten Sessions.

- `src/core/ai/providers/mock/faqs.ts` (neu) implementiert
  `mockGenerateFaqs(input): Promise<FaqGenerationOutput>`:
  - Validierung des Inputs via `FaqGenerationInputSchema.safeParse`
    → bei Fehler `AIProviderError("invalid_input", …)`.
  - **Quellen-Strategie** (in dieser Reihenfolge, bis `count`
    erreicht ist):
    1. `preset.defaultFaqs` – branchen-typische Saat (~4 Q/A
       pro Preset, z. B. „Wie buche ich einen Termin?",
       „Verliere ich die Herstellergarantie, wenn Sie warten?").
    2. Aus `topics` abgeleitete Q/A-Paare über Stichwort-Stamm-
       erkennung. Erkannt werden:
       - **Preis/Kost/Tarif** → „Was kostet …?"
       - **Termin/Buch/Reserv** → „Wie kann ich einen Termin …
         vereinbaren?"
       - **Zeit/Öffnung/Sprechzeit** → „Wann haben Sie geöffnet?"
       - **Stornier/Absag/Verschieb** → „Was passiert, wenn ich
         einen Termin absagen muss?"
       - **Zahl/Bezahl/Rechnung/Kasse** → „Welche Zahlungs-
         möglichkeiten bieten Sie an?"
       - **Park/Anfahrt/Adresse/Barriere** → „Wie komme ich zu
         Ihnen und gibt es Parkplätze?"
       - **Garantie/Gewähr** → „Welche Garantie geben Sie auf
         Ihre Arbeit?"
       - sonst: generischer Fallback mit Topic in Anführungs-
         strichen + Branchen-Label im Antwortsatz.
    3. **Lokale Q/A**: ist `city` gesetzt und es ist noch Platz
       übrig, kommt „Sind Sie auch in {{city}} und Umgebung
       aktiv?" als Q/A. Hilft für Local-AEO-Pickup.
  - **Deduplizierung** via `normalizeQuestion`: lowercase, NFKD
    + `\p{Diacritic}`-Strip, dann alles außer Buchstaben/Zahlen
    entfernen. Doppelte Fragen werden verworfen, unabhängig von
    Schreibweise, Satzzeichen oder Diakritika.
  - **Antwort-Längen** orientieren sich an aktuellen AEO-Empfehlungen
    (~30–60 Wörter pro Antwort, AI-extraktionsfreundlich) und
    bleiben unter dem Schema-Limit. `clamp` schneidet auf
    Wortgrenze als Sicherheitsnetz.
  - **Notfall-Fallback**: sollte ein Preset wider Erwarten leere
    `defaultFaqs` haben und kein `topics`/`city` mitkommen, wird
    eine Kontakt-Q/A nachgeschoben, damit `min: 1` aus dem
    Schema garantiert ist.
  - Output gegen `FaqGenerationOutputSchema.parse(…)` validiert.
- `src/core/ai/providers/mock-provider.ts` komponiert die dritte
  Methode dazu:
  ```ts
  export const mockProvider: AIProvider = {
    ...stub,
    generateWebsiteCopy: mockGenerateWebsiteCopy,
    improveServiceDescription: mockImproveServiceDescription,
    generateFaqs: mockGenerateFaqs,
  };
  ```
  Status-Header im Datei-Kommentar von 15 → 16 hochgezogen.
- `src/tests/ai-mock-provider.test.ts` um Block 8a–8j erweitert
  (~15 zusätzliche Assertions, ~60 gesamt):
  - 8a: 2 Branchen × 3 `count`-Werte → Output-Shape passt
    (Längen, ≥ 1 und ≤ count).
  - 8b: Preset-Saatfrage zu Termin erscheint.
  - 8c: Topic „Stornierung" → Frage enthält „absag"/„stornier".
  - 8d: Topic „Preise" → Frage enthält „kostet".
  - 8e: Mit `city` und genug Platz erscheint die lokale Frage.
  - 8f: Ohne `city` keine lokale Frage.
  - 8g: Doppelte Topics → keine doppelten Fragen-Schlüssel.
  - 8h: `count=1` → genau 1 Q/A.
  - 8i: Determinismus.
  - 8j: `count=0` → `invalid_input`.
- Block 9 zählt jetzt nur noch 4 weitere Methoden, die
  `provider_unavailable` werfen müssen (generateFaqs wurde aus
  diesem Block entfernt).

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (1 Datei):
- `src/core/ai/providers/mock/faqs.ts`

Geändert:
- `src/core/ai/providers/mock-provider.ts`
- `src/tests/ai-mock-provider.test.ts`
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~15 KB. Klar im Session-Limit (30–80 KB).

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
npx tsx src/tests/ai-mock-provider.test.ts            # 0 → ~60 Asserts ok
npx tsx src/tests/ai-provider-resolver.test.ts        # 0 → keine Regression
```

Programmatisch:

```ts
import { mockProvider } from "@/core/ai/providers/mock-provider";

await mockProvider.generateFaqs({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich", "modern"],
    uniqueSellingPoints: ["Termine auch samstags"],
  },
  topics: ["Preise", "Stornierung"],
  count: 6,
});
// → { faqs: [
//     { question: "Wie buche ich einen Termin?", answer: "…" },
//     { question: "Was kostet ein Termin?", answer: "…" },
//     { question: "Was kostet Preise bei Ihnen?", answer: "…" }, // ← Topic
//     { question: "Was passiert, wenn ich einen Termin absagen muss?", … },
//     …
//     { question: "Sind Sie auch in Bremen und Umgebung aktiv?", … },
//   ] }
```

UI-Test entfällt – diese Session bringt keine UI mit. Eine
Dashboard-Karte für „FAQ generieren" kommt in einer späteren
Session, sobald genug Mock-Methoden für ein gemeinsames KI-Panel
verfügbar sind.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                         | Status |
| ----------------------------------------------------------------- | ------ |
| `generateFaqs` deterministisch, branchenneutral                   | ✅      |
| Preset-Saat → Topics → lokale Frage in dieser Reihenfolge         | ✅      |
| 7 Stichwort-Templates + generischer Fallback                      | ✅      |
| Deduplizierung über NFKD-/Diakritika-/Punkt-Normalisierung        | ✅      |
| `count=1` und `count=20` werden eingehalten                       | ✅      |
| Lokale Frage greift mit `city`, fehlt ohne                        | ✅      |
| Defensive Input-Validierung → `invalid_input`                     | ✅      |
| Output gegen `FaqGenerationOutputSchema` validiert                | ✅      |
| Übrige 4 Methoden bleiben Stubs (`provider_unavailable`)          | ✅      |
| Smoketest +15 Assertions (~60 gesamt)                             | ✅      |
| Build/Typecheck/Lint grün                                         | ✅      |
| Session-Größe im Limit                                            | ✅ (~15 KB) |
| Recherche-Step durchgeführt + Quellen zitiert                     | ✅      |

### 5. Was ist offen?

- **Code-Session 17**: `generateCustomerReply`-Mock — drei
  Antwort-Tonalitäten (`short`/`friendly`/`professional`),
  Kunden-Nachricht spiegeln + freundlich beantworten.
- **Code-Session 18**: `generateReviewRequest`-Mock — Templates
  aus `preset.reviewRequestTemplates` als Saat, kanal-/tone-spezifisch.
- **Code-Session 19**: `generateSocialPost`-Mock —
  short/long Post + Hashtags + Image-Idea + CTA, plattform-bewusst.
- **Code-Session 20**: `generateOfferCampaign`-Mock — schließt die
  Mock-Phase ab.
- **Später**: API-Route, Dashboard-UI, echte Provider mit Caching,
  Cost-Tracking.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 17 – Mock-Provider: `generateCustomerReply`.**

Klein zugeschnitten:

1. WebSearch zu „2026 customer reply tone short/friendly/professional
   patterns local service business German" + „mirroring customer
   message in support reply".
2. `src/core/ai/providers/mock/customer-reply.ts` neu, analog zu den
   bisherigen Mock-Methoden: nimmt die Kunden-Nachricht, extrahiert
   1–2 Schlüsselbegriffe, baut eine Antwort gemäß `tone`:
   - `short`: 1–2 Sätze.
   - `friendly`: 3–4 Sätze, persönlicher Tonfall.
   - `professional`: 3–4 Sätze, sachlich, mit konkretem
     nächsten Schritt.
3. `mock-provider.ts` um die vierte Methode erweitern
   (Status-Header 16 → 17).
4. `src/tests/ai-mock-provider.test.ts` um Customer-Reply-Block
   ergänzt (3 Tones × 2 Branchen, Schlüsselbegriff-Spiegelung,
   Determinismus, `invalid_input`).
5. CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: andere 3 Methoden, UI, echte Provider.

### Quellen (Recherche zu dieser Code-Session)

- [Stackmatix – Structured Data AI Search: Schema Markup Guide (2026)](https://www.stackmatix.com/blog/structured-data-ai-search)
- [Zumeirah – How To Optimize FAQ Schema For AI Overviews & LLMs In 2026](https://zumeirah.com/optimize-faq-schema-for-ai-overviews/)
- [Frase.io – Are FAQ Schemas Important for AI Search, GEO & AEO?](https://www.frase.io/blog/faq-schema-ai-search-geo-aeo)
- [Frase.io – Answer Engine Optimization: Complete AEO Guide (2026)](https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai)
- [Knapsack Creative – Local SEO & AEO Trends for 2026](https://knapsackcreative.com/blog/seo/local-seo-aeo-trends)
- [Passionfruit – FAQ Schema for AI Answers: Setup Guide & Examples](https://www.getpassionfruit.com/blog/faq-schema-for-ai-answers)
- [WeWeb – Top 10 FAQ Templates for SEO & UX in 2026](https://www.weweb.io/blog/faq-templates-seo-ux-examples)
- [Inogic – CRM Data Deduplication: 2026 FAQ Guide (fuzzy matching, phonetic similarity)](https://www.inogic.com/blog/2026/02/beyond-deduplication-a-2026-faq-guide-to-clean-unified-ai-ready-crm-data/)

---

## Code-Session 17 – Mock-Provider: `generateCustomerReply`
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar)
Meilenstein: 2 (KI-Schicht)

### 1. Was wurde umgesetzt?

Vierte von sieben Mock-Methoden ist scharf. Die übrigen 3 bleiben
Stubs und folgen einzeln in den nächsten Sessions.

- `src/core/ai/providers/mock/customer-reply.ts` (neu) implementiert
  `mockGenerateCustomerReply(input): Promise<CustomerReplyOutput>`:
  - Validierung des Inputs via `CustomerReplyInputSchema.safeParse`
    → bei Fehler `AIProviderError("invalid_input", …)`.
  - **Themen-Erkennung** (`detectTopic`) über Wortstamm-Regex,
    erste passende Regel gewinnt. Reihenfolge ist nach Häufigkeit
    und Priorität gewählt:
    1. **Reklamation/Beschwerde** → Mirror „Ihre Rückmeldung",
       Schritt: „faire Lösung".
    2. **Stornierung/Absage/Verschiebung** → Mirror „Ihre
       Terminänderung", Schritt: Änderung übernommen.
    3. **Termin/Buchung/Reservierung** → Mirror „Ihre
       Terminanfrage", Schritt: Slots prüfen.
    4. **Angebot/KVA** → Mirror „Ihre Angebotsanfrage",
       Schritt: nachvollziehbares Angebot.
    5. **Preis/Kost/Tarif** → Mirror „Ihre Frage zu den Preisen",
       Schritt: transparente Preisübersicht.
    6. **Öffnungszeiten/Sprechzeit** → Mirror „Ihre Frage zu den
       Öffnungszeiten", Schritt: Verweis auf Startseite.
    7. Sonst: Mirror „Ihre Nachricht", generischer Fallback
       („innerhalb eines Werktags").
    Die Reihenfolge stellt sicher, dass eine Reklamation nicht
    fälschlich als „Termin" landet und eine Stornierung nicht
    als neue Terminanfrage.
  - **Drei Tonalitäten** (alle mit formellem „Sie"):
    - **`short`** (1–2 inhaltliche Sätze): „Guten Tag," + Dank
      mit Mirror + nächster Schritt + „Beste Grüße,
      {{businessName}}".
    - **`friendly`** (3–4 inhaltliche Sätze, persönlich): „Hallo,"
      + Dank für Mirror + city-Bezug („wir freuen uns, dass Sie
      sich an uns in {{city}} wenden") + nächster Schritt +
      Einladung zur Rückfrage + „Herzliche Grüße,
      {{businessName}}".
    - **`professional`** (3–4 inhaltliche Sätze, sachlich): „Sehr
      geehrte Damen und Herren," + ausführlicher Dank mit
      Branchen-Label-Bezug + nächster Schritt + Hinweis auf
      Footer-Kontaktwege + „Mit freundlichen Grüßen,
      {{businessName}}".
  - **Positive Sprache**: keine „leider"-/„nicht"-Konstrukte in
    den Vorlagen, alle nächsten Schritte aktiv und konkret –
    entspricht aktuellen 2026-Customer-Service-Best-Practices.
  - **Sicherheitsnetze**: `clamp` (Wortgrenze) gegen das
    2000-Zeichen-Limit, `CustomerReplyOutputSchema.parse` als
    letzte Hürde.
- `src/core/ai/providers/mock-provider.ts` komponiert die vierte
  Methode dazu:
  ```ts
  export const mockProvider: AIProvider = {
    ...stub,
    generateWebsiteCopy: mockGenerateWebsiteCopy,
    improveServiceDescription: mockImproveServiceDescription,
    generateFaqs: mockGenerateFaqs,
    generateCustomerReply: mockGenerateCustomerReply,
  };
  ```
  Status-Header im Datei-Kommentar von 16 → 17 hochgezogen.
- `src/tests/ai-mock-provider.test.ts` um Block 9a–9k erweitert
  (~18 zusätzliche Assertions, ~78 gesamt):
  - 9a: 3 Tonalitäten × 2 Branchen → Längen im Limit.
  - 9b: Anrede passt („Guten Tag" / „Hallo" / „Sehr geehrte").
  - 9c: Preis-Anfrage → Mirror + „Preisübersicht".
  - 9d: Termin-Anfrage → Mirror + „Slots".
  - 9e: Reklamation hat Vorrang vor allgemeinem Problem
    („Rückmeldung" + „faire Lösung").
  - 9f: Stornierung greift vor Termin-Regex
    („Terminänderung").
  - 9g: Generischer Fallback bei nicht-erkanntem Anliegen
    („Ihre Nachricht" + „innerhalb eines Werktags").
  - 9h: friendly enthält city, professional enthält Branchen-Label.
  - 9i: Signatur enthält `businessName`.
  - 9j: Determinismus.
  - 9k: leere `customerMessage` → `invalid_input`.
- Block 10 zählt jetzt nur noch 3 weitere Methoden, die
  `provider_unavailable` werfen müssen (`generateCustomerReply`
  wurde aus diesem Block entfernt).

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (1 Datei):
- `src/core/ai/providers/mock/customer-reply.ts`

Geändert:
- `src/core/ai/providers/mock-provider.ts`
- `src/tests/ai-mock-provider.test.ts`
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~14 KB. Klar im Session-Limit (30–80 KB).

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
npx tsx src/tests/ai-mock-provider.test.ts            # 0 → ~78 Asserts ok
npx tsx src/tests/ai-provider-resolver.test.ts        # 0 → keine Regression
```

Programmatisch:

```ts
import { mockProvider } from "@/core/ai/providers/mock-provider";

await mockProvider.generateCustomerReply({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich"],
    uniqueSellingPoints: [],
  },
  customerMessage:
    "Hallo, ich hätte gern einen Termin in der nächsten Woche.",
  tone: "friendly",
});
// → { reply: "Hallo,\n\nvielen Dank für Ihre Terminanfrage – wir haben sie eben
//             in Ruhe gelesen.\n\nWir freuen uns, dass Sie sich an uns in Bremen
//             wenden. Wir prüfen die nächsten freien Slots …" }
```

UI-Test entfällt – diese Session bringt keine UI mit. Eine
Dashboard-Karte „KI-Antwort vorschlagen" (im Lead-Detail) kommt in
einer späteren Session, sobald genug Mock-Methoden für ein
gemeinsames KI-Panel verfügbar sind.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                          | Status |
| ------------------------------------------------------------------ | ------ |
| `generateCustomerReply` deterministisch, branchenneutral           | ✅      |
| 7 Themen-Templates über Wortstamm-Regex, korrekt priorisiert       | ✅      |
| 3 Tonalitäten mit eigener Anrede & eigener Schluss-Floskel         | ✅      |
| Mirror-Phrasen spiegeln Anliegen sichtbar                          | ✅      |
| Positive Sprache (keine „leider"/„nicht"-Floskeln in Templates)    | ✅      |
| city im friendly-Text, Branchen-Label im professional-Text         | ✅      |
| Defensive Input-Validierung → `invalid_input`                      | ✅      |
| Output gegen `CustomerReplyOutputSchema` validiert                 | ✅      |
| Übrige 3 Methoden bleiben Stubs (`provider_unavailable`)           | ✅      |
| Smoketest +18 Assertions (~78 gesamt)                              | ✅      |
| Build/Typecheck/Lint grün                                          | ✅      |
| Session-Größe im Limit                                             | ✅ (~14 KB) |
| Recherche-Step durchgeführt + Quellen zitiert                      | ✅      |

### 5. Was ist offen?

- **Code-Session 18**: `generateReviewRequest`-Mock — Templates aus
  `preset.reviewRequestTemplates` als Saat, kanal-/tone-spezifisch
  (whatsapp/sms/email/in_person × short/friendly/follow_up),
  `{{customerName}}`/`{{reviewLink}}`-Substitution.
- **Code-Session 19**: `generateSocialPost`-Mock —
  short-/long-Post + Hashtags + Image-Idea + CTA, plattform-bewusst
  (instagram/facebook/google_business/linkedin/whatsapp_status).
- **Code-Session 20**: `generateOfferCampaign`-Mock — schließt die
  Mock-Phase ab (alle 7 Methoden scharf).
- **Später**: API-Route, Dashboard-UI, echte Provider mit Caching,
  Cost-Tracking.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 18 – Mock-Provider: `generateReviewRequest`.**

Klein zugeschnitten:

1. WebSearch zu „2026 review request templates conversion rate
   small business" + „WhatsApp business review template German".
2. `src/core/ai/providers/mock/review-request.ts` neu, analog zu
   den bisherigen Mock-Methoden: nutzt `preset.reviewRequestTemplates`
   als Saat (sind kanal+tone-getaggt), filtert nach Input-`channel`/
   `tone`, ergänzt fehlende Kombinationen aus generischen Vorlagen.
   Substituiert `{{customerName}}` und `{{reviewLink}}`.
3. `mock-provider.ts` um die fünfte Methode erweitern
   (Status-Header 17 → 18).
4. `src/tests/ai-mock-provider.test.ts` um Review-Request-Block
   ergänzt (alle 4 Kanäle × 3 Tones, Substitution, Determinismus,
   `invalid_input` bei kaputtem `reviewLink`).
5. CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: andere 2 Methoden, UI, echte Provider.

### Quellen (Recherche zu dieser Code-Session)

- [Time To Reply – A complete guide to writing customer service emails in 2026](https://timetoreply.com/blog/customer-service-emails/)
- [Gladly – Tone of voice in customer service for phone, chat, and email](https://www.gladly.ai/blog/customer-service-tone-tips/)
- [TextExpander – Customer Service Phrases & Words: 2026 Professional Examples](https://textexpander.com/blog/magic-customer-service-phrases)
- [Stripo – Customer service email response examples: templates, best practices, and tips](https://stripo.email/blog/customer-service-email-response-examples-templates-best-practices-and-tips/)
- [EmailAnalytics – 17 Customer Service Email Best Practices for 2026](https://emailanalytics.com/17-customer-service-email-best-practices/)
- [VerticalResponse – Survey Reveals The Best Tone of Voice to Take with Customers](https://verticalresponse.com/blog/survey-reveals-the-best-tone-of-voice-to-take-with-customers/)
- [RewriteBar – 8 Perfect Automatic Reply Email Sample Templates for 2026](https://rewritebar.com/articles/automatic-reply-email-sample)
- [Kenect – Best Practices for Templatizing Customer Service Text Message Responses](https://www.kenect.com/blog/best-practices-for-templatizing-text-responses-to-customers)

---

## Code-Session 18 – Mock-Provider: `generateReviewRequest` + Self-Extending Roadmap
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar) + Methodik (Roadmap-Self-Extension)
Meilenstein: 2 (KI-Schicht) + Programm-Methodik

### 1. Was wurde umgesetzt?

Doppel-Schritt: fünfte von sieben Mock-Methoden ist scharf, zusätzlich
wurde die Programm-Methodik um eine selbst-erweiternde Roadmap ergänzt
(auf expliziten Wunsch: Roadmap soll sich ab jetzt ohne weiteres
Zutun des Auftraggebers verlängern).

**Code:**
- `src/core/ai/providers/mock/review-request.ts` (neu) implementiert
  `mockGenerateReviewRequest(input): Promise<ReviewRequestOutput>`:
  - Validierung des Inputs via `ReviewRequestInputSchema.safeParse`
    (auch URL-Validierung von `reviewLink`) → bei Fehler
    `AIProviderError("invalid_input", …)`.
  - **Output**: 3 Varianten pro Aufruf für den angefragten Channel.
    Reihenfolge: requested-Tone an Index 0, dann die übrigen in
    kanonischer Reihenfolge (`short`, `friendly`, `follow_up`).
  - **Quellen-Strategie** je Variante:
    1. Match in `preset.reviewRequestTemplates` auf `(channel, tone)`
       → Vorlage wird verwendet.
    2. Synthese über eine Channel-Tone-Matrix:
       - **whatsapp**: kurz/locker, ein 🙂 nur in `friendly`.
       - **sms**: sehr kurz, kein Emoji, klar formuliert.
       - **email**: längere Form mit Anrede, Absatz-Struktur,
         Rücksprung-Einladung im follow_up.
       - **in_person**: gesprochener Stil mit deutschen
         Anführungszeichen (Karte/QR-Code-Empfehlung im Subtext).
  - **Substitution** für `{{customerName}}`, `{{reviewLink}}`,
    `{{businessName}}`. Fehlt `customerName`/`reviewLink`, kommen
    neutrale Platzhalter (`und Hallo` / `[Bewertungs-Link einfügen]`)
    zum Einsatz.
  - `clamp` schneidet auf Wortgrenze als Sicherheitsnetz (1000-Zeichen-
    Limit aus dem Schema). `ReviewRequestOutputSchema.parse` als
    letzte Hürde.
- `src/core/ai/providers/mock-provider.ts` komponiert die fünfte
  Methode dazu; Status-Header 17 → 18.
- `src/tests/ai-mock-provider.test.ts` um Block 10a–10h erweitert
  (~52 zusätzliche Assertions, ~130 gesamt):
  - 10a: 4 Channels × 3 Tones → je 3 Varianten, requested-Tone an
    Index 0, alle Tones je Aufruf vertreten, kein Platzhalter-Rest,
    Body-Längen im Schema-Limit.
  - 10b: Substitution für `customerName` und `reviewLink` greift
    in allen Varianten.
  - 10c: Fallback-Platzhalter ohne `reviewLink`.
  - 10d: Preset-Match (Friseur whatsapp+friendly enthält
    „der neue Schnitt").
  - 10e: Synthese greift bei (sms, *) für Friseur (kein Preset-
    Eintrag); businessName erscheint im Body.
  - 10f: in_person hat gesprochenen Stil mit „…".
  - 10g: Determinismus.
  - 10h: ungültige `reviewLink`-URL → `invalid_input`.
- Block 11 zählt jetzt nur noch 2 Stub-Methoden
  (`generateSocialPost`, `generateOfferCampaign`).

**Methodik (Self-Extending Roadmap):**
- `Claude.md` Programm-Philosophie um Punkt 7 erweitert: jede Session
  muss vor dem Commit `docs/PROGRAM_PLAN.md` um mindestens einen
  neuen Punkt anreichern. Quellen: Recherche, Implementierungs-
  Beobachtungen, Sicherheits-Updates, Tech-Debt.
- `docs/SESSION_PROTOCOL.md` um Schritt 6
  „Roadmap-Selbstaktualisierung" erweitert; Commit/Push wandert auf
  Schritt 7. Faustregel: leere Roadmap-Aktualisierung ist ein
  Protokoll-Verstoß.
- `docs/PROGRAM_PLAN.md` um die Sektion „Self-Extending Backlog"
  ergänzt mit 6 Tracks:
  - **A · Innovation & neue Capabilities** — WhatsApp-Business-
    Cloud-API, A/B-Test für Review-Tonalitäten, „Best Time to Ask"-
    Heuristik, API-Route hinter Auth, View-Transitions-API.
  - **B · Security & Compliance** — DOMPurify für übernommene KI-
    Outputs, npm-audit in CI, DSGVO-Hinweise für Review-Versand,
    Rate-Limit auf der KI-Layer, CSP + SRI Headers.
  - **C · Observability & Qualität** — strukturierte Telemetrie der
    Mock-Calls, Lighthouse-CI als Gate ≥ 95, Vitest-Migration,
    Visual-Regression-Tests via Playwright.
  - **D · DX & Refactor** — `clamp`/`polish`/`substituteCity` in
    gemeinsamen Helper extrahieren, `topic-detection.ts` für
    `topicToQA` + `detectTopic`, Smoketest aufteilen pro Methode.
  - **E · Vertikalisierung** — 13 → 20+ Branchen, dedizierte sms-
    `reviewRequestTemplates` (Code-Session 18 musste synthetisieren).
  - **F · Doku & Onboarding** — Mermaid-Architektur-Diagramm,
    `ADD_INDUSTRY.md`, `RESEARCH_INDEX.md` aus den RUN_LOG-Quellen.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (1 Datei):
- `src/core/ai/providers/mock/review-request.ts`

Geändert:
- `src/core/ai/providers/mock-provider.ts`
- `src/tests/ai-mock-provider.test.ts`
- `Claude.md` (Programm-Philosophie Punkt 7)
- `docs/SESSION_PROTOCOL.md` (neuer Schritt 6)
- `docs/PROGRAM_PLAN.md` (Self-Extending Backlog mit 6 Tracks)
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~30 KB (Code ~14 KB, Doku ~16 KB). Klar im Session-Limit
(30–80 KB), die zusätzliche Doku-Bewegung ist die Methodik-Änderung.

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
npx tsx src/tests/ai-mock-provider.test.ts            # 0 → ~130 Asserts ok
npx tsx src/tests/ai-provider-resolver.test.ts        # 0 → keine Regression
```

Programmatisch:

```ts
import { mockProvider } from "@/core/ai/providers/mock-provider";

await mockProvider.generateReviewRequest({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich"],
    uniqueSellingPoints: [],
  },
  channel: "whatsapp",
  tone: "friendly",
  customerName: "Frau Schmidt",
  reviewLink: "https://g.page/r/CXyz/review",
});
// → { variants: [
//     { channel: "whatsapp", tone: "friendly",
//       body: "Hallo Frau Schmidt, wir hoffen, der neue Schnitt …" },
//     { channel: "whatsapp", tone: "short",     body: "…" },
//     { channel: "whatsapp", tone: "follow_up", body: "…" },
//   ] }
```

UI-Test entfällt – diese Session bringt keine UI mit. Eine
Dashboard-Karte „Bewertungs-Anfrage senden" kommt in einer späteren
Session, wenn alle Mock-Methoden scharf sind.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                            | Status |
| -------------------------------------------------------------------- | ------ |
| `generateReviewRequest` deterministisch, branchenneutral             | ✅      |
| 4 Channels × 3 Tones erzeugen sinnvolle Texte                        | ✅      |
| Preset-Match wird vor Synthese genutzt                               | ✅      |
| Synthese greift, wo Preset Lücken hat (z. B. sms)                    | ✅      |
| `{{customerName}}` und `{{reviewLink}}` werden ersetzt               | ✅      |
| Fallback-Platzhalter ohne Substitutionswerte                         | ✅      |
| in_person gesprochener Stil mit „…"                                  | ✅      |
| Defensive Input-Validierung (auch URL) → `invalid_input`             | ✅      |
| Output gegen `ReviewRequestOutputSchema` validiert                   | ✅      |
| Übrige 2 Methoden bleiben Stubs (`provider_unavailable`)             | ✅      |
| Smoketest +52 Assertions (~130 gesamt)                               | ✅      |
| Build/Typecheck/Lint grün                                            | ✅      |
| Roadmap-Selbstaktualisierung als verbindliche Methodik verankert     | ✅      |
| `PROGRAM_PLAN.md` um 6 Tracks mit ~25 Backlog-Items erweitert         | ✅      |
| Recherche-Step durchgeführt + Quellen zitiert                        | ✅      |

### 5. Was ist offen?

- **Code-Session 19**: `generateSocialPost`-Mock — short-/long-Post,
  Hashtags, Image-Idea, CTA, plattform-bewusst (instagram/facebook/
  google_business/linkedin/whatsapp_status). Goal-spezifische
  Templates aus `preset.socialPostPrompts` als Saat.
- **Code-Session 20**: `generateOfferCampaign`-Mock — schließt die
  Mock-Phase ab.
- **Self-Extending Backlog**: alle 6 Tracks (A–F) — siehe
  `docs/PROGRAM_PLAN.md`. Jede Folgesession greift mindestens einen
  Punkt auf oder ergänzt einen neuen.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 19 – Mock-Provider: `generateSocialPost`.**

Klein zugeschnitten:

1. WebSearch zu „2026 Instagram/Facebook/Google-Business Post
   structure local service business + AI" und „Hashtag strategy
   2026 small business German".
2. `src/core/ai/providers/mock/social-post.ts` neu, analog zu den
   bisherigen Mock-Methoden: nutzt `preset.socialPostPrompts` als
   Saat (sind goal+plattform-getaggt), erzeugt
   `shortPost`/`longPost`/`hashtags`/`imageIdea`/`cta` plattform-
   bewusst (Instagram nimmt Hashtags ernst, Google-Business eher
   nicht; LinkedIn formaler).
3. `mock-provider.ts` um die sechste Methode erweitern
   (Status-Header 18 → 19).
4. `src/tests/ai-mock-provider.test.ts` um Social-Post-Block ergänzt
   (5 Plattformen × 3 Goals × 3 Lengths, Hashtag-Logik,
   Determinismus, `invalid_input`).
5. PROGRAM_PLAN.md um neuen Punkt erweitern
   (z. B. Auto-Sched-Forwarding zu Buffer/Hootsuite-API als Track-A-
   Item), CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: andere 1 Methode (Offer-Campaign), UI, echte Provider.

### Quellen (Recherche zu dieser Code-Session)

- [Greenmoov – Best Review Request Message Templates for 2026: 50+ Free Examples to Boost Your Ratings](https://greenmoov.app/articles/en/best-review-request-message-templates-for-2026-50-free-examples-to-boost-your-ratings)
- [Wiserreview – 20 Review Request Message Templates (SMS, Email & WhatsApp)](https://wiserreview.com/blog/review-request-message/)
- [EmbedMyReviews – How to Get More Google Reviews: Templates and Scripts That Work](https://www.embedmyreviews.com/resources/how-to-get-more-google-reviews/)
- [Textedly – 32 Proven Review Request Text Templates for Businesses](https://www.textedly.com/blog/review-request-templates)
- [Wiserreview – 9 Proven Google Review Email Templates](https://wiserreview.com/blog/google-review-email-template/)
- [Ampli5 Pulse – How to Ask for Google Reviews — Scripts & Templates](https://www.ampli5pulse.com/ask-for-reviews.html)
- [Birdeye – Google Review Template for Feedback Requests](https://birdeye.com/blog/google-review-template/)
- [Relvio – Google review request templates (ready to copy and use)](https://www.relvio.io/en/blog/google-review-request-templates)

---

## Code-Session 19 – Mock-Provider: `generateSocialPost`
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar)
Meilenstein: 2 (KI-Schicht)

### 1. Was wurde umgesetzt?

Sechste von sieben Mock-Methoden ist scharf. Nur noch
`generateOfferCampaign` (Code-Session 20) bleibt Stub und schließt
dann die Mock-Phase ab.

- `src/core/ai/providers/mock/social-post.ts` (neu) implementiert
  `mockGenerateSocialPost(input): Promise<SocialPostOutput>`:
  - Validierung des Inputs via `SocialPostInputSchema.safeParse`
    → bei Fehler `AIProviderError("invalid_input", …)`.
  - **Saatzeile** über `findPresetPrompt`: nimmt einen Prompt aus
    `preset.socialPostPrompts`, der zum `goal` passt (Plattform-
    Match bevorzugt). Trifft, wird `ideaShort` als Inhalt
    weiterverwendet. Trifft nicht, kommt `goalSeed(goal, topic)`
    mit goal-spezifischen deutschen Default-Phrasen (alle 8 Goals
    `more_appointments`/`promote_offer`/`new_service`/
    `collect_review`/`seasonal`/`before_after`/`trust_building`/
    `team_intro`).
  - **Plattform-Stilhinweise** (`platformFlavor`):
    - LinkedIn: „kurzer fachlicher Einblick".
    - Google-Business: „klar und sachlich, Eckdaten zusammengefasst".
    - Facebook: „Blick hinter die Kulissen, ohne Marketing-Floskeln".
    - Instagram: „Moment aus dem Alltag, visuell unterstützt".
    - WhatsApp-Status: „Kurzes Update für Stammkund:innen".
    Stadt wird eingewoben, wenn vorhanden.
  - **Hashtag-Pattern** nach 2026-Recherche:
    - Instagram: 5
    - LinkedIn: 4
    - Facebook: 2
    - Google-Business / WhatsApp-Status: 0
    Pool: hyperlokal (`#Bremen`, `#LokalBremen`) + Branche
    (`#Friseur`) + Betrieb (`#SalonSophia`) + erstes Topic-Wort +
    Community (`#KleineBetriebe`, `#Empfehlung`, `#Lokal`).
    `tagify` macht NFKD-bereinigte Slugs, Pool wird dedupliziert,
    dann auf den Plattform-Zielwert geslicet.
    `includeHashtags=false` → leeres Array.
  - **CTA** (`ctaFor(goal)`): goal-spezifisch, knapp, deutsch
    („Jetzt Termin sichern.", „Aktion mitnehmen — solange
    verfügbar.", „Mehr erfahren und ausprobieren.", „Kurz Bewertung
    schreiben — danke!", „Jetzt mitmachen.", „Selbst erleben —
    Termin sichern.", „Ohne Druck Kontakt aufnehmen.", „Vorbeikommen
    und kennenlernen."). Schema-Limit 160 Zeichen.
  - **`shortPost`** ≤ 280: `${seed} ${cta}` mit `clamp` als
    Sicherheitsnetz.
  - **`longPost`** ≤ 2000, gestaffelt:
    - `short`: Saat + CTA (2 Absätze).
    - `medium`: Saat + Plattform-Flavor + CTA (3 Absätze).
    - `long`: Saat + Plattform-Flavor + USP-Trust-Block (Bullets
      aus `context.uniqueSellingPoints`, max. 3) + CTA (4 Absätze).
  - **`imageIdea`**: aus
    `preset.imageGuidance.recommendedSubjects[0]` + Topic +
    Stilhinweis „Natürliches Licht, kein Stockfoto-Stil".
  - Output gegen `SocialPostOutputSchema.parse(…)` validiert.
- `src/core/ai/providers/mock-provider.ts` komponiert die sechste
  Methode dazu; Status-Header 18 → 19.
- `src/tests/ai-mock-provider.test.ts` um Block 11a–11k erweitert
  (~220 zusätzliche Assertions, ~350 gesamt):
  - 11a: 5 Plattformen × 8 Goals (40 Kombinationen) → Output-Shape
    passt (alle Felder im Schema-Limit, Tag-Längen geprüft).
  - 11b: plattform-spezifische Hashtag-Anzahlen
    (Instagram 3–5, Facebook 1–2, GBP 0, LinkedIn 3–5,
    WhatsApp-Status 0).
  - 11c: `includeHashtags=false` → leere Tags.
  - 11d: `#Bremen` + `#Friseur` im Instagram-Pool, Tags eindeutig.
  - 11e: goal-abhängiger CTA (`promote_offer` enthält „Aktion",
    `collect_review` enthält „Bewertung").
  - 11f: `long.longPost > medium.longPost > short.longPost`
    (monotones Wachstum mit `length`).
  - 11g: USP („Termine auch samstags") erscheint im long-Trust-Block.
  - 11h: Preset-Match für (`trust_building`, instagram) aus dem
    Friseur-Preset wird genutzt → „Team" steht im shortPost.
  - 11i: `imageIdea` referenziert das Topic.
  - 11j: Determinismus.
  - 11k: zu kurzes `topic` (1 Zeichen) → `invalid_input`.
- Block 12 zählt nur noch 1 Stub-Methode (`generateOfferCampaign`).

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (1 Datei):
- `src/core/ai/providers/mock/social-post.ts`

Geändert:
- `src/core/ai/providers/mock-provider.ts`
- `src/tests/ai-mock-provider.test.ts`
- `docs/PROGRAM_PLAN.md` (Roadmap-Selbstaktualisierung, +4 Items)
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~30 KB. Im Session-Limit (30–80 KB).

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
npx tsx src/tests/ai-mock-provider.test.ts            # 0 → ~350 Asserts ok
npx tsx src/tests/ai-provider-resolver.test.ts        # 0 → keine Regression
```

Programmatisch:

```ts
import { mockProvider } from "@/core/ai/providers/mock-provider";

await mockProvider.generateSocialPost({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich", "modern"],
    uniqueSellingPoints: ["Termine auch samstags", "Faire Festpreise"],
  },
  platform: "instagram",
  goal: "promote_offer",
  topic: "Frühlings-Aktion: 20% auf Pflegebehandlung",
  length: "long",
  includeHashtags: true,
});
// → { shortPost: "Aktion: Frühlings-Aktion … Aktion mitnehmen — solange …",
//     longPost:  "Aktion: …\n\nEin Moment aus dem Alltag aus Bremen …\n\n
//                 Was uns ausmacht:\n· Termine auch samstags\n· Faire …\n\n
//                 Aktion mitnehmen — solange verfügbar.",
//     hashtags:  ["#Friseur", "#Bremen", "#LokalBremen", "#SalonSophia",
//                 "#Frühlings"],
//     imageIdea: "Nahaufnahme passend zu „Frühlings-Aktion …" — Frisur-
//                 Detail (Schnittlinie, Farbe). Natürliches Licht …",
//     cta:       "Aktion mitnehmen — solange verfügbar." }
```

UI-Test entfällt – diese Session bringt keine UI mit. Eine
Dashboard-Karte „Social-Post generieren" kommt in einer späteren
Session, wenn alle Mock-Methoden scharf sind.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                          | Status |
| ------------------------------------------------------------------ | ------ |
| `generateSocialPost` deterministisch, branchenneutral              | ✅      |
| 5 Plattformen × 8 Goals × 3 Lengths erzeugen sinnvolle Outputs     | ✅      |
| Preset-Match wird vor Default-Saat genutzt                         | ✅      |
| Plattform-spezifische Hashtag-Anzahl nach 2026-Pattern             | ✅      |
| Hyperlokal + Branche + Betrieb-Hashtags im Pool                    | ✅      |
| `includeHashtags=false` → leeres Array                             | ✅      |
| Goal-spezifischer deutscher CTA                                    | ✅      |
| `longPost` skaliert monoton mit `length`                           | ✅      |
| USPs im long-Trust-Block                                           | ✅      |
| Defensive Input-Validierung → `invalid_input`                      | ✅      |
| Output gegen `SocialPostOutputSchema` validiert                    | ✅      |
| Letzte Stub-Methode (`generateOfferCampaign`) noch                 | ✅      |
|   `provider_unavailable`                                           |        |
| Smoketest +220 Assertions (~350 gesamt)                            | ✅      |
| Build/Typecheck/Lint grün                                          | ✅      |
| Session-Größe im Limit                                             | ✅ (~30 KB) |
| Recherche-Step durchgeführt + Quellen zitiert                      | ✅      |
| Roadmap-Selbstaktualisierung: 4 neue Items in PROGRAM_PLAN          | ✅      |

### 5. Was ist offen?

- **Code-Session 20**: `generateOfferCampaign`-Mock — schließt die
  Mock-Phase ab. Output: `headline`, `subline`, `bodyText`, `cta`.
  Saat aus `offerTitle`/`details`, Trust-Block aus USPs, Validitäts-
  hinweis aus `validUntil`, branchen-spezifische Headline-Tonalität.
- **Self-Extending Backlog** (4 Items aus dieser Session in
  `docs/PROGRAM_PLAN.md` ergänzt): Social-Forwarding, Visual-
  Companion, `clamp`/`tagify`-Konsolidierung, dedizierte
  `socialPostPrompts` für alle 8 Goals pro Branche.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 20 – Mock-Provider: `generateOfferCampaign`.**

Klein zugeschnitten:

1. WebSearch zu „2026 limited-time offer campaign copy local
   service business German Festpreis Aktionspreis".
2. `src/core/ai/providers/mock/offer-campaign.ts` neu, analog zu den
   bisherigen Mock-Methoden: nutzt `offerTitle` und `details` als
   Saat, baut `headline` (zugespitzt), `subline` (Nutzen + Stadt),
   `bodyText` (Mehr-Absatz, USP-Trust-Block, optional „Gültig bis
   …" wenn `validUntil` mitkommt), `cta` (zeitlich orientiert).
3. `mock-provider.ts` um die siebte Methode erweitern
   (Status-Header 19 → 20). **Mock-Phase abgeschlossen** —
   `buildStubProvider` wird beim Mock dann nur noch als
   Notnagel-Default mitgeführt.
4. `src/tests/ai-mock-provider.test.ts` um Offer-Campaign-Block
   ergänzt (mit/ohne `validUntil`, USPs im Body, Determinismus,
   `invalid_input`). Block 12 (verbleibende Stubs) entfällt.
5. PROGRAM_PLAN.md um neuen Punkt erweitern (Roadmap-Self-Step),
   CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: UI, echte Provider — der Mock ist dann komplett.

### Quellen (Recherche zu dieser Code-Session)

- [TrueFuture Media – How to Beat Your Competitors With Social Media in 2026](https://www.truefuturemedia.com/articles/beat-competitors-social-media-2026)
- [Born Social – Best Hashtags for Instagram Growth in 2026](https://www.bornsocial.co/post/best-hashtags-for-business-growth)
- [Borala Agency – Hashtag Strategies for 2026: Dos, Don'ts, and Proven Tips](https://www.boralagency.com/hashtags-strategies/)
- [SocialRails – Best LinkedIn Hashtags in 2026: 150+ Top Hashtags by Industry](https://socialrails.com/blog/best-hashtags-for-linkedin)
- [Hashtag Tools – Small Business Instagram Hashtags 2026](https://hashtagtools.io/blog/small-business-instagram-hashtags-growth-strategy-2026)
- [SkedSocial – How to Use Hashtags on Instagram in 2026](https://skedsocial.com/blog/how-to-use-hashtags-on-instagram-in-2026-hashtag-tips-to-up-your-insta-game)
- [Planable – Hashtag Strategy for 2026: A Guide for Any Social Media Platform](https://planable.io/blog/hashtag-strategy/)
- [First Ascent Design – Are Hashtags Still Relevant in 2026?](https://firstascentdesign.com/hashtag-strategy-2026/)
- [PostWaffle – 50 Social Media Post Examples That Actually Drive Sales (2026)](https://www.postwaffle.com/blog/social-media-posts-examples)
- [Plann by Linktree – Social Media Marketing for Hairdressers](https://www.plannthat.com/hairdresser-social-media-marketing/)

---

## Code-Session 20 – Mock-Phase abgeschlossen + README-Rewrite + Codex-Workflow
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein) + README-Refactor + Methodik (Codex-Junior)
Meilenstein: 2 (KI-Schicht — Mock-Phase ✅) + Programm-Methodik

### 1. Was wurde umgesetzt?

Dreifach-Schritt:

**A — Code (`generateOfferCampaign`):**
- `src/core/ai/providers/mock/offer-campaign.ts` (neu) implementiert
  `mockGenerateOfferCampaign(input): Promise<OfferCampaignOutput>`:
  - Validierung via `OfferCampaignInputSchema.safeParse` →
    `AIProviderError("invalid_input", …)`.
  - **Headline** (≤ 120): `${offerTitle} — bei ${businessName}`.
  - **Subline** (≤ 280): „Klar beschriebenes ${industryLabel}-Angebot
    in ${city}, ${tone} umgesetzt." — lokal verankert, ohne
    Superlative.
  - **bodyText** (≤ 2000): bis zu 3 Absätze.
    - Inhalts-Absatz: `details` (≥ 10 Zeichen) als Saatzeile
      übernommen, sonst generischer Lückentext mit `industryLabel`.
    - USP-Trust-Block: „Was Sie bekommen:\n· …\n· …\n· …"
      (max. 3 Bullets aus `context.uniqueSellingPoints`).
    - Validitäts-Hinweis: „Gültig bis ${validUntil}. …" — nur wenn
      `validUntil` mitkommt.
  - **CTA** (≤ 120): `Jetzt sichern — gültig bis …` mit `validUntil`,
    `Jetzt unverbindlich anfragen.` ohne. Zeit-orientiert, kein Druck.
  - 2026-Recherche zu Limited-Time-Offers berücksichtigt: echte
    Knappheit, klare Deadline, Kunden-Nutzen vor Druck.
  - Output gegen `OfferCampaignOutputSchema.parse` validiert.
- `src/core/ai/providers/mock-provider.ts`: alle 7 Methoden
  komponiert. Status-Header: **Mock-Phase abgeschlossen**.
  `buildStubProvider` läuft nur noch als defensiver Default mit,
  falls das Interface erweitert wird.
- `src/tests/ai-mock-provider.test.ts` um Block 12a–12i erweitert
  (~30 zusätzliche Assertions, ~380 gesamt):
  - 12a: 2 Branchen × { mit/ohne validUntil/details } → Output-Shape.
  - 12b: `validUntil` → Body und CTA enthalten Datum.
  - 12c: ohne `validUntil` → CTA neutral-einladend, kein „Gültig
    bis"-Hinweis im Body.
  - 12d: Headline mit `offerTitle` + `businessName`.
  - 12e: Subline mit `city` + `industryLabel`.
  - 12f: `details` ≥ 10 Zeichen → Saatzeile übernommen
    („Lichttest" erscheint im Body).
  - 12g: USPs als Trust-Bullets (`Was Sie bekommen:` + `· TÜV in 24 h`).
  - 12h: Determinismus.
  - 12i: zu kurzer `offerTitle` → `invalid_input`.
- **Block 13** prüft, dass alle 7 Mock-Methoden Funktionen sind —
  keine Stub-Methoden mehr. Helper `expectUnavailable` wurde
  entfernt (kein Test braucht ihn mehr).

**B — README-Rewrite:**
- `README.md` komplett überarbeitet: selbst-tragendes Roadmap-Konzept,
  9 Badges, klare Trennung zwischen „rolling status" (READMI) und
  „chronologisch" (CHANGELOG/RUN_LOG). Konkrete Session-Nummern
  stehen nur noch in CHANGELOG/RUN_LOG, nicht im README — die
  README muss nicht mehr alle 20 Sessions nachgepflegt werden.
- Neue „Mitwirkende & Verantwortlichkeiten"-Tabelle benennt Claude,
  Codex und Auftraggeber explizit.
- Veraltete „Status nach Session 3"-Sektion entfernt.

**C — Codex-Junior-Workflow:**
- `codex.md` (neu, ~9 KB) — verbindlicher Verhaltenskodex:
  - **NEVER-Zone** (Abschnitt 1): `Claude.md`, `PROGRAM_PLAN.md`,
    `SESSION_PROTOCOL.md`, `codex.md` selbst, alle Schemas,
    Provider-Code, Pricing, Industries, Themes, Tooling-Configs,
    CI/CD, Dependencies.
  - **Komfortzone** (Abschnitt 2): Tippfehler, JSDoc, Trailing-
    Newlines, `aria-label` auf Icon-Only-Buttons, `alt`-Texte in
    Demo-Daten, Charakterisierungs-Tests (nur ergänzend).
  - **Workflow** (Abschnitt 3): `codex/<slug>`-Branch ab `main`,
    Diff-Cap 20 KB / 8 Dateien, Pflicht-Verifikation
    (typecheck/lint/build/smoketests), Commit-Format
    `chore(codex): …` mit Footer `codex-backlog: #N`, kein
    Auto-Merge.
  - **Tag-für-Tag-Spickzettel** (Abschnitt 8): 11-Punkte-Checkliste.
  - **Eskalations-Kriterien** (Abschnitt 9): Codex stoppt sofort,
    schreibt `[needs-review]`-Eintrag.
- `docs/CODEX_BACKLOG.md` (neu, ~6 KB) — 9 Starter-Tasks:
  1. JSDoc für `clamp`-Helper (6 Mock-Files).
  2. Tippfehler-Pass Marketing-Sektionen.
  3. `aria-label` an Icon-Only-Buttons.
  4. Trailing-Newline-Pass.
  5. `alt`-Texte in Demo-Daten.
  6. `[blocked]` Prettier-Plugin-Tailwind aktivieren.
  7. Glossar `docs/GLOSSARY.md`.
  8. Konsistente deutsche Anführungszeichen.
  9. README-Tippfehler nachpflegen.
- `docs/CODEX_LOG.md` (neu, ~1 KB) — append-only-Tagebuch mit
  striktem Format. Beim Reinkommen liest Claude diese Datei zuerst.

**D — Roadmap-Selbstaktualisierung (Pflicht-Schritt 6):**
- `docs/PROGRAM_PLAN.md` Meilenstein-2-Block aktualisiert (Mock-
  Phase abgeschlossen, Live-Provider-Phase startet).
- 4 neue Backlog-Items:
  - Track A: Offer-Campaign-Bundle (1 Trigger → Social+Review),
    AI-API-Route mit Edge-Runtime.
  - Track F: Glossar (Codex-Backlog #7), Codex-Onboarding-Polish.
  - **Track G (neu)**: Mitwirkende-Koordination, granularer
    Zugriffsschutz für Codex via pre-commit-Hook auf
    `codex/`-Branches.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (4 Dateien):
- `src/core/ai/providers/mock/offer-campaign.ts`
- `codex.md`
- `docs/CODEX_BACKLOG.md`
- `docs/CODEX_LOG.md`

Geändert:
- `README.md` (komplett-Rewrite)
- `src/core/ai/providers/mock-provider.ts`
- `src/tests/ai-mock-provider.test.ts`
- `docs/PROGRAM_PLAN.md` (Meilenstein 2 + Tracks A/F/G)
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~70 KB. Größer als die übliche 30–80-KB-Range, aber im
oberen Drittel des Limits — gerechtfertigt durch die drei parallelen
Methodik-Schritte (Mock-Phase-Abschluss, README-Rewrite,
Codex-Workflow-Etablierung).

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
npx tsx src/tests/ai-mock-provider.test.ts            # 0 → ~380 Asserts
npx tsx src/tests/ai-provider-resolver.test.ts        # 0 → keine Regression
```

Programmatisch:

```ts
import { mockProvider } from "@/core/ai/providers/mock-provider";

await mockProvider.generateOfferCampaign({
  context: {
    industryKey: "auto_workshop",
    packageTier: "gold",
    language: "de",
    businessName: "KFZ Müller",
    city: "Leipzig",
    toneOfVoice: ["sachlich", "ehrlich"],
    uniqueSellingPoints: ["TÜV in 24 h", "Leihwagen kostenlos"],
  },
  offerTitle: "TÜV-Paket Frühling",
  details: "TÜV-Vorbereitung inkl. Lichttest, Bremsen-Sichtprüfung.",
  validUntil: "31.05.2026",
});
// → { headline: "TÜV-Paket Frühling — bei KFZ Müller",
//     subline:  "Klar beschriebenes Autowerkstatt-Angebot in Leipzig, …",
//     bodyText: "TÜV-Vorbereitung inkl. Lichttest …\n\n
//                Was Sie bekommen:\n· TÜV in 24 h\n· Leihwagen …\n\n
//                Gültig bis 31.05.2026. …",
//     cta:      "Jetzt sichern — gültig bis 31.05.2026." }
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                          | Status |
| ------------------------------------------------------------------ | ------ |
| `generateOfferCampaign` deterministisch, branchenneutral           | ✅      |
| 7. von 7 Mock-Methoden scharf — **Mock-Phase abgeschlossen**       | ✅      |
| validUntil wirkt sich auf Body und CTA aus                         | ✅      |
| Ohne validUntil bleibt CTA neutral-einladend                       | ✅      |
| `details` als Saatzeile übernommen                                 | ✅      |
| USPs als Trust-Bullets im Body                                     | ✅      |
| Defensive Input-Validierung → `invalid_input`                      | ✅      |
| Output gegen `OfferCampaignOutputSchema` validiert                 | ✅      |
| Smoketest +30 Assertions (~380 gesamt)                             | ✅      |
| Build/Typecheck/Lint grün                                          | ✅      |
| README-Rewrite: selbst-tragend, 9 Badges, Mitwirkende-Tabelle      | ✅      |
| `codex.md` (10 Abschnitte, NEVER-Zone, Workflow, Eskalation)        | ✅      |
| `docs/CODEX_BACKLOG.md` mit 9 Starter-Tasks                         | ✅      |
| `docs/CODEX_LOG.md` (append-only-Format)                            | ✅      |
| `docs/PROGRAM_PLAN.md` +4 neue Items (Tracks A/F/G)                 | ✅      |
| Recherche-Step durchgeführt + Quellen zitiert                      | ✅      |

### 5. Was ist offen?

- **Code-Session 21**: OpenAI-Provider scharf machen — `openai`-SDK
  als Dependency, `generateWebsiteCopy` als erste Live-Methode,
  Caching-Schicht, Cost-Tracking-Pipe. Mock bleibt parallel als
  Fallback.
- **Codex**: 9 Backlog-Tasks warten auf einen Codex-Pass.
- **Self-Extending Backlog** (4 neue Items aus dieser Session):
  Offer-Campaign-Bundle, AI-API-Route mit Edge-Runtime, Glossar,
  Codex-pre-commit-Schutz.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 21 – OpenAI-Provider scharf (`generateWebsiteCopy`).**

Klein zugeschnitten:

1. WebSearch zu „2026 OpenAI SDK structured outputs best practices",
   „prompt caching" und „cost-tracking pattern für Provider-Adapter".
2. Dependency `openai@^4` (oder neueste) hinzufügen
   (`package.json` + `package-lock.json`). Dies ist die **erste**
   externe AI-SDK-Dependency im Repo.
3. `src/core/ai/providers/openai-provider.ts` aktualisieren:
   - Schritt 1 dieser Session **nur** `generateWebsiteCopy` scharf
     machen, alle anderen 6 Methoden bleiben Stub.
   - System-Prompt aus `IndustryPreset.websiteCopyPrompts`,
     User-Prompt aus dem `WebsiteCopyInput`.
   - `response_format: { type: "json_object" }` mit Schema-Hinweis
     im System-Prompt, dann
     `WebsiteCopyOutputSchema.parse(JSON.parse(content))`.
   - `AIProviderError`-Mapping: 401 → `no_api_key`, 429 →
     `rate_limited`, 5xx → `provider_unavailable`.
4. `src/tests/ai-provider-resolver.test.ts` **nicht** anfassen
   (würde echten Call brauchen). Eine optionale, nur-mit-API-Key-
   Smoketest-Datei `src/tests/ai-openai-live.test.ts` mit
   `if (!process.env.OPENAI_API_KEY) skip;`.
5. PROGRAM_PLAN.md +1 Item (Roadmap-Self-Step), CHANGELOG/RUN_LOG,
   Commit, Push.

Bewusst NICHT: andere Methoden, UI, Dashboard-Integration —
dafür gibt es Folge-Sessions.

### Quellen (Recherche zu dieser Code-Session)

- [LocaliQ – Limited-Time Offers: Tips, Templates & Examples to Boost Sales Fast](https://localiq.com/blog/limited-time-offers/)
- [Hibu – 17 Spring Promotion Ideas to Grow Your Small Business](https://hibu.com/blog/marketing-tips/17-spring-promotion-ideas-to-grow-your-small-business)
- [Engagelab – How to Leverage the Power of the Limited Time Offer Strategy](https://www.engagelab.com/blog/limited-time-offers)
- [Strategic Factory – 2026 Content Calendar: Key Dates & Campaign Ideas for Every Industry](https://strategicfactory.com/resources/ultimate-2026-marketing-calendar-by-industry/)
- [Claspo.io – 16 Limited Time Offer Examples & Best Practices Guide](https://claspo.io/blog/limited-time-offer-10-examples-to-boost-conversions/)
- [GetSiteControl – 10 Limited-Time Offer Examples + Templates to Help You Craft Yours](https://getsitecontrol.com/blog/limited-time-offer-examples/)
- [SDOCPA – Small Business Marketing Ideas That Actually Work in 2026](https://www.sdocpa.com/small-business-marketing-ideas/)
- [Indeed – Limited-Time Offers: 3 Examples and How To Create One](https://www.indeed.com/career-advice/career-development/limited-time-offers)

---

## Code-Session 21 – OpenAI-Provider scharf (`generateWebsiteCopy`)
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein) + erste externe AI-Dependency
Meilenstein: 2 (KI-Schicht — Live-Provider-Phase startet)

### 1. Was wurde umgesetzt?

Erste scharfe Live-AI-Methode überhaupt. Ein einzelner Pfad
(`generateWebsiteCopy`) ist jetzt nicht mehr Mock, sondern echter
OpenAI-Call — wenn ein Key gesetzt ist. Ohne Key bleibt das Verhalten
identisch zu vorher, weil der Resolver auf den Mock fällt.

- `src/core/ai/providers/openai/_client.ts` (neu) — gemeinsamer
  Client-Builder für **alle** zukünftigen scharfen OpenAI-Methoden:
  - `getOpenAIApiKey(opts?)` — defensiver Vor-Check, wirft
    `AIProviderError("no_api_key")` mit deutscher Nachricht statt den
    SDK-Konstruktor selbst zu lassen. Wichtig: das ist die
    Hauptstelle, an der die UI später eine sprechende Fehlermeldung
    anzeigen kann.
  - `getOpenAIModel(opts?)` — liest `OPENAI_MODEL` aus der ENV. Default
    `gpt-4o-mini`. Die ENV-Override ermöglicht es, später auf
    `gpt-4o`, `gpt-4.5` oder `o1-mini` zu wechseln, ohne Code
    anzufassen.
  - `buildOpenAIClient(opts?)` — `maxRetries: 2` (SDK-Default), damit
    429-Fehler automatisch mit exponential Backoff wiederholt werden.
  - `mapOpenAIError(err)` — vereinheitlicht alle SDK-Fehler auf
    `AIErrorCode`: 401/403 → `no_api_key`, 429 → `rate_limited`,
    5xx → `provider_unavailable`, 400 → `invalid_input`,
    sonst → `unknown`. `AIProviderError`s werden unverändert
    weitergeworfen.
- `src/core/ai/providers/openai/website-copy.ts` (neu) — die
  Live-Implementierung:
  - Eingabevalidierung über `WebsiteCopyInputSchema.safeParse`
    **vor** der Key-Prüfung, damit ein invalider Input keinen
    Cost-Verbrauch auslöst.
  - **Statischer System-Prompt** (~1500 Token) mit Stilrichtlinien:
    deutsch, keine Superlative, USPs würdigen, Fallback-Verhalten
    bei sinnlosem Input, strict an Schema halten. Statisch =
    cache-tauglich.
  - **User-Prompt** baut Branchen-Kontext (Label, Beschreibung,
    Zielgruppe), Betriebsname, Stadt, Tonalität, USPs, Variant
    und optionalen Hint. Variabler Teil hinten = Caching-best-
    practice.
  - **Structured Outputs** via `zodResponseFormat(WebsiteCopyOutputSchema,
    "website_copy")`. Strict-JSON-Schema verhindert Halluzinationen,
    SDK parst direkt nach Zod-Typ.
  - **`prompt_cache_key`** = `lp:website-copy:${industryKey}:${variant}`.
    Zwei Friseur-Salons in Bremen und Leipzig mit gleicher
    `hero`-Variante teilen sich denselben Cache-Slot
    (90 % Token-Rabatt nach OpenAI-Recherche).
  - **Doppelte Validierung**: nach `parsed`-Erhalt nochmal durch
    `WebsiteCopyOutputSchema.parse` — gleiche Sicherheits-Pipeline
    wie beim Mock-Provider.
  - Gut definierte Fehlerpfade:
    - `message.refusal` → `empty_response` mit dem Refusal-Text.
    - `!message.parsed` → `empty_response`.
    - SDK-`APIError` → über `mapOpenAIError`.
- `src/core/ai/providers/openai-provider.ts`: komponiert nun den
  Stub mit der scharfen Methode. Status-Header zeigt die noch
  offenen 6 Methoden.
- `src/tests/ai-openai-provider.test.ts` (neu) — zwei Modi:
  - **Strukturell** (12 Assertions, immer aktiv):
    1. `openaiProvider.key === "openai"`.
    2. Alle 7 AIProvider-Methoden sind Funktionen.
    3. Ohne `OPENAI_API_KEY` → `no_api_key` **vor** Netzwerk-Call.
    4. Ungültiges Input → `invalid_input`.
    5. Resolver mit `AI_PROVIDER=openai` + Key → openai-Provider.
    6. Übrige 6 Methoden werfen `provider_unavailable`
       (improveServiceDescription, generateFaqs,
       generateCustomerReply, generateReviewRequest,
       generateSocialPost, generateOfferCampaign).
  - **Live** (opt-in via `LP_TEST_OPENAI_LIVE=1` + `OPENAI_API_KEY`):
    echter Call, Output gegen `WebsiteCopyOutputSchema` validiert.
- `package.json`: `openai@^5.23.2` als erste externe AI-SDK-
  Dependency.
  - Version 5 (nicht 6), weil OpenAI-SDK v6 als peer-dep
    `zod ^3.25 || ^4` verlangt — wir bleiben bei `zod 3.24.1`,
    weil RHF + bestehende Schemas darauf abgestimmt sind.
  - Bump auf v6 wird in einer DX-Session geprüft, wenn wir
    Anthropic ergänzen und sowieso einen Dependency-Audit fahren.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (3 Code-Dateien):
- `src/core/ai/providers/openai/_client.ts`
- `src/core/ai/providers/openai/website-copy.ts`
- `src/tests/ai-openai-provider.test.ts`

Geändert:
- `src/core/ai/providers/openai-provider.ts` (Stub → komponiert)
- `package.json` + `package-lock.json` (Dependency `openai@^5`)
- `docs/PROGRAM_PLAN.md` (Roadmap-Selbstaktualisierung, +4 Items)
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~30 KB im Code-Bereich (ohne `package-lock.json`,
das ja durch npm autoritativ wächst). Im Session-Limit.

### 3. Wie teste ich es lokal?

Ohne API-Key (CI-Pfad):

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün, Bundle bleibt 102 KB
npx tsx src/tests/ai-mock-provider.test.ts            # ~380 Asserts ok
npx tsx src/tests/ai-provider-resolver.test.ts        # 22 Asserts ok
npx tsx src/tests/ai-openai-provider.test.ts          # 12 Strukturelle Asserts ok
```

Mit API-Key (Live-Smoketest opt-in):

```bash
export OPENAI_API_KEY="sk-..."
export LP_TEST_OPENAI_LIVE=1
npx tsx src/tests/ai-openai-provider.test.ts
# → "✓ Live-OpenAI-Call erfolgreich."
```

Programmatisch:

```ts
import { getAIProvider } from "@/core/ai";

const provider = getAIProvider();
// Ohne ENV: liefert Mock-Provider, generateWebsiteCopy ist deterministisch.
// Mit AI_PROVIDER=openai + OPENAI_API_KEY: liefert openai-Provider,
// generateWebsiteCopy ruft echtes Modell.

await provider.generateWebsiteCopy({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich", "modern"],
    uniqueSellingPoints: ["Termine auch samstags"],
  },
  variant: "hero",
});
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                      | Status |
| -------------------------------------------------------------- | ------ |
| `openai`-SDK-Dependency installiert (v5, zod-3-kompatibel)     | ✅      |
| `generateWebsiteCopy` ruft echte OpenAI-API mit Structured Out | ✅      |
| Defensiver `no_api_key`-Vor-Check vor Netzwerk-Call            | ✅      |
| Error-Mapping 401/429/5xx/400 → AIErrorCode                    | ✅      |
| Prompt-Caching-tauglich: statischer Prefix + `prompt_cache_key`| ✅      |
| Doppelte Validierung über `WebsiteCopyOutputSchema`            | ✅      |
| Übrige 6 OpenAI-Methoden bleiben Stub (`provider_unavailable`) | ✅      |
| Resolver mit Key routet auf openai, ohne Key auf mock          | ✅      |
| Strukturelle Smoketest (12 Asserts) ohne Netzwerk grün         | ✅      |
| Live-Smoketest opt-in über `LP_TEST_OPENAI_LIVE=1`             | ✅      |
| Bundle bleibt unverändert (Tree-Shaking funktioniert)          | ✅ (102 KB) |
| Build/Typecheck/Lint grün                                      | ✅      |
| Recherche-Step + Quellen zitiert                               | ✅      |
| Roadmap-Selbstaktualisierung: 4 neue Items                     | ✅      |

### 5. Was ist offen?

- **Code-Session 22**: zweite OpenAI-Live-Methode
  (`improveServiceDescription`). Nutzt denselben `_client.ts`-
  Helper, eigene `service-description.ts` mit zugespitztem
  System-Prompt für Service-Texte. Schmaler Mock-Vergleichs-
  Smoketest (Live-/Mock-Parität auf gleichem Input).
- **Codex**: 9 Backlog-Tasks warten weiterhin (alle aus Session 20).
- **Self-Extending Backlog** (4 neue Items aus dieser Session):
  Prompt-Caching-Telemetrie, Modell-Switch-UI, API-Key-Hygiene-
  Audit, Cost-Cap pro Betrieb.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 22 — OpenAI-Provider, zweite Live-Methode (`improveServiceDescription`).**

Klein zugeschnitten:

1. WebSearch zu „prompt template service description local
   business OpenAI structured outputs 2026" — verfeinert die
   System-Prompts für die zweite Methode.
2. `src/core/ai/providers/openai/service-description.ts` neu,
   analog zu `website-copy.ts`. Eigener System-Prompt, eigener
   `prompt_cache_key` (`lp:service-desc:${industryKey}:${targetLength}`).
3. `openai-provider.ts` um die zweite Methode erweitern.
4. `ai-openai-provider.test.ts` um zweite Strukturell-Suite
   ergänzen (analog: ohne Key → no_api_key, ungültig →
   invalid_input). Die übrigen 5 Stub-Asserts bleiben.
5. PROGRAM_PLAN.md +1 Item (Roadmap-Self-Step), CHANGELOG/RUN_LOG,
   Commit, Push.

Bewusst NICHT: andere 5 Methoden, UI, API-Route — pro Session
nur eine scharfe Methode.

### Quellen (Recherche zu dieser Code-Session)

- [OpenAI – Structured model outputs (Guides)](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI – Introducing Structured Outputs in the API](https://openai.com/index/introducing-structured-outputs-in-the-api/)
- [OpenAI – Prompt Caching (Guides)](https://developers.openai.com/api/docs/guides/prompt-caching)
- [OpenAI – Prompt Caching 201 (Cookbook)](https://developers.openai.com/cookbook/examples/prompt_caching_201)
- [OpenAI – Prompt Caching in the API (Blog)](https://openai.com/index/api-prompt-caching/)
- [TokenMix – Prompt Caching Guide 2026: Save 50–95 % on AI API Costs](https://tokenmix.ai/blog/prompt-caching-guide)
- [OpenAI – How to handle rate limits (Cookbook)](https://developers.openai.com/cookbook/examples/how_to_handle_rate_limits)
- [OpenAI – Error codes (Guides)](https://developers.openai.com/api/docs/guides/error-codes)
- [OpenAI Help Center – How can I solve 429 errors?](https://help.openai.com/en/articles/5955604-how-can-i-solve-429-too-many-requests-errors)
- [Portkey – OpenAI's Prompt Caching: A Deep Dive](https://portkey.ai/blog/openais-prompt-caching-a-deep-dive/)

---

## Code-Session 22 – OpenAI scharf (`improveServiceDescription`)
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein)
Meilenstein: 2 (KI-Schicht — Live-Provider-Phase)

### 1. Was wurde umgesetzt?

Zweite scharfe OpenAI-Methode. Das Muster aus Code-Session 21 trägt:
gemeinsamer `_client.ts`-Helper, isolierte Methoden-Datei, Stub-
Compose-Pattern, strukturelle + Live-Smoketest-Modi.

- `src/core/ai/providers/openai/service-description.ts` (neu)
  implementiert `openaiImproveServiceDescription(input)`:
  - Eingabevalidierung über `ServiceDescriptionInputSchema.safeParse`
    **vor** der Key-Prüfung (kein Cost bei invalidem Input).
  - **System-Prompt** mit klarem Aufbau:
    - Role-Prompting (deutscher Texter für lokale Dienstleister).
    - Stilrichtlinien (keine Superlative, konkrete Vorteile).
    - Aufbau-Regeln pro `targetLength`:
      - `short` → 1 Absatz (Saat + optional Preis/Dauer).
      - `medium` → 2 Absätze (Inhalt + Ablauf in 3 Schritten).
      - `long` → 3 Absätze (Inhalt + Ablauf + USP-Trust-Block).
    - Wenn `currentDescription` mitkommt: polieren, nicht komplett
      neu schreiben.
    - Fallback-Verhalten bei sinnlosem Input.
  - **User-Prompt** baut Branchen-Kontext, Service-Titel,
    `targetLength`-Hinweis und optional die bestehende
    Beschreibung.
  - **Structured Outputs** über
    `zodResponseFormat(ServiceDescriptionOutputSchema,
    "service_description")`.
  - **`prompt_cache_key`** = `lp:service-desc:${industryKey}:${targetLength}`
    — bündelt Calls über alle Betriebe einer Branche mit gleicher
    Längenstufe (System-Prompt ist statisch identisch, User-Prompt
    variiert nur bei den Variablen).
  - **Doppelte Validierung** durch `.parse(message.parsed)` als
    Sicherheitsnetz (gleiche Pipeline wie Mock-Provider).
  - Fehlerpfade über den gemeinsamen `mapOpenAIError`-Helper.
- `src/core/ai/providers/openai-provider.ts` komponiert jetzt zwei
  Live-Methoden:
  ```ts
  export const openaiProvider: AIProvider = {
    ...stub,
    generateWebsiteCopy: openaiGenerateWebsiteCopy,
    improveServiceDescription: openaiImproveServiceDescription,
  };
  ```
  Status-Header von 21 → 22.
- `src/tests/ai-openai-provider.test.ts` ergänzt:
  - 1c: zwei `no_api_key`-Asserts (vorher nur 1).
  - 1d: zwei `invalid_input`-Asserts (vorher nur 1) — der
    `serviceTitle="X"` testet die Schema-Untergrenze (min 2).
  - 1f: Stub-Assert für `improveServiceDescription` entfernt
    (nicht mehr Stub).
  - Live-Block: zweiter Call mit `targetLength=long` gegen
    `improveServiceDescription`, polished die mitgegebene
    `currentDescription` „Wäsche, Schnitt, Föhn-Finish — Termine
    auch samstags möglich.".
  - `__AI_OPENAI_PROVIDER_SMOKETEST__.structuralAssertions` von
    12 → 14.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (1 Datei):
- `src/core/ai/providers/openai/service-description.ts`

Geändert:
- `src/core/ai/providers/openai-provider.ts`
- `src/tests/ai-openai-provider.test.ts`
- `docs/PROGRAM_PLAN.md` (Roadmap-Selbstaktualisierung, +2 Items)
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~17 KB. Klar im Session-Limit.

### 3. Wie teste ich es lokal?

Ohne API-Key (CI-Pfad):

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün, Bundle 102 KB
npx tsx src/tests/ai-mock-provider.test.ts            # ~380 Asserts ok
npx tsx src/tests/ai-provider-resolver.test.ts        # 22 Asserts ok
npx tsx src/tests/ai-openai-provider.test.ts          # 14 Asserts ok
```

Mit API-Key (Live-Smoketest opt-in):

```bash
export OPENAI_API_KEY="sk-..."
export LP_TEST_OPENAI_LIVE=1
npx tsx src/tests/ai-openai-provider.test.ts
# → "✓ Live-OpenAI-Call (generateWebsiteCopy) erfolgreich."
# → "✓ Live-OpenAI-Call (improveServiceDescription) erfolgreich."
```

Programmatisch:

```ts
import { getAIProvider } from "@/core/ai";
const provider = getAIProvider();
await provider.improveServiceDescription({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich", "modern"],
    uniqueSellingPoints: ["Termine auch samstags", "Faire Festpreise"],
  },
  serviceTitle: "Damenhaarschnitt mit Tiefenpflege",
  currentDescription:
    "Wäsche, Schnitt, Föhn-Finish — Termine auch samstags möglich.",
  targetLength: "long",
});
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                         | Status |
| ----------------------------------------------------------------- | ------ |
| `improveServiceDescription` ruft echte OpenAI-API mit Strict-JSON | ✅      |
| Defensiver `no_api_key`-Vor-Check vor Netzwerk-Call               | ✅      |
| Caching: statischer Prefix + `prompt_cache_key` pro Branche+Länge | ✅      |
| `currentDescription` wird als Saat poliert (nicht überschrieben)  | ✅      |
| Längen-Logik nach `targetLength` im System-Prompt expliziert      | ✅      |
| Doppelte Validierung über `ServiceDescriptionOutputSchema`        | ✅      |
| Übrige 5 OpenAI-Methoden bleiben Stub (`provider_unavailable`)    | ✅      |
| Strukturelle Smoketest (14 Asserts) ohne Netzwerk grün            | ✅      |
| Live-Smoketest deckt beide scharfe Methoden ab                    | ✅      |
| Bundle bleibt 102 KB (Tree-Shaking funktioniert)                  | ✅      |
| Build/Typecheck/Lint grün                                         | ✅      |
| Recherche-Step + Quellen zitiert                                  | ✅      |
| Roadmap-Selbstaktualisierung: 2 neue Items                        | ✅      |

### 5. Was ist offen?

- **Code-Session 23**: Anthropic-Provider scharf, erste Live-Methode
  (`generateWebsiteCopy`). Eigener `_client.ts`-Helper für
  Anthropic-SDK (kein 1:1-Übertrag möglich, Anthropic hat eigene
  Tool-Use- und Caching-Mechanismen).
- **Codex**: 9 Backlog-Tasks warten weiterhin (alle aus Session 20).
- **Self-Extending Backlog** (2 neue Items aus dieser Session):
  Prompt-Bibliothek extrahieren, Saatzeilen-Übergabe Mock → Live.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 23 — Anthropic-Provider scharf (`generateWebsiteCopy`).**

Klein zugeschnitten:

1. WebSearch zu „Anthropic SDK 2026 structured outputs prompt
   caching tool use claude opus sonnet haiku".
2. Dependency `@anthropic-ai/sdk` hinzufügen (Peer-Dep-Check
   vorher!).
3. `src/core/ai/providers/anthropic/_client.ts` neu, analog zum
   OpenAI-Helper. Anthropic hat eigene Caching-Mechanik
   (`cache_control: { type: "ephemeral" }` in Message-Inhalten),
   die System-Prompt-Caching-Pattern muss daran angepasst werden.
4. `src/core/ai/providers/anthropic/website-copy.ts` neu — gleiches
   Output-Schema, eigene SDK-Aufruf-Logik. Kein
   `zodResponseFormat`-Helper bei Anthropic; stattdessen Tool-Use
   mit Schema-Definition oder Prompt-mit-JSON-Format-Anweisung +
   manuelles Parsing + `WebsiteCopyOutputSchema.parse`.
5. `anthropic-provider.ts` Stub → komponiert.
6. `ai-anthropic-provider.test.ts` neu, gleiche zwei Modi
   (strukturell + live opt-in via `LP_TEST_ANTHROPIC_LIVE=1`).
7. PROGRAM_PLAN.md +1 Item, CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: andere Methoden, UI, API-Route — pro Session
nur eine scharfe Methode.

### Quellen (Recherche zu dieser Code-Session)

- [Latitude – Template Syntax Basics for LLM Prompts](https://latitude.so/blog/template-syntax-basics-for-llm-prompts)
- [Karen Boyd, PhD – Simple prompt templates for better LLM results](https://drkarenboyd.com/blog/simple-prompt-templates-for-better-llm-results-today)
- [GeeksforGeeks – Prompt Templates](https://www.geeksforgeeks.org/artificial-intelligence/prompt-templates/)
- [LangChain – Prompt template format guide](https://docs.langchain.com/langsmith/prompt-template-format)
- [SAP Learning – Managing Prompts with the Prompt Registry](https://learning.sap.com/courses/solve-your-business-problems-using-prompts-and-llms-in-sap-generative-ai-hub/managing-prompts-with-the-prompt-registry-and-templates)
- [Klixresults – Local SEO for Tradespeople: The 2026 Complete Guide](https://www.klixresults.co.uk/post/local-seo-for-tradespeople)
- [Authority Specialist – 2026 German Auto Repair SEO Statistics](https://authorityspecialist.com/industry/automotive/german-auto-repair/seo-statistics)
- [The AI Journal – How AI is Transforming Local SEO for Service Businesses (2026)](https://aijourn.com/how-ai-is-transforming-local-seo-for-service-businesses-2026-guide/)

---

## Code-Session 23 – Hotfix: Business-Editor-Crash bei unvollständigem Hex
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Maintenance / Bug-Fix (klein, atomar)
Meilenstein: 1 (Foundation — Schliff)
Commit: `d4d7cd5`

### 1. Was wurde umgesetzt?

Akut-Fix: der Auftraggeber meldete „Application error: a client-side
exception has occurred" auf `/dashboard/<slug>/business`. Reproduktion:
beim Tippen in den Farb-Override-Feldern (Primärfarbe / Sekundärfarbe
/ Akzentfarbe) crasht die Live-Vorschau. Auf dem Handy sofort triggerbar
durch Auto-Vervollständigung.

Pfad zum Crash:
1. Form-Wert via `useWatch` → ungültiges Zwischen-Hex (`#`, `#1`, `#1f`).
2. `applyColorOverrides` reicht den Wert ungeprüft an `themeToCssVars`.
3. `hexToRgbTriplet` warf `Error("ungültige Hex-Farbe …")`.
4. React unwindet → Fehler-Boundary → „Application error".

Fix in zwei Lagen (defense in depth):

- `src/components/dashboard/business-edit/business-edit-preview.tsx`:
  `applyColorOverrides` validiert den Wert per Hex-Regex, bevor er das
  Theme überschreibt. Bei ungültigem Wert bleibt die Basis-Farbe
  stehen — die Vorschau sieht „eine Tippstelle lang" unverändert aus
  statt zu sterben.
- `src/core/themes/theme-resolver.ts`: `hexToRgbTriplet` wirft nicht
  mehr. Stattdessen Fallback-Triplet `"0 0 0"` + `console.warn`. Das
  ist die zweite Verteidigungslinie — falls irgendwo anders ein
  Theme-Override durchschlüpft, crasht React trotzdem nicht mehr.
- `src/tests/themes.test.ts`: invalid-Hex-Test umgestellt. Statt
  „wirft" jetzt 3 neue Asserts: `not-a-hex` → Fallback-Triplet,
  `"#"` → Fallback-Triplet, `"#1f"` → Fallback-Triplet, plus
  `console.warn`-Counter.

### 2. Welche Dateien wurden geändert?

Geändert (3 Dateien):
- `src/components/dashboard/business-edit/business-edit-preview.tsx`
- `src/core/themes/theme-resolver.ts`
- `src/tests/themes.test.ts`

Diff-Größe ~3 KB. Reine Maintenance — kein Feature, keine neue
Dependency.

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
npx tsx src/tests/themes.test.ts                      # incl. neue Hex-Asserts
```

Im Browser: `/dashboard/studio-haarlinie/business` öffnen, in der
Primärfarbe-Spalte langsam tippen (`#1f47d6`). Bei jedem Tastendruck
darf die Vorschau **nicht** crashen. Bei vollständig gültigem Wert
übernimmt die Vorschau die neue Farbe.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                       | Status |
| --------------------------------------------------------------- | ------ |
| Kein Crash beim Tippen unvollständiger Hex-Werte                | ✅      |
| `applyColorOverrides` ignoriert invalides Hex                   | ✅      |
| `hexToRgbTriplet` wirft nicht mehr (Fallback `"0 0 0"`)          | ✅      |
| Console-Warnung bei invalidem Hex                               | ✅      |
| Theme-Tests an die neue Semantik angepasst                      | ✅      |
| Build/Typecheck/Lint grün                                       | ✅      |

### 5. Was ist offen?

- **Code-Session 24** (siehe nächster Eintrag): Anthropic-Provider
  scharf für `generateWebsiteCopy`.
- Kein Recherche-Step nötig — der Fix ist mechanisch, keine neue
  Recherche-Erkenntnis.
- Keine Roadmap-Erweiterung — siehe Hinweis im
  Session-Protokoll-§6.2: reine Hotfixes brauchen das nicht
  zwingend, dafür wird der Maintenance-Backlog (`PROGRAM_PLAN.md`
  Track C/D) ohnehin laufend gepflegt.

### Quellen

Keine zusätzliche Recherche — bekannter Pattern (defensive Validation
gegen Live-Form-Werte). Bestehende Quellen aus Code-Session 10 zur
React-Hook-Form-Architektur reichen.

---

## Code-Session 24 – Anthropic-Provider scharf (`generateWebsiteCopy`)
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar) + zweite externe AI-Dependency
Meilenstein: 2 (KI-Schicht — Live-Provider-Phase)

### 1. Was wurde umgesetzt?

Erste scharfe Anthropic-Methode. Parallel zum OpenAI-Provider, aber
mit Anthropic-spezifischem Pattern: **Tool Use** statt
`zodResponseFormat` (Anthropic hat keinen direkten Zod-Helper).

- `src/core/ai/providers/anthropic/_client.ts` (neu) — gemeinsamer
  Client-Builder + Error-Mapper (analog zum OpenAI-Helper):
  - `getAnthropicApiKey(opts?)` mit defensivem Vor-Check, wirft
    `AIProviderError("no_api_key")`.
  - `getAnthropicModel(opts?)` — `ANTHROPIC_MODEL`-ENV-Override,
    Default `claude-sonnet-4-5`.
  - `buildAnthropicClient(opts?)` — `maxRetries: 2` (SDK-Default).
  - `mapAnthropicError(err)` — direktes Mapping über die SDK-
    Error-Klassen:
    - `AuthenticationError` / `PermissionDeniedError` → `no_api_key`
    - `RateLimitError` → `rate_limited`
    - `InternalServerError` → `provider_unavailable`
    - `BadRequestError` / `UnprocessableEntityError` → `invalid_input`
    - generischer `APIError` mit Status-Code-Fallback
- `src/core/ai/providers/anthropic/website-copy.ts` (neu) — die
  Live-Implementierung:
  - **Tool Use**: pseudo-Tool `emit_website_copy` mit
    `input_schema` (JSON Schema, von Hand geschrieben), dessen
    Properties exakt dem `WebsiteCopyOutputSchema` entsprechen.
    `tool_choice: { type: "tool", name: TOOL_NAME }` zwingt das
    Modell, das Tool aufzurufen.
  - **Prompt-Caching** via `cache_control: { type: "ephemeral" }`
    auf System-Prompt **und** Tool-Definition. Beide Blöcke sind
    ≥ 1024 Tokens, werden 5 min gecacht. Bei Hit zahlen wir nur
    den variablen User-Teil (~90 % Token-Rabatt nach Anthropic-
    Recherche).
  - **Identische Stilrichtlinien wie OpenAI-Provider** im System-
    Prompt — damit ein späterer Provider-Wechsel oder ein
    Side-by-side-A/B-Test keinen Tonalitäts-Bruch erzeugt.
  - **User-Prompt** aus Branchen-Kontext, Stadt, Tonalität, USPs,
    Variant, optionalem Hint.
  - **Doppelte Validierung**: SDK gibt `tool_use.input` als
    `unknown` zurück → wird durch `WebsiteCopyOutputSchema.parse`
    gejagt. Gleiche Pipeline wie Mock/OpenAI.
  - Fehlerpfade: kein `tool_use`-Block in `response.content` →
    `empty_response`. SDK-`APIError` → `mapAnthropicError`.
- `src/core/ai/providers/anthropic-provider.ts`: Stub → komponiert
  mit der scharfen Methode. 6 weitere Methoden bleiben Stub.
- `src/tests/ai-anthropic-provider.test.ts` (neu) — strukturell
  + opt-in live, gleiches Muster wie OpenAI-Smoketest:
  - 12 strukturelle Asserts (Provider-Key, alle 7 Methoden sind
    Funktionen, ohne Key → `no_api_key` vor Netzwerk-Call,
    ungültiges Input → `invalid_input`, Resolver mit Key →
    anthropic, übrige 6 Methoden → `provider_unavailable`).
  - Live-Block (opt-in via `LP_TEST_ANTHROPIC_LIVE=1` +
    `ANTHROPIC_API_KEY`) ruft echtes Modell, validiert Output.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (3 Code-Dateien):
- `src/core/ai/providers/anthropic/_client.ts`
- `src/core/ai/providers/anthropic/website-copy.ts`
- `src/tests/ai-anthropic-provider.test.ts`

Geändert:
- `src/core/ai/providers/anthropic-provider.ts`
- `package.json` + `package-lock.json` (`@anthropic-ai/sdk@^0.62.0`)
- `docs/PROGRAM_PLAN.md` (Roadmap-Selbstaktualisierung, +2 Items)
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~30 KB im Code-Bereich. Im Session-Limit.

### 3. Wie teste ich es lokal?

Ohne API-Key (CI-Pfad):

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün, Bundle 102 KB
npx tsx src/tests/ai-mock-provider.test.ts            # ~380 Asserts
npx tsx src/tests/ai-provider-resolver.test.ts        # 22 Asserts
npx tsx src/tests/ai-openai-provider.test.ts          # 14 Asserts
npx tsx src/tests/ai-anthropic-provider.test.ts       # 12 Asserts
```

Mit API-Key (Live-Smoketest opt-in):

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export LP_TEST_ANTHROPIC_LIVE=1
npx tsx src/tests/ai-anthropic-provider.test.ts
# → "✓ Live-Anthropic-Call (generateWebsiteCopy) erfolgreich."
```

Programmatisch:

```ts
import { getAIProvider } from "@/core/ai";
const provider = getAIProvider();
// Mit AI_PROVIDER=anthropic + ANTHROPIC_API_KEY: liefert anthropic-Provider.
// Ohne: Mock-Fallback.
await provider.generateWebsiteCopy({
  context: {
    industryKey: "hairdresser",
    packageTier: "silber",
    language: "de",
    businessName: "Salon Sophia",
    city: "Bremen",
    toneOfVoice: ["freundlich", "modern"],
    uniqueSellingPoints: ["Termine auch samstags"],
  },
  variant: "hero",
});
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                      | Status |
| -------------------------------------------------------------- | ------ |
| `@anthropic-ai/sdk`-Dependency installiert (v0.62, zod-3-kompat) | ✅      |
| `generateWebsiteCopy` ruft echte Anthropic-API mit Tool Use     | ✅      |
| Defensiver `no_api_key`-Vor-Check vor Netzwerk-Call             | ✅      |
| Error-Mapping über SDK-Klassen (Auth, RateLimit, ServerError…)  | ✅      |
| Caching: System + Tool mit `cache_control: ephemeral`           | ✅      |
| Doppelte Validierung über `WebsiteCopyOutputSchema`             | ✅      |
| Übrige 6 Anthropic-Methoden bleiben Stub                        | ✅      |
| Resolver mit Key routet auf anthropic, ohne Key auf mock        | ✅      |
| Strukturelle Smoketest (12 Asserts) ohne Netzwerk grün          | ✅      |
| Live-Smoketest opt-in über `LP_TEST_ANTHROPIC_LIVE=1`           | ✅      |
| Bundle bleibt 102 KB                                            | ✅      |
| Build/Typecheck/Lint grün                                       | ✅      |
| Recherche-Step + Quellen zitiert                                | ✅      |
| Roadmap-Selbstaktualisierung: 2 neue Items                      | ✅      |

### 5. Was ist offen?

- **Code-Session 25**: zweite Anthropic-Methode
  (`improveServiceDescription`). Gleiches Tool-Use-Muster mit
  eigenem `service-description.ts`. Eigener `cache_control`-
  Block pro Tool.
- **Codex**: 9 Backlog-Tasks warten weiterhin (alle aus Session 20).
- **Self-Extending Backlog** (2 neue Items aus dieser Session):
  Provider-Parity-Suite (gleicher Input → beide Live-Provider),
  `zodToToolInputSchema`-Helper für Anthropic-Tool-Use.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 25 — Anthropic, zweite Live-Methode (`improveServiceDescription`).**

Klein zugeschnitten:

1. WebSearch zu „Anthropic tool use multi-step service description
   prompt 2026 best practices".
2. `src/core/ai/providers/anthropic/service-description.ts` neu,
   analog zu `website-copy.ts`. Eigenes Tool `emit_service_description`
   mit `input_schema` für `shortDescription` + `longDescription`.
3. `anthropic-provider.ts` um die zweite Methode erweitern.
4. `ai-anthropic-provider.test.ts` zwei zusätzliche Strukturell-
   Asserts (no_api_key + invalid_input für die zweite Methode),
   Stub-Assert für `improveServiceDescription` entfernen.
5. PROGRAM_PLAN.md +1 Item, CHANGELOG/RUN_LOG, Commit, Push.

### Quellen (Recherche zu dieser Code-Session)

- [Anthropic – Prompt Caching (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Anthropic – Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use)
- [Thomas Wiegold – Claude API Structured Output: Complete Guide](https://thomas-wiegold.com/blog/claude-api-structured-output/)
- [Markaicode – Cut Anthropic API Costs 90 % with Prompt Caching 2026](https://markaicode.com/anthropic-prompt-caching-reduce-api-costs/)
- [AI SDK – Node: Dynamic Prompt Caching](https://ai-sdk.dev/cookbook/node/dynamic-prompt-caching)
- [DEV Community – How to get consistent structured output from Claude](https://dev.to/heuperman/how-to-get-consistent-structured-output-from-claude-20o5)
- [Anthropic – TypeScript SDK on GitHub](https://github.com/anthropics/anthropic-sdk-typescript)
- [Anthropic – Models overview (Claude API Docs)](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Anthropic – TypeScript SDK on npm](https://www.npmjs.com/package/@anthropic-ai/sdk)

---

## Code-Session 25 – Anthropic scharf (`improveServiceDescription`)
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein)
Meilenstein: 2 (KI-Schicht — Live-Provider-Phase)

### 1. Was wurde umgesetzt?

Zweite scharfe Anthropic-Methode. Das Muster aus Code-Session 24
trägt: gemeinsamer `_client.ts`-Helper, isolierte Methoden-Datei,
Stub-Compose-Pattern, struktureller + Live-Smoketest-Modus.

- `src/core/ai/providers/anthropic/service-description.ts` (neu)
  implementiert `anthropicImproveServiceDescription(input)`:
  - Eingabevalidierung über `ServiceDescriptionInputSchema.safeParse`
    **vor** der Key-Prüfung (kein Cost bei invalidem Input).
  - **Tool Use**: pseudo-Tool `emit_service_description` mit
    `input_schema` (JSON Schema, von Hand geschrieben), Properties
    `shortDescription` (≤ 240) und `longDescription` (≤ 2000).
    `tool_choice: { type: "tool", name: TOOL_NAME }` zwingt das
    Modell, das Tool aufzurufen.
  - **System-Prompt** inhaltlich kompatibel mit dem OpenAI-
    Pendant aus Code-Session 22:
    - Role-Prompting (deutscher Texter für lokale Dienstleister).
    - Stilrichtlinien (keine Superlative, konkrete Vorteile).
    - Aufbau-Regeln pro `targetLength`:
      - `short` → 1 Absatz (Saat + optional Preis/Dauer).
      - `medium` → 2 Absätze (Inhalt + Ablauf in 3 Schritten).
      - `long` → 3 Absätze (Inhalt + Ablauf + USP-Trust-Block).
    - `currentDescription`-Polish-Anweisung („polieren, nicht
      komplett neu schreiben").
    - Fallback-Verhalten bei sinnlosem Input.
    - Anthropic-spezifischer Schluss: „Antworte ausschließlich
      über das Tool. Kein Free-Text."
  - **User-Prompt** baut Branchen-Kontext, Service-Titel,
    `targetLength`-Hinweis und optional die bestehende
    Beschreibung.
  - **Prompt-Caching** via `cache_control: { type: "ephemeral" }`
    auf System-Prompt **und** Tool-Definition (5 min TTL).
  - **`max_tokens: 2048`** statt 1024 — der `longDescription`-Slot
    kann bis zu ~2000 Zeichen ≈ ~1500 Tokens benötigen, plus
    `shortDescription` und Tool-Use-Boilerplate.
  - **Doppelte Validierung** durch `.parse(toolUse.input)`.
  - Fehlerpfade über den gemeinsamen `mapAnthropicError`-Helper.
- `src/core/ai/providers/anthropic-provider.ts` komponiert jetzt
  zwei Live-Methoden:
  ```ts
  export const anthropicProvider: AIProvider = {
    ...stub,
    generateWebsiteCopy: anthropicGenerateWebsiteCopy,
    improveServiceDescription: anthropicImproveServiceDescription,
  };
  ```
  Status-Header von 24 → 25.
- `src/tests/ai-anthropic-provider.test.ts` ergänzt:
  - 1c: zwei `no_api_key`-Asserts (vorher nur 1).
  - 1d: zwei `invalid_input`-Asserts (vorher nur 1) — der
    `serviceTitle="X"` testet die Schema-Untergrenze (min 2).
  - 1f: Stub-Assert für `improveServiceDescription` entfernt
    (nicht mehr Stub).
  - Live-Block: zweiter Call mit `targetLength=long` gegen
    `improveServiceDescription`, polished die mitgegebene
    `currentDescription` „Wäsche, Schnitt, Föhn-Finish — Termine
    auch samstags möglich.".
  - `__AI_ANTHROPIC_PROVIDER_SMOKETEST__.structuralAssertions`
    von 12 → 14.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (1 Datei):
- `src/core/ai/providers/anthropic/service-description.ts`

Geändert:
- `src/core/ai/providers/anthropic-provider.ts`
- `src/tests/ai-anthropic-provider.test.ts`
- `docs/PROGRAM_PLAN.md` (Roadmap-Selbstaktualisierung, +1 Item, +1 verschärft)
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~17 KB. Klar im Session-Limit.

### 3. Wie teste ich es lokal?

Ohne API-Key (CI-Pfad):

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün, Bundle 102 KB
npx tsx src/tests/ai-mock-provider.test.ts            # ~380 Asserts
npx tsx src/tests/ai-provider-resolver.test.ts        # 22 Asserts
npx tsx src/tests/ai-openai-provider.test.ts          # 14 Asserts
npx tsx src/tests/ai-anthropic-provider.test.ts       # 14 Asserts
npx tsx src/tests/themes.test.ts                      # incl. Hex-Asserts
```

Mit API-Key (Live-Smoketest opt-in):

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export LP_TEST_ANTHROPIC_LIVE=1
npx tsx src/tests/ai-anthropic-provider.test.ts
# → "✓ Live-Anthropic-Call (generateWebsiteCopy) erfolgreich."
# → "✓ Live-Anthropic-Call (improveServiceDescription) erfolgreich."
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                          | Status |
| ------------------------------------------------------------------ | ------ |
| `improveServiceDescription` ruft echte Anthropic-API mit Tool Use  | ✅      |
| Defensiver `no_api_key`-Vor-Check vor Netzwerk-Call                | ✅      |
| Caching: System + Tool mit `cache_control: ephemeral`              | ✅      |
| `currentDescription` wird als Saat poliert (nicht überschrieben)   | ✅      |
| Längen-Logik nach `targetLength` im System-Prompt expliziert       | ✅      |
| Doppelte Validierung über `ServiceDescriptionOutputSchema`         | ✅      |
| Übrige 5 Anthropic-Methoden bleiben Stub (`provider_unavailable`)  | ✅      |
| Strukturelle Smoketest (14 Asserts) ohne Netzwerk grün             | ✅      |
| Live-Smoketest deckt beide scharfe Anthropic-Methoden ab           | ✅      |
| Bundle bleibt 102 KB (Tree-Shaking funktioniert)                   | ✅      |
| Build/Typecheck/Lint grün                                          | ✅      |
| Recherche-Step + Quellen zitiert                                   | ✅      |
| Roadmap-Selbstaktualisierung: 1 neu + 1 verschärft                 | ✅      |

### 5. Was ist offen?

- **Code-Session 26**: Gemini-Provider scharf, erste Live-Methode
  (`generateWebsiteCopy`). Eigener `_client.ts`-Helper für
  `@google/generative-ai` — Gemini hat eigene Strukturierungs-
  Mechaniken (`responseMimeType: "application/json"` mit
  `responseSchema`).
- **Codex**: 9 Backlog-Tasks warten weiterhin (alle aus Session 20).
- **Self-Extending Backlog**: Anthropic Structured-Outputs-
  Migration auf `output_config.format` als Folge-Item; bestehender
  Tool-Schema-Generator-Punkt verschärft.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 26 — Gemini-Provider scharf (`generateWebsiteCopy`).**

Klein zugeschnitten:

1. WebSearch zu „Google Generative AI SDK 2026 structured output
   responseSchema responseMimeType TypeScript best practices".
2. Dependency `@google/generative-ai` (Peer-Dep-Check vorher).
3. `src/core/ai/providers/gemini/_client.ts` neu, analog zu
   OpenAI/Anthropic. Gemini hat **kein** ephemeres Caching-Pattern
   wie Anthropic — stattdessen **Context Caching** als separate
   API für lange wiederholte Prefixe (lohnt sich erst ab größeren
   Volumen). Erstes Setup ohne Caching, Caching kommt in einer
   späteren Session.
4. `src/core/ai/providers/gemini/website-copy.ts` neu — gleiches
   Output-Schema. `responseMimeType: "application/json"` +
   `responseSchema` für strict JSON-Output. Manuelles
   `JSON.parse` + `WebsiteCopyOutputSchema.parse`.
5. `gemini-provider.ts` Stub → komponiert.
6. `ai-gemini-provider.test.ts` neu, gleiche zwei Modi
   (strukturell + live opt-in via `LP_TEST_GEMINI_LIVE=1`).
7. PROGRAM_PLAN.md +1 Item, CHANGELOG/RUN_LOG, Commit, Push.

Bewusst NICHT: andere Methoden, UI, API-Route — pro Session
nur eine scharfe Methode.

### Quellen (Recherche zu dieser Code-Session)

- [Anthropic – Structured outputs (Claude API Docs)](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Anthropic – Tool use with Claude (Overview)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Anthropic – Get structured output from agents (Agent SDK Docs)](https://platform.claude.com/docs/en/agent-sdk/structured-outputs)
- [Anthropic – Claude Platform Release Notes](https://platform.claude.com/docs/en/release-notes/overview)
- [Towards Data Science – A Hands-On Guide to Anthropic's New Structured Output Capabilities](https://towardsdatascience.com/hands-on-with-anthropics-new-structured-output-capabilities/)
- [Tessl – Anthropic boosts Claude API with Structured Outputs](https://tessl.io/blog/anthropic-brings-structured-outputs-to-claude-developer-platform-making-api-responses-more-reliable/)
- [Hacker News – Structured outputs on the Claude Developer Platform](https://news.ycombinator.com/item?id=45930598)
- [Instructor – Anthropic Claude Tutorial: Structured Outputs](https://python.useinstructor.com/integrations/anthropic/)

---

## Code-Session 25 (UI-Patch) – KI-Assistent-Stub auf echten Stand
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Bug-Fix / Doku-Seite (chirurgisch)
Meilenstein: 1 (Foundation — Schliff)
Commit: `6bed32f`

### 1. Was wurde umgesetzt?

Auf Hinweis des Auftraggebers: die Stub-Seite
`/dashboard/<slug>/ai` zeigte noch „Folgt in Session 13" und
„Provider-Adapter für Mock, OpenAI, Anthropic und Gemini" als
Zukunfts-Versprechen. Seit Code-Sessions 13–25 ist das Backend
tatsächlich scharf (Mock: alle 7, OpenAI/Anthropic: je 2 Methoden).

Ersetzt das generische `ComingSoonSection`-Snippet durch eine
ehrliche Status-Seite:

- Header-Badge **„Backend bereit · UI in Session 27"**.
- **Provider-Status-Tabelle** mit 7 Methoden × 4 Provider, je
  Checkmark/Clock-Icon. Spiegelt den tatsächlichen Stand exakt
  (Mock: alle 7 scharf, OpenAI/Anthropic: je 2, Gemini: 0 — wird
  mit Code-Session 26 auf 1 hochgezogen).
- Beschreibung pro Methode (Variants, Tonalitäten, Plattformen).
- Paket-Status-Block bleibt, mit aktualisierter Botschaft.
- Empty-State erklärt: Methoden funktionieren headless (siehe
  Smoketests), UI folgt in Code-Session 27.

### 2. Welche Dateien wurden geändert?

Geändert (1 Datei):
- `src/app/dashboard/[slug]/ai/page.tsx`

Diff-Größe ~6 KB. Reine Doku-Seite, keine neue Logik.

### 3. Wie teste ich es lokal?

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün
```

Im Browser:
`https://beko2210.github.io/LocalPilot-AI/dashboard/studio-haarlinie/ai/`
nach Pages-Propagation (1–5 min). Statt „Folgt in Session 13"
sollte jetzt die Status-Tabelle erscheinen.

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                  | Status |
| ---------------------------------------------------------- | ------ |
| Stale Stub durch Status-Seite ersetzt                      | ✅      |
| Provider-Status-Tabelle reflektiert wahren Stand           | ✅      |
| Build/Typecheck/Lint grün                                  | ✅      |
| Pages-Deploy enthält den Patch                             | ⏳ propagation |

### 5. Was ist offen?

Code-Session 27 — die echte Dashboard-UI für den KI-Assistent-
Playground (Methoden-Picker, Formulare, Mock-Aufruf, Copy-to-
Clipboard).

### 6. Was ist der nächste empfohlene Run?

**Code-Session 26 — Gemini-Provider scharf** (`generateWebsiteCopy`).
Kommt direkt im Anschluss als separater Commit.

### Quellen

Keine zusätzliche Recherche — kompositorische Doku-Seite, keine
neuen Pattern.

---

## Code-Session 26 – Gemini-Provider scharf (`generateWebsiteCopy`)
Datum: 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE`
Typ: Feature (klein, atomar) + dritte (letzte) externe AI-Dependency
Meilenstein: 2 (KI-Schicht — Live-Provider-Phase)

### 1. Was wurde umgesetzt?

Erste scharfe Gemini-Methode. Damit hat **jeder der drei
Live-Provider** mindestens eine scharfe Methode (`generateWebsiteCopy`):
OpenAI (Session 21), Anthropic (Session 24), Gemini (Session 26).

- `src/core/ai/providers/gemini/_client.ts` (neu) — gemeinsamer
  Client-Builder für alle zukünftigen Gemini-Methoden:
  - `getGeminiApiKey(opts?)` mit defensivem Vor-Check, wirft
    `AIProviderError("no_api_key")` mit deutscher Nachricht.
  - `getGeminiModel(opts?)` — `GEMINI_MODEL`-ENV-Override, Default
    `gemini-2.0-flash`.
  - `buildGeminiClient(opts?)` — instanziiert `GoogleGenAI` aus
    dem `@google/genai`-SDK.
  - `mapGeminiError(err)` — mappt SDK-`ApiError` über HTTP-Status:
    401/403 → `no_api_key`, 429 → `rate_limited`,
    5xx → `provider_unavailable`, 400 → `invalid_input`. Kein
    `instanceof`-Match auf konkrete Subklassen — über Status-Code
    stabiler über SDK-Versionen.
- `src/core/ai/providers/gemini/website-copy.ts` (neu) — die
  Live-Implementierung:
  - Eingabevalidierung über `WebsiteCopyInputSchema.safeParse` vor
    Key-Prüfung.
  - **Structured Output via `responseJsonSchema`**: Gemini hat seit
    SDK v1.x ein natives Constrained-Sampling-Feld, kein Tool-Use-
    Workaround wie Anthropic, kein Helper-Modul wie OpenAI.
  - `responseMimeType: "application/json"` zwingt JSON-Output.
  - **`propertyOrdering`** im Schema: laut 2026-Best-Practices muss
    die Reihenfolge der Properties im Schema mit der Reihenfolge im
    System-Prompt übereinstimmen (sonst kann das Modell die Felder
    verwechseln). Wir nennen `heroTitle` → `heroSubtitle` →
    `aboutText` in beiden Stellen.
  - **System-Prompt** identisch zu OpenAI/Anthropic-Pendants —
    gleiche Stilrichtlinien, gleiches Fallback-Verhalten,
    Tonalitäts-Konsistenz beim Provider-Wechsel.
  - **JSON-Parse + Zod-Validate** als doppelte Sicherheit: SDK
    gibt `response.text` als String, wir parsen und validieren
    gegen `WebsiteCopyOutputSchema`.
  - **Kein Caching** in dieser Iteration. Gemini hat eine separate
    `caches.create(...)`-API, die sich erst ab größerem Volumen
    lohnt — auf Roadmap.
- `src/core/ai/providers/gemini-provider.ts`: Stub → komponiert mit
  der scharfen Methode. 6 weitere Methoden bleiben Stub.
- `src/tests/ai-gemini-provider.test.ts` (neu) — strukturell + opt-in
  live, gleiches Muster wie OpenAI/Anthropic-Smoketests:
  - 12 strukturelle Asserts (Provider-Key, alle 7 Methoden sind
    Funktionen, ohne Key → `no_api_key` vor Netzwerk-Call,
    ungültiges Input → `invalid_input`, Resolver mit Key → gemini,
    übrige 6 Methoden → `provider_unavailable`).
  - Live-Block (opt-in via `LP_TEST_GEMINI_LIVE=1` +
    `GEMINI_API_KEY`) ruft echtes Modell, validiert Output.

### 2. Welche Dateien wurden geändert / neu angelegt?

Neu (3 Code-Dateien):
- `src/core/ai/providers/gemini/_client.ts`
- `src/core/ai/providers/gemini/website-copy.ts`
- `src/tests/ai-gemini-provider.test.ts`

Geändert:
- `src/core/ai/providers/gemini-provider.ts`
- `package.json` + `package-lock.json` (`@google/genai@^1`)
- `docs/PROGRAM_PLAN.md` (Roadmap-Selbstaktualisierung, +1 Item)
- `CHANGELOG.md`, `docs/RUN_LOG.md`

Diff-Größe ~30 KB im Code-Bereich. Im Session-Limit.

### 3. Wie teste ich es lokal?

Ohne API-Key (CI-Pfad):

```bash
npm run typecheck                                     # 0 errors
npm run lint                                          # 0 warnings
npm run build:static                                  # grün, Bundle 102 KB
npx tsx src/tests/ai-mock-provider.test.ts            # ~380 Asserts
npx tsx src/tests/ai-provider-resolver.test.ts        # 22 Asserts
npx tsx src/tests/ai-openai-provider.test.ts          # 14 Asserts
npx tsx src/tests/ai-anthropic-provider.test.ts       # 14 Asserts
npx tsx src/tests/ai-gemini-provider.test.ts          # 12 Asserts
npx tsx src/tests/themes.test.ts                      # incl. Hex-Asserts
```

Mit API-Key (Live-Smoketest opt-in):

```bash
export GEMINI_API_KEY="ya29-..."
export LP_TEST_GEMINI_LIVE=1
npx tsx src/tests/ai-gemini-provider.test.ts
# → "✓ Live-Gemini-Call (generateWebsiteCopy) erfolgreich."
```

### 4. Welche Akzeptanzkriterien sind erfüllt?

| Kriterium                                                       | Status |
| --------------------------------------------------------------- | ------ |
| `@google/genai`-Dependency installiert (v1.x)                    | ✅      |
| `generateWebsiteCopy` ruft echte Gemini-API mit `responseJsonSchema` | ✅  |
| Defensiver `no_api_key`-Vor-Check vor Netzwerk-Call              | ✅      |
| Error-Mapping über SDK-`ApiError` + HTTP-Status                  | ✅      |
| `propertyOrdering` Schema = System-Prompt-Reihenfolge            | ✅      |
| Doppelte Validierung über `WebsiteCopyOutputSchema`              | ✅      |
| Übrige 6 Gemini-Methoden bleiben Stub                            | ✅      |
| Resolver mit Key routet auf gemini, ohne Key auf mock            | ✅      |
| Strukturelle Smoketest (12 Asserts) ohne Netzwerk grün           | ✅      |
| Live-Smoketest opt-in über `LP_TEST_GEMINI_LIVE=1`               | ✅      |
| Bundle bleibt 102 KB                                             | ✅      |
| Build/Typecheck/Lint grün                                        | ✅      |
| Recherche-Step + Quellen zitiert                                 | ✅      |
| Roadmap-Selbstaktualisierung: 1 neues Item                       | ✅      |

### 5. Was ist offen?

- **Code-Session 27**: KI-Assistent-Playground-UI im Dashboard.
  Tab-/Karten-Picker für alle 7 Methoden, clientseitiger Mock-
  Aufruf, Copy-to-Clipboard, Provider-Auswahl-Badge. Damit
  visuell sichtbar, was die Schicht kann.
- **Self-Extending Backlog** (1 neues Item aus dieser Session):
  Gemini Context Caching aktivieren — eigene
  `caches.create(...)`-API mit TTL-Tracking + Cost-Bucket pro
  Branche/Variant.

### 6. Was ist der nächste empfohlene Run?

**Code-Session 27 — KI-Assistent-Playground-UI** (UI-Catch-Up).

Klein zugeschnitten:

1. WebSearch zu „2026 React form patterns dynamic schema-driven UI
   structured output preview".
2. `src/components/dashboard/ai-playground/` neuer Ordner mit:
   - `ai-playground.tsx` — Container mit Methoden-Picker.
   - 7 Method-Forms (`website-copy-form.tsx`, etc.).
   - `result-panel.tsx` mit Copy-to-Clipboard.
3. `src/app/dashboard/[slug]/ai/page.tsx` ersetzen — statt Status-
   Seite jetzt der echte Playground.
4. Ruft Mock-Provider clientseitig — kein Backend nötig, da
   Mock deterministisch ohne Netzwerk arbeitet.
5. Live-Provider-Calls bleiben für eine spätere API-Route-Session.
6. PROGRAM_PLAN.md Update, CHANGELOG/RUN_LOG, Commit, Push.

### Quellen (Recherche zu dieser Code-Session)

- [Google Cloud – Structured output (Generative AI on Vertex AI)](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/control-generated-output)
- [Google AI for Developers – Structured outputs (Gemini API)](https://ai.google.dev/gemini-api/docs/structured-output)
- [Firebase – Generate structured output using the Gemini API](https://firebase.google.com/docs/ai-logic/generate-structured-output)
- [Google Cloud – Specify a MIME response type for the Gemini API](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/samples/generativeaionvertexai-gemini-controlled-generation-response-schema)
- [DEV Community – How To Generate Structured Output (JSON, YAML) in Gemini AI](https://dev.to/shrsv/how-to-generate-structured-output-json-yaml-in-gemini-ai-2ok0)
- [APIDog – How to Use the Google Gen AI TypeScript/JavaScript SDK](https://apidog.com/blog/how-to-use-the-google-gen-ai/)
- [Google AI Developers Forum – Structured output from API using responseSchema](https://discuss.ai.google.dev/t/structured-output-from-api-using-responseschema-need-help/50297)
- [GitHub – googleapis/js-genai](https://github.com/googleapis/js-genai)

---

## State-Refresh nach Session 26 + Methodik-Update — 2026-04-27
Branch: `claude/setup-localpilot-foundation-xx0GE` · Typ: Maintenance + Methodik

**Was**: Erste komplette State-Refresh-Runde nach dem neuen
Programm-Konzept. Auslöser: Auftraggeber hat „Bewertungen Vorschau /
Social Media Vorschau / Einstellungen Vorschau" auf der Webseite gesehen
(stale ComingSoon-Stubs). Gleichzeitig Methodik um wiederkehrenden
Refresh-Rhythmus + Token-Effizienz erweitert, sodass solche Driften
automatisch gefangen werden.

**Dateien**:
- ✚ `src/components/dashboard/backend-ready-status.tsx` (wiederverwendbare
  Status-Karte für „Backend bereit · UI in Session N")
- 🔄 `src/components/dashboard/index.ts` (Re-Export)
- 🔄 `src/app/dashboard/[slug]/reviews/page.tsx` (BackendReadyStatus
  statt ComingSoon, da generateReviewRequest scharf ist)
- 🔄 `src/app/dashboard/[slug]/social/page.tsx` (BackendReadyStatus,
  da generateSocialPost scharf ist)
- 🔄 `src/app/dashboard/[slug]/settings/page.tsx` (Session-Nummer
  von 18 auf realistische 32 korrigiert; bleibt ComingSoon, da
  Settings echtes Backend braucht)
- ✚ `docs/RESEARCH_INDEX.md` (zentraler Quellen-Speicher; spart
  Tokens bei zukünftigen RUN_LOG-Einträgen)
- ✚ `docs/STATE_REFRESH_CHECKLIST.md` (Light-Pass alle 5 Sessions,
  Deep-Pass alle 20)
- 🔄 `Claude.md` (Programm-Philosophie Punkte 8 + 9: Refresh-Cadence
  und Token-Effizienz-Logging-Regeln)
- 🔄 `docs/SESSION_PROTOCOL.md` (Schritt 5 Doku: Compact-Format ab
  Session 27; Schritt 7 neu: State-Refresh-Cadence)
- 🔄 `docs/CODEX_BACKLOG.md` (+1 Item: deutsche Anführungszeichen
  in JSX-Prop-Strings escapen — von Claude zweimal getroffen,
  typischer Codex-Sweep)

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, alle 6
Smoketests ✅ (Mock ~380, Resolver 22, OpenAI 14, Anthropic 14,
Gemini 12, Themes inkl. Hex-Asserts). Bundle 102 KB unverändert.

**Roadmap**: Keine neuen PROGRAM_PLAN-Items; das Methodik-Update
ist selbst Track G (Mitwirkende-Koordination).

**Quellen**: keine neue Recherche — kompositorisch aus Beobachtungen
des Auftraggebers + Token-Beobachtung der eigenen Doku-Praxis.

**Nächste Session**: Code-Session 27 — KI-Assistent-Playground-UI
(Tab-Picker für 7 Methoden, clientseitiger Mock-Aufruf,
Copy-to-Clipboard). Diese Session demonstriert dann erstmals den
neuen Compact-Log-Format-Eintrag.

---

## Code-Session 27 – KI-Assistent-Playground-UI
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Erste echte Dashboard-UI für die KI-Schicht. `/dashboard/<slug>/ai`
zeigt einen konfig-gesteuerten Playground für alle 7 Mock-Methoden:
Methoden-Picker (Karten), Kontext-Box (read-only), dynamisches
Formular (5 Field-Typen), Generate-Button, Ergebnis-Panel mit
Copy-to-Clipboard. Funktioniert clientseitig im Static Export ohne
API. Live-Provider bewusst nicht im Browser (würde API-Keys
exposen) — folgt mit API-Route in Code-Session 28+.

**Dateien**:
- ✚ `src/components/dashboard/ai-playground/types.ts` (Discriminated
  Union für 7 Output-Typen, FieldConfig)
- ✚ `src/components/dashboard/ai-playground/method-configs.ts`
  (Konfig-Map mit `fields` + `defaults` + `call(business, values)`
  pro Methode, ruft `mockProvider` direkt)
- ✚ `src/components/dashboard/ai-playground/ai-playground.tsx`
  (Container mit Methoden-State, Form-State pro Methode, Error/
  Loading via `useTransition`, generischer FieldRenderer für 5
  Field-Typen)
- ✚ `src/components/dashboard/ai-playground/result-panel.tsx`
  (switch über `result.method` → spezifisches Rendering pro Typ
  + Copy-Button pro Feld/Variante)
- ✚ `src/components/dashboard/ai-playground/index.ts` (Barrel)
- 🔄 `src/app/dashboard/[slug]/ai/page.tsx` (BackendReadyStatus →
  `<AIPlayground business={business} />`)

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, alle 6
Smoketests ✅. Bundle-Wachstum auf der `/ai`-Route: 102 → 163 KB
(Mock-Provider-Chain zieht ~60 KB Industries + Validation +
Provider-Code mit). Andere Routen unverändert.

**Roadmap**: PROGRAM_PLAN +2 Items — AI-API-Route mit Auth für
Live-Provider-Aufruf aus Browser; USP-Editor pro Betrieb.

**Quellen**: `RESEARCH_INDEX.md` Track C (Methodik) — neu ergänzt:
- [Smashing Magazine – Building Dynamic Forms In React And Next.js (2026)](https://www.smashingmagazine.com/2026/03/building-dynamic-forms-react-next-js/) — schema-driven UI Pattern.
- [Formisch Blog – React Form Library Comparison 2026](https://formisch.dev/blog/react-form-library-comparison/) — Discriminated Unions in Forms.

**Nächste Session**: Code-Session 28 — `/api/ai/generate`-Route
mit Auth-Stub, Provider-Dropdown im Playground.

---

## Code-Session 28 – AI-API-Route + Provider-Dropdown im Playground
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Erste API-Route der App. `POST /api/ai/generate` dispatcht
mit Bearer-Auth-Stub via `LP_AI_API_KEY` an alle 4 Provider.
Playground bekommt einen Provider-Dropdown (Mock / OpenAI /
Anthropic / Gemini) + Token-Eingabefeld. Static-Export skippt die
Route über `pageExtensions: ["tsx","jsx"]`-Filter — keine
Build-Konflikte, GitHub Pages bleibt grün.

**Dateien**:
- ✚ `src/app/api/ai/generate/route.ts` (POST + GET-Health-Check,
  Zod-Discriminated-Union-Validierung der 7 Methoden,
  AIProviderError-→-HTTP-Status-Mapping, `runtime: "nodejs"`,
  `dynamic: "force-dynamic"`)
- 🔄 `next.config.mjs` (`pageExtensions` conditional: `["tsx","jsx"]`
  für Static-Export, alle für SSR — schließt `route.ts` im
  Pages-Build aus)
- 🔄 `src/components/dashboard/ai-playground/method-configs.ts`
  (`apiName` + `buildInput` pro Methoden-Config; sieben
  `build<Method>Input`-Helper extrahiert)
- 🔄 `src/components/dashboard/ai-playground/ai-playground.tsx`
  (Provider-Dropdown-Card + Token-Input, persistiert via
  localStorage `lp:ai-api-token:v1`; `handleGenerate` dispatcht
  Mock direkt vs. fetch zu `/api/ai/generate`; klare 404-Message
  im Static-Export-Pfad)

**Verifikation**: typecheck ✅, lint ✅, build:static ✅
(Route wird gefiltert), build (SSR) ✅ (Route als `ƒ /api/ai/generate`
sichtbar), alle 6 Smoketests ✅. Bundle 102 KB shared, /ai-Route
164 KB (+1 KB).

**Roadmap**: PROGRAM_PLAN — Item „AI-API-Route mit Auth"
abgehakt, ersetzt durch 5 Folge-Items (Cookie-/JWT-Auth,
Edge-Runtime-Migration, Cost-Tracking-Pipeline, Rate-Limiting,
Vercel-SSR-Deploy).

**Quellen**: `RESEARCH_INDEX.md` Track C (Methodik) — neu:
- [Next.js – Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports) — `pageExtensions`-Filter-Pattern.
- [Next.js – API Routes in Static Export Warning](https://nextjs.org/docs/messages/api-routes-static-export) — Limitierung verstanden.
- [Next.js – Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) — App-Router-Patterns.

**Nächste Session**: Code-Session 29 — Cost-Tracking-Pipeline auf
Server-Side (Token-Counts in Cost-Bucket loggen, Per-Betrieb-Cap).
Vorbedingung: Vercel-SSR-Deploy als zweite Deploy-Pipeline.

---

## Code-Session 29 – Cost-Tracking-Pipeline + Daily-Budget-Cap
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Server-side Cost-Estimation + Daily-Budget-Cap für die
KI-API-Route. Token-Heuristik (4 Zeichen ≈ 1 Token), 2026-aktuelle
Pricing-Tabelle (Mock $0, gpt-4o-mini $0.15/$0.60, claude-sonnet-4-5
$3/$15, gemini-2.0-flash $0.10/$0.40 per Mio Tokens). In-Memory-
Bucket-Tracker mit Tageswechsel-Reset + Pre-Flight-Cap-Check
(429 wenn überschritten). Playground zeigt Cost-Bar mit
Tagesbudget-Anteil pro API-Call.

**Dateien**:
- ✚ `src/core/ai/cost/pricing.ts` (Pricing-Tabelle pro Provider×Model,
  `estimateTokens`, `estimateCost`, `formatCostUsd`)
- ✚ `src/core/ai/cost/budget.ts` (In-Memory-Bucket-Map mit
  UTC-Tag-Schlüssel, `previewBudget`, `chargeBudget`,
  `getDailyCapUsd` aus `LP_AI_DAILY_CAP_USD` ENV mit Fallback $1.00)
- 🔄 `src/app/api/ai/generate/route.ts` (Pre-Flight-Cap-Check vor
  Provider-Call → 429 mit Cost-Block; nach Call: Output-Cost
  berechnen, Bucket buchen, Cost-Block in Antwort)
- 🔄 `src/components/dashboard/ai-playground/types.ts`
  (`PlaygroundCostInfo`-Interface, optional auf jedem
  `GenerationResult`)
- 🔄 `src/components/dashboard/ai-playground/ai-playground.tsx`
  (Cost aus API-Response übernehmen)
- 🔄 `src/components/dashboard/ai-playground/result-panel.tsx`
  (`<CostBar>`-Komponente mit Token-Counts, USD-Estimate und
  Tagesbudget-Progress)
- ✚ `src/tests/ai-cost.test.ts` (24 Asserts: Token-Heuristik,
  Pricing-Tabelle, Budget-Tracking, Bucket-Isolation)

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅, alle 7 Smoketests ✅ (Mock ~380, Resolver 22, OpenAI 14,
Anthropic 14, Gemini 12, Themes inkl. Hex, **Cost 24 NEU**).

**Roadmap**: 1 Item abgehakt (Cost-Cap pro Betrieb), ersetzt durch
5 Folge-Items (Bucket-Key per Betrieb, Persistenter Store, Monthly-
Cap, Cost-Audit-Log, echte Provider-Usage statt Heuristik).

**Quellen**: `RESEARCH_INDEX.md` Track A (AI-Provider-Token-Pricing).

**Nächste Session**: Code-Session 30 — Rate-Limit-UI im Playground
(`429`-Antwort sichtbar als „Limit erreicht — wann reset?"-Karte)
und Provider-Health-Indicator.

---

## Code-Session 30 – Rate-Limit-UI + Provider-Health + State-Refresh
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Zweite API-Route (`GET /api/ai/health`) liefert Auth-gated
Snapshot aller 4 Provider (`available`, `keyPresent`, `model`,
optional `reason`) plus Tagesbudget-Status und nächste UTC-Reset-
Zeit. Im Playground neue `<HealthCard>` zeigt das auf Mount/Refresh.
Bei 429-Antworten von `/api/ai/generate` blendet der Playground
statt einer generischen Fehlerbox eine `<RateLimitCard>` mit Live-
Countdown bis Reset und „auf Mock wechseln"-CTA ein. 429-Antworten
tragen jetzt 2026-Standard-Header `X-RateLimit-Limit`,
`X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`.

**Plus State-Refresh-Light** (Cadence-Trigger N % 5 === 0): alle 8
Smoketests grün, Stale-Stub-Audit clean (nur Bronze-Tier-Gating-
Treffer in services/leads — beabsichtigt), Codex-Backlog ohne
`[done]`-Items, README-Matrix passt.

**Dateien**:
- ✚ `src/core/ai/health.ts` (`getHealthSnapshot(env)` pure-function;
  Privacy-by-Design, Key-Wert tauchen nirgends im Snapshot auf)
- ✚ `src/app/api/ai/health/route.ts` (GET-Handler mit gleicher Auth
  wie POST `/api/ai/generate`)
- ✚ `src/components/dashboard/ai-playground/health-card.tsx`
  (Client-Side Fetch + Refresh-Button + Provider-Liste mit
  Check/Warning-Icons)
- ✚ `src/tests/ai-health.test.ts` (18 Asserts: empty-env, apiAuth-
  Spiegel, Privacy, Modell-Override, Budget-Block, Cap-Override,
  resetAtUtc-Logik)
- 🔄 `src/app/api/ai/generate/route.ts` (429 mit Standard-Headers
  + `resetAtUtc` im Cost-Block)
- 🔄 `src/components/dashboard/ai-playground/ai-playground.tsx`
  (HealthCard eingehängt, `<RateLimitCard>` mit Live-Countdown
  und „Auf Mock wechseln"-CTA, Rate-Limit-Status getrennt von
  generischen Errors)

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅ — beide API-Routen `/api/ai/generate` und `/api/ai/health` als
`ƒ` sichtbar. Alle 8 Smoketests ✅ (Mock ~380, Resolver 22, OpenAI 14,
Anthropic 14, Gemini 12, Themes inkl. Hex, Cost 24, **Health 18 NEU**).

**State-Refresh-Light** (N=30):
- Smoketest-Regression: 8/8 grün.
- Stale-Stub-Audit: 3 Treffer, alle intentional (Tier-Gating + echtes Future).
- Codex-Backlog: 9 `[pre-approved]`, 1 `[blocked]`, 0 `[done]` zum Archivieren.
- README rolling-status: unverändert ok.

**Roadmap**: PROGRAM_PLAN +3 Folge-Items in Track C
(Public-Status-Page, Status-History 7-Tage, Slack-/Email-Alert
bei >80 % Budget).

**Quellen**: `RESEARCH_INDEX.md` Track A — neue Quellen aus dem
Rate-Limit-UX-Suchlauf (UptimeSignal, GetKnit, NousResearch-Issue).

**Nächste Session**: Code-Session 31 — DOMPurify-Sanitizer für
übernommene KI-Outputs (Track B Security: bevor ein Mock/Live-
Text in den Public-Site-Block wandert, sanitizen).

---

## Code-Session 31 – KI-Output-Sanitizer (Track B Security)
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Defense-in-Depth gegen Prompt-Injection-XSS. Jeder
KI-Output (Mock direkt im Browser, Live über die API-Route)
durchläuft `sanitizeAIOutput` bevor er ans UI geht. Strippt
HTML-Tags, dekodiert Entities zuerst (klassischer Filter-Bypass
wird so erwischt), entfernt Control-Chars, behält legitime
Sonderzeichen (`<` im Fließtext, Umlaute, Emojis, Anführungszeichen,
Zeilenumbrüche). Echtes Risiko ist real: CVE-2026-25802 zeigt
Prompt-Injection → Stored XSS in einem LLM-Gateway.

**Designentscheidung — bewusst kein DOMPurify (yet)**:
`isomorphic-dompurify` zieht `jsdom` (~120 KB) ins Server-Bundle.
Lohnt sich, sobald wir einen **HTML-Whitelist-Modus** brauchen
(Markdown-Renderer, Reicher-Text-Editor). Bis dahin reicht ein
zero-dep Plain-Text-Stripper. Stub `sanitizeAIOutputAsHtml` wirft
explizit, damit niemand versehentlich unsicheres HTML durchlässt.

**Dateien**:
- ✚ `src/core/ai/sanitize.ts` (≈ 130 Zeilen): `sanitizeText` mit
  Entity-Decode + iterativem Tag-Strip + Control-Char-Removal,
  `sanitizeAIOutput<T>` rekursiv über Strings/Arrays/Objects (Numbers/
  Booleans/null bleiben), `sanitizeAIOutputAsHtml`-Stub für Track-B-
  Folgesession.
- 🔄 `/api/ai/generate`: Output **vor** Cost-Estimation und Response
  durch `sanitizeAIOutput`. Cost-Token-Count basiert dann auf dem
  ausgelieferten (sanitized) Text — konsistent.
- 🔄 `ai-playground.tsx`: auch der Mock-Direktaufruf-Pfad sanitiziert.
  Defense-in-Depth, falls Mock-Skripte später durch echte KI-Fixtures
  ersetzt werden.
- ✚ `src/tests/ai-sanitize.test.ts` (29 Asserts): Plain-Text bleibt,
  Script/IMG/A-Tags raus, Entity-Bypasses (`&lt;`, dezimal `&#60;`,
  hex `&#x3C;`) erwischt, Nested-Tag-Bypass (`<<script>script>...`)
  durch Iterativ-Strip neutralisiert, Sonderzeichen wie `<` mit
  Space, `&`, Anführungszeichen, Umlaute, Emojis, Zeilenumbrüche
  bleiben, Control-Chars gestrippt (außer `\t\n\r`), rekursive
  Anwendung auf Output-Strukturen, Stub wirft.

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅, alle 9 Smoketests ✅ (Mock ~380, Resolver 22, OpenAI 14,
Anthropic 14, Gemini 12, Themes inkl. Hex, Cost 24, Health 18,
**Sanitize 29 NEU**).

**Roadmap**: 1 Item abgehakt (DOMPurify-Sanitizer Plain-Text), 3
Folge-Items in Track B: HTML-Whitelist-Pfad mit `isomorphic-dompurify`,
Property-based Test-Suite mit `fast-check`, Strict-CSP-Header via
Nonce bei SSR-Auslieferung.

**Quellen**: `RESEARCH_INDEX.md` Track B (Security) — neu:
- [DOMPurify (cure53)](https://github.com/cure53/DOMPurify)
- [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify)
- [CVE-2026-25802 — Prompt Injection to Stored XSS](https://cvereports.com/reports/CVE-2026-25802)
- [Focused.io — LLM Output Sanitization (OWASP LLM05)](https://focused.io/lab/improper-ai-output-handling---owasp-llm05)

**Nächste Session**: Code-Session 32 — DSGVO-Lead-Einwilligungs-
Block im Public-Site-Lead-Form (Pflicht-Checkbox „Datenschutz
gelesen", Verlinkung auf `/datenschutz`, Speicherdauer-Hinweis
beim Submit). Vorbedingung für ersten echten Betrieb live.

---

## Code-Session 32 – DSGVO-Lead-Einwilligungs-Block + Datenschutz/Impressum
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Lead-Form bekommt Pflicht-Checkbox mit aktivem Opt-In, Link
auf Datenschutzerklärung + Impressum, Speicherdauer-Hinweis. Schema-
seitig ist `consent: { givenAt, policyVersion }` jetzt Pflichtfeld
auf jedem Lead — Audit-Trail nach DSGVO Art. 7 Abs. 1.
Datenschutzerklärung und Impressum kommen pro Demo-Betrieb mit
Standard-Sektionen und Business-Daten-Substitution. **Letzte
Vorbedingung für ersten echten Betrieb live ist damit erfüllt.**

**Dateien**:
- ✚ `src/core/legal.ts` — `PRIVACY_POLICY_VERSION`,
  `LEAD_RETENTION_MONTHS` (12), `buildConsent()`-Helper.
- 🔄 `src/core/validation/lead.schema.ts` — `LeadConsentSchema`,
  `consent` als Pflichtfeld.
- 🔄 `src/data/mock-leads.ts` — Factory backfilled `consent` auf
  `createdAt` + aktuelle Policy-Version (alle 25 Demo-Leads).
- 🔄 `src/lib/mock-store/leads-overrides.ts` — Storage-Version
  v1 → v2 (alte Einträge ohne consent werden sauber verworfen).
- 🔄 `src/components/public-site/public-lead-form.tsx` —
  `consentChecked`-State, aktives Opt-In (kein pre-checked!),
  separate Fehlerzeile, Submit `disabled={!consentChecked}`.
- ✚ `src/app/site/[slug]/datenschutz/page.tsx` — 7 Standard-
  Sektionen, Business-Substitution, MVP-Hinweis.
- ✚ `src/app/site/[slug]/impressum/page.tsx` — Anbieter, Kontakt,
  Verantwortliche, ODR-Verweis.
- ✚ `src/tests/lead-consent.test.ts` (60 Asserts).
- 🔄 `src/tests/leads-system.test.ts` + `schema-validation.test.ts`
  — Probe-Lead bekommt consent-Feld.
- 🔄 `docs/CODEX_BACKLOG.md` +1 Item: `industry-presets.test.ts`
  bereits vor Session 32 rot (Eintrag #11, Codex-Sweep).

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **18 von 19 Smoketests grün** (industry-presets pre-existing
red, Codex #11).

**Roadmap**: 1 Item abgehakt, 5 Folge-Items in Track G/B
(Settings-Editor mit Legal-Sektion, Datenschutzerklärung-Editor
mit Versions-Bump, AVV-Vorlage für Reseller-Fall,
Lead-Retention-Cron, Widerrufs-Handler-Endpoint).

**Quellen**: `RESEARCH_INDEX.md` Track D — DSGVO/EuGH-Referenzen.

**Nächste Session**: Code-Session 33 — Cookie/JWT-Auth statt
Bearer-Token-Stub (Track G). Aktuell hängt der Auth-State im
localStorage als simpler Token; Cookies + Server-Validation sind
die nächste Ausbaustufe Richtung Multi-Tenant.

---

## Code-Session 33 – Cookie/JWT-Auth + Login/Logout/Me-Endpunkte
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Cookie-basierte Session-Auth ergänzt den Bearer-Token-Pfad.
HS256-JWT in HttpOnly-Cookie, signiert per Node `crypto`, kein
externes JWT-Lib. UI bekommt Login-Form über `<AuthCard>`. Bestehender
Bearer-Pfad bleibt für CLI/Scripting. `/api/ai/generate` und
`/api/ai/health` nutzen jetzt einen geteilten `checkAuth`-Helper.

**Dateien**:
- ✚ `src/core/ai/auth/session.ts` — `signSessionToken`,
  `verifySessionToken`, `buildSessionToken`. Pure HMAC-SHA256 +
  Base64URL via `node:crypto`. Strict-Header-Compare verhindert
  `alg=none`-Bypass. `crypto.timingSafeEqual` für die Signatur-
  Prüfung.
- ✚ `src/core/ai/auth/check.ts` — `checkAuth(req, env)` versucht
  Cookie zuerst, dann Bearer. `getAuthConfig(env)` löst die ENV-
  Defaults zentral auf (`LP_AI_PASSWORD` → `LP_AI_API_KEY`,
  `LP_AI_SESSION_SECRET` → `LP_AI_API_KEY`).
- ✚ `src/app/api/auth/login/route.ts` — POST, Passwort-Validierung,
  setzt HttpOnly-Cookie, 7 Tage TTL, `SameSite=Lax`, `Secure` in
  Production.
- ✚ `src/app/api/auth/logout/route.ts` — POST, idempotent, löscht
  Cookie via `Max-Age=0`.
- ✚ `src/app/api/auth/me/route.ts` — GET, gibt
  `{ authenticated, principal, via }` zurück. Keine sensiblen Daten.
- 🔄 `src/app/api/ai/generate/route.ts` — alter Inline-Auth-Stub
  raus, neuer `checkAuth(req)` rein.
- 🔄 `src/app/api/ai/health/route.ts` — gleiche Refaktorierung.
- ✚ `src/components/dashboard/ai-playground/auth-card.tsx` —
  Client-Side Login-/Logout-Form. Status-Polling bei Mount via
  `/api/auth/me`. Saubere Fallback-Texte für Static-Build (404)
  und nicht-konfigurierte ENV (503).
- 🔄 `src/components/dashboard/ai-playground/ai-playground.tsx` —
  `<AuthCard>` an erster Stelle. Live-Provider-Calls senden
  Cookie automatisch via `credentials: "same-origin"`; Bearer-
  Token-Input bleibt für CLI/Power-User.
- ✚ `src/tests/auth-session.test.ts` (35 Asserts): Token-Format
  (3 Base64URL-Teile), Verify mit korrektem/falschem Secret,
  Tampered-Signature, alg=none-Header-Bypass-Versuch,
  Expired-Token, Garbage-Inputs, leeres Secret wirft, Cookie-Pfad
  in checkAuth, Bearer-Pfad, ohne ENV → 503.

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **5 API-Routen** im SSR-Build sichtbar (`/api/ai/generate`,
`/api/ai/health`, `/api/auth/{login,logout,me}`). **19/19
Smoketests grün** (industry-presets pre-existing red bleibt
Codex-#11).

**Roadmap**: 1 großes Item abgehakt (Cookie/JWT-Auth), 4
Folge-Items: Edge-Runtime-Migration (Web Crypto statt Node),
Vercel-SSR-Deploy als zweite Pipeline, Multi-Tenant-Auth (echte
User-Accounts), CSRF-Schutz (Origin-Header-Check / Double-Submit-
Token).

**Quellen**: `RESEARCH_INDEX.md` Track D — Cookie/JWT-Patterns
2026.

**Nächste Session**: Code-Session 34 — Vercel-SSR-Deploy-Pipeline.
Damit kommen die API-Routen tatsächlich live (GitHub Pages bleibt
für die Static-Seiten). Dann erst kann der Auftraggeber Cookie-
Auth + Live-Provider produktiv testen.

---

## Code-Session 34 – Vercel-SSR-Deploy-Pipeline (Infrastructure-as-Code)
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Zwei-Pipeline-Architektur ist scharf. GitHub Pages liefert
weiter den statischen Showcase, Vercel kommt als zweite Pipeline für
SSR + alle API-Routen (Auth, AI-Generate, Health). Beide Pipelines
bauen aus demselben Code; Weiche ist `STATIC_EXPORT=true`. Vercel
auto-detect übernimmt den Rest, ein expliziter `vercel.json`
verankert Region (Frankfurt) + API-Cache-Header reproduzierbar.

**Hinweis**: ich kann nicht selbst auf Vercel deployen — die
`vercel link` + `vercel env add` + `vercel --prod`-Schritte muss
der Auftraggeber einmal manuell ausführen. Komplette Anleitung
steht in [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md).

**Dateien**:
- ✚ `vercel.json` — explizit `framework: "nextjs"`, `regions: ["fra1"]`
  (DACH-Markt), `buildCommand: "npm run build"` (KEIN
  `STATIC_EXPORT`), `outputDirectory: ".next"`, plus Cache-Control-
  Header für `/api/:path*`.
- ✚ `.env.production.example` — Vorlage aller benötigten ENV-
  Variablen mit Beschreibung. **Niemals echte Werte hier reinschreiben**,
  nur als Liste für `vercel env add`.
- 🔄 `docs/DEPLOYMENT.md` — komplett neu strukturiert: Teil A
  Pages-Setup (bestehend), Teil B Vercel-Setup (neu), Vergleichs-
  Tabelle „was sieht man wo", Smoke-Test-curl-Befehle, Roll-back-
  Anleitung, Stolperfallen-Sektion auf 7 Einträge erweitert.
- 🔄 `README.md` — Live-Preview-Sektion auf Dual-Pipeline aktualisiert,
  Vergleichs-Tabelle übernommen.
- ✚ `src/tests/deployment-config.test.ts` (~25 Asserts): vercel.json
  parst und hat richtige Werte (framework, region, buildCommand,
  api-Header), `.env.production.example` listet alle Pflicht-Vars
  und enthält keine echten Secrets, GitHub-Pages-Workflow setzt
  `STATIC_EXPORT=true` und triggert auf `main` + `claude/**`,
  `package.json`-Skripte sind konsistent, `next.config.mjs` hat
  den `pageExtensions`-Filter.

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **20/20 Smoketests grün** (industry-presets pre-existing red,
Codex #11). Bundle: shared 102 KB unverändert.

**Roadmap**: 1 Item abgehakt (Vercel-SSR-Deploy), 3 Folge-Items:
Edge-Runtime-Migration (Web Crypto statt `node:crypto`),
Custom-Domain auf Vercel, Vercel-Logs-Adapter zu Sentry/Logflare.

**Quellen**: `RESEARCH_INDEX.md` Track D — Vercel-Deployment-2026.

**Manueller Schritt für den Auftraggeber** (einmalig, ≈ 5 min):
1. `npm i -g vercel`
2. `vercel link` im Repo-Root
3. `vercel env add LP_AI_API_KEY production`
4. `vercel env add LP_AI_PASSWORD production`
5. `vercel env add LP_AI_SESSION_SECRET production` (32-Byte-Random,
   Generator-Befehl im DEPLOYMENT.md)
6. Optional Provider-Keys (`OPENAI_API_KEY`, …)
7. `vercel --prod`

Danach läuft jeder Push auf `main` automatisch nach Production,
jeder andere Branch erzeugt eine Preview-URL.

**Nächste Session**: Code-Session 35 — **Backend-Sprint-Auftakt**:
erste Supabase-Anbindung (read-only, sodass der API-Health-
Endpunkt einen `database`-Status anzeigen kann). Vorbedingung für
Multi-Tenant-Auth mit echten User-Accounts.

---

## Code-Session 35 – Supabase-Skeleton + Database-Health (Backend-Auftakt)
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Meilenstein 4 (Backend & Daten) ist eröffnet. Erste
ENV-gegate Supabase-Anbindung steht, ohne Crash-Risiko: ohne
`SUPABASE_URL` / `SUPABASE_ANON_KEY` läuft die App weiter komplett
im Mock-/localStorage-Modus. Health-Endpunkt liefert jetzt einen
`database`-Block mit Status `ok` / `degraded` / `offline`,
Latenz und sicherem `reason`-Text. Dashboard-Card zeigt einen
neuen Database-Badge unter den Provider-Karten.

**Dateien**:
- ✚ `src/core/database/client.ts` — `getSupabaseClient(env)`,
  `readSupabaseEnv`, `isSupabaseConfigured`. Cache mit Reset-Helper
  für Smoketests. Ohne ENV → `null` zurück, App läuft weiter.
- ✚ `src/core/database/health.ts` — `checkDatabaseHealth(env, opts)`,
  AbortController-Timeout (Default 2 s), Threshold-Mapping
  (>1.5 s → `degraded`). Roh-`fetch` auf `/rest/v1/` statt SDK-Call,
  damit der Check tabellenunabhängig bleibt.
- 🔄 `src/app/api/ai/health/route.ts` — `Promise.all` mit
  `checkDatabaseHealth`, Database-Block hängt am bestehenden
  HealthSnapshot.
- 🔄 `src/components/dashboard/ai-playground/health-card.tsx` —
  `<DatabaseBadge>` mit Icon-Mapping (CheckCircle/AlertTriangle/
  Database) und Latenz-Anzeige. Fallback-Text „noch nicht
  konfiguriert" für Mock-only Setups.
- 🔄 `.env.production.example` — `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (für Multi-Tenant-Auth in 36+).
- 🔄 `docs/DEPLOYMENT.md` — Vercel-ENV-Block ergänzt; neuer
  Stolperfall-Eintrag „Free-Tier-Auto-Pause".
- 🔄 `package.json` — `@supabase/supabase-js@^2`.
- ✚ `src/tests/database-health.test.ts` (~30 Asserts):
  ENV-Reader-Trim, ohne ENV → offline, 200 → ok, 401 (RLS) → ok,
  503 → degraded, slow → degraded, AbortError → offline,
  Netzwerk-Fehler → degraded, Privacy-Smoketest (Key + URL nicht
  im Dump), Header/URL-Capture.

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **21/22 Smoketests grün** (industry-presets pre-existing red,
Codex #11). Bundle: shared 102 KB unverändert.

**Roadmap**: Meilenstein 4 von „⏳ geplant" auf „🔄 in Arbeit"
gehoben (Session-Cluster 35–40 skizziert). 3 neue Folge-Items:
Database-Health-Erweiterung (Tabellen-Check, Cache-Layer,
Auto-Pause-Detection), Stale-`comingInSession`-Audit
(Bronze-Locks vs. echte Coming-Soon), Owner-Daten via ENV
(neuer Codex-Item, siehe Backlog #12).

**Quellen**: `RESEARCH_INDEX.md` Track D — Supabase-Health-Patterns
2026.

**state-refresh-light** (Session 35 % 5 = 0):
- Smoketest-Regression: 21/22 grün, industry-presets bleibt
  Codex-#11.
- Stale-Stub-Audit: 3 Treffer (`services/page.tsx:43`,
  `leads/page.tsx:43`, `settings/page.tsx:31`). Erstere zwei
  sind Bronze-Lock-UX-Drift (kein „Coming Soon", sondern
  Tier-Lock — als neues Plan-Item dokumentiert). Settings ist
  echt offen (Backend-Schema fehlt) — Label bleibt korrekt.
- README-Provider-Matrix: keine Änderung nötig (keine neue
  Live-Methode in Session 35, nur Database-Layer).
- Codex-Backlog: nur #11 needs-review aktiv, kein Codex-Done
  seit letztem Pass.

**Hinweis Auftraggeber**: persönliche Stammdaten (Name, Adresse,
Telefon) werden bewusst **nicht** ins Repo committet. Stattdessen
plane ich Code-Session 36 als „Impressum auf ENV-Variablen
umstellen" (`LP_OWNER_NAME`, `LP_OWNER_ADDRESS`, …) — dann nur in
Vercel/lokal setzen, niemals in GitHub.

**Nächste Session**: Code-Session 36 — **Owner-Daten via ENV +
erstes Supabase-Schema**: Impressum/Datenschutz aus
ENV-Variablen, parallel `businesses`-Tabelle in Supabase
(read-only, Mock-Spiegelung). Ab da kann der Auftraggeber seine
echten Stammdaten nutzen, ohne sie in den Quellcode einzuchecken.

---

## Code-Session 36 – Plattform-Impressum + Datenschutz aus `LP_OWNER_*`-ENV
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Auftraggeber-Stammdaten (Name, Adresse, Telefon, E-Mail,
USt-IdNr.) landen ab jetzt **niemals** im Repo. Ihre Quelle ist
ausschließlich die `LP_OWNER_*`-ENV-Map auf Vercel/lokal. Solange
die Pflichtfelder nicht gesetzt sind, läuft die Plattform im
sichtbaren Demo-Mode (gelber Hinweis-Block, klare Setup-Anweisung).
Neue Routen `/impressum` + `/datenschutz` für die LocalPilot-AI-
Plattform selbst (Demo-Betriebs-Versionen unter `/site/<slug>/...`
bleiben unverändert mit Mock-Daten).

**Dateien**:
- 🔄 `src/core/legal.ts` — `getOwnerInfo(env)`, `OwnerInfo`-
  Interface, `PLATFORM_NAME`-Konstante. Pflichtfelder NAME +
  STREET + POSTAL_CODE + CITY + EMAIL → `configured=true`,
  sonst Demo-Owner-Fallback. ENV-Reader trimmt Whitespace
  (whitespace-only zählt als leer).
- ✚ `src/app/impressum/page.tsx` — Plattform-Impressum nach
  § 5 DDG (TMG abgelöst zum 14.05.2024) + § 18 MStV. Sektionen:
  Anbieter, Kontakt, USt-IdNr. (optional), Verantwortlich für
  Inhalt, Haftung, Online-Streitbeilegung. Demo-Notice mit
  ENV-Var-Liste + Hinweis auf `.env.production.example`.
- ✚ `src/app/datenschutz/page.tsx` — Plattform-Datenschutz mit
  7 Standard-Sektionen (Verantwortlicher, Datenarten, Zweck +
  Rechtsgrundlage, Speicherdauer, Empfänger inkl. Vercel-DPA,
  Betroffenenrechte, Cookies). Verlinkt `/impressum`.
- 🔄 `src/components/layout/site-footer.tsx` — `<a href="#impressum">`
  Anchors raus, echte `<Link href="/impressum">` rein.
  `#kontakt` bleibt als TODO (siehe PROGRAM_PLAN).
- 🔄 `.env.production.example` — neuer `LP_OWNER_*`-Block mit
  Pflicht/Optional-Markierung, Default-Country „Deutschland".
- 🔄 `docs/DEPLOYMENT.md` — Vercel-`env-add`-Block ergänzt + neuer
  Stolperfall „Anbieter noch nicht konfiguriert trotz Production".
- ✚ `src/tests/owner-info.test.ts` (~25 Asserts):
  empty-ENV → Demo, Pflichtfeld-fehlt → Demo, voll konfiguriert
  → Daten kommen durch, Country-Override, Whitespace-Trim,
  optionale Felder fehlen sauber im Output (nicht als `undefined`-
  Key), Privacy-Smoketest (NAME-Probe leakt nicht in Demo).

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **22/23 Smoketests grün** (industry-presets pre-existing red,
Codex #11). Neue Static-Routes: `/impressum`, `/datenschutz`
(je 170 B page-bundle, 106 KB shared). Bundle-Total stabil.

**Roadmap**: 1 großes Item abgehakt (Owner-ENV-Pfad), 2 Folge-
Items angelegt: Impressum-Editor im Dashboard für Multi-Tenant
(Reseller-Szenario), Footer-`#kontakt`-Verifikation
(Sektion bauen oder Anchor weg).

**Quellen**: `RESEARCH_INDEX.md` Track D — § 5 DDG / Impressum-
Pflichtangaben.

**Hinweis Auftraggeber**: deine Stammdaten aus dem letzten Chat
sind **NICHT** im Code committet. Setze sie bitte in deiner Vercel-
Production-ENV als `LP_OWNER_NAME` / `LP_OWNER_STREET` /
`LP_OWNER_POSTAL_CODE` / `LP_OWNER_CITY` / `LP_OWNER_EMAIL`
(+ optional `LP_OWNER_PHONE`, `LP_OWNER_TAX_ID`). Lokal genauso
in einer `.env.local` (die ist in `.gitignore`).

**Nächste Session**: Code-Session 37 — **Erstes Supabase-Schema**
(`businesses`-Tabelle als read-only Spiegel der Mocks +
Repository-Layer). Damit zeigt `database.status` „ok" mit
echten Tabellen-Calls statt nur REST-Root-Ping.

---

## Code-Session 37 – Erstes Supabase-Schema + Repository-Layer
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Erstes konkretes Tabellen-Schema (`businesses`, hybrid:
Top-Level-Spalten + JSONB für geschachtelte Strukturen). RLS aktiv,
Public-Read auf veröffentlichte Betriebe, Schreib-Policies
explizit blockiert (kommen mit Auth in Session 40). Repository-
Layer abstrahiert Mock vs. Supabase über ein schmales Interface
(`findBySlug`, `listSlugs`, `listAll`); Resolver schaltet via
`LP_DATA_SOURCE`-ENV. Database-Health pingt jetzt die
`businesses`-Tabelle, wenn der Repo-Pfad auf Supabase steht — 404
liefert eine klare „Migration fehlt"-Meldung statt nebulös
„degraded".

**Dateien**:
- ✚ `supabase/migrations/0001_businesses.sql` — Tabelle, 3 Indizes,
  `updated_at`-Trigger, RLS aktiv, Public-Read-Policy.
- ✚ `docs/SUPABASE_SCHEMA.md` — Schema-Referenz, Migrations-
  Workflow, Roadmap (0002–0007).
- ✚ `src/core/database/repositories/business.ts` — `BusinessRepository`-
  Interface, Mock-Impl (`createMockBusinessRepository`), Supabase-
  Impl (`createSupabaseBusinessRepository`) mit Row→Schema-Mapping
  und `BusinessSchema.parse` als Bollwerk gegen Schema-Drift.
- ✚ `src/core/database/repositories/index.ts` — `resolveDataSource`,
  `getBusinessRepository` mit Soft-Fallback (supabase + leere
  ENV → mock + stderr-Hinweis, kein Crash).
- 🔄 `src/core/database/health.ts` — neue Option `probe:
  "rest-root" | "businesses-table"`, eigene URL- und Header-
  Mappings, 404-Sonderfall mit Migrations-Hinweis.
- 🔄 `src/app/api/ai/health/route.ts` — wählt automatisch den
  schärferen Probe, wenn `LP_DATA_SOURCE=supabase`.
- 🔄 `.env.production.example` — `LP_DATA_SOURCE=mock` (Default-
  Switch) ergänzt.
- ✚ `src/tests/business-repository.test.ts` (~30 Asserts):
  Mock-Roundtrip (findBySlug, listSlugs, listAll, missing-slug),
  Resolver-Switch (mock / supabase / soft-fallback mit
  stderr-Capture), Health-Probe-businesses-table (200/401/404/
  Default-rest-root).

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **23/24 Smoketests grün** (industry-presets pre-existing red,
Codex #11). Bundle: shared 102 KB unverändert.

**Roadmap**: 1 Item abgehakt (Database-Health-Erweiterung), 2
neue Folge-Items (Datenquellen-Badge im Dashboard, Seed-Skript
für Demo-Daten). Session-Cluster im Meilenstein 4 von 35–40 auf
35–41+ präzisiert.

**Quellen**: `RESEARCH_INDEX.md` Track D — Supabase Multi-Tenant-
Schema + RLS.

**Manueller Schritt für den Auftraggeber** (sobald gewünscht):
1. Supabase-Projekt anlegen, URL + anon-Key in Vercel-ENV
   (`vercel env add SUPABASE_URL production` etc.).
2. Migration einspielen: Dashboard → SQL Editor → Inhalt von
   `supabase/migrations/0001_businesses.sql` einfügen → Run.
3. (Optional) `LP_DATA_SOURCE=supabase` setzen → ab dann liest
   die Public-Site aus Supabase. Solange die Tabelle leer ist,
   zeigt `/demo` eine leere Liste — Seed kommt in einer der
   nächsten Sessions.

Solange diese Schritte nicht ausgeführt sind, bleibt alles wie
vorher: Mock-Daten, kein Crash, `LP_DATA_SOURCE` defaultet auf
`mock`.

**Nächste Session**: Code-Session 38 — **Services + Reviews-
Migrationen** (0002 + 0003) und Repository-Erweiterung. Public-
Site bekommt damit alles, was sie für eine Vollanzeige braucht,
optional aus DB.

---

## Code-Session 38 – services + reviews-Migrationen + FK-Embed
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Zwei weitere Tabellen (`services`, `reviews`) als FK-
Children von `businesses`. Cascade-Delete, je eigene RLS-Policies
mit `exists`-Sub-Query auf `businesses.is_published`. Repository
lädt jetzt Stammdaten + Services + Reviews in **einem einzigen
HTTP-Roundtrip** über PostgREST-Embedding (`select=*, services(*),
reviews(*)`). Filter (inaktive Services, unveröffentlichte Reviews)
wird sowohl SQL-seitig (RLS) als auch im TS-Mapper als
Defense-in-Depth angewendet.

**Drift-Befund**: Code-Session 37 hatte das `package_tier`-CHECK in
englischer Form (`silver/platinum`), das Zod-Enum nutzt aber
deutsche Begriffe (`silber/platin`). Mit Migration 0001-Fix
korrigiert; neuer Plan-Item für Schema↔Migration-Drift-Test.

**Dateien**:
- ✚ `supabase/migrations/0002_services.sql` — Tabelle, FK auf
  businesses(id) cascade, 3 Indizes (incl. partial-active und
  partial-featured), updated_at-Trigger, RLS-Policy mit
  `exists`-Sub-Query auf `is_published`.
- ✚ `supabase/migrations/0003_reviews.sql` — Tabelle, FK cascade,
  CHECK-Constraints (`rating 1..5`, `source in 'google','facebook',
  'internal'`), 2 Indizes (1 Partial), Trigger, RLS analog.
- 🔄 `supabase/migrations/0001_businesses.sql` — Drift-Fix:
  `package_tier`-CHECK auf deutsche Werte korrigiert
  (`'bronze','silber','gold','platin'`).
- 🔄 `src/core/database/repositories/business.ts` — `BUSINESS_FULL_SELECT`
  mit Embed `services(*), reviews(*)`. Neue Mapper `rowToService`
  + `rowToReview`. `rowToBusiness` filtert `is_active=false` /
  `is_published=false` defensiv und sortiert Services nach
  `sort_order`. Test-Helper `__TEST_ONLY_rowToBusiness__` exportiert.
- 🔄 `docs/SUPABASE_SCHEMA.md` — neue Sektionen 0002 + 0003,
  Embedding-Pattern beschrieben, Roadmap auf 0004+.
- 🔄 `src/tests/business-repository.test.ts` (~40 Asserts statt
  ~30): neuer Block „Row→Business-Mapping inkl. Embeds":
  3 Services (1 inaktiv → wird gefiltert), 2 Reviews (1
  unveröffentlicht → wird gefiltert), Sort-Order-Verhalten,
  leere Embeds (RLS-blockiert) → leere Arrays.

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **23/24 Smoketests grün** (industry-presets pre-existing red,
Codex #11). Bundle: shared 102 KB unverändert.

**Roadmap**: 1 Item abgehakt (services + reviews-Schema),
2 neue Items: erweitertes Seed-Skript (alle 3 Tabellen),
Schema↔Migration-Drift-Test (Property-based gegen TS-Enum).

**Quellen**: `RESEARCH_INDEX.md` Track D — Supabase FK-Embedding /
nested select.

**Manueller Schritt**: Migration 0002 + 0003 im Supabase-SQL-Editor
ausführen (nach 0001). Idempotent — wiederholtes Ausführen tut
nichts Schlimmes.

**Nächste Session**: Code-Session 39 — **faqs + leads-Migrationen**
(0004 + 0005) inkl. `consents`-Audit-Trail aus Code-Session 32.
Damit ist das Schema komplett für die Public-Site-Vollanzeige.

---

## Code-Session 39 – faqs + leads-Migrationen (DSGVO-Consent-Audit)
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Letzte zwei Tabellen für die Public-Site-Vollanzeige.
`faqs` ist die direkte Schwester von `services`/`reviews` (read-only,
public-on-published). `leads` hat **asymmetrische RLS**: anon darf
INSERTen (für das Public-Form), aber nicht SELECTen — sonst könnte
ein bösartiges Form-Skript fremde Anfragen abgreifen. DSGVO-Audit-
Trail ist als `consent jsonb not null` mit CHECK-Constraint
(`consent ? 'givenAt' AND consent ? 'policyVersion'`) verankert.
FAQ-Embed im Repository.

**Dateien**:
- ✚ `supabase/migrations/0004_faqs.sql` — Tabelle, FK cascade,
  2 Indizes (1 Partial), Trigger, RLS-Policy analog zu services.
- ✚ `supabase/migrations/0005_leads.sql` — asymmetrische RLS:
  INSERT-Policy für anon mit Pflicht-Consent + published-Betrieb-
  Check, SELECT-Policy nur authenticated. Constraints:
  `phone OR email`, `source` enum-CHECK (8 Werte), `status`
  enum-CHECK (6 Werte), `consent ? 'givenAt' AND ? 'policyVersion'`.
  FK auf `services(id)` mit `on delete set null` für
  `requested_service_id`.
- 🔄 `src/core/database/repositories/business.ts` — `BUSINESS_FULL_SELECT`
  um `, faqs(*)` ergänzt; neue `FaqRow` + `rowToFaq`-Mapper;
  Filter `is_active=false` + Sort nach `sort_order`.
- 🔄 `docs/SUPABASE_SCHEMA.md` — Sektionen 0004 + 0005, RLS-Tabelle
  für leads (Operation × Rolle), DSGVO-Pflichtform erklärt;
  Roadmap auf 0006 + 0006a.
- 🔄 `src/tests/business-repository.test.ts` (~45 Asserts statt
  ~40): FAQ-Block (3 FAQs, 1 inaktiv → gefiltert, Sort-Order,
  optionale category, leeres Embed → []).

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **23/24 Smoketests grün** (industry-presets pre-existing red,
Codex #11). Bundle: shared 102 KB unverändert.

**Roadmap**: 1 Item abgehakt (Schema-Komplettierung Public-Site),
Session 40 jetzt klarer geplant: `business_owners` + Magic-Link-
Auth + Lead-Repository mit Insert-Pfad fürs Public-Form.

**Quellen**: `RESEARCH_INDEX.md` Track D — DSGVO Consent-Audit-Trail
in Postgres.

**Manueller Schritt**: Migrationen 0004 + 0005 im Supabase-SQL-
Editor nach 0001–0003 ausführen. Idempotent.

**Nächste Session**: Code-Session 40 — **`business_owners`-Tabelle
+ Magic-Link-Auth** (Migration 0006) + **Lead-Repository mit
Insert-Pfad** (Mock + Supabase). Damit kann das Public-Form
optional in Supabase schreiben, und Multi-Tenant-Auth fängt an.

---

## Code-Session 40 – Lead-Repository mit Insert-Pfad
2026-04-27 · `claude/setup-localpilot-foundation-xx0GE` · Feature

**Was**: Server-/Edge-tauglicher Schreibe-Pfad für das Public-
Form. RLS-Falle aus Migration 0005 (anon darf nicht lesen) wird
elegant umgangen: ID + Timestamps **client-side** generieren,
INSERT **ohne** `.select()`-Chain ausführen, das selbst gebaute
Lead-Objekt zurückgeben — inhaltsidentisch zur DB-Zeile.

Magic-Link-Auth + `business_owners` waren ursprünglich für
Session 40 geplant, sind aber zu groß für eine atomare Session
und wandern auf Session 41 (eigener Auth-Sprint).

**Dateien**:
- ✚ `src/core/database/repositories/lead.ts` — `LeadRepository`-
  Interface (`create(input): Lead`), `NewLeadInput`-Typ,
  `LeadRepositoryError` mit 5 Kinds
  (validation/rls/constraint/network/unknown), Mapper für
  Postgres-SQLSTATE-Codes 23502/23503/23505/23514/42501 +
  PostgREST PGRST116/PGRST301. Mock-Impl (in-memory bucket)
  + Supabase-Impl. Test-Helper exportiert.
- 🔄 `src/core/database/repositories/index.ts` — neuer
  `getLeadRepository(env)`-Resolver, symmetrisch zum
  Business-Resolver, mit Soft-Fallback bei halb-konfigurierter
  ENV.
- 🔄 `docs/SUPABASE_SCHEMA.md` — Lead-Repository-Sektion mit
  RLS-Falle erklärt, Error-Mapping-Tabelle.
- ✚ `src/tests/lead-repository.test.ts` (~30 Asserts):
  buildLeadFromInput-Defaults, Validation-Errors (kein
  phone/email, zu kurzer Name), Mock-Repo-Roundtrip, alle 5
  SQLSTATE-Codes → kind, Privacy-Smoketest.

**Verifikation**: typecheck ✅, lint ✅, build:static ✅, build (SSR)
✅. **24/25 Smoketests grün** (industry-presets pre-existing red,
Codex #11). Bundle: shared 102 KB unverändert.

**Roadmap**: 1 Item abgehakt (Lead-Repo + Insert), Session 41
neu fokussiert (nur business_owners + Magic-Link, atomar). 2
neue Plan-Items: Public-Lead-Form auf LeadRepository umstellen,
Dependency-Sweep-Session (Major-Bumps).

**Quellen**: `RESEARCH_INDEX.md` Track D — Supabase Insert +
RLS-Falle.

**state-refresh-light** (Session 40 ist 5er-Multiple, gleichzeitig
20er-Boundary → Deep-Pass-Notiz):
- Smoketest-Regression: 24/25 grün, industry-presets bleibt
  Codex-#11.
- Stale-Stub-Audit: 3 Treffer (services/leads/settings) —
  bekannt aus Session 35, Codex-#12 sammelt das.
- Codex-Backlog: 2 needs-review aktiv, kein Codex-Done seit
  letztem Pass.
- Bundle: 102 KB shared stabil.
- **Deep-Pass `npm outdated`**: 17 Pakete mit Major-Updates
  verfügbar (next 16, react 19.2, zod 4, tailwind 4, ts 6,
  eslint 10, anthropic 0.91, openai 6, lucide 1.11, …). Nichts
  Sicherheitskritisches. Eigene Sweep-Session lohnt — als
  neues Plan-Item dokumentiert.

**Nächste Session**: Code-Session 41 — **`business_owners`-Tabelle
+ Magic-Link-Auth via `@supabase/ssr`** (Migration 0006). Erste
echte Multi-Tenant-Bindung; danach kann das Dashboard pro
User die eigenen Leads sehen.

