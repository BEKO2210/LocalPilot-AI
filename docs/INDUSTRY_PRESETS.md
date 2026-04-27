# Industry Presets – LocalPilot AI

Branchen-Presets sind das Herzstück der Branchenneutralität. Der Core kennt
keine Friseure, keine Werkstätten, keine Restaurants. Er kennt nur das
**`IndustryPreset`-Interface** und greift zur Laufzeit auf die hinterlegte
Konfiguration zu.

## Was ein Preset enthält

Jedes Preset wird gegen das Zod-Schema `IndustryPresetSchema` (siehe
`src/core/validation/industry.schema.ts`) validiert. Pflichtfelder:

| Feld                         | Zweck                                                     |
| ---------------------------- | --------------------------------------------------------- |
| `key`                        | Eindeutiger Branchenschlüssel (`IndustryKey`).            |
| `label`, `pluralLabel`       | Anzeige in UI.                                            |
| `description`                | Internes Briefing für Vertrieb und KI-Prompts.            |
| `targetAudience`             | Wer kauft typischerweise?                                 |
| `defaultTagline`             | Hero-Tagline mit `{{city}}`-Platzhalter.                  |
| `defaultHeroTitle/Subtitle`  | Hero-Texte für Public Site.                               |
| `defaultCtas`                | Sofort verwendbare CTAs (call, whatsapp, appointment …).  |
| `recommendedSections`        | Welche Abschnitte sind sinnvoll?                          |
| `defaultServices`            | 3–10 typische Leistungen (Titel, Kurztext, Preis-Label).  |
| `defaultFaqs`                | Branchen-übliche Fragen + Antworten.                      |
| `defaultBenefits`            | Vorteile, sachlich formuliert.                            |
| `defaultProcessSteps`        | Wie läuft eine Anfrage typischerweise ab?                 |
| `leadFormFields`             | Dynamische Felder für das Anfrageformular.                |
| `reviewRequestTemplates`     | Vorlagen für WhatsApp/SMS/E-Mail mit Platzhaltern.        |
| `socialPostPrompts`          | Ideen für Social Media (Plattform, Ziel, Tonalität).      |
| `websiteCopyPrompts`         | KI-Prompts für Hero-Title, Über-uns etc.                  |
| `recommendedThemes`          | Welche Designs passen zur Branche?                        |
| `recommendedPricingLabels`   | Wie nennt die Branche Preise? (`ab`, `Pauschal`, …)       |
| `imageGuidance`              | Bildstil + zu vermeidende Motive.                         |
| `toneOfVoice`                | Tonalität als Stichworte.                                 |
| `complianceNotes`            | Bspw. Heilversprechen-Verbot.                             |

## Aktuell hinterlegt (13 Presets)

| Schlüssel              | Label             | Empfohlene Themes                                            |
| ---------------------- | ----------------- | ------------------------------------------------------------ |
| `hairdresser`          | Friseur           | beauty_luxury, warm_local, clean_light                       |
| `barbershop`           | Barbershop        | premium_dark, automotive_strong, clean_light                 |
| `auto_workshop`        | Autowerkstatt     | automotive_strong, craftsman_solid, clean_light              |
| `cleaning_company`     | Reinigungsfirma   | clean_light, craftsman_solid, medical_clean                  |
| `cosmetic_studio`      | Kosmetikstudio    | beauty_luxury, clean_light, warm_local                       |
| `nail_studio`          | Nagelstudio       | beauty_luxury, clean_light, warm_local                       |
| `craftsman_general`    | Handwerker        | craftsman_solid, clean_light, automotive_strong              |
| `electrician`          | Elektriker        | craftsman_solid, clean_light, automotive_strong              |
| `painter`              | Malerbetrieb      | craftsman_solid, clean_light, warm_local                     |
| `driving_school`       | Fahrschule        | education_calm, clean_light, fitness_energy                  |
| `restaurant`           | Restaurant        | warm_local, clean_light, creative_studio                     |
| `photographer`         | Fotograf          | creative_studio, premium_dark, clean_light                   |
| `personal_trainer`     | Personal Trainer  | fitness_energy, clean_light, education_calm                  |

Lücken (in `INDUSTRY_KEYS` definiert, noch ohne Preset – werden über
`getPresetOrFallback()` aufgefangen):

`tutoring`, `local_shop`, `dog_grooming`, `wellness_practice`,
`real_estate_broker`, `garden_landscaping`.

`listMissingPresetKeys()` gibt diese Liste zur Laufzeit aus.

## Programmatischer Zugriff

```ts
import {
  getPreset,
  getPresetOrFallback,
  getAllPresets,
  listPresetKeys,
  listMissingPresetKeys,
  hasPreset,
  getPresetsForTheme,
  UnknownIndustryError,
} from "@/core/industries";

// Hartes Lookup, wirft bei unbekanntem Key:
const friseur = getPreset("hairdresser");

// Defensives Lookup, liefert immer ein Preset (notfalls Fallback):
const preset = getPresetOrFallback(business.industryKey);

// Alles, sortiert nach Label:
for (const p of getAllPresets()) {
  console.log(p.label, p.defaultServices.length);
}

// Welche Branchen empfehlen ein bestimmtes Theme?
const beautyShops = getPresetsForTheme("beauty_luxury");
```

