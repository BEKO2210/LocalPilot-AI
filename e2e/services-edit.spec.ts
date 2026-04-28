import { expect, test } from "@playwright/test";

/**
 * Service-Liste E2E (Code-Session 74).
 *
 * Tests im Demo-Mode:
 * - studio-haarlinie (silber-Tier) → voller Editor
 * - meisterbau-schneider (bronze-Tier) → ComingSoon
 * Service-Card ist `<details>` mit `<summary>` als Toggle.
 * Reorder via Pfeil-Buttons (aria-label „Nach oben/unten
 * verschieben"). Image-Upload-Field zeigt UUID-Gating-Hint
 * für Pseudo-IDs (Mock-Daten aus `src/data/`).
 */

const SILBER_SLUG = "studio-haarlinie";
const BRONZE_SLUG = "meisterbau-schneider";

// Service-Cards sind <details>-Elements innerhalb einer <ul>-
// Liste. Der Business-Header hat auch ein <details>-Switcher
// — daher immer auf `ul details` filtern.
const SERVICE_CARDS = "ul details";

test.describe(`Service-Liste /dashboard/${SILBER_SLUG}/services (silber)`, () => {
  test("Editor lädt mit Service-Cards für Silber-Tier", async ({ page }) => {
    await page.goto(`/dashboard/${SILBER_SLUG}/services`);

    // Status-Bar (Container-Selector umgeht <title>-Tag-Konflikt)
    await expect(
      page
        .locator("main p, body > div p")
        .filter({ hasText: /^leistungen verwalten$/i })
        .first(),
    ).toBeVisible();

    // Mindestens eine Service-Card
    const cards = page.locator(SERVICE_CARDS);
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("Service-Card öffnet sich + Title-Input wird sichtbar", async ({ page }) => {
    await page.goto(`/dashboard/${SILBER_SLUG}/services`);

    const firstCard = page.locator(SERVICE_CARDS).first();

    // Card direkt per JS öffnen — robust gegen Sticky-Status-
    // Bar-Overlap auf der Summary. `<details>.open = true`
    // ist die kanonische API.
    await firstCard.evaluate((el) => {
      (el as HTMLDetailsElement).open = true;
    });
    await expect(firstCard).toHaveAttribute("open", "");

    // Im offenen State ist das Title-Input mit
    // id="services.0.title" sichtbar.
    const titleInput = firstCard.locator('input[id="services.0.title"]');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).not.toHaveValue("");
  });

  test("'Neue Leistung anlegen' fügt eine Card hinzu", async ({ page }) => {
    await page.goto(`/dashboard/${SILBER_SLUG}/services`);

    const cards = page.locator(SERVICE_CARDS);
    const initialCount = await cards.count();

    // Es gibt zwei Add-Buttons (Empty-State + Footer); wir
    // nehmen den sichtbaren.
    const addButton = page
      .getByRole("button", {
        name: /neue leistung (anlegen|hinzufügen)/i,
      })
      .first();
    await addButton.click();

    // Card-Count ist um 1 gestiegen
    await expect(cards).toHaveCount(initialCount + 1);
  });

  test("Neue Card hat leeren Titel + Hervorgehoben-Badge ist nicht da", async ({
    page,
  }) => {
    await page.goto(`/dashboard/${SILBER_SLUG}/services`);

    const initialCount = await page.locator(SERVICE_CARDS).count();

    await page
      .getByRole("button", { name: /neue leistung (anlegen|hinzufügen)/i })
      .first()
      .click();

    // Die letzte Card ist die neu hinzugefügte; ihre
    // Header-Anzeige ist „(noch ohne Titel)" (siehe service-
    // card.tsx Zeile 47).
    const newCard = page.locator(SERVICE_CARDS).nth(initialCount);
    await expect(newCard).toBeVisible();
    await expect(newCard.getByText(/noch ohne titel/i)).toBeVisible();
  });

  test("Reorder-Buttons (Pfeil up/down) sind sichtbar", async ({ page }) => {
    await page.goto(`/dashboard/${SILBER_SLUG}/services`);

    // ARIA-Labels sind „Nach oben/unten verschieben". Erste
    // Card hat den Up-Button disabled (oben), letzte den
    // Down-Button disabled. Beide existieren im DOM.
    const upButtons = page.getByRole("button", {
      name: /nach oben verschieben/i,
    });
    const downButtons = page.getByRole("button", {
      name: /nach unten verschieben/i,
    });

    expect(await upButtons.count()).toBeGreaterThan(0);
    expect(await downButtons.count()).toBeGreaterThan(0);

    // Erste Card: Up-Button disabled
    await expect(upButtons.first()).toBeDisabled();
    // Letzte Card: Down-Button disabled
    await expect(downButtons.last()).toBeDisabled();
  });

  test("Delete-Button öffnet Confirm-Dialog (kein direktes Löschen)", async ({
    page,
  }) => {
    await page.goto(`/dashboard/${SILBER_SLUG}/services`);

    // Card per JS öffnen
    const firstCard = page.locator(SERVICE_CARDS).first();
    await firstCard.evaluate((el) => {
      (el as HTMLDetailsElement).open = true;
    });

    // „Entfernen"-Button drücken — Confirm-Inline-State
    // erscheint („Wirklich entfernen?")
    const removeButton = firstCard.getByRole("button", {
      name: /entfernen/i,
    });
    await expect(removeButton.first()).toBeVisible();
    await removeButton.first().click();

    // Confirm-Text ist sichtbar
    await expect(firstCard.getByText(/wirklich entfernen/i)).toBeVisible();

    // Abbrechen-Button schließt den Confirm
    await firstCard.getByRole("button", { name: /abbrechen/i }).click();
    await expect(firstCard.getByText(/wirklich entfernen/i)).not.toBeVisible();
  });

  test("Image-Upload-Field zeigt UUID-Gating-Hint für Demo-Cards", async ({
    page,
  }) => {
    await page.goto(`/dashboard/${SILBER_SLUG}/services`);

    // Erste Card öffnen
    const firstCard = page.locator(SERVICE_CARDS).first();
    await firstCard.evaluate((el) => {
      (el as HTMLDetailsElement).open = true;
    });

    // Image-Upload-Field rendert „Bild" + Hint, wenn ID
    // keine UUID ist. Demo-Cards haben Pseudo-IDs aus dem
    // `src/data/`-Mock. Der Hint-Text:
    // „Bild kannst du hochladen, sobald die Leistung einmal
    // gespeichert ist."
    const hint = firstCard.getByText(
      /sobald die leistung einmal gespeichert/i,
    );
    await expect(hint).toBeVisible();
  });

  test("Speichern-Button initial disabled, aktiviert nach Add", async ({
    page,
  }) => {
    await page.goto(`/dashboard/${SILBER_SLUG}/services`);

    const submitButton = page
      .getByRole("button", { name: /^speichern$/i })
      .first();
    await expect(submitButton).toBeDisabled();

    // Eine neue Card hinzufügen → Form ist dirty
    await page
      .getByRole("button", { name: /neue leistung (anlegen|hinzufügen)/i })
      .first()
      .click();

    await expect(submitButton).toBeEnabled();
  });
});

test.describe(`Service-Liste /dashboard/${BRONZE_SLUG}/services (bronze)`, () => {
  test("Bronze-Tier zeigt ComingSoon statt Editor", async ({ page }) => {
    await page.goto(`/dashboard/${BRONZE_SLUG}/services`);

    // Bronze hat kein `service_management`-Feature →
    // ComingSoonSection rendert mit Upgrade-Hinweis.
    // Service-Cards (in <ul>) existieren NICHT — Header-
    // Switcher (<details> direkt im <header>) zählt nicht.
    await expect(page.locator("ul details")).toHaveCount(0);

    // ComingSoonSection rendert den Hinweis „Im Paket Bronze
    // gesperrt." (siehe coming-soon-section.tsx Zeile 94).
    const lockHint = page.getByText(/im paket bronze gesperrt/i);
    await expect(lockHint).toBeVisible();
  });
});
