# Marketing-Seiten – LocalPilot AI

Die Verkaufslogik liegt in zwei Routen: **`/`** als Startseite mit dem
gesamten Funnel, **`/pricing`** als Tiefen-Vergleich für Interessierte,
die sich konkret entscheiden wollen. Beide sind statisch prerendert
(GitHub-Pages-tauglich) und teilen denselben Header/Footer wie der Rest
des Marketings.

## Live

- Startseite: `https://beko2210.github.io/LocalPilot-AI/`
- Pakete & Preise: `https://beko2210.github.io/LocalPilot-AI/pricing/`
- Demo-Übersicht: `https://beko2210.github.io/LocalPilot-AI/demo/`
- Themes-Galerie: `https://beko2210.github.io/LocalPilot-AI/themes/`

## Funnel auf der Startseite

Die Startseite ist als 11-Schritt-Funnel komponiert:

| #  | Sektion           | Komponente                              | Zweck                                                                |
| -- | ----------------- | --------------------------------------- | -------------------------------------------------------------------- |
| 1  | Hero              | `<MarketingHero>`                       | Versprechen + zwei klare CTAs (Live-Demo / Pakete vergleichen)       |
| 2  | Problem & Lösung  | `<ProblemSolution>`                     | Warum überhaupt? – Pain-Points und Lösungsbausteine                  |
| 3  | Was bringt's?     | `<ValueRoi>`                            | 4 ROI-Karten mit konkretem Nutzen statt abstrakter Versprechen      |
| 4  | Branchen          | `<IndustriesGrid>`                      | 12 Karten – jene mit Demo-Preset verlinken auf die jeweilige Site    |
| 5  | Live-Demos        | `<DemoShowcase>`                        | 6 Mini-Karten mit Themed-Vorschau, alle aktiv verlinkt               |
| 6  | Pakete-Teaser     | `<PricingTeaser>` mit `<PricingGrid>`   | Bronze/Silber/Gold-Karten + „Alle Funktionen vergleichen → /pricing" |
| 7  | Onboarding        | `<OnboardingPromise>`                   | 4 Schritte zum produktiven Stand                                     |
| 8  | Vorteile          | `<Benefits>`                            | Mobile First, KI ohne Risiko, Wachstum etc.                          |
| 9  | Stimmen           | `<Testimonials>`                        | Beispiel-Stimmen aus der Demo-Welt – klar markiert                   |
| 10 | FAQ               | `<MarketingFAQ>`                        | Einwände abräumen                                                    |
| 11 | Schluss-CTA       | `<CtaContact>`                          | Konkrete nächste Schritte: Demo / Pakete / E-Mail / Telefon          |

## `/pricing` – Vertiefung

| Sektion              | Komponente                            | Zweck                                                  |
| -------------------- | ------------------------------------- | ------------------------------------------------------ |
| Hero                 | inline                                | Drei Pakete, klar geschnitten                          |
| Pakete-Karten        | `<PricingGrid ctaHref="#kontakt-pricing">` | Bronze/Silber/Gold mit Highlight                  |
| Limits-Tabelle       | `<LimitsTable>`                       | maxServices, maxLandingPages, maxLanguages, …          |
| Funktions-Vergleich  | `<FeatureComparisonMatrix>`           | 31 Capabilities × 3 Tiers, gruppiert nach FeatureGroup |
| Pricing-FAQ          | inline                                | Mindestlaufzeit, Upgrade/Downgrade, MwSt., Kündigung   |
| Schluss-CTA          | inline                                | Beratung per E-Mail + 4-Schritte-Onboarding-Karte      |

Beide Tabellen lesen aus der Code-Konfiguration in `@/core/pricing` –
keine Doppelpflege, keine Drift zwischen Marketing-Text und tatsächlich
freigeschalteten Funktionen.

## Komponenten unter `src/components/marketing/`

Bestehend (Session 1):

- `<MarketingHero>` – jetzt mit zwei aktiven CTAs (Demo + Pakete)
- `<ProblemSolution>` – Pain-Points + Solution-Cards
- `<IndustriesGrid>` – Branchen-Karten, neu: aktive Links zu Demo-Sites
- `<PricingTeaser>` – nutzt `<PricingGrid>` aus `@/components/pricing`
- `<Benefits>`, `<MarketingFAQ>`, `<CtaContact>` – seriös und konversionsstark

