# Mock-Daten – LocalPilot AI

Sechs Demo-Betriebe, vollständig validiert, decken alle drei aktiv
vermarkteten Pakete und sechs verschiedene Themes ab. Sie sind die
Datengrundlage für die Public-Site (Session 7) und das Dashboard
(Session 9+).

## Live-Übersicht

`/demo` rendert eine Karte pro Betrieb mit Themed-Vorschau, Branchen-
Etikett, Paket-Badge und Counts (Leistungen, FAQs, Anfragen).

- Lokal: `http://localhost:3000/demo`
- Pages: `https://beko2210.github.io/LocalPilot-AI/demo/`

## Die sechs Betriebe

| Slug                        | Name                  | Branche             | Paket   | Theme              | Stadt          |
| --------------------------- | --------------------- | ------------------- | ------- | ------------------ | -------------- |
| `studio-haarlinie`          | Studio Haarlinie      | Friseur             | Silber  | warm_local         | Musterstadt    |
| `autoservice-mueller`       | AutoService Müller    | Autowerkstatt       | Gold    | automotive_strong  | Beispielstadt  |
| `glanzwerk-reinigung`       | Glanzwerk Reinigung   | Reinigungsfirma     | Silber  | medical_clean      | Demostadt      |
| `beauty-atelier`            | Beauty Atelier        | Kosmetikstudio      | Gold    | beauty_luxury      | Musterstadt    |
| `meisterbau-schneider`      | Meisterbau Schneider  | Handwerker          | Bronze  | craftsman_solid    | Beispieldorf   |
| `fahrschule-stadtmitte`     | Fahrschule Stadtmitte | Fahrschule          | Silber  | education_calm     | Demostadt      |

Jeder Betrieb ist anders in **Branche, Theme und Paket**, alle drei aktiv
vermarkteten Pakete (Bronze/Silber/Gold) sind vertreten.

## Was jeder Betrieb mitbringt

- 5–7 **Services** (Titel, Kategorie, Preis-Label, Tags, sortOrder)
- 0–3 **TeamMembers** (in Bronze leer, in Gold mit Bio)
- 3–5 **Reviews** (4–5 Sterne, mit Quelle `google` und Datum)
- 3–4 **FAQs** (branchenspezifische Antworten)
- Realistische **Öffnungszeiten** (auch geteilte Tage wie 10–13 + 14–19)
- **Adresse** (fiktive Stadt, fiktive PLZ, ISO-Country-Code)
- **Kontakt** (Telefon-/Mail-/WhatsApp-/Website-Pattern als Demo erkennbar)

Plus **3–5 Beispiel-Leads** pro Betrieb, mit Mix aus Status (`new`,
`contacted`, `qualified`, `won`, `lost`) und branchenspezifischen
`extraFields` (z. B. `vehicleModel`, `objectType`, `drivingClass`).

## Architektur

```
src/data/
  mock-helpers.ts            Slug-/ID-/Datums-Helfer + buildOpeningHours()
  businesses/<slug>.ts       Ein Datensatz pro Demo-Betrieb (fat aggregate)
  mock-businesses.ts         Aggregat + Slug-Index + Konsistenz-Check
  mock-services.ts           Flache Service-Liste + servicesByBusiness
  mock-reviews.ts            Flache Review-Liste + reviewsByBusiness + averageRatingByBusiness
  mock-leads.ts              Alle Leads, gruppiert
  mock-dataset.ts            Validiertes MockDataset + leadsByBusiness
  mock-types.ts              MockDatasetSchema, BusinessSlugIndex (Session 2)
  index.ts                   Barrel
```

### Validierung

- Jeder Betrieb wird in seiner Datei via `BusinessSchema.parse(...)` geprüft.
- Jeder Lead in `mock-leads.ts` über `LeadSchema.parse(...)`.
- Das Aggregat in `mock-dataset.ts` läuft zusätzlich durch
  `MockDatasetSchema` (`validateMockDataset()`), das wiederum prüft, dass
  alle Geschäftsregeln eingehalten sind.
- `mock-businesses.ts` und `mock-dataset.ts` enthalten **Konsistenz-Checks**
  (eindeutige Slugs, Lead → existierender Betrieb), die beim Module-Load
  ausgeführt werden – nicht erst zur Laufzeit.
- Smoketest `src/tests/mock-data.test.ts` prüft 30+ semantische Regeln
  (eindeutige IDs, Paket-Limits, Lead-Status-Mix, keine echten
  Mail-Domains, Pricing-Konsistenz).