`getPresetOrFallback` ist die Standardvariante für die Public Site und das
Dashboard – fällt eine Branche herein, die wir noch nicht modelliert haben,
zeigen wir trotzdem ein sauberes Layout mit dem Fallback-Preset
(`src/core/industries/fallback-preset.ts`), das den ursprünglichen
`industryKey` als `key` behält.

## Validierung beim Module-Load

Beim ersten Import von `@/core/industries`:

1. Jedes Preset wird via `IndustryPresetSchema.parse(...)` validiert
   (passiert pro Datei direkt im Modul).
2. Die Registry prüft, dass jeder Map-Key zum `preset.key` passt
   (verhindert vertauschte Imports wie `nail_studio: cosmeticStudioPreset`).
3. Smoketest in `src/tests/industry-presets.test.ts` prüft zusätzlich
   semantische Regeln (Pflichtfelder `name`/`phone`, Compliance-Hinweise
   für Kosmetik/Nail/Trainer, Platzhalter in Bewertungs-Vorlagen).

Wenn etwas nicht stimmt, schlägt der Import fehl – nicht erst die
Produktion. `npm run typecheck` und `npm run build` decken das ab.

## Gemeinsame Bausteine (`preset-helpers.ts`)

Damit jedes Preset kurz bleibt, sind wiederverwendbare Pflichtfelder und
typische CTAs ausgelagert:

- `NAME_FIELD`, `PHONE_FIELD`, `EMAIL_FIELD`, `MESSAGE_FIELD`,
  `PREFERRED_DATE_FIELD` – Lead-Felder, in fast jedem Preset gleich.
- `CTA_APPOINTMENT_PRIMARY`, `CTA_CALL`, `CTA_WHATSAPP`, `CTA_QUOTE`,
  `CTA_CALLBACK` – Standard-CTAs.
- `COMPLIANCE_NO_MEDICAL_PROMISE`, `COMPLIANCE_NO_LEGAL_ADVICE`,
  `COMPLIANCE_NO_FINANCE_GUARANTEE`, `COMPLIANCE_NO_AGE_RESTRICTED_PROMISE`
  – häufig genutzte Compliance-Hinweise.

Branchenspezifische Felder (`vehicleModel`, `objectType`, `goals` …)
werden direkt im jeweiligen Preset definiert.

## Neue Branche ergänzen (in unter 30 Minuten)

1. **Schlüssel hinterlegen** – falls noch nicht vorhanden, in
   `INDUSTRY_KEYS` (`src/types/common.ts`) ergänzen.
2. **Preset-Datei anlegen** – z. B.
   `src/core/industries/presets/dog-grooming.ts`. Als Vorlage eignet sich
   `hairdresser.ts` oder `cleaning-company.ts`, je nach Geschäftsmodell
   (Termine vs. Angebote).
3. **Registry erweitern** – Import + Eintrag in `PRESET_REGISTRY` in
   `src/core/industries/registry.ts`.
4. **Smoketest erweitern** – falls die Branche besondere Compliance- oder
   Pflichtfelder verlangt, Assertion in
   `src/tests/industry-presets.test.ts` ergänzen.
5. **Doku aktualisieren** – Zeile in der Tabelle oben, ggf. Lückenliste
   anpassen.

## Texte & Compliance

- **Keine Heilversprechen.** Kosmetik, Nails, Personal Trainer & Co. tragen
  einen `complianceNotes`-Eintrag mit `topic: "medical"`. Der Smoketest
  prüft das automatisch für die genannten Branchen.
- **Keine Rechtsberatung.** Wenn Steuer-/Versicherungs-Branchen ergänzt
  werden, immer `COMPLIANCE_NO_LEGAL_ADVICE` und ggf.
  `COMPLIANCE_NO_FINANCE_GUARANTEE` setzen.
- **Keine Garantien.** Texte bleiben sachlich – keine "100 % Erfolg",
  "schmerzfrei", "endgültig", "garantiert in 24h" u. ä.
- **Platzhalter:** Bewertungs-Vorlagen MÜSSEN `{{customerName}}` und
  `{{reviewLink}}` enthalten. Das wird im Smoketest geprüft.

## Beziehung zu späteren Sessions

- **Session 5** (Themes) nutzt `recommendedThemes` zur Vorauswahl.
- **Session 6** (Mock-Daten) leiht sich `defaultServices` und
  `defaultFaqs`, um die Demo-Betriebe zu seeden.
- **Session 7** (Public Site) rendert ihre Sektionen aus dem Preset des
  zugehörigen Business: `recommendedSections` steuert die Reihenfolge,
  `defaultCtas` belegt die Hero-Buttons, `leadFormFields` das Formular.
- **Session 12** (Lead-System) verwendet `leadFormFields` als
  branchenspezifische Form-Vorgabe.
- **Session 13–17** (KI) nutzt `websiteCopyPrompts`, `socialPostPrompts`,
  `reviewRequestTemplates` und `toneOfVoice` als Kontext für die
  Provider-Calls.

Der Core bleibt branchenneutral – alle Branchenlogik fließt aus dem Preset.
