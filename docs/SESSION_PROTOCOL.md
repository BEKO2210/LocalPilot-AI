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

### 5. Doku (Compact-Format ab Code-Session 27)

Token-effizient. Doppelung zwischen CHANGELOG und RUN_LOG vermeiden.

**CHANGELOG.md** – kurz, Release-Notes-Stil. Pro Session ein
Versions-Block mit:
- 1 Satz „Was hat sich geändert?"
- 3–8 Bullets, was reinkam.
- Falls Dependencies bewegt wurden, eine Zeile dazu.
- Falls Roadmap erweitert: eine Zeile mit Track + Anzahl Items.

Kein „Notes"-Block, keine ASCII-Tabelle, kein Prose-Absatz.

**`docs/RUN_LOG.md`** – chronologisches Technical-Log, Compact-Format:

```markdown
## Code-Session N – <kurzer Titel>
Datum · Branch · Typ (Feature / Refactor / Polish / Maintenance / …)

**Was**: 1–3 Sätze, was die Session inhaltlich getan hat.

**Dateien**: bullet-Liste, neu / geändert / entfernt mit ✚ / 🔄 / 🗑️.

**Verifikation**: 1 Zeile pro Check (typecheck/lint/build/Smoketests),
alle ✅ oder eine konkrete Fehler-Anmerkung.

**Roadmap**: 1 Zeile, welche PROGRAM_PLAN-Items neu / verschärft sind.

**Quellen**: `RESEARCH_INDEX.md` Track X (Stichwort), Track Y. Kein
Vollzitat im RUN_LOG-Eintrag — nur Pointer.

**Nächste Session**: 1 Zeile, was als Nächstes empfohlen ist.
```

Längere Einträge (Sessions 1–26) bleiben im Bestand. Der Compact-
Format-Wechsel gilt **vorwärts** ab Code-Session 27.

**`docs/RESEARCH_INDEX.md`** – zentraler Quellen-Speicher (siehe Datei
selbst). Neue Quellen aus dem WebSearch-Step werden dort angefügt,
**nicht** im RUN_LOG zitiert.

**Bei größerem Feature**: eigene `docs/<FEATURE>.md` (unverändert).

### 6. Roadmap-Selbstaktualisierung (verbindlich ab Code-Session 18)

Vor dem Commit erweitert jede Session `docs/PROGRAM_PLAN.md` um
**mindestens einen** neuen Punkt. Quellen für neue Punkte:

- Recherche-Step aus 2 (Innovation, neue AI-Modelle, neue Plattform-
  Features, Industry-Trends).
- Beobachtungen aus der Implementierung (Refactor-Wünsche, Test-
  Lücken, Performance-Beobachtungen, UX-Schliff).
- Sicherheits-Updates (CVEs, Dependency-Bumps, Browser-Verhalten,
  GDPR-Themen).
- Tech-Debt aus dem RUN_LOG.

Format: Stichpunkt unter dem passenden Meilenstein. Wenn der Punkt
in keinen passt, kommt er unter „Innovation Loop ♾️" oder es wird
ein neuer Meilenstein eröffnet.

**Faustregel**: Geht eine Session „leer" raus (also ohne neuen
Plan-Punkt), wurde der Recherche-Step nicht gründlich genug gemacht
oder die Beobachtungen aus der Implementierung wurden nicht
festgehalten. Beides ist ein Protokoll-Verstoß.

### 7. State-Refresh-Cadence (verbindlich ab Code-Session 27)

Wenn die abgeschlossene Session-Nummer **durch 5 teilbar** ist
(`N % 5 === 0`), wird **zusätzlich** zur normalen Doku der
**Light-Pass** aus `docs/STATE_REFRESH_CHECKLIST.md` ausgeführt:

- Smoketest-Regression (alle 6 Tests grün).
- Stale-Stub-Audit (`grep -rn "comingInSession=" src/app/dashboard`).
- README-Provider-Matrix prüfen.
- Codex-Backlog sichten.
- Mini-Eintrag im RUN_LOG.

Wenn `N % 20 === 0`, **Deep-Pass** zusätzlich (Webseiten-Walkthrough,
`npm outdated`, Bundle-Größen-Check, RESEARCH_INDEX-Konsolidierung).

Findet die fällige Sync auf einer regulären Code-Session statt, wird
sie im Commit-Body als `state-refresh-light:` / `state-refresh-deep:`
sub-bullet vermerkt — kein eigener Commit nötig.

### 8. Commit + Push

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
