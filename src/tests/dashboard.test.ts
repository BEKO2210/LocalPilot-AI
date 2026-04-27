/**
 * Smoketest für die Dashboard-Konfiguration aus Session 9.
 *
 * Stellt sicher, dass:
 *  - jede registrierte Nav-Section einen aussagekräftigen Eintrag hat,
 *  - Sub-Pages, die in einer späteren Session ausgebaut werden, eine
 *    `comingInSession` führen,
 *  - jede Demo-Business mit einer `/dashboard/<slug>`-URL erreichbar ist,
 *  - `dashboardHref()` korrekt auflöst.
 */

import {
  DASHBOARD_NAV,
  dashboardHref,
  type DashboardNavKey,
} from "@/components/dashboard";
import { listMockBusinessSlugs } from "@/data";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Dashboard assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Nav-Konfiguration
// ---------------------------------------------------------------------------

assert(DASHBOARD_NAV.length === 8, "8 Nav-Sektionen (overview + 7 Sub)");

const keys = new Set<DashboardNavKey>(DASHBOARD_NAV.map((n) => n.key));
assert(keys.size === DASHBOARD_NAV.length, "Nav-Keys sind eindeutig");

// Übersicht ist die einzige Sektion ohne `comingInSession`.
const withoutSession = DASHBOARD_NAV.filter(
  (n) => typeof n.comingInSession !== "number",
);
assert(
  withoutSession.length >= 3,
  `≥ 3 produktive Sektionen, aktuell ${withoutSession.length}`,
);
const productiveKeys = new Set(withoutSession.map((n) => n.key));
assert(productiveKeys.has("overview"), "'overview' ist produktiv");
assert(productiveKeys.has("business"), "'business' ist seit Session 10 produktiv");
assert(productiveKeys.has("services"), "'services' ist seit Session 11 produktiv");

// Jede Stub-Sektion verweist auf eine plausible Session-Nummer (>= 10).
for (const item of DASHBOARD_NAV) {
  if (typeof item.comingInSession === "number") {
    assert(
      item.comingInSession >= 10 && item.comingInSession <= 22,
      `Session ${item.comingInSession} liegt im sinnvollen Bereich`,
    );
  }
}

// Jede Sektion hat ein nicht-leeres Label und einen Pfadsuffix
for (const item of DASHBOARD_NAV) {
  assert(item.label.length > 0, `${item.key}: Label gesetzt`);
  assert(typeof item.pathSuffix === "string", `${item.key}: pathSuffix gesetzt`);
  if (item.key === "overview") {
    assert(item.pathSuffix === "", "Übersicht hat leeren Suffix");
  } else {
    assert(item.pathSuffix.startsWith("/"), `${item.key}: Suffix beginnt mit /`);
  }
}

// ---------------------------------------------------------------------------
// dashboardHref
// ---------------------------------------------------------------------------

const slug = "beauty-atelier";
assert(
  dashboardHref(slug, "overview") === `/dashboard/${slug}`,
  "overview-Href ohne Suffix",
);
assert(
  dashboardHref(slug, "leads") === `/dashboard/${slug}/leads`,
  "leads-Href mit /leads",
);
assert(
  dashboardHref(slug, "ai") === `/dashboard/${slug}/ai`,
  "ai-Href korrekt",
);

// ---------------------------------------------------------------------------
// Slug-Konsistenz: jede Demo-Business ist erreichbar
// ---------------------------------------------------------------------------

const slugs = listMockBusinessSlugs();
assert(slugs.length >= 5, "≥ 5 Demo-Slugs für Dashboard");
for (const s of slugs) {
  assert(
    dashboardHref(s, "overview") === `/dashboard/${s}`,
    `${s}: Übersichts-Href stimmt`,
  );
}

export const __DASHBOARD_SMOKETEST__ = {
  navCount: DASHBOARD_NAV.length,
  slugCount: slugs.length,
};
