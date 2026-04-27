# Services-Editor – LocalPilot AI

CRUD-Editor für Leistungen pro Demo-Betrieb. Live unter
`/dashboard/<slug>/services`. Zweite produktive Editor-Page nach dem
Business-Editor (Session 10), nutzt das gleiche RHF-/Mock-Store-Pattern.

## Live

- Lokal: `http://localhost:3000/dashboard/beauty-atelier/services`
- Pages: `https://beko2210.github.io/LocalPilot-AI/dashboard/beauty-atelier/services/`

## Architektur

```
src/lib/mock-store/services-overrides.ts
  → getServicesOverride / setServicesOverride / clearServicesOverride /
    hasServicesOverride / getEffectiveServices
  → localStorage-Schlüssel `lp:services-override:v1:<slug>`

src/components/dashboard/services-edit/
  services-edit-form.tsx   → top-level <ServicesEditForm> (RHF + zod + useFieldArray)
  service-card.tsx         → eine kollabierbare Service-Karte
  services-summary.tsx     → Limit-Indikator mit Fortschrittsbar
  index.ts                 → Barrel + re-export ServicesFormValues

src/app/dashboard/[slug]/services/page.tsx
  → Server-Page; Bronze (kein service_management) zeigt
    <ComingSoonSection> statt Editor; Silber/Gold rendern <ServicesEditForm>.
```

## Datenfluss

1. **Server**: `getMockBusinessBySlug(slug)` liefert das Business inkl.
   seiner Demo-Services. Bronze ohne `service_management` bleibt
   read-only; Silber/Gold bekommen den Editor.
2. **Client mount**: `getServicesOverride(slug)` aus localStorage
   überschreibt die Demo-Liste, sonst bleibt sie wie geliefert.
   `normalizeOrder()` sortiert nach `sortOrder` und schreibt die
   Reihenfolge auf 0..n-1 zurück (verhindert kaputte Zustände nach
   manuellen JSON-Edits).
3. **User editiert**: React Hook Form + `useFieldArray` verwalten den
   Array-State (append, remove, swap), jede Karte bindet ihre Felder
   per `register("services.${index}.<name>")`.
4. **Save**: vor dem Schreiben wird das Limit nochmals geprüft –
   überschreitet die Zahl der Services das Paket-Limit, wird das
   Speichern blockiert (Button disabled + Hinweis).
5. **Verwerfen**: Form fällt auf den persistierten Override zurück
   (oder Demo-Default, falls keiner existiert).
6. **Demo-Defaults laden**: `clearServicesOverride(slug)` entfernt den
   localStorage-Eintrag, das Form fällt auf das Original zurück.

## Funktionen im Editor

### Kopfbereich (Status-Bar)

- „Lokale Anpassung aktiv" / „Demo-Stand"
- Anzahl Karten mit Validierungsfehlern
- Buttons: **Demo-Defaults laden** (nur sichtbar bei aktivem Override),
  **Verwerfen** (nur bei dirty form), **Speichern** (disabled bei
  Limit-Überschreitung).

### `<ServicesSummary>`

- „X von Y Leistungen genutzt" + Fortschrittsbar.
- Aktiv- und Featured-Counter.
- Warnung „Limit erreicht" / „Über Limit" mit Link nach `/pricing`.

### Service-Karten

Jede Karte ist ein nativer `<details>`-Akkordeon:

- **Header (zugeklappt)**: Titel + Kategorie + Preis-Label + Badges
  (Hervorgehoben, Inaktiv, Fehler) + Pfeil-Buttons (Reihenfolge) +
  Aufklapp-Pfeil.
- **Body (aufgeklappt)**: Form-Felder (Titel*, Kategorie, Preis-Label,
  Dauer, Kurzbeschreibung), Toggles (Aktiv, Hervorgehoben),
  Entfernen-Button mit Inline-Bestätigung.
- Versteckte Felder: `id`, `businessId`, `sortOrder` (System-managed).
- Karten mit Fehlern öffnen sich automatisch.

### Hinzufügen

Zwei Wege:

- **Neue Leistung anlegen** (leeres Service-Objekt, sortOrder am Ende).
- **Aus Branchen-Preset übernehmen** (nur sichtbar bei leerer Liste):
  konvertiert `preset.defaultServices` zu vollständigen `Service`-
  Objekten mit frischen IDs und ersetzt die aktuelle Liste.

### Sortierung

Per ↑/↓-Button. Nach jedem Speichern werden `sortOrder`-Werte auf
0..n-1 normalisiert.

## Persistierungs-API

```ts
import {
  getServicesOverride,
  setServicesOverride,
  clearServicesOverride,
  hasServicesOverride,
  getEffectiveServices,
} from "@/lib/mock-store";

const services = getServicesOverride("beauty-atelier"); // Service[] | null
setServicesOverride("beauty-atelier", services);         // boolean
hasServicesOverride("beauty-atelier");                    // boolean
clearServicesOverride("beauty-atelier");                  // void

// Nutzungsbeispiel (Public Site später):
const effective = getEffectiveServices(slug, business.services);
```

LocalStorage-Schlüssel: `lp:services-override:v1:<slug>`. Der Layer ist
SSR-sicher: ohne `window` liefert er konsistent `null`/`false`/no-op.

## Paket-Gating

| Paket  | Max. Services | UI-Status                                         |
| ------ | ------------- | ------------------------------------------------- |
| Bronze | 10            | Editor gesperrt, Coming-Soon mit Upgrade-Hinweis  |
| Silber | 30            | Voller Editor, Limit-Bar warnt vor Überschreitung |
| Gold   | 100           | Voller Editor, faktisch kein Druck                |

Die Sperre für Bronze nutzt `hasFeature(tier, "service_management")` –
dieselbe Quelle, die auch der Pricing-Comparison-Matrix zugrunde liegt.

Wer in Silber 30 Services hat und den Tarif auf Bronze downgradet,
landet im **„Über Limit"-Zustand**: Speichern ist blockiert, bis Karten
entfernt sind oder das Paket wieder aufgestockt wird. Damit entsteht
nie ein kaputter Stand auf der Public Site.

## Tests

`src/tests/services-edit.test.ts` (~10 Assertions):

- Alle 6 Demo-Listen sind formularvalide.
- `sortOrder` pro Business eindeutig und nicht-negativ ganzzahlig.
- Service-IDs sind projektweit eindeutig.
- Paket-Limits stimmen (Bronze 10, Silber 30, Gold 100).
- Mock-Store ist SSR-sicher und liefert ohne `window` konsistente
  Defaults.

Plus erweiterter `dashboard.test.ts`: erwartet jetzt mindestens drei
produktive Sektionen (Übersicht, Betriebsdaten, Leistungen).

## Beziehung zu späteren Sessions

- **Session 12** – Lead-System: gleiches Pattern, aber mit echter
  Server-Action für die Lead-Erfassung von der Public Site.
- **Sessions 13–17** – KI-Tools können Service-Beschreibungen
  vorschlagen.
- **Session 18** – Settings: Slug-, Veröffentlichungs- und
  Locale-Steuerung.
- **Session 19** – Repository-Layer ersetzt
  `services-overrides.ts` transparent (Supabase-Tabelle pro Service).
  Der Editor selbst bleibt unverändert.
