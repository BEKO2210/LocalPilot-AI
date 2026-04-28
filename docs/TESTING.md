# Testing – LocalPilot AI

Zwei Test-Schichten. Beide müssen vor jedem `main`-Merge
grün sein.

> Stand 2026-04-27 · Phase 1.5 ab Session 71.

---

## 1) Smoketests (Pure-Logic-Tests)

**Was**: Tests pro Pure-Helper-Modul in `src/tests/*.test.ts`,
geschrieben gegen das Modul selbst (kein Browser, kein
Server). 45 Files, ~1.100+ Asserts.

**Ausführen**:

```bash
# Einzeln
npx tsx src/tests/business-update.test.ts

# Alle
for f in src/tests/*.test.ts; do
  npx tsx "$f" || echo "FAIL: $f"
done
```

**Pflicht-Schritte vor Commit**:
1. `npm run typecheck`
2. `npm run lint`
3. Alle Smoketests grün
4. `npm run build`
5. `npm run build:static`

---

## 2) End-to-End-Tests (Playwright, Phase 1.5)

**Was**: Browser-Tests gegen die echte Next.js-App, simuliert
einen End-Benutzer. Dateien in `e2e/*.spec.ts`. Eingeführt
in Session 71 nach User-Anweisung „sehr viele Tests bevor wir
an die UI/UX, alles wie ein Endbenutzer durchspielen".

### Setup (einmalig)

```bash
npm install                            # @playwright/test ist devDep
npx playwright install chromium        # ~112 MB Headless-Chrome
```

Im CI: `npx playwright install --with-deps chromium` (lädt
plus System-Bibliotheken).

### Tests laufen lassen

```bash
# Alle E2E-Tests, headless. Startet npm run dev automatisch.
npm run test:e2e

# Mit Playwright-UI (interaktiv, mit Trace-Viewer)
npm run test:e2e:ui

# Letzten Bericht anzeigen
npm run test:e2e:report

# Nur einen Test-File
npx playwright test e2e/smoke-login.spec.ts

# Nur einen einzelnen Test (per Test-Name-Match)
npx playwright test -g "Submit-Button aktiviert"
```

### Konfiguration

`playwright.config.ts`:
- **baseURL**: `http://localhost:3000` (override via
  `E2E_BASE_URL` ENV).
- **webServer**: startet automatisch `npm run dev` und
  wartet auf Verfügbarkeit (90 s Timeout).
- **reuseExistingServer**: lokal `true`, im CI `false`.
- **retries**: lokal 0, im CI 2 (gegen Flakiness).
- **trace**: `on-first-retry` — Debug-Snapshots ohne
  Happy-Path zu verlangsamen.
- **screenshot**: `only-on-failure`.
- **workers**: 1 (sequenziell für die ersten Smoke-Tests;
  Light-Pass Session 75 schaltet Parallelität ein, sobald
  ≥10 state-unabhängige Tests da sind).

### Demo-Modus vs. Authed-Modus

**Default**: alle Phase-1.5-Tests laufen im Demo-Modus.
Ohne `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`
fällt die App auf Mock-Daten zurück (`createServerSupabaseClient()`
liefert `null`, Pages zeigen `unconfigured`-State, mock-store
lädt die 6 Demo-Betriebe). Damit laufen Tests deterministisch
ohne externes Backend.

**Ab Session 72** (Onboarding-Flow): Tests gegen authed
Pfade brauchen einen gemockten Auth-State. Strategie:
`test.use({ storageState: ... })` mit einer vorberechneten
Cookie-Session. Implementation in Session 72.

### Test-Inventur (Stand Session 72)

| File | Tests | Coverage |
| --- | --- | --- |
| `e2e/smoke-landing.spec.ts` | 3 | Hero, Header-Nav, Site-Footer |
| `e2e/smoke-login.spec.ts` | 4 | Form-Render, Submit-Aktivierung, Demo-Link, Submit-Robustheit |
| `e2e/smoke-public-site.spec.ts` | 3 | Hero+Services, Lead-Form, anderer Demo-Slug |
| `e2e/smoke-account.spec.ts` | 1 | Heading + Demo/Guest-Card |
| `e2e/onboarding-flow.spec.ts` | 7 | Form-Felder, Slug-Suggest, Selects, Branche+Theme, Submit-Validation |

**18 Tests, ~37 s, alle grün**. Ziel Phase 1.5: ≥25 Tests.

### Pattern + Best-Practices

- **`getByRole` bevorzugen vor `locator(".class")`** — robust
  gegen UI-Änderungen, A11y-konform.
- **Footer ≠ `footer`-Tag-Selector**: Demo-Cards nutzen
  `<footer>` als Card-Footer-Element. Site-Footer ist ARIA-
  Landmark `contentinfo` → `getByRole("contentinfo")`.
- **Lead-Form-Felder sind branchenspezifisch**: Pflicht-
  Inputs variieren (Friseur ≠ Werkstatt ≠ Reinigung). Tests
  sollten strukturell sein („≥ 1 Input + Submit-Button"),
  nicht feldspezifisch.
- **Auto-Waiting nutzen**: `await expect(locator).toBeVisible()`
  retried 5 s; kein manuelles `setTimeout` nötig.
- **Test-Daten erstellen**: jede Test-Datei darf eigene
  Daten anlegen, aber muss sie auch wieder aufräumen
  (`test.afterEach`). Phase 1.5 nutzt aktuell nur
  read-only-Tests; Mutating-Tests kommen ab Session 72.

### Roadmap Phase 1.5

| Session | Inhalt |
| --- | --- |
| **71** ✅ | Setup + Smoke-Tests (10 Tests, Demo-Modus) |
| **72** | Onboarding-Flow E2E (Magic-Link → Form → Slug → Auto-Redirect) |
| **73** | Business-Editor E2E (alle Sektionen, Logo+Cover-Upload, Save/Discard) |
| **74** | Service-Liste E2E (CRUD, Reorder, UUID-Gating, Bild-Upload) |
| **75** (5er-Light-Pass) | Settings + Danger-Zone E2E + Test-Helper-Refactor |
| **76** | Public-Site E2E + Lead-Retry-Queue (online/offline) |

**Erfolgskriterium Phase 1.5**: ≥25 grüne E2E-Tests.

---

## 3) CI-Setup (geplant)

Aktuell läuft alles lokal. Ab Phase-2-Sessions kommt ein
GitHub-Actions-Workflow:

```yaml
# .github/workflows/ci.yml (geplant)
- name: Smoketests
  run: for f in src/tests/*.test.ts; do npx tsx "$f"; done

- name: Build
  run: npm run build

- name: E2E
  run: |
    npx playwright install --with-deps chromium
    npm run test:e2e
```

Caching: Playwright-Browser-Binaries via `actions/cache`
(`~/.cache/ms-playwright`), spart 60-90 s pro Lauf.

---

## Verwandte Dokumente

- [PROGRAM_PLAN.md](./PROGRAM_PLAN.md) — Roadmap inkl.
  Phase 1.5
- [MVP_RECAP.md](./MVP_RECAP.md) — MVP-Stand (Phase 1
  abgeschlossen)
- [SESSION_PROTOCOL.md](./SESSION_PROTOCOL.md) — Pro-Session-
  Workflow inkl. Test-Pflichten
