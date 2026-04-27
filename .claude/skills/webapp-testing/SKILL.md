---
name: webapp-testing
description: Playwright-Test-Generator + Runner. „Test the login flow" → Test-Datei + Run-Report.
---

# Webapp Testing (Playwright)

## Wozu

Automatisierte End-to-End-Tests für Webseiten, geschrieben durch
natürliche Sprache („teste den Lead-Flow auf der Public Site"),
ausgeführt headless via Playwright. Erzeugt:

- `*.spec.ts`-Dateien unter `tests/playwright/<flow>.spec.ts`.
- Trace-Files bei Fehlern für Debugging.
- HTML-Report für Auftraggeber.

## Setup (Host-seitig)

```bash
claude plugin install webapp-testing
# oder direkt:
npx playwright install
npm install --save-dev @playwright/test
```

## Use-Case in LocalPilot AI

**Hoch relevant** — direkt im Backlog (Track C: Visual-Regression /
E2E-Tests).

Konkrete erste Tests (Reihenfolge nach Wichtigkeit):

1. **Public-Site-Lead-Flow**: Form ausfüllen → Submit → localStorage
   prüfen → Erfolgs-State sichtbar.
2. **Dashboard-Business-Editor**: Felder ändern → Speichern → Reload
   → Werte stehen noch.
3. **Mobile-CTA-Bar**: bei 375px sichtbar, Tel-Link funktioniert.
4. **AI-Playground**: jede der 7 Methoden generiert ein Ergebnis
   ohne Fehler.

## Boundaries für LocalPilot AI

- Tests **nicht** im selben Verzeichnis wie unsere `tsx`-Smoketests
  (`src/tests/`). Stattdessen `tests/playwright/`.
- CI-Lauf nur nach erfolgreichem Build, nicht parallel
  (Race-Conditions auf dem Static-Export-Out-Verzeichnis).
- **Kein** Tracking-Setup ohne ausdrückliche Genehmigung
  (kein Sentry/PostHog-Auto-Capture in den Tests).
- Snapshot-/Visual-Diffs nur nach manueller Baseline-Bestätigung —
  nicht jedes Pixel-Wackeln darf den Build kippen.
