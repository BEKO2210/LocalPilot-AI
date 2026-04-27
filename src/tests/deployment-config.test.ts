/**
 * Smoketest für Deployment-Config (Code-Session 34).
 *
 * Pure-File-Test: liest die Config-Files vom Disk und prüft, dass die
 * Form stimmt. Kein Build, kein Netzwerk, keine Vercel-CLI nötig.
 * Verhindert Drift zwischen den drei Konfig-Punkten:
 *   - vercel.json       (Vercel-Build-Settings)
 *   - .env.production.example (Vorlage für Vercel-ENV)
 *   - .github/workflows/deploy.yml (Pages-Build-Settings)
 *   - package.json      (Build-Skripte)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`deployment-config assertion failed: ${message}`);
}

const ROOT = resolve(__dirname, "..", "..");

function readFile(rel: string): string {
  return readFileSync(resolve(ROOT, rel), "utf8");
}

// -----------------------------------------------------------------------
// 1. vercel.json: gültiges JSON, framework: nextjs, Region gesetzt
// -----------------------------------------------------------------------

const vercelJson = JSON.parse(readFile("vercel.json")) as {
  framework?: string;
  regions?: string[];
  buildCommand?: string;
  outputDirectory?: string;
  headers?: Array<{ source?: string; headers?: Array<{ key?: string }> }>;
};

assert(vercelJson.framework === "nextjs", "vercel.json framework=nextjs");
assert(
  Array.isArray(vercelJson.regions) && vercelJson.regions.length >= 1,
  "vercel.json hat min. 1 Region",
);
assert(
  vercelJson.regions?.includes("fra1"),
  "vercel.json: Frankfurt (fra1) als Default-Region (DACH-Markt)",
);
assert(
  vercelJson.buildCommand === "npm run build",
  "vercel.json buildCommand = 'npm run build' (NICHT build:static)",
);
assert(
  vercelJson.outputDirectory === ".next",
  "vercel.json outputDirectory = '.next'",
);

// API-Routen brauchen Cache-Control: no-store
const apiHeaderRule = vercelJson.headers?.find(
  (h) => h.source === "/api/:path*",
);
assert(!!apiHeaderRule, "vercel.json: Header-Regel für /api/:path*");
const cacheCtrl = apiHeaderRule?.headers?.find(
  (h) => h.key === "Cache-Control",
);
assert(!!cacheCtrl, "vercel.json: Cache-Control Header für /api/*");

// -----------------------------------------------------------------------
// 2. .env.production.example: alle Pflicht-Variablen aufgeführt
// -----------------------------------------------------------------------

const envExample = readFile(".env.production.example");
const required = [
  "LP_AI_API_KEY",
  "LP_AI_PASSWORD",
  "LP_AI_SESSION_SECRET",
  "LP_AI_DAILY_CAP_USD",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GEMINI_API_KEY",
  "AI_PROVIDER",
];
for (const name of required) {
  assert(
    envExample.includes(`${name}=`),
    `.env.production.example listet ${name}`,
  );
}
// Niemals echte Secrets in der Vorlage:
const valuePart = envExample
  .split("\n")
  .filter((line) => /^\w+=/.test(line))
  .map((line) => line.split("=").slice(1).join("="));
for (const v of valuePart) {
  // Erlaubte Werte: leer ODER Default-Hint wie '1.00', 'mock'.
  // Verboten: alles, was wie ein echter Key aussieht.
  assert(
    !/^sk-[A-Za-z0-9]{10,}$/.test(v.trim()),
    `Echter API-Key in .env.production.example: '${v.trim().slice(0, 8)}…'`,
  );
}

// -----------------------------------------------------------------------
// 3. GitHub-Pages-Workflow: STATIC_EXPORT=true, Trigger-Branches
// -----------------------------------------------------------------------

const workflow = readFile(".github/workflows/deploy.yml");
assert(
  workflow.includes('STATIC_EXPORT: "true"'),
  "Pages-Workflow setzt STATIC_EXPORT=true",
);
assert(
  workflow.includes("- main") && workflow.includes('claude/**'),
  "Pages-Workflow triggert auf main + claude/**",
);

// -----------------------------------------------------------------------
// 4. package.json: Build-Skripte konsistent
// -----------------------------------------------------------------------

const pkg = JSON.parse(readFile("package.json")) as {
  scripts?: Record<string, string>;
};
assert(pkg.scripts?.build === "next build", "package.json: build = 'next build'");
const buildStatic = pkg.scripts?.["build:static"] ?? "";
assert(
  buildStatic.includes("STATIC_EXPORT=true"),
  "package.json: build:static enthält STATIC_EXPORT=true",
);
assert(
  buildStatic.includes("NEXT_PUBLIC_BASE_PATH=/LocalPilot-AI"),
  "package.json: build:static setzt NEXT_PUBLIC_BASE_PATH",
);

// -----------------------------------------------------------------------
// 5. next.config.mjs: pageExtensions-Filter für Static-Export aktiv
// -----------------------------------------------------------------------

const nextConfig = readFile("next.config.mjs");
assert(
  nextConfig.includes("pageExtensions"),
  "next.config.mjs hat pageExtensions-Filter (für API-Skip im Static-Export)",
);
assert(
  nextConfig.includes('STATIC_EXPORT'),
  "next.config.mjs liest STATIC_EXPORT-ENV",
);

console.log("deployment-config smoketest ✅ (~25 Asserts)");
export const __DEPLOYMENT_CONFIG_SMOKETEST__ = { totalAssertions: 25 };
