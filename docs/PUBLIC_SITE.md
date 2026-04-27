# Public Site Generator – LocalPilot AI

Jeder Demo-Betrieb bekommt automatisch eine eigene öffentliche Website unter
`/site/[slug]`. Die Inhalte werden zur Build-Zeit aus drei Quellen
kombiniert – kein Server, kein Client-JS für die Anzeige nötig.

## Live

- Lokal: `http://localhost:3000/site/<slug>`
- Pages: `https://beko2210.github.io/LocalPilot-AI/site/<slug>/`

Aktuelle Slugs:

- `studio-haarlinie` – Friseur, Theme **warm_local**
- `autoservice-mueller` – Werkstatt, Theme **automotive_strong**
- `glanzwerk-reinigung` – Reinigung, Theme **medical_clean**
- `beauty-atelier` – Kosmetik, Theme **beauty_luxury**
- `meisterbau-schneider` – Handwerk, Theme **craftsman_solid**
- `fahrschule-stadtmitte` – Fahrschule, Theme **education_calm**

Auf `/demo` sind alle als Karten verlinkt.

## Architektur

```
src/app/site/[slug]/
  page.tsx          generateStaticParams + generateMetadata + Section-Assembly
  not-found.tsx     404 für unbekannte Slugs (mit Link zur Demo-Übersicht)

src/components/public-site/
  public-section.tsx          Theme-aware Sektion (lp-theme-section)
  public-site-header.tsx      Sticky-Header mit Initial-Logo + Anrufen/Anfragen
  public-site-footer.tsx      Adresse, Impressum-/Datenschutz-Platzhalter, Powered-by
  public-mobile-cta-bar.tsx   Sticky Mobile-Bar (Anrufen / WhatsApp / Anfrage)
  public-hero.tsx             Hero mit Tagline + Hero-Title + Default-CTAs
  public-services.tsx         Leistungs-Grid, sortiert nach sortOrder
  public-benefits.tsx         Vorteile (aus Preset)
  public-process.tsx          Ablauf-Schritte (aus Preset)
  public-reviews.tsx          Bewertungen + Sternezeile + Schnitt
  public-faq.tsx              FAQs (Business)
  public-team.tsx             Team-Mitglieder (nur wenn vorhanden)
  public-opening-hours.tsx    Öffnungszeiten als Tabelle
  public-location.tsx         Adresse + Maps-Link
  public-contact.tsx          Direktkontakt-Karte + Anfrageformular-Vorschau

src/lib/contact-links.ts      tel:/wa.me/mailto-Helfer (E.164-Normalisierung)
```

## Datenfluss

```
slug ─► getMockBusinessBySlug(slug) ─► Business
                                       │
                                       ├─► industryKey ─► getPresetOrFallback() ─► IndustryPreset
                                       ├─► themeKey    ─► getThemeOrFallback()   ─► Theme
                                       └─► id          ─► averageRatingByBusiness ─► Number

ThemeProvider(theme) ──► CSS-Variablen auf Wrapper
        │
        └─► Sections rendern mit `bg-theme-*`, `rounded-theme-*`, `shadow-theme`
```

Reihenfolge der Sektionen kommt aus `preset.recommendedSections`. Die Page
nutzt eine kanonische Standardreihenfolge und filtert sie gegen die
Empfehlung des Presets, sodass Branchen ohne `team` oder `process`
diese Sektionen einfach weglassen.

## Static-Export-Kompatibilität

```ts
export function generateStaticParams() {
  return listMockBusinessSlugs().map((slug) => ({ slug }));
}
```

Damit erzeugt `npm run build:static` jede Slug-Seite einmal vor – der
GitHub-Pages-Workflow braucht keinen Server und kann sie sofort als HTML
ausliefern. Der `npm run build`-Output zeigt z. B.:

```
├ ● /site/[slug]                           161 B         106 kB
├   ├ /site/studio-haarlinie
├   ├ /site/autoservice-mueller
├   └ ...
```

## SEO pro Betrieb

`generateMetadata` erzeugt pro Slug einen passenden Title, eine
Description und Open-Graph-Defaults aus dem Business-Datensatz. Beispiel:

```
title       Studio Haarlinie – Friseur in Musterstadt
description Wir machen unkomplizierte, hochwertige Haarschnitte und Farben…
canonical   /site/studio-haarlinie/
og.locale   de_DE
robots      index, follow
```

Keine Branche oder Stadt ist hartkodiert – alles kommt aus den Daten.

## Mobile-First

- **Sticky Header** mit Anrufen-Button (≥ sm) und Anfragen-Button (immer).
- **Mobile-CTA-Bar** ist `fixed bottom-0`, blendet sich erst ab `md`-Breite
  aus. Drei Buttons: Anrufen, WhatsApp, Anfrage – jeder nur sichtbar, wenn
  der Betrieb die Daten hat.
