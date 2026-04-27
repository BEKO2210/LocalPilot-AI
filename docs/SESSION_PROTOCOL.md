# Session-Protokoll – LocalPilot AI

Verbindlicher Ablauf jeder Code-Session ab Session 13. Ziel: kleine,
sichere Schritte, dokumentierte Recherche, jede Session lauffähig
deploybar.

## Größenbegrenzung

| Metrik              | Ziel             | Hartes Limit     |
| ------------------- | ---------------- | ---------------- |
| Bearbeitungszeit    | 30–60 Min.       | 90 Min.          |
| Diff-Größe          | 30–80 KB         | 150 KB           |
| Geänderte Dateien   | 4–10             | ~15              |
| Neue Komponenten    | 1–3              | 5                |
| Tests pro Session   | mindestens 1     | –                |

Wenn ein Vorhaben das harte Limit sprengt: **splitten** und in der
nächsten Session weitermachen. Lieber 5 kleine Sessions, die alle
einzeln deploybar sind, als 1 große, die wackelt.

## Pflicht-Schritte

### 1. Plan (TodoWrite)

Klare Liste der Schritte, ein einziger `in_progress` zur Zeit. Wenn der
Plan länger als ~10 Items wird, ist die Session zu groß – splitten.

### 2. Recherche-Step (WebSearch)

**Pflicht** vor jeder Implementierungs-Session. Mindestens **eine**
WebSearch mit `current year` (siehe WebSearch-Tool-Hinweis).

Drei Standardfragen, die du dir vor jeder Session stellst:

1. **Was hat sich seit dem letzten Mal verändert?** Neue Major-Versionen,
   Sicherheits-Advisories, Deprecation-Hinweise (Next.js, React, Tailwind,
   Anthropic-SDK, OpenAI-SDK, …).
2. **Gibt es einen besseren Pattern dafür?** Aktuelle Empfehlungen
   in offiziellen Docs / Cookbooks / aktuellen Blog-Posts (≤ 6 Monate alt).
3. **Wo lauert eine Falle?** Bekannte Gotchas, die wir vermeiden sollten
   (Edge-Cases, Bundle-Size-Surprises, A11y-Pitfalls).

**Quellen werden im RUN_LOG-Eintrag mit Link-Markdown zitiert.** So
entsteht über Wochen ein belegtes Tagebuch.

### 3. Implementierung (atomar)

EIN klar abgrenzbares Deliverable pro Session. Beispiele:

- ✅ „Mock-Provider mit `generateWebsiteCopy`-Methode"
- ✅ „API-Route `/api/ai/generate` mit Schema-Validierung"
- ✅ „Cost-Tracking-Card im Dashboard `/ai`"
- ❌ „AI-System komplett bauen" – zu groß, splitten

### 4. Verifikation

Reihenfolge nicht verhandelbar:

```bash
npm run typecheck          # MUSS grün
npm run lint               # MUSS 0 warnings/errors
npm run build:static       # MUSS durchlaufen
npm run dev                # Kurzer Live-Smoketest, wenn UI-Änderung
```

Bei UI-Änderungen zusätzlich:

- Screenshot oder `curl`-Smoketest auf der betroffenen Route.
- Mobile-Check (375 px Viewport, mind. mental durchgespielt).

### 5. Doku

- **CHANGELOG.md** – kurzer Eintrag in `[Unreleased]` oder neuer
  Versions-Block.
- **`docs/RUN_LOG.md`** – Standard-Eintrag mit den 6 Antworten:
  1. Was wurde umgesetzt?
  2. Welche Dateien wurden geändert?
  3. Wie teste ich es lokal?
  4. Welche Akzeptanzkriterien sind erfüllt?
  5. Was ist offen?
  6. Was ist der nächste empfohlene Run?
  Plus: **Quellen** der Recherche aus Schritt 2.
- Bei größerem Feature: eigene `docs/<FEATURE>.md`.

### 6. Commit + Push

Conventional Commit, Branch `claude/setup-localpilot-foundation-xx0GE`
oder spätere Feature-Branches.

```
git add -A
git commit -m "feat(session-N): <einzeiler>

<5–15 Zeilen Body mit Begründung + Verifikations-Hinweisen>"
git push -u origin <branch>
```

**Nach jedem Push** ist das Pages-Deploy live – das ist der Test, dass
die Session wirklich „durch" ist.

## Session-Typen

Nicht jede Session ist eine Feature-Session. Sechs gleichberechtigte
Typen:

| Typ           | Beispiel                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| **Feature**   | Neue UI, neue Route, neuer Editor                                        |
| **Refactor**  | Komponente aufteilen, Naming, Type-Cleanup                               |
| **Polish**    | Spacing, Typografie, Mobile-CTA-Bar Layout-Korrektur                     |
| **A11y**      | Focus-States, ARIA, Tastatur-Navigation, Kontraste                        |
| **Performance** | Bundle-Reduktion, Lazy-Load, Image-Optimierung                          |
| **Security**  | Headers, CSP, Dependency-Update wegen Advisory                           |
| **DX**        | Lint-Regeln, Vitest-Setup, Dev-Server-Speed, npm-Skripte                 |
| **Doku**      | Architektur-Diagramm, neue Onboarding-Anleitung, Glossar                 |
| **Research**  | Reine Recherche, Erkenntnis-Notiz im RUN_LOG ohne Code-Diff              |

Eine **Research-Only-Session** ist absolut legitim und zählt voll.

## Was eine Session NICHT ist

- ❌ Drei Features gleichzeitig.
- ❌ „Wir refactoren mal eben das Ganze."
- ❌ Eine Session ohne Recherche-Step (außer reine Doku/Polish).
- ❌ Eine Session ohne Tests, Lint, Build.
- ❌ Eine Session ohne Commit/Push am Ende.

## Wann eine Session „durch" ist

Alle Punkte gemeinsam:

- [x] Typecheck grün
- [x] Lint grün (0 warnings/errors)
- [x] `npm run build:static` durchgelaufen
- [x] Falls UI: Live-Smoketest gemacht
- [x] CHANGELOG aktualisiert
- [x] RUN_LOG-Eintrag mit Quellen geschrieben
- [x] Commit + Push gemacht
- [x] Nächster empfohlener Run benannt

Wenn auch nur einer fehlt: **noch nicht fertig**.

## Rolle der „alten" Session-Liste in `Claude.md`

`Claude.md` bleibt das verbindliche **inhaltliche** Master-Briefing.
Die Sessions 1–22 dort sind ein **Inhaltsverzeichnis**, kein Zeitplan.
Code-Session-Nummern wachsen frei über 22 hinaus.

Wenn das, was in `Claude.md` als „Session N" steht, durch mehrere
Code-Sessions abgedeckt wird, vermerken wir das im RUN_LOG:

> *Session 13 aus Claude.md (AI Provider Interface) erfüllt durch
> Code-Sessions 13–25.*

Damit bleibt das Master-Briefing der inhaltliche Anker.
