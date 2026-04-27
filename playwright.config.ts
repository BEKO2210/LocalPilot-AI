/**
 * Playwright-Konfiguration (Code-Session 71).
 *
 * Phase-1.5-Auftakt: erste E2E-Test-Suite. Alle Tests laufen
 * gegen die lokale Dev-Instanz. Default-Setup: kein Supabase-
 * Backend nötig — die Pages fallen auf Mock-Daten zurück
 * (`createServerSupabaseClient()` liefert `null` ohne ENV).
 *
 * Im CI: `reuseExistingServer: false`, damit jeder Lauf einen
 * frischen Server bekommt. Lokal: `reuseExistingServer: true`,
 * damit ein bereits laufendes `npm run dev` weiter genutzt
 * wird.
 */

import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env["PORT"] ?? 3000);
const BASE_URL = process.env["E2E_BASE_URL"] ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Kein paralleles Laufen für die ersten Smoke-Tests — wir wollen
  // deterministische Logs. Sobald ≥10 Tests da sind und sie state-
  // unabhängig laufen, kann das auf `true` (Phase-1.5-Light-Pass).
  fullyParallel: false,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 2 : 0,
  workers: 1,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    // `trace: on-first-retry` liefert Debug-Snapshots ohne den
    // Happy-Path zu verlangsamen.
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Verhindert, dass eine hängende Page den Test-Timeout
    // sprengt — 10s reichen für jeden unserer Pages.
    navigationTimeout: 10_000,
    actionTimeout: 5_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Firefox / WebKit kommen in Phase-1.5-Light-Pass (Session 75),
    // sobald die Smoke-Tests stabil laufen.
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env["CI"],
    // Next.js dev-server braucht nach kaltem Start ~5-15s, plus
    // Type-Check-Pre-Build. 90s als komfortabler Puffer.
    timeout: 90_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
