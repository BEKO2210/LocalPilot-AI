import { expect, test } from "@playwright/test";

/**
 * Smoke-Test: Login-Page (Code-Session 71).
 *
 * Magic-Link-Form lädt, Email-Input + Submit-Button sind da.
 * Wir submitten **nicht** — das würde Supabase brauchen.
 * Phase-1.5-Session 72 macht den Onboarding-Flow mit
 * Mock-Auth durch.
 */

test.describe("Login-Page", () => {
  test("Form rendert mit Email-Input und Submit-Button", async ({ page }) => {
    await page.goto("/login");

    // Heading „Anmelden"
    await expect(page.getByRole("heading", { name: /anmelden/i })).toBeVisible();

    // Email-Input mit korrekten Attributen
    const emailInput = page.getByLabel(/e-mail-adresse/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("required", "");

    // Submit-Button initial disabled (kein Email getippt)
    const submitButton = page.getByRole("button", { name: /login-link senden/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test("Submit-Button aktiviert sich nach Email-Eingabe", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.getByLabel(/e-mail-adresse/i);
    const submitButton = page.getByRole("button", { name: /login-link senden/i });

    await expect(submitButton).toBeDisabled();
    await emailInput.fill("test@example.com");
    await expect(submitButton).toBeEnabled();
  });

  test("Demo-Link funktioniert (kein Backend nötig)", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /zur demo/i }).click();
    await expect(page).toHaveURL(/\/demo$/);
  });

  test("Submit ohne Backend wirft die UI nicht ab", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.getByLabel(/e-mail-adresse/i);
    const submitButton = page.getByRole("button", { name: /login-link senden/i });

    await emailInput.fill("test@example.com");
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Form-Submit darf nicht zu einer Page-Navigation oder
    // Crash führen. Wir bleiben auf /login, das Heading ist
    // weiter sichtbar — egal welcher StatusBlock erscheint.
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /anmelden/i })).toBeVisible();
  });
});
