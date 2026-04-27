# Produktstrategie – LocalPilot AI

Dieses Dokument fasst die Produktstrategie zusammen. Die verbindliche Quelle
bleibt `Claude.md` im Projektroot. Diese Datei wird pro Session aktualisiert.

## 1. Vision

LocalPilot AI ist ein **digitales Betriebssystem für lokale Unternehmen**.
Es soll lokale Betriebe online sichtbar, professionell und kontaktierbar machen
und ihnen wiederkehrende Marketing- und Kommunikationsaufgaben erleichtern.

Das Produkt soll:

- nicht wie ein Hobby-Projekt aussehen,
- monatlich verkaufbar sein,
- für viele Branchen funktionieren,
- ohne tiefes technisches Wissen bedienbar sein,
- mit dem Kunden mitwachsen (Bronze → Silber → Gold).

## 2. Zielgruppen

Kleine bis mittlere lokale Betriebe in DACH, u. a.:

Friseur, Barbershop, Kosmetikstudio, Nagelstudio, Autowerkstatt,
Reinigungsfirma, Handwerker, Maler, Elektriker, Heizungsbauer, Dachdecker,
Fahrschule, Nachhilfe, Personal Trainer, Fitnesscoach, Fotograf,
Immobilienmakler, Restaurant, Café, Imbiss, lokaler Shop, Hundesalon,
Physiotherapie-nahe Praxis (ohne Heilversprechen), Massagestudio, Steuerberater
(neutrale Dienstleistung), Versicherungsvermittler, Eventdienstleister,
Hochzeitsdienstleister, Garten- und Landschaftsbau u. v. m.

## 3. Kommerzieller Kern

Jede Funktion muss eine klare geschäftliche Bedeutung haben:

| Funktion              | Geschäftlicher Nutzen                             |
| --------------------- | ------------------------------------------------- |
| Website               | Professioneller Auftritt, Vertrauen               |
| Lead-Formular         | Anfragen werden geordnet gesammelt                |
| Bewertungs-Booster    | Mehr Google-Bewertungen → mehr Vertrauen          |
| Social-Media-Generator| Regelmäßige Sichtbarkeit ohne Zeitaufwand         |
| Branchen-Presets      | Schnelles Onboarding pro Kunde                    |
| Dashboard             | Kunde kann Inhalte selbst pflegen                 |
| Pakete                | Bronze/Silber/Gold sind verkaufbare Produkte      |

## 4. Pakete

### Bronze – 499 € Setup, 49 € / Monat
- 1 öffentliche Website
- Branchen-Preset, Basis-Theme
- Bis zu 10 Leistungen
- Kontaktformular, Bewertungslink
- Öffnungszeiten, Maps-Link
- KI-Texte: gesperrt oder Mock-Vorschau

### Silber – 999 € Setup, 99 € / Monat
- Alles aus Bronze
- Dashboard für Inhalte und Leads
- KI-Texte für Website und Antworten
- Bewertungs-Booster (mehrere Vorlagen)
- Social-Media-Postgenerator
- Bis zu 30 Leistungen, mehrere Themes

### Gold – 1.999 € Setup, 199 € / Monat
- Alles aus Silber
- Mehrere Landingpage-Sektionen
- Kampagnen- und Angebots-Generator
- Premium-Themes, Mehrsprachigkeit
- Bis zu 100 Leistungen, Team-Bereich
- Lead-Priorisierung, Performance-Auswertung

### Platin (optional, später) – ab 2.999 € Setup, 299–599 € / Monat
- Automationen, CRM-Anbindung
- WhatsApp-Integration, Kalenderintegration
- Performance-Reports, Premium-Betreuung

## 5. Architekturprinzipien

1. **Branchenneutralität** – Inhalte/Felder/CTAs kommen aus `IndustryPreset`-Konfigurationen.
2. **Theme-System** – Designs sind logische Konfigurationen, nicht nur CSS.
3. **Pakete als Produktlogik** – Feature-Lock-Komponenten zeigen oder sperren UI.
4. **Mock-first KI** – Funktioniert ohne API-Key, austauschbarer Provider.
5. **Mobile First** – Über 80 % der Nutzer sind mobil.
6. **Deutsch zuerst** – später mehrsprachig.
7. **Keine kaputten Zwischenstände** – jedes Session-Ergebnis ist lauffähig.
8. **Seriös, nicht buzzwordy** – keine Heilversprechen, keine erfundenen Rechtsangaben.

## 6. Akzeptanzkriterien Gesamtprojekt (Auszug)

- ≥ 10 Branchen unterstützt
- Bronze/Silber/Gold im Code als Produktlogik
- Public Site pro Betrieb
- Dashboard mit nicht-technischer Sprache
- Lead-System mit branchenspezifischem Formular
- KI-Texte (Mock-fähig, austauschbar)
- Bewertungs-Booster und Social-Media-Generator
- Mobil hervorragend, Vercel-deploybar
- Branchenneutralität bleibt jederzeit gewahrt

## 7. Risiken und Stoppregeln

- **Keine medizinischen Heilversprechen** – auch nicht durch KI generiert.
- **Keine Rechtsberatung** – Impressum/Datenschutz nur als Platzhalter mit Hinweis.
- **Keine erfundenen rechtlichen Angaben** (Steuernummern, Handelsregister o. Ä.).
- **Keine Branchen-Hartkopplung** im Core.
- **Keine Demo-Optik** – seriöses Design, keine billigen Gradients.

## 8. Status nach Session 1

- Projektgrundlage aufgesetzt (Next.js, TS, Tailwind).
- Marketing-Startseite live (Hero, Problem, Lösung, Branchen, Pakete-Teaser, Vorteile, FAQ, Kontakt-CTA).
- Doku initialisiert.
- Branchenneutralität gewahrt – keine Branche ist hartkodiert.
