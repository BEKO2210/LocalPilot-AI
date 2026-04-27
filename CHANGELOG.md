# Changelog

Alle nennenswerten Änderungen am Projekt werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung an [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- Session 9+: Dashboard-Grundstruktur, Betriebsdaten, KI-Provider, Bewertungs-Booster, Social-Media-Generator, Supabase-Vorbereitung, Polish, Deployment.

## [0.8.0] – Session 8 – 2026-04-27

### Added
- **Eigene `/pricing`-Seite** mit:
  - PricingGrid (Bronze/Silber/Gold-Karten),
  - **`<LimitsTable>`** – numerische Limits Bronze/Silber/Gold im Vergleich,
    nutzt `formatLimit()` für „unbegrenzt"-Werte,
  - **`<FeatureComparisonMatrix>`** – 31 Capabilities × 3 Tiers, gruppiert
    nach `FeatureGroup` (Website / Design / Anfragen / Bewertungen / KI /
    Social / Verwaltung). Reihen aus `FEATURE_LABELS`, Werte über
    `hasFeature()` – keine Doppelpflege, keine Drift.
  - Pricing-spezifische FAQ (Mindestlaufzeit, Upgrade/Downgrade, MwSt.,
    Kündigung, KI-Pflicht, Platin-Status),
  - Schluss-CTA mit Beratung-Mail + Demo-Link + 4-Schritte-Onboarding-Karte.
- **Live-Demo-Showcase** auf der Startseite (`<DemoShowcase>`) –
  6 Mini-Karten mit `<ThemeProvider>`-Vorschau, jede als aktiver Link
  zur Public Site.
- **`<ValueRoi>`** – 4 ROI-Karten mit Mini-„Proof-Label" (z. B. „Eingebaut:
  Bewertungs-Booster ab Bronze"), gibt jedem Nutzen einen technischen Beleg.
- **`<Testimonials>`** – Beispiel-Stimmen aus den Demo-Personas (Lena H.,
  Stefan M., Sophie L., Petra W.). Footnote macht klar: keine echten
  Kund:innen.
- **`<OnboardingPromise>`** – „In 4 Schritten startklar" mit zwei finalen
  CTAs (Pakete vergleichen / Demos ansehen).
- `docs/MARKETING.md` mit Funnel-Tabelle, Komponenten-Übersicht,
  Sprache- & Compliance-Regeln und Erweiterungs-Checkliste.

### Changed
- **Hero** zeigt jetzt zwei aktive CTAs: „Live-Demos ansehen" (primary)
  und „Pakete vergleichen" (outline) statt der bisherigen Anker-Links.
- **PricingTeaser** verlinkt unten zentral auf `/pricing` für die
  vollständige Funktions-Vergleichsliste; CTA der Karten geht ebenfalls
  nach `/pricing`.
- **IndustriesGrid**: Branchenkarten mit Demo-Preset werden zu aktiven
  Links auf die jeweilige Public Site (Friseur, Werkstatt, Reinigung,
  Kosmetik, Handwerk, Fahrschule). Restliche Karten bleiben statisch
  (Demos noch nicht hinterlegt).
- **CtaContact** ist konversionsstärker formuliert: „Sehen Sie es live
  oder schreiben Sie uns direkt" + zwei Direkt-Kontaktwege (E-Mail,
  Demo-Telefonnummer) statt der vorigen Onboarding-Liste, die jetzt in
  die eigene `<OnboardingPromise>`-Sektion gewandert ist.
- **Site-Header-Nav** vereinfacht: Lösung / Demos / Pakete / Designs /
  FAQ. Header-CTAs zeigen „Live-Demos" + „Pakete" und führen zu
  `/demo` bzw. `/pricing`.
- **Startseite** als 11-Schritt-Funnel komponiert (Hero → Problem/Lösung →
  ROI → Branchen → Demo-Showcase → Pakete-Teaser → Onboarding → Vorteile →
  Stimmen → FAQ → Schluss-CTA).

