import { expect, test } from "@playwright/test";

/**
 * Onboarding-Flow E2E (Code-Session 72).
 *
 * Tests gegen das Form-Verhalten + Client-Validation. Auth-
 * gemockter Submit kommt in Session 75 mit `storageState`-
 * Pattern; aktuell prüfen wir, dass das Form korrekt rendert,
 * Slug-Vorschlag funktioniert und Felder transformieren.
 */

test.describe("Onboarding-Page", () => {
  test("Form rendert mit allen Pflicht-Feldern", async ({ page }) => {
    await page.goto("/onboarding");

    // Heading
    await expect(
      page.getByRole("heading", { name: /lege deinen betrieb an/i }),
    ).toBeVisible();

    // Pflicht-Felder via ID-Selector (Labels haben Asterisk-Spans,
    // die `getByLabel`-strict-Matches brechen).
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#slug")).toBeVisible();
    await expect(page.locator("#industryKey")).toBeVisible();
    await expect(page.locator("#themeKey")).toBeVisible();
    await expect(page.locator("#packageTier")).toBeVisible();

    // Optional-Felder
    await expect(page.locator("#tagline")).toBeVisible();
    await expect(page.locator("#description")).toBeVisible();

    // Submit-Button
    await expect(
      page.getByRole("button", { name: /betrieb anlegen|^anlegen/i }).first(),
    ).toBeVisible();
  });

  test("Slug-Vorschlag aus Name funktioniert", async ({ page }) => {
    await page.goto("/onboarding");

    const nameInput = page.locator("#name");
    const slugInput = page.locator("#slug");

    // Name eintippen
    await nameInput.fill("Studio Haarlinie 2026");

    // Slug-Vorschlag-Button klicken
    await page.getByRole("button", { name: /slug aus name vorschlagen/i }).click();

    // Slug ist jetzt URL-safe normalisiert (lowercase, kein
    // Whitespace, kein Sonderzeichen außer Bindestrich)
    const slugValue = await slugInput.inputValue();
    expect(slugValue.length).toBeGreaterThan(0);
    expect(slugValue).toMatch(/^[a-z0-9-]+$/);
    // Mindestens „studio" oder „haarlinie" sollte erkennbar bleiben
    expect(slugValue).toMatch(/studio|haarlinie/);
  });

  test("Branchen-Select hat ≥ 10 Optionen", async ({ page }) => {
    await page.goto("/onboarding");

    const industrySelect = page.locator("#industryKey");
    // Anzahl der `<option>`-Children prüfen — wir haben 20 Branchen
    // + Placeholder, also ≥ 10 als robuste Untergrenze.
    const optionsCount = await industrySelect.locator("option").count();
    expect(optionsCount).toBeGreaterThanOrEqual(10);
  });

  test("Theme-Select hat ≥ 5 Optionen", async ({ page }) => {
    await page.goto("/onboarding");

    const themeSelect = page.locator("#themeKey");
    const optionsCount = await themeSelect.locator("option").count();
    expect(optionsCount).toBeGreaterThanOrEqual(5);
  });

  test("Paket-Select hat 4 Optionen (Bronze/Silber/Gold/Platin)", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    const packageSelect = page.locator("#packageTier");
    // PACKAGE_TIERS ohne Placeholder = exakt 4
    const optionsCount = await packageSelect.locator("option").count();
    expect(optionsCount).toBe(4);

    // Default ist einer der vier Tiers (real: „silber" laut
    // Form-Default. Wir prüfen tolerant gegen Tier-Werte, statt
    // einen festen Default zu erzwingen).
    const value = await packageSelect.inputValue();
    expect(["bronze", "silber", "gold", "platin"]).toContain(value);
  });

  test("Branche und Theme sind unabhängig wählbar", async ({ page }) => {
    await page.goto("/onboarding");

    const industrySelect = page.locator("#industryKey");
    const themeSelect = page.locator("#themeKey");

    // Beide Selects akzeptieren eine Auswahl unabhängig
    // voneinander. (Eine Auto-Empfehlung „Branche → Theme"
    // existiert aktuell nicht — sie könnte ein Phase-2-UX-
    // Polish-Item werden.)
    await industrySelect.selectOption("hairdresser");
    await expect(industrySelect).toHaveValue("hairdresser");

    // Theme manuell auf clean_light setzen
    const themeOption = await themeSelect.locator("option").nth(1).getAttribute("value");
    if (themeOption) {
      await themeSelect.selectOption(themeOption);
      await expect(themeSelect).toHaveValue(themeOption);
    }
  });

  test("Submit ohne Pflicht-Felder bleibt im Form (Client-Validation)", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    // Submit-Button finden + klicken (alle Felder leer)
    const submitButton = page
      .getByRole("button", { name: /betrieb anlegen|^anlegen$/i })
      .first();
    await submitButton.click();

    // URL hat sich nicht geändert — wir sind weiter auf /onboarding
    await expect(page).toHaveURL(/\/onboarding/);

    // Form ist weiterhin sichtbar (kein Success-State)
    await expect(page.locator("#name")).toBeVisible();
  });
});
