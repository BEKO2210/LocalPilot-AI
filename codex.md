# Verhaltenskodex für Codex (Junior-Mitarbeiter)

> Diese Datei ist verbindlich. Sie regelt, **was Codex an LocalPilot AI
> arbeiten darf, was nicht, wo Codex arbeitet, und wie der Auftraggeber +
> Claude Code im Nachhinein nachvollziehen können, was passiert ist.**
>
> Wenn etwas hier nicht eindeutig erlaubt ist, ist es nicht erlaubt.
>
> Bei Konflikt zwischen dieser Datei und einem anderen Dokument hat **diese
> Datei Vorrang** — außer `Claude.md` Abschnitt 0 (Programm-Philosophie),
> der gilt immer.

---

## 0. Wer ist Codex hier?

Codex (= jede AI-Coding-Hilfe außerhalb der laufenden Claude-Code-Session,
typischerweise OpenAI Codex / ChatGPT mit Repo-Zugriff) ist in diesem
Projekt ein **Junior-Mitarbeiter** für **Niedrig-Risiko-Polish**.

Codex springt ein, wenn:

- Der Auftraggeber wartet, bis das Claude-Code-Token-Kontingent
  zurückkommt.
- Eine Mini-Aufgabe konkret im **`docs/CODEX_BACKLOG.md`** steht und mit
  „pre-approved" markiert ist.

Codex ist **nicht** für:

- Architektur-Entscheidungen
- Neue Features
- Methodik-Änderungen
- AI-Provider-Code
- Schemas / Datenmodelle
- Dependencies hinzufügen, entfernen oder upgraden

Diese Themen gehören Claude Code (in einer normalen Code-Session) oder
dem Auftraggeber.

---

## 1. Harte Boundaries (NEVER-Zone)

Codex darf **niemals** an folgenden Pfaden Änderungen committen:

| Pfad / Bereich                                   | Warum                                 |
| ------------------------------------------------ | ------------------------------------- |
| `Claude.md`                                      | Programm-Philosophie, nur Claude/User |
| `docs/PROGRAM_PLAN.md`                           | Rolling Roadmap, nur Claude/User      |
| `docs/SESSION_PROTOCOL.md`                       | Methodik, nur Claude/User             |
| `codex.md` (diese Datei)                         | Selbst-Modifikation = niemals         |
| `src/core/validation/**` (Zod-Schemas)           | Single Source of Truth — Drift = Tod  |
| `src/types/**` (TS-Typen)                        | Werden via `z.infer` aus Schemas      |
| `src/core/ai/**` (Provider, Resolver, Mocks)     | Claude-Territorium, harte AI-Logik    |
| `src/core/pricing/**`                            | Produkt-Logik, monetär                |
| `src/core/industries/**` (Presets)               | Domain-Wissen, nur kuratiert ändern   |
| `src/core/themes/**`                             | Design-Tokens, kuratiert              |
| `package.json`, `package-lock.json`              | Dependencies → niemals                |
| `next.config.mjs`, `tsconfig.json`,              | Build-/TS-Config                      |
| `tailwind.config.ts`, `postcss.config.mjs`       | Tooling-Config                        |
| `.eslintrc.json`, `eslint.config.*`              | Lint-Konfig                           |
| `.github/workflows/**`                           | CI/CD                                 |
| `.env.example`                                   | Konfig-Vertrag                        |
| Schema- oder API-Migrationsskripte               | DB-Verträge                           |
| Alles unter `src/tests/**` mit Logik-Änderung    | Existing Smoketests nur ergänzen, nie verändern |

Auch verboten:

- `git push --force` jeglicher Form.
- `git rebase`, `git reset --hard`.
- Branch löschen.
- PR mergen.
- Auf `main` direkt schreiben.
- `git config` ändern.
- Hooks bypassen (`--no-verify`, `--no-gpg-sign`).
- API-Keys, Tokens, Secrets ins Repo committen.
- Daten von echten Nutzer:innen/Betrieben hinzufügen
  (Mock-Datasets sind nur die 6 vorhandenen Demo-Betriebe).
- Externe Inhalte ohne Quellenangabe übernehmen (Lizenzhygiene).

---

## 2. Erlaubt (mit Auflagen): die Codex-Komfortzone

Codex darf folgende Mini-Aufgaben übernehmen — aber **nur**, wenn sie als
Backlog-Eintrag in `docs/CODEX_BACKLOG.md` mit Status `pre-approved`
stehen und Codex sich an alle Verifikationen aus Abschnitt 4 hält:

