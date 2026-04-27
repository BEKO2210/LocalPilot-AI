# LocalPilot AI

**Universelles KI-Website-, Lead- und Automationssystem für lokale Betriebe.**

LocalPilot AI ist ein White-Label-fähiges Micro-SaaS-Produkt: ein Core-System,
viele Branchen-Presets, mehrere Themes und drei Paketstufen (Bronze, Silber, Gold).
Es richtet sich an kleine und mittlere lokale Betriebe – vom Friseur über die
Autowerkstatt bis zur Reinigungsfirma – und ist im Kern bewusst branchenneutral.

> Sprache: Deutsch zuerst, später mehrsprachig.
> Zielmarkt: kleine bis mittlere lokale Betriebe in DACH.

---

## Was kann das System (Zielbild)

- Moderne, mobil starke Website pro Betrieb (`/site/[slug]`)
- Dashboard für Inhalte, Leistungen, Leads, Bewertungen, Social Media
- KI-Texte mit austauschbarem Provider (Mock, OpenAI, Anthropic, Gemini)
- Bewertungs-Booster (WhatsApp/SMS/E-Mail-Vorlagen)
- Social-Media-Generator (Instagram, Facebook, Google Business)
- Lead-Verwaltung mit branchenspezifischen Formularfeldern
- Bronze/Silber/Gold-Pakete als echte Produktlogik (Feature-Locks im UI)
- Branchen-Presets (Friseur, Werkstatt, Reinigung, Kosmetik, Handwerk, Fahrschule, Fitness, Foto, Restaurant, Shop, …)

Aktueller Stand: **Session 1** – Projektgrundlage, Architektur, Marketing-Startseite.
Weitere Funktionen folgen in den Sessions 2–22 (siehe `Claude.md` und `docs/RUN_LOG.md`).

---

## Tech-Stack

- **Next.js 15** mit App Router
- **TypeScript** im strict-Mode
- **Tailwind CSS** für das Styling
- **Lucide Icons**
- Spätere Erweiterung: Supabase (Auth, DB, Storage), Zod, React Hook Form, AI-Provider-Adapter
- Deployment-Ziel: **Vercel**

---

## Lokale Einrichtung

Voraussetzungen:

- Node.js **20.x oder 22.x**
- npm 10+

```bash
# Repo geklont? Dann:
npm install
cp .env.example .env.local   # Werte können erstmal leer bleiben
npm run dev
```

Der Dev-Server läuft anschließend unter [http://localhost:3000](http://localhost:3000).

### Wichtige Skripte

| Befehl              | Zweck                                              |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Lokaler Dev-Server (Hot Reload).                   |
| `npm run build`     | Production-Build.                                  |
| `npm run start`     | Production-Build starten.                          |
| `npm run lint`      | ESLint (Next.js + TypeScript Regeln).              |
| `npm run typecheck` | TypeScript-Typenprüfung ohne Emit.                 |

### Ohne API-Key starten

LocalPilot AI ist **mock-first**: Ohne API-Key läuft das System automatisch im
Mock-Modus. KI-Provider (OpenAI, Anthropic, Gemini) sind über `AI_PROVIDER` in
`.env.local` umschaltbar (siehe `.env.example`). Der eigentliche Provider-Code
folgt ab Session 13.

---

## Projektstruktur

```
src/
  app/                 Next.js App Router (Layouts, Routen)
    page.tsx           Marketing-Landingpage
    layout.tsx         Root-Layout (Metadata, globale Styles)
    globals.css        Tailwind + Basis-Styles
    marketing/         spätere Marketing-Unterseiten
    demo/              Demo-Betriebe (Session 6+)
    dashboard/         Adminbereich (Session 9+)
    site/[slug]/       öffentliche Betriebs-Websites (Session 7+)
    api/               Route Handler (Session 12+)
  components/
    layout/            Header, Footer, Navigation
    marketing/         Sektionen der Landingpage
    ui/                wiederverwendbare Primitive (Button, Container, Section)
    public-site/       Sektionen der öffentlichen Betriebs-Websites (Session 7+)
    dashboard/         Dashboard-Bausteine (Session 9+)
    forms/, pricing/, industry/, ai/, leads/, reviews/, social/, theme/  → folgen
  core/
    pricing/           PricingTier-Konfiguration (Session 3+)
    industries/        Branchen-Presets (Session 4+)
    themes/            Theme-Registry (Session 5+)
    ai/                Provider-Interface, Prompts (Session 13+)
    leads/, reviews/, social/, validation/, utils/  → folgen
  data/                Mock-Daten (Session 6+)
  lib/                 cn(), Supabase-Client, Storage-Helper
  types/               TypeScript-Modelle (Session 2+)
  tests/               Unit-Tests (Vitest später)
docs/
  PRODUCT_STRATEGY.md
  TECHNICAL_NOTES.md
  RUN_LOG.md
  (INDUSTRY_PRESETS.md, PRICING.md, DEPLOYMENT.md, SALES.md, … folgen)
```

Branchenspezifisches gehört **nie** in den Core, sondern in Presets / Konfigurationen / Templates.

---

## Branchenneutralität (Grundprinzip)

LocalPilot AI darf nie auf eine Branche hartcodiert sein:

- Inhalte, Felder, CTAs und Tonalität kommen aus `IndustryPreset`-Konfigurationen.
- Designs kommen aus dem Theme-System.
- Pakete steuern verfügbare Funktionen.
- Eine neue Branche muss in unter 30 Minuten ergänzbar sein.

---

## Pakete (Bronze · Silber · Gold)

Die Pakete sind **Produktlogik**, kein reiner Marketing-Text. Im Code werden
sie ab Session 3 als `PricingTier`-Konfiguration mit Feature-Limits eingebaut.

| Paket    | Setup     | Monatlich | Zielgruppe                                     |
| -------- | --------- | --------- | ---------------------------------------------- |
| Bronze   | 499 €     | 49 €      | Kleinbetrieb, schnelle digitale Präsenz        |
| Silber   | 999 €     | 99 €      | KI-Texte, Dashboard, Lead- & Bewertungssystem  |
| Gold     | 1.999 €   | 199 €     | Vollständiges lokales Marketing-System         |
| Platin*  | ab 2.999 €| 299–599 € | Automationen, CRM, WhatsApp – optional, später |

\* Platin ist optional und wird später ergänzt.

Details folgen in `docs/PRICING.md` (Session 3).

---

## Dokumentation

- [`Claude.md`](./Claude.md) – Master-Briefing (Single Source of Truth)
- [`docs/PRODUCT_STRATEGY.md`](./docs/PRODUCT_STRATEGY.md) – Vision, Zielgruppen, Pakete, Akzeptanz
- [`docs/TECHNICAL_NOTES.md`](./docs/TECHNICAL_NOTES.md) – Architektur, Konventionen, Stack
- [`docs/RUN_LOG.md`](./docs/RUN_LOG.md) – Was wurde in welcher Session gebaut?
- [`CHANGELOG.md`](./CHANGELOG.md) – Versionshistorie

---

## Status (nach Session 1)

- ✅ Projekt läuft mit `npm run dev` lokal
- ✅ Marketing-Startseite mit Hero, Problem, Lösung, Branchen, Pakete, Vorteile, FAQ, Kontakt-CTA
- ✅ Branchenneutrales Layout, Mobile First, deutsche Sprache
- ✅ Ordnerstruktur und Doku vorbereitet
- ⏳ Datenmodelle, Pricing-Logik, Branchen-Presets, Themes, Dashboard, Public Sites, KI-System – folgen in Sessions 2 bis 22
