import { expect, test } from "@playwright/test";

/**
 * Smoke-Test: Landing-Page (Code-Session 71).
 *
 * Marketing-Hero rendert, primäre Navigation funktioniert.
 * Läuft ohne Supabase-Backend — die Landing-Page ist
 * static-prerenderable.
 */

test.describe("Landing-Page", () => {
  test("Hero rendert mit H1 und CTAs", async ({ page }) => {
    await page.goto("/");

    // Hero-H1 ist sichtbar
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();

    // Mindestens ein „Demo"-Link in der Marketing-Section
    const demoLinks = page.getByRole("link", { name: /demo/i });
    await expect(demoLinks.first()).toBeVisible();
  });

  test("Header-Navigation hat Login + Onboarding-CTA", async ({ page }) => {
    await page.goto("/");

    // „Login" und „Jetzt starten" / „Anmelden" als Header-Links.
    // Wir prüfen flexibel über Role+Name, damit Text-Variationen
    // den Test nicht brechen.
    const headerLinks = page
      .locator("header")
      .getByRole("link");
    await expect(headerLinks.first()).toBeVisible();

    // Mindestens ein Link zu /login muss da sein
    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible();
  });

  test("Site-Footer rendert mit Impressum + Datenschutz-Link", async ({ page }) => {
    await page.goto("/");

    // Demo-Showcase-Cards nutzen `<footer>` als Card-Footer-Element,
    // daher gibt es mehrere `<footer>`-Tags. Der eigentliche
    // Site-Footer ist die ARIA-Landmark `contentinfo`.
    const siteFooter = page.getByRole("contentinfo");
    await expect(siteFooter).toBeVisible();

    // Impressum + Datenschutz sind Pflicht (deutsches Recht)
    await expect(
      siteFooter.getByRole("link", { name: /impressum/i }),
    ).toBeVisible();
    await expect(
      siteFooter.getByRole("link", { name: /datenschutz/i }),
    ).toBeVisible();
  });
});
