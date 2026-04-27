# Technical Notes – LocalPilot AI

Architektur-, Stack- und Konventionsentscheidungen. Wird pro Session ergänzt.

## Stack

- **Next.js 15** (App Router, React 19, Server Components default)
- **TypeScript** strict (`noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch` aktiv)
- **Tailwind CSS 3** (mit Custom Brand- und Ink-Paletten, Container, Schatten,
  Radius). Keine Theme-Bindung an eine Branche.
- **clsx + tailwind-merge** über `cn()` (`src/lib/cn.ts`).
- **Lucide Icons** für UI-Symbole.
- **ESLint** über `next lint` (Next + TypeScript Regelsatz).
- **Vercel** als Deployment-Ziel.

Spätere Erweiterungen:

- **Zod** für Validierung (Session 2).
- **React Hook Form** für Formulare (Session 10+).
- **Supabase** für Auth, Datenhaltung, Storage (Session 19).
- Optional **Vitest** für Unit-Tests (`src/tests`).
- Optional **Recharts** für spätere Statistiken (Gold-Paket).

## Verzeichnisstruktur

```
src/
  app/            App Router (Layouts, Routen, route handlers)
  components/     UI-Bausteine (layout, marketing, ui, später dashboard, public-site, …)
  core/           Domänenlogik (pricing, industries, themes, ai, …)
  data/           Mock-Daten
  lib/            Utilities (cn, später supabase, storage, slugify, format)
  types/          TypeScript-Modelle
  tests/          Unit-Tests
docs/             Doku
```

Branchenspezifische Inhalte gehören **niemals** in `src/app` oder `src/components/marketing`,
sondern in `src/core/industries` als `IndustryPreset`.

## Konventionen

### Imports
- Alias `@/*` → `./src/*` (siehe `tsconfig.json`).
- Komponenten: `import { Foo } from "@/components/...";`
- Server Components default; Client Components werden mit `"use client"` markiert.

### Styling
- Tailwind first.
- Wiederkehrende Layout-Container über `Container` und `Section`.
- Custom-Klassen in `globals.css` nur, wenn sie wirklich wiederverwendet werden
  (`lp-container`, `lp-section`, `lp-eyebrow`, `lp-card`).
- Design-Tokens über Tailwind-Theme. Theme-System ab Session 5 ergänzt.

### Komponenten
- Eine Komponente pro Datei.
- Public APIs sind benannte Exports (`export function Foo`).
- Server Components, wo möglich. Interaktivität (z. B. Toggles) ab Session 9+ als Client.

### Sprache
- UI immer Deutsch. Keine Entwicklerbegriffe in der Oberfläche
  ("Anfragestatus" statt "Lead Status", "Text erstellen" statt "Generate Copy").
- Code-Identifier dürfen englisch sein (Konvention im JS-Ökosystem).

### KI-Texte
- Mock-Provider muss ohne API-Key brauchbare Beispieltexte liefern.
- Provider-Auswahl per `AI_PROVIDER` ENV (`mock` | `openai` | `anthropic` | `gemini`).
- Wenn Key fehlt → automatisch Fallback auf `mock`.
- Keine Heilversprechen, keine Rechtsberatung, keine Garantien.

### Branchen-Presets
- Jeder Preset enthält: Leistungen, CTAs, Hero-Texte, FAQ, Leadfelder, Tonalität, Reviews-Vorlagen, Social-Ideen, empfohlene Themes.
- Validierung durch Zod (ab Session 4).

## Routenplan (Zielzustand)

| Route                  | Zweck                                       | Geplant in |
| ---------------------- | ------------------------------------------- | ---------- |
| `/`                    | Marketing-Landingpage LocalPilot AI         | Session 1 ✅ |
| `/marketing`           | optionaler Alias / Subseiten               | Session 8  |
| `/demo`                | Übersicht aller Demo-Betriebe              | Session 6  |
| `/site/[slug]`         | öffentliche Betriebs-Website                | Session 7  |
| `/dashboard`           | Adminbereich (Übersicht)                    | Session 9  |
| `/dashboard/business`  | Betriebsdaten                              | Session 10 |
| `/dashboard/services`  | Leistungen                                  | Session 11 |
| `/dashboard/leads`     | Anfragen                                    | Session 12 |
| `/dashboard/ai`        | KI-Assistent                                | Session 13–17 |
| `/dashboard/reviews`   | Bewertungs-Booster                          | Session 16 |
| `/dashboard/social`    | Social-Media-Generator                      | Session 17 |
| `/dashboard/settings`  | Einstellungen, Slug, Veröffentlichung       | Session 18+ |
| `/api/leads`           | Lead-Erfassung                              | Session 12 |
| `/api/businesses`      | Business-CRUD                               | Session 19 |
| `/api/ai/generate`     | KI-Endpoint                                 | Session 13 |

## Stand nach Session 1

- App Router läuft, `/` rendert Marketing-Landingpage.
- Strict TS aktiv, ESLint vorhanden.
- Tailwind & Brand-Tokens stehen.
- Folder-Skelett über `.gitkeep` ausgeführt – Session 2+ kann direkt darauf aufbauen.
- Keine externen Services (Supabase, OpenAI etc.) erforderlich.
- Build-Verifikation: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`.

## Offene technische Punkte

- Zod-Validierung & Schemas (Session 2).
- AI-Provider-Adapter & ENV-Resolver (Session 13).
- Repository-Layer / Mock vs. Supabase (Session 19).
- Vitest-Setup (offen, zu klären in Session 2 oder 20).
- Image-Hosting/-Optimierung (Session 7+).