- **`pb-24 md:pb-0`** auf `<main>` reserviert Platz für die Bar auf Mobile,
  sonst überdeckt sie den Footer.

## Theme-Anwendung

Die ganze Seite ist in `<ThemeProvider theme={...}>` gewrappt. Innerhalb der
Sektionen wird konsequent über CSS-Variablen styled:

```tsx
<div
  className="rounded-theme-card border shadow-theme"
  style={{
    borderColor: "rgb(var(--theme-border))",
    backgroundColor: "rgb(var(--theme-background))",
    color: "rgb(var(--theme-foreground))",
  }}
/>
```

Tailwind-Utilities wie `bg-theme-primary`, `rounded-theme-button` und
`shadow-theme` greifen automatisch zu. Jede Public Site sieht damit
spürbar unterschiedlich aus, ohne dass eine einzelne Branche im Code
auftaucht.

## Branchenneutralität

Keine `if (industryKey === "hairdresser")`-Verzweigung im Komponenten-Code.
Branchen-Texte kommen ausschließlich aus dem `IndustryPreset`. Wer eine
neue Branche hinzufügt, ergänzt das Preset und ggf. einen Demo-Betrieb –
die Public Site funktioniert sofort.

## Direktkontakt

`src/lib/contact-links.ts` liefert E.164-normalisierte Helfer:

```ts
telLink("+49 30 9000 1240")               // "tel:+493090001240"
whatsappLink("+49 30 9000 1240")          // "https://wa.me/493090001240"
whatsappLink("…", "Hallo")                 // "...?text=Hallo"
mailtoLink("kontakt@example.org", "Termin") // "mailto:...?subject=Termin"
formatPhoneDisplay(" +49 30 9000 1240 ")   // "+49 30 9000 1240"
```

Alle Public-Site-CTAs nutzen diese Helfer, damit Smartphones korrekt das
Wahl- bzw. Chat-UI öffnen.

## Anfrageformular (Status)

Aktuell ist das Formular eine **Vorschau**: Felder kommen aus
`preset.leadFormFields`, sind aber `disabled`. Eine Hinweis-Box verlinkt
auf die direkten Kontaktwege.

Session 12 ersetzt die Vorschau durch ein echtes, validierendes Formular
mit Server Action, das Leads speichert.

## 404 und unbekannte Slugs

`/site/<unknown>` zeigt eine eigene 404-Seite (`not-found.tsx`) im
Marketing-Layout – mit Links zur Demo-Übersicht und zur Startseite. Auf
GitHub Pages funktioniert das automatisch über die `404.html`, die der
Static Export generiert.

## Test & Qualität

- `src/tests/public-site.test.ts` validiert die Kontakt-Link-Helfer
  und die Slug-Konsistenz und stellt sicher, dass jeder Betrieb
  Telefon ODER WhatsApp hat (sonst hätte die Mobile-CTA-Bar nichts zu
  rendern).
- `npm run build:static` prerendered alle Slugs und scheitert sofort,
  falls eine Sektion einen Pflichtwert vermisst.
- Live-Smoketest mit `curl`:
  ```bash
  for slug in studio-haarlinie autoservice-mueller glanzwerk-reinigung beauty-atelier meisterbau-schneider fahrschule-stadtmitte; do
    curl -s -o /dev/null -w "%{http_code} /site/$slug\n" "http://localhost:3000/site/$slug"
  done
  ```

## Erweiterung

Eine neue Sektion hinzufügen:

1. Neue Komponente unter `src/components/public-site/` anlegen, mit
   `<PublicSection>` als Wrapper.
2. Im Barrel `index.ts` exportieren.
3. In `src/app/site/[slug]/page.tsx` die switch-Anweisung um den neuen Key
   erweitern.
4. `RECOMMENDED_SECTIONS` in `src/types/common.ts` ergänzen, falls der
   Key neu ist – Presets verwenden dann `recommendedSections: ["...", "neu"]`.

Eine neue Branche hinzufügen: kein Eingriff in Public-Site-Code nötig.
Nur Preset (Session 4) und ggf. Demo-Betrieb (Session 6).

## Beziehung zu späteren Sessions

- **Session 8** – Marketing-Erweiterungen (z. B. /demo-Übersicht ausbauen).
- **Session 9+** – Dashboard zeigt eine Vorschau-URL pro Betrieb auf die
  Public Site.
- **Session 12** – ersetzt die Formular-Vorschau in `<PublicContact>`
  durch eine echte Lead-Erfassung (Server Action oder API-Route).
- **Session 13–17** – KI-Texte können den Hero-Title oder die
  Service-Beschreibungen verbessern; sie ersetzen nicht die Sektion,
  sondern füttern sie.
- **Session 19** – Repository-Layer; `getMockBusinessBySlug` wird zu einer
  Funktion, die Mock oder Supabase-Repo befragt – Public Site bleibt gleich.
