import { expect, test } from "@playwright/test";
import { DEMO } from "./_helpers";

/**
 * Dashboard-Shell + Tab-Navigation E2E (Code-Session 73).
 *
 * Sidebar (Desktop) + Mobile-Nav-Strip lesen aus der gleichen
 * `nav-config.ts`. Wir testen die ARIA-Anker.
 */

const DEMO_SLUG = DEMO.silber;

test.describe(`Dashboard-Shell /dashboard/${DEMO_SLUG}`, () => {
  test("Übersichts-Page lädt mit allen Nav-Tabs", async ({ page }) => {
    await page.goto(`/dashboard/${DEMO_SLUG}`);

    // Alle 8 Sidebar-Links müssen sichtbar sein. Wir greifen
    // tolerant — Sidebar (Desktop) zeigt Volltext, Mobile-Nav
    // zeigt Icon + manchmal Kurztext. `getByRole("link")` mit
    // Name reicht in beiden Fällen.
    const navLabels = [
      /übersicht/i,
      /betriebsdaten/i,
      /leistungen/i,
      /anfragen/i,
      /ki.?assistent/i,
      /bewertungen/i,
      /social media/i,
      /einstellungen/i,
    ];

    for (const label of navLabels) {
      // .first() weil Desktop+Mobile beide rendern
      await expect(
        page.getByRole("link", { name: label }).first(),
      ).toBeVisible();
    }
  });

  test("Tab-Navigation: Übersicht → Betriebsdaten", async ({ page }) => {
    await page.goto(`/dashboard/${DEMO_SLUG}`);

    // Mobile-Nav rendert für Desktop-Viewport hidden, Sidebar
    // sichtbar. Wir nutzen `Promise.all([waitForURL, click])`
    // statt `toHaveURL`, damit der Test die Navigation
    // deterministisch abwartet — auch unter Worker-
    // Parallelität robust.
    await Promise.all([
      page.waitForURL(`**/dashboard/${DEMO_SLUG}/business`),
      page
        .locator(`a[href="/dashboard/${DEMO_SLUG}/business"]:visible`)
        .first()
        .click(),
    ]);
  });

  test("Tab-Navigation: Betriebsdaten → Leistungen", async ({ page }) => {
    await page.goto(`/dashboard/${DEMO_SLUG}/business`);
    await Promise.all([
      page.waitForURL(`**/dashboard/${DEMO_SLUG}/services`),
      page
        .locator(`a[href="/dashboard/${DEMO_SLUG}/services"]:visible`)
        .first()
        .click(),
    ]);
  });

  test("Public-Site-Link öffnet `/site/<slug>` (target=_blank tolerant)", async ({
    page,
  }) => {
    await page.goto(`/dashboard/${DEMO_SLUG}`);

    // „Öffentliche Seite ansehen" oder ähnlich. Robust gegen
    // Text-Variation: wir finden den href-Selector direkt.
    const publicSiteLink = page
      .locator(`a[href="/site/${DEMO_SLUG}"]`)
      .first();
    await expect(publicSiteLink).toBeVisible();
  });
});
