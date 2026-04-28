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
  // Aktiviert in Code-Session 75 (Light-Pass): Tests sind im
  // Demo-Mode state-unabhängig (jeder Test öffnet eine eigene
  // Page, kein Backend-State). 4 Worker passen auf typische
  // Dev-Maschinen + CI-Runner.
  fullyParallel: true,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 2 : 4,
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
    // Firefox aktiviert in Code-Session 75 (Light-Pass) für
    // Cross-Browser-Coverage. WebKit kommt in einer Phase-2-
    // Session, sobald die Production-Site auf Vercel deployt
    // ist (WebKit-spezifische Quirks tauchen meist erst in
    // Production auf).
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
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