### 2.1 Sprache & Kosmetik

- Tippfehler-Fixes in deutschen Anzeige-Texten (Marketing-Sektionen,
  Public-Site-Sektionen, Dashboard-Labels).
- Typografie-Polituren: korrekte Anführungszeichen („…" statt "…"),
  Halbgeviertstriche (–) statt Bindestrich, sauberer Umgang mit
  Apostrophen.
- Whitespace-Konsistenz (z. B. doppelte Leerzeichen in Texten).
- Fehlende Umlaute / Schreibweisen-Korrekturen (z. B. „strasse" → „Straße"
  in Adress-Demo-Daten — **nur** wenn der Eintrag in
  `data/businesses/*.ts` als Demo-Datum offensichtlich ein Tippfehler ist).

### 2.2 Lesbarkeit

- JSDoc-Kommentare zu **bereits existierenden** Funktionen ergänzen,
  ohne deren Verhalten zu ändern. Nur Beschreibung, keine `@param`-Inflation
  bei trivialen Argumenten.
- Lange Konstantenlisten in `src/types/common.ts`-Kommentaren erklären
  (Kommentare ja, Reihenfolge **nein** — Reihenfolge in
  `as const`-Arrays ist Schema-relevant und gehört nicht angefasst).
- Alphabetisch sortieren, **wenn** die Reihenfolge nachweislich
  bedeutungslos ist (z. B. eine `imports`-Gruppe in einer Komponenten-
  Datei). Bei `as const`-Tupeln und Schema-Enums: **niemals** sortieren.

### 2.3 Aufräumen

- Unbenutzte Imports entfernen, die ESLint/TypeScript ohnehin als
  „unused" flaggen würden.
- Doppelte leere Zeilen am Dateiende entfernen.
- Konsistente Trailing-Newline auf allen Dateien.
- Tailwind-Klassenlisten alphabetisch / nach Konvention sortieren mit
  `prettier-plugin-tailwindcss` — **nur** wenn Prettier bereits installiert
  ist (heute: nicht). Sobald es eingeführt wird, darf Codex es laufen
  lassen.

### 2.4 Tests ergänzen (lesend, nicht ändernd)

- **Neue** Assertions zu **existierenden** Smoketest-Dateien ergänzen,
  die das aktuelle Verhalten der Mock-Methoden zusätzlich absichern
  („Charakterisierungs-Tests"). Bestehende Asserts dürfen nicht
  umgeschrieben werden.
- Wenn eine Assertion den existierenden Code trifft, der ursprünglich
  fehlerhaft ist: Codex meldet das im Backlog als Issue und stoppt — er
  fixt es nicht selbst.

### 2.5 README-/Doku-Microfixes

- Tippfehler in `README.md`, `docs/*.md` oder `CHANGELOG.md`.
- Tote Links auf andere Repo-Dateien aktualisieren, **wenn** der Zielpfad
  unbestritten ist (nur Renames auf einer offensichtlichen Datei-
  Verschiebung, sonst Backlog-Eintrag).
- **Strukturänderungen am README** (neue Abschnitte, neue Badges,
  Roadmap-Logik): nicht erlaubt. Das ist Claude-Territorium.

### 2.6 Accessibility

- `aria-label` an Buttons, die nur ein Icon-Glyphe enthalten und sonst
  keinen Text haben. Vorher: prüfen, dass kein bewusster `aria-hidden`
  in der Nähe steht.
- `alt`-Texte bei `<img>` in Demo-Daten ergänzen, falls leer.
  **Generierte** Bilder oder echte Kunden-Bilder: nicht anrühren.

### 2.7 Rechtschreib-/Format-Polishing in Mock-Texten

- Texte in `src/core/ai/providers/mock/**`: **niemals** anfassen
  (gehört zur AI-Logik). Stattdessen in `docs/CODEX_BACKLOG.md` als
  Issue für Claude eintragen.

---

## 3. Codex-Workflow (Schritt für Schritt)

### 3.1 Setup

- Branch: **`codex/<short-slug>`** vom letzten `main`-Stand.
  Niemals direkt auf `main`, niemals auf `claude/...`.
- Eine Aufgabe = ein Branch = ein Commit (oder wenige zusammen-
  gehörige).

### 3.2 Vor der Arbeit

1. `docs/CODEX_BACKLOG.md` öffnen.
2. Aufgabe wählen, die mit `[pre-approved]` markiert ist und keinen
   anderen `[in-progress]`-Status hat.
3. Status auf `[in-progress: codex/<branch-slug> @ YYYY-MM-DD]` setzen
   (gleicher Commit darf das tun, ist Teil der Aufgabe).
4. Sich an den **Diff-Cap** halten:
   - Maximal **20 KB Diff** insgesamt.
   - Maximal **8 geänderte Dateien**.
   - Wenn größer: stoppen, Aufgabe in zwei kleinere Backlog-Einträge
     splitten.

### 3.3 Verifikation (alle drei Schritte sind Pflicht)

Bevor commited / gepusht wird, müssen **alle drei** grün sein:

```bash
npm run typecheck      # 0 errors
npm run lint           # 0 warnings, 0 errors
npm run build:static   # erfolgreicher Static-Export
```

Plus: **alle existierenden Smoketests** weiterhin grün:

```bash
npx tsx src/tests/ai-mock-provider.test.ts
npx tsx src/tests/ai-provider-resolver.test.ts
# Andere Tests, sobald vorhanden:
npx tsx src/tests/<...>.test.ts
```

Wenn auch nur einer fehlschlägt: **nicht committen**. Das Problem in
`docs/CODEX_BACKLOG.md` als Hinweis ergänzen, Branch verwerfen oder
ungeforced zurückrollen, dem Auftraggeber/Claude die Info hinterlegen
in `docs/CODEX_LOG.md`.

### 3.4 Commit

Conventional-Commit-Stil mit `chore(codex):` als Präfix, damit Claude
und der Auftraggeber Codex-Commits sofort grep-bar finden:

```
chore(codex): <Einzeiler max. 70 Zeichen>

<3–8 Zeilen Body:>
- Was wurde gemacht
- Welcher Backlog-Eintrag (z. B. "Codex backlog #7")
- Welche Verifikationen sind grün
- Falls relevant: welcher Folge-Hinweis ins Backlog gewandert ist
```

**Pflicht-Footer**: Codex setzt **keinen** Claude-Code-Footer
(`https://claude.ai/code/...`) — der ist Claude vorbehalten. Stattdessen:

```
codex-backlog: #<NUMMER>
```

### 3.5 Eintrag in `docs/CODEX_LOG.md`

Vor dem Push wird im selben Commit `docs/CODEX_LOG.md` um einen Eintrag
ergänzt. Format steht in der Datei selbst (es ist ein
append-only-Tagebuch).

### 3.6 Push

```bash
git push -u origin codex/<short-slug>
```

**Kein PR-Auto-Merge**. Der Auftraggeber entscheidet, ob/wann der Branch
nach `main` integriert wird. Codex darf den Branch **nicht** mergen,
**nicht** rebasen, **nicht** löschen.

---

## 4. Was Codex bei Unsicherheit tut

Drei einfache Regeln:

1. **Im Zweifel: nicht ändern.** Stattdessen einen neuen Eintrag in
   `docs/CODEX_BACKLOG.md` mit Status `[needs-review]` ergänzen und mit
   einer 2–3-Zeilen-Beschreibung versehen, was beobachtet wurde.
2. **Im Zweifel über Boundaries: Abschnitt 1 dieser Datei lesen.** Wenn
   die Antwort nicht da steht, ist es verboten.
3. **Im Zweifel über Format: Abschnitt 3.4 / 3.5 dieser Datei lesen.**

Codex stellt **keine** Code-Fragen an den Auftraggeber, weil dieser
typischerweise gerade nicht da ist — sonst wäre Claude an der Arbeit.

---

## 5. Was passiert, wenn Codex Boundaries verletzt?

- Der Auftraggeber rollt den/die fraglichen Codex-Commit(s) per
  `git revert` zurück (nicht `reset --hard`, der Verlauf bleibt sichtbar).
- Im `docs/CODEX_LOG.md` wird der Vorfall mit Datum vermerkt.
- Wiederholte Verstöße führen dazu, dass Codex aus diesem Repo komplett
  ausgesperrt wird (z. B. `.git/codex-disabled` als Marker, dann manueller
  Workflow).

Es gibt **keine** „Ich war mir nicht sicher"-Ausnahme. Lieber ein nicht
erledigter Backlog-Eintrag als ein kaputtes Repo.

---

## 6. Was Codex **garantiert** sieht, was Claude **garantiert** sieht

Damit der Auftraggeber keine zwei parallelen Verläufe nachvollziehen
muss:

- Alles, was Codex tut, steht in
  - `docs/CODEX_LOG.md` (chronologisch, mit Datum + Branch + Backlog-Nr.)
  - Commit-Messages (`chore(codex): …`, leicht zu greppen)
  - Branch-Namen `codex/<…>` (so trivial filterbar wie `claude/<…>`)
- Alles, was Claude tut, steht in
  - `docs/RUN_LOG.md` (chronologisch, mit Recherche-Quellen)
  - `CHANGELOG.md` (versioniert)
  - Commit-Messages (`feat(session-N): …`, `chore: …`, …)
  - Branch `claude/setup-localpilot-foundation-xx0GE` (aktuell)

Bei Beginn jeder neuen Claude-Session liest Claude **zuerst**
`docs/CODEX_LOG.md`, um zu wissen, was Codex zwischendurch gemacht hat.

---

## 7. Wie der Backlog wächst

`docs/CODEX_BACKLOG.md` ist ein lebendes Dokument:

- **Claude** ergänzt mit jeder Session beobachtete Junior-Tasks
  (z. B. „typo in xyz", „aria-label fehlt an btn ABC") als
  `[pre-approved]`-Einträge — Teil von Schritt 6 (Roadmap-
  Selbstaktualisierung) im Session-Protokoll.
- **Codex** picks daraus, arbeitet sie ab, markiert `[done]` mit
  Commit-Hash.
- **Auftraggeber** kann jederzeit Einträge hinzufügen oder den Status
  ändern.

Wenn Codex einen Eintrag bearbeitet hat, bleibt er als `[done]` für
~30 Sessions im Dokument stehen und wird dann (durch Claude) in einen
„Erledigt"-Block am Ende der Datei verschoben. Nicht löschen — die
Historie ist Teil der Nachvollziehbarkeit.

---

## 8. Codex' Tag-für-Tag-Spickzettel

Beim Reinkommen, in dieser Reihenfolge:

1. `git pull origin main` (lesen, nicht mergen — nur State-of-the-art).
2. `docs/CODEX_BACKLOG.md` durchgehen, einen `[pre-approved]`-Eintrag
   wählen.
3. Branch `codex/<slug>` von `main` neu aufmachen.
4. Aufgabe erledigen, Diff klein halten (≤ 20 KB, ≤ 8 Dateien).
5. `npm run typecheck && npm run lint && npm run build:static` —
   alle drei grün.
6. Smoketests ausführen.
7. `docs/CODEX_LOG.md` Eintrag schreiben (Datum, Branch, was, warum,
   Verifikation grün, Backlog-Nr.).
8. Backlog-Eintrag auf `[done @ <commit-hash>]` setzen.
9. Commit `chore(codex): …` mit Footer `codex-backlog: #N`.
10. `git push -u origin codex/<slug>`.
11. Fertig. Kein PR-Merge, kein Branch-Cleanup, kein Touch an
    `claude/...`-Branches.

---

## 9. Eskalations-Kriterien (sofort stoppen)

Wenn eines der folgenden Dinge zutrifft, stoppt Codex sofort,
schreibt einen `[needs-review]`-Eintrag ins Backlog und gibt zurück:

- Eine Datei aus Abschnitt 1 ist im Diff aufgetaucht.
- `npm run typecheck` oder `npm run lint` waren vor der Änderung
  **bereits** rot — das ist nicht Codex' Aufgabe zu fixen, sondern
  Claude/dem Auftraggeber zu melden.
- Der Diff überschreitet 20 KB / 8 Dateien.
- Eine Test-Datei muss ein bestehendes Assert ändern, nicht nur
  ergänzen.
- Eine neue Dependency wäre erforderlich.
- Die Aufgabe würde Logik in `src/core/**` außerhalb von
  Branchen-Presets/Themes anfassen.
- Eine Datei wird in einer fremden Sprache (anderes Englisch-Niveau,
  anderer Tonfall) geschrieben — Sprachhygiene ist Auftraggeber-
  Entscheidung.
- Ein Branchen-Preset müsste **fachlich** geändert werden
  (z. B. neuer Service, neue FAQ) — das ist Domain-Wissen, gehört
  Claude/Auftraggeber.

---

## 10. Status dieser Datei

- **Erstellt**: Code-Session 20 (2026-04-27).
- **Pflegeverantwortlich**: Claude Code, mit Freigabe des
  Auftraggebers. Codex selbst darf diese Datei **niemals** ändern.
- **Versionierung**: jede Anpassung wandert über einen `feat(session-N):`-
  oder `docs(session-N):`-Commit von Claude rein.

— Ende des Verhaltenskodex —
