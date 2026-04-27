# State-Refresh-Checkliste

> Verbindliche Vorlage für **wiederkehrende Sync-Sessions** zwischen
> Backend-Stand und sichtbarer Webseite. Spielregeln:
>
> - **Nach jeder 5. Code-Session** (5, 10, 15, 20, 25, 30, …): Light-Pass.
> - **Nach jeder 20. Code-Session** (20, 40, 60, …): Deep-Pass
>   (= Light-Pass + alle Deep-Punkte).
>
> Diese Pflicht löst nicht die anderen Session-Protokoll-Schritte ab —
> sie kommt **zusätzlich** zur normalen Code-Session, die ohnehin
> stattfindet. Ist die fällige Session gerade eine Polish-Session,
> verschmelzen sie zu einer einzigen Maintenance-Session.
>
> Token-effizient: nicht jede Datei lesen. Nur die im Checklisten-Befehl
> genannten Pfade öffnen.

---

## 5-Session-Light-Pass

### 1. Smoketest-Regression

```bash
npm run typecheck
npm run lint
npm run build:static
npx tsx src/tests/ai-mock-provider.test.ts
npx tsx src/tests/ai-provider-resolver.test.ts
npx tsx src/tests/ai-openai-provider.test.ts
npx tsx src/tests/ai-anthropic-provider.test.ts
npx tsx src/tests/ai-gemini-provider.test.ts
npx tsx src/tests/themes.test.ts
```

Alle grün → weiter. Wenn rot → **stoppen**, Bug-Fix-Session zwischenschieben.

### 2. Stale-Stub-Audit

```bash
grep -rn "comingInSession=" src/app/dashboard --include="page.tsx"
```

Für jeden Treffer prüfen: ist die genannte Session bereits durch?
- **Ja** → Page auf `<BackendReadyStatus>` umstellen oder echtes UI ergänzen.
- **Nein** → unverändert lassen.

### 3. README-Provider-Matrix

`README.md` Sektion „Aktueller Status" — die Tabelle in
`docs/PROGRAM_PLAN.md` (Meilenstein 2 Status) muss zur tatsächlich
geschärften Methoden-Anzahl passen. Wenn neue Live-Methode
seit letztem Refresh, Tabelle aktualisieren. Sonst überspringen.

### 4. CODEX_BACKLOG-Sichtung

```bash
grep -E "\[done\]|\[needs-review\]" docs/CODEX_BACKLOG.md
```

- `[done]`-Einträge älter als 30 Sessions in den „Erledigt"-Block
  am Ende der Datei verschieben.
- `[needs-review]`-Einträge: prüfen, ob jetzt entschieden werden
  kann (zu Backlog-Item für Claude oder zu Wegwurf).

### 5. Compact-Log-Eintrag

Im RUN_LOG einen **Mini-Eintrag** im Compact-Format anhängen:

```markdown
## State-Refresh nach Session N — YYYY-MM-DD

- ✅ Smoketests grün (~X Asserts).
- 🔄 Stale Stubs gepatcht: `<file>`, `<file>`.
- 📊 README-Matrix unverändert (oder: `<delta>`).
- 🧹 Codex-Backlog: `<n>` Einträge ins Archiv verschoben.
```

Kein eigener CHANGELOG-Block für Light-Pass. Fügt sich in den
nächsten regulären Versions-Block.

---

## 20-Session-Deep-Pass (zusätzlich zum Light-Pass)

### 6. Webseiten-Walkthrough

Pro Top-Level-Route prüfen, ob der Inhalt zum aktuellen Code-Stand
passt. Token-effizient: **nur Header-/Status-Strings** scannen.

```bash
grep -rn "Folgt in\|Vorschau\|Coming\|TODO\|FIXME" \
  src/app/{page.tsx,pricing,demo,themes,site,dashboard} 2>&1 | \
  grep -v node_modules
```

Pro Treffer: aktualisieren oder bewusst „noch nicht dran" markieren.

### 7. Provider-Matrix-Tabelle in CHANGELOG aktualisieren

In CHANGELOG einen kompakten Status-Block einfügen (nicht im
`[Unreleased]`-Bereich, sondern in einem separaten Eintrag
`[STATE-N]` direkt unter `[Unreleased]`):

```markdown
## [STATE-N] – Provider-Matrix-Snapshot – YYYY-MM-DD

| Methode               | Mock | OpenAI | Anthropic | Gemini |
| --------------------- | :--: | :----: | :-------: | :----: |
| generateWebsiteCopy    | ✅  | ✅    | ✅       | ✅    |
| improveServiceDesc.    | ✅  | ✅    | ✅       | —     |
| ...                   | ... | ...   | ...      | ...   |
```

### 8. Dependency-Audit

```bash
npm outdated
npm audit --omit=dev 2>&1 | head -30
```

Auffälligkeiten als Track-B-Items in `PROGRAM_PLAN.md` aufnehmen.
**Nicht** eigenständig bumpen — Bumps sind eigene Sessions.

### 9. Bundle-Größen-Check

```bash
npm run build:static 2>&1 | grep "First Load JS"
```

Wenn der Wert seit letztem Deep-Pass um > 10 % gewachsen ist:
Track D-Item „Bundle-Wachstum analysieren" eintragen.

### 10. RESEARCH_INDEX-Konsolidierung

Wenn neue Quellen in den letzten 20 Sessions zitiert wurden, prüfen,
ob alle in `docs/RESEARCH_INDEX.md` stehen. Sonst nachtragen.
Dauert 5 min, spart später viel Token bei der Doku zukünftiger
Sessions.

### 11. Deep-Log-Eintrag

Eigener RUN_LOG-Eintrag mit Header `## State-Refresh-Deep nach Session N`,
ausführlicher als der Light-Pass:

```markdown
## State-Refresh-Deep nach Session N — YYYY-MM-DD

### Webseiten-Walkthrough
- ✅ /pricing aktuell
- 🔄 /dashboard/[slug]/social: gepatcht
- ...

### Provider-Matrix-Delta seit Session (N-20)
- generateFaqs: + OpenAI
- ...

### Dependency-Drift
- @anthropic-ai/sdk: 0.62 → 0.91 verfügbar (Track B Item #X)
- ...

### Bundle
- First Load JS: 102 kB (unverändert).
```

Dieser Eintrag ersetzt den Light-Pass-Mini-Eintrag.

---

## Wann gilt eine State-Refresh-Session als „durch"?

- Alle Smoketests grün.
- `git status` zeigt nur die Doku-Patches und ggf. die aktualisierten
  Stub-Pages.
- `RUN_LOG.md` hat den Refresh-Eintrag.
- Ein Commit mit Conventional-Stil:
  - `chore(state-refresh-light): nach Session N`
  - `chore(state-refresh-deep): nach Session N`
- Push auf `claude/...`-Branch.
- Pages-Deploy automatisch durch.

Wenn das nicht passt (z. B. weil die fällige Sync-Session direkt mit
einer Code-Session zusammenfällt), wird das im normalen
`feat(session-N): ...`-Commit-Body unter „State-Refresh" als
Sub-Punkt vermerkt — kein eigener Commit nötig.
