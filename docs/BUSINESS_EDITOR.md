# Business-Editor – LocalPilot AI

Editor zum Pflegen der Stammdaten und des Brandings eines Demo-Betriebs.
Live unter `/dashboard/<slug>/business`.

## Live

- Lokal: `http://localhost:3000/dashboard/beauty-atelier/business`
- Pages: `https://beko2210.github.io/LocalPilot-AI/dashboard/beauty-atelier/business/`

## Architektur

```
src/core/validation/business-profile.schema.ts
  → BusinessProfileSchema + BusinessProfile-Type (Subset von Business)

src/lib/mock-store/
  business-overrides.ts  → localStorage-Helfer (get/set/clear/has)
  business-profile.ts    → profileFromBusiness, mergeBusinessWithProfile
  index.ts

src/components/forms/
  form-section.tsx       → 3-Spalten-Sektion (Header links, Felder rechts)
  form-field.tsx         → FormField-Wrapper + FormInput/Textarea/Select

src/components/dashboard/business-edit/
  business-edit-form.tsx     → Top-level Client-Form (RHF + zodResolver)
  business-edit-preview.tsx  → Live-Themed-Preview (useWatch)
  opening-hours-editor.tsx   → 7-Tage-Editor mit useFieldArray
  theme-picker-field.tsx     → visueller Theme-Picker als Karten
  index.ts

src/app/dashboard/[slug]/business/page.tsx
  → Server-Page lädt Business + rendert <BusinessEditForm>
```

## Datenfluss

1. **Server**: `getMockBusinessBySlug(slug)` liefert das Original-Business.
2. **Client mount**: `getOverride(slug)` aus localStorage hydratisiert das
   Form über `methods.reset(stored)`. Falls kein Override existiert,
   bleibt der Demo-Stand.
3. **User editiert**: React Hook Form pflegt einen lokalen Zustand mit
   Validierung (`zodResolver(BusinessProfileSchema)`, mode `onBlur`).
4. **Save**: `setOverride(slug, profile)` schreibt das validierte
   Profil nach localStorage; UI zeigt grüne „Gespeichert"-Bestätigung.
5. **Verwerfen**: Form setzt zurück auf gespeicherten Override
   (oder Demo-Default, falls keiner existiert).
6. **Demo-Defaults laden**: `clearOverride(slug)` entfernt den Eintrag
   und der Form-Zustand fällt auf das Original zurück.

## Sektionen des Formulars

| #  | Section          | Felder                                                              |
| -- | ---------------- | ------------------------------------------------------------------- |
| 1  | Basisdaten       | `name`, `tagline`, `description`                                     |
| 2  | Branche & Paket  | `industryKey` (Select aus 13 Presets), Paketstatus (Display only)    |
| 3  | Adresse          | `street`, `postalCode`, `city`, `country` (ISO-Code)                 |
| 4  | Kontakt          | `phone`, `whatsapp`, `email`, `website`, `googleMapsUrl`, `googleReviewUrl` |
| 5  | Öffnungszeiten   | 7 Tage, jeweils „geschlossen" oder mehrere Slots (`useFieldArray`)   |
| 6  | Branding & Design| `themeKey` (Picker), `primaryColor`/`secondaryColor`/`accentColor`, `logoUrl`, `coverImageUrl` |

Alle Validierung kommt aus `BusinessProfileSchema` – Pflichtfelder sind
mit `*` markiert, Inline-Fehlertexte erscheinen unter dem jeweiligen
Feld.

## Live-Preview

`<BusinessEditPreview>` rendert eine themed Hero-Mini mit Name, Tagline,
Adresse, Primär-CTA und (falls vorhanden) Anrufen-Button. Aktualisiert
sich auf jede Änderung dank `useWatch()`.

Theme-Override:
`<BusinessEditPreview>` schmiedet ein modifiziertes Theme aus dem
gewählten Basis-Theme + den drei optionalen Farb-Overrides
(`primaryColor`, `secondaryColor`, `accentColor`). So sieht die Nutzerin
ihre Farb-Anpassungen sofort.

Auf Desktop (`lg+`) bleibt die Preview als sticky-Sidebar rechts neben
dem Formular sichtbar; auf Mobile (`<lg`) erscheint sie ganz oben.

## Persistierung

```ts
import {
  getOverride,
  setOverride,
  clearOverride,
  hasOverride,
} from "@/lib/mock-store";

const profile = getOverride("beauty-atelier"); // BusinessProfile | null
setOverride("beauty-atelier", profile);        // boolean (true = ok)
hasOverride("beauty-atelier");                  // boolean
clearOverride("beauty-atelier");                // void
```

LocalStorage-Schlüssel: `lp:business-override:v1:<slug>`. Der `v1`-
Versionsteil erlaubt zukünftige Schema-Migrationen ohne Konflikte mit
alten Browser-Caches. Ungültige Daten (Schema-Drift) werden defensiv
ignoriert – die App fällt auf das Demo-Original zurück.

## Sicherheits- & Privacy-Notes

- **Kein Backend, keine Telemetrie.** Alle Edits leben ausschließlich im
  Browser der Nutzerin. Andere Demo-Besucher:innen sehen nichts davon.
- **Keine Server-Persistierung** vor Session 19 (Supabase). Der
  Mock-Store ist explizit ein temporärer Standin.
- **Robots: noindex, nofollow** auf der Page, damit Suchmaschinen die
  Editor-URL nicht indexieren.

## Static-Export-Tauglichkeit

- Page selbst ist Server Component (`async function` mit
  `generateStaticParams` für alle 6 Slugs).
- `<BusinessEditForm>` ist `"use client"`, weil RHF + localStorage
  zwingend client-only sind. Das ist kein Problem für GitHub Pages: der
  Client-JS-Anteil wird bei Bedarf nachgeladen.
- Bundle-Größe der Edit-Page: ~66 KB First-Load JS (RHF + Resolver +
  Form-Sections). Akzeptabel für eine Editor-Seite.

## Konvention für neue Felder

1. Feld in `BusinessProfileSchema` ergänzen.
2. `profileFromBusiness` und `mergeBusinessWithProfile` erweitern, falls
   das Feld auch im Original-`Business` existiert.
3. In `<BusinessEditForm>` die passende `<FormField>` + Input/Select-
   Variante einsetzen.
4. Smoketest in `src/tests/business-edit.test.ts` ggf. um eine
   Validierungs-Assertion erweitern.

## Beziehung zu späteren Sessions

- **Session 11** – `services`-Editor: gleiches Pattern, eigene
  CRUD-Form-Komponenten.
- **Session 12** – Lead-Verwaltung mit Detail-Drawer.
- **Session 18** – Settings-Page übernimmt Slug, Veröffentlichungs-
  Status und Locale.
- **Session 19** – Supabase-Repository ersetzt den `business-overrides`-
  LocalStorage-Layer transparent. `<BusinessEditForm>` und
  `<BusinessEditPreview>` bleiben unverändert.