## Programmatischer Zugriff

```ts
import {
  mockBusinesses,
  getMockBusinessBySlug,
  listMockBusinessSlugs,
  mockServices,
  mockReviews,
  averageRatingByBusiness,
  mockLeads,
  leadsByBusiness,
  mockDataset,
} from "@/data";

// Public Site (Session 7) wird das so nutzen:
export function generateStaticParams() {
  return listMockBusinessSlugs().map((slug) => ({ slug }));
}

export default function PublicSite({ params }: { params: { slug: string } }) {
  const business = getMockBusinessBySlug(params.slug);
  if (!business) notFound();
  return <PublicSiteRenderer business={business} />;
}

// Dashboard (Session 9+):
const offeneAnfragen = leadsByBusiness[business.id]
  .filter((l) => l.status === "new" || l.status === "contacted");
```

## Daten-Hygiene & Stoppregeln

- **Keine echten Marken** – alle Namen sind frei erfunden.
- **Keine echten Adressen** – Städte heißen *Musterstadt*, *Beispielstadt*,
  *Demostadt*, *Beispieldorf*. PLZ stammen aus realistischen Bereichen,
  Straßennamen sind generisch.
- **Keine realen Telefon-Nummern** – Nummern folgen einem klar
  erkennbaren Demo-Muster (`+49 30 9000 XXXX` etc.). Es sind keine echten
  Anschlüsse.
- **Keine echten Mail-Provider** – Adressen enden auf
  `@<slug>-demo.de` oder `@example.org`. Der Smoketest verbietet `gmail.com`,
  `gmx.de`, `web.de`, `hotmail.com`, `yahoo.com` aktiv.
- **Reviews sind fiktiv** – Vornamen + Anfangsbuchstabe Nachname,
  realistische Bewertungstexte ohne medizinische Versprechen oder
  Ergebnisgarantien.
- **Stabile Zeitstempel** – `MOCK_NOW = "2026-04-27T09:00:00Z"`,
  `daysAgo()` rechnet von dort zurück. Damit sind Builds reproduzierbar.

## Pakete vs. Limits

Per Smoketest geprüft: kein Betrieb überschreitet das `maxServices`-Limit
seines Pakets (Bronze 10, Silber 30, Gold 100).

| Betrieb              | Paket   | Services |
| -------------------- | ------- | -------- |
| Studio Haarlinie     | Silber  | 7        |
| AutoService Müller   | Gold    | 7        |
| Glanzwerk Reinigung  | Silber  | 6        |
| Beauty Atelier       | Gold    | 7        |
| Meisterbau Schneider | Bronze  | 5        |
| Fahrschule Stadtmitte| Silber  | 5        |

Damit demonstriert die Demo gleichzeitig, dass auch Bronze (mit
maxServices=10) genug Spielraum für reale Betriebe bietet.

## Erweitern (neuen Demo-Betrieb anlegen)

1. **Slug wählen** (`<branche>-<eigenname>`).
2. Datei `src/data/businesses/<slug>.ts` anlegen, als Vorlage einen
   bestehenden Demo-Betrieb kopieren.
3. `BusinessSchema.parse(...)` umrahmt den Datensatz – Tippfehler oder
   ungültige Werte fliegen sofort beim ersten Import auf.
4. Import + Eintrag in `mock-businesses.ts` ergänzen.
5. Optional: 3–5 Beispiel-Leads in `mock-leads.ts` ergänzen.
6. Smoketest läuft beim nächsten `npm run typecheck`/`build` automatisch
   gegen den neuen Stand.
7. Auf `/demo` erscheint die neue Karte.

Sobald die Public Site (Session 7) live ist, wird der neue Slug zusätzlich
über `generateStaticParams()` als statische Seite erzeugt.

## Beziehung zu späteren Sessions

- **Session 7** – Public Site nutzt `getMockBusinessBySlug` plus
  `generateStaticParams(listMockBusinessSlugs())`.
- **Session 9+** – Dashboard zeigt `leadsByBusiness` und nutzt
  `averageRatingByBusiness` für die Übersicht.
- **Session 12** – Lead-System lernt am Mock-Status-Mix.
- **Sessions 13–17** – AI-Provider erhalten den Business-Context
  (`industryKey`, `packageTier`, `city`, `toneOfVoice` aus Preset).
- **Session 19** – Repository-Layer kapselt diesen Mock-Store, sodass die
  Frontend-Komponenten unverändert auf Supabase umgestellt werden können.