### Notes
- Build:static produziert jetzt **13 statisch prerenderte Routen**:
  `/`, `/_not-found`, `/demo`, `/pricing`, `/themes`,
  `/site/<6 slugs>`. Die neuen Sektionen sind reine Server Components,
  kein Client-JS.
- Branchenneutralität gewahrt: Pricing-Tabellen lesen `FEATURE_KEYS` /
  `FEATURE_LABELS`, kein Branchen-Hardcoding. Demo-Showcase nutzt
  vorhandene Mock-Businesses.
- Klar gekennzeichnete Demo-Inhalte: Telefon `+49 30 9000 9999`
  (Demo-Nummer), Testimonials als „Beispiel-Stimmen aus der Demo-Welt"
  ausgezeichnet.

## [0.7.0] – Session 7 – 2026-04-27

### Added
- **Public Site Generator** unter `/site/[slug]` mit
  `generateStaticParams(listMockBusinessSlugs())`. Build:static prerendered
  jetzt **alle 6 Demo-Slugs** als statische HTML-Seiten – funktioniert
  ohne Server, ideal für GitHub Pages.
- **Pro-Business `generateMetadata`**: Title, Description, OpenGraph
  und Canonical kommen aus dem Business-Datensatz (kein Branchen-Hardcoding).
- **13 Public-Site-Komponenten** unter `src/components/public-site/`:
  `<PublicSection>` (theme-aware Wrapper), `<PublicSiteHeader>`,
  `<PublicSiteFooter>`, `<PublicHero>`, `<PublicServices>`,
  `<PublicBenefits>`, `<PublicProcess>`, `<PublicReviews>`,
  `<PublicFaq>`, `<PublicTeam>`, `<PublicOpeningHours>`,
  `<PublicLocation>`, `<PublicContact>`, `<PublicMobileCtaBar>`.
- **Sticky Mobile-CTA-Bar** mit Anrufen / WhatsApp / Anfrage – jede
  Schaltfläche nur sichtbar, wenn der Betrieb die jeweiligen Daten hat.
- **`<PublicContact>` Direktkontakt** mit funktionierenden `tel:`-,
  `wa.me`- und `mailto:`-Deeplinks plus einer **Anfrageformular-Vorschau**
  aus den `preset.leadFormFields`. Felder sind aktuell `disabled` (echte
  Submission folgt in Session 12).
- **`src/lib/contact-links.ts`**: E.164-normalisierte Helfer
  (`telLink`, `whatsappLink`, `mailtoLink`, `formatPhoneDisplay`).
- **`<ThemeProvider>` umrahmt jede Public Site** – CSS-Variablen
  kaskadieren durch alle Sektionen, jede Site sieht spürbar anders aus,
  ohne dass eine einzelne Branche im Code auftaucht.
- **`/site/[slug]/not-found.tsx`** – freundliche 404-Seite im
  Marketing-Layout, mit Links zur Demo-Übersicht und Startseite.
- **`/demo`-Karten** verlinken jetzt aktiv auf die jeweilige Public Site.
- **Section-Reihenfolge** kommt aus `preset.recommendedSections`,
  Standard-Reihenfolge plus defensive Fallbacks (Contact / Öffnungszeiten /
  Standort kommen immer ans Ende).
- **`lp-theme-section`-CSS-Klasse** ergänzt – nutzt `--theme-section-padding`.
- Smoketest `src/tests/public-site.test.ts`: Kontakt-Link-Normalisierung,
  Slug-Konsistenz, Pflicht „Telefon ODER WhatsApp" pro Betrieb.
- `docs/PUBLIC_SITE.md` mit Architektur, Datenfluss, Static-Export-Regeln,
  SEO-Pattern, Mobile-First-Notes, Erweiterungsanleitung.

### Notes
- Build:static produziert jetzt **12 statisch prerenderte Routen**:
  `/`, `/_not-found`, `/demo`, `/themes`, `/site/<6 slugs>`.
- Static-Export-kompatibel: keine API-Routen, keine Server Actions, kein
  Client-JS auf der Public Site (außer dem Mobile-Detail-Toggle der FAQs
  über native `<details>`).
