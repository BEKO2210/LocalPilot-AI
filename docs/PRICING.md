# Pricing – LocalPilot AI

Das Pricing ist **Code-Konfiguration**, kein reines Marketing-Element.
Bronze, Silber und Gold sind als typsichere `PricingTier`-Datensätze
definiert, die zur Laufzeit über Zod validiert werden. Marketing-Seite,
Dashboard und Feature-Locks lesen aus derselben Quelle.

## Stufen im Überblick

| Stufe   | Setup    | Monatlich | Zielgruppe                                       |
| ------- | -------- | --------- | ------------------------------------------------ |
| Bronze  | 499 €    | 49 €      | Kleinbetrieb, schnelle digitale Präsenz          |
| Silber  | 999 €    | 99 €      | Etablierte Betriebe mit Marketingbedarf          |
| Gold    | 1.999 €  | 199 €     | Wachsende Betriebe, mehrere Standorte            |
| Platin* | ab 2.999 €| 299–599 € | Auf Anfrage – Automationen, CRM, WhatsApp, etc. |

\* Platin ist aktuell **nicht** als `PricingTier` konfiguriert. Der Schlüssel
existiert im Type-System, der `getTier("platin")`-Aufruf wirft eine
`UnknownTierError`. Das ist beabsichtigt: die Funktionsmenge der Platin-Stufe
wird erst nach Session 22 modelliert (Automationen, CRM, WhatsApp-Integration).

## Feature-Vererbung

Bronze ⊂ Silber ⊂ Gold. Wer Silber bucht, bekommt automatisch alles aus
Bronze. Der Smoketest in `src/tests/pricing-helpers.test.ts` prüft das zur
Compile- und zur Laufzeit.

### Bronze – Feature-Set

- `public_website` – eigene öffentliche Website
- `industry_preset` – Branchenvorlage
- `single_theme` – Basis-Theme aus der Branchenempfehlung
- `service_listing` – Leistungen anzeigen
- `contact_form_basic` – einfaches Anfrageformular
- `opening_hours`, `google_maps_link`, `review_link`
- `review_booster_basic` – eine Standardvorlage für Bewertungsanfragen
- `basic_seo`

### Silber – zusätzlich zu Bronze

- `service_management`, `lead_management`
- `review_booster_advanced` – mehrere Vorlagen (WhatsApp, SMS, E-Mail)
- `ai_website_text`, `ai_service_text`, `ai_customer_reply`,
  `ai_faq_generator`, `ai_social_post`
- `social_media_basic`
- `multiple_themes`, `copy_to_clipboard`

### Gold – zusätzlich zu Silber

- `multi_section_landing`
- `ai_offer_generator`, `ai_campaign_generator`
- `social_media_advanced`
- `multilingual_content`
- `premium_themes`
- `team_section`, `lead_priority`, `performance_analytics`
- `multi_location_ready`

Vollständige Klartext-Beschreibungen je Feature: `src/core/pricing/feature-labels.ts`.

## Limits je Stufe

| Limit                            | Bronze | Silber | Gold        |
| -------------------------------- | ------ | ------ | ----------- |
| `maxServices`                    | 10     | 30     | 100         |
| `maxLandingPages`                | 1      | 1      | 5           |
| `maxLanguages`                   | 1      | 1      | 3           |
| `maxLocations`                   | 1      | 1      | 3           |
| `maxThemes`                      | 1      | 5      | unbegrenzt  |
| `maxAiGenerationsPerMonth`       | 0      | 200    | 1.000       |
| `maxLeads`                       | unbegr.| unbegr.| unbegrenzt  |

`unbegrenzt` ist als `Number.MAX_SAFE_INTEGER` modelliert und über
`TIER_UNLIMITED` aus `@/core/validation/pricing.schema` beziehbar. So
funktionieren Vergleiche (`value > limit`) ohne Sonderfälle und Werte
serialisieren in JSON sauber als Zahl.

## Programmatischer Zugriff

