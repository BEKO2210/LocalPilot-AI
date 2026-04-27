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