- Branchenneutralität gewahrt: kein `if (industryKey === "...")` im
  Komponenten-Code; Texte und Felder kommen ausschließlich aus dem Preset.

## [0.6.0] – Session 6 – 2026-04-27

### Added
- **6 vollständig validierte Demo-Betriebe** unter
  `src/data/businesses/`:
  Studio Haarlinie (Friseur, Silber, warm_local),
  AutoService Müller (Werkstatt, Gold, automotive_strong),
  Glanzwerk Reinigung (Reinigung, Silber, medical_clean),
  Beauty Atelier (Kosmetik, Gold, beauty_luxury),
  Meisterbau Schneider (Handwerk, Bronze, craftsman_solid),
  Fahrschule Stadtmitte (Fahrschule, Silber, education_calm).
  Jeder Betrieb mit eigener Branche, eigenem Theme; alle drei aktiv
  vermarkteten Pakete vertreten. Insgesamt: 37 Services, 25 Reviews,
  22 FAQs, 5 TeamMembers, 25 Beispiel-Leads.
- `src/data/mock-helpers.ts`: `makeBusinessId`/`makeServiceId`/etc.
  für stabile Slug-prefixed-IDs, `MOCK_NOW`-Konstante für reproduzierbare
  Builds, `daysAgo()`, `buildOpeningHours()` (kompakte Schreibweise:
  `{ tuesday: "09:00-18:00", thursday: ["09:00-12:30", "13:30-20:00"] }`).
- `src/data/mock-businesses.ts`: Aggregation, `businessesBySlug`-Index,
  `getMockBusinessBySlug()`, `listMockBusinessSlugs()`,
  Konsistenz-Check (eindeutige Slugs).
- `src/data/mock-services.ts`: flache `mockServices`-Liste,
  `servicesByBusiness`, `getMockServiceById()`.
- `src/data/mock-reviews.ts`: flache `mockReviews`-Liste,
  `reviewsByBusiness`, `averageRatingByBusiness` (gerundet auf 0,1).
- `src/data/mock-leads.ts`: 25 realistische Beispiel-Leads mit
  branchenspezifischen `extraFields` (`vehicleModel`, `objectType`,
  `drivingClass`, …) und Status-Mix (`new`/`contacted`/`qualified`/`won`/
  `lost`). Validiert via `LeadSchema.parse(...)`.
- `src/data/mock-dataset.ts`: validiertes `MockDataset` über
  `validateMockDataset()` (`MockDatasetSchema`), `leadsByBusiness`,
  Konsistenz-Check (Lead → existierender Betrieb).
- `src/data/index.ts` Barrel.
- **`/demo`-Übersichtsseite**: rendert pro Betrieb eine Karte mit
  Themed-Vorschau (über `<ThemeProvider>`), Branchen-Etikett, Paket-Badge,
  Counts (Services/FAQs/Anfragen) und einem Hinweis auf die Public Site
  (folgt Session 7). Statisch prerendert, kein Client-JS.
- Nav-Eintrag „Demo" in `<SiteHeader>`.
- Smoketest `src/tests/mock-data.test.ts` mit 30+ Assertions
  (Mindestabdeckung, eindeutige IDs, Branchen-/Theme-/Paket-Diversität,
  Service-/Review-Konsistenz, Paket-Limits, Lead-Status-Mix,
  Verbot echter Mail-Provider, Lookup-Verhalten).
- `docs/MOCK_DATA.md` mit Tabellen, Architektur, Compliance-Regeln und
  Erweiterungsanleitung.

