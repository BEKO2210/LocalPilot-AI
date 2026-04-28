<div align="center">

# LocalPilot AI

**In 7 Tagen bekommt dein Betrieb eine moderne Website mit
Anfrageformular, Bewertungs-Booster und KI-Texten — ohne
Technikstress.**

Für Friseure, Auto-Werkstätten und Reinigungsfirmen. Lokale
Domain, eigene Inhalte, fertig zur Übergabe. Klare monatliche
Pakete, kein Lock-in.

[Demo ansehen](#demo) · [Pakete](#pakete) · [So läuft's ab](#so-läufts-ab) · [Kontakt](#kontakt)

</div>

---

## Was du bekommst

- **Eigene Website** mit deinem Logo, deinen Texten, deinem
  Theme — kein Baukasten-Look.
- **Anfrageformular** mit DSGVO-Consent, das direkt bei dir
  in der Inbox landet.
- **Bewertungs-Booster** — vorbereitete Vorlagen für Google,
  WhatsApp, SMS. 1 Klick zum Verschicken.
- **KI-Texte für Social Media** — Instagram-, Facebook- und
  WhatsApp-Posts, branchengerecht formuliert.
- **Mobile-fertig** auf jedem Gerät, WCAG-2.2-AA-konform,
  schnell genug für Google.

## So läuft's ab

| Tag    | Was passiert                                           |
| ------ | ------------------------------------------------------ |
| **0**  | 30-Min-Briefing — wir hören zu, du sammelst Texte/Fotos |
| **1**  | Setup deiner Site, Branche + Theme + Kontaktdaten       |
| **2**  | Inhalte: Hero-Text, 3–10 Leistungen, FAQ, Bewertungen   |
| **3**  | Logo + Bilder hochladen, Theme finalisieren             |
| **4**  | Anfrage- + Bewertungs-Workflow live testen              |
| **5**  | Du übst alle Editoren, wir nehmen Feedback auf          |
| **6**  | Domain, SSL, DSGVO-Texte, Impressum, Datenschutz        |
| **7**  | Live-Schaltung + Übergabe-Termin (45 Min Walkthrough)   |

Details: [`docs/SALES_PLAYBOOK.md`](./docs/SALES_PLAYBOOK.md).

## Pakete

| Paket   | Setup     | Monatlich | Was du bekommst                                      |
| ------- | --------- | --------- | ---------------------------------------------------- |
| Bronze  | 499 €     | 49 €      | Website + Anfrageformular + Theme + Hosting          |
| Silber  | 999 €     | 99 €      | Bronze + KI-Texte + Dashboard + Bewertungs-Booster   |
| Gold    | 1.999 €   | 199 €     | Silber + Social-Media-Generator + Domain + Premium-Themes |

Klare Bedingungen, kein Lock-in: monatliche Kündigung, Daten-
Export auf Knopfdruck (DSGVO Art. 20).

[Pakete im Detail](https://localpilot.ai/pricing) ·
[Funktionsvergleich](./docs/PRICING.md)

## Demo

Sechs voll funktionsfähige Demo-Sites zum Anklicken:

- Studio Haarlinie (Friseur)
- Autoservice Müller (Werkstatt)
- Glanzwerk Reinigung
- Beauty Atelier
- Meisterbau Schneider (Handwerk)
- Fahrschule Stadtmitte

Alle Demos laufen ohne Login mit Beispieldaten. Daten und
Kontakte sind fiktiv.

[Demo-Galerie öffnen](https://localpilot.ai/demo)

## Kontakt

> **Hinweis (Phase 3 in Arbeit):** Aktuell laufen die ersten
> Pilotkunden-Onboardings. Bis Session 100 ist eine echte
> Kontakt-Inbox aktiv. Aktuell bitte über GitHub-Issue oder
> direkt an den Auftraggeber.

---

<details>
<summary><strong>📚 Für Entwickler / interne Doku</strong></summary>

### Tech-Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript strict**
- **Tailwind CSS 3** mit Theme-Tokens via CSS-Variablen
- **Zod 3** als Single Source of Truth (Typen via `z.infer`)
- **Supabase** (Auth + Postgres + Storage) mit RLS auf jeder Tabelle
- **AI-Provider** Mock (Default) + OpenAI / Anthropic / Gemini
- **Playwright** für E2E (58 Tests × 2 Browser = 116 grün)

### Quickstart

```bash
git clone https://github.com/BEKO2210/LocalPilot-AI.git
cd LocalPilot-AI
npm install
cp .env.example .env.local       # darf erstmal leer bleiben
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

Ohne API-Key läuft die App im Mock-Modus. Alle 7 AI-Methoden
liefern deterministische Beispieltexte.

### Skripte

| Befehl                  | Zweck                                       |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Lokaler Dev-Server                          |
| `npm run build`         | Production-Build (SSR, Vercel)              |
| `npm run build:static`  | Static-Export `out/` (GitHub Pages)         |
| `npm run lint`          | ESLint                                      |
| `npm run typecheck`     | `tsc --noEmit`                              |
| `npm run audit:themes`  | WCAG-Contrast-Audit aller 10 Themes         |
| `npm run test:e2e`      | Playwright-E2E (alle 116 Tests)             |
| `npx tsx src/tests/<file>.test.ts` | Smoketest direkt ausführen       |

### Architektur

- `src/app/` — Next.js App Router (Pages, Routes, API-Handler)
- `src/components/` — UI-Primitive, Layout, Public-Site, Dashboard, Editoren, Brand
- `src/core/` — Validation (Zod), Pricing, Industries (13 Presets), Themes (10), AI-Provider
- `src/data/` — Mock-Datasets (6 Demo-Betriebe)
- `src/lib/` — Helpers (CSRF, Sanitize, Storage-Cleanup, Lead-Retry-Queue)
- `e2e/` — Playwright-Test-Suite

Vollständige Architektur: [`docs/TECHNICAL_NOTES.md`](./docs/TECHNICAL_NOTES.md).

### Programm-Methodik

Entwicklung läuft in atomaren Code-Sessions (30–60 Min, 30–80 KB
Diff, 4–10 Files) mit fester Methodik. Aktueller Stand:
**Phase 3 (Sessions 85–100) → Verkaufsreife** — bei Session 100
ist alles übergabefähig.

- [`docs/PROGRAM_PLAN.md`](./docs/PROGRAM_PLAN.md) — Roadmap
- [`docs/SESSION_PROTOCOL.md`](./docs/SESSION_PROTOCOL.md) — Session-Ablauf
- [`docs/RUN_LOG.md`](./docs/RUN_LOG.md) — chronologisches Log
- [`CHANGELOG.md`](./CHANGELOG.md) — Versionshistorie
- [`Claude.md`](./Claude.md) — Master-Briefing
- [`codex.md`](./codex.md) · [`docs/CODEX_BACKLOG.md`](./docs/CODEX_BACKLOG.md) — Codex-Junior-Tasks

### Produkt-Doku

- [`docs/SALES_PLAYBOOK.md`](./docs/SALES_PLAYBOOK.md) — Verkaufs- und Onboarding-Playbook (Phase 3)
- [`docs/PRODUCT_STATUS.md`](./docs/PRODUCT_STATUS.md) — was das Produkt JETZT kann
- [`docs/PRICING.md`](./docs/PRICING.md) — Pricing-System + Helper-API
- [`docs/INDUSTRY_PRESETS.md`](./docs/INDUSTRY_PRESETS.md) — Branchen-Presets
- [`docs/THEMES.md`](./docs/THEMES.md) — Theme-System
- [`docs/BRAND.md`](./docs/BRAND.md) — Brand-Mark + Wordmark
- [`docs/PUBLIC_SITE.md`](./docs/PUBLIC_SITE.md) — Public-Site-Generator
- [`docs/DASHBOARD.md`](./docs/DASHBOARD.md) — Dashboard
- [`docs/BUSINESS_EDITOR.md`](./docs/BUSINESS_EDITOR.md) · [`docs/SERVICES_EDITOR.md`](./docs/SERVICES_EDITOR.md)
- [`docs/LEAD_SYSTEM.md`](./docs/LEAD_SYSTEM.md)
- [`docs/AI.md`](./docs/AI.md) · [`docs/STORAGE.md`](./docs/STORAGE.md)
- [`docs/SUPABASE_SCHEMA.md`](./docs/SUPABASE_SCHEMA.md)
- [`docs/TESTING.md`](./docs/TESTING.md) — Smoketests + E2E
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — Vercel + GitHub Pages
- [`docs/DOMAIN_SETUP.md`](./docs/DOMAIN_SETUP.md) — Production-Domain + Email-Postfach (Phase 3)
- [`docs/RESEARCH_INDEX.md`](./docs/RESEARCH_INDEX.md) — Quellen-Bibliothek

### Deployment

Zwei Pipelines parallel:

- **GitHub Pages** — Static-Showcase (`STATIC_EXPORT=true`).
  Demo-Sites laufen ohne Backend.
- **Vercel** — SSR + alle `/api/*`-Routen (Auth, AI-Generate, Health).
  Production-Domain.

Anleitung: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

### Lizenz

Proprietär — alle Rechte vorbehalten. White-Label-/Reseller-
Anfragen direkt an den Auftraggeber.

</details>
