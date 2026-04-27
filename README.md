<div align="center">

# LocalPilot AI

**Universelles KI-Website-, Lead- und Automationssystem für lokale Betriebe.**

White-Label-fähiges Micro-SaaS — ein Core-System, viele Branchen-Presets,
mehrere Themes, drei Paketstufen. Vom Friseur über die Autowerkstatt bis
zur Reinigungsfirma. Sprache: Deutsch zuerst.

[![Status](https://img.shields.io/badge/Status-In%20Active%20Development-2da44e?style=flat-square)](./docs/PROGRAM_PLAN.md)
[![Methodology](https://img.shields.io/badge/Methodology-Rolling%20Milestones-1f6feb?style=flat-square)](./docs/SESSION_PROTOCOL.md)
[![No Endpoint](https://img.shields.io/badge/Endpoint-None%20%E2%99%BE%EF%B8%8F-7d57c1?style=flat-square)](./docs/PROGRAM_PLAN.md)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript)](./tsconfig.json)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](./tailwind.config.ts)
[![Zod](https://img.shields.io/badge/Validation-Zod-2c3e50?style=flat-square)](./src/core/validation)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey?style=flat-square)](#lizenz)
[![Made for](https://img.shields.io/badge/Built%20for-Local%20Businesses-ff8a65?style=flat-square)](#was-kann-das-system-zielbild)

</div>

---

## ♾️ Programm-Konzept (warum es kein „fertig" gibt)

LocalPilot AI ist **kein Projekt mit Endpunkt**, sondern ein **dauerhaftes
Programm** mit rollenden Meilensteinen. Statt einer fixen „22 Sessions, dann
fertig"-Sicht läuft die Entwicklung in atomaren Code-Sessions, die jede für
sich klein, deploybar und nach 30–60 min verprobt sind.

> 📜 **Verbindliche Methodik**: jede Session beinhaltet einen Recherche-Step
> (WebSearch nach 2026-Patterns), Verifikation (typecheck/lint/build/smoketest)
> und eine Selbst-Erweiterung der Roadmap.
>
> Details: [`docs/SESSION_PROTOCOL.md`](./docs/SESSION_PROTOCOL.md) ·
> [`docs/PROGRAM_PLAN.md`](./docs/PROGRAM_PLAN.md) ·
> [`Claude.md`](./Claude.md)

### Diese README pflegt sich (fast) selbst

Die README-Inhalte sind **stand-unabhängig** — sie nennen keine konkrete
Session-Nummer, sondern Meilensteine, Tracks und Prinzipien. Konkret heißt
das:

- **Rolling Counter**: alle 20 Code-Sessions wird die Top-Zusammenfassung
  unten neu zusammengesetzt (20 → 40 → 60 …) — sie zeigt nur die jeweils
  aktiven Meilensteine + die nächsten 3 Backlog-Highlights.
- **Tagesaktuelle Details**: gehören in [`CHANGELOG.md`](./CHANGELOG.md) und
  [`docs/RUN_LOG.md`](./docs/RUN_LOG.md). Die README verweist nur darauf.
- **Backlog**: [`docs/PROGRAM_PLAN.md`](./docs/PROGRAM_PLAN.md) wächst
  automatisch mit jeder Session — die README muss dafür nicht angepasst
  werden.

---

## 🧭 Aktueller Status (rollend)

| Meilenstein                       | Status         | Erfolgskriterium (kurz)                                     |
| --------------------------------- | -------------- | ----------------------------------------------------------- |
| **1 — Foundation**                | ✅ stabil      | Demo-fähiges Produkt, statisch deploybar, 6 Demo-Betriebe   |
| **2 — KI-Schicht**                | ✅ scharf      | 7 AI-Methoden mit Mock + 3 Live-Providern (OpenAI, Anthropic, Gemini) |
| **3 — Engagement & Wachstum**     | ⏳ vorbereitet | Bewertungs-/Social-/Kampagnen-Tools ohne externes Tool      |
| **4 — Backend & Daten**           | 🔄 aktiv       | Echte DB, Multi-Tenant, Auth, Storage — Read-/Write-/Upload-Pfade live |
| **5 — Production-Readiness**      | ⏳ teilweise   | Vercel-Deploy ✅, DSGVO-Lead-Consent ✅, Sentry/Lighthouse offen |
| **6 — Vertikalisierung & Sales**  | ⏳ geplant     | „Onboarding < 60 min" mehrfach erprobt                      |
| **7 — Innovation Loop ♾️**        | ♾️ permanent   | Quartals-Schleifen: neue Modelle, Plattform-Features        |

**Aktive Phase**: Backend-Sprint läuft. Postgres-Schema komplett (8
Migrationen, RLS auf jeder Tabelle), Magic-Link-Auth via `@supabase/ssr`,
Onboarding-Flow, Image-Storage mit Bucket-Policy, BusinessEditForm +
Settings-Page (Slug-Wechsel + Publish-Toggle) schreiben in DB. Pages-
Schicht ist vollständig Repository-only — Mock vs. Supabase wird über
`LP_DATA_SOURCE`-ENV geschaltet, ohne Code-Änderung.

> Live-Stand: [`docs/RUN_LOG.md`](./docs/RUN_LOG.md) ·
> Versionshistorie: [`CHANGELOG.md`](./CHANGELOG.md) ·
> Schema-Doku: [`docs/SUPABASE_SCHEMA.md`](./docs/SUPABASE_SCHEMA.md)

---

## 🚀 Quickstart

```bash
git clone https://github.com/BEKO2210/LocalPilot-AI.git
cd LocalPilot-AI
npm install
cp .env.example .env.local       # darf erstmal leer bleiben
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

**Ohne API-Key**: Die App läuft im Mock-Modus. Alle 7 AI-Methoden liefern
deterministische Beispieltexte — kein externes Konto, kein Cent Verbrauch.
Provider werden über `AI_PROVIDER` in `.env.local` umgeschaltet (siehe
[`.env.example`](./.env.example)).

### Skripte

| Befehl                | Zweck                                                      |
| --------------------- | ---------------------------------------------------------- |
| `npm run dev`         | Lokaler Dev-Server mit Hot Reload                          |
| `npm run build`       | Production-Build (SSR, für Vercel)                         |
| `npm run build:static`| Static-Export nach `out/` (für GitHub Pages)               |
| `npm run start`       | Production-Build starten                                   |
| `npm run lint`        | ESLint (Next.js + TypeScript Regeln)                       |
| `npm run typecheck`   | `tsc --noEmit`                                             |
| `npx tsx src/tests/<file>.test.ts` | Smoketest direkt ausführen                    |

---

## 🛠️ Tech-Stack

- **Next.js 15** mit App Router · React 19
- **TypeScript** strict (`noUncheckedIndexedAccess`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`)
- **Tailwind CSS 3** mit Theme-Tokens via CSS-Variablen
- **Zod 3** als Single Source of Truth für Datenmodelle
  (Typen via `z.infer`, kein Drift möglich)
- **React Hook Form** + `zodResolver` für Formulare
- **Lucide Icons** für UI-Glyphen
- **AI-Provider live**: `openai@^5`, `@anthropic-ai/sdk@^0.62`,
  `@google/genai@^1` — alle 7 Methoden via Adapter-Pattern (Mock
  als Fallback). HMAC-Cookie-Auth via `node:crypto` (kein externes
  Lib). DOMPurify-äquivalenter Sanitizer ohne externe Lib.
- **Backend**: `@supabase/supabase-js@^2` für REST/Auth/Storage,
  `@supabase/ssr@^0.10` für Cookie-Sessions in Next.js 15 SSR.
  Postgres-Schema als versionierte SQL-Migrationen, RLS auf
  jeder Tabelle.
- **Mock-first-Garantie**: jede Capability (KI, Auth, DB-Read,
  Storage) hat einen Mock-/localStorage-Fallback. Die App läuft
  vollständig ohne API-Key, ohne Backend und ohne Tracking — der
  GitHub-Pages-Demo-Build ist dafür der Beweis.
- Deployment-Ziele: **GitHub Pages** (Static Export) +
  **Vercel** (SSR + alle `/api/*`-Routen)

---

## 🌍 Branchenneutralität (Grundprinzip)

LocalPilot AI darf **nie** auf eine Branche hartcodiert sein:

- **Inhalte** (CTAs, Tonalität, Bilder, Felder) kommen aus
  `IndustryPreset`-Konfigurationen — aktuell 13 Presets,
  Roadmap-Ziel: 20+.
- **Designs** kommen aus dem Theme-System (10 Themes,
  CSS-Variablen-basiert).
- **Pakete** (Bronze · Silber · Gold) steuern verfügbare Funktionen
  via Code-Locks (`<FeatureLock>`, `requiredTierFor`).
- Eine neue Branche muss in **unter 30 Minuten** ergänzbar sein.

---

## 📦 Projektstruktur (Auszug)

```
src/
  app/                  Next.js App Router (Layouts, Routen, API-Handler)
  components/           UI-Primitive, Layout, Marketing, Public Site,
                        Dashboard, Pricing, Theme, …
  core/
    validation/         Zod-Schemas (Single Source of Truth)
    pricing/            PricingTier-Konfig + Feature-Locks
    industries/         13 Branchen-Presets + Registry + Fallback
    themes/             10 Themes + Resolver
    ai/                 Provider-Adapter (Mock + 3 Live-Stubs)
                          providers/mock/  → 7 Methoden, deterministisch
  data/                 Mock-Datasets (6 Demo-Betriebe)
  lib/                  cn(), Mock-Store, Helpers
  types/                TS-Typen (alle aus Zod via z.infer)
  tests/                Smoketests (tsx-runnable)
docs/                   PROGRAM_PLAN, SESSION_PROTOCOL, RUN_LOG, …
Claude.md               Master-Briefing (verbindlich, Programm-Philosophie)
codex.md                Verhaltenskodex für Codex-Junior-Tasks
```

Volldetails: [`docs/TECHNICAL_NOTES.md`](./docs/TECHNICAL_NOTES.md)

---

## 💶 Pakete (Bronze · Silber · Gold)

Pakete sind **Produktlogik**, nicht nur Marketing-Text. Sie steuern
verfügbare Funktionen über Code-Locks.

| Paket    | Setup     | Monatlich | Zielgruppe                                     |
| -------- | --------- | --------- | ---------------------------------------------- |
| Bronze   | 499 €     | 49 €      | Kleinbetrieb, schnelle digitale Präsenz        |
| Silber   | 999 €     | 99 €      | KI-Texte, Dashboard, Lead- & Bewertungssystem  |
| Gold     | 1.999 €   | 199 €     | Vollständiges lokales Marketing-System         |

```ts
import { hasFeature, isFeatureLocked, getTierLimits } from "@/core/pricing";

hasFeature(business.packageTier, "ai_website_text");          // boolean
isFeatureLocked(business.packageTier, "ai_campaign_generator");// boolean
getTierLimits(business.packageTier).maxServices;              // number
```

Im UI: `<PricingGrid>`, `<FeatureLock>`, `<UpgradeHint>`.
Details: [`docs/PRICING.md`](./docs/PRICING.md).

---

## 🤝 Mitwirkende & Verantwortlichkeiten

| Rolle               | Werkzeug              | Was wird beigesteuert                                          |
| ------------------- | --------------------- | -------------------------------------------------------------- |
| **Claude Code**     | Diese Konversation    | Feature-Sessions, Methodik, KI-Schicht, Architektur            |
| **Codex (Junior)**  | OpenAI Codex / ChatGPT| Niedrig-Risiko-Polish unter strikten Boundaries — siehe [`codex.md`](./codex.md) |
| **Auftraggeber**    | Manuell               | Richtungsentscheidungen, Domain-Wissen, GTM                    |

Die Boundaries für Codex sind hart definiert: kein Anfassen von Schemas,
Provider-Code, Dependencies oder Methodik-Dokumenten. Erlaubte Tasks
stehen in [`docs/CODEX_BACKLOG.md`](./docs/CODEX_BACKLOG.md), das Log in
[`docs/CODEX_LOG.md`](./docs/CODEX_LOG.md).

---

## 🌐 Live-Preview / Deployment

LocalPilot AI deployt auf **zwei Pipelines parallel**:

| Pipeline | Was                                                | URL-Pattern                                  |
| -------- | -------------------------------------------------- | -------------------------------------------- |
| **GitHub Pages** | Statische Routen (Marketing, Public-Site, Dashboard-UI im Mock-Modus) | `https://beko2210.github.io/LocalPilot-AI/` |
| **Vercel**       | SSR + alle `/api/*`-Routen (Auth, AI-Generate, Health) | (eingerichtet via `vercel link`)            |

Pages liefert den schnellen, kostenlosen Showcase. Vercel kommt für
alles, was einen Server braucht: Login-Cookies, KI-Live-Calls,
Cost-Tracking, Rate-Limits.

Beide Pipelines bauen aus **demselben** Code — die einzige Weiche ist
die ENV `STATIC_EXPORT=true` (im Pages-Workflow gesetzt, auf Vercel
nicht). Alle API-Routen werden im Static-Export über
`pageExtensions`-Filter ausgeschlossen.

Vollständige Anleitung (Setup-Befehle, ENV-Variablen, Smoke-Tests,
Roll-back): [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).
Pflicht-ENV-Vorlage: [`.env.production.example`](./.env.production.example).

---

## 📚 Dokumentation

**Methodik & Programm**

- [`Claude.md`](./Claude.md) — Master-Briefing, Programm-Philosophie
- [`docs/PROGRAM_PLAN.md`](./docs/PROGRAM_PLAN.md) — Rolling Milestones,
  selbst-erweiternder Backlog
- [`docs/SESSION_PROTOCOL.md`](./docs/SESSION_PROTOCOL.md) — verbindlicher
  Ablauf jeder Code-Session
- [`docs/RUN_LOG.md`](./docs/RUN_LOG.md) — chronologisches Tagebuch jeder
  Session inkl. Recherche-Quellen
- [`CHANGELOG.md`](./CHANGELOG.md) — Versionshistorie
- [`codex.md`](./codex.md) — Verhaltenskodex für Codex-Junior-Tasks
- [`docs/CODEX_BACKLOG.md`](./docs/CODEX_BACKLOG.md) — vorab freigegebene
  Codex-Aufgaben
- [`docs/CODEX_LOG.md`](./docs/CODEX_LOG.md) — was Codex zwischendurch
  erledigt hat

**Produkt & Architektur**

- [`docs/PRODUCT_STRATEGY.md`](./docs/PRODUCT_STRATEGY.md) — Vision,
  Zielgruppen, Pakete, Akzeptanz
- [`docs/TECHNICAL_NOTES.md`](./docs/TECHNICAL_NOTES.md) — Architektur,
  Konventionen, Stack
- [`docs/PRICING.md`](./docs/PRICING.md) — Pricing-System, Helper-API
- [`docs/INDUSTRY_PRESETS.md`](./docs/INDUSTRY_PRESETS.md) — Presets,
  Registry, Compliance
- [`docs/THEMES.md`](./docs/THEMES.md) — Theme-System, CSS-Variablen
- [`docs/MOCK_DATA.md`](./docs/MOCK_DATA.md) — Demo-Betriebe,
  Daten-Hygiene
- [`docs/PUBLIC_SITE.md`](./docs/PUBLIC_SITE.md) — Public Site Generator
- [`docs/MARKETING.md`](./docs/MARKETING.md) — Marketing-Funnel
- [`docs/DASHBOARD.md`](./docs/DASHBOARD.md) — Dashboard, Sub-Routen
- [`docs/BUSINESS_EDITOR.md`](./docs/BUSINESS_EDITOR.md) — Business-Editor
- [`docs/SERVICES_EDITOR.md`](./docs/SERVICES_EDITOR.md) — Services-Editor
- [`docs/LEAD_SYSTEM.md`](./docs/LEAD_SYSTEM.md) — Lead-System
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — GitHub Pages und Vercel

---

## 🪪 Lizenz

Proprietär — alle Rechte vorbehalten. LocalPilot AI ist als verkaufsfähiges
Micro-SaaS konzipiert; eine Open-Source-Lizenz ist aktuell nicht vorgesehen.
Anfragen für White-Label-/Reseller-Modelle bitte direkt an den
Auftraggeber.

---

<div align="center">

<sub>♾️ Dieses Programm endet nicht. Jede Session erweitert die Roadmap.
Was hier nicht steht, steht in <a href="./docs/PROGRAM_PLAN.md">PROGRAM_PLAN.md</a>.</sub>

</div>