Neu in Session 8:

- `<DemoShowcase>` – 6 Live-Demo-Mini-Karten mit Themed-Vorschau,
  jede klickbar zur jeweiligen Public Site.
- `<ValueRoi>` – 4 ROI-Karten mit „Proof-Label" (z. B. „Eingebaut: Bewertungs-
  Booster ab Bronze") als Mini-Beleg.
- `<Testimonials>` – Beispiel-Stimmen aus den Demo-Personas (Lena H., Stefan M.,
  Sophie L., Petra W.). Footnote macht klar: keine echten Kund:innen.
- `<OnboardingPromise>` – 4-Schritte-Sektion „In 4 Schritten startklar"
  mit zwei finalen CTAs (Pakete / Demos).

## Pricing-Komponenten unter `src/components/pricing/`

Bestehend (Session 3):

- `<PricingCard>`, `<PricingGrid>`, `<FeatureLock>`, `<UpgradeHint>`

Neu in Session 8:

- `<FeatureComparisonMatrix>` – iteriert über `FEATURE_KEYS`, gruppiert
  nach `FeatureGroup`, zeigt pro Tier ✓ oder —. Lesbar auf Mobile dank
  `overflow-x-auto`. Sticky Erste-Spalte erhält die Zuordnung beim Scrollen.
- `<LimitsTable>` – kompakte Tabelle der numerischen Limits
  (`maxServices`, `maxLandingPages`, …, `maxAiGenerationsPerMonth`).
  Nutzt `formatLimit()` aus `@/core/pricing` (rendert `unbegrenzt`
  korrekt).

## Sprache & Compliance

- **Deutsch first.** Englisch nur in Code-Identifiern.
- **Keine Buzzwords.** „Frische Frisuren, freundlich beraten" statt
  „revolutionäre KI-Erfahrung".
- **Keine Garantien** zu Umsatz, Anzahl Anfragen, SEO-Rankings o. Ä.
- **Klar markiertes Beispiel-Material.** `<Testimonials>` enthält eine
  Footnote, dass die Stimmen aus der Demo-Welt stammen.
- **Demo-Telefon** (`+49 30 9000 9999`) auf der Marketing-CTA – kein
  echter Anschluss, nicht erreichbar.
- **Keine versteckten Kosten** – Mindestlaufzeit, MwSt.-Hinweis und
  Platin-Status sind transparent erwähnt.

## Konversionsmessung (vorbereitet)

- Jeder CTA-Button ist ein eigenes `<a>`-Element mit klarer Beschriftung.
  Sobald Analytics dazukommt (Session 19+), lassen sich Klicks per
  CSS-Selektor sauber tracken.
- Direkte Telefon-/Mail-Aktionen aus `<CtaContact>` führen zu
  `mailto:hello@localpilot.ai` und `tel:+493090009999` (Demo). In der
  Produktion werden diese auf reale Werte gesetzt.

## Erweiterungs-Checkliste

Wenn ein neuer Funnel-Schritt hinzukommt:

1. Neue Komponente unter `src/components/marketing/` mit klarer
   `<Section>` + `eyebrow`/`title`/`intro`-Pattern.
2. In `src/app/page.tsx` an der richtigen Stelle einsetzen
   (kommentierter Funnel-Header).
3. Ggf. einen Anchor-Link `id="..."` setzen, damit Header-Nav darauf
   verweisen kann.
4. README + diese Datei aktualisieren.

Wenn ein neues Paket-Feature hinzukommt: einfach `FEATURE_KEYS` und
`FEATURE_LABELS` ergänzen – die Comparison-Matrix nimmt es automatisch
auf, kein UI-Code-Eingriff nötig.

## Beziehung zu späteren Sessions

- **Session 12** – ergänzt im `<CtaContact>`-Bereich (oder in einer
  neuen `<ContactForm>`) ein echtes Lead-Erfassungssystem.
- **Session 13–17** – KI kann später die Verkaufstexte selbst
  variieren / personalisieren.
- **Session 19** – Analytics/Tracking für Funnel-Optimierung.
- **Session 22** – `docs/SALES.md` mit Vertriebsskripten, die auf diesen
  Marketing-Seiten basieren.
