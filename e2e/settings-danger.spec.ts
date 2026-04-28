import { expect, test } from "@playwright/test";
import { DEMO } from "./_helpers";

/**
 * Settings + Danger-Zone E2E (Code-Session 75).
 *
 * Demo-Mode reicht — kein Auth-Mock nötig. Repository-
 * Resolver lädt das Mock-Repo, Page rendert wie für einen
 * eingeloggten Owner.
 */

const SETTINGS_URL = `/dashboard/${DEMO.silber}/settings`;

test.describe("Settings-Page", () => {
  test("Page lädt mit Slug + Publish + Locale", async ({ page }) => {
    await page.goto(SETTINGS_URL);

    await expect(
      page.getByRole("heading", { name: /einstellungen/i }),
    ).toBeVisible();

    // Slug-Input mit aktuellem Slug pre-filled
    const slugInput = page.locator("#slug-input");
    await expect(slugInput).toBeVisible();
    await expect(slugInput).toHaveValue(DEMO.silber);

    // Publish-Toggle als Checkbox (id=published-toggle)
    const publishToggle = page.locator("#published-toggle");
    await expect(publishToggle).toBeVisible();

    // Locale-Select
    const localeSelect = page.locator("#locale-select");
    await expect(localeSelect).toBeVisible();
    const localeValue = await localeSelect.inputValue();
    expect(["de", "en"]).toContain(localeValue);
  });

  test("Save-Button initial disabled, aktiviert sich nach Slug-Change", async ({
    page,
  }) => {
    await page.goto(SETTINGS_URL);

    const slugInput = page.locator("#slug-input");
    const saveButton = page.getByRole("button", {
      name: /^speichern$/i,
    });

    await expect(saveButton).toBeDisabled();

    // Slug ändern → dirty
    await slugInput.fill(`${DEMO.silber}-test`);
    await expect(saveButton).toBeEnabled();
  });

  test("Locale-Switch triggert dirty-State", async ({ page }) => {
    await page.goto(SETTINGS_URL);

    const localeSelect = page.locator("#locale-select");
    const saveButton = page.getByRole("button", { name: /^speichern$/i });

    // Locale auf das Gegenteil setzen
    const current = await localeSelect.inputValue();
    const target = current === "de" ? "en" : "de";
    await localeSelect.selectOption(target);

    await expect(saveButton).toBeEnabled();
  });
});

test.describe("Danger-Zone", () => {
  test("Danger-Zone-Card rendert mit Slug-Confirmation-Input", async ({
    page,
  }) => {
    await page.goto(SETTINGS_URL);

    // Heading „Gefahrenzone"
    await expect(
      page.getByRole("heading", { name: /gefahrenzone/i }),
    ).toBeVisible();

    // Slug-Confirmation-Input
    const confirmInput = page.locator("#delete-confirm-slug");
    await expect(confirmInput).toBeVisible();
    await expect(confirmInput).toHaveValue("");

    // Delete-Button initial disabled (kein Slug eingetippt)
    const deleteButton = page.getByRole("button", {
      name: /betrieb dauerhaft löschen/i,
    });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeDisabled();
  });

  test("Delete-Button bleibt disabled bei falschem Slug-Input", async ({
    page,
  }) => {
    await page.goto(SETTINGS_URL);

    const confirmInput = page.locator("#delete-confirm-slug");
    const deleteButton = page.getByRole("button", {
      name: /betrieb dauerhaft löschen/i,
    });

    // Falscher Slug
    await confirmInput.fill("falsch");
    await expect(deleteButton).toBeDisabled();

    // Auch teilweise korrekt: nur Präfix
    await confirmInput.fill(DEMO.silber.slice(0, 3));
    await expect(deleteButton).toBeDisabled();
  });

  test("Delete-Button aktiviert sich bei exakter Slug-Eingabe", async ({
    page,
  }) => {
    await page.goto(SETTINGS_URL);

    const confirmInput = page.locator("#delete-confirm-slug");
    const deleteButton = page.getByRole("button", {
      name: /betrieb dauerhaft löschen/i,
    });

    await confirmInput.fill(DEMO.silber);
    await expect(deleteButton).toBeEnabled();

    // Tippfehler → wieder disabled
    await confirmInput.fill(`${DEMO.silber}x`);
    await expect(deleteButton).toBeDisabled();
  });
});
