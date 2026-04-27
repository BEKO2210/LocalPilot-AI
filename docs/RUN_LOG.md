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

**Session 7 – Public Site Generator.**

Route `/site/[slug]/page.tsx` mit
`generateStaticParams(listMockBusinessSlugs())`. Sektionen: Header, Hero,
Services, Benefits, Process, Reviews, FAQ, Contact, OpeningHours, Footer
+ Mobile-CTA-Bar. Inhalte aus `Business`-Aggregat +
`getPresetOrFallback()`, Theme via `<ThemeProvider>`. Auf GitHub Pages
werden alle 6 Slugs zur Build-Zeit prerendered.