```ts
import {
  hasFeature,
  isFeatureLocked,
  requiredTierFor,
  getTierLimits,
  isLimitExceeded,
  compareTiers,
  isAtLeastTier,
  nextHigherTier,
  formatPrice,
} from "@/core/pricing";

hasFeature("bronze", "ai_website_text");        // false
isFeatureLocked("bronze", "ai_website_text");   // true
requiredTierFor("ai_campaign_generator");       // "gold"

isAtLeastTier(business.packageTier, "silber");  // true|false
nextHigherTier("silber");                        // "gold"

const limits = getTierLimits(business.packageTier);
isLimitExceeded(business.packageTier, "maxServices", services.length);

formatPrice(499);  // "499 €"
```

Die Helfer sind reine Funktionen, frei von Seiteneffekten – sie laufen in
Server- und Client-Komponenten.

## UI-Bausteine

Die Komponenten leben unter `src/components/pricing/` und werden zentral aus
`@/components/pricing` exportiert.

### `<PricingCard>` und `<PricingGrid>`

```tsx
import { PricingGrid } from "@/components/pricing";

<PricingGrid ctaHref="#kontakt" />
// oder im Dashboard:
<PricingGrid currentTier={business.packageTier} ctaHref="/dashboard/upgrade" />
```

Wird auf der Marketing-Landingpage und später im Dashboard verwendet. Die
Karten ziehen ihre Inhalte direkt aus `getAllTiers()`.

### `<FeatureLock>` – sperrt Bereiche

Wrappt UI-Bereiche, die paketabhängig sind. Wenn das Feature nicht
freigeschaltet ist, blendet die Komponente einen Hinweis ein.

```tsx
import { FeatureLock } from "@/components/pricing";

<FeatureLock feature="ai_social_post" currentTier={business.packageTier}>
  <SocialMediaGenerator />
</FeatureLock>
```

Varianten:

- `variant="overlay"` (Default) – Inhalte bleiben sichtbar, werden gedimmt,
  Lock-Hinweis liegt darüber. Gut für Karten und Listen, deren Form Teil der
  Verkaufsbotschaft ist.
- `variant="replace"` – Inhalte werden komplett durch einen kompakten
  Upgrade-Hinweis ersetzt. Gut für komplexe Formulare oder schwere
  Komponenten, die auch im gesperrten Zustand keine Last erzeugen sollen.

### `<UpgradeHint>` – kompakter Hinweis

Wird vom `<FeatureLock>` intern genutzt, kann aber auch direkt verwendet
werden:

```tsx
import { UpgradeHint } from "@/components/pricing";

<UpgradeHint feature="ai_campaign_generator" inline />
// oder explizit:
<UpgradeHint requiredTier="gold" />
```

`inline` ist die platzsparende Variante (klein, einzeilig, mit
Pfeil-Icon). Die Standardvariante ist eine kleine Box mit Lock-Symbol und
"Pakete vergleichen"-Link.

## Geschäftsregeln & Stoppregeln

- Preise werden als ganzzahlige Euro-Beträge gespeichert und über
  `Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" })`
  formatiert. Centgenaue Werte sind aktuell nicht vorgesehen.
- Mindestlaufzeit nach Vereinbarung – wird in der Marketing-Fußnote erwähnt,
  fließt aber nicht ins Datenmodell ein.
- **Keine Dark Patterns**: gesperrte Funktionen werden klar als gesperrt
  beschriftet, nie als "kostenlose Demo". Texte bleiben sachlich.
- **Keine Rechtsberatung in Texten**: Die Pricing-Karten beschreiben
  Funktionen, nicht juristische Wirkung. Mehrwertsteuerhinweise sind generell
  als Fußnote auf der Marketing-Seite.

## Erweiterung in den nächsten Sessions

- **Session 18** – Feature-Lock-System weiter ausbauen: globale
  Vergleichsmatrix, Upgrade-CTA in der Hauptnavigation, Beleuchtung gesperrter
  Buttons (`aria-disabled` + Klartext).
- Sobald die echte Geschäftsdatenhaltung steht (Session 19), wird der
  `currentTier` aus dem `business`-Datensatz übernommen statt aus einer
  Demo-Variable.
- Eine Platin-Konfiguration wird ergänzt, sobald die Funktionsmenge
  (Automationen, CRM, WhatsApp-Anbindung) modelliert ist.
