# Changelog

Alle nennenswerten Änderungen am Projekt werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung an [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- Session 4+: Branchen-Presets, Themes, Mock-Daten, Public Site Generator, Dashboard, KI-Provider, Bewertungs-Booster, Social-Media-Generator, Supabase-Vorbereitung, Polish, Deployment.

## [0.3.0] – Session 3 – 2026-04-27

### Added
- `src/core/pricing/pricing-tiers.ts` mit konkreten `BRONZE_TIER`,
  `SILBER_TIER`, `GOLD_TIER`-Datensätzen. Jeder Datensatz wird beim
  Module-Load via `PricingTierSchema.parse(...)` validiert – Tippfehler in
  Features oder Limits brechen sofort den Build.
- Vererbungslogik Bronze ⊂ Silber ⊂ Gold (Silber erbt alle Bronze-Features,
  Gold erbt alle Silber-Features).
- Konkrete Feature-Limits pro Stufe (`maxServices`, `maxLandingPages`,
  `maxLanguages`, `maxLocations`, `maxThemes`, `maxAiGenerationsPerMonth`,
  `maxLeads`); `TIER_UNLIMITED` für unbegrenzte Limits.
- `src/core/pricing/feature-labels.ts` – deutsches Klartext-Label und
  Beschreibung pro `FeatureKey`. Erzwungen vollständig über
  `Record<FeatureKey, FeatureLabel>` (Compile-Zeit-Check).
- `src/core/pricing/feature-helpers.ts` – reine Funktionen:
  `getTier`, `tryGetTier`, `getAllTiers`, `hasFeature`, `isFeatureLocked`,
  `requiredTierFor`, `getTierLimits`, `isLimitExceeded`, `compareTiers`,
  `isAtLeastTier`, `nextHigherTier`, `formatPrice`, `formatLimit`.
  Plus `UnknownTierError` für sprechende Fehler bei unbekannten Stufen.
- `src/core/pricing/index.ts` Barrel.
- Pricing-Komponenten unter `src/components/pricing/`:
  - `<PricingCard>` mit `currentTier`-Markierung ("Aktuelles Paket"-Badge),
    "Beliebt"-Badge für hervorgehobene Stufen, lokalisierte Preise via
    `Intl.NumberFormat`.
  - `<PricingGrid>` – rendert konfigurationsgesteuert alle aktiven Stufen.
  - `<FeatureLock>` – sperrt Bereiche paketabhängig
    (`variant="overlay"`/`"replace"`).
  - `<UpgradeHint>` – kompakter Inline-Hinweis "Verfügbar ab Silber/Gold".
- `marketingHighlights`-Feld in `PricingTierSchema` ergänzt – getrennt von
  technischem `features`-Array, damit Marketing-Bullets unabhängig vom
  internen Capability-Modell formuliert werden können.
- `src/tests/pricing-helpers.test.ts` – Smoketest mit ~40 Assertions
  (Vererbung, Lookup, Limits, Reihenfolge, Formatierung, Konsistenz von
  `FEATURE_LABELS`).
- `docs/PRICING.md` – vollständige Pricing-Dokumentation für Entwickler:innen
  und Vertrieb.

### Changed
- `src/components/marketing/pricing-teaser.tsx` rendert jetzt aus der
  Code-Konfiguration (`<PricingGrid>`) statt aus hartcodierten Karten.
  Marketing-Sektion bleibt visuell identisch, ist aber an die zentrale
  Pricing-Konfiguration gebunden.
- README, RUN_LOG, TECHNICAL_NOTES aktualisiert.

### Notes
- Platin-Stufe ist bewusst noch nicht modelliert; `getTier("platin")` wirft
  `UnknownTierError`. Die Marketing-Fußnote weist auf "Platin auf Anfrage"
  hin. Volle Modellierung folgt nach Session 22.
- Die Helfer sind seiteneffektfrei und in Server-/Client-Komponenten nutzbar.

## [0.2.0] – Session 2 – 2026-04-27

### Added
- Zentrales Konstanten-Modul `src/types/common.ts` mit allen String-Literal-Schlüsseln
  (`PackageTier`, `IndustryKey`, `ThemeKey`, `FeatureKey`, `LeadStatus`,
  `LeadSource`, `SocialPlatform`, `ReviewSource`, `WeekDay`, `AIProviderKey`,
  `SupportedLocale`, `SupportedCurrency` u. v. m.) – `as const`-Tupel als Single
  Source of Truth, daraus abgeleitete Typen.
- Zod-Schemas in `src/core/validation/`:
  - `common.schema.ts` – Primitive (Id, IsoDate, Slug, ColorHex, Phone, Email,
    Url, Money, OpeningHours) und Enum-Schemas.
  - `service.schema.ts`, `review.schema.ts`, `faq.schema.ts`, `lead.schema.ts`
    inkl. `LeadFormFieldSchema`.
  - `theme.schema.ts` mit `ThemeColorsSchema`, `ThemeTypographySchema`.
  - `pricing.schema.ts` mit `PricingTierSchema`, `TierLimitsSchema` und
    `TIER_UNLIMITED`-Konstante.
  - `industry.schema.ts` für vollständige `IndustryPreset`-Validierung
    (CTAs, Services, FAQs, Benefits, Process Steps, Lead-Felder, Review-
    Vorlagen, Social-Prompts, Website-Copy-Prompts, Compliance-Notes).
  - `business.schema.ts` als "fettes" Aggregat inkl. Address, Contact,
    OpeningHours, Services, Reviews, FAQs, TeamMembers.
  - `ai.schema.ts` mit Eingaben/Ausgaben für alle 7 AI-Methoden, plus
    `AIProvider`-Interface und `AIProviderError`-Klasse.
  - `index.ts` Barrel.
- Re-Export-Schicht `src/types/{business,service,lead,review,faq,industry,
  theme,pricing,ai,index}.ts` mit per `z.infer` abgeleiteten Typen, damit
  Schema und Typ nicht driften können.
- `src/data/mock-types.ts` mit `MockDatasetSchema`, `BusinessSlugIndex`,
  `LeadsByBusiness` und `validateMockDataset()` als Plan für Session 6.
- `src/tests/schema-validation.test.ts`: Compile-Zeit-Smoketest, der jedes
  Schema einmal mit realistischen Beispieldaten parst – schlägt schon bei
  `tsc --noEmit` fehl, falls Typ und Schema auseinanderlaufen.
- Dependency: `zod@3.24.1`.

### Changed
- `README.md`: Abschnitt zur Datenmodell-Architektur aktualisiert.
- `docs/RUN_LOG.md`, `docs/TECHNICAL_NOTES.md`: Stand nach Session 2 ergänzt.

### Notes
- Es gibt noch keine konkreten Inhalte: Mock-Daten kommen in Session 6,
  Branchen-Presets in Session 4, Themes in Session 5, Pricing-Konfiguration in
  Session 3. Session 2 stellt nur das Modell- und Validierungsfundament bereit.
- Strict-Mode-kompatibel: keine `any`, alle Felder typsicher,
  `noUncheckedIndexedAccess` aktiv.

## [0.1.0] – Session 1 – 2026-04-27

### Added
- Next.js 15 (App Router), TypeScript strict, Tailwind CSS, ESLint Setup.
- Root-Layout mit deutschsprachigen Metadaten und Open-Graph-Defaults.
- Globale Styles, Tailwind-Theme (Brand- und Ink-Farbpaletten, Container, Schatten, Radius).
- UI-Primitive: `Container`, `Section`, `Button`, `LinkButton`.
- Layout-Komponenten: `SiteHeader`, `SiteFooter`.
- Marketing-Landingpage (`/`) mit Sektionen Hero, Problem, Lösung, Branchen, Pakete (Teaser), Vorteile, FAQ, Kontakt-CTA.
- Ordnerstruktur für `src/app`, `src/components`, `src/core`, `src/data`, `src/lib`, `src/types`, `src/tests`, `docs/`.
- Dokumentation: `README.md`, `CHANGELOG.md`, `.env.example`, `docs/PRODUCT_STRATEGY.md`, `docs/TECHNICAL_NOTES.md`, `docs/RUN_LOG.md`.
- `.gitignore` für Next.js-Standardartefakte.

### Notes
- Pricing-Karten auf der Marketing-Seite sind aktuell statische Teaser. Die echte Produkt-Logik (Feature-Locks, `hasFeature`, Limits) folgt in Session 3.
- KI-Provider, Branchen-Presets, Themes, Mock-Daten, Dashboard und Public Sites sind in der Ordnerstruktur vorbereitet, aber bewusst noch nicht implementiert.
