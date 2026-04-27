import { expect, test } from "@playwright/test";

/**
 * Smoke-Test: Public-Site eines Demo-Betriebs (Code-Session 71).
 *
 * Die 6 Demo-Betriebe (mock-data) werden als statische Pages
 * vorgerendert (`generateStaticParams`). Wir testen nur den
 * ersten — zusätzliche Slug-Coverage kommt in Session 76
 * (Public-Site-E2E mit Lead-Form-Submit + Theme-Switch).
 */

const DEMO_SLUG = "studio-haarlinie";

test.describe(`Public-Site /site/${DEMO_SLUG}`, () => {
  test("Hero + Services + Footer rendern", async ({ page }) => {
    await page.goto(`/site/${DEMO_SLUG}`);

    // Hero-Section: H1 mit Business-Name oder Tagline
    const heroH1 = page.getByRole("heading", { level: 1 }).first();
    await expect(heroH1).toBeVisible();

    // Services-Section: Service-Cards (Grid)
    // Wir sind tolerant — manche Demo-Sites haben 3, andere 8 Services.
    const sections = page.locator("section, [data-section]");
    await expect(sections.first()).toBeVisible();

    // Footer mit Adresse
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("Lead-Form ist sichtbar mit Pflichtfeldern", async ({ page }) => {
    await page.goto(`/site/${DEMO_SLUG}`);

    // Lead-Form rendert irgendwo auf der Page. Felder sind
    // branchenspezifisch (Friseur ≠ Werkstatt ≠ Reinigung), wir
    // prüfen daher nur die strukturellen Pflichtelemente:
    // ≥ ein Input + ein Submit-Button.
    const form = page.locator("form").first();
    await expect(form).toBeVisible();
    await expect(form.locator("input").first()).toBeVisible();
    await expect(form.locator('button[type="submit"]').first()).toBeVisible();
  });

  test("Public-Site rendert auch für anderen Demo-Slug", async ({ page }) => {
    // Sanity: nicht nur ein Slug, alle Demo-Sites bauen.
    await page.goto("/site/autoservice-mueller");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });
});