### Notes
- Stabile, demoerkennbare Daten: Telefon `+49 XX 9000 XXXX`-Muster,
  Mails auf `@<slug>-demo.de` oder `@example.org`, Städte
  *Musterstadt*/*Beispielstadt*/*Demostadt*/*Beispieldorf*. Smoketest
  blockt aktiv `gmail.com`, `gmx.de`, `web.de`, `hotmail.com`, `yahoo.com`.
- Stabile Zeitstempel via `MOCK_NOW = "2026-04-27T09:00:00Z"` und
  `daysAgo()` – Builds bleiben reproduzierbar.
- Kein Betrieb überschreitet sein Paket-Limit (Bronze 10, Silber 30,
  Gold 100 Services). Smoketest greift auf `isLimitExceeded()` zurück.

## [0.5.0] – Session 5 – 2026-04-27

### Added
- 10 Theme-Datensätze unter `src/core/themes/themes/`:
  `clean_light` (Default), `premium_dark`, `warm_local`, `medical_clean`,
  `beauty_luxury`, `automotive_strong`, `craftsman_solid`, `creative_studio`,
  `fitness_energy`, `education_calm`. Jedes Theme bringt 10 Farb-Tokens,
  Typografie, Radius, Schatten, Section-/Button-/Card-Stil und eine
  Liste passender Branchen mit. Jedes Theme wird beim Module-Load via
  `ThemeSchema.parse(...)` validiert.
- `src/core/themes/theme-resolver.ts`: `themeToCssVars(theme)` wandelt
  einen Theme-Datensatz in ein `Record<\`--theme-...\`, string>` für
  inline `style`. `hexToRgbTriplet()` konvertiert `#1f47d6` → `"31 71 214"`,
  passend zur Tailwind-`<alpha-value>`-Syntax.
- `src/core/themes/registry.ts` mit `THEME_REGISTRY`, `DEFAULT_THEME`
  (clean_light), `getTheme`, `getThemeOrFallback`, `getAllThemes`,
  `listThemeKeys`, `getThemesForIndustry`, `UnknownThemeError`,
  Konsistenz-Check beim Module-Load (Map-Key === theme.key).
- `src/core/themes/index.ts` Barrel.
- `<ThemeProvider>` (`src/components/theme/theme-provider.tsx`):
  Server-Component-tauglicher Wrapper, der die CSS-Variablen per inline
  `style` setzt und optional `bg-theme-background`/`text-theme-foreground`
  via `lp-theme-surface`-Klasse anwendet. Kein React Context, kein
  useEffect, kein Client-JS – kompatibel mit Static Export.
- `<ThemePreviewCard>` für die Galerie (Hero-Mini mit Buttons, Service-Card).
- Statische Galerie-Seite **`/themes`** rendert alle 10 Themes als Vorschau
  – serverseitig, ohne Client-JS, statisch exportierbar.
- Tailwind-Integration: `theme.*`-Color-Set (primary, primary-fg, secondary,
  secondary-fg, accent, background, foreground, muted, muted-fg, border)
  via `rgb(var(--theme-...) / <alpha-value>)`. `borderRadius.theme`,
  `borderRadius.theme-button`, `borderRadius.theme-card`, `boxShadow.theme`,
  `fontFamily.theme-heading`, `fontFamily.theme-body`.
- `src/app/globals.css` setzt Default-Theme-Variablen im `:root`, sodass
  Seiten ohne expliziten ThemeProvider trotzdem theme-Klassen nutzen können.
- Smoketest `src/tests/themes.test.ts` mit ~25 Assertions
  (Mindestabdeckung, Hex-Validierung, RGB-Konvertierung, Lookup-Verhalten,
  Branchenempfehlungen).
- `docs/THEMES.md`: Galerie-Übersicht, Architektur, Code-Beispiele,
  Erweiterungsanleitung.

### Changed
- `<LinkButton>` (`src/components/ui/button.tsx`) ist jetzt basePath-aware:
  Bei internen absoluten Pfaden (`/themes`, `/#kontakt`) wird automatisch
  `next/link` verwendet, sonst weiterhin nativer `<a>`. Damit funktionieren
  Header-Buttons von jeder Seite aus auf GitHub Pages korrekt.
- `<SiteHeader>` enthält jetzt einen Nav-Link auf `/themes`.
- `tailwind.config.ts` und `globals.css` mit Theme-Tokens erweitert
  (Marketing-Optik bleibt unberührt – `brand-*` und `ink-*` bleiben).

## [0.4.0] – Session 4 – 2026-04-27

### Added
- 13 Branchen-Presets unter `src/core/industries/presets/` mit kompletten,
  validierten Datensätzen: Friseur, Barbershop, Autowerkstatt,
  Reinigungsfirma, Kosmetikstudio, Nagelstudio, Handwerker, Elektriker,
  Malerbetrieb, Fahrschule, Restaurant, Fotograf, Personal Trainer.
- `src/core/industries/preset-helpers.ts`: wiederverwendbare Lead-Felder
  (`NAME_FIELD`, `PHONE_FIELD`, `EMAIL_FIELD`, `MESSAGE_FIELD`,
  `PREFERRED_DATE_FIELD`), Standard-CTAs (`CTA_APPOINTMENT_PRIMARY`,
  `CTA_CALL`, `CTA_WHATSAPP`, `CTA_QUOTE`, `CTA_CALLBACK`) und
  Compliance-Bausteine (`COMPLIANCE_NO_MEDICAL_PROMISE`,
  `COMPLIANCE_NO_LEGAL_ADVICE`, `COMPLIANCE_NO_FINANCE_GUARANTEE`,
  `COMPLIANCE_NO_AGE_RESTRICTED_PROMISE`).
- `src/core/industries/fallback-preset.ts` mit
  `getFallbackPreset(originalKey)` – branchenneutrales Universal-Preset, das
  den ursprünglich angefragten `key` spiegelt.
- `src/core/industries/registry.ts` mit:
  - `PRESET_REGISTRY`-Lookup-Map.
  - `getPreset`, `getPresetOrFallback`, `getAllPresets`, `listPresetKeys`,
    `listMissingPresetKeys`, `hasPreset`, `getPresetsForTheme`.
  - `UnknownIndustryError` für sprechende Fehler.
  - Konsistenz-Check beim Module-Load (Map-Key === preset.key).
- `src/core/industries/index.ts` Barrel.
- `src/tests/industry-presets.test.ts` mit umfangreichem Smoketest:
  Mindestabdeckung ≥ 10, Schema-Validierung, Pflichtfelder im Lead-Formular
  (`name`, `phone`), Platzhalter in Bewertungs-Vorlagen
  (`{{customerName}}`, `{{reviewLink}}`), Compliance-Hinweise für medizin-
  /pflegenahe Branchen (Kosmetik, Nail, Trainer).
- `docs/INDUSTRY_PRESETS.md` mit Übersichtstabelle, Zugriffs-API,
  Validierungs-Regeln, Konvention zur 30-Min-Branchenergänzung und
  Beziehung zu späteren Sessions.

### Notes
- `getPresetOrFallback()` ist die Standardvariante für Public Site und
  Dashboard – nie wieder weiße Seite, falls eine Branche noch nicht
  modelliert ist.
- Lücken in `INDUSTRY_KEYS` (`tutoring`, `local_shop`, `dog_grooming`,
  `wellness_practice`, `real_estate_broker`, `garden_landscaping`) sind
  bewusst noch nicht modelliert – `listMissingPresetKeys()` macht sie zur
  Laufzeit sichtbar.
- Der Core bleibt branchenneutral: Public Site, Dashboard und KI-System
  greifen ausschließlich über das Preset auf branchenspezifische Inhalte zu.

## [0.3.1] – Hotfix – 2026-04-27

### Added
- `.github/workflows/deploy.yml`: GitHub Pages Deployment via Actions.
  Trigger auf `main` und `claude/**`, baut mit `STATIC_EXPORT=true`,
  `NEXT_PUBLIC_BASE_PATH=/<repo-name>` und einem `.nojekyll`-File für
  `_next/`-Assets.
- `npm run build:static`: lokaler Static-Export-Build (`STATIC_EXPORT=true`).
- `docs/DEPLOYMENT.md`: vollständige Anleitung für GitHub Pages und
  geplanter Vercel-Pfad.
- `Claude.md` Abschnitt 28 "DEPLOYMENT" als persistenter Eintrag im
  Master-Briefing.

### Changed
- `next.config.mjs` schaltet `output: "export"`, `trailingSlash`, `basePath`
  und `assetPrefix` konditioniert auf `STATIC_EXPORT=true`. Lokaler
  `npm run dev` und normaler `npm run build` bleiben damit voll
  SSR-fähig.

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
