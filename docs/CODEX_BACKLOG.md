# Codex-Backlog (vorab freigegebene Junior-Aufgaben)

> Diese Datei listet Aufgaben, die **Codex** ohne Rückfrage übernehmen
> darf. Jeder Eintrag folgt einem festen Format und hat einen
> Status. Spielregeln stehen in [`../codex.md`](../codex.md).
>
> **Statusbedeutungen**
>
> - `[pre-approved]` — Codex darf sich diese Aufgabe nehmen.
> - `[in-progress: codex/<slug> @ YYYY-MM-DD]` — Codex arbeitet daran,
>   andere Codex-Instanzen / Mitwirkende lassen die Finger davon.
> - `[done @ <commit-hash>]` — erledigt, Commit auf
>   `codex/<slug>`-Branch verfügbar.
> - `[needs-review]` — Codex hat etwas Verdächtiges entdeckt; Claude oder
>   Auftraggeber müssen entscheiden.
> - `[blocked]` — externe Abhängigkeit fehlt (z. B. Prettier noch nicht
>   installiert).
>
> **Pflichten** (siehe `codex.md` Abschnitt 3):
>
> 1. Nur einen Eintrag gleichzeitig auf `[in-progress]` setzen.
> 2. Diff-Cap 20 KB / 8 Dateien.
> 3. typecheck, lint, build:static und alle Smoketests müssen grün
>    bleiben — sonst nicht committen.
> 4. Erledigung erst dokumentieren, wenn der Commit auf
>    `codex/<slug>`-Branch gepusht ist.

---

## Offene Aufgaben

### #1 — `[pre-approved]` JSDoc für `clamp`-Helper sammeln

**Pfade:**
- `src/core/ai/providers/mock/website-copy.ts`
- `src/core/ai/providers/mock/service-description.ts`
- `src/core/ai/providers/mock/customer-reply.ts`
- `src/core/ai/providers/mock/review-request.ts`
- `src/core/ai/providers/mock/social-post.ts`
- `src/core/ai/providers/mock/offer-campaign.ts`

**Aufgabe:** In **allen** sechs Dateien hat `clamp` aktuell **keine**
JSDoc oder eine sehr knappe. Codex darf jeweils einen identischen
zwei-Zeilen-JSDoc-Block davor setzen, der erklärt: „Schneidet auf
maxLen, bevorzugt eine Wortgrenze; hängt … an, falls geschnitten wird."

**Boundary:** Die Implementierung **nicht** anfassen. Nur Kommentar
ergänzen.

**Verifikation:** typecheck, lint, build:static, beide Smoketests
weiterhin grün.

---

### #2 — `[pre-approved]` Tippfehler-Pass durch Marketing-Sektionen

**Pfade:**
- `src/components/marketing/**`
- `src/app/page.tsx`
- `src/app/pricing/page.tsx`
- `src/app/themes/page.tsx`
- `src/app/demo/page.tsx`

