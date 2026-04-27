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