**Aufgabe:** In den **bereits hardgecodeten** deutschen Texten:
Tippfehler, falsche Anführungszeichen (immer „… "), Halbgeviertstrich
(–) statt Bindestrich für Spannweiten, doppelte Leerzeichen.

**Boundary:**
- **Keine** Wortwahl-Änderungen.
- **Keine** Tonfall-Änderungen.
- **Kein** Tippfehler-Fix in Mock-Daten oder Branchen-Presets — die
  haben Domain-Bedeutung.

**Verifikation:** typecheck, lint, build:static, beide Smoketests
weiterhin grün. Visueller Vergleich der Marketing-Seite (manuell,
falls möglich).

---

### #3 — `[pre-approved]` `aria-label` an Icon-Only-Buttons

**Suchpfad:** `src/components/**/*.tsx`

**Aufgabe:** Für jeden `<button>` / `<Button>`, der **nur** ein
Lucide-Icon enthält und **keinen** sichtbaren Text hat, ein
sprechendes `aria-label` ergänzen. Beispiel:

```tsx
<button onClick={…}>
  <Trash2 size={16} />     {/* nur Icon */}
</button>
```

→

```tsx
<button onClick={…} aria-label="Eintrag entfernen">
  <Trash2 size={16} />
</button>
```

**Boundary:**
- **Keine** Verhaltens-Änderungen.
- **Kein** Refactoring der Komponente.
- Wenn die Komponente bereits `aria-hidden`, `role="…"` oder einen
  `<span class="sr-only">…</span>` enthält, der das adressiert: Hände weg.

**Verifikation:** typecheck, lint, build:static.

---

### #4 — `[pre-approved]` Trailing-Newline in allen Quelldateien

**Suchpfad:** alle Dateien unter `src/` und `docs/`.

**Aufgabe:** Sicherstellen, dass jede `.ts`, `.tsx`, `.md`, `.css`-
Datei mit genau **einem** Newline endet. Doppelte Trailing-Newlines
entfernen. Dateien ohne Trailing-Newline ergänzen.

**Boundary:**
- Nur Whitespace, kein Inhalt.
- Wenn eine Datei in Abschnitt 1 von `codex.md` (NEVER-Zone) liegt,
  überspringen.

**Verifikation:** typecheck, lint, build:static.

---

### #5 — `[pre-approved]` `alt`-Texte in Demo-Daten

**Pfad:** `src/data/businesses/*.ts`

**Aufgabe:** Wenn ein Demo-Betrieb in seiner Galerie- oder Hero-
Bildliste leere `alt`-Texte (`""`) hat, einen kurzen, beschreibenden
deutschen `alt`-Text aus dem Kontext ableiten (z. B. „Innenraum des
Salons", „Werkstatt-Hebebühne mit Fahrzeug").

**Boundary:**
- **Keine** Bildnamen / Pfade ändern.
- **Keine** zusätzlichen Bilder hinzufügen.
- Wenn das `alt`-Feld bereits sinnvoll ist: nicht anfassen.
- Wenn das Schema `alt` als optional definiert: kein neues Feld
  einführen, nur bestehende Strings füllen.

**Verifikation:** typecheck (Schema-Validierung greift), lint,
build:static, Smoketests.

---

### #6 — `[blocked]` Prettier-Plugin-Tailwind aktivieren

**Begründung Block:** Prettier ist im Projekt aktuell nicht installiert.
Sobald Claude (in einer DX-Session, Track D) Prettier + das
`prettier-plugin-tailwindcss` einführt, darf Codex diesen Eintrag
übernehmen, um Tailwind-Klassenlisten projektweit zu sortieren.

---

### #7 — `[pre-approved]` Glossar `docs/GLOSSARY.md` anlegen

**Pfad:** `docs/GLOSSARY.md` (neu)

**Aufgabe:** Eine alphabetische Liste der projekt-internen Begriffe
mit jeweils 1–2 Sätzen Erklärung. Quellen für die Begriffe:
- `Claude.md`
- `docs/PROGRAM_PLAN.md`
- `docs/SESSION_PROTOCOL.md`
- `docs/TECHNICAL_NOTES.md`
- `README.md`

Mindestens diese Begriffe sollten enthalten sein:
- AIProvider, AIProviderError, Provider-Resolver
- Branchen-Preset, Industry Key, Fallback-Preset
- Code-Session, Rolling Milestone, Self-Extending Backlog
- Mock-Provider, Mock-First, Smoketest
- Paketstufe, Feature-Lock, Tier-Limit
- Theme, Theme-Token, CSS-Variable
- White-Label

**Boundary:**
- **Nichts** definieren, was nicht aus den genannten Quellen ableitbar
  ist.
- **Keine** Quellenangaben „außerhalb des Repos" verwenden.

**Verifikation:** Datei existiert, kein Buildfehler.

---

### #8 — `[pre-approved]` Konsistente deutsche Anführungszeichen in Doku

**Suchpfad:** `docs/*.md`, `README.md`, `CHANGELOG.md`

**Aufgabe:** Englische `"…"`-Paare und Apostrophen
(`'…'`) in **deutschen Fließtext-Passagen** auf typografisch korrekte
deutsche Form bringen: `„…"` für Anführungszeichen, `’` für
Apostroph, `–` für Halbgeviertstrich.

**Boundary:**
- **Keine** Code-Beispiele ändern (Inhalte in
  ` ```...``` `-Blöcken bleiben wie sie sind).
- **Keine** Inline-Code-Spans ändern (Inhalte zwischen `` ` ``).
- URLs und Markdown-Linktexte: ASCII bleibt ASCII.

**Verifikation:** typecheck (irrelevant für .md, aber harmlos), lint,
build:static; alle internen Links funktionieren (manuelle Stichprobe).

---

### #9 — `[pre-approved]` README-Tippfehler nachpflegen

**Pfad:** `README.md`

**Aufgabe:** Reine Tippfehler-Fixes, **keine Strukturänderungen**.

**Boundary:**
- Abschnitte, Reihenfolge, Badges: bleiben unangetastet.
- Roadmap-Tabelle: keine Inhalte ändern (das ist Claude-/User-
  Territorium).

**Verifikation:** Markdown rendert ohne Warnungen, internes Linking
korrekt.

---

## Erledigt (≤ 30 Sessions zurück)

_Noch keine Codex-Sessions abgeschlossen._

---

## Archiv (älter)

_Noch keine Einträge._

---

> Pflege-Hinweis für Claude: am Ende jeder Code-Session prüfen, ob aus
> der Implementierung neue Junior-Tasks (Typos, fehlende JSDoc,
> Lint-Schliff) entstanden sind. Wenn ja: hier als
> `[pre-approved]`-Eintrag ergänzen.
